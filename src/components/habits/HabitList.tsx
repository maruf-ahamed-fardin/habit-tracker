'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Search,
  Sparkles,
  Check,
  Filter,
  Flame,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useAppStore, type Habit } from '@/store/useAppStore'
import { calculateStreak } from '@/lib/streak'
import { format, addDays, startOfWeek } from 'date-fns'
import { HabitDetailDrawer } from './HabitDetailDrawer'
import { sound } from '@/lib/sound'
import { triggerCheckConfetti, triggerAllDoneConfetti } from '@/lib/confetti'
import { cn } from '@/lib/utils'

const TODAY = format(new Date(), 'yyyy-MM-dd')
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STARTER_HABITS = [
  { name: 'Drink 2L Water', emoji: '💧', category: 'health', weeklyGoal: 7, color: '#38bdf8' },
  { name: 'Morning Workout', emoji: '💪', category: 'fitness', weeklyGoal: 5, color: '#10b981' },
  { name: 'Read 20 Pages', emoji: '📚', category: 'mind', weeklyGoal: 6, color: '#a855f7' },
  { name: '10 Min Meditation', emoji: '🧘', category: 'mind', weeklyGoal: 7, color: '#f59e0b' },
]

type FilterMode = 'all' | 'pending' | 'completed' | 'streaks'

interface FloatingXP {
  id: string
  x: number
  y: number
  amount: number
}

function CheckboxCell({
  checked,
  disabled,
  isToday,
  onClick,
}: {
  checked: boolean
  disabled: boolean
  isToday: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  const [animating, setAnimating] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return
    if (!checked) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 450)
    }
    onClick(e)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all relative select-none',
        animating && 'checkbox-pop',
        disabled && 'opacity-25 cursor-not-allowed',
        !disabled && !checked && 'hover:border-[var(--accent-green)] hover:scale-105 active:scale-90',
        isToday && !checked && 'ring-2 ring-[var(--accent-amber)] ring-offset-2 ring-offset-[var(--bg-card)]',
        isToday && checked && 'ring-2 ring-[var(--accent-green)] ring-offset-2 ring-offset-[var(--bg-card)]'
      )}
      style={{
        background: checked
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'var(--bg-elevated)',
        border: checked ? '1px solid #10b981' : '1px solid var(--border)',
        boxShadow: checked
          ? '0 0 16px rgba(16, 185, 129, 0.45)'
          : 'none',
      }}
      whileTap={!disabled ? { scale: 0.85 } : {}}
      title={isToday ? "Today's check-in" : undefined}
    >
      <AnimatePresence mode="wait">
        {checked && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 650, damping: 22 }}
            className="flex items-center justify-center text-white"
          >
            <Check size={19} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

interface HabitRowProps {
  habit: Habit
  weekDays: string[]
  index: number
  onFloatingXP: (x: number, y: number, amount: number) => void
}

function HabitRow({ habit, weekDays, index, onFloatingXP }: HabitRowProps) {
  const { checks, toggleCheck, removeHabit, addXP, habits } = useAppStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const habitChecks = checks.filter(c => c.habitId === habit.id).map(c => c.date)
  const { current: streak } = calculateStreak(habitChecks)

  const weekDone = weekDays.filter(d => habitChecks.includes(d)).length
  const weekGoal = habit.weeklyGoal
  const isGoalReached = weekDone >= weekGoal

  const handleToggle = async (date: string, e: React.MouseEvent) => {
    const existing = checks.find(c => c.habitId === habit.id && c.date === date)
    toggleCheck(existing || null, habit.id, date)

    if (!existing) {
      sound.playCheck()
      triggerCheckConfetti(e.clientX, e.clientY)
      onFloatingXP(e.clientX, e.clientY, 15)
      addXP(15)

      // Check if all habits for today are now completed
      const otherTodayChecks = checks.filter(c => c.date === TODAY && c.habitId !== habit.id)
      if (date === TODAY && otherTodayChecks.length + 1 === habits.length && habits.length > 0) {
        setTimeout(() => {
          sound.playFanfare()
          triggerAllDoneConfetti()
          toast.success('🎉 Perfect Day! All habits complete! +50 XP bonus!', {
            duration: 4000,
            icon: '🏆',
          })
          addXP(50)
        }, 350)
      }

      await fetch('/api/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId: habit.id, date }),
      })

      if (checks.length === 0) {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'first_checkin' }),
        }).catch(() => {})
      }
    } else {
      sound.playUncheck()
      await fetch(`/api/checks?habitId=${habit.id}&date=${date}`, { method: 'DELETE' })
    }
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playClick()
    if (!window.confirm(`Delete "${habit.name}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' })
      removeHabit(habit.id)
      toast.success(`"${habit.name}" removed`)
    } catch {
      toast.error('Failed to remove habit')
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -16 }}
        className="group relative flex items-center justify-between gap-4 py-3 px-3 sm:px-4 rounded-2xl transition-colors hover:bg-[var(--bg-elevated)]"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Left: Habit Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Index shortcut indicator */}
          <span className="hidden lg:inline text-[11px] font-mono text-[var(--text-muted)] w-4 text-center">
            {index < 9 ? index + 1 : ''}
          </span>

          {/* Category color bar */}
          <div
            className="w-1.5 h-10 rounded-full flex-shrink-0"
            style={{ background: habit.color || 'var(--accent-green)' }}
          />

          {/* Emoji */}
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setDrawerOpen(true)
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            {habit.emoji}
          </button>

          {/* Title and stats */}
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                sound.playClick()
                setDrawerOpen(true)
              }}
              className="text-left group-hover:text-[var(--accent-green)] transition-colors block"
            >
              <div
                className="text-sm sm:text-base font-semibold truncate leading-tight"
                style={{ color: 'var(--text-primary)' }}
                title={habit.name}
              >
                {habit.name}
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {streak > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: 'var(--accent-amber)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  <span className="fire-emoji text-[11px]">🔥</span>
                  {streak}d streak
                </span>
              )}

              <span
                className="text-xs font-mono font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: isGoalReached ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                  color: isGoalReached ? 'var(--accent-green)' : 'var(--text-muted)',
                  border: isGoalReached ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                }}
              >
                {weekDone}/{weekGoal} this wk
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: 7 day checkboxes */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-[280px] sm:w-[320px] flex-shrink-0">
          {weekDays.map(date => {
            const checked = habitChecks.includes(date)
            const isFuture = date > TODAY
            const isToday = date === TODAY

            return (
              <div key={date} className="flex justify-center">
                <CheckboxCell
                  checked={checked}
                  disabled={isFuture}
                  isToday={isToday}
                  onClick={e => handleToggle(date, e)}
                />
              </div>
            )
          })}
        </div>

        {/* Far Right: Actions on hover */}
        <div className="w-16 hidden md:flex items-center justify-end gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setDrawerOpen(true)
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
            title="Edit details & notes"
          >
            <Edit3 size={13} />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-rose)] hover:bg-[var(--bg-card)] transition-colors"
            title="Delete habit"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </motion.div>

      <HabitDetailDrawer
        habit={habit}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}

export function HabitList() {
  const { habits, checks, addHabit, toggleCheck, addXP } = useAppStore()
  const [weekOffset, setWeekOffset] = useState(0)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [floatingXPs, setFloatingXPs] = useState<FloatingXP[]>([])

  // Compute week start
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd')
  )
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
  const canGoNext = weekOffset < 0

  // Keyboard number shortcuts (1-9 to toggle today's habit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) return

      const num = parseInt(e.key, 10)
      if (!isNaN(num) && num >= 1 && num <= 9 && num <= habits.length) {
        const targetHabit = habits[num - 1]
        if (targetHabit) {
          const existing = checks.find(c => c.habitId === targetHabit.id && c.date === TODAY)
          toggleCheck(existing || null, targetHabit.id, TODAY)
          if (!existing) {
            sound.playCheck()
            triggerCheckConfetti()
            addXP(15)
            toast.success(`Checked: ${targetHabit.name} (+15 XP)`)
          } else {
            sound.playUncheck()
          }
        }
      } else if (e.key === 'ArrowLeft') {
        setWeekOffset(o => o - 1)
        sound.playClick()
      } else if (e.key === 'ArrowRight' && canGoNext) {
        setWeekOffset(o => o + 1)
        sound.playClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [habits, checks, canGoNext, toggleCheck, addXP])

  // Floating XP spawn handler
  const handleFloatingXP = (x: number, y: number, amount: number) => {
    const id = `${Date.now()}-${Math.random()}`
    setFloatingXPs(prev => [...prev, { id, x, y, amount }])
    setTimeout(() => {
      setFloatingXPs(prev => prev.filter(item => item.id !== id))
    }, 1200)
  }

  // Filtered habits
  const filteredHabits = habits.filter(h => {
    // Search query
    if (searchQuery.trim() && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter mode
    const isCheckedToday = checks.some(c => c.habitId === h.id && c.date === TODAY)
    if (filter === 'pending') return !isCheckedToday
    if (filter === 'completed') return isCheckedToday
    if (filter === 'streaks') {
      const hChecks = checks.filter(c => c.habitId === h.id).map(c => c.date)
      const { current } = calculateStreak(hChecks)
      return current >= 2
    }
    return true
  })

  // Starter add
  const handleAddStarter = async (starter: typeof STARTER_HABITS[0]) => {
    sound.playClick()
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(starter),
      })
      if (!res.ok) throw new Error('Failed')
      const habit = await res.json()
      addHabit(habit)
      triggerCheckConfetti()
      toast.success(`"${starter.name}" added!`, { icon: starter.emoji })
    } catch {
      toast.error('Failed to add starter habit')
    }
  }

  const completedTodayCount = habits.filter(h => checks.some(c => c.habitId === h.id && c.date === TODAY)).length
  const pendingTodayCount = habits.length - completedTodayCount

  return (
    <div className="space-y-4 relative">
      {/* Floating XP Portal */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {floatingXPs.map(fx => (
            <motion.div
              key={fx.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -45, scale: 1.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: fx.x - 24,
                top: fx.y - 30,
                color: 'var(--accent-amber)',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                textShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
                fontSize: '14px',
              }}
            >
              +{fx.amount} XP
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Week Navigation and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setFilter('all')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: filter === 'all' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: filter === 'all' ? '1px solid var(--border)' : '1px solid transparent',
              boxShadow: filter === 'all' ? 'var(--shadow-card)' : 'none',
            }}
          >
            <span style={{ color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              All ({habits.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setFilter('pending')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              background: filter === 'pending' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'pending' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: filter === 'pending' ? '1px solid var(--border)' : '1px solid transparent',
              boxShadow: filter === 'pending' ? 'var(--shadow-card)' : 'none',
            }}
          >
            <Clock size={13} style={{ color: 'var(--accent-amber)' }} />
            <span style={{ color: filter === 'pending' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              Pending ({pendingTodayCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setFilter('completed')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              background: filter === 'completed' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'completed' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: filter === 'completed' ? '1px solid var(--border)' : '1px solid transparent',
              boxShadow: filter === 'completed' ? 'var(--shadow-card)' : 'none',
            }}
          >
            <CheckCircle2 size={13} style={{ color: 'var(--accent-green)' }} />
            <span style={{ color: filter === 'completed' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              Done ({completedTodayCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setFilter('streaks')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              background: filter === 'streaks' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'streaks' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: filter === 'streaks' ? '1px solid var(--border)' : '1px solid transparent',
              boxShadow: filter === 'streaks' ? 'var(--shadow-card)' : 'none',
            }}
          >
            <Flame size={13} style={{ color: 'var(--accent-amber)' }} />
            <span style={{ color: filter === 'streaks' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              Streaks 🔥
            </span>
          </button>
        </div>

        {/* Right: Search & Week Navigator */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="w-28 sm:w-36 h-8 pl-8 pr-2.5 rounded-xl text-xs outline-none transition-all placeholder:text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>

          {/* Week navigation pills */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                sound.playClick()
                setWeekOffset(o => o - 1)
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="Previous week (←)"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-2 text-center">
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)}w ago`}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] ml-1.5 hidden md:inline font-mono">
                ({weekLabel})
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (canGoNext) {
                  sound.playClick()
                  setWeekOffset(o => o + 1)
                }
              }}
              disabled={!canGoNext}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              title={canGoNext ? 'Next week (→)' : 'Cannot navigate to future weeks'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Habit Table Container */}
      <div
        className="rounded-2xl overflow-x-auto p-2 sm:p-4"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="min-w-[640px]">
          {/* Day column headers */}
          <div className="flex items-center justify-between gap-4 pb-3 mb-2 px-3 sm:px-4 border-b border-[var(--border)]">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)] flex-1 flex items-center gap-2">
              <span>Habit Routine</span>
              <span className="text-[10px] lowercase text-[var(--text-muted)] hidden lg:inline">
                (press 1-9 to toggle today)
              </span>
            </div>

            {/* 7 Days Columns */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-[280px] sm:w-[320px] flex-shrink-0">
              {weekDays.map((date, i) => {
                const isToday = date === TODAY
                return (
                  <div
                    key={date}
                    className={cn(
                      'w-9 sm:w-10 text-center py-1 rounded-lg transition-colors',
                      isToday && 'bg-[var(--bg-elevated)] border border-[var(--accent-green)]/35 shadow-sm'
                    )}
                  >
                    <div
                      className="text-[10px] font-mono font-bold uppercase"
                      style={{
                        color: isToday ? 'var(--accent-green)' : 'var(--text-muted)',
                      }}
                    >
                      {DAY_LABELS[i]}
                    </div>
                    <div
                      className="text-xs font-mono font-bold mt-0.5"
                      style={{
                        color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {format(new Date(date + 'T12:00:00'), 'd')}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Actions spacer */}
            <div className="w-16 hidden md:block flex-shrink-0" />
          </div>

          {/* Habit Rows or Empty State */}
          {filteredHabits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 px-4 text-center flex flex-col items-center"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                {searchQuery || filter !== 'all' ? '🔍' : '🌱'}
              </div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                {searchQuery || filter !== 'all' ? 'No habits match filter' : 'No habits tracked yet'}
              </h3>
              <p className="text-xs sm:text-sm max-w-sm mb-6 text-[var(--text-secondary)]">
                {searchQuery || filter !== 'all'
                  ? 'Try clearing the search query or switching filters to see all habits.'
                  : 'Start forging your daily routine. Add a habit with the bar above or click one of our popular starters:'}
              </p>

              {/* Starter chips */}
              {habits.length === 0 && (
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {STARTER_HABITS.map(starter => (
                    <motion.button
                      key={starter.name}
                      type="button"
                      onClick={() => handleAddStarter(starter)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span>{starter.emoji}</span>
                      <span>{starter.name}</span>
                      <span className="text-[var(--accent-green)] font-bold">+</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredHabits.map((habit, index) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  weekDays={weekDays}
                  index={index}
                  onFloatingXP={handleFloatingXP}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
