import { useState, useEffect } from 'react'
import { X, Printer, RefreshCw, AlertCircle, Info, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

function SettingsModal({ onClose }) {
  const [printers, setPrinters] = useState([])
  const [deviceConfig, setDeviceConfig] = useState({
    receiptPrinter: null
  })
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false)
  const [isTestingPrinter, setIsTestingPrinter] = useState(false)

  useEffect(() => {
    loadPrinters()
    loadDeviceConfig()
  }, [])

  const loadPrinters = async () => {
    setIsLoadingPrinters(true)
    try {
      console.log('Fetching Windows printers...')
      const windowsPrinters = await window.electronAPI.getPrinters()
      console.log('Printers received:', windowsPrinters)
      console.log('Printer count:', windowsPrinters.length)
      setPrinters(windowsPrinters)
    } catch (error) {
      console.error('Error loading printers:', error)
    } finally {
      setIsLoadingPrinters(false)
    }
  }

  const loadDeviceConfig = async () => {
    try {
      const config = await window.electronAPI.getDeviceConfig()
      setDeviceConfig(config)
    } catch (error) {
      console.error('Error loading device config:', error)
    }
  }

  const handleTestPrint = async () => {
    setIsTestingPrinter(true)
    try {
      await window.electronAPI.testPrint()
      alert('Test print berhasil! Cek printer Anda.')
    } catch (error) {
      alert('Error test print: ' + error.message)
    } finally {
      setIsTestingPrinter(false)
    }
  }

  const handleSave = async () => {
    try {
      await window.electronAPI.setDeviceConfig(deviceConfig)
      alert('Settings saved successfully!')
      onClose()
    } catch (error) {
      alert('Error saving device config: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border/50 shrink-0">
          <CardTitle className="text-xl font-bold text-foreground">Device Settings</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-secondary/80"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Barcode Scanner Info */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex gap-3">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-green-500">Barcode Scanner USB HID</p>
              <p className="text-muted-foreground">
                Scanner Anda sudah otomatis bekerja! Scanner USB HID berperilaku seperti keyboard, 
                jadi ketika Anda scan barcode, hasilnya langsung muncul di input yang aktif.
              </p>
            </div>
          </div>

          {/* Printers Section */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Windows Printers ({printers.length} found)</h3>
            <Button
              onClick={loadPrinters}
              variant="outline"
              size="sm"
              disabled={isLoadingPrinters}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPrinters ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {printers.length === 0 && !isLoadingPrinters && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-orange-500">Tidak ada printer Windows terdeteksi</p>
                <p className="text-xs mt-1">
                  Pastikan printer sudah terinstall di Windows.
                </p>
              </div>
            </div>
          )}
          
          {printers.length > 0 && !printers.find(p => p.name.toLowerCase().includes('haoyin') || p.name.toLowerCase().includes('ep58')) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-2">
              <Info className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Printer thermal HaoYin EP58M tidak ditemukan</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground mt-2 text-xs">
                  <li>Hubungkan printer ke USB</li>
                  <li>Install driver printer dari CD/website manufacturer</li>
                  <li>Tunggu instalasi selesai</li>
                  <li>Klik tombol <span className="font-medium">Refresh</span> di atas</li>
                </ol>
              </div>
            </div>
          )}
              
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Printer className="h-4 w-4" />
              <span className="font-medium">Receipt Printer</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="printer-name" className="text-sm">
                Pilih Printer
              </Label>
              <div className="relative">
                <Select
                  value={deviceConfig.receiptPrinter || ''}
                  onValueChange={(value) => setDeviceConfig({ ...deviceConfig, receiptPrinter: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Pilih printer untuk struk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada</SelectItem>
                    {printers.map((printer) => (
                      <SelectItem key={printer.name} value={printer.name}>
                        {printer.displayName || printer.name}
                        {printer.isDefault && ' (Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {deviceConfig.receiptPrinter && (
                <p className="text-xs text-muted-foreground">
                  Printer terpilih: <span className="font-medium">{deviceConfig.receiptPrinter}</span>
                </p>
              )}
            </div>
            <Button
              onClick={handleTestPrint}
              variant="outline"
              size="sm"
              disabled={!deviceConfig.receiptPrinter || isTestingPrinter}
              className="w-full"
            >
              {isTestingPrinter ? 'Testing...' : 'Test Print'}
            </Button>
          </div>
          
          <div className="flex gap-3 pt-6 mt-6 border-t">
            <Button 
              onClick={handleSave} 
              className="flex-1 h-11 font-semibold"
            >
              Save Settings
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1 h-11 font-semibold"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsModal