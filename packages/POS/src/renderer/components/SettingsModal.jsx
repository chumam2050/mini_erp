import { useState, useEffect } from 'react'
import { X, Printer, Barcode, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

function SettingsModal({ onClose }) {
  const [devices, setDevices] = useState([])
  const [deviceConfig, setDeviceConfig] = useState({
    barcodeScanner: null,
    receiptPrinter: null,
    scannerBaudRate: 9600,
    printerBaudRate: 9600
  })
  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
  const [isTestingPrinter, setIsTestingPrinter] = useState(false)

  useEffect(() => {
    loadDevices()
    loadDeviceConfig()
  }, [])

  const loadDevices = async () => {
    setIsLoadingDevices(true)
    try {
      const usbDevices = await window.electronAPI.getUsbDevices()
      setDevices(usbDevices)
    } catch (error) {
      console.error('Error loading devices:', error)
    } finally {
      setIsLoadingDevices(false)
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
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">USB Devices</h3>
            <Button
              onClick={loadDevices}
              variant="outline"
              size="sm"
              disabled={isLoadingDevices}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDevices ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Barcode className="h-4 w-4" />
              <span className="font-medium">Barcode Scanner</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scanner-port" className="text-sm">
                Port
              </Label>
              <div className="relative">
                <Select
                  value={deviceConfig.barcodeScanner || ''}
                  onValueChange={(value) => setDeviceConfig({ ...deviceConfig, barcodeScanner: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Pilih port barcode scanner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {devices.map((device) => (
                      <SelectItem key={device.path} value={device.path}>
                        {device.path} - {device.manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
                <div className="space-y-2">
                  <Label htmlFor="scanner-baud" className="text-sm">
                    Baud Rate
                  </Label>
                  <div className="relative">
                    <Select
                      value={deviceConfig.scannerBaudRate?.toString() || '9600'}
                      onValueChange={(value) => setDeviceConfig({ ...deviceConfig, scannerBaudRate: parseInt(value) })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9600">9600</SelectItem>
                        <SelectItem value="19200">19200</SelectItem>
                        <SelectItem value="38400">38400</SelectItem>
                        <SelectItem value="115200">115200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Printer className="h-4 w-4" />
                  <span className="font-medium">Receipt Printer</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printer-port" className="text-sm">
                    Port
                  </Label>
                  <div className="relative">
                    <Select
                      value={deviceConfig.receiptPrinter || ''}
                      onValueChange={(value) => setDeviceConfig({ ...deviceConfig, receiptPrinter: value })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Pilih port printer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {devices.map((device) => (
                          <SelectItem key={device.path} value={device.path}>
                            {device.path} - {device.manufacturer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printer-baud" className="text-sm">
                    Baud Rate
                  </Label>
                  <div className="relative">
                    <Select
                      value={deviceConfig.printerBaudRate?.toString() || '9600'}
                      onValueChange={(value) => setDeviceConfig({ ...deviceConfig, printerBaudRate: parseInt(value) })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9600">9600</SelectItem>
                        <SelectItem value="19200">19200</SelectItem>
                        <SelectItem value="38400">38400</SelectItem>
                        <SelectItem value="115200">115200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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