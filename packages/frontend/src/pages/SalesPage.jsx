import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Eye, Calendar, DollarSign, CreditCard } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0)
}

const SaleDetailsModal = ({ sale, isOpen, onClose }) => {
  if (!sale) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sale Details - {sale.saleNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sale Number</label>
              <p className="font-mono">{sale.saleNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <p>{new Date(sale.saleDate).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cashier</label>
              <p>{sale.cashier?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
              <Badge variant="outline">{sale.paymentMethod.replace('_', ' ')}</Badge>
            </div>
          </div>

          {/* Customer Info */}
          {(sale.customerName || sale.customerPhone || sale.customerEmail) && (
            <div>
              <h3 className="font-medium mb-2">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {sale.customerName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p>{sale.customerName}</p>
                  </div>
                )}
                {sale.customerPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{sale.customerPhone}</p>
                  </div>
                )}
                {sale.customerEmail && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{sale.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-medium mb-2">Items</h3>
            <div className="space-y-2">
              {sale.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">{item.productSku}</p>
                  </div>
                  <div className="text-right">
                    <p>{item.quantity} × {formatCurrency(parseFloat(item.unitPrice))}</p>
                    <p className="font-medium">{formatCurrency(parseFloat(item.subtotal))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(parseFloat(sale.subtotal))}</span>
            </div>
            
            {parseFloat(sale.discount) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{formatCurrency(parseFloat(sale.discount))}</span>
              </div>
            )}
            
            {parseFloat(sale.tax) > 0 && (
              <div className="flex justify-between">
                <span>Tax ({sale.taxRate}%):</span>
                <span>{formatCurrency(parseFloat(sale.tax))}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(parseFloat(sale.total))}</span>
            </div>

            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span>{formatCurrency(parseFloat(sale.amountPaid))}</span>
            </div>

            {parseFloat(sale.change) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Change:</span>
                <span>{formatCurrency(parseFloat(sale.change))}</span>
              </div>
            )}
          </div>

          {sale.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="mt-1">{sale.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const SalesPage = () => {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [summary, setSummary] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    status: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0)
  }

  useEffect(() => {
    fetchSales()
    fetchSummary()
  }, [filters])

  const fetchSales = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/pos/sales?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSales(data.data.sales)
        setPagination(data.data.pagination)
      } else {
        throw new Error('Failed to fetch sales')
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
      toast.error('Failed to load sales')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pos/sales/summary?period=today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const handleViewDetails = async (saleId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/pos/sales/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedSale(data.data)
        setIsDetailsOpen(true)
      } else {
        throw new Error('Failed to fetch sale details')
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
      toast.error('Failed to load sale details')
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'default'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      case 'refunded': return 'outline'
      default: return 'default'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return '💰'
      case 'card': return '💳'
      case 'digital_wallet': return '📱'
      case 'bank_transfer': return '🏦'
      default: return '💰'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Sales History</h1>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.totalRevenue || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <p className="text-xl font-bold">{summary.totalSales || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Average Sale</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.averageSale || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Tax Collected</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.totalTax || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by sale number or customer..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
              
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
              />
              
              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
              />
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="px-3 py-2 border rounded-md bg-card text-card-foreground"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : sales.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No sales found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/5 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Sale #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Cashier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-muted/10">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-muted/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm">{sale.saleNumber}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {sale.customerName || 'Walk-in Customer'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {sale.cashier?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {sale.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="flex items-center">
                            {getPaymentMethodIcon(sale.paymentMethod)}
                            <span className="ml-1 capitalize">
                              {sale.paymentMethod.replace('_', ' ')}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(parseFloat(sale.total))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusVariant(sale.status)}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(sale.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sale Details Modal */}
      <SaleDetailsModal
        sale={selectedSale}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  )
}

export default SalesPage