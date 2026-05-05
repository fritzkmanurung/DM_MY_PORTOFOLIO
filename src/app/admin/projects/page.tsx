import Link from 'next/link'
import { getProjects } from '@/lib/actions/crud'
import { PageHeader, EmptyState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ProjectsTable } from '@/components/admin/projects-table'
import { Plus, FolderKanban } from 'lucide-react'

export default async function AdminProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-8">
      <PageHeader>
        <Link href="/admin/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Proyek
          </Button>
        </Link>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="Belum ada proyek"
          description="Mulai tambahkan proyek pertama Anda untuk ditampilkan di portofolio."
          action={
            <Link href="/admin/projects/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Proyek
              </Button>
            </Link>
          }
        />
      ) : (
        <ProjectsTable projects={projects} />
      )}
    </div>
  )
}
