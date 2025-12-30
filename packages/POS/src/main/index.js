import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'

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
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'RetaliQ - POS',
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
      label: 'Saya',
      submenu: [
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
          label: 'Shortcuts',
          click: () => {
            mainWindow.webContents.send('menu-shortcuts')
          }
        },
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
  electronApp.setAppUserModelId('cloud.retaliq.mini-erp-pos')

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


ipcMain.handle('get-api-config', () => {
  return { baseUrl: 'http://localhost:5000', timeout: 5000 }
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
  const config = store.get('deviceConfig', {
    receiptPrinter: null // Printer name from Windows printers
  })
  console.log('Getting device config:', config)
  return config
})

ipcMain.handle('set-device-config', (event, config) => {
  console.log('Setting device config:', config)
  store.set('deviceConfig', config)

  // Verify it was saved correctly
  const savedConfig = store.get('deviceConfig')
  console.log('Device config saved and verified:', savedConfig)

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
  const store = saleData.settings?.store || {}

  console.log('Generating receipt HTML with sale data:', saleData)

  let itemsHtml = ''
  saleData.items.forEach((item) => {
    const itemTotal = item.quantity * item.price
    itemsHtml += `
      <tr>
        <td colspan="2">${item.name}</td>
      </tr>
      <tr>
        <td>${item.quantity} x Rp ${formatPrice(item.price)}</td>
        <td style="text-align: right;">Rp ${formatPrice(itemTotal)}</td>
      </tr>
    `
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          /* Ensure padding is included in the width so content doesn't overflow */
          *, *::before, *::after { box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            width: 58mm;
            max-width: 58mm;
            margin: 0;
            padding: 3mm 2mm; /* further reduced horizontal padding to avoid clipping */
            line-height: 1.3;
            overflow: visible;
            -webkit-print-color-adjust: exact;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
          }
          .store-name {
            font-size: 12px;
            font-weight: bold;
          }
          table {
            margin: 0; /* remove extra side margin to prevent overflowing printable area */
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            word-wrap: break-word;
          }
          td {
            font-size: 8px;
            word-break: break-word;
            white-space: normal;
            padding: 2px 20px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .total-row {
            font-weight: bold;
            font-size: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">${store.name || ''}</div>
          <div style="font-size: 8px;">${store.address || ''}</div>
          <div style="font-size: 8px;">${store.email || ''}</div>
          <div style="font-size: 8px;">${store.phone || ''}</div>
        </div>
        
        <div class="divider"></div>
        
        <table>
          <tr>
            <td style="width: 24mm">No:</td>
            <td style="text-align: right;">${saleData.saleNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="width: 24mm">Tanggal:</td>
            <td style="text-align: right; font-size: 8px;">${new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td>
          </tr>
          <tr>
            <td style="width: 24mm">Kasir:</td>
            <td style="text-align: right;">${saleData.cashier || 'Unknown'}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table>
          ${itemsHtml}
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
            <td style="text-align: right; width: 25mm;">Rp ${formatPrice(total)}</td>
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
            <td style="text-align: right; width: 25mm;">Rp ${formatPrice(amountPaid)}</td>
          </tr>
          ${change > 0 ? `<tr><td>Kembalian:</td><td style="text-align: right; width: 25mm;">Rp ${formatPrice(change)}</td></tr>` : ''}
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

// Print receipt using Electron's built-in printing
ipcMain.handle('print-receipt', async (event, saleData) => {
  try {
    const deviceConfig = store.get('deviceConfig')
    console.log('Print receipt - Device config:', deviceConfig)

    const printerName = deviceConfig?.receiptPrinter

    if (!printerName) {
      console.error('Print receipt failed - No printer configured')
      throw new Error('Printer belum dikonfigurasi. Silakan konfigurasi printer di Device Settings.')
    }

    console.log('Print receipt - Using printer:', printerName)

    const receiptHTML = generateReceiptHTML(saleData)

    // Create a hidden window for printing
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`)

    console.log('Print receipt - Sending to printer...')

    return new Promise((resolve, reject) => {
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: printerName,
          margins: {
            marginType: 'none'
          },
          pageSize: {
            width: 58000, // 58mm in microns
            height: 100000 // auto height
          }
        },
        (success, errorType) => {
          printWindow.close()
          if (success) {
            console.log('Receipt printed successfully')
            resolve(true)
          } else {
            console.error('Print failed:', errorType)
            reject(new Error(`Print failed: ${errorType}`))
          }
        }
      )
    })
  } catch (error) {
    console.error('Error printing receipt:', error)
    throw error
  }
})

// Test print using Electron's built-in printing
ipcMain.handle('test-print', async () => {
  try {
    const deviceConfig = store.get('deviceConfig')
    console.log('Test print - Device config:', deviceConfig)

    const printerName = deviceConfig?.receiptPrinter

    if (!printerName) {
      console.error('Test print failed - No printer configured')
      throw new Error('Printer belum dikonfigurasi. Silakan pilih printer dan simpan konfigurasi terlebih dahulu.')
    }

    console.log('Test print - Using printer:', printerName)

    const testHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 58mm;
              margin: 0;
              padding: 10px;
              text-align: center;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .line {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="title">TEST PRINT</div>
          <div class="line">Mini ERP POS</div>
          <div class="line">${new Date().toLocaleString('id-ID')}</div>
          <div class="line" style="margin-top: 15px;">Printer: ${printerName}</div>
          <div class="line" style="margin-top: 15px;">Test berhasil! ✓</div>
        </body>
      </html>
    `

    // Create a hidden window for printing
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(testHTML)}`)

    console.log('Test print - Sending to printer...')

    return new Promise((resolve, reject) => {
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: printerName,
          margins: {
            marginType: 'none'
          },
          pageSize: {
            width: 58000, // 58mm in microns
            height: 100000 // auto height
          }
        },
        (success, errorType) => {
          printWindow.close()
          if (success) {
            console.log('Test print successful')
            resolve(true)
          } else {
            console.error('Test print failed:', errorType)
            reject(new Error(`Test print failed: ${errorType}`))
          }
        }
      )
    })
  } catch (error) {
    console.error('Error test print:', error)
    throw error
  }
})

