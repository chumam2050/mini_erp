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
      <CardContent className="flex-1 p-6 space-y-4">
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
        <div className="flex justify-between text-2xl font-bold text-destructive pt-4 mt-2 border-t-2 border-border">
          <span>TOTAL:</span>
          <span>Rp {formatPrice(total)}</span>
        </div>
      </CardContent>

      <div className="grid grid-cols-3 border-t-2 border-border">
        <Button 
          onClick={() => onCheckout('cash')}
          className="h-24 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex-col gap-2 text-base font-bold border-r border-border"
        >
          <Wallet className="h-7 w-7" />
          <div className="text-center leading-tight">
            TUNAI<br />(CASH)
          </div>
        </Button>
        <Button 
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
        </Button>
      </div>
    </Card>
  )
}

export default Summary
