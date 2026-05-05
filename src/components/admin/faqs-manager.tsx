'use client'

import { useState } from 'react'
import { createFaq, updateFaq, deleteFaq } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/shared'
import { ConfirmDialog } from '@/components/shared'
import { Plus, Save, Trash2, HelpCircle } from 'lucide-react'
import type { FAQ, FaqFormData } from '@/lib/types'

interface FaqsManagerProps {
  faqs: FAQ[]
}

export function FaqsManager({ faqs }: FaqsManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const data: FaqFormData = {
      question: formData.get('question') as string,
      answer: formData.get('answer') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }
    try {
      if (editingId) {
        await updateFaq(editingId, data)
        setMessage({ type: 'success', text: 'FAQ berhasil diperbarui!' })
      } else {
        await createFaq(data)
        setMessage({ type: 'success', text: 'FAQ berhasil ditambahkan!' })
      }
      setShowForm(false); setEditingId(null)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    try { await deleteFaq(id); setMessage({ type: 'success', text: 'FAQ berhasil dihapus!' }) }
    catch (err) { setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' }) }
  }

  const editingItem = editingId ? faqs.find(f => f.id === editingId) : null

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-md border p-3 text-sm ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>{message.text}</div>
      )}
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah FAQ</Button>
      </div>
      {(showForm || editingId) && (
        <Card><CardHeader><CardTitle>{editingId ? 'Edit FAQ' : 'Tambah FAQ Baru'}</CardTitle></CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <FormField label="Pertanyaan" name="question" defaultValue={editingItem?.question ?? ''} placeholder="Layanan apa yang Anda tawarkan?" required />
              <FormField label="Jawaban" name="answer" type="textarea" defaultValue={editingItem?.answer ?? ''} required />
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
        {faqs.map((faq) => (
          <Card key={faq.id}><CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div><p className="font-semibold">{faq.question}</p><p className="text-sm text-muted-foreground line-clamp-1">{faq.answer}</p></div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => { setEditingId(faq.id); setShowForm(false) }}>Edit</Button>
              <ConfirmDialog onConfirm={() => handleDelete(faq.id)} title="Hapus FAQ?" description="FAQ ini akan dihapus permanen.">
                <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
              </ConfirmDialog>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
