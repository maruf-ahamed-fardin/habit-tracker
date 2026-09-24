'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { format, addDays, startOfWeek } from 'date-fns'

const TODAY = format(new Date(), 'yyyy-MM-dd')
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeeklyBarChart() {
  const { habits, checks } = useAppStore()
  const [weekOffset, setWeekOffset] = useState(0)

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd')
  )
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`

  const bars = weekDays.map(date => {
    const total = habits.length
    const done = habits.filter(h => checks.some(c => c.habitId === h.id && c.date === date)).length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    const isFuture = date > TODAY
    const isToday = date === TODAY
    return { date, done, total, pct, isFuture, isToday }
  })

  const maxPct = Math.max(...bars.map(b => b.pct), 1)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          Weekly Activity
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-mono px-3" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {weekLabel}
          </span>
          <button
            onClick={() => { if (weekOffset < 0) setWeekOffset(o => o + 1) }}
            disabled={weekOffset >= 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between gap-2 h-48">
        {bars.map(({ date, done, total, pct, isFuture, isToday }, i) => {
          const heightPct = (pct / maxPct) * 100
          const color = isToday
            ? '#3fd68f'
            : pct === 100
            ? '#3fd68f'
            : pct > 0
            ? '#60a5fa'
            : 'var(--bg-elevated)'

          return (
            <div key={date} className="flex flex-col items-center gap-2 flex-1">
              {/* Count label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: pct > 0 && !isFuture ? 1 : 0, y: pct > 0 ? 0 : -10 }}
                transition={{ delay: i * 0.05 + 0.3 }}
                className="text-xs font-mono font-bold"
                style={{ color, fontFamily: 'var(--font-mono)', minHeight: '16px' }}
              >
                {pct > 0 && !isFuture ? `${pct}%` : ''}
              </motion.div>

              {/* Bar */}
              <div
                className="w-full rounded-t-lg relative flex-1 flex items-end"
                style={{ background: 'var(--bg-elevated)', borderRadius: '6px 6px 0 0' }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isFuture ? '0%' : `${heightPct}%` }}
                  transition={{
                    delay: i * 0.05,
                    type: 'spring' as const,
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="w-full rounded-t-lg absolute bottom-0"
                  style={{
                    background: isFuture
                      ? 'transparent'
                      : `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
                    boxShadow: !isFuture && pct > 0 ? `0 0 8px ${color}40` : 'none',
                    border: isToday ? `1px solid ${color}` : 'none',
                  }}
                />
              </div>

              {/* Day label */}
              <div className="text-center">
                <div
                  className="text-xs font-semibold"
                  style={{
                    color: isToday ? 'var(--accent-amber)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {DAY_LABELS[i]}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

