import { getProjectCategories } from '@/lib/actions/crud'
import { PageHeader } from '@/components/shared'
import { ProjectCategoriesManager } from '@/components/admin/project-categories-manager'

export default async function AdminProjectCategoriesPage() {
  const categories = await getProjectCategories()

  return (
    <div className="space-y-8">
      <PageHeader />
      <ProjectCategoriesManager categories={categories} />
    </div>
  )
}
