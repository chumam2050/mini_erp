import { useState } from 'react'

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
    <div className="items-panel">
      <div className="barcode-input-section">
        <input
          ref={barcodeInputRef}
          type="text"
          id="barcode-input"
          placeholder="[ Input Barcode Manual... ]"
          value={barcodeValue}
          onChange={(e) => setBarcodeValue(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <button id="search-btn" className="btn-search" onClick={handleSearch}>
          CARI BARANG
        </button>
      </div>

      <div className="cart-items" id="cart-items">
        {cart.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6c757d' }}>
            <p>Belum ada item</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div
              key={item.id + '_' + index}
              className={`cart-item ${selectedItemIndex === index ? 'selected' : ''}`}
              onClick={() => onSelectItem(index)}
            >
              <div className="cart-item-number">{index + 1}.</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
              </div>
              <div className="cart-item-qty">- {item.quantity} -</div>
              <div className="cart-item-price">Rp {formatPrice(item.price * item.quantity)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CartItems
