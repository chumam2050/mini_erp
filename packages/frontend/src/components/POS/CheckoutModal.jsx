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

        <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.quantity * Number(item.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-${(discountType === 'percentage' ? subtotal * (discount / 100) : discount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>${tax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="font-medium mb-3">Customer Information (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-medium mb-3">Payment</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={paymentInfo.method}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital_wallet">Digital Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  value={paymentInfo.amountPaid}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              {paymentInfo.method === 'cash' && (
                <div className="text-right">
                  <span className="text-sm text-gray-600">Change: </span>
                  <span className={`font-medium ${change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${change.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={paymentInfo.notes}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border rounded-md resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isProcessing || paymentInfo.amountPaid < total}
              className="flex-1"
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