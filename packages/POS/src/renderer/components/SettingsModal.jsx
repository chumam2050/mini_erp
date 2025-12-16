import { useState } from 'react'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'

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
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border/50">
          <CardTitle className="text-xl font-bold text-foreground">Settings</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-secondary/80"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="api-url" className="text-sm font-medium text-foreground">
              API Base URL
            </Label>
            <Input
              id="api-url"
              type="text"
              placeholder="http://localhost:3000"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="h-11 bg-input border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-timeout" className="text-sm font-medium text-foreground">
              API Timeout (ms)
            </Label>
            <Input
              id="api-timeout"
              type="number"
              placeholder="5000"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              className="h-11 bg-input border-border/50 focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-4">
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
