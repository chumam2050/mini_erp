import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'


const electronAPIX = {
  // Expose all default Electron APIs
  ...electronAPI,
  // Store operations
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store-delete', key),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // API configuration
  getApiConfig: () => ipcRenderer.invoke('get-api-config'),
  setApiConfig: (config) => ipcRenderer.invoke('set-api-config', config),

  // Menu event listeners
  onMenuNewSale: (callback) => {
    ipcRenderer.on('menu-new-sale', callback)
  },
  onMenuAbout: (callback) => {
    ipcRenderer.on('menu-about', callback)
  },
  // Remove listeners
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  },
  // Printer Management
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  getDeviceConfig: () => ipcRenderer.invoke('get-device-config'),
  setDeviceConfig: (config) => ipcRenderer.invoke('set-device-config', config),
  // Receipt Printer
  printReceipt: (saleData) => ipcRenderer.invoke('print-receipt', saleData),
  testPrint: () => ipcRenderer.invoke('test-print')
}

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPIX)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electronAPI = electronAPIX
  window.api = api
}
