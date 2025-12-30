import { useState, useEffect } from 'react'
import { Settings, LogOut, User } from 'lucide-react'
import { Button } from './ui/button'
import ThemeToggle from './ThemeToggle'

function Header({ onSettingsClick, onShortcutsClick, currentUser, onLogout }) {
  const [datetime, setDatetime] = useState('')

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
    <header className="bg-card border-b shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex-1">
          <h1 className="text-lg font-semibold mb-1.5 text-foreground">RetaliQ - POS #01</h1>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Kasir: <span className="text-foreground font-medium">{currentUser?.name || 'Unknown'}</span>
              {currentUser?.role && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {currentUser.role}
                </span>
              )}
            </span>
            <span>{datetime}</span>
            <span>Status: <span className="text-green-600 dark:text-green-400 font-semibold">Online</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onShortcutsClick}
            className="h-9 w-9 hover:bg-accent"
            title="Shortcuts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 8h.01M8 12h.01M8 16h.01M12 8h4M12 12h4M12 16h4" />
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSettingsClick}
            className="h-9 w-9 hover:bg-accent"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onLogout}
            className="h-9 px-3 hover:bg-destructive/10 hover:text-destructive"
            title="Logout"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
