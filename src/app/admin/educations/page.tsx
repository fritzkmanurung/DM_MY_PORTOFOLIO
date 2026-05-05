import { PageHeader } from '@/components/shared'
import { getEducations } from '@/lib/actions/crud'
import { EducationsManager } from '@/components/admin/educations-manager'

export default async function EducationsPage() {
  const educations = await getEducations()

  return (
    <div className="space-y-8">
      <PageHeader />
      <EducationsManager educations={educations} />
    </div>
  )
}
