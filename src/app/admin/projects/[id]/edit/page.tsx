import { getProject, getTechnologies, getProjectCategories } from '@/lib/actions/crud'
import { PageHeader } from '@/components/shared'
import { ProjectForm } from '@/components/admin/project-form'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [project, technologies, categories] = await Promise.all([
    getProject(id),
    getTechnologies(),
    getProjectCategories(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        description={`Mengedit: ${project.title}`}
      />
      <ProjectForm project={project} technologies={technologies} categories={categories} />
    </div>
  )
}
