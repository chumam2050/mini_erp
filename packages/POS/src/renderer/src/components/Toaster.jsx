import { useEffect, useState } from 'react'

function Toast({ id, type = 'info', message, onClose }) {
  const colors = {
    success: 'bg-green-50 border-green-400 text-green-700',
    error: 'bg-red-50 border-red-400 text-red-700',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-700',
    info: 'bg-slate-50 border-slate-300 text-slate-800'
  }

  return (
    <div className={`max-w-sm w-full border px-3 py-2 rounded shadow-sm ${colors[type] || colors.info}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm leading-tight">{message}</div>
        <button onClick={() => onClose(id)} className="text-sm font-medium pl-3">✕</button>
      </div>
    </div>
  )
}

export default function Toaster() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const onShow = (e) => {
      const { id = Date.now(), type = 'info', message = '', timeout = 5000 } = e.detail || {}
      setToasts((prev) => [...prev, { id, type, message, timeout }])
    }

    window.addEventListener('show-toast', onShow)
    return () => window.removeEventListener('show-toast', onShow)
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map(t => setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== t.id))
    }, t.timeout || 5000))

    return () => timers.forEach(clearTimeout)
  }, [toasts])

  const handleClose = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={handleClose} />
      ))}
    </div>
  )
}