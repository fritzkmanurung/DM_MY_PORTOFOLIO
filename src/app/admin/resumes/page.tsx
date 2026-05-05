import { getResumes } from '@/lib/actions/crud'
import { PageHeader } from '@/components/shared'
import { ResumesManager } from '@/components/admin/resumes-manager'

export default async function AdminResumesPage() {
  const resumes = await getResumes()

  return (
    <div className="space-y-8">
      <PageHeader />
      <ResumesManager resumes={resumes} />
    </div>
  )
}
