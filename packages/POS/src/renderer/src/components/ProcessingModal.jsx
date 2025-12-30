import { Loader2 } from 'lucide-react'
import { Card, CardContent } from './ui/card'

export default function ProcessingModal({ message = 'Memproses transaksi...' }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="status" aria-live="polite">
      <Card className="w-full max-w-xs flex flex-col items-center p-6 shadow-2xl border-border/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <CardContent className="p-4 text-center">
          <div className="font-medium">{message}</div>
          <div className="text-sm text-muted-foreground mt-2">Mohon tunggu sampai proses selesai.</div>
        </CardContent>
      </Card>
    </div>
  )
}
