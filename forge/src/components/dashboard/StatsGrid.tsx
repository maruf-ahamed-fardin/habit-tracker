'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { getBestOverallStreak } from '@/lib/streak'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { format } from 'date-fns'
import { Flame, TrendingUp, Zap, CheckCircle2 } from 'lucide-react'

const TODAY = format(new Date(), 'yyyy-MM-dd')

const STAT_ITEMS = [
  {
    key: 'active',
    label: 'Active Habits',
    icon: Flame,
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  {
    key: 'completion',
    label: 'This Week',
    icon: TrendingUp,
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.15)',
    suffix: '%',
  },
  {
    key: 'bestStreak',
    label: 'Best Streak',
    icon: Zap,
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.15)',
    suffix: 'd',
  },
  {
    key: 'total',
    label: 'Total Check-ins',
    icon: CheckCircle2,
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.15)',
  },
]

export function StatsGrid() {
  const { habits, checks } = useAppStore()

  // Active habits count
  const active = habits.length

  // This week completion %
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return format(d, 'yyyy-MM-dd')
  }).filter(d => d <= TODAY)

  let weekPossible = 0
  let weekDone = 0
  for (const habit of habits) {
    for (const day of weekDays) {
      weekPossible++
      if (checks.some(c => c.habitId === habit.id && c.date === day)) weekDone++
    }
  }
  const completion = weekPossible === 0 ? 0 : Math.round((weekDone / weekPossible) * 100)

  // Best streak
  const bestStreak = getBestOverallStreak(
    habits.map(h => ({
      id: h.id,
      checks: checks.filter(c => c.habitId === h.id).map(c => c.date),
    }))
  )

  // Total check-ins
  const total = checks.length

  const values: Record<string, number> = { active, completion, bestStreak, total }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5 h-full">
      {STAT_ITEMS.map(({ key, label, icon: Icon, color, glow, suffix }, i) => (
        <SpotlightCard
          key={key}
          spotlightColor={glow}
          className="p-4 sm:p-4.5 flex flex-col justify-between"
          whileHover={{
            y: -2,
            transition: { duration: 0.15 },
          }}
        >
          {/* Subtle colored ambient corner glow */}
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-full blur-xl pointer-events-none opacity-25"
            style={{ background: color, transform: 'translate(30%, -30%)' }}
          />

          <div className="flex items-center justify-between">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: glow }}
            >
              <Icon size={16} style={{ color }} />
            </div>
          </div>

          <div className="mt-3">
            <div
              className="text-2xl sm:text-3xl font-bold font-mono tracking-tight flex items-baseline"
              style={{ color: 'var(--text-primary)' }}
            >
              <AnimatedNumber value={values[key]} />
              {suffix && (
                <span className="text-sm font-semibold ml-0.5" style={{ color }}>
                  {suffix}
                </span>
              )}
            </div>
            <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </div>
          </div>
        </SpotlightCard>
      ))}
    </div>
  )
}
