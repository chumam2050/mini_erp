function ActionButtons({ onChangeQty, onClearAll, onInputMember }) {
  return (
    <div className="action-buttons-grid">
      <button className="action-btn" id="btn-ubah-qty" onClick={onChangeQty}>
        UBAH QTY<br />(+/-)
      </button>
      <button className="action-btn" id="btn-input-member" onClick={onInputMember}>
        INPUT<br />MEMBER
      </button>
      <button className="action-btn btn-danger" id="btn-clear-all" onClick={onClearAll}>
        CLEAR ALL<br />(Hapus Semua)
      </button>
    </div>
  )
}

export default ActionButtons
