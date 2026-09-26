'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useLevel } from '@/hooks/useStats'
import { celebrate } from '@/lib/confetti'
import { haptic, springBouncy } from '@/lib/motion'

/**
 * Full-screen moment when the level goes up, wherever it happens.
 * Watches the computed level and shows a burst + badge the first time it rises.
 */
export function LevelUp() {
  const isLoading = useAppStore(s => s.isLoading)
  const { level } = useLevel()
  const prev = useRef<number | null>(null)
  const [shown, setShown] = useState<number | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (prev.current !== null && level > prev.current) {
      setShown(level)
      celebrate()
      haptic([30, 40, 60])
      const t = setTimeout(() => setShown(null), 2600)
      prev.current = level
      return () => clearTimeout(t)
    }
    prev.current = level
  }, [level, isLoading])

  return (
    <AnimatePresence>
      {shown !== null && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShown(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-background/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={springBouncy}
            className="relative grid justify-items-center gap-3 text-center"
          >
            <motion.span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -z-10 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-2xl"
              animate={{ scale: [1, 1.6, 1.2], opacity: [0.8, 0.4, 0.6] }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
            <motion.span
              className="grid size-24 place-items-center rounded-3xl bg-primary font-display text-4xl font-bold text-primary-foreground shadow-[0_20px_50px_-15px_var(--primary)]"
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              transition={{ ...springBouncy, delay: 0.1 }}
            >
              {shown}
            </motion.span>
            <p className="font-display text-2xl font-bold">Level up!</p>
            <p className="text-sm text-muted-foreground">You reached level {shown}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
