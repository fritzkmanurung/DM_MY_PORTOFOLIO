import { redirect } from 'next/navigation'
import { getUser } from '@/lib/actions/auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Breadcrumb } from '@/components/admin/breadcrumb'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto">
        <div className="p-12">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  )
}
