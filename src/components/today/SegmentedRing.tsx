'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { duration, easeOut } from '@/lib/motion'

interface Segment {
  id: string
  color: string
  done: boolean
}

/**
 * A progress ring with one arc per habit, so what's left reads at a glance.
 * On first paint the done arcs draw in one after another; afterwards each arc
 * animates on its own when its habit is checked.
 */
export function SegmentedRing({
  segments,
  size = 128,
  stroke = 11,
  children,
}: {
  segments: Segment[]
  size?: number
  stroke?: number
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = size / 2
  const n = segments.length
  const gap = n > 1 ? Math.min(14, (360 / n) * 0.35) : 0
  // Once the opening stagger has played, arcs respond instantly.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 100 + n * 70)
    return () => clearTimeout(t)
  }, [n])

  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return `${(c + r * Math.cos(rad)).toFixed(2)} ${(c + r * Math.sin(rad)).toFixed(2)}`
  }
  const arc = (i: number) => {
    const a0 = (i * 360) / n + gap / 2
    const a1 = ((i + 1) * 360) / n - gap / 2
    return `M ${point(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${point(a1)}`
  }
  const fill = (i: number) => ({
    duration: duration.slow,
    ease: easeOut,
    delay: settled ? 0 : 0.1 + i * 0.07,
  })

  const allDone = n > 0 && segments.every(s => s.done)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="block"
        animate={allDone ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {n <= 1 ? (
          <>
            <circle cx={c} cy={c} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
            {n === 1 && (
              <motion.circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={segments[0].color}
                strokeWidth={stroke}
                strokeLinecap="round"
                transform={`rotate(-90 ${c} ${c})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: segments[0].done ? 1 : 0, opacity: segments[0].done ? 1 : 0 }}
                transition={fill(0)}
              />
            )}
          </>
        ) : (
          segments.map((s, i) => (
            <g key={s.id}>
              <path d={arc(i)} fill="none" stroke="var(--muted)" strokeWidth={stroke} strokeLinecap="round" />
              <motion.path
                d={arc(i)}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: s.done ? 1 : 0, opacity: s.done ? 1 : 0 }}
                transition={fill(i)}
              />
            </g>
          ))
        )}
      </motion.svg>
      {allDone && (
        <span
          aria-hidden="true"
          className="check-pulse pointer-events-none absolute inset-0 rounded-full bg-primary/40"
        />
      )}
      <div className="absolute inset-0 grid place-content-center text-center">{children}</div>
    </div>
  )
}
