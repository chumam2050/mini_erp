// Authentication utility functions

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    const token = await window.electronAPI.storeGet('authToken')
    return !!token
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

/**
 * Get current user
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  try {
    const user = await window.electronAPI.storeGet('currentUser')
    return user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get auth token
 * @returns {Promise<string|null>}
 */
export async function getAuthToken() {
  try {
    const token = await window.electronAPI.storeGet('authToken')
    return token || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    const token = await getAuthToken()
    const apiConfig = await window.electronAPI.getApiConfig()
    const baseUrl = apiConfig?.baseUrl

    // Call logout endpoint if token exists
    if (token) {
      try {
        await fetch(`${baseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (apiError) {
        // Ignore API errors during logout
        console.warn('Logout API call failed:', apiError)
      }
    }

    // Clear local storage regardless of API call result
    await window.electronAPI.storeSet('authToken', null)
    await window.electronAPI.storeSet('currentUser', null)
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function authenticatedFetch(endpoint, options = {}) {
  const token = await getAuthToken()
  const apiConfig = await window.electronAPI.getApiConfig()
  const baseUrl = apiConfig?.baseUrl

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Token expired or invalid, logout
    await logout()
    throw new Error('Session expired. Please login again.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}
