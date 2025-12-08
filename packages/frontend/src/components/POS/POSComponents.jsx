import { useState, useEffect } from 'react'
import { ShoppingCart, Minus, Plus, X, Package, Grid3X3, List, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

const ProductGrid = ({ 
  products, 
  onAddToCart, 
  searchTerm, 
  onSearchChange,
  category,
  onCategoryChange,
  isLoading,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const categories = [...new Set(products.map(p => p.category))]

  return (
    <div className="space-y-4 min-h-full">
      {/* Search, Filter, and View Toggle */}
      <div className="flex gap-4 items-center p-1">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
        <div className="relative">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
        
        {/* View Toggle */}
        <div className="flex border border-border rounded-md">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'} hover:bg-accent hover:text-accent-foreground transition-colors`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'} hover:bg-accent hover:text-accent-foreground transition-colors`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Product Grid/List */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4" 
            : "space-y-1 pb-4"
          }>
          {products.map(product => (
            viewMode === 'grid' ? (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden"
                onClick={() => onAddToCart(product)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    {product.primaryImage ? (
                      <img 
                        src={product.primaryImage} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-48 bg-gray-100 flex items-center justify-center"
                      style={{ display: product.primaryImage ? 'none' : 'flex' }}
                    >
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                    <Badge 
                      variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "destructive" : "outline"} 
                      className="absolute top-3 right-3 text-xs font-semibold"
                    >
                      {product.stock}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">{product.category}</span>
                      <span className="font-bold text-xl text-foreground">
                        ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // List View
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onAddToCart(product)}
              >
                <CardContent className="p-2">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0">
                      {product.primaryImage ? (
                        <img 
                          src={product.primaryImage} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-12 h-12 bg-muted flex items-center justify-center rounded"
                        style={{ display: product.primaryImage ? 'none' : 'flex' }}
                      >
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                          <p className="text-xs text-muted-foreground mb-1">{product.sku}</p>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{product.category}</span>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <Badge 
                            variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "destructive" : "outline"} 
                            className="text-xs font-semibold mb-1"
                          >
                            {product.stock}
                          </Badge>
                          <div className="font-bold text-sm text-foreground">
                            ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
        )}
      </div>
    </div>
  )
}

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1 truncate text-foreground">{item.name}</h4>
        <p className="text-xs text-muted-foreground mb-1">{item.sku}</p>
        <p className="text-sm font-semibold text-foreground">
          ${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="h-7 w-7 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="w-8 text-center text-sm font-semibold">
          {item.quantity}
        </span>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          className="h-7 w-7 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Total Price */}
      <div className="text-right min-w-[80px] flex-shrink-0">
        <p className="text-sm font-bold text-foreground">
          ${(item.quantity * Number(item.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
      </div>
      
      {/* Remove Button */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(item.id)}
          className="p-1 h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-3 w-3" />
        </Button>
        <span className="text-xs text-destructive font-medium">Hapus</span>
      </div>
    </div>
  )
}

const Cart = ({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  discount,
  discountType,
  taxRate,
  onDiscountChange,
  onDiscountTypeChange,
  onTaxRateChange
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * Number(item.price)), 0)
  
  const calculateDiscount = () => {
    if (discount <= 0) return 0
    return discountType === 'percentage' ? subtotal * (discount / 100) : discount
  }
  
  const discountAmount = calculateDiscount()
  const afterDiscount = subtotal - discountAmount
  const tax = afterDiscount * (taxRate / 100)
  const total = afterDiscount + tax

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-bold text-lg text-foreground">Cart ({items.length})</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)]">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-base">Cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add products to start a sale</p>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Discount and Tax */}
        {items.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Discount"
                value={discount}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <div className="relative">
                <select
                  value={discountType}
                  onChange={(e) => onDiscountTypeChange(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input min-w-[60px]"
                >
                  <option value="fixed">$</option>
                  <option value="percentage">%</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <span className="py-2 text-sm text-muted-foreground">Tax Rate (%):</span>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Totals */}
        {items.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex justify-between text-base text-foreground">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-base text-destructive">
                <span>Discount:</span>
                <span className="font-semibold">-${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {tax > 0 && (
              <div className="flex justify-between text-base text-foreground">
                <span>Tax ({taxRate}%):</span>
                <span className="font-semibold">${tax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-xl pt-2 border-t border-border text-foreground">
              <span>Total:</span>
              <span className="text-foreground">${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>

            <Button 
              onClick={onCheckout} 
              className="w-full mt-4 h-10 text-base font-semibold"
              disabled={items.length === 0}
            >
              Checkout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ProductGrid, Cart }