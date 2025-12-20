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
  },
  
  // USB Device Management
  getUsbDevices: () => ipcRenderer.invoke('get-usb-devices'),
  getDeviceConfig: () => ipcRenderer.invoke('get-device-config'),
  setDeviceConfig: (config) => ipcRenderer.invoke('set-device-config', config),
  
  // Barcode Scanner
  onBarcodeScanned: (callback) => {
    ipcRenderer.on('barcode-scanned', (event, barcode) => callback(barcode));
  },
  
  // Receipt Printer
  printReceipt: (saleData) => ipcRenderer.invoke('print-receipt', saleData),
  testPrint: () => ipcRenderer.invoke('test-print')
});
