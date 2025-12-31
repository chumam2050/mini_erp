import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import CartItems from './components/CartItems'
import ProductList from './components/ProductList'
import ActionButtons from './components/ActionButtons'
import Summary from './components/Summary'
import SettingsModal from './components/SettingsModal'
import ShortcutsModal from './components/ShortcutsModal'
import PaymentResultModal from './components/PaymentResultModal'
import ConfirmModal from './components/ConfirmModal'
import ProcessingModal from './components/ProcessingModal'
import Toaster from './components/Toaster'
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
    enableDiscount: true,
    // default cash shortcut buttons (will be overridden by device config if present)
    cashShortcuts: [2000, 5000, 10000, 20000, 50000, 100000]
  })
  const barcodeInputRef = useRef(null)
  const cashInputRef = useRef(null)
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
  const [showShortcuts, setShowShortcuts] = useState(false)

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
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', message: 'Gagal memuat produk: ' + error.message, timeout: 6000 } }))
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Fetch POS settings from backend
  const fetchPosSettings = async () => {
    try {
      const response = await getPosSettings()
      
      if (response) {
        const newSettings = {
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
        }
        // Merge with existing settings so we don't overwrite device-specific values like cashShortcuts
        setPosSettings(prev => ({ ...prev, ...newSettings }))
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

      // Load device config (cash shortcut buttons) if present
      try {
        const deviceConfig = await window.electronAPI.getDeviceConfig()
        if (deviceConfig && deviceConfig.cashShortcuts) {
          let shortcuts = deviceConfig.cashShortcuts
          if (typeof shortcuts === 'string') {
            shortcuts = shortcuts.split(',').map(s => parseInt(s.trim())).filter(Boolean)
          }
          setPosSettings(prev => ({ ...prev, cashShortcuts: shortcuts }))
        }
      } catch (err) {
        console.error('Error loading device config:', err)
      }
    }
    loadData()

    // Menu event listeners
    window.electronAPI.onMenuNewSale(() => {
      clearCart()
    })

    window.electronAPI.onMenuAbout(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'info', message: 'Mini ERP - Point of Sales', timeout: 3000 } }))
    })

    window.electronAPI.onMenuShortcuts(() => {
      setShowShortcuts(true)
    })

    // Listener for when device config updates (e.g. cash shortcuts changed from Settings)
    const handleDeviceConfigUpdated = async (e) => {
      try {
        let shortcuts = null
        // Prefer event payload if provided
        if (e && e.detail && e.detail.cashShortcuts) {
          shortcuts = e.detail.cashShortcuts
          console.log('Received device-config-updated event with payload:', shortcuts)
        } else {
          const deviceConfig = await window.electronAPI.getDeviceConfig()
          shortcuts = deviceConfig?.cashShortcuts
          console.log('Fetched device config after update, cashShortcuts:', shortcuts)
        }

        if (shortcuts) {
          if (typeof shortcuts === 'string') {
            shortcuts = shortcuts.split(',').map(s => parseInt(s.trim())).filter(Boolean)
          } else if (Array.isArray(shortcuts)) {
            shortcuts = shortcuts.map(s => parseInt(s)).filter(Boolean)
          }
          console.log('Updating cash shortcuts to:', shortcuts)
          setPosSettings(prev => ({ ...prev, cashShortcuts: shortcuts }))
        } else {
          console.log('No cashShortcuts found in device config update')
        }
      } catch (err) {
        console.error('Error reloading device config:', err)
      }
    }
    window.addEventListener('device-config-updated', handleDeviceConfigUpdated)

    // Focus barcode input on load
    setTimeout(() => {
      barcodeInputRef.current?.focus()
    }, 100)

    // Global keyboard handler for barcode scanner
    let scannerBuffer = ''
    let scannerTimeout = null
    
    const handleKeyDown = (e) => {
      // Shortcut: Ctrl+T (or F9) focuses the cash input (Tunai)
      if ((e.ctrlKey && e.key.toLowerCase() === 't') || e.key === 'F9') {
        e.preventDefault()
        cashInputRef.current?.focus()
        if (cashInputRef.current?.select) cashInputRef.current.select()
        return
      }

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
      window.removeEventListener('device-config-updated', handleDeviceConfigUpdated)
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
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', message: 'Stok tidak mencukupi!', timeout: 4000 } }))
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
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'warning', message: 'Pilih item terlebih dahulu!', timeout: 3000 } }))
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
      const item = { ...updated[index] }
      if (!item) return prev

      console.log('Incrementing quantity for item at index', index, 'current quantity:', item.quantity)

      // Check stock if available
      if (item.stock && item.quantity >= item.stock) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'warning', message: `Stok tidak mencukupi! Stok tersedia: ${item.stock}`, timeout: 4000 } }))
        return prev
      }
      item.quantity++
      updated[index] = item
      return updated
    })
  }

  const decrementQuantity = async (index) => {
    const item = {...cart[index]}
    if (!item) return

    if (item.quantity > 1) {
      item.quantity--
      setCart(prev => {
        const updated = [...prev]
        updated[index] = {...item}
        return updated
      })
      return
    }

    // If quantity == 1, ask confirmation before removing
    const ok = await showConfirm('Hapus item dari keranjang?')
    if (ok) {
      setCart(prev => {
        const updated = [...prev]
        updated.splice(index, 1)
        return updated
      })

      if (selectedItemIndex === index) {
        setSelectedItemIndex(null)
      } else if (selectedItemIndex > index) {
        setSelectedItemIndex(selectedItemIndex - 1)
      }
    }
  }

  const clearAllItems = async () => {
    if (cart.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'warning', message: 'Keranjang sudah kosong!', timeout: 3000 } }))
      return
    }

    const ok = await showConfirm('Hapus semua item dari keranjang?')
    if (ok) {
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
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'success', message: `Member ${memberId} berhasil ditambahkan!`, timeout: 3000 } }))
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

  const [paymentResult, setPaymentResult] = useState(null)
  const [isProcessingSale, setIsProcessingSale] = useState(false)

  const closePaymentResult = () => {
    setPaymentResult(null)
  }

  // Global confirmation modal state + helper
  const [confirmState, setConfirmState] = useState({ visible: false, title: '', message: '', resolver: null })

  const showConfirm = (message, title = 'Konfirmasi') => {
    return new Promise((resolve) => {
      setConfirmState({ visible: true, title, message, resolver: resolve })
    })
  }

  const handleConfirm = (value) => {
    try {
      confirmState.resolver?.(value)
    } catch (e) {
      console.error('confirm resolve error', e)
    }
    setConfirmState({ visible: false, title: '', message: '', resolver: null })
  }

  const checkout = async (paymentMethod, amountFromSummary = null) => {
    if (cart.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'warning', message: 'Keranjang kosong!', timeout: 3000 } }))
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
          window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', message: 'Jumlah uang tidak mencukupi!', timeout: 4000 } }))
          return false
        }
        amountPaid = parseInt(cashAmount)
      }

      // remove immediate alert — show modal after successful sale
    } else {
      const paymentMethodName = paymentMethod === 'card' ? 'Kartu (EDC)' : 'QRIS / E-Wallet'
      if (!(await showConfirm(`Proses pembayaran dengan ${paymentMethodName}?\n\nTotal: Rp ${formatPrice(total)}`))) {
        return false
      }
      // remove immediate alert — show modal after successful sale
    }

    setIsProcessingSale(true)
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
        
        // Build receipt data (always create so reprint is possible)
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

        // Check device config to see if auto-print is enabled
        try {
          const deviceCfg = await window.electronAPI.getDeviceConfig()
          const autoPrint = deviceCfg?.autoPrintReceipt !== false

          if (autoPrint) {
            try {
              await window.electronAPI.printReceipt(receiptData)
              console.log('Receipt printed automatically')
            } catch (printError) {
              console.error('Error printing receipt automatically:', printError)
              // don't fail the sale; user can reprint manually
            }
          }

          // Show payment result modal with reprint action (receiptData provided regardless)
          setPaymentResult({ total, paid: amountPaid, change: amountPaid - total, receiptData })
        } catch (err) {
          console.error('Error checking device config or printing:', err)
          // still show result
          setPaymentResult({ total, paid: amountPaid, change: amountPaid - total, receiptData })
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
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', message: 'Error memproses transaksi: ' + error.message, timeout: 6000 } }))
      return false
    } finally {
      setIsProcessingSale(false)
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
    const ok = await showConfirm('Anda yakin ingin logout?')
    if (ok) {
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
        onShortcutsClick={() => setShowShortcuts(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      <Toaster />

      {confirmState.visible && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={() => handleConfirm(true)}
          onCancel={() => handleConfirm(false)}
        />
      )}

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
              onAddProduct={(productId) => addToCart(productId)}
              products={products}
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
              cashInputRef={cashInputRef}
              isProcessing={isProcessingSale}
            />

            {paymentResult && (
              <PaymentResultModal
                total={paymentResult.total}
                paid={paymentResult.paid}
                change={paymentResult.change}
                onClose={closePaymentResult}
                onReprint={paymentResult.receiptData ? async () => { try { await window.electronAPI.printReceipt(paymentResult.receiptData); window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'success', message: 'Reprint sukses', timeout: 3000 } })); } catch (e) { window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', message: 'Reprint gagal: ' + e.message, timeout: 6000 } })); } } : null }
              />
            )}

            {isProcessingSale && (
              <ProcessingModal />
            )}
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
