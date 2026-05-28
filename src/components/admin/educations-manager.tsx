'use client'

import { useState } from 'react'
import { createEducation, updateEducation, deleteEducation } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/shared'
import { ConfirmDialog } from '@/components/shared'
import { Plus, Save, Trash2, GraduationCap } from 'lucide-react'
import type { Education, EducationFormData } from '@/lib/types'

interface EducationsManagerProps {
  educations: Education[]
}

export function EducationsManager({ educations }: EducationsManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const data: EducationFormData = {
      institution: formData.get('institution') as string,
      location: formData.get('location') as string,
      start_year: parseInt(formData.get('start_year') as string),
      end_year: formData.get('end_year') ? parseInt(formData.get('end_year') as string) : null,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }

    try {
      if (editingId) {
        await updateEducation(editingId, data)
        setMessage({ type: 'success', text: 'Pendidikan berhasil diperbarui!' })
      } else {
        await createEducation(data)
        setMessage({ type: 'success', text: 'Pendidikan berhasil ditambahkan!' })
      }
      setShowForm(false)
      setEditingId(null)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEducation(id)
      setMessage({ type: 'success', text: 'Pendidikan berhasil dihapus!' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    }
  }

  const editingItem = editingId ? educations.find(e => e.id === editingId) : null

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-md border p-3 text-sm ${
          message.type === 'success'
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : 'border-destructive/50 bg-destructive/10 text-destructive'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null) }} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Pendidikan
        </Button>
      </div>

      {(showForm || editingId) && (
        <Card key={editingId ?? 'new'}>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Pendidikan' : 'Tambah Pendidikan Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <FormField label="Nama Institusi" name="institution" defaultValue={editingItem?.institution ?? ''} placeholder="Institut Teknologi Del" required />
              <FormField label="Lokasi" name="location" defaultValue={editingItem?.location ?? ''} placeholder="Kab. Toba, Sumatera Utara" />
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Tahun Mulai" name="start_year" type="number" defaultValue={editingItem?.start_year?.toString() ?? ''} required />
                <FormField label="Tahun Selesai" name="end_year" type="number" defaultValue={editingItem?.end_year?.toString() ?? ''} placeholder="Kosongkan jika masih" />
                <FormField label="Urutan" name="sort_order" type="number" defaultValue={editingItem?.sort_order?.toString() ?? '0'} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Batal</Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" /> {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {educations.map((edu) => (
          <Card key={edu.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">{edu.location} • {edu.start_year} - {edu.end_year || 'Sekarang'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingId(edu.id); setShowForm(false) }}>Edit</Button>
                <ConfirmDialog onConfirm={() => handleDelete(edu.id)} title="Hapus Pendidikan?" description="Data pendidikan ini akan dihapus permanen.">
                  <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                </ConfirmDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
