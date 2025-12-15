import { useState } from 'react'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'

function SettingsModal({ config, onSave, onClose }) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl)
  const [timeout, setTimeout] = useState(config.timeout)

  const handleSave = () => {
    if (!baseUrl) {
      alert('Please enter a valid API URL')
      return
    }
    onSave({ baseUrl, timeout })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Settings</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api-url" className="text-sm font-semibold">
              API Base URL
            </label>
            <Input
              id="api-url"
              type="text"
              placeholder="http://localhost:3000"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="api-timeout" className="text-sm font-semibold">
              API Timeout (ms)
            </label>
            <Input
              id="api-timeout"
              type="number"
              placeholder="5000"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsModal
