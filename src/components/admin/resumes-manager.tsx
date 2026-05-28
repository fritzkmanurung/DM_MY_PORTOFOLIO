'use client'

import { useState } from 'react'
import { createResume, setActiveResume, deleteResume } from '@/lib/actions/crud'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog, EmptyState } from '@/components/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, FileText, Upload, Check, Star, Download } from 'lucide-react'
import type { Resume } from '@/lib/types'

interface ResumesManagerProps {
  resumes: Resume[]
}

export function ResumesManager({ resumes }: ResumesManagerProps) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!file) return

    // S8: File size validation (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      setError(`Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimal 5MB.`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileName = `${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file)

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path)

      await createResume(file.name, urlData.publicUrl)
      setUploadOpen(false)
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupload file')
    } finally {
      setUploading(false)
    }
  }

  async function handleSetActive(id: string) {
    setLoading(true)
    try {
      await setActiveResume(id)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengaktifkan resume')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)
    try {
      await deleteResume(deleteId)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus resume')
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}
      {resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Belum ada CV"
          description="Upload file CV/Resume Anda agar pengunjung bisa mengunduhnya."
          action={
            <Button className="gap-2" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload CV
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload CV Baru
            </Button>
          </div>

          {resumes.map((resume) => (
            <Card key={resume.id} className={resume.is_active ? 'border-emerald-500/50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{resume.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(resume.uploaded_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {resume.is_active && (
                      <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 shrink-0">
                        <Star className="h-3 w-3" />
                        Aktif
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <a
                      href={resume.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    {!resume.is_active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600"
                        onClick={() => handleSetActive(resume.id)}
                        disabled={loading}
                        title="Jadikan Aktif"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(resume.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload CV / Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File PDF</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="text-xs text-muted-foreground">
                  File terpilih: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Mengupload...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus CV?"
        description="File CV ini akan dihapus secara permanen."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
