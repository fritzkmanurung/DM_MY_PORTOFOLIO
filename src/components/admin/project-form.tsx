'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject, updateProject } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, ImageUpload } from '@/components/shared'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Save, ArrowLeft, X } from 'lucide-react'
import type { Technology, ProjectCategory, ProjectFormData } from '@/lib/types'

interface ProjectFormProps {
  project?: {
    id: string
    title: string
    slug: string
    description: string
    image_url: string | null
    live_url: string | null
    repo_url: string | null
    is_featured: boolean
    sort_order: number
    tech_ids: string[]
    category_ids: string[]
  }
  technologies: Technology[]
  categories: ProjectCategory[]
}

export function ProjectForm({ project, technologies, categories }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isFeatured, setIsFeatured] = useState(project?.is_featured ?? false)
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(project?.tech_ids ?? [])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(project?.category_ids ?? [])
  const [imageUrl, setImageUrl] = useState<string>(project?.image_url ?? '')

  function toggleTech(techId: string) {
    setSelectedTechIds((prev) =>
      prev.includes(techId)
        ? prev.filter((id) => id !== techId)
        : [...prev, techId]
    )
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const data: ProjectFormData = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      image_url: imageUrl,
      live_url: formData.get('live_url') as string,
      repo_url: formData.get('repo_url') as string,
      is_featured: isFeatured,
      sort_order: Number(formData.get('sort_order')) || 0,
      tech_ids: selectedTechIds,
      category_ids: selectedCategoryIds,
    }

    try {
      if (project) {
        await updateProject(project.id, data)
        setMessage({ type: 'success', text: 'Proyek berhasil diperbarui!' })
      } else {
        await createProject(data)
        router.push('/admin/projects')
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  // Group technologies by category
  const techByCategory = technologies.reduce<Record<string, Technology[]>>((acc, tech) => {
    const cat = tech.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tech)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => router.push('/admin/projects')}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{project ? 'Edit Detail Proyek' : 'Detail Proyek Baru'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {message && (
              <div className={`rounded-md border p-3 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-destructive/50 bg-destructive/10 text-destructive'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Judul Proyek"
                name="title"
                defaultValue={project?.title ?? ''}
                placeholder="My Awesome Project"
                required
              />
              <FormField
                label="Slug (URL)"
                name="slug"
                defaultValue={project?.slug ?? ''}
                placeholder="my-awesome-project"
                required
              />
            </div>

            <FormField
              label="Deskripsi"
              name="description"
              type="textarea"
              defaultValue={project?.description ?? ''}
              placeholder="Jelaskan proyek ini secara detail..."
              required
            />

            {/* Project Image Upload */}
            <ImageUpload
              label="Gambar / Thumbnail Proyek"
              currentUrl={project?.image_url}
              onUpload={(url) => setImageUrl(url)}
              folder="projects"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Live URL"
                name="live_url"
                type="url"
                defaultValue={project?.live_url ?? ''}
                placeholder="https://myproject.com"
              />
              <FormField
                label="Repository URL"
                name="repo_url"
                type="url"
                defaultValue={project?.repo_url ?? ''}
                placeholder="https://github.com/user/repo"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Urutan Tampilan"
                name="sort_order"
                type="number"
                defaultValue={project?.sort_order ?? 0}
                placeholder="0"
              />
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="is_featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
                <Label htmlFor="is_featured">Tampilkan di Beranda (Featured)</Label>
              </div>
            </div>

            <Separator />

            {/* Category Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Kategori Proyek</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Pilih satu atau lebih kategori untuk proyek ini
                </p>
              </div>

              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada kategori. Tambahkan di menu Kategori Proyek.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id)
                    return (
                      <Badge
                        key={cat.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer select-none transition-colors"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        {cat.name}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Technology Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Teknologi yang Digunakan</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Klik untuk menambah/menghapus teknologi
                </p>
              </div>

              {Object.keys(techByCategory).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada teknologi. Tambahkan di menu Teknologi terlebih dahulu.
                </p>
              ) : (
                Object.entries(techByCategory).map(([category, techs]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {techs.map((tech) => {
                        const isSelected = selectedTechIds.includes(tech.id)
                        return (
                          <Badge
                            key={tech.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer select-none transition-colors"
                            onClick={() => toggleTech(tech.id)}
                          >
                            {tech.name}
                            {isSelected && <X className="ml-1 h-3 w-3" />}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/projects')}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Menyimpan...' : project ? 'Simpan Perubahan' : 'Buat Proyek'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
