// Application State
let state = {
  user: null,
  token: null,
  products: [],
  cart: [],
  currentView: 'cashier'
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Load app version
  const version = await window.electronAPI.getAppVersion()
  document.getElementById('app-version').textContent = version

  // Setup window controls
  setupWindowControls()

  // Check if user is already logged in
  const savedToken = window.api.getItem('pos_token')
  const savedUser = window.api.getItem('pos_user')

  if (savedToken && savedUser) {
    state.token = savedToken
    state.user = JSON.parse(savedUser)
    await showPOSScreen()
  } else {
    showLoginScreen()
  }

  // Setup event listeners
  setupEventListeners()
})

// Window Controls
function setupWindowControls() {
  document.getElementById('minimize-btn').addEventListener('click', () => {
    window.electronAPI.minimizeWindow()
  })

  document.getElementById('maximize-btn').addEventListener('click', () => {
    window.electronAPI.maximizeWindow()
  })

  document.getElementById('close-btn').addEventListener('click', () => {
    window.electronAPI.closeWindow()
  })
}

// Event Listeners
function setupEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin)

  // Logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout)

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view
      switchView(view)
    })
  })

  // Cart actions
  document.getElementById('clear-cart-btn').addEventListener('click', clearCart)
  document.getElementById('checkout-btn').addEventListener('click', showPaymentModal)

  // Payment modal
  document.getElementById('close-payment-modal').addEventListener('click', hidePaymentModal)
  document.getElementById('cancel-payment-btn').addEventListener('click', hidePaymentModal)
  document.getElementById('confirm-payment-btn').addEventListener('click', processPayment)
  document.getElementById('payment-amount').addEventListener('input', calculateChange)

  // Product search
  document.getElementById('product-search').addEventListener('input', (e) => {
    filterProducts(e.target.value)
  })
}

// Authentication
async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const loginBtn = document.getElementById('login-btn')
  const errorDiv = document.getElementById('login-error')

  loginBtn.disabled = true
  loginBtn.innerHTML = '<span>Loading...</span>'
  errorDiv.style.display = 'none'

  try {
    const response = await window.api.login(email, password)

    if (response.token) {
      state.token = response.token
      state.user = response.user

      // Save to localStorage
      window.api.setItem('pos_token', response.token)
      window.api.setItem('pos_user', JSON.stringify(response.user))

      await showPOSScreen()
    } else {
      throw new Error(response.error || 'Login gagal')
    }
  } catch (error) {
    errorDiv.textContent = error.message || 'Terjadi kesalahan saat login'
    errorDiv.style.display = 'block'
  } finally {
    loginBtn.disabled = false
    loginBtn.innerHTML = '<span>Login</span>'
  }
}

function handleLogout() {
  if (confirm('Yakin ingin logout?')) {
    window.api.removeItem('pos_token')
    window.api.removeItem('pos_user')
    state = {
      user: null,
      token: null,
      products: [],
      cart: [],
      currentView: 'cashier'
    }
    showLoginScreen()
  }
}

// Screen Management
function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex'
  document.getElementById('pos-screen').style.display = 'none'
  document.getElementById('email').value = ''
  document.getElementById('password').value = ''
}

async function showPOSScreen() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('pos-screen').style.display = 'flex'

  // Update user info
  document.getElementById('user-name').textContent = state.user.name
  document.getElementById('user-role').textContent = state.user.role

  // Load products
  await loadProducts()
}

// Products Management
async function loadProducts() {
  const productsGrid = document.getElementById('products-grid')
  productsGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>'

  try {
    const products = await window.api.getProducts(state.token)
    state.products = products

    renderProducts(products)
  } catch (error) {
    productsGrid.innerHTML = `<p class="text-muted">Gagal memuat produk: ${error.message}</p>`
  }
}

function renderProducts(products) {
  const productsGrid = document.getElementById('products-grid')

  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<p class="text-muted">Tidak ada produk</p>'
    return
  }

  productsGrid.innerHTML = products.map(product => `
    <div class="product-card" onclick="addToCart(${product.id})">
      <div class="product-image">📦</div>
      <div class="product-name">${product.name}</div>
      <div class="product-sku">${product.sku}</div>
      <div class="product-price">${formatCurrency(product.price)}</div>
      <div class="product-stock ${product.stock < product.minStock ? 'low' : ''}">
        Stok: ${product.stock}
      </div>
    </div>
  `).join('')
}

function filterProducts(query) {
  if (!query) {
    renderProducts(state.products)
    return
  }

  const filtered = state.products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase())
  )
  
  renderProducts(filtered)
}

// Cart Management
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId)
  if (!product) return

  if (product.stock <= 0) {
    alert('Stok produk habis!')
    return
  }

  const existingItem = state.cart.find(item => item.id === productId)

  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      alert('Jumlah melebihi stok yang tersedia!')
      return
    }
    existingItem.quantity++
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: parseFloat(product.price),
      quantity: 1,
      maxStock: product.stock
    })
  }

  renderCart()
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId)
  renderCart()
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(item => item.id === productId)
  if (!item) return

  const newQuantity = item.quantity + delta

  if (newQuantity <= 0) {
    removeFromCart(productId)
  } else if (newQuantity <= item.maxStock) {
    item.quantity = newQuantity
    renderCart()
  } else {
    alert('Jumlah melebihi stok yang tersedia!')
  }
}

function renderCart() {
  const cartItems = document.getElementById('cart-items')
  const checkoutBtn = document.getElementById('checkout-btn')

  if (state.cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>Keranjang kosong</p>
      </div>
    `
    checkoutBtn.disabled = true
  } else {
    cartItems.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-header">
          <div class="cart-item-name">${item.name}</div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
        </div>
        <div class="cart-item-details">
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
          </div>
          <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>
      </div>
    `).join('')
    checkoutBtn.disabled = false
  }

  updateCartSummary()
}

function updateCartSummary() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  document.getElementById('subtotal').textContent = formatCurrency(subtotal)
  document.getElementById('tax').textContent = formatCurrency(tax)
  document.getElementById('total').textContent = formatCurrency(total)
}

function clearCart() {
  if (state.cart.length === 0) return

  if (confirm('Yakin ingin mengosongkan keranjang?')) {
    state.cart = []
    renderCart()
  }
}

// Payment
function showPaymentModal() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  document.getElementById('payment-total').textContent = formatCurrency(total)
  document.getElementById('payment-amount').value = ''
  document.getElementById('change-amount').textContent = formatCurrency(0)
  document.getElementById('confirm-payment-btn').disabled = true
  document.getElementById('payment-modal').classList.add('active')
  
  // Focus on payment input
  setTimeout(() => {
    document.getElementById('payment-amount').focus()
  }, 100)
}

function hidePaymentModal() {
  document.getElementById('payment-modal').classList.remove('active')
}

function calculateChange() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const paid = parseFloat(document.getElementById('payment-amount').value) || 0
  const change = paid - total

  document.getElementById('change-amount').textContent = formatCurrency(change >= 0 ? change : 0)
  document.getElementById('confirm-payment-btn').disabled = paid < total
}

function processPayment() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const paid = parseFloat(document.getElementById('payment-amount').value)
  const change = paid - total

  // Here you would normally send the transaction to the backend
  // For now, we'll just show a success message

  alert(`Pembayaran berhasil!\n\nTotal: ${formatCurrency(total)}\nDibayar: ${formatCurrency(paid)}\nKembalian: ${formatCurrency(change)}`)

  // Clear cart and close modal
  state.cart = []
  renderCart()
  hidePaymentModal()
}

// View Switching
function switchView(viewName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active')
    if (item.dataset.view === viewName) {
      item.classList.add('active')
    }
  })

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active')
  })

  const targetView = document.getElementById(`${viewName}-view`)
  if (targetView) {
    targetView.classList.add('active')
  }

  state.currentView = viewName

  // Load data for specific views
  if (viewName === 'products') {
    loadProductsList()
  }
}

function loadProductsList() {
  const productsList = document.getElementById('products-list')
  
  if (state.products.length === 0) {
    productsList.innerHTML = '<p class="text-muted">Tidak ada produk</p>'
    return
  }

  productsList.innerHTML = `
    <table class="products-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Nama</th>
          <th>Kategori</th>
          <th>Harga</th>
          <th>Stok</th>
        </tr>
      </thead>
      <tbody>
        ${state.products.map(p => `
          <tr>
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${formatCurrency(p.price)}</td>
            <td class="${p.stock < p.minStock ? 'text-danger' : ''}">${p.stock}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}
