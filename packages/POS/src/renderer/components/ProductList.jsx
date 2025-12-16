import { Card } from './ui/card'
import { Button } from './ui/button'
import { Package2, ChevronLeft, ChevronRight } from 'lucide-react'

function ProductList({ products, onAddProduct, formatPrice, isCollapsed, onToggleCollapse }) {
  return (
    <Card className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-24' : ''}`}>
      <div className="flex items-center justify-center gap-2 p-4 border-b bg-muted/50">
        {!isCollapsed && (
          <>
            <Package2 className="h-5 w-5" />
            <h3 className="font-semibold text-base flex-1">Daftar Produk</h3>
          </>
        )}
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="lg"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          {isCollapsed ? <div className='flex flex-row gap-2 m-auto'><Package2 className="h-6 w-6" /> <ChevronRight className="h-5 w-5" /></div> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/30">
        {isCollapsed ? (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <Button
                key={product.id}
                onClick={() => onAddProduct(product.id)}
                variant="outline"
                className="h-auto p-2 flex flex-col items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors group"
                title={`${product.name} - Rp ${formatPrice(product.price)}`}
              >
                <div className="w-14 h-14 rounded-md  from-primary/20 to-primary/5 flex items-center justify-center border">
                  <Package2 className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <div className="text-[10px] font-medium text-center line-clamp-2 leading-tight w-full">
                  {product.name}
                </div>
                {product.perKg && (
                  <div className="text-[8px] px-1 bg-amber-100 text-amber-700 rounded">
                    /kg
                  </div>
                )}
              </Button>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </Card>
  )
}

export default ProductList
