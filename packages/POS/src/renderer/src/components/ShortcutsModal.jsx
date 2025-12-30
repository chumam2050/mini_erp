import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

const shortcuts = [
  { keys: 'Ctrl+T / F9', desc: 'Focus Tunai (Bayar) input' },
  { keys: 'Type any character', desc: 'Focus barcode input (scan or type to search)' },
  { keys: 'F12', desc: 'Toggle DevTools' },
  { keys: 'Ctrl+Q', desc: 'Quit application' },
  { keys: 'Ctrl+R', desc: 'Reload window' }
]

function ShortcutsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl border-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50 shrink-0">
          <CardTitle className="text-lg font-semibold text-foreground">Keyboard Shortcuts</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-secondary/80"
            aria-label="Close shortcuts"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-4 overflow-y-auto flex-1 space-y-3 text-sm">
          <p className="text-sm text-muted-foreground">Shortcut untuk mempercepat alur kerja:</p>

          <div className="grid grid-cols-1 gap-2 mt-3">
            {shortcuts.map(s => (
              <div key={s.keys} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-accent/30">
                <div className="font-mono text-xs text-foreground bg-muted/10 px-2 py-1 rounded-sm border border-border/30 min-w-[92px] text-center">{s.keys}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground pt-2">
            Tip: Tekan <kbd className="px-2 py-0.5 rounded bg-muted/20 font-mono text-xs">Ctrl+T</kbd> untuk langsung fokus ke input Tunai.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShortcutsModal
