'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ExternalLink, ShieldCheck, Calendar, Building2 } from 'lucide-react'
import type { Certificate } from '@/lib/types'

const formatIssueDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    }
  }
} as const

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 15
    }
  }
} as const

interface CertificatesSectionProps {
  certificates: Certificate[]
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      checkScroll()
      const timer = setTimeout(checkScroll, 300)
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
        clearTimeout(timer)
      }
    }
  }, [certificates])

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return

    const children = Array.from(el.children) as HTMLElement[]
    if (children.length === 0) return

    const containerLeft = el.getBoundingClientRect().left
    const scrollLeft = el.scrollLeft
    const targetOffset = direction === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75
    const targetScrollLeft = scrollLeft + targetOffset

    // Find the card closest to target position
    let bestScrollLeft = targetScrollLeft
    let minDiff = Infinity

    children.forEach((child) => {
      const childScrollLeft = scrollLeft + (child.getBoundingClientRect().left - containerLeft)
      const diff = Math.abs(childScrollLeft - targetScrollLeft)
      if (diff < minDiff) {
        minDiff = diff
        bestScrollLeft = childScrollLeft
      }
    })

    // Clamp the target scroll position
    const maxScroll = el.scrollWidth - el.clientWidth
    const finalScrollLeft = Math.max(0, Math.min(bestScrollLeft, maxScroll))

    // Smooth ease-out cubic scroll animation
    const start = el.scrollLeft
    const change = finalScrollLeft - start
    const startTime = performance.now()
    const duration = 500 // ms

    const originalSnap = el.style.scrollSnapType
    const originalBehavior = el.style.scrollBehavior
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3)
      el.scrollLeft = start + change * ease

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        el.style.scrollSnapType = originalSnap
        el.style.scrollBehavior = originalBehavior
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className="w-full flex flex-col gap-8" id="certificates">
      {/* Section Header (Centered, Outside) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4"
      >
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Pencapaian</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic text-white">Sertifikat</h2>
      </motion.div>

      {/* Slider Area (Unboxed, matching Projects card section width) */}
      <div className="w-full relative flex flex-col">
        
        {/* Navigation Arrows (Apple/Airbnb Style at Top Right) */}
        <div className="flex justify-end gap-2 mb-4 z-10">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={isMounted ? !canScrollLeft : false}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={isMounted ? !canScrollRight : false}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container with Snapping */}
        <motion.div 
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-5 pb-6 no-scrollbar"
        >
          {certificates.map((cert) => (
            <motion.div
              variants={cardVariants}
              key={cert.id}
              className="w-[250px] sm:w-[290px] flex-shrink-0 snap-start h-full py-1"
            >
              <div
                onClick={() => setSelectedCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedCert(cert)
                  }
                }}
                className="bg-[#1c1c1f]/80 backdrop-blur-md border border-white/10 rounded-lg shadow-sm hover:shadow-2xl hover:border-white/20 hover:bg-[#232326]/90 transition-all duration-300 hover:shadow-sky-500/5 group overflow-hidden flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50 w-full h-full"
              >
                {/* Image Area with Badge (Full-bleed) */}
                <div className="w-full aspect-[16/10] bg-zinc-950 border-b border-white/10 overflow-hidden group-hover:border-white/20 transition-colors relative">
                  {/* Badge Kredensial */}
                  <span className="absolute top-2.5 left-2.5 z-10 bg-[#09090b]/85 backdrop-blur-md text-zinc-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    Kredensial
                  </span>

                  {cert.image_url ? (
                    <Image 
                      src={cert.image_url} 
                      alt={cert.title} 
                      fill
                      sizes="(max-width: 640px) 100vw, 290px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-bold">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-40" />
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="font-bold text-sm mb-1.5 leading-snug text-white group-hover:text-sky-400 transition-colors duration-300 h-10 flex items-start line-clamp-2">
                    {cert.title}
                  </h3>

                  {/* Info Footer (Issuer & Date) */}
                  <div className="flex items-center justify-between text-zinc-500 text-[10px] mt-auto pt-2 border-t border-white/5">
                    <span className="truncate max-w-[70%] font-medium group-hover:text-zinc-400 transition-colors">{cert.issuer}</span>
                    {cert.issue_date && (
                      <span className="text-zinc-600 font-mono text-[9px] group-hover:text-zinc-500 transition-colors">
                        {formatIssueDate(cert.issue_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Certificate Zoom Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative max-w-4xl w-full bg-[#1c1c1f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col z-10 max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 transition-all duration-300 hover:scale-110 cursor-pointer shadow-md"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Certificate Image Frame */}
              <div className="relative flex-1 bg-gradient-to-b from-[#121214] to-[#09090b] p-6 md:p-8 flex items-center justify-center overflow-hidden min-h-[300px]">
                {selectedCert.image_url ? (
                  <div className="relative w-full aspect-[4/3] max-h-[60vh] shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-white/5 rounded-lg overflow-hidden">
                    <Image 
                      src={selectedCert.image_url} 
                      alt={selectedCert.title} 
                      fill
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-contain" 
                    />
                  </div>
                ) : (
                  <div className="text-zinc-600 text-sm font-bold uppercase tracking-widest">No Image</div>
                )}
                {/* Subtle top/bottom shadow gradients */}
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Info & Action Bar */}
              <div className="p-6 md:px-8 bg-[#121214] border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 flex-shrink-0">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      Kredensial Terverifikasi
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base md:text-lg leading-tight tracking-tight">{selectedCert.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      {selectedCert.issuer}
                    </span>
                    {selectedCert.issue_date && (
                      <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {formatIssueDate(selectedCert.issue_date)}
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedCert.credential_url && (
                  <div className="flex-shrink-0 flex items-center">
                    <a 
                      href={selectedCert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full hover:bg-zinc-200 transition-all duration-300 shadow-[0_4px_12px_rgba(255,255,255,0.05)] w-full sm:w-auto justify-center"
                    >
                      Verifikasi Kredensial <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
