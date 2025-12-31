import { X, Printer, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

import { useEffect, useRef } from 'react'

function PaymentResultModal({ onClose, total = 0, paid = 0, change = 0, onReprint = null }) {
  const closeBtnRef = useRef(null)

  useEffect(() => {
    // Autofocus tombol Tutup saat modal muncul
    closeBtnRef.current?.focus()
  }, [])

  // Enter = Tutup, Shift+Enter = Cetak Struk (jika ada)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onClose()
    } else if ((e.key === 'Enter' && e.shiftKey) && onReprint) {
      e.preventDefault()
      onReprint()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" tabIndex={-1} onKeyDown={handleKeyDown}>
      <Card className="w-full max-w-sm flex flex-col shadow-2xl border-border/30">
        <div className="flex items-center justify-center pt-4">
          <div className="bg-green-50 text-green-600 rounded-full p-2 shadow-sm">
            <CheckCircle className="h-7 w-7" />
          </div>
        </div>

        <CardHeader className="flex items-center justify-center pb-2">
          <CardTitle className="text-lg font-semibold">Pembayaran berhasil</CardTitle>
        </CardHeader>

        <CardContent className="p-4 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">Rp {total?.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bayar:</span>
              <span className="font-semibold">Rp {paid?.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Kembalian:</span>
              <span className="font-semibold text-green-600">Rp {change?.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-6 justify-end">
            <Button
              variant="outline"
              onClick={onReprint}
              className="px-3"
              disabled={!onReprint}
              title={onReprint ? 'Cetak ulang struk' : 'Struk tidak tersedia untuk dicetak'}
            >
              <Printer className="h-4 w-4 mr-2" /> Cetak Struk
            </Button>

            <Button ref={closeBtnRef} autoFocus onClick={onClose} className="px-4 bg-black text-primary-foreground hover:bg-black/90">
              Tutup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentResultModal
