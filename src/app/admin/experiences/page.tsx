import { getExperiences } from '@/lib/actions/crud'
import { PageHeader } from '@/components/shared'
import { ExperiencesManager } from '@/components/admin/experiences-manager'

export default async function AdminExperiencesPage() {
  const experiences = await getExperiences()

  return (
    <div className="space-y-8">
      <PageHeader />
      <ExperiencesManager experiences={experiences} />
    </div>
  )
}
