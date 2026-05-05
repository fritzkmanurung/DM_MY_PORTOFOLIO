'use client'

import { useState, useEffect } from 'react'
import { Home, User, Briefcase, Award, GraduationCap, Mail } from 'lucide-react'

interface MobileNavProps {
  siteSettings: Record<string, string>
}

export function MobileNav({ siteSettings }: MobileNavProps) {
  const [activeSection, setActiveSection] = useState<string>('hero')

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Detect when section is roughly in the middle
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id || 'hero')
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Elements to observe
    const sections = ['profile', 'works', 'certificates', 'experience', 'services', 'faq', 'contact']
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    // Special case for hero (top of page)
    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection('hero')
      }
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const getLinkClass = (id: string) => {
    const isActive = activeSection === id
    return `w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
      isActive 
        ? 'bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
        : 'text-zinc-400 hover:bg-white/10 hover:text-white'
    }`
  }

  return (
    <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 bg-black/60 backdrop-blur-xl px-2.5 py-2.5 rounded-[2rem] border border-white/10 shadow-2xl">
      <a href="#" className={getLinkClass('hero')} title="Beranda">
        <Home className="w-5 h-5" />
      </a>
      
      {(siteSettings['section_profile'] ?? 'true') === 'true' && (
        <a href="#profile" className={getLinkClass('profile')} title="Tentang">
          <User className="w-5 h-5" />
        </a>
      )}
      
      {(siteSettings['section_projects'] ?? 'true') === 'true' && (
        <a href="#works" className={getLinkClass('works')} title="Proyek">
          <Briefcase className="w-5 h-5" />
        </a>
      )}

      {(siteSettings['section_certificates'] ?? 'true') === 'true' && (
        <a href="#certificates" className={getLinkClass('certificates')} title="Sertifikat">
          <Award className="w-5 h-5" />
        </a>
      )}

      {(siteSettings['section_experience'] ?? 'true') === 'true' && (
        <a href="#experience" className={getLinkClass('experience')} title="Pengalaman">
          <GraduationCap className="w-5 h-5" />
        </a>
      )}

      {(siteSettings['section_footer'] ?? 'true') === 'true' && (
        <a href="#contact" className={getLinkClass('contact')} title="Kontak">
          <Mail className="w-5 h-5" />
        </a>
      )}
    </nav>
  )
}
