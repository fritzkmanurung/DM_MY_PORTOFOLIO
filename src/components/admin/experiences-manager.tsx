'use client'

import { useState } from 'react'
import { createExperience, updateExperience, deleteExperience } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormField, ConfirmDialog, EmptyState } from '@/components/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Briefcase, Save, Calendar } from 'lucide-react'
import type { Experience, ExperienceFormData } from '@/lib/types'

interface ExperiencesManagerProps {
  experiences: Experience[]
}

export function ExperiencesManager({ experiences }: ExperiencesManagerProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Experience | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setError(null)
    setFormOpen(true)
  }

  function openEdit(exp: Experience) {
    setEditing(exp)
    setError(null)
    setFormOpen(true)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const data: ExperienceFormData = {
      company_name: formData.get('company_name') as string,
      position: formData.get('position') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      description: formData.get('description') as string,
      sort_order: Number(formData.get('sort_order')) || 0,
    }

    try {
      if (editing) {
        await updateExperience(editing.id, data)
      } else {
        await createExperience(data)
      }
      setFormOpen(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengalaman')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)
    try {
      await deleteExperience(deleteId)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus pengalaman')
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Sekarang'
    return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}
      {experiences.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-12 w-12" />}
          title="Belum ada pengalaman"
          description="Tambahkan riwayat pekerjaan atau pendidikan Anda."
          action={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Pengalaman
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Pengalaman
            </Button>
          </div>

          {experiences.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-2 text-muted-foreground">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(exp)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(exp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Pengalaman' : 'Tambah Pengalaman'}</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Jabatan / Posisi"
                name="position"
                defaultValue={editing?.position ?? ''}
                placeholder="Frontend Developer"
                required
              />
              <FormField
                label="Perusahaan / Institusi"
                name="company_name"
                defaultValue={editing?.company_name ?? ''}
                placeholder="PT Contoh"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Tanggal Mulai"
                name="start_date"
                type="date"
                defaultValue={editing?.start_date ?? ''}
                required
              />
              <FormField
                label="Tanggal Selesai"
                name="end_date"
                type="date"
                defaultValue={editing?.end_date ?? ''}
                placeholder="Kosongkan jika masih berjalan"
              />
            </div>
            <FormField
              label="Deskripsi"
              name="description"
              type="textarea"
              defaultValue={editing?.description ?? ''}
              placeholder="Pencapaian dan tanggung jawab Anda..."
            />
            <FormField
              label="Urutan"
              name="sort_order"
              type="number"
              defaultValue={editing?.sort_order ?? 0}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Pengalaman?"
        description="Data pengalaman ini akan dihapus secara permanen."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
