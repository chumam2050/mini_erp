import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, Image as ImageIcon, Video, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MediaUpload({ 
  productId, 
  initialMedia = [], 
  initialPrimary = null,
  onMediaChange,
  disabled = false 
}) {
  const [media, setMedia] = useState(initialMedia)
  const [primaryImage, setPrimaryImage] = useState(initialPrimary)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const updatedMedia = data.product.images || []
      setMedia(updatedMedia)
      setPrimaryImage(data.product.primaryImage)
      
      if (onMediaChange) {
        onMediaChange(updatedMedia, data.product.primaryImage)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSetPrimary = async (imageUrl) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${productId}/primary-image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
      })

      if (!response.ok) {
        throw new Error('Failed to set primary image')
      }

      const data = await response.json()
      setPrimaryImage(data.product.primaryImage)
      
      if (onMediaChange) {
        onMediaChange(media, data.product.primaryImage)
      }
    } catch (error) {
      console.error('Set primary error:', error)
      alert('Gagal set foto utama')
    }
  }

  const handleDelete = async (fileUrl) => {
    if (!confirm('Hapus file ini?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fileUrl })
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      const data = await response.json()
      const updatedMedia = data.product.images || []
      setMedia(updatedMedia)
      setPrimaryImage(data.product.primaryImage)
      
      if (onMediaChange) {
        onMediaChange(updatedMedia, data.product.primaryImage)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Gagal hapus file')
    }
  }

  const images = media.filter(m => m.type === 'image')
  const videos = media.filter(m => m.type === 'video')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Media'}
        </Button>
        <span className="text-xs text-muted-foreground">
          Max 10 files (images & videos, max 50MB each)
        </span>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={index}
                className={cn(
                  "relative group rounded-lg overflow-hidden border-2 transition-all",
                  img.url === primaryImage ? "border-primary ring-2 ring-primary/20" : "border-border"
                )}
              >
                <img
                  src={img.url}
                  alt={img.originalname}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {img.url !== primaryImage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(img.url)}
                      className="h-7 text-xs"
                      disabled={disabled}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Utama
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(img.url)}
                    disabled={disabled}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {img.url === primaryImage && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({videos.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {videos.map((vid, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border-2 border-border"
              >
                <video
                  src={vid.url}
                  className="w-full h-32 object-cover"
                  controls
                />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vid.url)}
                    disabled={disabled}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Belum ada media. Upload foto atau video produk.
          </p>
        </div>
      )}
    </div>
  )
}
