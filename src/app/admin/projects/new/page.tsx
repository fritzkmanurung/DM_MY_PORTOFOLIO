import { getTechnologies, getProjectCategories } from '@/lib/actions/crud'
import { PageHeader } from '@/components/shared'
import { ProjectForm } from '@/components/admin/project-form'

export default async function NewProjectPage() {
  const [technologies, categories] = await Promise.all([
    getTechnologies(),
    getProjectCategories(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        description="Isi detail proyek yang ingin Anda tampilkan"
      />
      <ProjectForm technologies={technologies} categories={categories} />
    </div>
  )
}
