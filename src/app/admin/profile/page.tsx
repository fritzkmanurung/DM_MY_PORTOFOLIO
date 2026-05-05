import { getProfile } from '@/lib/actions/crud'
import { ProfileForm } from '@/components/admin/profile-form'
import { PageHeader } from '@/components/shared'

export default async function AdminProfilePage() {
  const profile = await getProfile()

  return (
    <div className="space-y-8">
      <PageHeader />
      <ProfileForm profile={profile} />
    </div>
  )
}
