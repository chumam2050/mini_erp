import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import CartItems from './components/CartItems'
import ProductList from './components/ProductList'
import ActionButtons from './components/ActionButtons'
import Summary from './components/Summary'
import SettingsModal from './components/SettingsModal'
import LoginPage from './pages/LoginPage'
import { isAuthenticated, getCurrentUser, logout } from './utils/auth'
import { getProducts, getPosSettings, createSale } from './utils/api'

function App() {
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
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
          // Fetch POS settings and products
          await fetchPosSettings()
          await fetchProducts()
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const response = await getProducts({ limit: 100 })
      
      if (response.success && response.data) {
        // Map backend product structure to POS format
        const mappedProducts = response.data.products.map(product => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          price: parseFloat(product.price),
          stock: product.stock,
          primaryImage: product.primaryImage,
          barcode: product.sku // Use SKU as barcode for now
        }))
        setProducts(mappedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('Gagal memuat produk: ' + error.message)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Fetch POS settings from backend
  const fetchPosSettings = async () => {
    try {
      const response = await getPosSettings()
      
      if (response) {
        setPosSettings({
          plasticBagSmallPrice: response['pos.plastic_bag_small_price']?.value || 200,
          plasticBagLargePrice: response['pos.plastic_bag_large_price']?.value || 500,
          taxRate: response['pos.tax_rate']?.value || 11,
          defaultDiscount: response['pos.default_discount']?.value || 0,
          enableTax: response['pos.enable_tax']?.value !== false,
          enableDiscount: response['pos.enable_discount']?.value !== false
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

    // Focus barcode input on load
    setTimeout(() => {
      barcodeInputRef.current?.focus()
    }, 100)

    // Global keyboard handler for barcode scanner
    let scannerBuffer = ''
    let scannerTimeout = null
    
    const handleKeyDown = (e) => {
      // Don't interfere with typing in the barcode input itself
      if (e.target === barcodeInputRef.current) {
        return
      }
      
      // Ignore if typing in other inputs/textareas
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        return
      }
      
      // If not focused on barcode input and it's a printable character, focus the input
      if (e.key.length === 1 && barcodeInputRef.current) {
        barcodeInputRef.current.focus()
        // Don't prevent default - let the character go through to the input
      }
    }

    // Re-focus barcode input when clicking anywhere in the app (except inputs/buttons)
    const handleGlobalClick = (e) => {
      // Don't refocus if clicking on input, button, or interactive elements
      const target = e.target
      const isInteractive = target.tagName === 'INPUT' || 
                           target.tagName === 'BUTTON' || 
                           target.tagName === 'TEXTAREA' ||
                           target.closest('button') ||
                           target.closest('input') ||
                           target.closest('[role="button"]')
      
      if (!isInteractive && barcodeInputRef.current) {
        setTimeout(() => {
          barcodeInputRef.current?.focus()
        }, 50)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleGlobalClick)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleGlobalClick)
      if (scannerTimeout) clearTimeout(scannerTimeout)
    }
  }, [isLoggedIn])

  // Save cart whenever it changes
  useEffect(() => {
    window.electronAPI.storeSet('currentCart', cart)
  }, [cart])

  const handleBarcodeInput = (barcode) => {
    console.log('handleBarcodeInput called with:', barcode)
    
    if (!barcode) {
      console.log('Barcode is empty, returning')
      return
    }

    console.log('Searching in products:', products.length, 'products')
    const product = products.find(p => {
      const found = p.barcode === barcode || p.sku === barcode
      if (found) console.log('Product found:', p)
      return found
    })
    
    if (product) {
      console.log('Adding product to cart:', product.name)
      addToCart(product.id)
      // Refocus after adding to cart
      setTimeout(() => {
        barcodeInputRef.current?.focus()
      }, 100)
      return true
    } else {
      console.log('Product not found for barcode:', barcode)
      console.log('Available SKUs:', products.map(p => p.sku || p.barcode).join(', '))
      alert('Produk tidak ditemukan!')
      // Refocus after alert
      setTimeout(() => {
        barcodeInputRef.current?.focus()
      }, 100)
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
    const discountAmount = posSettings.enableDiscount ? subtotal * (posSettings.defaultDiscount / 100) : 0
    const tax = posSettings.enableTax ? (subtotal - discountAmount) * (posSettings.taxRate / 100) : 0
    const total = Math.round(subtotal + tax - discountAmount)

    let amountPaid = total

    if (paymentMethod === 'cash') {
      const cashAmount = prompt(`Total: Rp ${formatPrice(total)}\n\nMasukkan jumlah uang tunai:`)
      if (!cashAmount || isNaN(cashAmount) || parseInt(cashAmount) < total) {
        alert('Jumlah uang tidak mencukupi!')
        return
      }
      amountPaid = parseInt(cashAmount)

      const change = amountPaid - total
      alert(`Pembayaran berhasil!\n\nTotal: Rp ${formatPrice(total)}\nBayar: Rp ${formatPrice(amountPaid)}\nKembalian: Rp ${formatPrice(change)}`)
    } else {
      const paymentMethodName = paymentMethod === 'card' ? 'Kartu (EDC)' : 'QRIS / E-Wallet'
      if (!confirm(`Proses pembayaran dengan ${paymentMethodName}?\n\nTotal: Rp ${formatPrice(total)}`)) {
        return
      }
      alert('Pembayaran berhasil!')
    }

    try {
      // Prepare sale data for backend
      const saleData = {
        items: cart.filter(item => !item.isPlasticBag).map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: 0,
          discountType: 'fixed'
        })),
        discount: posSettings.defaultDiscount,
        discountType: 'percentage',
        taxRate: posSettings.taxRate,
        paymentMethod: paymentMethod,
        amountPaid: amountPaid,
        notes: cart.some(item => item.isPlasticBag) 
          ? `Kantong plastik: ${cart.filter(item => item.isPlasticBag).map(item => `${item.name} (${item.quantity})`).join(', ')}`
          : null
      }

      // Send sale to backend
      const response = await createSale(saleData)
      
      if (response.success) {
        console.log('Sale created successfully:', response.data)
        
        // Print receipt
        try {
          const receiptData = {
            saleNumber: response.data.saleNumber,
            items: cart.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            subtotal: subtotal,
            discount: discountAmount,
            tax: tax,
            total: total,
            paymentMethod: paymentMethod,
            amountPaid: amountPaid,
            change: amountPaid - total,
            cashier: currentUser?.name || 'Unknown'
          }
          
          await window.electronAPI.printReceipt(receiptData)
          console.log('Receipt printed')
        } catch (printError) {
          console.error('Error printing receipt:', printError)
          // Don't fail the whole transaction if printing fails
        }
        
        // Update local stock
        const updatedProducts = [...products]
        cart.forEach(cartItem => {
          if (!cartItem.isPlasticBag) {
            const productIndex = updatedProducts.findIndex(p => p.id === cartItem.id)
            if (productIndex >= 0) {
              updatedProducts[productIndex].stock -= cartItem.quantity
            }
          }
        })
        setProducts(updatedProducts)
        
        // Clear cart
        clearCart()
      } else {
        throw new Error(response.message || 'Failed to create sale')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error memproses transaksi: ' + error.message)
    }
  }

  const formatPrice = (price) => {
    return price.toLocaleString('id-ID')
  }

  const closeSettings = () => {
    setShowSettings(false)
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
            isLoading={isLoadingProducts}
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
          onClose={closeSettings}
        />
      )}
    </div>
  )
}

export default App
