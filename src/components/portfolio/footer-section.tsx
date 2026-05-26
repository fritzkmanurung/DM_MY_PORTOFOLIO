'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { GithubIcon, LinkedinIcon, GmailIcon, InstagramIcon } from '@/components/icons'
import { Globe, Clock } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface FooterSectionProps {
  profile: Profile | null
  siteSettings: Record<string, string>
}

export function FooterSection({ profile, siteSettings }: FooterSectionProps) {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(() => {
      setTime(new Date())
    })
    const timer = setInterval(() => {
      setTime(new Date())
    }, 60000)
    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(timer)
    }
  }, [])

  const fullName = profile?.full_name || 'Your Name'
  const firstName = fullName.split(' ')[0]
  const initial = firstName.charAt(0).toUpperCase()
  const roleTitle = profile?.role_title || 'Developer'
  const bio = profile?.bio || ''

  // Build social links dynamically from profile
  const socialLinks = [
    { href: profile?.linkedin_url, icon: LinkedinIcon, label: 'LinkedIn' },
    { href: profile?.github_url, icon: GithubIcon, label: 'GitHub' },
    { href: profile?.instagram_url, icon: InstagramIcon, label: 'Instagram' },
    { href: profile?.email ? `mailto:${profile.email}` : null, icon: GmailIcon, label: 'Email' },
  ].filter(link => link.href)

  return (
    <div id="contact" className="w-full flex flex-col gap-12 mt-12">

      {/* FOOTER BAR */}
      <footer className="w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#09090b] text-white flex flex-col md:flex-row p-10 md:p-14 gap-12 relative">
        {/* Subtle Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Left: Brand */}
        <div className="md:w-[35%] flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo.webp" alt="Logo" width={48} height={48} className="rounded-2xl object-contain shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white p-2" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tighter leading-none">{fullName}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-bold">{roleTitle}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href!} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 shadow-sm">
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Center & Right Wrapper for Mobile Row */}
        <div className="flex flex-row justify-between w-full mt-8 md:mt-0 md:contents">
          
          {/* Center: Quick Links */}
          <div className="w-[45%] md:w-[25%] flex flex-col md:items-center">
            <div className="w-fit">
              <h4 className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-6 md:mb-8 border-l-2 border-white/10 pl-4">Tautan Cepat</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="#" className="text-zinc-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-white transition-all"></span>
                    Beranda
                  </a>
                </li>
                {(siteSettings['section_profile'] ?? 'true') === 'true' && (
                  <li>
                    <a href="#profile" className="text-zinc-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-white transition-all"></span>
                      Tentang
                    </a>
                  </li>
                )}
                {(siteSettings['section_projects'] ?? 'true') === 'true' && (
                  <li>
                    <a href="#works" className="text-zinc-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-white transition-all"></span>
                      Proyek
                    </a>
                  </li>
                )}
                {(siteSettings['section_certificates'] ?? 'true') === 'true' && (
                  <li>
                    <a href="#certificates" className="text-zinc-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-white transition-all"></span>
                      Sertifikat
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Right: Status & Local Time */}
          <div className="w-[50%] md:w-[40%] flex flex-col md:items-end">
            <div className="md:bg-white/[0.02] md:border md:border-white/5 rounded-none md:rounded-[1.5rem] md:p-6 relative overflow-hidden group hover:border-white/10 transition-colors w-full md:w-fit md:min-w-[280px]">
              
              {/* Availability (Hidden on Mobile) */}
              <div className="hidden md:flex items-center gap-3 mb-6">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Tersedia untuk proyek baru</span>
              </div>

              <div className="hidden md:block w-full h-px bg-white/5 mb-6"></div>

              {/* Local Time */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3 hidden md:block" /> Waktu Lokal <span className="hidden md:inline">(GMT+7)</span>
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                  <span className="text-xl md:text-3xl font-serif italic font-bold tracking-tighter text-white">
                    {time ? time.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs text-zinc-400 font-medium mt-1">
                  Samosir, Indonesia
                </span>
              </div>

            </div>
          </div>
        </div>
      </footer>

      {/* Copyright */}
      <div className="flex flex-col md:flex-row items-center justify-between text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] px-4 pb-8">
        <div>&copy; {new Date().getFullYear()} {fullName}.</div>
      </div>
    </div>
  )
}
