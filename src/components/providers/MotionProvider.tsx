'use client'

import { MotionConfig } from 'framer-motion'

/** Framer Motion honours the OS "reduce motion" setting app-wide. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
