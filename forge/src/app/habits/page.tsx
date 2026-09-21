'use client'

import { motion } from 'framer-motion'
import { HabitList } from '@/components/habits/HabitList'
import { QuickAddHabit } from '@/components/habits/QuickAddHabit'
import { useAppStore } from '@/store/useAppStore'
import { calculateStreak } from '@/lib/streak'
import { CATEGORIES } from '@/lib/utils'

export default function HabitsPage() {
  const { habits, checks, isLoading } = useAppStore()

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

  // Category breakdown
  const categoryStats = CATEGORIES.map(cat => {
    const catHabits = habits.filter(h => h.category === cat.value)
    return { ...cat, count: catHabits.length }
  }).filter(c => c.count > 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Habits Management
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Track, organize, and build unbreakable streaks
            </p>
          </div>

          {/* Category pills */}
          {categoryStats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoryStats.map(cat => (
                <div
                  key={cat.value}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}30`,
                    color: cat.color,
                  }}
                >
                  {cat.icon} {cat.label} ({cat.count})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Habit Bar */}
        <div>
          <QuickAddHabit />
        </div>

        {/* Weekly Habit Matrix */}
        <div>
          <HabitList />
        </div>

        {/* Individual habit overview cards */}
        {habits.length > 0 && (
          <div className="pt-2">
            <h2
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Habit Cards Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {habits.map((habit, i) => {
                const habitChecks = checks.filter(c => c.habitId === habit.id).map(c => c.date)
                const { current, best } = calculateStreak(habitChecks)
                const cat = CATEGORIES.find(c => c.value === habit.category)

                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4.5 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${habit.color || 'var(--accent-green)'}`,
                      boxShadow: 'var(--shadow-card)',
                    }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                      style={{ background: habit.color || '#10b981', transform: 'translate(30%, -30%)' }}
                    />

                    <div className="flex items-center gap-3 mb-3.5">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                        {habit.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {habit.name}
                        </div>
                        <div className="text-xs" style={{ color: cat?.color || 'var(--text-muted)' }}>
                          {cat?.icon} {cat?.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-2 border-t border-[var(--border-subtle)]">
                      <div>
                        <span className="font-bold font-mono" style={{ color: '#f59e0b' }}>
                          {current > 0 ? `🔥 ${current}d` : '0d'}
                        </span>
                        <div style={{ color: 'var(--text-muted)' }}>streak</div>
                      </div>
                      <div>
                        <span className="font-bold font-mono" style={{ color: '#a855f7' }}>
                          {best}d
                        </span>
                        <div style={{ color: 'var(--text-muted)' }}>best</div>
                      </div>
                      <div>
                        <span className="font-bold font-mono" style={{ color: '#38bdf8' }}>
                          {habitChecks.length}
                        </span>
                        <div style={{ color: 'var(--text-muted)' }}>total</div>
                      </div>
                      <div className="ml-auto">
                        <div
                          className="text-xs font-semibold px-2 py-0.5 rounded-full font-mono"
                          style={{
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {habit.weeklyGoal}d/wk
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
