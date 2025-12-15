function Summary({ cart, formatPrice, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.11
  const discount = 0
  const total = Math.round(subtotal + tax - discount)

  return (
    <div className="summary-section">
      <div className="summary-info">
        <div className="summary-row">
          <span>Total Item:</span>
          <span id="total-items" className="summary-value">{cart.length}</span>
        </div>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span id="subtotal" className="summary-value">Rp {formatPrice(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>PPN (11%):</span>
          <span id="tax" className="summary-value">Rp {formatPrice(Math.round(tax))}</span>
        </div>
        <div className="summary-row">
          <span>Diskon:</span>
          <span id="discount" className="summary-value">- Rp {formatPrice(discount)}</span>
        </div>
        <div className="summary-row total">
          <span>TOTAL:</span>
          <span id="total" className="summary-value">Rp {formatPrice(total)}</span>
        </div>
      </div>

      <div className="payment-buttons">
        <button id="btn-cash" className="btn-payment btn-cash" onClick={() => onCheckout('cash')}>
          TUNAI<br />(CASH)
        </button>
        <button id="btn-card" className="btn-payment btn-card" onClick={() => onCheckout('card')}>
          KARTU<br />(EDC)
        </button>
        <button id="btn-ewallet" className="btn-payment btn-ewallet" onClick={() => onCheckout('ewallet')}>
          QRIS /<br />E-Wallet
        </button>
      </div>
    </div>
  )
}

export default Summary
