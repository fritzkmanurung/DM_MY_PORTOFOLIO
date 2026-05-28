'use client'

import { useState } from 'react'
import { updateSiteSetting } from '@/lib/actions/crud'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

const SECTIONS = [
  { key: 'section_hero', label: 'Hero Section', description: 'Halaman pembuka dengan judul utama' },
  { key: 'section_profile', label: 'Profil (Bento Grid)', description: 'Identitas, pendidikan, skills, dan kontak' },
  { key: 'section_projects', label: 'Proyek', description: 'Galeri proyek dengan filter dan statistik GitHub' },
  { key: 'section_certificates', label: 'Sertifikat & Prestasi', description: 'Daftar sertifikat dan pencapaian' },
  { key: 'section_experience', label: 'Pengalaman', description: 'Timeline riwayat karir' },
  { key: 'section_services', label: 'Layanan', description: 'Layanan yang ditawarkan' },
  { key: 'section_faq', label: 'FAQ', description: 'Pertanyaan yang sering diajukan' },
  { key: 'section_footer', label: 'Footer', description: 'Footer dengan kontak dan link cepat' },
]

interface SettingsFormProps {
  settings: Record<string, string>
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [localSettings, setLocalSettings] = useState<Record<string, string>>(settings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function toggleSetting(key: string) {
    setLocalSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }))
  }

  async function handleSave() {
    setLoading(true)
    setMessage(null)
    try {
      // Save section visibility (parallel)
      await Promise.all(
        SECTIONS.map((section) => {
          const value = localSettings[section.key] ?? 'true'
          return updateSiteSetting(section.key, value)
        })
      )
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-md border p-3 text-sm ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>{message.text}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Visibilitas Section</CardTitle>
          <p className="text-sm text-muted-foreground">Aktifkan atau nonaktifkan section yang ingin ditampilkan di halaman utama portfolio.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {SECTIONS.map((section) => {
            const isActive = (localSettings[section.key] ?? 'true') === 'true'
            return (
              <div key={section.key} className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">{section.label}</p>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting(section.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  )
}
