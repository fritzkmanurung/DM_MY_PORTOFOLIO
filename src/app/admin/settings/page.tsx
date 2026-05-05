import { PageHeader } from '@/components/shared'
import { getSiteSettings } from '@/lib/actions/crud'
import { SettingsForm } from '@/components/admin/settings-form'

export default async function SettingsPage() {
  const settings = await getSiteSettings()
  return (
    <div className="space-y-8">
      <PageHeader />
      <SettingsForm settings={settings} />
    </div>
  )
}
