'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Certificate } from '@/lib/types'

const formatIssueDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

interface CertificatesSectionProps {
  certificates: Certificate[]
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const firstCardRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

  const needsScroll = certificates.length > 4

  // Measure height of one card, then set container to fit exactly 2 rows + gap
  useEffect(() => {
    if (!needsScroll || !firstCardRef.current) return

    const measure = () => {
      const card = firstCardRef.current
      if (!card) return
      const cardHeight = card.getBoundingClientRect().height
      // 2 rows of cards + 1 gap (20px from gap-5)
      setContainerHeight(cardHeight * 2 + 20)
    }

    // Measure after images load
    const timer = setTimeout(measure, 500)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
    }
  }, [needsScroll])

  return (
    <section className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row bg-[#121214]/50 backdrop-blur-lg" id="certificates">

      {/* LEFT SIDE (DARK TITLE) */}
      <div className="lg:w-[30%] bg-[#09090b]/80 text-white p-8 md:p-12 flex flex-col justify-center min-h-[250px] lg:min-h-[400px] border-r border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic mb-4">Sertifikat</h2>
          <div className="w-12 h-0.5 bg-white/30 mb-6"></div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Beberapa sertifikat yang pernah saya peroleh selama ini.
          </p>
        </div>
      </div>

      {/* RIGHT (CERTIFICATE GRID) */}
      <div className="lg:w-[70%] bg-[#0f0f11]/40 p-6 md:p-8 flex flex-col justify-center backdrop-blur-sm">
        <div 
          className={needsScroll && containerHeight ? 'overflow-y-auto pr-2 custom-scrollbar' : ''}
          style={needsScroll && containerHeight ? { maxHeight: containerHeight } : undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {certificates.map((cert, idx) => (
              <motion.div
                ref={idx === 0 ? firstCardRef : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedCert(cert)
                  }
                }}
                className="bg-[#1c1c1f]/80 backdrop-blur-md border border-white/10 rounded-lg shadow-sm hover:shadow-2xl hover:border-white/20 hover:bg-[#232326]/90 transition-all duration-300 hover:shadow-sky-500/5 group overflow-hidden flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50"
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
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate Zoom Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
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
                className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Tutup"
              >
                <span className="text-xs font-bold font-mono">✕</span>
              </button>

              {/* Certificate Image Frame */}
              <div className="relative flex-1 bg-[#121214] p-4 flex items-center justify-center overflow-hidden min-h-[300px]">
                {selectedCert.image_url ? (
                  <div className="relative w-full aspect-[4/3] max-h-[70vh]">
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
              </div>

              {/* Info & Action Bar */}
              <div className="p-5 bg-[#121214] border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base leading-tight mb-1">{selectedCert.title}</h3>
                  <p className="text-zinc-400 text-xs">{selectedCert.issuer} {selectedCert.issue_date && `• ${formatIssueDate(selectedCert.issue_date)}`}</p>
                </div>
                
                {selectedCert.credential_url && (
                  <a 
                    href={selectedCert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-5 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-zinc-200 transition-colors flex-shrink-0"
                  >
                    Verifikasi Kredensial
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
