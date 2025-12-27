import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import { Activity, TrendingUp, Package, BarChart2 } from 'lucide-react'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [sResp, tResp] = await Promise.all([
          axios.get(`/api/pos/sales/summary?period=${period}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/pos/sales/top-products?period=${period}&limit=5`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (sResp.data?.success) {
          setSummary(sResp.data.data.summary)
          setPaymentMethods(sResp.data.data.paymentMethods || [])
        }
        if (tResp.data?.success) setTopProducts(tResp.data.data.top)

        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Gagal memuat data dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const formatCurrency = (v) => {
    if (!v) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
  }

  const totalSales = summary?.totalSales || 0
  const totalRevenue = summary?.totalRevenue || 0
  const averageSale = summary?.averageSale || 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4 rounded-lg bg-card text-card-foreground">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-chart-2" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Penjualan</p>
                  <div className="text-2xl font-bold">{totalSales}</div>
                  <p className="text-xs text-muted-foreground">Penjualan selesai ({period})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 rounded-lg bg-card text-card-foreground">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-chart-3" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pendapatan</p>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Total pendapatan ({period})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 rounded-lg bg-card text-card-foreground">
              <div className="flex items-center">
                <BarChart2 className="h-8 w-8 text-chart-4" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Rata-rata Per Transaksi</p>
                  <div className="text-2xl font-bold">{formatCurrency(averageSale)}</div>
                  <p className="text-xs text-muted-foreground">Rata-rata nilai transaksi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 rounded-lg bg-card text-card-foreground">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-chart-5" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Top Produk</p>
                  <div className="text-2xl font-bold">{topProducts.length}</div>
                  <p className="text-xs text-muted-foreground">Produk terlaris ({period})</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <Card className="mb-6">
          <CardContent className="p-4 rounded-lg bg-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Search products or SKU..." />
              <div />
              <div className="flex items-center justify-end">
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border rounded-md bg-card text-card-foreground">
                  <option value="today">Hari ini</option>
                  <option value="week">Minggu</option>
                  <option value="month">Bulan</option>
                  <option value="all">Semua</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts / Top products list */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Produk Terjual</CardTitle>
                  <CardDescription>Lihat produk yang paling banyak terjual</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border rounded px-2 py-1 text-sm">
                    <option value="today">Hari ini</option>
                    <option value="week">Minggu</option>
                    <option value="month">Bulan</option>
                    <option value="all">Semua</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada data penjualan</p>
              ) : (
                <ul className="space-y-3">
                  {topProducts.map((p, i) => (
                    <li key={p.productId} className="flex items-center gap-4">
                      <div className="w-8 text-sm font-medium">{i + 1}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.name || p.sku || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">SKU: {p.sku || '-'}</div>
                      </div>
                      <div className="w-48">
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div className="h-2 bg-primary" style={{ width: `${Math.min(100, (p.totalSold / (topProducts[0]?.totalSold || 1)) * 100)}%` }} />
                        </div>
                        <div className="text-sm text-right">{p.totalSold} terjual</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Sales Breakdown</CardTitle>
                <CardDescription>Metode pembayaran dan ringkasan</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-sm text-muted-foreground">Tidak ada data metode pembayaran</div>
              ) : (
                <ul className="space-y-2">
                  {paymentMethods.map(pm => (
                    <li key={pm.paymentMethod} className="flex items-center justify-between">
                      <div className="text-sm">{pm.paymentMethod}</div>
                      <div className="text-sm font-medium">{formatCurrency(pm.total)} ({pm.count})</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
