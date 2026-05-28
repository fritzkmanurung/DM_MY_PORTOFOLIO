'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, ImageUpload } from '@/components/shared'
import { Separator } from '@/components/ui/separator'
import { Save, User, Image, Layout, Share2 } from 'lucide-react'
import type { Profile, ProfileFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProfileFormProps {
  profile: Profile | null
}

const TABS = [
  { id: 'utama', label: 'Informasi Utama', icon: User },
  { id: 'media', label: 'Foto & Media', icon: Image },
  { id: 'hero', label: 'Hero Section', icon: Layout },
  { id: 'social', label: 'Media Sosial', icon: Share2 },
] as const

type TabId = (typeof TABS)[number]['id']

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('utama')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url ?? '')
  const [avatarUrl2, setAvatarUrl2] = useState<string>(profile?.avatar_url_2 ?? '')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const data: ProfileFormData = {
      full_name: formData.get('full_name') as string,
      role_title: formData.get('role_title') as string,
      bio: formData.get('bio') as string,
      email: formData.get('email') as string,
      avatar_url: avatarUrl,
      avatar_url_2: avatarUrl2,
      github_url: formData.get('github_url') as string,
      linkedin_url: formData.get('linkedin_url') as string,
      location: formData.get('location') as string,
      birth_date: formData.get('birth_date') as string,
      hero_title: formData.get('hero_title') as string,
      hero_subtitle: formData.get('hero_subtitle') as string,
      hero_tagline: formData.get('hero_tagline') as string,
      github_username: formData.get('github_username') as string,
      whatsapp_url: formData.get('whatsapp_url') as string,
      instagram_url: formData.get('instagram_url') as string,
    }

    try {
      await updateProfile(data)
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
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

            {/* TAB: UTAMA */}
            <div className={activeTab === 'utama' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Nama Lengkap"
                    name="full_name"
                    defaultValue={profile?.full_name ?? ''}
                    placeholder="John Doe"
                    required
                  />
                  <FormField
                    label="Role / Jabatan"
                    name="role_title"
                    defaultValue={profile?.role_title ?? ''}
                    placeholder="Fullstack Developer"
                    required
                  />
                </div>

                <FormField
                  label="Bio"
                  name="bio"
                  type="textarea"
                  defaultValue={profile?.bio ?? ''}
                  placeholder="Ceritakan tentang diri Anda..."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Email Kontak"
                    name="email"
                    type="email"
                    defaultValue={profile?.email ?? ''}
                    placeholder="you@example.com"
                  />
                  <FormField
                    label="Lokasi"
                    name="location"
                    defaultValue={profile?.location ?? ''}
                    placeholder="Samosir, Sumatera Utara"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Tanggal Lahir"
                    name="birth_date"
                    type="date"
                    defaultValue={profile?.birth_date ?? ''}
                  />
                  <FormField
                    label="GitHub Username"
                    name="github_username"
                    defaultValue={profile?.github_username ?? ''}
                    placeholder="username (tanpa @)"
                  />
                </div>
            </div>

            {/* TAB: MEDIA */}
            <div className={activeTab === 'media' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <ImageUpload
                    label="Foto Profil Utama"
                    currentUrl={profile?.avatar_url}
                    onUpload={(url) => setAvatarUrl(url)}
                    folder="avatars"
                  />
                  <ImageUpload
                    label="Foto Profil Sekunder"
                    currentUrl={profile?.avatar_url_2}
                    onUpload={(url) => setAvatarUrl2(url)}
                    folder="avatars"
                  />
                </div>
            </div>

            {/* TAB: HERO */}
            <div className={activeTab === 'hero' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                <FormField
                  label="Judul Hero"
                  name="hero_title"
                  type="textarea"
                  defaultValue={profile?.hero_title ?? ''}
                  placeholder="Welcome to My Portfolio Website"
                />

                <FormField
                  label="Subtitle Hero"
                  name="hero_subtitle"
                  type="textarea"
                  defaultValue={profile?.hero_subtitle ?? ''}
                  placeholder="Menciptakan pengalaman digital yang bermakna..."
                />

                <FormField
                  label="Tagline Hero (Kecil di paling atas)"
                  name="hero_tagline"
                  defaultValue={profile?.hero_tagline ?? ''}
                  placeholder="Contoh: Digital Portofolio"
                />
            </div>

            {/* TAB: SOCIAL */}
            <div className={activeTab === 'social' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="GitHub URL"
                    name="github_url"
                    type="url"
                    defaultValue={profile?.github_url ?? ''}
                    placeholder="https://github.com/username"
                  />
                  <FormField
                    label="LinkedIn URL"
                    name="linkedin_url"
                    type="url"
                    defaultValue={profile?.linkedin_url ?? ''}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="WhatsApp URL"
                    name="whatsapp_url"
                    type="url"
                    defaultValue={profile?.whatsapp_url ?? ''}
                    placeholder="https://wa.me/628xxx"
                  />
                  <FormField
                    label="Instagram URL"
                    name="instagram_url"
                    type="url"
                    defaultValue={profile?.instagram_url ?? ''}
                    placeholder="https://instagram.com/username"
                  />
                </div>
            </div>

            <Separator />
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading} className="gap-2 min-w-[150px]">
                <Save className="h-4 w-4" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
