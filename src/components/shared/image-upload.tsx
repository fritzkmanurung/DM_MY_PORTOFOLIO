'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  label: string
  currentUrl?: string | null
  /** Called with the new public URL after a successful upload */
  onUpload: (url: string) => void
  /** Folder path inside the 'images' bucket, e.g. "avatars" or "projects" */
  folder?: string
}

export function ImageUpload({ label, currentUrl, onUpload, folder = '' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WebP).')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5 MB.')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const supabase = createClient()

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path)

      const publicUrl = urlData.publicUrl
      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Gagal mengunggah gambar. Pastikan bucket "images" sudah dibuat dan bersifat Public.')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Preview Area */}
      {preview ? (
        <div className="relative group w-fit">
          <img
            src={preview}
            alt="Preview"
            className="h-40 w-40 rounded-xl object-cover border border-border/50 shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center h-40 w-40 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <span className="text-xs text-muted-foreground">Klik untuk upload</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengunggah...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {preview ? 'Ganti Gambar' : 'Pilih Gambar'}
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
