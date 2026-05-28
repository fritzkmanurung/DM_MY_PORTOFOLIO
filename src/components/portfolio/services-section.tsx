'use client'

import { motion } from 'framer-motion'
import { Code2, PenTool, Pen, Monitor, Palette, Globe, Wrench, Layers } from 'lucide-react'
import type { Service } from '@/lib/types'

// Map icon_name strings from DB to actual lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, PenTool, Pen, Monitor, Palette, Globe, Wrench, Layers
}

interface ServicesSectionProps {
  services: Service[]
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <div className="w-full flex flex-col gap-8" id="services">
      {/* Section Header (Centered, Outside) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4"
      >
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Penawaran</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic text-white">Layanan</h2>
      </motion.div>

      {/* Main Container */}
      <section className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#121214]/50 backdrop-blur-lg p-8 md:p-12 relative">
        <div className="max-w-4xl mx-auto">
          {/* Services Grid (from DB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, idx) => {
              const IconComponent = iconMap[service.icon_name || ''] || Code2
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={service.id}
                  className="bg-[#1c1c1f]/80 border border-white/10 rounded-lg p-6 hover:bg-[#232326]/90 backdrop-blur-md transition-all group shadow-sm hover:shadow-2xl"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                    <IconComponent className="w-5 h-5 text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{service.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
