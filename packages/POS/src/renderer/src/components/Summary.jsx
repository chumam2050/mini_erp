import { useState, useRef, useEffect } from 'react'
import { Wallet, CreditCard, Smartphone, Loader2 } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'


function Summary({ cart, formatPrice, onCheckout, posSettings = {}, cashInputRef = null, isProcessing = false }) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxRate = posSettings.taxRate || 11
  const defaultDiscount = posSettings.defaultDiscount || 0
  const enableTax = posSettings.enableTax !== false
  const enableDiscount = posSettings.enableDiscount !== false

  const tax = enableTax ? subtotal * (taxRate / 100) : 0
  const discount = enableDiscount ? subtotal * (defaultDiscount / 100) : 0
  const total = Math.round(subtotal + tax - discount)

  // Local cash input state
  const [cashAmount, setCashAmount] = useState('')
  const parsedCash = parseInt(cashAmount || '0')
  const canPayWithCash = parsedCash >= total && total > 0

  // Cash shortcuts (single click: set amount, double-click: add amount)
  const clickTimerRef = useRef(null)
  const defaultShortcuts = [2000, 5000, 10000, 20000, 50000, 100000]
  const cashShortcuts = (() => {
    console.log('posSettings.cashShortcuts', posSettings)
    if (!posSettings) return defaultShortcuts
    const s = posSettings.cashShortcuts
    if (!s) return defaultShortcuts
    if (Array.isArray(s)) return s
    if (typeof s === 'string') {
      return s.split(',').map(x => parseInt(x.trim())).filter(Boolean)
    }
    return defaultShortcuts
  })()

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  const handleShortcutClick = (value) => {
    setCashAmount(prev => String((Number(prev) || 0) + value))

    // // Detect double click via short timeout
    // if (clickTimerRef.current) {
    //   clearTimeout(clickTimerRef.current)
    //   clickTimerRef.current = null
    //   // double click -> add
    // } else {
    //   // single click -> set after short delay (to allow double click detection)
    //   clickTimerRef.current = setTimeout(() => {
    //     setCashAmount(String(value))
    //     clickTimerRef.current = null
    //   }, 220)
    // }
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardContent className="flex-1 p-6 space-y-4">

        {(enableDiscount || enableTax) && (
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Total Item:</span>
            <span className="font-semibold">{cart.length}</span>
          </div>
        )}

        {(enableDiscount || enableTax) && (
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-semibold">Rp {formatPrice(subtotal)}</span>
          </div>
        )}

        {enableTax && (
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">PPN ({taxRate}%):</span>
            <span className="font-semibold">Rp {formatPrice(Math.round(tax))}</span>
          </div>
        )}
        {enableDiscount && defaultDiscount > 0 && (
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Diskon ({defaultDiscount}%):</span>
            <span className="font-semibold">- Rp {formatPrice(Math.round(discount))}</span>
          </div>
        )}

        <div className="flex justify-between text-2xl font-bold text-destructive">
          <span>TOTAL:</span>
          <span>Rp {formatPrice(total)}</span>
        </div>

        {/* Cash shortcut buttons */}
        <div className='flex flex-col gap-2 w-full border p-2 rounded-xl'>
          <div className='text-lg text-muted-foreground font-medium mb-1'>
            Cash Shortcuts:
          </div>
          <div className="grid grid-cols-3 p-3 gap-2">
            {cashShortcuts.map((nom) => (
              <Button
                key={nom}
                variant="outline"
                size="xl"
                className="h-10 text-start w-full px-3"
                onClick={() => handleShortcutClick(nom)}
                title="Klik: set; Double click: tambah"
              >
                Rp {formatPrice(nom)}
              </Button>
            ))}
          </div>
        </div>

        {/* Cash input placed below total */}
        <div className="flex flex-col gap-2 pt-3">
          <div className="flex justify-between text-xl gap-2 items-center">
            <span className="text-muted-foreground">Tunai (Bayar):</span>
            <input
              ref={cashInputRef}
              id="pos-cash-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={cashAmount ? Number(cashAmount).toLocaleString('id-ID') : ''}
              onChange={(e) => {
                // allow only digits (strip separators/other chars)
                const digits = e.target.value.replace(/\D/g, '')
                setCashAmount(digits)
              }}
              className="text-right border rounded p-1"
              placeholder="0"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setCashAmount('')
                  // refocus input after clearing
                  setTimeout(() => cashInputRef?.current?.focus(), 10)
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {canPayWithCash && (
            <div className="flex justify-between text-2xl text-green-700">
              <span className="font-semibold text-black">Kembalian:</span>
              <span className="font-semibold">Rp {formatPrice(parsedCash - total)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <div className="grid grid-cols-1 border-t-2 border-border">
        <Button
          onClick={async () => {
            const ok = await onCheckout('cash', canPayWithCash ? parsedCash : null)
            if (ok) setCashAmount('')
          }}
          className="h-24 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex-row gap-2 text-base font-bold border-r border-border"
          disabled={!total || isProcessing}
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Wallet className="h-7 w-7" />}
          <div className="text-center leading-tight">
            {isProcessing ? 'Memproses...' : 'BAYAR'}
          </div>
        </Button>
        {/* <Button 
          onClick={() => onCheckout('card')}
          className="h-24 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex-col gap-2 text-base font-bold border-r border-border"
        >
          <CreditCard className="h-7 w-7" />
          <div className="text-center leading-tight">
            KARTU<br />(EDC)
          </div>
        </Button>
        <Button 
          onClick={() => onCheckout('ewallet')}
          className="h-24 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex-col gap-2 text-base font-bold"
        >
          <Smartphone className="h-7 w-7" />
          <div className="text-center leading-tight">
            QRIS /<br />E-Wallet
          </div>
        </Button> */}
      </div>
    </Card>
  )
}

export default Summary
