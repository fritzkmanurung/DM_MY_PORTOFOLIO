import { PageHeader } from '@/components/shared'
import { getServices } from '@/lib/actions/crud'
import { ServicesManager } from '@/components/admin/services-manager'

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <div className="space-y-8">
      <PageHeader />
      <ServicesManager services={services} />
    </div>
  )
}
