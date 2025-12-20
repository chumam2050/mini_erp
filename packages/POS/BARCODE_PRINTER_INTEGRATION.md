# Integrasi Barcode Scanner dan Receipt Printer - Mini ERP POS

## Overview
Aplikasi POS telah diintegrasikan dengan barcode scanner dan receipt printer USB. Integrasi ini memungkinkan:
- Scanning barcode secara otomatis menambahkan produk ke cart
- Pencetakan struk otomatis setelah checkout
- Konfigurasi device yang mudah melalui Settings modal

## Fitur Yang Ditambahkan

### 1. USB Device Detection
- Deteksi otomatis perangkat USB yang terhubung
- Menampilkan informasi device (path, manufacturer, serial number)
- Refresh manual untuk memindai device baru

### 2. Barcode Scanner Integration
- Koneksi via Serial Port (USB to Serial)
- Support multiple baud rates (9600, 19200, 38400, 115200)
- Auto-reconnect saat konfigurasi berubah
- Event listener untuk barcode yang di-scan
- Integrasi langsung dengan sistem cart

### 3. Receipt Printer Integration
- Support ESC/POS commands
- Format struk professional dengan:
  - Header toko
  - Informasi transaksi (nomor, tanggal, kasir)
  - Detail items dengan harga
  - Subtotal, diskon, pajak
  - Total dan pembayaran
  - Kembalian (jika cash)
  - Footer
- Auto-cut paper setelah print
- Test print function untuk verifikasi koneksi

## Cara Penggunaan

### Setup Device

1. **Hubungkan Perangkat USB**
   - Hubungkan barcode scanner ke port USB
   - Hubungkan receipt printer ke port USB
   - Windows akan otomatis mendeteksi dan install driver

2. **Buka Settings**
   - Klik icon Settings di aplikasi
   - Pilih tab "Devices"

3. **Konfigurasi Barcode Scanner**
   - Klik "Refresh" untuk memindai device yang tersedia
   - Pilih port untuk barcode scanner dari dropdown
   - Pilih baud rate yang sesuai (biasanya 9600)
   - Jika tidak yakin, coba semua baud rate hingga berhasil

4. **Konfigurasi Receipt Printer**
   - Pilih port untuk receipt printer dari dropdown
   - Pilih baud rate yang sesuai (biasanya 9600)
   - Klik "Test Print" untuk verifikasi koneksi
   - Jika test print berhasil, printer siap digunakan

5. **Save Settings**
   - Klik "Save Settings" untuk menyimpan konfigurasi
   - Device akan otomatis terkoneksi

### Menggunakan Barcode Scanner

1. **Manual Input (Keyboard)**
   - Fokus pada input field "Scan Barcode"
   - Ketik atau scan barcode
   - Tekan Enter
   - Produk akan otomatis ditambahkan ke cart

2. **Hardware Scanner**
   - Pastikan scanner sudah dikonfigurasi di Settings
   - Arahkan scanner ke barcode produk
   - Tekan trigger/tombol scan
   - Produk akan otomatis ditambahkan ke cart
   - Tidak perlu fokus di input field

### Mencetak Struk

**Otomatis:**
- Struk akan otomatis tercetak setelah checkout berhasil
- Printer akan memotong kertas secara otomatis

**Manual:**
- Jika auto-print gagal, Anda masih bisa melihat transaksi di history
- Print manual belum diimplementasikan (coming soon)

## Troubleshooting

### Barcode Scanner Tidak Terdeteksi

**Solusi:**
1. Pastikan driver sudah terinstall
2. Cek di Device Manager (Windows) > Ports (COM & LPT)
3. Catat nomor COM port (misal: COM3)
4. Di Settings > Devices, pilih port yang sesuai
5. Coba ganti baud rate jika masih tidak berfungsi

**Untuk Scanner USB HID:**
- Beberapa scanner tidak menggunakan serial port
- Scanner tipe HID bekerja seperti keyboard
- Tidak perlu konfigurasi khusus
- Langsung bisa digunakan dengan input field

### Receipt Printer Tidak Mencetak

**Solusi:**
1. Pastikan printer terhubung dan menyala
2. Cek kabel USB tidak longgar
3. Verifikasi port di Settings > Devices
4. Klik "Test Print" untuk test koneksi
5. Pastikan kertas termal tersedia
6. Cek baud rate sesuai spesifikasi printer

**Format Tidak Benar:**
- Printer menggunakan ESC/POS commands
- Pastikan printer support ESC/POS protocol
- Beberapa printer butuh konfigurasi khusus

### Device Tidak Muncul di List

**Solusi:**
1. Cabut dan pasang kembali USB
2. Restart aplikasi POS
3. Klik tombol "Refresh" di Settings
4. Cek di Device Manager apakah device terdeteksi
5. Install driver yang diperlukan

### Error "Port Already in Use"

**Solusi:**
1. Tutup aplikasi lain yang menggunakan port tersebut
2. Restart aplikasi POS
3. Di Settings, pilih ulang device
4. Save settings

## Spesifikasi Teknis

### Supported Devices

**Barcode Scanner:**
- Serial/USB to Serial scanners
- USB HID scanners (plug & play)
- Baud rates: 9600, 19200, 38400, 115200

**Receipt Printer:**
- ESC/POS compatible thermal printers
- 58mm or 80mm paper width
- USB interface
- Serial/USB to Serial interface

### Data Format

**Barcode Input:**
- Delimiter: CR+LF (\\r\\n)
- Character encoding: UTF-8
- Max length: 255 characters

**Printer Output:**
- Command set: ESC/POS
- Character encoding: UTF-8
- Paper width: 32 characters (58mm) or 48 characters (80mm)
- Auto-cut: Supported

## Konfigurasi File

### Device Config (Electron Store)
```json
{
  "deviceConfig": {
    "barcodeScanner": "COM3",
    "receiptPrinter": "COM4",
    "scannerBaudRate": 9600,
    "printerBaudRate": 9600
  }
}
```

## Dependencies

- `serialport` - ^12.0.0
- `@serialport/parser-readline` - ^12.0.0

## API Methods

### Electron IPC

**Main Process:**
- `get-usb-devices` - Get list of USB devices
- `get-device-config` - Get saved device configuration
- `set-device-config` - Save device configuration
- `print-receipt` - Print receipt with sale data
- `test-print` - Print test receipt

**Renderer Process:**
- `window.electronAPI.getUsbDevices()` - Get USB devices
- `window.electronAPI.getDeviceConfig()` - Get device config
- `window.electronAPI.setDeviceConfig(config)` - Set device config
- `window.electronAPI.onBarcodeScanned(callback)` - Listen to barcode events
- `window.electronAPI.printReceipt(saleData)` - Print receipt
- `window.electronAPI.testPrint()` - Test printer

## Rekomendasi Hardware

### Barcode Scanner
- **Budget:** Generic USB Barcode Scanner (~Rp 200.000)
- **Mid-range:** Honeywell Voyager 1200g (~Rp 1.500.000)
- **Premium:** Zebra DS2208 (~Rp 2.500.000)

### Receipt Printer
- **Budget:** Zjiang ZJ-5890K (~Rp 800.000)
- **Mid-range:** Epson TM-T82 (~Rp 2.500.000)
- **Premium:** Star TSP143IIIU (~Rp 3.500.000)

## Future Improvements

- [ ] Support untuk network printers
- [ ] Custom receipt template design
- [ ] Logo printing on receipt
- [ ] Barcode printing on receipt
- [ ] Multiple printer support
- [ ] Receipt reprint functionality
- [ ] Email receipt option
- [ ] QR code payment integration
- [ ] Weight scale integration
- [ ] Cash drawer integration

## Support

Untuk pertanyaan atau issues, silakan hubungi tim development.

## Changelog

### Version 1.0.0 (2025-12-20)
- ✅ Initial USB device detection
- ✅ Barcode scanner integration
- ✅ Receipt printer integration
- ✅ Settings UI for device configuration
- ✅ Auto-print receipt after checkout
- ✅ Test print functionality
