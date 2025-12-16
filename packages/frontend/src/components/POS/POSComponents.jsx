import React, { useState, useEffect } from 'react';
import { Plus, Minus, X, Grid3X3, List, ShoppingCart, Search, Filter, Loader2 } from 'lucide-react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

// Custom inline styles for scrollbar
const scrollbarStyles = `
  .ps__rail-y {
    opacity: 0 !important;
    transition: opacity 0.2s ease-in-out !important;
  }
  .ps:hover .ps__rail-y {
    opacity: 1 !important;
  }
  .ps__thumb-y {
    background-color: rgb(156 163 175 / 0.6) !important;
    width: 4px !important;
    border-radius: 2px !important;
  }
  .dark .ps__thumb-y {
    background-color: rgb(229 231 235 / 0.6) !important;
  }
  .ps__rail-x {
    display: none !important;
  }
`;

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  total, 
  onCheckout,
  isProcessing 
}) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - total) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(amountPaid) >= total) {
      onCheckout({
        amountPaid: parseFloat(amountPaid),
        change,
        paymentMethod
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Checkout</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="digital_wallet">Digital Wallet</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Total Amount
            </label>
            <div className="text-2xl font-bold text-foreground">
              Rp {total.toLocaleString('id-ID')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount Paid
            </label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              min={total}
              step="0.01"
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>

          {amountPaid && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Change
              </label>
              <div className="text-xl font-semibold text-foreground">
                Rp {change.toLocaleString('id-ID')}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <button
            type="submit"
            disabled={!amountPaid || parseFloat(amountPaid) < total || isProcessing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Complete Sale'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ProductGrid = ({ 
  products, 
  onAddToCart, 
  viewMode, 
  onViewModeChange, 
  searchTerm, 
  onSearchChange, 
  category, 
  onCategoryChange, 
  isLoading 
}) => {
  // Inject custom scrollbar styles only once
  useEffect(() => {
    const existingStyle = document.getElementById('perfect-scrollbar-custom');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'perfect-scrollbar-custom';
      style.textContent = scrollbarStyles;
      document.head.appendChild(style);
    }
  }, []); // Empty dependency array to run only once

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm ? (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    const matchesCategory = category && category !== 'all' ? product.category === category : true;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  };

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

  const handleImageError = (e, fallbackAttempted = false) => {
    if (!fallbackAttempted) {
      e.target.onerror = () => handleImageError(e, true);
      e.target.src = placeholderImage;
    } else {
      // Hide image completely if even placeholder fails
      e.target.style.display = 'none';
      const parent = e.target.parentElement;
      if (parent) {
        parent.style.backgroundColor = 'rgb(156 163 175)';
        parent.style.display = 'flex';
        parent.style.alignItems = 'center';
        parent.style.justifyContent = 'center';
        parent.innerHTML = '<span style="color: white; font-size: 12px;">No Image</span>';
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header with Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PerfectScrollbar
          options={{
            suppressScrollX: true,
            wheelPropagation: false
          }}
          className="h-[500px] pr-2"
        >
          {filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground/70">
                  Try adjusting your search or category filter
                </p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
              viewMode === 'list' ? 'flex items-center space-x-4 p-3' : 'p-4'
            }`}
            onClick={() => onAddToCart(product)}
          >
            {getImageUrl(product.primaryImage) ? (
              <img
                src={getImageUrl(product.primaryImage)}
                alt={product.name}
                className={`object-cover bg-muted ${viewMode === 'list' ? 'w-16 h-16 rounded-lg flex-shrink-0' : 'w-full h-32 mb-3'}`}
                onError={(e) => handleImageError(e)}
                loading="lazy"
              />
            ) : (
              <div className={`bg-muted flex items-center justify-center ${viewMode === 'list' ? 'w-16 h-16 rounded-lg flex-shrink-0' : 'w-full h-32 mb-3'}`}>
                <span className="text-muted-foreground text-xs">No Image</span>
              </div>
            )}
            <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
              <h3 className="font-medium text-foreground mb-1 text-sm line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                SKU: {product.sku}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Rp {parseInt(product.price).toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          </div>
        ))}
            </div>
          )}
        </PerfectScrollbar>
      )}
    </div>
  );
};

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const itemTotal = parseFloat(item.price) * item.quantity;
  
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-border">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">
          {item.name}
        </h4>
        <p className="text-xs text-muted-foreground">
          Rp {parseInt(item.price).toLocaleString('id-ID')} each
        </p>
        <p className="text-sm font-semibold text-foreground mt-1">
          Rp {itemTotal.toLocaleString('id-ID')}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm text-foreground">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <Plus size={14} />
        </button>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-1 text-destructive hover:text-destructive/80"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const Cart = ({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  discount = 0,
  discountType = 'fixed',
  taxRate = 10,
  onDiscountChange,
  onDiscountTypeChange,
  onTaxRateChange
}) => {
  // Calculate totals with discount and tax
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const discountAmount = discount > 0 
    ? (discountType === 'percentage' ? subtotal * (discount / 100) : discount)
    : 0;
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + tax;

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <ShoppingCart size={20} className="mr-2" />
          Cart ({items.length})
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Your cart is empty
        </p>
      ) : (
        <>
          <PerfectScrollbar
            options={{
              suppressScrollX: true,
              wheelPropagation: false
            }}
            className="max-h-[400px] mb-4"
          >
            <div>
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </PerfectScrollbar>

          {/* Discount and Tax Controls */}
          <div className="border-t border-border pt-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Discount
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => onDiscountChange?.(Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => onDiscountTypeChange?.(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">%</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange?.(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-foreground">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="text-destructive">-Rp {discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%):</span>
              <span className="text-foreground">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-xl font-bold text-foreground">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={onCheckout}
              disabled={items.length === 0}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export { ProductGrid, Cart };