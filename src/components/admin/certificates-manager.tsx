'use client'

import { useState } from 'react'
import { createCertificate, updateCertificate, deleteCertificate } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, ImageUpload } from '@/components/shared'
import { ConfirmDialog } from '@/components/shared'
import { Plus, Save, Trash2, Award } from 'lucide-react'
import type { Certificate, CertificateFormData } from '@/lib/types'

interface CertificatesManagerProps {
  certificates: Certificate[]
}

export function CertificatesManager({ certificates }: CertificatesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const data: CertificateFormData = {
      title: formData.get('title') as string,
      issuer: formData.get('issuer') as string,
      issue_date: formData.get('issue_date') as string,
      image_url: imageUrl,
      credential_url: formData.get('credential_url') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }
    try {
      if (editingId) {
        await updateCertificate(editingId, data)
        setMessage({ type: 'success', text: 'Sertifikat berhasil diperbarui!' })
      } else {
        await createCertificate(data)
        setMessage({ type: 'success', text: 'Sertifikat berhasil ditambahkan!' })
      }
      setShowForm(false); setEditingId(null); setImageUrl('')
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    try { await deleteCertificate(id); setMessage({ type: 'success', text: 'Sertifikat berhasil dihapus!' }) }
    catch (err) { setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' }) }
  }

  function startEdit(cert: Certificate) {
    setEditingId(cert.id)
    setShowForm(false)
    setImageUrl(cert.image_url ?? '')
  }

  const editingItem = editingId ? certificates.find(c => c.id === editingId) : null

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-md border p-3 text-sm ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>{message.text}</div>
      )}
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null); setImageUrl('') }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Sertifikat</Button>
      </div>
      {(showForm || editingId) && (
        <Card><CardHeader><CardTitle>{editingId ? 'Edit Sertifikat' : 'Tambah Sertifikat Baru'}</CardTitle></CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <ImageUpload label="Gambar Sertifikat" currentUrl={editingItem?.image_url} onUpload={(url) => setImageUrl(url)} folder="certificates" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Judul" name="title" defaultValue={editingItem?.title ?? ''} placeholder="Sertifikat Juara..." required />
                <FormField label="Penerbit" name="issuer" defaultValue={editingItem?.issuer ?? ''} placeholder="Organisasi/Institusi" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Tanggal Terbit" name="issue_date" type="date" defaultValue={editingItem?.issue_date ?? ''} />
                <FormField label="URL Kredensial" name="credential_url" type="url" defaultValue={editingItem?.credential_url ?? ''} placeholder="https://..." />
                <FormField label="Urutan" name="sort_order" type="number" defaultValue={editingItem?.sort_order?.toString() ?? '0'} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Batal</Button>
                <Button type="submit" disabled={loading} className="gap-2"><Save className="h-4 w-4" /> {loading ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {certificates.map((cert) => (
          <Card key={cert.id}><CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {cert.image_url ? <img src={cert.image_url} alt={cert.title} className="w-12 h-12 rounded-lg object-cover" /> : <Award className="h-5 w-5 text-muted-foreground" />}
              <div><p className="font-semibold">{cert.title}</p><p className="text-sm text-muted-foreground">{cert.issuer}</p></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(cert)}>Edit</Button>
              <ConfirmDialog onConfirm={() => handleDelete(cert.id)} title="Hapus Sertifikat?" description="Data sertifikat ini akan dihapus permanen.">
                <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
              </ConfirmDialog>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
