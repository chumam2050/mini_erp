import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import PosPrinter from 'electron-pos-printer'

// Initialize electron-store for persistent data
const store = new Store()

// Keep a global reference of the window object
let mainWindow

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Mini ERP - Point of Sales',
    backgroundColor: '#2d3436'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Create application menu
  createMenu()

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null
  })
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
            mainWindow.webContents.send('menu-new-sale')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
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
            mainWindow.webContents.send('menu-about')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.eltheris.mini-erp-pos')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS applications stay active until the user quits explicitly
  if (process.platform !== 'darwin') app.quit()
})

// IPC Handlers for communication with renderer process
ipcMain.handle('store-get', (event, key) => {
  return store.get(key)
})

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key)
  return true
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// Handle API configuration
ipcMain.handle('get-api-config', () => {
  return store.get('apiConfig', {
    baseUrl: 'http://localhost:5000',
    timeout: 5000
  })
})

ipcMain.handle('set-api-config', (event, config) => {
  store.set('apiConfig', config)
  return true
})

// Get Windows Printers
ipcMain.handle('get-printers', async () => {
  try {
    console.log('Getting Windows printers...')
    const printers = await mainWindow.webContents.getPrintersAsync()
    console.log('Printers found:', printers.length)
    console.log('Printer details:', JSON.stringify(printers, null, 2))
    return printers
  } catch (error) {
    console.error('Error listing printers:', error)
    return []
  }
})

// Device Configuration
ipcMain.handle('get-device-config', () => {
  return store.get('deviceConfig', {
    receiptPrinter: null // Printer name from Windows printers
  })
})

ipcMain.handle('set-device-config', (event, config) => {
  store.set('deviceConfig', config)
  console.log('Device config saved:', config)
  return true
})

// Receipt Printing Helper
function formatPrice(price) {
  return price.toLocaleString('id-ID')
}

function generateReceiptHTML(saleData) {
  const subtotal = saleData.subtotal || 0
  const discount = saleData.discount || 0
  const tax = saleData.tax || 0
  const total = saleData.total || 0
  const paymentMethod = saleData.paymentMethod || 'Cash'
  const amountPaid = saleData.amountPaid || total
  const change = saleData.change || 0

  let itemsHtml = ''
  saleData.items.forEach((item) => {
    const itemTotal = item.quantity * item.price
    itemsHtml += `
      <tr>
        <td style="padding: 4px 0;">${item.name}</td>
        <td style="padding: 4px 0; text-align: right;">${item.quantity} x Rp ${formatPrice(item.price)}</td>
        <td style="padding: 4px 0; text-align: right;">Rp ${formatPrice(itemTotal)}</td>
      </tr>
    `
  })

  return `
    <html>
      <head>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 280px;
            margin: 0;
            padding: 10px;
          }
          .header {
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .store-name {
            font-size: 16px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .total-row {
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">SUPERMARKET SEJAHTERA</div>
          <div>POS #04</div>
          <div>Jl. Contoh No. 123</div>
          <div>Telp: (021) 1234-5678</div>
        </div>
        
        <div class="divider"></div>
        
        <table>
          <tr>
            <td>No:</td>
            <td>${saleData.saleNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td>Tanggal:</td>
            <td>${new Date().toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td>Kasir:</td>
            <td>${saleData.cashier || 'Unknown'}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: right;">Qty x Harga</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <table>
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">Rp ${formatPrice(subtotal)}</td>
          </tr>
          ${discount > 0 ? `<tr><td>Diskon:</td><td style="text-align: right;">Rp ${formatPrice(discount)}</td></tr>` : ''}
          ${tax > 0 ? `<tr><td>Pajak:</td><td style="text-align: right;">Rp ${formatPrice(tax)}</td></tr>` : ''}
          <tr class="total-row">
            <td>TOTAL:</td>
            <td style="text-align: right;">Rp ${formatPrice(total)}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table>
          <tr>
            <td>Pembayaran:</td>
            <td style="text-align: right;">${paymentMethod}</td>
          </tr>
          <tr>
            <td>Bayar:</td>
            <td style="text-align: right;">Rp ${formatPrice(amountPaid)}</td>
          </tr>
          ${change > 0 ? `<tr><td>Kembalian:</td><td style="text-align: right;">Rp ${formatPrice(change)}</td></tr>` : ''}
        </table>
        
        <div class="footer">
          <div class="divider"></div>
          <div>Terima Kasih</div>
          <div>Selamat Berbelanja Kembali</div>
        </div>
      </body>
    </html>
  `
}

// Print receipt using Windows printer
ipcMain.handle('print-receipt', async (event, saleData) => {
  try {
    const deviceConfig = store.get('deviceConfig')
    const printerName = deviceConfig?.receiptPrinter

    if (!printerName) {
      throw new Error('Printer belum dikonfigurasi')
    }

    const receiptHTML = generateReceiptHTML(saleData)

    const options = {
      printerName: printerName,
      silent: true,
      preview: false,
      width: 280,
      margin: '0 0 0 0',
      copies: 1,
      timeOutPerLine: 400,
      pageSize: '80mm' // Common receipt printer size
    }

    const data = [
      {
        type: 'text',
        value: receiptHTML,
        style: `width: 280px; margin: 0; padding: 0;`
      }
    ]

    await PosPrinter.print(data, options)
    console.log('Receipt printed successfully')
    return true
  } catch (error) {
    console.error('Error printing receipt:', error)
    throw error
  }
})

// Test print
ipcMain.handle('test-print', async () => {
  try {
    const deviceConfig = store.get('deviceConfig')
    const printerName = deviceConfig?.receiptPrinter

    if (!printerName) {
      throw new Error('Printer belum dikonfigurasi')
    }

    const testHTML = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Courier New', monospace;
              width: 280px;
              text-align: center;
              padding: 20px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="title">TEST PRINT</div>
          <div>Mini ERP POS</div>
          <div>${new Date().toLocaleString('id-ID')}</div>
          <div style="margin-top: 20px;">Printer: ${printerName}</div>
        </body>
      </html>
    `

    const options = {
      printerName: printerName,
      silent: true,
      preview: false,
      width: 280,
      margin: '0 0 0 0',
      copies: 1,
      timeOutPerLine: 400,
      pageSize: '80mm'
    }

    const data = [
      {
        type: 'text',
        value: testHTML,
        style: `width: 280px; margin: 0; padding: 0;`
      }
    ]

    await PosPrinter.print(data, options)
    console.log('Test print successful')
    return true
  } catch (error) {
    console.error('Error test print:', error)
    throw error
  }
})

