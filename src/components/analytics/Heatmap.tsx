'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getLast12WeeksGrid, formatDisplay } from '@/lib/dateUtils'
import { sound } from '@/lib/sound'
import { format } from 'date-fns'

const TODAY = format(new Date(), 'yyyy-MM-dd')

interface TooltipData {
  x: number
  y: number
  date: string
  ratio: number
  count: number
  total: number
  note?: string
}

export function Heatmap() {
  const { habits, checks, notes } = useAppStore()
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const grid = getLast12WeeksGrid() // 12 columns of 7-day arrays

  // Build completion map
  const completionMap: Record<string, { done: number; total: number }> = {}
  for (const col of grid) {
    for (const date of col) {
      const total = habits.length
      const done = habits.filter(h => checks.some(c => c.habitId === h.id && c.date === date)).length
      completionMap[date] = { done, total }
    }
  }

  const getIntensity = (done: number, total: number, date: string): number => {
    if (date > TODAY) return -1 // future
    if (total === 0) return 0
    const ratio = done / total
    if (ratio === 0) return 0
    if (ratio <= 0.33) return 1
    if (ratio <= 0.66) return 2
    if (ratio < 1) return 3
    return 4
  }

  const handleCellHover = (e: React.MouseEvent, date: string) => {
    const { done, total } = completionMap[date] || { done: 0, total: 0 }
    const note = notes.find(n => n.date === date)?.content
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      date,
      ratio: total === 0 ? 0 : done / total,
      count: done,
      total,
      note,
    })
  }

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Consistency Heatmap
        </h3>
        <span className="text-xs font-mono text-[var(--text-muted)]">Last 12 Weeks</span>
      </div>

      <div className="heatmap-scroll">
        <div className="relative inline-block" ref={containerRef} style={{ minWidth: '560px' }}>
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 pt-5">
              {DAY_NAMES.map(d => (
                <div
                  key={d}
                  className="text-[10px] font-mono h-4 flex items-center"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {d[0]}
                </div>
              ))}
            </div>

            {/* Grid columns */}
            {grid.map((col, colIdx) => {
              const firstDate = col[0]
              const isFirstOfMonth = firstDate.endsWith('-01') || colIdx === 0

              return (
                <div key={colIdx} className="flex flex-col gap-1">
                  {/* Month label */}
                  <div
                    className="text-[10px] font-mono mb-1 h-4"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {isFirstOfMonth || col.some(d => d.endsWith('-01'))
                      ? format(new Date(col.find(d => d.endsWith('-01')) || col[0] + 'T12:00:00'), 'MMM')
                      : ''}
                  </div>

                  {col.map((date, rowIdx) => {
                    const { done, total } = completionMap[date] || { done: 0, total: 0 }
                    const intensity = getIntensity(done, total, date)
                    const isFuture = date > TODAY
                    const isToday = date === TODAY

                    return (
                      <motion.div
                        key={date}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: (colIdx * 7 + rowIdx) * 0.002,
                          type: 'spring' as const,
                          stiffness: 400,
                          damping: 25,
                        }}
                        whileHover={{ scale: 1.35, zIndex: 30 }}
                        className={`heatmap-cell w-4 h-4 rounded-sm transition-transform cursor-pointer ${
                          intensity >= 0 ? `heatmap-${intensity}` : 'bg-[var(--bg-elevated)]/40'
                        }`}
                        style={{
                          outline: isToday ? '2px solid var(--accent-amber)' : 'none',
                          outlineOffset: '1px',
                          opacity: isFuture ? 0.2 : 1,
                        }}
                        onMouseEnter={e => {
                          if (!isFuture) {
                            handleCellHover(e, date)
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute z-40 pointer-events-none px-3.5 py-2.5 rounded-xl text-xs shadow-xl"
              style={{
                left: Math.min(tooltip.x + 12, 420),
                top: Math.max(tooltip.y - 48, 0),
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-elevated)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                minWidth: '150px',
              }}
            >
              <div className="font-bold text-xs mb-0.5">{formatDisplay(tooltip.date)}</div>
              <div className="font-semibold" style={{ color: 'var(--accent-green)' }}>
                {tooltip.count} of {tooltip.total} habits completed
              </div>
              {tooltip.note && (
                <div className="mt-1.5 pt-1 text-[11px] border-t border-[var(--border-subtle)]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  📝 {tooltip.note}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs">
        <div className="flex items-center gap-1.5">
          <span style={{ color: 'var(--text-muted)' }}>Less</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`heatmap-cell w-3.5 h-3.5 rounded-sm heatmap-${i}`} />
          ))}
          <span style={{ color: 'var(--text-muted)' }}>More</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--accent-amber)]">
          Today: {format(new Date(), 'MMM d')}
        </span>
      </div>
    </div>
  )
}
