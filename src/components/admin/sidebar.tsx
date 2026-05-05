'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  User,
  FolderKanban,
  Cpu,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  GraduationCap,
  Wrench,
  Award,
  HelpCircle,
  Settings,
  Brain,
  FolderTree,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/profile', label: 'Profil', icon: User },
      { href: '/admin/resumes', label: 'Resume / CV', icon: FileText },
      { href: '/admin/settings', label: 'Pengaturan Situs', icon: Settings },
    ]
  },
  {
    label: 'Konten Portofolio',
    items: [
      { href: '/admin/projects', label: 'Proyek', icon: FolderKanban },
      { href: '/admin/project-categories', label: 'Kategori Proyek', icon: FolderTree },
      { href: '/admin/technologies', label: 'Teknologi', icon: Cpu },
      { href: '/admin/skills', label: 'Skill', icon: Brain },
      { href: '/admin/services', label: 'Layanan', icon: Wrench },
    ]
  },
  {
    label: 'Riwayat & Pencapaian',
    items: [
      { href: '/admin/experiences', label: 'Pengalaman', icon: Briefcase },
      { href: '/admin/educations', label: 'Pendidikan', icon: GraduationCap },
      { href: '/admin/certificates', label: 'Sertifikat', icon: Award },
    ]
  },
  {
    label: 'Bantuan',
    items: [
      { href: '/admin/faqs', label: 'FAQ', icon: HelpCircle },
    ]
  }
]

interface AdminSidebarProps {
  userEmail: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-6 font-bold text-lg">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          P
        </div>
        Admin Panel
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href ||
                  (href !== '/admin' && pathname.startsWith(href))

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Lihat Portofolio
        </Link>

        <div className="px-3 py-1">
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>

        <form action={logout}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" type="submit">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </form>
      </div>
    </aside>
  )
}
