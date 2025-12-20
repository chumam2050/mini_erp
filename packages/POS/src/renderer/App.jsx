import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import CartItems from './components/CartItems'
import ProductList from './components/ProductList'
import ActionButtons from './components/ActionButtons'
import Summary from './components/Summary'
import SettingsModal from './components/SettingsModal'
import LoginPage from './pages/LoginPage'
import { isAuthenticated, getCurrentUser, logout } from './utils/auth'

const mockProducts = [
  { id: 1, barcode: '8991234567890', name: 'Minyak Goreng 2L', price: 35000, stock: 50 },
  { id: 2, barcode: '8991234567891', name: 'Telur Ayam (kg)', price: 28000, stock: 30, perKg: true },
  { id: 3, barcode: '8991234567892', name: 'Sabun Mandi Cair', price: 30000, stock: 100 },
  { id: 4, barcode: '8991234567893', name: 'Roti Tawar Kupas', price: 18500, stock: 25 },
  { id: 5, barcode: '8991234567894', name: 'Susu UHT 1L', price: 22000, stock: 40 },
  { id: 6, barcode: '8991234567895', name: 'Gula Pasir 1kg', price: 15000, stock: 60 }
]

function App() {
  const [cart, setCart] = useState([])
  const [products] = useState(mockProducts)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiConfig, setApiConfig] = useState({ baseUrl: 'http://localhost:5000', timeout: 5000 })
  const [isProductListCollapsed, setIsProductListCollapsed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [posSettings, setPosSettings] = useState({
    plasticBagSmallPrice: 200,
    plasticBagLargePrice: 500,
    taxRate: 11,
    defaultDiscount: 0,
    enableTax: true,
    enableDiscount: true
  })
  const barcodeInputRef = useRef(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated()
        setIsLoggedIn(authenticated)
        
        if (authenticated) {
          const user = await getCurrentUser()
          setCurrentUser(user)
          // Fetch POS settings
          await fetchPosSettings()
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  // Fetch POS settings from backend
  const fetchPosSettings = async () => {
    try {
      const config = await window.electronAPI.getApiConfig()
      const baseUrl = config?.baseUrl || 'http://localhost:5000'
      
      const response = await fetch(`${baseUrl}/api/settings?category=pos`)
      if (response.ok) {
        const settings = await response.json()
        setPosSettings({
          plasticBagSmallPrice: settings['pos.plastic_bag_small_price']?.value || 200,
          plasticBagLargePrice: settings['pos.plastic_bag_large_price']?.value || 500,
          taxRate: settings['pos.tax_rate']?.value || 11,
          defaultDiscount: settings['pos.default_discount']?.value || 0,
          enableTax: settings['pos.enable_tax']?.value !== false,
          enableDiscount: settings['pos.enable_discount']?.value !== false
        })
      }
    } catch (error) {
      console.error('Error fetching POS settings:', error)
    }
  }

  // Load saved cart and config on mount
  useEffect(() => {
    if (!isLoggedIn) return

    const loadData = async () => {
      const savedCart = await window.electronAPI.storeGet('currentCart')
      if (savedCart) setCart(savedCart)
      
      const config = await window.electronAPI.getApiConfig()
      if (config) setApiConfig(config)
    }
    loadData()

    // Menu event listeners
    window.electronAPI.onMenuNewSale(() => {
      clearCart()
    })

    window.electronAPI.onMenuAbout(() => {
      alert('Mini ERP - Point of Sales\nSupermarket Sejahtera\n\nA desktop POS application built with Electron')
    })

    // Focus barcode input
    barcodeInputRef.current?.focus()
  }, [])

  // Save cart whenever it changes
  useEffect(() => {
    window.electronAPI.storeSet('currentCart', cart)
  }, [cart])

  const handleBarcodeInput = (barcode) => {
    if (!barcode) return

    const product = products.find(p => p.barcode === barcode)
    
    if (product) {
      addToCart(product.id)
      return true
    } else {
      alert('Produk tidak ditemukan!')
      return false
    }
  }

  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    if (product.perKg) {
      const weight = prompt(`Masukkan berat ${product.name} (kg):`, '0.5')
      if (!weight || isNaN(weight) || parseFloat(weight) <= 0) return

      setCart(prev => [...prev, {
        id: Date.now(),
        name: `${product.name} (${weight} kg)`,
        price: product.price * parseFloat(weight),
        quantity: 1,
        maxStock: 1
      }])
    } else {
      setCart(prev => {
        const existingIndex = prev.findIndex(item => item.id === productId)
        
        if (existingIndex >= 0) {
          const updated = [...prev]
          if (updated[existingIndex].quantity < product.stock) {
            updated[existingIndex].quantity++
          } else {
            alert('Stok tidak mencukupi!')
            return prev
          }
          return updated
        } else {
          return [...prev, {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxStock: product.stock
          }]
        }
      })
    }
  }

  const changeQuantity = () => {
    if (selectedItemIndex === null) {
      alert('Pilih item terlebih dahulu!')
      return
    }

    const item = cart[selectedItemIndex]
    const newQty = prompt(`Ubah jumlah untuk ${item.name}:`, item.quantity)

    if (newQty && !isNaN(newQty) && parseInt(newQty) > 0) {
      setCart(prev => {
        const updated = [...prev]
        updated[selectedItemIndex].quantity = parseInt(newQty)
        return updated
      })
    }
  }

  const incrementQuantity = (index) => {
    setCart(prev => {
      const updated = [...prev]
      const item = updated[index]
      // Check stock if available
      if (item.stock && item.quantity >= item.stock) {
        alert(`Stok tidak mencukupi! Stok tersedia: ${item.stock}`)
        return prev
      }
      updated[index].quantity++
      return updated
    })
  }

  const decrementQuantity = (index) => {
    setCart(prev => {
      const updated = [...prev]
      if (updated[index].quantity > 1) {
        updated[index].quantity--
        return updated
      } else {
        // Remove item if quantity becomes 0
        if (confirm('Hapus item dari keranjang?')) {
          updated.splice(index, 1)
          if (selectedItemIndex === index) {
            setSelectedItemIndex(null)
          } else if (selectedItemIndex > index) {
            setSelectedItemIndex(selectedItemIndex - 1)
          }
          return updated
        }
      }
      return prev
    })
  }

  const clearAllItems = () => {
    if (cart.length === 0) {
      alert('Keranjang sudah kosong!')
      return
    }

    if (confirm('Hapus semua item dari keranjang?')) {
      setCart([])
      setSelectedItemIndex(null)
      barcodeInputRef.current?.focus()
    }
  }

  const clearCart = () => {
    setCart([])
    setSelectedItemIndex(null)
    barcodeInputRef.current?.focus()
  }

  const inputMember = () => {
    const memberId = prompt('Masukkan ID Member:')
    if (memberId) {
      alert(`Member ${memberId} berhasil ditambahkan!`)
      // TODO: Apply member discount
    }
  }

  const addPlasticBag = (type) => {
    const price = type === 'small' ? posSettings.plasticBagSmallPrice : posSettings.plasticBagLargePrice
    const name = type === 'small' ? 'Kantong Plastik Kecil' : 'Kantong Plastik Besar'
    
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.name === name)
      
      if (existingIndex >= 0) {
        // Increment quantity if already exists
        const updated = [...prev]
        updated[existingIndex].quantity++
        return updated
      } else {
        // Add new item
        return [...prev, {
          id: `plastic_${type}_${Date.now()}`,
          name,
          price,
          quantity: 1,
          isPlasticBag: true
        }]
      }
    })
  }

  const checkout = async (paymentMethod) => {
    if (cart.length === 0) {
      alert('Keranjang kosong!')
      return
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = posSettings.enableTax ? subtotal * (posSettings.taxRate / 100) : 0
    const discount = posSettings.enableDiscount ? subtotal * (posSettings.defaultDiscount / 100) : 0
    const total = Math.round(subtotal + tax - discount)

    let paymentMethodName = ''
    switch(paymentMethod) {
      case 'cash':
        paymentMethodName = 'Tunai (Cash)'
        break
      case 'card':
        paymentMethodName = 'Kartu (EDC)'
        break
      case 'ewallet':
        paymentMethodName = 'QRIS / E-Wallet'
        break
    }

    if (paymentMethod === 'cash') {
      const cashAmount = prompt(`Total: Rp ${formatPrice(total)}\n\nMasukkan jumlah uang tunai:`)
      if (!cashAmount || isNaN(cashAmount) || parseInt(cashAmount) < total) {
        alert('Jumlah uang tidak mencukupi!')
        return
      }

      const change = parseInt(cashAmount) - total
      alert(`Pembayaran berhasil!\n\nTotal: Rp ${formatPrice(total)}\nBayar: Rp ${formatPrice(parseInt(cashAmount))}\nKembalian: Rp ${formatPrice(change)}`)
    } else {
      if (!confirm(`Proses pembayaran dengan ${paymentMethodName}?\n\nTotal: Rp ${formatPrice(total)}`)) {
        return
      }
      alert('Pembayaran berhasil!')
    }

    try {
      const salesHistory = await window.electronAPI.storeGet('salesHistory') || []
      salesHistory.push({
        id: Date.now(),
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: total,
        paymentMethod: paymentMethodName,
        cashier: currentUser?.name || 'Unknown',
        timestamp: new Date().toISOString()
      })
      await window.electronAPI.storeSet('salesHistory', salesHistory)

      clearCart()
    } catch (error) {
      alert('Error processing sale: ' + error.message)
    }
  }

  const formatPrice = (price) => {
    return price.toLocaleString('id-ID')
  }

  const saveSettings = async (config) => {
    await window.electronAPI.setApiConfig(config)
    setApiConfig(config)
    setShowSettings(false)
    alert('Settings saved successfully!')
  }

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    if (confirm('Anda yakin ingin logout?')) {
      await logout()
      setIsLoggedIn(false)
      setCurrentUser(null)
      clearCart()
    }
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-hidden bg-background">
        <div className={`grid h-full gap-3 p-3 transition-all duration-300 ${
          isProductListCollapsed 
            ? 'grid-cols-[auto_1.2fr_1fr]' 
            : 'grid-cols-[1fr_1fr_1fr]'
        }`}>
          <ProductList
            products={products}
            onAddProduct={addToCart}
            formatPrice={formatPrice}
            isCollapsed={isProductListCollapsed}
            onToggleCollapse={() => setIsProductListCollapsed(!isProductListCollapsed)}
          />
          
          <CartItems
            cart={cart}
            selectedItemIndex={selectedItemIndex}
            onSelectItem={setSelectedItemIndex}
            onBarcodeInput={handleBarcodeInput}
            barcodeInputRef={barcodeInputRef}
            formatPrice={formatPrice}
            onIncrementQuantity={incrementQuantity}
            onDecrementQuantity={decrementQuantity}
          />
          
          <div className="flex flex-col gap-3">
            <ActionButtons
              onChangeQty={changeQuantity}
              onClearAll={clearAllItems}
              onInputMember={inputMember}
              onAddPlasticBag={addPlasticBag}
            />
            
            <Summary
              cart={cart}
              formatPrice={formatPrice}
              onCheckout={checkout}
              posSettings={posSettings}
            />
          </div>
        </div>
      </main>

      {showSettings && (
        <SettingsModal
          config={apiConfig}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
