'use client'

import { motion } from 'framer-motion'

interface Segment {
  id: string
  color: string
  done: boolean
}

/** A progress ring with one arc per habit, so what's left reads at a glance. */
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
  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return `${(c + r * Math.cos(rad)).toFixed(2)} ${(c + r * Math.sin(rad)).toFixed(2)}`
  }
  const arc = (i: number) => {
    const a0 = (i * 360) / n + gap / 2
    const a1 = ((i + 1) * 360) / n - gap / 2
    return `M ${point(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${point(a1)}`
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="block">
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
                initial={false}
                animate={{ pathLength: segments[0].done ? 1 : 0, opacity: segments[0].done ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
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
                initial={false}
                animate={{ pathLength: s.done ? 1 : 0, opacity: s.done ? 1 : 0 }}
                transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </g>
          ))
        )}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">{children}</div>
    </div>
  )
}
