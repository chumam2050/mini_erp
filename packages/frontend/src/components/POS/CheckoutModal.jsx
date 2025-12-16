import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  subtotal, 
  discount, 
  discountType,
  tax, 
  taxRate,
  total, 
  onConfirmSale 
}) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  })
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    amountPaid: total,
    notes: ''
  })

  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setPaymentInfo(prev => ({ ...prev, amountPaid: total }))
  }, [total])

  const change = paymentInfo.amountPaid - total

  const handleConfirm = async () => {
    if (paymentInfo.amountPaid < total) {
      alert('Amount paid is insufficient')
      return
    }

    setIsProcessing(true)
    
    const saleData = {
      customerName: customerInfo.name || null,
      customerPhone: customerInfo.phone || null,
      customerEmail: customerInfo.email || null,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price)
      })),
      discount: discountType === 'percentage' ? discount : (discount || 0),
      discountType: discount > 0 ? discountType : 'fixed',
      taxRate,
      paymentMethod: paymentInfo.method,
      amountPaid: paymentInfo.amountPaid,
      notes: paymentInfo.notes
    }

    try {
      await onConfirmSale(saleData)
      onClose()
      // Reset form
      setCustomerInfo({ name: '', phone: '', email: '' })
      setPaymentInfo({ method: 'cash', amountPaid: total, notes: '' })
    } catch (error) {
      console.error('Error processing sale:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 p-1">
          {/* Order Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-b-0">
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-foreground">Rp {(item.quantity * Number(item.price)).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-destructive">-Rp {(discountType === 'percentage' ? subtotal * (discount / 100) : discount).toLocaleString('id-ID')}</span>
                </div>
              )}
              
              {tax > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                  <span className="font-medium text-foreground">Rp {tax.toLocaleString('id-ID')}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between py-2 text-lg">
                <span className="font-bold text-foreground">Total:</span>
                <span className="font-bold text-foreground text-xl">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Customer Information <span className="text-muted-foreground font-normal text-sm">(Optional)</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-foreground font-medium">Name</Label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-foreground font-medium">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="customerEmail" className="text-foreground font-medium">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Payment</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-foreground font-medium">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={paymentInfo.method}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital_wallet">Digital Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amountPaid" className="text-foreground font-medium">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="1000"
                  value={paymentInfo.amountPaid}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
                  className="bg-background border-border text-foreground font-mono text-right"
                  placeholder="Amount"
                />
              </div>
              
              {paymentInfo.method === 'cash' && (
                <div className="bg-muted/30 rounded-md p-3 border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Change:</span>
                    <span className={`font-bold text-lg ${
                      change < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      Rp {Math.abs(change).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {change < 0 && (
                    <p className="text-sm text-destructive mt-1">Insufficient payment amount</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground font-medium">Notes <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <textarea
                  id="notes"
                  value={paymentInfo.notes}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-border rounded-md resize-none bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isProcessing}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isProcessing || paymentInfo.amountPaid < total}
              className="flex-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CheckoutModal