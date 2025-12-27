import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Navbar from '@/components/Navbar'
import { Plus, Search, Settings as SettingsIcon, Edit, Trash2, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState(null)
  const [formData, setFormData] = useState({ key: '', value: '', type: 'string', description: '', category: 'general' })
  const [formErrors, setFormErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchSettings()
  }, [navigate])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = response.data || {}
      const arr = Object.entries(data).map(([key, cfg]) => ({
        key,
        value: cfg?.value,
        type: cfg?.type || 'string',
        description: cfg?.description || '',
        category: cfg?.category || 'general'
      }))

      setSettings(arr)
      setError(null)
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Gagal mengambil data pengaturan')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (setting = null) => {
    if (setting) {
      setEditMode(true)
      setSelectedSetting(setting)
      let val = setting.value
      // stringify JSON values for editing
      if (setting.type === 'json' && typeof val === 'object') val = JSON.stringify(val, null, 2)

      setFormData({
        key: setting.key,
        value: val,
        type: setting.type,
        description: setting.description || '',
        category: setting.category || 'general'
      })
    } else {
      setEditMode(false)
      setSelectedSetting(null)
      setFormData({ key: '', value: '', type: 'string', description: '', category: 'general' })
    }

    setFormErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData({ key: '', value: '', type: 'string', description: '', category: 'general' })
    setFormErrors({})
    setEditMode(false)
    setSelectedSetting(null)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.key.trim()) errors.key = 'Key harus diisi'
    if (formData.value === '') errors.value = 'Value harus diisi'
    if (!['string', 'number', 'boolean', 'json'].includes(formData.type)) errors.type = 'Type tidak valid'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitLoading(true)
      const token = localStorage.getItem('token')

      let valueToSend = formData.value
      // parse types
      if (formData.type === 'number') {
        const n = Number(valueToSend)
        if (Number.isNaN(n)) throw new Error('Value must be a number')
        valueToSend = n
      } else if (formData.type === 'boolean') {
        valueToSend = String(valueToSend).toLowerCase() === 'true' || valueToSend === true
      } else if (formData.type === 'json') {
        try {
          valueToSend = JSON.parse(valueToSend)
        } catch (err) {
          setFormErrors({ value: 'Invalid JSON' })
          return
        }
      }

      const payload = {
        key: formData.key,
        value: valueToSend,
        type: formData.type,
        description: formData.description || null,
        category: formData.category || 'general'
      }

      await axios.post('/api/settings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      handleCloseDialog()
      fetchSettings()
    } catch (err) {
      console.error('Error saving setting:', err)
      setFormErrors({ submit: err.response?.data?.message || err.message || 'Gagal menyimpan pengaturan' })
    } finally {
      setSubmitLoading(false)
    }
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const handleDeleteClick = (setting) => {
    setSelectedSetting(setting)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setSubmitLoading(true)
      const token = localStorage.getItem('token')
      await axios.delete(`/api/settings/${encodeURIComponent(selectedSetting.key)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDeleteDialogOpen(false)
      setSelectedSetting(null)
      fetchSettings()
    } catch (err) {
      console.error('Error deleting setting:', err)
      alert(err.response?.data?.message || 'Gagal menghapus pengaturan')
    } finally {
      setSubmitLoading(false)
    }
  }

  const filtered = settings.filter(s =>
    s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (String(s.value || '')).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = Array.from(new Set(settings.map(s => s.category || 'general')))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{settings.length}</div>
              <p className="text-xs text-muted-foreground">Jumlah pengaturan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <div className="text-muted-foreground">{categories.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Kategori unik</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pengaturan</CardTitle>
                <CardDescription>Kelola konfigurasi aplikasi</CardDescription>
              </div>

              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pengaturan
              </Button>
            </div>

            <Separator className="my-4" />
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari key, value atau kategori..."
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
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Tidak ada pengaturan yang cocok' : 'Tidak ada data pengaturan'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s) => (
                      <TableRow key={s.key}>
                        <TableCell className="font-mono text-sm">{s.key}</TableCell>
                        <TableCell>
                          <pre className="whitespace-pre-wrap text-sm max-h-24 overflow-auto">{typeof s.value === 'object' ? JSON.stringify(s.value, null, 2) : String(s.value)}</pre>
                        </TableCell>
                        <TableCell className="font-medium">{s.type}</TableCell>
                        <TableCell><div className="text-sm text-muted-foreground">{s.category}</div></TableCell>
                        <TableCell><div className="text-sm text-muted-foreground">{s.description}</div></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(s)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(s)}>
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
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Pengaturan' : 'Tambah Pengaturan Baru'}</DialogTitle>
              <DialogDescription>{editMode ? 'Perbarui konfigurasi' : 'Masukkan konfigurasi baru'}</DialogDescription>
            </DialogHeader>

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
                    <Label htmlFor="key">Key</Label>
                    <Input id="key" value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} disabled={editMode} />
                    {formErrors.key && <p className="text-sm text-destructive">{formErrors.key}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">string</SelectItem>
                        <SelectItem value="number">number</SelectItem>
                        <SelectItem value="boolean">boolean</SelectItem>
                        <SelectItem value="json">json</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.type && <p className="text-sm text-destructive">{formErrors.type}</p>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
                  {formErrors.value && <p className="text-sm text-destructive">{formErrors.value}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={submitLoading}>Batal</Button>
                <Button type="submit" disabled={submitLoading}>{submitLoading ? 'Menyimpan...' : editMode ? 'Update' : 'Simpan'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Pengaturan</DialogTitle>
              <DialogDescription>Apakah Anda yakin ingin menghapus pengaturan <strong>{selectedSetting?.key}</strong>?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitLoading}>Batal</Button>
              <Button className="text-destructive" onClick={handleDeleteConfirm} disabled={submitLoading}>Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
