import { getTechnologies } from '@/lib/actions/crud'
import { PageHeader, EmptyState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { TechnologiesManager } from '@/components/admin/technologies-manager'
import { Plus, Cpu } from 'lucide-react'

export default async function AdminTechnologiesPage() {
  const technologies = await getTechnologies()

  return (
    <div className="space-y-8">
      <PageHeader />

      <TechnologiesManager technologies={technologies} />
    </div>
  )
}
