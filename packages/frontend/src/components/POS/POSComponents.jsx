import { useState, useEffect } from 'react'
import { ShoppingCart, Minus, Plus, X, Package } from 'lucide-react'
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
  isLoading 
}) => {
  const categories = [...new Set(products.map(p => p.category))]

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map(product => (
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
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-40 bg-gray-100 flex items-center justify-center"
                    style={{ display: product.primaryImage ? 'none' : 'flex' }}
                  >
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <Badge 
                    variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "destructive" : "outline"} 
                    className="absolute top-2 right-2 text-xs font-semibold"
                  >
                    {product.stock}
                  </Badge>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">{product.category}</span>
                    <span className="font-bold text-lg text-green-600">
                      ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center gap-3 p-3 border-b">
      <div className="flex-1">
        <h4 className="font-medium text-sm">{item.name}</h4>
        <p className="text-xs text-gray-500">{item.sku}</p>
        <p className="text-sm font-semibold text-green-600">
          ${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="text-right">
        <p className="text-sm font-medium">
          ${(item.quantity * Number(item.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(item.id)}
          className="p-1 h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
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
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold">Cart ({items.length})</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Cart is empty</p>
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
          <div className="space-y-3 pt-4 border-t">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Discount"
                value={discount}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <select
                value={discountType}
                onChange={(e) => onDiscountTypeChange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="fixed">$</option>
                <option value="percentage">%</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <span className="py-2 text-sm">Tax Rate (%):</span>
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
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span>${tax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>

            <Button 
              onClick={onCheckout} 
              className="w-full mt-4"
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