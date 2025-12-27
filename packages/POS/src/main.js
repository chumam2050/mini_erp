const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Initialize electron-store for persistent data
const store = new Store();

// Keep a global reference of the window object
let mainWindow;
let barcodeScanner = null;
let receiptPrinter = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Mini ERP - Point of Sales',
    backgroundColor: '#ffffff'
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Create application menu
  createMenu();

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Sale',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-sale');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('menu-about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS applications stay active until the user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for communication with renderer process
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
  return true;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Handle API configuration
ipcMain.handle('get-api-config', () => {
  return store.get('apiConfig', {
    baseUrl: 'http://localhost:5000',
    timeout: 5000
  });
});

ipcMain.handle('set-api-config', (event, config) => {
  store.set('apiConfig', config);
  return true;
});

// USB Device Management
ipcMain.handle('get-usb-devices', async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer || 'Unknown',
      serialNumber: port.serialNumber || 'N/A',
      productId: port.productId || 'N/A',
      vendorId: port.vendorId || 'N/A'
    }));
  } catch (error) {
    console.error('Error listing USB devices:', error);
    return [];
  }
});

// Device Configuration
ipcMain.handle('get-device-config', () => {
  return store.get('deviceConfig', {
    barcodeScanner: null,
    receiptPrinter: null,
    scannerBaudRate: 9600,
    printerBaudRate: 9600
  });
});

ipcMain.handle('set-device-config', (event, config) => {
  store.set('deviceConfig', config);
  // Reconnect devices with new config
  connectBarcodeScanner(config.barcodeScanner, config.scannerBaudRate);
  connectReceiptPrinter(config.receiptPrinter, config.printerBaudRate);
  return true;
});

// Barcode Scanner Functions
function connectBarcodeScanner(portPath, baudRate = 9600) {
  // Close existing connection
  if (barcodeScanner && barcodeScanner.isOpen) {
    barcodeScanner.close();
  }

  if (!portPath) return;

  try {
    barcodeScanner = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false
    });

    const parser = barcodeScanner.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    barcodeScanner.open((err) => {
      if (err) {
        console.error('Error opening barcode scanner:', err);
        return;
      }
      console.log('Barcode scanner connected:', portPath);
    });

    parser.on('data', (barcode) => {
      console.log('Barcode scanned:', barcode);
      if (mainWindow) {
        mainWindow.webContents.send('barcode-scanned', barcode.trim());
      }
    });

    barcodeScanner.on('error', (err) => {
      console.error('Barcode scanner error:', err);
    });
  } catch (error) {
    console.error('Error connecting barcode scanner:', error);
  }
}

// Receipt Printer Functions
function connectReceiptPrinter(portPath, baudRate = 9600) {
  // Close existing connection
  if (receiptPrinter && receiptPrinter.isOpen) {
    receiptPrinter.close();
  }

  if (!portPath) return;

  try {
    receiptPrinter = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false
    });

    receiptPrinter.open((err) => {
      if (err) {
        console.error('Error opening receipt printer:', err);
        return;
      }
      console.log('Receipt printer connected:', portPath);
    });

    receiptPrinter.on('error', (err) => {
      console.error('Receipt printer error:', err);
    });
  } catch (error) {
    console.error('Error connecting receipt printer:', error);
  }
}

// ESC/POS Commands for Receipt Printer
const ESC = '\x1B';
const GS = '\x1D';

function generateReceiptData(saleData) {
  let receipt = '';
  
  // Initialize printer
  receipt += ESC + '@';
  
  // Center align
  receipt += ESC + 'a' + '\x01';
  
  // Store header
  receipt += ESC + 'E' + '\x01'; // Bold on
  receipt += 'Retaliq\n';
  receipt += ESC + 'E' + '\x00'; // Bold off
  receipt += 'POS #04\n';
  receipt += 'Jl. Contoh No. 123\n';
  receipt += 'Telp: (021) 1234-5678\n';
  receipt += '================================\n';
  
  // Left align
  receipt += ESC + 'a' + '\x00';
  
  // Sale info
  receipt += `No: ${saleData.saleNumber || 'N/A'}\n`;
  receipt += `Tanggal: ${new Date().toLocaleString('id-ID')}\n`;
  receipt += `Kasir: ${saleData.cashier || 'Unknown'}\n`;
  receipt += '================================\n';
  
  // Items
  receipt += ESC + 'E' + '\x01';
  receipt += 'ITEM\n';
  receipt += ESC + 'E' + '\x00';
  receipt += '================================\n';
  
  saleData.items.forEach(item => {
    receipt += `${item.name}\n`;
    receipt += `  ${item.quantity} x Rp ${formatPrice(item.price)}`;
    const total = item.quantity * item.price;
    receipt += ` = Rp ${formatPrice(total).padStart(12)}\n`;
  });
  
  receipt += '================================\n';
  
  // Totals
  const subtotal = saleData.subtotal || 0;
  const discount = saleData.discount || 0;
  const tax = saleData.tax || 0;
  const total = saleData.total || 0;
  
  receipt += `Subtotal:     Rp ${formatPrice(subtotal).padStart(12)}\n`;
  if (discount > 0) {
    receipt += `Diskon:       Rp ${formatPrice(discount).padStart(12)}\n`;
  }
  if (tax > 0) {
    receipt += `Pajak:        Rp ${formatPrice(tax).padStart(12)}\n`;
  }
  receipt += '================================\n';
  receipt += ESC + 'E' + '\x01';
  receipt += `TOTAL:        Rp ${formatPrice(total).padStart(12)}\n`;
  receipt += ESC + 'E' + '\x00';
  
  // Payment
  const paymentMethod = saleData.paymentMethod || 'Cash';
  const amountPaid = saleData.amountPaid || total;
  const change = saleData.change || 0;
  
  receipt += '================================\n';
  receipt += `Pembayaran: ${paymentMethod}\n`;
  receipt += `Bayar:        Rp ${formatPrice(amountPaid).padStart(12)}\n`;
  if (change > 0) {
    receipt += `Kembalian:    Rp ${formatPrice(change).padStart(12)}\n`;
  }
  
  // Footer
  receipt += '================================\n';
  receipt += ESC + 'a' + '\x01'; // Center
  receipt += 'Terima Kasih\n';
  receipt += 'Selamat Berbelanja Kembali\n';
  receipt += '\n';
  
  // Cut paper
  receipt += GS + 'V' + '\x00';
  
  return receipt;
}

function formatPrice(price) {
  return price.toLocaleString('id-ID');
}

ipcMain.handle('print-receipt', async (event, saleData) => {
  return new Promise((resolve, reject) => {
    if (!receiptPrinter || !receiptPrinter.isOpen) {
      reject(new Error('Receipt printer not connected'));
      return;
    }

    const receiptData = generateReceiptData(saleData);
    
    receiptPrinter.write(receiptData, (err) => {
      if (err) {
        console.error('Error printing receipt:', err);
        reject(err);
      } else {
        console.log('Receipt printed successfully');
        resolve(true);
      }
    });
  });
});

// Test print
ipcMain.handle('test-print', async () => {
  console.log(receiptPrinter);
  return new Promise((resolve, reject) => {
    if (!receiptPrinter || !receiptPrinter.isOpen) {
      reject(new Error('Receipt printer not connected'));
      return;
    }

    const testData = ESC + '@' + ESC + 'a' + '\x01' + 
                     'TEST PRINT\n' + 
                     'Mini ERP POS\n' + 
                     '\n' + 
                     GS + 'V' + '\x00';
    
    receiptPrinter.write(testData, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});

// Initialize devices on startup
app.whenReady().then(() => {
  const deviceConfig = store.get('deviceConfig');
  if (deviceConfig) {
    connectBarcodeScanner(deviceConfig.barcodeScanner, deviceConfig.scannerBaudRate);
    connectReceiptPrinter(deviceConfig.receiptPrinter, deviceConfig.printerBaudRate);
  }
});
