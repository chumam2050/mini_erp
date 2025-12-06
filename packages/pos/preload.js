const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
})

// API for backend communication
const API_BASE_URL = 'http://localhost:5000/api'

contextBridge.exposeInMainWorld('api', {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },
  
  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  // Products endpoints
  getProducts: async (token) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  getProductById: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  // Local storage helpers
  setItem: (key, value) => {
    localStorage.setItem(key, value)
  },
  
  getItem: (key) => {
    return localStorage.getItem(key)
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key)
  }
})
