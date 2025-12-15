import { useState, useEffect } from 'react'

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
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">Supermarket Sejahtera | POS #04</h1>
          <div className="header-info">
            <span>Kasir: <span id="cashier-name">{cashierName}</span></span>
            <span id="datetime">{datetime}</span>
            <span>Status: <span id="status" className="status-online">Online</span></span>
          </div>
        </div>
        <div className="header-actions">
          <button id="settings-btn" className="icon-btn" title="Settings" onClick={onSettingsClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m-8-8h6m6 0h6"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
