'use client'

import { motion } from 'framer-motion'
import type { Experience } from '@/lib/types'

interface ExperienceSectionProps {
  experiences: Experience[]
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Sekarang'
    return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  }

  return (
    <section className="px-6 py-16 md:py-32 relative" id="experience">
      <div className="mx-auto max-w-4xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center space-y-4 mb-20"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">Perjalanan</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic">Pengalaman</h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative space-y-0">
          {/* Vertical line with gradient */}
          <div className="absolute left-[27px] sm:left-1/2 top-4 bottom-4 w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative flex flex-col sm:flex-row items-start sm:justify-between w-full mb-16 last:mb-0 ${
                index % 2 === 0 ? 'sm:flex-row-reverse' : ''
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-[27px] sm:left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-[0_0_0_4px_var(--color-primary-20)]" />

              {/* Content box */}
              <div className="w-full sm:w-[45%] pl-16 sm:pl-0">
                <div className={`rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 sm:p-6 hover:bg-card/50 transition-colors shadow-sm ${
                  index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'
                }`}>
                  
                  {/* DESKTOP VIEW (hidden on mobile) */}
                  <div className="hidden sm:block space-y-2">
                    <h3 className="text-xl font-bold leading-tight">{exp.position}</h3>
                    <p className="text-base font-medium text-foreground/80">{exp.company_name}</p>
                    <div className="pt-1 pb-2">
                      <span className="inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>

                  {/* MOBILE VIEW (hidden on desktop) */}
                  <div className="flex sm:hidden flex-col gap-1.5">
                    <h3 className="text-base font-bold text-foreground leading-tight">{exp.position}</h3>
                    <p className="text-sm font-medium text-foreground/80">{exp.company_name}</p>
                    <span className="inline-block w-fit rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary mt-1 mb-1">
                      {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                    </span>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
