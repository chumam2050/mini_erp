import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'

function CartItems({ cart, selectedItemIndex, onSelectItem, onBarcodeInput, barcodeInputRef, formatPrice }) {
  const [barcodeValue, setBarcodeValue] = useState('')

  const handleSearch = () => {
    if (onBarcodeInput(barcodeValue)) {
      setBarcodeValue('')
      barcodeInputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-3 p-5 border-b">
        <Input
          ref={barcodeInputRef}
          type="text"
          placeholder="[ Input Barcode Manual... ]"
          value={barcodeValue}
          onChange={(e) => setBarcodeValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 h-12 font-mono text-base"
          autoFocus
        />
        <Button 
          onClick={handleSearch}
          className="px-8 h-12 text-base font-semibold"
        >
          <Search className="h-5 w-5 mr-2" />
          CARI BARANG
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-base">Belum ada item</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item, index) => (
              <div
                key={item.id + '_' + index}
                onClick={() => onSelectItem(index)}
                className={`grid grid-cols-[50px_1fr_100px_140px] gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                  selectedItemIndex === index 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card hover:bg-accent border-border'
                }`}
              >
                <div className="font-semibold text-base">{index + 1}.</div>
                <div className="font-medium text-base">{item.name}</div>
                <div className="text-center font-semibold text-base">- {item.quantity} -</div>
                <div className="text-right font-semibold text-base">Rp {formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default CartItems
