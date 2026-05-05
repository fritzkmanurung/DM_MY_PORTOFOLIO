'use client'

import { useState } from 'react'
import { createService, updateService, deleteService } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/shared'
import { ConfirmDialog } from '@/components/shared'
import { Plus, Save, Trash2, Wrench } from 'lucide-react'
import type { Service, ServiceFormData } from '@/lib/types'

interface ServicesManagerProps {
  services: Service[]
}

export function ServicesManager({ services }: ServicesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const data: ServiceFormData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      icon_name: formData.get('icon_name') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }
    try {
      if (editingId) {
        await updateService(editingId, data)
        setMessage({ type: 'success', text: 'Layanan berhasil diperbarui!' })
      } else {
        await createService(data)
        setMessage({ type: 'success', text: 'Layanan berhasil ditambahkan!' })
      }
      setShowForm(false); setEditingId(null)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    try { await deleteService(id); setMessage({ type: 'success', text: 'Layanan berhasil dihapus!' }) }
    catch (err) { setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' }) }
  }

  const editingItem = editingId ? services.find(s => s.id === editingId) : null

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-md border p-3 text-sm ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>{message.text}</div>
      )}
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Layanan</Button>
      </div>
      {(showForm || editingId) && (
        <Card><CardHeader><CardTitle>{editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}</CardTitle></CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Judul Layanan" name="title" defaultValue={editingItem?.title ?? ''} placeholder="Web Development" required />
                <FormField label="Nama Ikon (Lucide)" name="icon_name" defaultValue={editingItem?.icon_name ?? ''} placeholder="Code2, PenTool, Pen, Monitor" />
              </div>
              <FormField label="Deskripsi" name="description" type="textarea" defaultValue={editingItem?.description ?? ''} required />
              <FormField label="Urutan" name="sort_order" type="number" defaultValue={editingItem?.sort_order?.toString() ?? '0'} />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Batal</Button>
                <Button type="submit" disabled={loading} className="gap-2"><Save className="h-4 w-4" /> {loading ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {services.map((svc) => (
          <Card key={svc.id}><CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <div><p className="font-semibold">{svc.title}</p><p className="text-sm text-muted-foreground line-clamp-1">{svc.description}</p></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditingId(svc.id); setShowForm(false) }}>Edit</Button>
              <ConfirmDialog onConfirm={() => handleDelete(svc.id)} title="Hapus Layanan?" description="Data layanan ini akan dihapus permanen.">
                <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
              </ConfirmDialog>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
