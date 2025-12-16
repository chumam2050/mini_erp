import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import Navbar from '@/components/Navbar'
import MediaUpload from '@/components/MediaUpload'
import { Plus, Search, Package, TrendingDown, DollarSign, Box, Edit, Trash2, AlertCircle, Image as ImageIcon } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    minStock: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      navigate('/login')
      return
    }

    fetchProducts()
  }, [navigate])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      setLoading(true)
      const response = await axios.get('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setProducts(response.data)
      setError(null)
    } catch (err) {
      setError('Gagal mengambil data produk')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditMode(true)
      setSelectedProduct(product)
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        stock: product.stock,
        minStock: product.minStock
      })
    } else {
      setEditMode(false)
      setSelectedProduct(null)
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        minStock: '10'
      })
    }
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      minStock: ''
    })
    setFormErrors({})
    setEditMode(false)
    setSelectedProduct(null)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.sku.trim()) {
      errors.sku = 'SKU harus diisi'
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Nama produk harus diisi'
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Kategori harus dipilih'
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Harga harus lebih dari 0'
    }
    
    if (formData.stock === '' || formData.stock < 0) {
      errors.stock = 'Stok tidak boleh negatif'
    }
    
    if (formData.minStock === '' || formData.minStock < 0) {
      errors.minStock = 'Minimum stok tidak boleh negatif'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSubmitLoading(true)
      const token = localStorage.getItem('token')
      
      const productData = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock)
      }
      
      if (editMode) {
        await axios.put(`/api/products/${selectedProduct.id}`, productData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } else {
        await axios.post('/api/products', productData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
      
      handleCloseDialog()
      fetchProducts()
    } catch (err) {
      console.error('Error saving product:', err)
      setFormErrors({
        submit: err.response?.data?.message || 'Gagal menyimpan data produk'
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteClick = (product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setSubmitLoading(true)
      const token = localStorage.getItem('token')
      
      await axios.delete(`/api/products/${selectedProduct.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setDeleteDialogOpen(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      alert(err.response?.data?.message || 'Gagal menghapus produk')
    } finally {
      setSubmitLoading(false)
    }
  }

  const getStatusBadge = (product) => {
    if (product.stock === 0) return 'destructive'
    if (product.stock < product.minStock) return 'secondary'
    return 'default'
  }

  const getStatusText = (product) => {
    if (product.stock === 0) return 'Out of Stock'
    if (product.stock < product.minStock) return 'Low Stock'
    return 'In Stock'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalValue = filteredProducts.reduce((sum, product) => sum + (product.stock * parseFloat(product.price)), 0)
  const totalProducts = products.length
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < p.minStock).length
  const outOfStockItems = products.filter(p => p.stock === 0).length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

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
              <Button onClick={() => handleOpenDialog()}>
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
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Gambar</TableHead>
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
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Tidak ada produk yang cocok dengan pencarian' : 'Tidak ada data produk'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            {product.primaryImage ? (
                              <img 
                                src={product.primaryImage} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
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
                          {formatCurrency(product.stock * parseFloat(product.price))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(product)}>
                            {getStatusText(product)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredProducts.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} dari {filteredProducts.length} produk
                </div>
                
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return null
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
              <DialogDescription>
                {editMode ? 'Perbarui informasi produk di bawah ini' : 'Masukkan informasi produk baru'}
              </DialogDescription>
            </DialogHeader>
            
            {editMode ? (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Informasi Produk</TabsTrigger>
                  <TabsTrigger value="media">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Media
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      {formErrors.submit && (
                        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.submit}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="LPT-001"
                            className={formErrors.sku ? 'border-destructive' : ''}
                            disabled={editMode}
                          />
                          {formErrors.sku && (
                            <p className="text-sm text-destructive">{formErrors.sku}</p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="category">Kategori</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className={formErrors.category ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Electronics">Electronics</SelectItem>
                              <SelectItem value="Furniture">Furniture</SelectItem>
                              <SelectItem value="Accessories">Accessories</SelectItem>
                              <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.category && (
                            <p className="text-sm text-destructive">{formErrors.category}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Masukkan nama produk"
                          className={formErrors.name ? 'border-destructive' : ''}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-destructive">{formErrors.name}</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Deskripsi produk (opsional)"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="price">Harga (Rp)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0"
                            className={formErrors.price ? 'border-destructive' : ''}
                          />
                          {formErrors.price && (
                            <p className="text-sm text-destructive">{formErrors.price}</p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="stock">Stok</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="0"
                            className={formErrors.stock ? 'border-destructive' : ''}
                          />
                          {formErrors.stock && (
                            <p className="text-sm text-destructive">{formErrors.stock}</p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="minStock">Min. Stok</Label>
                          <Input
                            id="minStock"
                            type="number"
                            value={formData.minStock}
                            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                            placeholder="10"
                            className={formErrors.minStock ? 'border-destructive' : ''}
                          />
                          {formErrors.minStock && (
                            <p className="text-sm text-destructive">{formErrors.minStock}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                        disabled={submitLoading}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={submitLoading}>
                        {submitLoading ? 'Menyimpan...' : 'Update'}
                      </Button>
                    </DialogFooter>
                  </form>
                </TabsContent>
                
                <TabsContent value="media" className="py-4">
                  <MediaUpload
                    productId={selectedProduct?.id}
                    initialMedia={selectedProduct?.images || []}
                    initialPrimary={selectedProduct?.primaryImage}
                    onMediaChange={(media, primary) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        images: media,
                        primaryImage: primary
                      })
                    }}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">{formErrors.submit && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.submit}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="LPT-001"
                      className={formErrors.sku ? 'border-destructive' : ''}
                      disabled={editMode}
                    />
                    {formErrors.sku && (
                      <p className="text-sm text-destructive">{formErrors.sku}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className={formErrors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-sm text-destructive">{formErrors.category}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama produk"
                    className={formErrors.name ? 'border-destructive' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi produk (opsional)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      className={formErrors.price ? 'border-destructive' : ''}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-destructive">{formErrors.price}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className={formErrors.stock ? 'border-destructive' : ''}
                    />
                    {formErrors.stock && (
                      <p className="text-sm text-destructive">{formErrors.stock}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="minStock">Min. Stok</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      placeholder="10"
                      className={formErrors.minStock ? 'border-destructive' : ''}
                    />
                    {formErrors.minStock && (
                      <p className="text-sm text-destructive">{formErrors.minStock}</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={submitLoading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? 'Menyimpan...' : 'Tambah'}
                </Button>
              </DialogFooter>
            </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus produk <strong>{selectedProduct?.name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={submitLoading}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={submitLoading}
              >
                {submitLoading ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
