'use client'

import { motion } from 'framer-motion'
import { Heatmap } from '@/components/analytics/Heatmap'
import { WeeklyBarChart } from '@/components/analytics/WeeklyBarChart'
import { TrendLineChart } from '@/components/analytics/TrendLineChart'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { useAppStore } from '@/store/useAppStore'

export default function AnalyticsPage() {
  const { isLoading, habits } = useAppStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full"
          style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--accent-green)' }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Analytics & Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Deep dive into your consistency, completion velocity, and activity patterns
          </p>
        </div>

        {/* Stats grid */}
        <div>
          <StatsGrid />
        </div>

        {/* Trend line chart */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <TrendLineChart />
        </div>

        {/* Two-column: bar chart + heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <WeeklyBarChart />
          </div>

          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Heatmap />
          </div>
        </div>

        {/* Per-habit completion table */}
        {habits.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="p-5 border-b border-[var(--border)]">
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Habits Breakdown
              </h3>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <span className="text-2xl">{habit.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {habit.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Goal: {habit.weeklyGoal} days/week
                    </div>
                  </div>
                  <div
                    className="text-xs px-2.5 py-1 rounded-full font-mono font-bold"
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--accent-green)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    Active
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
