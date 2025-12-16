const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
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
    ipcRenderer.on('menu-new-sale', callback);
  },
  onMenuAbout: (callback) => {
    ipcRenderer.on('menu-about', callback);
  },
  
  // Remove listeners
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});
