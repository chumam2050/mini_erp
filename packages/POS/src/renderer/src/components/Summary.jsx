import { useState, useRef, useEffect, useCallback } from 'react'
import { Wallet, CreditCard, Smartphone, Loader2 } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'


function Summary({ cart, formatPrice, onCheckout, posSettings = {}, cashInputRef = null, isProcessing = false, showConfirm = (msg) => Promise.resolve(window.confirm(msg)) }) {
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

  // Pay handler (used by button and Alt+B shortcut)
  const handlePay = useCallback(async () => {
    // pass current parsed cash as amountFromSummary so prompt can prefill with it if needed
    const ok = await onCheckout('cash', parsedCash)
    if (ok) setCashAmount('')
  }, [onCheckout, parsedCash])

  // Click handler for Pay button that asks for confirmation first
  const confirmAndPay = useCallback(async () => {
    if (!total || isProcessing) return
    let confirmMsg = 'Konfirmasi: lanjutkan pembayaran tunai?'
    if (parsedCash > 0 && parsedCash < total) {
      confirmMsg = `Tunai kurang Rp ${formatPrice(total - parsedCash)}. Lanjutkan dan masukkan jumlah tunai?`
    } else if (!parsedCash || parsedCash === 0) {
      confirmMsg = 'Tunai belum diisi. Lanjutkan dan masukkan jumlah tunai?'
    }

    const confirmed = await showConfirm(confirmMsg)
    if (confirmed) await handlePay()
  }, [total, isProcessing, parsedCash, formatPrice, showConfirm, handlePay])

  // Alt+B: trigger Pay via keyboard (uses same confirmation flow)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!e.altKey) return
      const k = e.key
      if (k.toLowerCase() === 'b') {
        // respect the same disabled rules as the button
        if (!total || isProcessing) return
        e.preventDefault()
        // Trigger the same confirmation + pay flow used by the button
        confirmAndPay().catch(err => console.error('Error in confirmAndPay:', err))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirmAndPay, total, isProcessing])
  // Listen for Alt+1..Alt+0 to trigger cash shortcuts (Alt+1 -> first, Alt+2 -> second, ..., Alt+0 -> tenth)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!e.altKey) return
      const k = e.key
      if (!/^[0-9]$/.test(k)) return
      const d = parseInt(k, 10)
      // map 1->0, 2->1, ..., 9->8, 0->9
      const index = d === 0 ? 9 : (d - 1)
      if (index >= 0 && index < cashShortcuts.length) {
        e.preventDefault()
        handleShortcutClick(cashShortcuts[index])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cashShortcuts])

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
          <div className="grid grid-cols-2 p-3 gap-2">
            {cashShortcuts.map((nom, idx) => (
              <Button
                key={nom}
                variant="outline"
                size="xl"
                className="h-10 text-start w-full px-3"
                onClick={() => handleShortcutClick(nom)}
                title={`Klik: set; Double click: tambah; Shortcut: Alt+${(idx + 1) % 10}`}
              >
                <div className="flex text-md justify-between items-center w-full">
                  <div>Rp {formatPrice(nom)}</div>
                  <div className="text-xs text-muted-foreground">Alt+{(idx + 1) % 10}</div>
                </div>
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

          {parsedCash > 0 && parsedCash < total && (
            <div className="flex justify-between text-lg text-red-600">
              <span className="font-semibold text-black">Kurang:</span>
              <span className="font-semibold">Rp {formatPrice(total - parsedCash)}</span>
            </div>
          )}

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
          onClick={handlePay}
          className="h-24 rounded-none flex-row gap-2 text-base font-bold"
          disabled={!total || isProcessing}
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Wallet className="h-7 w-7" />}
          <div className="text-center leading-tight">
            {isProcessing ? 'Memproses...' : 'BAYAR'}
            <div className="text-xs  mt-1">Alt+B</div>
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
