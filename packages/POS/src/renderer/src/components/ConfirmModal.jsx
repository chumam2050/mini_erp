import { X, AlertTriangle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

function ConfirmModal({ title = 'Konfirmasi', message = '', onConfirm, onCancel }) {
  const okRef = useRef(null)

  useEffect(() => {
    // focus OK button when modal opens
    okRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onConfirm, onCancel])

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <Card className="w-full max-w-sm flex flex-col shadow-2xl border-border/30">
        <CardHeader className="flex items-center justify-center pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 text-yellow-600 rounded-full p-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle id="confirm-title" className="text-lg font-semibold">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 absolute right-3 top-3">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 text-sm text-center">
          <p className="text-sm text-muted-foreground mb-4">{message}</p>

          <div className="flex gap-3 mt-2 justify-center">
            <Button variant="outline" onClick={onCancel} className="px-3">Batal</Button>
            <Button ref={okRef} onClick={onConfirm} className="px-4 bg-black text-primary-foreground hover:bg-black/90">OK</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConfirmModal
