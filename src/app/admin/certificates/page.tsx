import { PageHeader } from '@/components/shared'
import { getCertificates } from '@/lib/actions/crud'
import { CertificatesManager } from '@/components/admin/certificates-manager'

export default async function CertificatesPage() {
  const certificates = await getCertificates()
  return (
    <div className="space-y-8">
      <PageHeader />
      <CertificatesManager certificates={certificates} />
    </div>
  )
}
