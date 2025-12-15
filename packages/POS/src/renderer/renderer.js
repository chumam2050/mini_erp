// State management
const state = {
  cart: [],
  products: [],
  apiConfig: null,
  selectedItemIndex: null,
  cashierName: 'Budi Santoso'
};

// Initialize the app
async function init() {
  // Load API configuration
  state.apiConfig = await window.electronAPI.getApiConfig();
  
  // Set cashier name
  document.getElementById('cashier-name').textContent = state.cashierName;
  
  // Update datetime
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // Load saved cart from storage
  const savedCart = await window.electronAPI.storeGet('currentCart');
  if (savedCart) {
    state.cart = savedCart;
    renderCart();
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Load products from API
  await loadProducts();
  
  // Focus on barcode input
  document.getElementById('barcode-input').focus();
}

// Update datetime display
function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  document.getElementById('datetime').textContent = `${dateStr} - ${timeStr} WIB`;
}

// Setup event listeners
function setupEventListeners() {
  // Settings button
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('close-settings').addEventListener('click', closeSettings);
  document.getElementById('cancel-settings').addEventListener('click', closeSettings);
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Barcode input
  document.getElementById('barcode-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleBarcodeInput();
    }
  });
  
  document.getElementById('search-btn').addEventListener('click', handleBarcodeInput);
  
  // Action buttons
  document.getElementById('btn-ubah-qty').addEventListener('click', () => changeSelectedQty());
  document.getElementById('btn-clear-all').addEventListener('click', () => clearAllItems());
  document.getElementById('btn-input-member').addEventListener('click', () => inputMember());
  
  // Payment buttons
  document.getElementById('btn-cash').addEventListener('click', () => checkout('cash'));
  document.getElementById('btn-card').addEventListener('click', () => checkout('card'));
  document.getElementById('btn-ewallet').addEventListener('click', () => checkout('ewallet'));
  
  // Menu events
  window.electronAPI.onMenuNewSale(() => {
    clearCart();
  });
  
  window.electronAPI.onMenuAbout(() => {
    alert(`Mini ERP - Point of Sales\nSupermarket Sejahtera\n\nA desktop POS application built with Electron`);
  });
}

// Load products from API
async function loadProducts() {
  try {
    // Mock products for demonstration
    // TODO: Replace with actual API call to backend
    state.products = [
      { id: 1, barcode: '8991234567890', name: 'Minyak Goreng 2L', price: 35000, stock: 50 },
      { id: 2, barcode: '8991234567891', name: 'Telur Ayam (kg)', price: 28000, stock: 30, perKg: true },
      { id: 3, barcode: '8991234567892', name: 'Sabun Mandi Cair', price: 30000, stock: 100 },
      { id: 4, barcode: '8991234567893', name: 'Roti Tawar Kupas', price: 18500, stock: 25 },
      { id: 5, barcode: '8991234567894', name: 'Susu UHT 1L', price: 22000, stock: 40 },
      { id: 6, barcode: '8991234567895', name: 'Gula Pasir 1kg', price: 15000, stock: 60 }
    ];
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Handle barcode input
function handleBarcodeInput() {
  const barcodeInput = document.getElementById('barcode-input');
  const barcode = barcodeInput.value.trim();
  
  if (!barcode) return;
  
  // Find product by barcode
  const product = state.products.find(p => p.barcode === barcode);
  
  if (product) {
    addToCart(product.id);
    barcodeInput.value = '';
    barcodeInput.focus();
  } else {
    alert('Produk tidak ditemukan!');
    barcodeInput.select();
  }
}

// Add quick item (non-barcode items)
function addQuickItem(name, price) {
  const newId = Date.now();
  const existingItem = state.cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    state.cart.push({
      id: newId,
      name: name,
      price: price,
      quantity: 1,
      maxStock: 999
    });
  }
  
  saveCart();
  renderCart();
}

// Prompt for weight item
function promptWeightItem() {
  const weight = prompt('Masukkan berat (kg):');
  if (weight && !isNaN(weight) && parseFloat(weight) > 0) {
    const pricePerKg = 12000;
    const totalPrice = pricePerKg * parseFloat(weight);
    
    state.cart.push({
      id: Date.now(),
      name: `Beras Curah (${weight} kg)`,
      price: totalPrice,
      quantity: 1,
      maxStock: 1
    });
    
    saveCart();
    renderCart();
  }
}

// Change quantity of selected item
function changeSelectedQty() {
  if (state.selectedItemIndex === null) {
    alert('Pilih item terlebih dahulu!');
    return;
  }
  
  const item = state.cart[state.selectedItemIndex];
  const newQty = prompt(`Ubah jumlah untuk ${item.name}:`, item.quantity);
  
  if (newQty && !isNaN(newQty) && parseInt(newQty) > 0) {
    item.quantity = parseInt(newQty);
    saveCart();
    renderCart();
  }
}

// Clear all items with confirmation
function clearAllItems() {
  if (state.cart.length === 0) {
    alert('Keranjang sudah kosong!');
    return;
  }
  
  if (confirm('Hapus semua item dari keranjang?')) {
    state.cart = [];
    state.selectedItemIndex = null;
    saveCart();
    renderCart();
    document.getElementById('barcode-input').focus();
  }
}

// Input member
function inputMember() {
  const memberId = prompt('Masukkan ID Member:');
  if (memberId) {
    alert(`Member ${memberId} berhasil ditambahkan!`);
    // TODO: Apply member discount
  }
}

// Hold transaction
function holdTransaction() {
  if (state.cart.length === 0) {
    alert('Keranjang kosong!');
    return;
  }
  
  const holdId = Date.now();
  window.electronAPI.storeSet(`hold_${holdId}`, {
    cart: state.cart,
    timestamp: new Date().toISOString()
  });
  
  alert('Transaksi berhasil ditahan!');
  clearCart();
}

// Add product to cart
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  // Handle per-kg items
  if (product.perKg) {
    const weight = prompt(`Masukkan berat ${product.name} (kg):`, '0.5');
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) return;
    
    state.cart.push({
      id: Date.now(),
      name: `${product.name} (${weight} kg)`,
      price: product.price * parseFloat(weight),
      quantity: 1,
      maxStock: 1
    });
  } else {
    const existingItem = state.cart.find(item => item.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
      } else {
        alert('Stok tidak mencukupi!');
        return;
      }
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxStock: product.stock
      });
    }
  }
  
  saveCart();
  renderCart();
}

// Clear cart
function clearCart() {
  if (state.cart.length > 0) {
    if (confirm('Hapus semua item?')) {
      state.cart = [];
      state.selectedItemIndex = null;
      saveCart();
      renderCart();
    }
  } else {
    state.cart = [];
    state.selectedItemIndex = null;
    renderCart();
  }
}

// Render cart
function renderCart() {
  const cartItems = document.getElementById('cart-items');
  
  if (state.cart.length === 0) {
    cartItems.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6c757d;">
        <p>Belum ada item</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = state.cart.map((item, index) => {
      const isSelected = state.selectedItemIndex === index;
      return `
        <div class="cart-item ${isSelected ? 'selected' : ''}" onclick="selectItem(${index})">
          <div class="cart-item-number">${index + 1}.</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
          </div>
          <div class="cart-item-qty">- ${item.quantity} -</div>
          <div class="cart-item-price">Rp ${formatPrice(item.price * item.quantity)}</div>
        </div>
      `;
    }).join('');
  }
  
  updateSummary();
}

// Select item in cart
function selectItem(index) {
  state.selectedItemIndex = index;
  renderCart();
}

// Format price to Indonesian format
function formatPrice(price) {
  return price.toLocaleString('id-ID');
}

// Update cart summary
function updateSummary() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; // PPN 11%
  const discount = 0;
  const total = subtotal + tax - discount;
  
  document.getElementById('total-items').textContent = state.cart.length;
  document.getElementById('subtotal').textContent = `Rp ${formatPrice(subtotal)}`;
  document.getElementById('tax').textContent = `Rp ${formatPrice(Math.round(tax))}`;
  document.getElementById('discount').textContent = `- Rp ${formatPrice(discount)}`;
  document.getElementById('total').textContent = `Rp ${formatPrice(Math.round(total))}`;
}

// Save cart to storage
async function saveCart() {
  await window.electronAPI.storeSet('currentCart', state.cart);
}

// Checkout
async function checkout(paymentMethod) {
  if (state.cart.length === 0) {
    alert('Keranjang kosong!');
    return;
  }
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = Math.round(subtotal + tax);
  
  let paymentMethodName = '';
  switch(paymentMethod) {
    case 'cash':
      paymentMethodName = 'Tunai (Cash)';
      break;
    case 'card':
      paymentMethodName = 'Kartu (EDC)';
      break;
    case 'ewallet':
      paymentMethodName = 'QRIS / E-Wallet';
      break;
  }
  
  // For cash payment, ask for amount
  if (paymentMethod === 'cash') {
    const cashAmount = prompt(`Total: Rp ${formatPrice(total)}\n\nMasukkan jumlah uang tunai:`);
    if (!cashAmount || isNaN(cashAmount) || parseInt(cashAmount) < total) {
      alert('Jumlah uang tidak mencukupi!');
      return;
    }
    
    const change = parseInt(cashAmount) - total;
    alert(`Pembayaran berhasil!\n\nTotal: Rp ${formatPrice(total)}\nBayar: Rp ${formatPrice(parseInt(cashAmount))}\nKembalian: Rp ${formatPrice(change)}`);
  } else {
    if (!confirm(`Proses pembayaran dengan ${paymentMethodName}?\n\nTotal: Rp ${formatPrice(total)}`)) {
      return;
    }
    alert('Pembayaran berhasil!');
  }
  
  try {
    // TODO: Send sale to backend API
    console.log('Processing sale:', {
      items: state.cart,
      subtotal: subtotal,
      tax: tax,
      total: total,
      paymentMethod: paymentMethodName,
      cashier: state.cashierName,
      timestamp: new Date().toISOString()
    });
    
    // Save to sales history
    const salesHistory = await window.electronAPI.storeGet('salesHistory') || [];
    salesHistory.push({
      id: Date.now(),
      items: state.cart,
      subtotal: subtotal,
      tax: tax,
      total: total,
      paymentMethod: paymentMethodName,
      cashier: state.cashierName,
      timestamp: new Date().toISOString()
    });
    await window.electronAPI.storeSet('salesHistory', salesHistory);
    
    // Clear cart
    state.cart = [];
    state.selectedItemIndex = null;
    saveCart();
    renderCart();
    
    // Focus back to barcode input
    document.getElementById('barcode-input').focus();
  } catch (error) {
    alert('Error processing sale: ' + error.message);
  }
}

// Settings modal
function openSettings() {
  const modal = document.getElementById('settings-modal');
  document.getElementById('api-url').value = state.apiConfig.baseUrl;
  document.getElementById('api-timeout').value = state.apiConfig.timeout;
  modal.classList.add('active');
}

function closeSettings() {
  const modal = document.getElementById('settings-modal');
  modal.classList.remove('active');
}

async function saveSettings() {
  const baseUrl = document.getElementById('api-url').value;
  const timeout = parseInt(document.getElementById('api-timeout').value);
  
  if (!baseUrl) {
    alert('Please enter a valid API URL');
    return;
  }
  
  state.apiConfig = { baseUrl, timeout };
  await window.electronAPI.setApiConfig(state.apiConfig);
  
  alert('Settings saved successfully!');
  closeSettings();
  
  // Reload products with new configuration
  await loadProducts();
}

// Make functions globally accessible for onclick handlers
window.addToCart = addToCart;
window.selectItem = selectItem;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
