import Link from 'next/link'
import { PageHeader } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProjects, getTechnologies, getExperiences, getResumes } from '@/lib/actions/crud'
import { FolderKanban, Cpu, Briefcase, FileText } from 'lucide-react'

export default async function AdminDashboard() {
  const [projects, technologies, experiences, resumes] = await Promise.all([
    getProjects(),
    getTechnologies(),
    getExperiences(),
    getResumes(),
  ])

  const stats = [
    { label: 'Proyek', value: projects.length, icon: FolderKanban, href: '/admin/projects', color: 'text-blue-500' },
    { label: 'Teknologi', value: technologies.length, icon: Cpu, href: '/admin/technologies', color: 'text-emerald-500' },
    { label: 'Pengalaman', value: experiences.length, icon: Briefcase, href: '/admin/experiences', color: 'text-amber-500' },
    { label: 'Resume', value: resumes.length, icon: FileText, href: '/admin/resumes', color: 'text-violet-500' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={href} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
