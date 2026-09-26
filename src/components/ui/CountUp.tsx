'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { easeOut } from '@/lib/motion'

/** A number that rolls to its new value instead of jumping. */
export function CountUp({
  value,
  duration = 0.7,
  format = (n: number) => String(Math.round(n)),
  className,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    if (reduced || from.current === value) {
      from.current = value
      setShown(value)
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease: easeOut,
      onUpdate: v => setShown(v),
      onComplete: () => {
        from.current = value
      },
    })
    return () => controls.stop()
  }, [value, duration, reduced])

  return (
    <span className={className} suppressHydrationWarning>
      {format(shown)}
    </span>
  )
}
