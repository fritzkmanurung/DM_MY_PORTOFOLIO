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

  const half = Math.ceil(faqs.length / 2)
  const col1 = faqs.slice(0, half)
  const col2 = faqs.slice(half)

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#121214]/50 backdrop-blur-lg text-white flex flex-col lg:flex-row" id="faq">

      {/* LEFT TITLE */}
      <div className="lg:w-[25%] p-8 md:p-10 flex flex-col justify-between border-r border-white/10 bg-[#09090b]/40 backdrop-blur-md">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic mb-4">Pertanyaan Umum</h2>
          <div className="w-10 h-0.5 bg-white/20 mb-4"></div>
          <p className="text-zinc-200 text-sm leading-relaxed">
            Beberapa pertanyaan yang sering ditanyakan. Kalau belum terjawab di sini, langsung hubungi saya saja ya!
          </p>
        </div>
        <button className="bg-white text-black px-6 py-3.5 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors w-fit mt-8">
          MARI KITA BICARAKAN
        </button>
      </div>

      {/* RIGHT ACCORDIONS */}
      <div className="lg:w-[75%] p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* Column 1 */}
        <div className="flex flex-col gap-3">
          {col1.map((faq, idx) => (
            <div key={faq.id} className="bg-[#1c1c1f]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors"
              >
                <span className="font-bold text-sm leading-relaxed">{faq.question}</span>
                <div className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 text-zinc-500 text-sm leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-3">
          {col2.map((faq, idx) => {
            const actualIdx = idx + half
            return (
              <div key={faq.id} className="bg-[#1c1c1f]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(actualIdx)}
                  className="w-full text-left p-5 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-sm leading-relaxed">{faq.question}</span>
                  <div className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${openIndex === actualIdx ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === actualIdx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-zinc-300 text-sm leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
