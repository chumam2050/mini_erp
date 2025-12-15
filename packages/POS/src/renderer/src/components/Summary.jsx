import { Wallet, CreditCard, Smartphone } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

function Summary({ cart, formatPrice, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.11
  const discount = 0
  const total = Math.round(subtotal + tax - discount)

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardContent className="flex-1 p-5 space-y-3">
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Total Item:</span>
          <span className="font-semibold">{cart.length}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-semibold">Rp {formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">PPN (11%):</span>
          <span className="font-semibold">Rp {formatPrice(Math.round(tax))}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Diskon:</span>
          <span className="font-semibold">- Rp {formatPrice(discount)}</span>
        </div>
        <div className="flex justify-between text-2xl font-bold text-destructive pt-3 mt-2 border-t-2">
          <span>TOTAL:</span>
          <span>Rp {formatPrice(total)}</span>
        </div>
      </CardContent>

      <div className="grid grid-cols-3 border-t-2">
        <Button 
          onClick={() => onCheckout('cash')}
          className="h-20 rounded-none bg-[#28a745] hover:bg-[#218838] flex-col gap-1 text-base font-bold"
        >
          <Wallet className="h-6 w-6" />
          <div className="text-center leading-tight">
            TUNAI<br />(CASH)
          </div>
        </Button>
        <Button 
          onClick={() => onCheckout('card')}
          className="h-20 rounded-none bg-[#0066cc] hover:bg-[#0052a3] flex-col gap-1 text-base font-bold"
        >
          <CreditCard className="h-6 w-6" />
          <div className="text-center leading-tight">
            KARTU<br />(EDC)
          </div>
        </Button>
        <Button 
          onClick={() => onCheckout('ewallet')}
          className="h-20 rounded-none bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 flex-col gap-1 text-base font-bold"
        >
          <Smartphone className="h-6 w-6" />
          <div className="text-center leading-tight">
            QRIS /<br />E-Wallet
          </div>
        </Button>
      </div>
    </Card>
  )
}

export default Summary
