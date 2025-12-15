import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { Button } from './ui/button'

function Header({ onSettingsClick }) {
  const [datetime, setDatetime] = useState('')
  const [cashierName] = useState('Budi Santoso')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
      setDatetime(`${dateStr} - ${timeStr} WIB`)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-[#343a40] text-white shadow-md">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex-1">
          <h1 className="text-lg font-semibold mb-1">Supermarket Sejahtera | POS #04</h1>
          <div className="flex gap-6 text-sm text-gray-300">
            <span>Kasir: <span className="text-white">{cashierName}</span></span>
            <span>{datetime}</span>
            <span>Status: <span className="text-green-400 font-semibold">Online</span></span>
          </div>
        </div>
        <div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSettingsClick}
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
