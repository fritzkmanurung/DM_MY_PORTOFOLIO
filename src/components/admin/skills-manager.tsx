'use client'

import { useState } from 'react'
import { createSkill, updateSkill, deleteSkill } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/shared'
import { ConfirmDialog } from '@/components/shared'
import { Plus, Save, Trash2, Brain } from 'lucide-react'
import type { Skill, SkillFormData } from '@/lib/types'

interface SkillsManagerProps {
  skills: Skill[]
}

export function SkillsManager({ skills }: SkillsManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const data: SkillFormData = {
      name: formData.get('name') as string,
      level: parseInt(formData.get('level') as string) || 0,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }
    try {
      if (editingId) {
        await updateSkill(editingId, data)
        setMessage({ type: 'success', text: 'Skill berhasil diperbarui!' })
      } else {
        await createSkill(data)
        setMessage({ type: 'success', text: 'Skill berhasil ditambahkan!' })
      }
      setShowForm(false); setEditingId(null)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    try { await deleteSkill(id); setMessage({ type: 'success', text: 'Skill berhasil dihapus!' }) }
    catch (err) { setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' }) }
  }

  const editingItem = editingId ? skills.find(s => s.id === editingId) : null

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-md border p-3 text-sm ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>{message.text}</div>
      )}
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Skill</Button>
      </div>
      {(showForm || editingId) && (
        <Card key={editingId ?? 'new'}><CardHeader><CardTitle>{editingId ? 'Edit Skill' : 'Tambah Skill Baru'}</CardTitle></CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <FormField label="Nama Keahlian" name="name" defaultValue={editingItem?.name ?? ''} placeholder="UI/UX Design" required />
              <FormField label="Level (0-100)" name="level" type="number" defaultValue={editingItem?.level?.toString() ?? '80'} />
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
        {skills.map((skill) => (
          <Card key={skill.id}><CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-semibold">{skill.name}</p>
                <p className="text-sm text-muted-foreground">Level: {skill.level}%</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => { setEditingId(skill.id); setShowForm(false) }}>Edit</Button>
              <ConfirmDialog onConfirm={() => handleDelete(skill.id)} title="Hapus Skill?" description="Skill ini akan dihapus permanen.">
                <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
              </ConfirmDialog>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
