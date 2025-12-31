import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

const shortcuts = [
  { keys: 'Ctrl+T', desc: 'Fokus ke input Tunai (Bayar)' },
  { keys: 'Alt+1..Alt+9 / Alt+0', desc: 'Cash shortcuts — tambah nilai ke input Tunai (Alt+0 = tombol ke-10)' },
  { keys: 'Alt+B', desc: 'Bayar (checkout Tunai), akan muncul konfirmasi' },
  { keys: 'Ctrl+Q', desc: 'Keluar aplikasi' },
  { keys: 'Ctrl+R', desc: 'Reload window' }
]

function ShortcutsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50 shrink-0">
          <CardTitle className="text-xl font-bold text-foreground tracking-tight">Keyboard Shortcuts</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 hover:bg-secondary/80"
            aria-label="Close shortcuts"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6 overflow-y-auto flex-1 space-y-4 text-base">
          <p className="text-base text-muted-foreground mb-2">Gunakan shortcut berikut untuk mempercepat alur kerja POS:</p>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/40 rounded-tl-lg">Shortcut</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/40 rounded-tr-lg">Fungsi</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map(s => (
                  <tr key={s.keys} className="align-top hover:bg-accent/30 group">
                    <td className="font-mono text-xs text-foreground bg-muted/10 px-3 py-2 rounded-l-lg border border-border/20 group-hover:border-primary/40 whitespace-nowrap align-middle">{s.keys}</td>
                    <td className="text-sm text-muted-foreground px-3 py-2 rounded-r-lg border border-border/20 group-hover:border-primary/40 align-middle">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground pt-3">
            <span className="font-semibold">Tip:</span> Tekan <kbd className="px-2 py-0.5 rounded bg-muted/20 font-mono text-xs">Ctrl+T</kbd> untuk langsung fokus ke input Tunai.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShortcutsModal
