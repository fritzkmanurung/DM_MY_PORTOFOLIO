'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { FAQ } from '@/lib/types'

interface FaqSectionProps {
  faqs: FAQ[]
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#121214]/50 backdrop-blur-lg text-white flex flex-col lg:flex-row" id="faq">

      {/* LEFT TITLE */}
      <div className="lg:w-[30%] p-8 md:p-10 flex flex-col justify-between border-r border-white/10 bg-[#09090b]/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic mb-4">FAQ</h2>
          <div className="w-10 h-0.5 bg-white/20 mb-4"></div>
          <p className="text-zinc-200 text-sm leading-relaxed">
            Beberapa pertanyaan yang sering ditanyakan.
          </p>
        </div>
      </div>

      {/* RIGHT ACCORDIONS (1 COLUMN) */}
      <div className="lg:w-[70%] p-6 md:p-10 flex flex-col gap-3.5 justify-center flex-1">
        {faqs.map((faq, idx) => (
          <div 
            key={faq.id} 
            className="bg-[#1c1c1f]/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-sm hover:border-white/20 hover:bg-[#232326]/90 transition-all duration-300"
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full text-left p-4.5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors focus:outline-none"
            >
              <span className="font-bold text-sm leading-snug text-white/90">{faq.question}</span>
              <div className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 bg-white/10 text-white' : 'text-zinc-400'}`}>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="px-4.5 pb-4.5 text-zinc-300 text-xs md:text-sm leading-relaxed border-t border-white/5 pt-3">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
