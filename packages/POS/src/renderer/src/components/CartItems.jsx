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
      <div className="flex gap-3 p-4 border-b bg-white">
        <Input
          ref={barcodeInputRef}
          type="text"
          placeholder="[ Input Barcode Manual... ]"
          value={barcodeValue}
          onChange={(e) => setBarcodeValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 h-11 font-mono"
          autoFocus
        />
        <Button 
          onClick={handleSearch}
          className="bg-[#17a2b8] hover:bg-[#138496] px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          CARI BARANG
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-white">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Belum ada item</p>
          </div>
        ) : (
          <div className="space-y-1">
            {cart.map((item, index) => (
              <div
                key={item.id + '_' + index}
                onClick={() => onSelectItem(index)}
                className={`grid grid-cols-[40px_1fr_80px_120px] gap-4 p-3 rounded border cursor-pointer transition-colors ${
                  selectedItemIndex === index 
                    ? 'bg-[#007bff] text-white border-[#007bff]' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="font-semibold text-base">{index + 1}.</div>
                <div className="font-medium">{item.name}</div>
                <div className="text-center font-semibold">- {item.quantity} -</div>
                <div className="text-right font-semibold">Rp {formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default CartItems
