'use client'

import { motion } from 'framer-motion'
import { Code2, PenTool, Pen, Monitor, Palette, Globe, Wrench, Layers } from 'lucide-react'
import type { Service, Technology } from '@/lib/types'

// Map icon_name strings from DB to actual lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, PenTool, Pen, Monitor, Palette, Globe, Wrench, Layers
}

interface ServicesSectionProps {
  services: Service[]
  technologies: Technology[]
}

export function ServicesSection({ services, technologies }: ServicesSectionProps) {
  // Use first 6 technologies for the sidebar skill icons
  const displayTechnologies = technologies.slice(0, 6)

  return (
    <section className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row bg-[#121214]/50 backdrop-blur-lg" id="services">

      {/* LEFT SIDEBAR (LIGHT - Skill Icons from DB) */}
      <div className="lg:w-[20%] bg-zinc-900/40 p-6 md:p-8 flex flex-wrap lg:flex-col gap-3 items-center justify-center border-r border-white/10 backdrop-blur-md">
        {displayTechnologies.map((tech, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            key={tech.id}
            className="w-16 h-16 rounded-2xl bg-gradient-to-b from-zinc-600 to-zinc-900 shadow-xl border border-zinc-500/20 flex items-center justify-center flex-shrink-0"
            title={tech.name}
          >
            <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center text-white text-xs font-bold">
              {tech.name.length > 4 ? tech.name.slice(0, 3) : tech.name}
            </div>
          </motion.div>
        ))}
      </div>

      {/* RIGHT SIDE (DARK) */}
      <div className="lg:w-[80%] bg-[#09090b]/60 text-white p-8 md:p-12 backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic mb-3">Layanan Saya</h2>
            <div className="w-12 h-0.5 bg-white/30 mb-4"></div>
            <p className="text-zinc-300 text-sm max-w-md leading-relaxed">
              Berikut beberapa hal yang bisa saya bantu untuk kebutuhan digital Anda.
            </p>
          </div>
        </div>

        {/* Services Grid (from DB) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, idx) => {
            const IconComponent = iconMap[service.icon_name || ''] || Code2
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={service.id}
                className="bg-[#1c1c1f]/80 border border-white/10 rounded-2xl p-6 hover:bg-[#232326]/90 backdrop-blur-md transition-all group shadow-sm hover:shadow-2xl"
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
  )
}
