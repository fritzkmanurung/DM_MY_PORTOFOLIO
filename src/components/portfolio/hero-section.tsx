'use client'

import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types'

interface HeroSectionProps {
  profile: Profile | null
  siteSettings?: Record<string, string>
}

export function HeroSection({ profile, siteSettings }: HeroSectionProps) {
  // Split hero_title by newlines for multi-line display
  const heroTitle = profile?.hero_title || 'Welcome\nto\nMy Portofolio Website'
  const titleLines = heroTitle.split('\n')

  return (
    <section id="hero" className="relative min-h-screen bg-[#f8f8f8] overflow-hidden flex flex-col items-center justify-center">
      {/* 3D Object Behind Text */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[280px] h-[280px] md:w-[500px] md:h-[500px] opacity-40 pointer-events-none z-0"
      >
        <div className="absolute inset-0 rounded-full border-2 border-black/20"></div>
        <div className="absolute inset-6 rounded-[40%] border-2 border-black/15 rotate-45"></div>
        <div className="absolute inset-14 rounded-[35%] border-2 border-black/10 rotate-[60deg]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-400/30 to-transparent blur-3xl rounded-full"></div>
      </motion.div>

      {/* Top Label */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <img src="/logo.webp" alt="Logo" className="w-6 h-6 object-contain opacity-80" />
        <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
          {profile?.hero_tagline || 'Digital Portofolio'}
        </span>
      </div>

      {/* Main Content - All Centered */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center flex flex-col items-center px-6"
      >
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[1.1] text-black tracking-tight mb-4">
          {titleLines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </h1>

        <p className="text-zinc-500 text-[11px] sm:text-sm md:text-base leading-relaxed mb-16 max-w-md px-4">
          {profile?.hero_subtitle || 'Mentransformasi visi menjadi realitas digital melalui kode presisi dan desain inovatif.'}
        </p>

        <a href="#works">
          <button className="bg-black text-white px-7 py-3.5 sm:px-10 sm:py-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase hover:bg-zinc-800 transition-colors flex items-center gap-3">
            LIHAT KARYA SAYA
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </a>
      </motion.div>

      {/* Bottom Labels */}
      <div className="absolute bottom-8 left-8 z-10">
        <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold">{profile?.location || 'Based Worldwide'}</span>
      </div>
      <div className="absolute bottom-8 right-8 z-10">
        <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold">Terbuka untuk Kolaborasi</span>
      </div>
    </section>
  )
}
