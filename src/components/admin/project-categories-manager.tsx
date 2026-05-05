'use client'

import { useState } from 'react'
import { createProjectCategory, updateProjectCategory, deleteProjectCategory } from '@/lib/actions/crud'
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
import { Plus, Pencil, Trash2, Save, FolderTree } from 'lucide-react'
import type { ProjectCategory, ProjectCategoryFormData } from '@/lib/types'

interface ProjectCategoriesManagerProps {
  categories: ProjectCategory[]
}

export function ProjectCategoriesManager({ categories }: ProjectCategoriesManagerProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditingCategory(null)
    setFormOpen(true)
  }

  function openEdit(category: ProjectCategory) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const data: ProjectCategoryFormData = {
      name: formData.get('name') as string,
      sort_order: Number(formData.get('sort_order')) || 0,
    }

    try {
      if (editingCategory) {
        await updateProjectCategory(editingCategory.id, data)
      } else {
        await createProjectCategory(data)
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
      await deleteProjectCategory(deleteId)
    } catch {
      // Handle error
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-12 w-12" />}
          title="Belum ada kategori"
          description="Tambahkan kategori untuk mengelompokkan proyek Anda."
          action={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="group relative">
                    <Badge variant="secondary" className="pr-1 gap-1 text-sm">
                      {cat.name}
                      <span className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(cat)}
                          className="rounded p-0.5 hover:bg-accent"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
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
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <FormField
              label="Nama Kategori"
              name="name"
              defaultValue={editingCategory?.name ?? ''}
              placeholder="Pengembangan Web, Desain Grafis, dll"
              required
            />
            <FormField
              label="Urutan Tampilan"
              name="sort_order"
              type="number"
              defaultValue={editingCategory?.sort_order ?? 0}
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
        title="Hapus Kategori?"
        description="Kategori ini akan dihapus. Hubungan dengan proyek akan terputus."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
