import { useState } from 'react'
import { Wallet, CreditCard, Smartphone } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

function Summary({ cart, formatPrice, onCheckout, posSettings = {} }) {
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

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardContent className="flex-1 p-6 space-y-4">
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Total Item:</span>
          <span className="font-semibold">{cart.length}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-semibold">Rp {formatPrice(subtotal)}</span>
        </div>
        {enableTax && (
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">PPN ({taxRate}%):</span>
            <span className="font-semibold">Rp {formatPrice(Math.round(tax))}</span>
          </div>
        )}
        {enableDiscount && defaultDiscount > 0 && (
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">Diskon ({defaultDiscount}%):</span>
            <span className="font-semibold">- Rp {formatPrice(Math.round(discount))}</span>
          </div>
        )}

        <div className="flex justify-between text-2xl font-bold text-destructive pt-4 mt-2 border-t-2 border-border">
          <span>TOTAL:</span>
          <span>Rp {formatPrice(total)}</span>
        </div>

        {/* Cash input placed below total */}
        <div className="flex flex-col gap-2 pt-3">
          <div className="flex justify-between text-2xl items-center">
            <span className="text-muted-foreground">Tunai (Bayar):</span>
            <input
              type="number"
              min="0"
              step="100"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="w-40 text-right border rounded p-1 bg-white text-black"
              placeholder="0"
            />
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
          disabled={!total}
        >
          <Wallet className="h-7 w-7" />
          <div className="text-center leading-tight">
            BAYAR
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
