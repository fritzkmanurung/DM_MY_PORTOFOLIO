'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Certificate } from '@/lib/types'

interface CertificatesSectionProps {
  certificates: Certificate[]
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const firstCardRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)

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
      <div className="lg:w-[35%] bg-[#09090b]/80 text-white p-8 md:p-12 flex flex-col justify-center min-h-[250px] lg:min-h-[400px] border-r border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic mb-4">Sertifikat & Prestasi</h2>
          <div className="w-12 h-0.5 bg-white/30 mb-6"></div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Beberapa pencapaian dan sertifikat yang pernah saya peroleh selama ini.
          </p>
        </div>
      </div>

      {/* RIGHT (CERTIFICATE GRID) */}
      <div className="lg:w-[65%] bg-[#0f0f11]/40 p-6 md:p-8 flex flex-col justify-center backdrop-blur-sm">
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
                className="bg-[#1c1c1f]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-sm hover:shadow-xl hover:border-white/20 hover:bg-[#232326]/90 transition-colors duration-300 group overflow-hidden flex flex-col"
              >
                <div className="w-full aspect-[4/3] bg-white/5 rounded-lg mb-3 overflow-hidden border border-white/5 relative">
                  {cert.image_url ? (
                    <Image 
                      src={cert.image_url} 
                      alt={cert.title} 
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-all duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-bold">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-60" />
                </div>
                <h3 className="font-bold text-sm mb-1 leading-tight text-white group-hover:text-primary transition-colors h-9 flex items-start line-clamp-2">{cert.title}</h3>
                <p className="text-zinc-400 text-[11px] leading-relaxed h-8 overflow-hidden line-clamp-2">{cert.issuer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
