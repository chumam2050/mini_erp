import { getAuthToken } from './auth'

/**
 * Get API configuration
 * @returns {Promise<Object>}
 */
async function getApiConfig() {
  try {
    const config = await window.electronAPI.getApiConfig()
    return {
      baseUrl: config?.baseUrl || 'http://localhost:5000',
      timeout: config?.timeout || 5000
    }
  } catch (error) {
    console.error('Error getting API config:', error)
    return {
      baseUrl: 'http://localhost:5000',
      timeout: 5000
    }
  }
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const config = await getApiConfig()
    const token = await getAuthToken()
    
    const url = `${config.baseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

/**
 * Get products for POS
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
export async function getProducts(params = {}) {
  const queryParams = new URLSearchParams()
  
  if (params.search) queryParams.append('search', params.search)
  if (params.category) queryParams.append('category', params.category)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  
  const queryString = queryParams.toString()
  const endpoint = `/api/pos/products${queryString ? `?${queryString}` : ''}`
  
  return await apiRequest(endpoint)
}

/**
 * Create a sale
 * @param {Object} saleData - Sale data
 * @returns {Promise<Object>}
 */
export async function createSale(saleData) {
  return await apiRequest('/api/pos/sales', {
    method: 'POST',
    body: JSON.stringify(saleData)
  })
}

/**
 * Get sales
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
export async function getSales(params = {}) {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.status) queryParams.append('status', params.status)
  
  const queryString = queryParams.toString()
  const endpoint = `/api/pos/sales${queryString ? `?${queryString}` : ''}`
  
  return await apiRequest(endpoint)
}

/**
 * Get sale by ID
 * @param {string|number} id - Sale ID
 * @returns {Promise<Object>}
 */
export async function getSaleById(id) {
  return await apiRequest(`/api/pos/sales/${id}`)
}

/**
 * Cancel a sale
 * @param {string|number} id - Sale ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>}
 */
export async function cancelSale(id, reason) {
  return await apiRequest(`/api/pos/sales/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  })
}

/**
 * Get sales summary
 * @param {string} period - Period (today, week, month, year)
 * @returns {Promise<Object>}
 */
export async function getSalesSummary(period = 'today') {
  return await apiRequest(`/api/pos/summary?period=${period}`)
}

/**
 * Get POS settings
 * @returns {Promise<Object>}
 */
export async function getPosSettings() {
  return await apiRequest('/api/settings?category=pos')
}

/**
 * Test API connection
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    await apiRequest('/api/health')
    return true
  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}
