import { useState } from 'react'
import { Search, Plus, Minus, ScanBarcode, X } from 'lucide-react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'

function CartItems({ className, cart, selectedItemIndex, onSelectItem, onBarcodeInput, barcodeInputRef, formatPrice, onIncrementQuantity, onDecrementQuantity }) {
  const [barcodeValue, setBarcodeValue] = useState('')
  const [isFocused, setIsFocused] = useState(true)
  const [inputHistory, setInputHistory] = useState('')
  // Track whether the last input change came from user typing (keyboard/scan) or was programmatic/paste
  const [lastInputWasTyped, setLastInputWasTyped] = useState(false)

  const handleSearch = () => {
    if (barcodeValue.trim()) {
      // Only allow search if the last change was from typing (keyboard/scanner),
      // prevents programmatic/appended values from triggering a search.
      if (!lastInputWasTyped) {
        console.log('Search prevented: barcode input was not typed by user.')
        // Refocus so user can type or correct the value
        barcodeInputRef.current?.focus()
        return
      }

      if (onBarcodeInput(barcodeValue.trim())) {
        setBarcodeValue('')
      }
      setLastInputWasTyped(false)

      // Always refocus after search attempt
      setTimeout(() => {
        barcodeInputRef.current?.focus()
      }, 50)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    console.log('Barcode input changed:', value)
    setBarcodeValue(value)

    // Detect if this change was from typing (insertText) or other sources like paste/programmatic
    const inputType = e.nativeEvent?.inputType
    const wasTyped = inputType === 'insertText' || inputType === 'insertCompositionText'
    setLastInputWasTyped(Boolean(wasTyped))
  }

  return (
    <Card className={`flex flex-col h-full overflow-hidden ${className}`}>
      <div className="flex gap-3 p-5 border-b bg-muted/30">
        <div className="relative flex-1">
          <Input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode atau ketik manual..."
            value={barcodeValue}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`h-12 font-mono text-base pr-12 ${
              isFocused ? 'ring-2 ring-green-500 border-green-500' : ''
            }`}
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Clear input button (visible when there's content) */}
            {barcodeValue ? (
              <button
                type="button"
                aria-label="Clear barcode input"
                onClick={() => {
                  setBarcodeValue('')
                  setLastInputWasTyped(false)
                  barcodeInputRef.current?.focus()
                }}
                className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted/10 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            {isFocused ? (
              <div className="flex items-center gap-1.5 text-green-600">
                <ScanBarcode className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-medium">Siap Scan</span>
              </div>
            ) : (
              <ScanBarcode className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
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
                className={`grid grid-cols-[50px_1fr_140px_140px] gap-4 p-4 rounded-md border transition-colors ${
                  selectedItemIndex === index 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card hover:bg-accent border-border'
                }`}
              >
                <div 
                  className="font-semibold text-base cursor-pointer"
                  onClick={() => onSelectItem(index)}
                >
                  {index + 1}.
                </div>
                <div 
                  className="font-medium text-base cursor-pointer"
                  onClick={() => onSelectItem(index)}
                >
                  {item.name}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDecrementQuantity(index)
                    }}
                    className={`h-8 w-8 p-0 ${
                      selectedItemIndex === index
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                        : ''
                    }`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-base min-w-10 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onIncrementQuantity(index)
                    }}
                    className={`h-8 w-8 p-0 ${
                      selectedItemIndex === index
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                        : ''
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div 
                  className="text-right font-semibold text-base cursor-pointer"
                  onClick={() => onSelectItem(index)}
                >
                  Rp {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default CartItems
