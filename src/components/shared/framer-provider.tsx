'use client'

import { LazyMotion, domMax } from 'framer-motion'
import { ReactNode } from 'react'

interface FramerProviderProps {
  children: ReactNode
}

export function FramerProvider({ children }: FramerProviderProps) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  )
}
