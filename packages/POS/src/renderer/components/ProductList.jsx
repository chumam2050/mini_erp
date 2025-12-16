import { Card } from './ui/card'
import { Button } from './ui/button'
import { Package2, ChevronLeft, ChevronRight } from 'lucide-react'

function ProductList({ products, onAddProduct, formatPrice, isCollapsed, onToggleCollapse }) {
  return (
    <Card className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-14' : ''}`}>
      <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
        {!isCollapsed && (
          <>
            <Package2 className="h-5 w-5" />
            <h3 className="font-semibold text-base flex-1">Daftar Produk</h3>
          </>
        )}
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <Button
                key={product.id}
                onClick={() => onAddProduct(product.id)}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <div className="w-full">
                  <div className="font-semibold text-sm text-left line-clamp-2">
                    {product.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-left">
                    {product.barcode}
                  </div>
                </div>
                <div className="w-full flex items-center justify-between">
                  <span className="font-bold text-base text-primary">
                    Rp {formatPrice(product.price)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    Stok: {product.stock}
                  </span>
                </div>
                {product.perKg && (
                  <div className="text-xs text-amber-600 font-medium">
                    Per Kilogram
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default ProductList
