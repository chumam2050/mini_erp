import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Minus, ScanBarcode, X } from 'lucide-react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'

function CartItems({ className, cart, selectedItemIndex, onSelectItem, onBarcodeInput, onAddProduct, products = [], barcodeInputRef, formatPrice, onIncrementQuantity, onDecrementQuantity }) {
  const [barcodeValue, setBarcodeValue] = useState('')
  const [isFocused, setIsFocused] = useState(true)
  const [inputHistory, setInputHistory] = useState('')
  // Track whether the last input change came from user typing (keyboard/scan) or was programmatic/paste
  const [lastInputWasTyped, setLastInputWasTyped] = useState(false)

  // Search suggestions state
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  // Keyboard navigation index (-1 means none)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionItemsRef = useRef([])

  // Local guard to avoid sending the same barcode to the handler multiple times quickly
  const lastSentBarcodeRef = useRef({ barcode: null, ts: 0 })

  // Close suggestions when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!suggestionsRef.current) return
      if (suggestionsRef.current.contains(e.target)) return
      if (barcodeInputRef?.current && barcodeInputRef.current.contains(e.target)) return
      setShowSuggestions(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [barcodeInputRef])

  // Keep highlighted suggestion scrolled into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const el = suggestionsRef.current.children[highlightedIndex]
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, suggestions])

  const selectSuggestion = (product) => {
    if (!product) return
    onAddProduct(product.id)
    setSuggestions([])
    setShowSuggestions(false)
    setBarcodeValue('')
    setTimeout(() => barcodeInputRef.current?.focus(), 50)
  }

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')

  const renderHighlighted = (text, q) => {
    if (!q) return text
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'ig'))
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? <span key={i} className="font-semibold text-primary">{part}</span> : <span key={i}>{part}</span>
      )
    } catch (err) {
      return text
    }
  }

  const generateSuggestions = (rawQuery) => {
    const q = (rawQuery || '').trim().toLowerCase()
    if (!q) {
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      suggestionItemsRef.current = []
      return []
    }
    console.log('generateSuggestions:', q, 'products:', products.length)
    const d = products.filter(p => p.name.toLowerCase().includes(q));
    console.log('Filtered products count:', d)
    // Defensive: ensure products is an array of objects
    const matches = (Array.isArray(products) ? products : []).filter(p => {
      return p && (p.name || p.sku || p.barcode) && String(p.name || p.sku || p.barcode).toLowerCase().includes(q)
    }).slice(0, 8)
    console.log('generateSuggestions found:', matches.length, matches.map(m => m.name || m.sku || m.barcode))
    setSuggestions(matches)
    setShowSuggestions(true)
    setHighlightedIndex(matches.length > 0 ? 0 : -1)
    suggestionItemsRef.current = []
    return matches
  }

  const handleSearch = () => {
    const barcode = barcodeValue.trim()
    if (barcode) {
      console.log('Sending barcode to handler:', barcode)
      const accepted = onBarcodeInput(barcode)
      if (accepted) {
        lastSentBarcodeRef.current = { barcode, ts: Date.now() }
        setBarcodeValue('')
      } else {
        // If barcode search failed, try name search and show suggestions
        generateSuggestions(barcode)
      }
      // Always refocus after search attempt
      setTimeout(() => {
        barcodeInputRef.current?.focus()
      }, 50)
    }
  }

  // Handle Enter to search by barcode or choose suggestion when available
  const handleKeyPress = (e) => {
    if (e.key === 'ArrowDown') {
      if (suggestions.length > 0) {
        e.preventDefault()
        setShowSuggestions(true)
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
      }
      return
    }
    if (e.key === 'ArrowUp') {
      if (suggestions.length > 0) {
        e.preventDefault()
        setShowSuggestions(true)
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
      }
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectSuggestion(suggestions[highlightedIndex])
        return
      }
      if (showSuggestions && suggestions.length === 1) {
        selectSuggestion(suggestions[0])
        return
      }
      handleSearch()
    }

    // Optional: close suggestions with Escape
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  const suggestionTimerRef = useRef(null)

  // Debug: log products when they change so we can see what's loaded
  useEffect(() => {
    try {
      console.log('CartItems mounted products count:', Array.isArray(products) ? products.length : 'not-array')
      if (Array.isArray(products) && products.length > 0) {
        console.log('CartItems sample products:', products.slice(0, 8).map(p => ({ id: p.id, name: p.name, sku: p.sku || p.barcode })))
      }
    } catch (err) {
      console.error('Error logging products', err)
    }
  }, [products])

  const handleChange = (e) => {
    const value = e.target.value
    console.log('Barcode input changed:', value)
    setBarcodeValue(value)
    // Detect if this change was from typing (insertText) or other sources like paste/programmatic
    const inputType = e.nativeEvent?.inputType
    const wasTyped = inputType === 'insertText' || inputType === 'insertCompositionText'
    setLastInputWasTyped(Boolean(wasTyped))

    // Debounce suggestions (only when user types)
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current)
    if (value && value.trim().length >= 1) {
      suggestionTimerRef.current = setTimeout(() => {
        generateSuggestions(value)
      }, 10)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      suggestionItemsRef.current = []
    }
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
            onFocus={() => { setIsFocused(true); if (barcodeValue && barcodeValue.trim().length >= 1) generateSuggestions(barcodeValue) }}
            onBlur={() => setIsFocused(false)}
            className={`h-12 font-mono text-base pr-12 ${isFocused ? 'ring-2 ring-green-500 border-green-500' : ''
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
                  setSuggestions([])
                  setShowSuggestions(false)
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

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div ref={suggestionsRef} className="absolute left-0 right-0 top-full mt-2 bg-card border rounded shadow z-30 overflow-hidden text-left max-h-56 overflow-auto">
              {suggestions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Tidak ada produk yang cocok</div>
              ) : (
                suggestions.map((s, idx) => (
                  <button
                    key={s.id}
                    ref={(el) => { suggestionItemsRef.current[idx] = el }}
                    className={`w-full px-3 py-2 hover:bg-accent flex items-center justify-between text-sm ${highlightedIndex === idx ? 'bg-accent/30 font-semibold' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s) }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <span className="truncate">{renderHighlighted(s.name, barcodeValue.trim())}</span>
                    <span className="text-muted-foreground ml-2">Rp {formatPrice(s.price)}</span>
                  </button>
                ))
              )}
            </div>
          )}
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
                className={`grid grid-cols-[50px_1fr_140px_140px] gap-4 p-4 rounded-md border transition-colors ${selectedItemIndex === index
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
                    className={`h-8 w-8 p-0 ${selectedItemIndex === index
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
                    className={`h-8 w-8 p-0 ${selectedItemIndex === index
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
