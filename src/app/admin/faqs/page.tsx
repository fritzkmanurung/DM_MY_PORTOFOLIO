import { PageHeader } from '@/components/shared'
import { getFaqs } from '@/lib/actions/crud'
import { FaqsManager } from '@/components/admin/faqs-manager'

export default async function FaqsPage() {
  const faqs = await getFaqs()
  return (
    <div className="space-y-8">
      <PageHeader />
      <FaqsManager faqs={faqs} />
    </div>
  )
}
