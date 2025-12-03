import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import Navbar from '@/components/Navbar'
import { Plus, Search, Package, TrendingDown, DollarSign, Box } from 'lucide-react'

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Sample data
  const products = [
    { id: 1, name: 'Laptop Dell XPS 13', sku: 'LPT-001', category: 'Electronics', stock: 45, price: 15000000, status: 'In Stock' },
    { id: 2, name: 'iPhone 15 Pro', sku: 'PHN-002', category: 'Electronics', stock: 12, price: 18000000, status: 'Low Stock' },
    { id: 3, name: 'Office Chair Pro', sku: 'FRN-003', category: 'Furniture', stock: 88, price: 2500000, status: 'In Stock' },
    { id: 4, name: 'Standing Desk', sku: 'FRN-004', category: 'Furniture', stock: 5, price: 4500000, status: 'Low Stock' },
    { id: 5, name: 'Mechanical Keyboard', sku: 'ACC-005', category: 'Accessories', stock: 0, price: 1200000, status: 'Out of Stock' },
    { id: 6, name: 'Wireless Mouse', sku: 'ACC-006', category: 'Accessories', stock: 156, price: 350000, status: 'In Stock' },
  ]

  const getStatusBadge = (status) => {
    const variants = {
      'In Stock': 'default',
      'Low Stock': 'secondary',
      'Out of Stock': 'destructive'
    }
    return variants[status] || 'default'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)
  const totalProducts = products.length
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 20).length
  const outOfStockItems = products.filter(p => p.stock === 0).length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Produk terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Nilai inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Perlu restock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <Box className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Stok habis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Produk</CardTitle>
                <CardDescription>
                  Kelola semua produk dalam inventory
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Produk
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products
                  .filter(product => 
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {product.stock}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(product.stock * product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(product.status)}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
