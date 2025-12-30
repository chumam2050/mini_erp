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
  const [apiConfig, setApiConfig] = useState({})
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
  // Simple in-app prompt modal state + helper (replaces window.prompt which isn't supported)
  const [promptState, setPromptState] = useState({ visible: false, title: '', defaultValue: '' })
  const promptResolverRef = useRef(null)

  const showPrompt = (title, defaultValue = '') => {
    return new Promise(resolve => {
      promptResolverRef.current = resolve
      setPromptState({ visible: true, title, defaultValue })
      // focus input next tick
      setTimeout(() => {
        const inputEl = document.getElementById('app-prompt-input')
        inputEl?.focus()
        inputEl?.select()
      }, 50)
    })
  }

  const closePrompt = (value) => {
    const resolver = promptResolverRef.current
    if (resolver) resolver(value)
    promptResolverRef.current = null
    setPromptState({ visible: false, title: '', defaultValue: '' })
  }

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
      const response = await getProducts({ limit: 5000 })
      
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
          enableDiscount: response['pos.enable_discount']?.value !== false,
          store: {
            name: response['store.name']?.value || 'Mini ERP Store',
            address: response['store.address']?.value || '',
            phone: response['store.phone']?.value || '',
            email: response['store.email']?.value || '',
          }
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
      alert('Mini ERP - Point of Sales')
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
      return true
    } else {
      console.log('Product not found for barcode:', barcode)
      console.log('Available SKUs:', products.map(p => p.sku || p.barcode).join(', '))
      // Refocus after alert
      setTimeout(() => {
        barcodeInputRef.current?.focus()
      }, 1000)
      return false
    }
  }

  const addToCart = async (productId) => {
    const product = products.find(p => p.id === productId)
    
    if (!product) return

    if (product.perKg) {
      const weight = await showPrompt(`Masukkan berat ${product.name} (kg):`, '0.5')
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
          // Prevent duplicate increments by checking lastAddTimesRef inside the state update
          const updated = [...prev]
          if (updated[existingIndex].quantity < product.stock) {
            console.log('Incrementing quantity for product', productId, 'from', updated[existingIndex].quantity, 'to', updated[existingIndex].quantity + 1)
            updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + 1 }
          } else {
            alert('Stok tidak mencukupi!')
            return prev
          }
          return updated
        } else {
          // For new items, also record to avoid immediate duplicate adds
          console.log('Adding product to cart (new):', product.name, productId)
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

  const changeQuantity = async () => {
    if (selectedItemIndex === null) {
      alert('Pilih item terlebih dahulu!')
      return
    }

    const item = cart[selectedItemIndex]
    const newQty = await showPrompt(`Ubah jumlah untuk ${item.name}:`, item.quantity)

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

  const inputMember = async () => {
    const memberId = await showPrompt('Masukkan ID Member:')
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

  const checkout = async (paymentMethod, amountFromSummary = null) => {
    if (cart.length === 0) {
      alert('Keranjang kosong!')
      return false
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const discountAmount = posSettings.enableDiscount ? subtotal * (posSettings.defaultDiscount / 100) : 0
    const tax = posSettings.enableTax ? (subtotal - discountAmount) * (posSettings.taxRate / 100) : 0
    const total = Math.round(subtotal + tax - discountAmount)

    let amountPaid = total

    if (paymentMethod === 'cash') {
      if (amountFromSummary && !isNaN(amountFromSummary) && parseInt(amountFromSummary) >= total) {
        amountPaid = parseInt(amountFromSummary)
      } else {
        const cashAmount = await showPrompt(`Total: Rp ${formatPrice(total)}\n\nMasukkan jumlah uang tunai:`)
        if (!cashAmount || isNaN(cashAmount) || parseInt(cashAmount) < total) {
          alert('Jumlah uang tidak mencukupi!')
          return false
        }
        amountPaid = parseInt(cashAmount)
      }

      const change = amountPaid - total
      alert(`Pembayaran berhasil!\n\nTotal: Rp ${formatPrice(total)}\nBayar: Rp ${formatPrice(amountPaid)}\nKembalian: Rp ${formatPrice(change)}`)
    } else {
      const paymentMethodName = paymentMethod === 'card' ? 'Kartu (EDC)' : 'QRIS / E-Wallet'
      if (!confirm(`Proses pembayaran dengan ${paymentMethodName}?\n\nTotal: Rp ${formatPrice(total)}`)) {
        return false
      }
      alert('Pembayaran berhasil!')
    }

    try {
      // Prepare sale data for backend
      const saleData = {
        items: cart.map(item => {
          if (item.isPlasticBag) {
            return {
              productId: null,
              productName: item.name,
              productSku: null,
              quantity: item.quantity,
              unitPrice: item.price,
              discount: 0,
              discountType: 'fixed'
            }
          }

          return {
            productId: item.id,
            productName: item.name,
            productSku: item.sku || null,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: 0,
            discountType: 'fixed'
          }
        }),
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
            cashier: currentUser?.name || 'Unknown',
            settings: posSettings
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
        return true
      } else {
        throw new Error(response.message || 'Failed to create sale')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error memproses transaksi: ' + error.message)
      return false
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
        <div className={`grid grid-cols-3 h-full gap-3 p-3 transition-all duration-300`}>
          <div className='flex w-full col-span-2'>
            <CartItems
              className={`w-full`}
              cart={cart}
              selectedItemIndex={selectedItemIndex}
              onSelectItem={setSelectedItemIndex}
              onBarcodeInput={handleBarcodeInput}
              barcodeInputRef={barcodeInputRef}
              formatPrice={formatPrice}
              onIncrementQuantity={incrementQuantity}
              onDecrementQuantity={decrementQuantity}
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <ActionButtons
              onChangeQty={changeQuantity}
              onClearAll={clearAllItems}
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

      {/* In-app prompt modal (replaces window.prompt) */}
      {promptState.visible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => closePrompt(null)}></div>

          <div className="bg-card text-foreground rounded shadow p-4 z-10 w-96">
            <div className="mb-2 font-semibold">{promptState.title}</div>
            <input
              id="app-prompt-input"
              defaultValue={promptState.defaultValue}
              className="w-full border rounded p-2 mb-3 text-black"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  closePrompt(e.target.value)
                } else if (e.key === 'Escape') {
                  closePrompt(null)
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button className="py-1 px-3 border rounded" onClick={() => closePrompt(null)}>Batal</button>
              <button className="py-1 px-3 bg-primary text-white rounded" onClick={() => { const v = document.getElementById('app-prompt-input')?.value || ''; closePrompt(v) }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal
          onClose={closeSettings}
        />
      )}
    </div>
  )
}

export default App
