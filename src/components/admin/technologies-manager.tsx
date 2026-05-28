'use client'

import { useState } from 'react'
import { createTechnology, updateTechnology, deleteTechnology } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormField, ConfirmDialog, EmptyState } from '@/components/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Cpu, Save } from 'lucide-react'
import type { Technology, TechnologyFormData } from '@/lib/types'

const CATEGORIES = ['Backend', 'Database', 'AI/ML', 'Frontend', 'Tools', 'Design', 'Other']

interface TechnologiesManagerProps {
  technologies: Technology[]
}

export function TechnologiesManager({ technologies }: TechnologiesManagerProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTech, setEditingTech] = useState<Technology | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('Backend')

  function openCreate() {
    setEditingTech(null)
    setCategory('Backend')
    setFormOpen(true)
  }

  function openEdit(tech: Technology) {
    setEditingTech(tech)
    setCategory(tech.category)
    setFormOpen(true)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const data: TechnologyFormData = {
      name: formData.get('name') as string,
      icon_url: formData.get('icon_url') as string,
      category,
      sort_order: Number(formData.get('sort_order')) || 0,
    }

    try {
      if (editingTech) {
        await updateTechnology(editingTech.id, data)
      } else {
        await createTechnology(data)
      }
      setFormOpen(false)
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)
    try {
      await deleteTechnology(deleteId)
    } catch {
      // Handle error
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  // Group by category
  const grouped = technologies.reduce<Record<string, Technology[]>>((acc, tech) => {
    const cat = tech.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tech)
    return acc
  }, {})

  return (
    <>
      {technologies.length === 0 ? (
        <EmptyState
          icon={<Cpu className="h-12 w-12" />}
          title="Belum ada teknologi"
          description="Tambahkan skill dan teknologi yang Anda kuasai."
          action={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Teknologi
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Teknologi
            </Button>
          </div>

          {Object.entries(grouped).map(([cat, techs]) => (
            <Card key={cat}>
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech) => (
                    <div key={tech.id} className="group relative">
                      <Badge variant="secondary" className="pr-1 gap-1 text-sm">
                        {tech.name}
                        <span className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(tech)}
                            className="rounded p-0.5 hover:bg-accent"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setDeleteId(tech.id)}
                            className="rounded p-0.5 hover:bg-destructive/20 text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTech ? 'Edit Teknologi' : 'Tambah Teknologi'}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <FormField
              label="Nama"
              name="name"
              defaultValue={editingTech?.name ?? ''}
              placeholder="React, Node.js, dll"
              required
            />
            <FormField
              label="Icon URL"
              name="icon_url"
              type="url"
              defaultValue={editingTech?.icon_url ?? ''}
              placeholder="https://cdn.simpleicons.org/react"
            />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Kategori</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormField
              label="Urutan"
              name="sort_order"
              type="number"
              defaultValue={editingTech?.sort_order?.toString() ?? '0'}
              placeholder="0"
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
        title="Hapus Teknologi?"
        description="Teknologi ini akan dihapus dari daftar dan dari semua proyek terkait."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
