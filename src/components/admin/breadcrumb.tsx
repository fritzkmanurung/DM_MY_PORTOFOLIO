'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROUTE_MAP: Record<string, string> = {
  admin: 'Admin',
  profile: 'Profil',
  projects: 'Proyek',
  'project-categories': 'Kategori',
  technologies: 'Teknologi',
  skills: 'Skill',
  experiences: 'Pengalaman',
  educations: 'Pendidikan',
  services: 'Layanan',
  certificates: 'Sertifikat',
  faqs: 'FAQ',
  resumes: 'Resume',
  settings: 'Pengaturan',
  new: 'Tambah Baru',
  edit: 'Edit',
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
      <Link 
        href="/admin" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = ROUTE_MAP[segment] || (segment.length > 20 ? 'Detail' : segment)

        // Don't show "Admin" as the first segment if we already have the Home icon
        if (segment === 'admin' && index === 0) return null

        return (
          <div key={href} className="flex items-center gap-1.5 capitalize">
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {label}
              </span>
            ) : (
              <Link 
                href={href} 
                className="hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
