'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface HeroProgressRingProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
  showHeadline?: boolean
}

export function HeroProgressRing({
  completed,
  total,
  size = 136,
  strokeWidth = 10,
  showHeadline = false,
}: HeroProgressRingProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total === 0 ? 0 : Math.min(completed / total, 1)
  const offset = circumference * (1 - (mounted ? pct : 0))

  const headline = () => {
    if (total === 0) return 'Add a habit to get started'
    if (pct === 1) return '✨ Perfect day!'
    if (pct === 0) return "Ready to start today's journey?"
    return `${completed} of ${total} completed today`
  }

  const ringColor =
    pct === 1
      ? '#10b981'
      : pct >= 0.5
      ? '#34d399'
      : pct > 0
      ? '#f59e0b'
      : 'rgba(255, 255, 255, 0.12)'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Subtle background glow */}
        {pct > 0 && (
          <div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none opacity-25"
            style={{
              background: pct === 1 ? '#10b981' : '#f59e0b',
            }}
          />
        )}

        {/* Background track */}
        <svg width={size} height={size} className="absolute inset-0">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Active progress track */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <defs>
            <linearGradient id="habit-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={pct >= 0.8 ? 'url(#habit-ring-gradient)' : ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <motion.span
            key={completed}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-mono font-bold tracking-tight"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {Math.round(pct * 100)}%
          </motion.span>
          <span
            className="text-[11px] font-semibold uppercase tracking-wider mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Done
          </span>
        </div>
      </div>

      {showHeadline && (
        <motion.div
          key={headline()}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-3"
        >
          <p
            className="text-sm font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {headline()}
          </p>
        </motion.div>
      )}
    </div>
  )
}
