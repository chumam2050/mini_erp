import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import { ProductGrid, Cart } from '../components/POS/POSComponents'
import CheckoutModal from '../components/POS/CheckoutModal'

const POSPage = () => {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'grid' or 'list'
  
  // Sale calculations
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState('fixed')
  const [taxRate, setTaxRate] = useState(10) // Default 10% tax

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, category])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        limit: '50'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (category) params.append('category', category)

      const response = await fetch(`/api/pos/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.data.products)
      } else {
        throw new Error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Cannot add more items. Insufficient stock.')
        return
      }
      updateCartItemQuantity(product.id, existingItem.quantity + 1)
    } else {
      setCartItems(prev => [...prev, {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }])
      toast.success(`${product.name} added to cart`)
    }
  }

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, quantity: Math.min(newQuantity, item.stock) }
        : item
    ))
  }

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
    toast.success('Item removed from cart')
  }

  const clearCart = () => {
    setCartItems([])
    setDiscount(0)
    setDiscountType('fixed')
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setIsCheckoutOpen(true)
  }

  const handleConfirmSale = async (saleData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Sale completed! Sale #${result.data.saleNumber}`)
        clearCart()
        // Refresh products to update stock
        fetchProducts()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to complete sale')
      }
    } catch (error) {
      console.error('Error completing sale:', error)
      toast.error(error.message || 'Failed to complete sale')
      throw error
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * Number(item.price)), 0)
  const discountAmount = discount > 0 
    ? (discountType === 'percentage' ? subtotal * (discount / 100) : discount)
    : 0
  const afterDiscount = subtotal - discountAmount
  const tax = afterDiscount * (taxRate / 100)
  const total = afterDiscount + tax

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {/* Products Grid */}
          <div className="lg:col-span-3 overflow-hidden rounded-lg">
            <ProductGrid
              products={products}
              onAddToCart={addToCart}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              category={category}
              onCategoryChange={setCategory}
              isLoading={isLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Cart */}
          <div className="lg:col-span-2">
            <Cart
              items={cartItems}
              onUpdateQuantity={updateCartItemQuantity}
              onRemove={removeFromCart}
              onCheckout={handleCheckout}
              discount={discount}
              discountType={discountType}
              taxRate={taxRate}
              onDiscountChange={setDiscount}
              onDiscountTypeChange={setDiscountType}
              onTaxRateChange={setTaxRate}
            />
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        subtotal={subtotal}
        discount={discount}
        discountType={discountType}
        tax={tax}
        taxRate={taxRate}
        total={total}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  )
}

export default POSPage