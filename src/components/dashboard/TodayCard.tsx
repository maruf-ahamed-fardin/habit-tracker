'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { calculateStreak } from '@/lib/streak'
import { getMotivationalQuote } from '@/lib/utils'
import { HeroProgressRing } from './HeroProgressRing'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { triggerAllDoneConfetti } from '@/lib/confetti'
import { sound } from '@/lib/sound'
import { format } from 'date-fns'
import { Sparkles, Flame, CheckCircle2, Clock, PartyPopper } from 'lucide-react'

const TODAY = format(new Date(), 'yyyy-MM-dd')

export function TodayCard() {
  const { habits, checks } = useAppStore()
  const quote = useMemo(() => getMotivationalQuote(new Date().getDate()), [])

  // Today's completion
  const todayChecks = checks.filter(c => c.date === TODAY)
  const completed = todayChecks.length
  const total = habits.length
  const remaining = Math.max(0, total - completed)
  const isAllDone = total > 0 && completed === total

  // Best current streak among active habits
  const bestCurrentStreak = habits.reduce((max, h) => {
    const habitChecks = checks.filter(c => c.habitId === h.id).map(c => c.date)
    const { current } = calculateStreak(habitChecks)
    return Math.max(max, current)
  }, 0)

  const headline = () => {
    if (total === 0) return 'Add your first habit below to begin forging your routine'
    if (isAllDone) return '✨ All habits completed! Outstanding discipline today.'
    if (completed === 0) return `You have ${total} ${total === 1 ? 'habit' : 'habits'} lined up for today`
    return `${completed} of ${total} habits completed • ${remaining} left to go`
  }

  const handleCelebrateAgain = () => {
    sound.playFanfare()
    triggerAllDoneConfetti()
  }

  return (
    <SpotlightCard
      spotlightColor={isAllDone ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.14)'}
      className="p-6 sm:p-7 flex flex-col justify-between"
    >
      {/* Ambient background glow */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-15 pointer-events-none blur-3xl transition-colors duration-700"
        style={{
          background: isAllDone ? '#10b981' : '#38bdf8',
        }}
      />
      {bestCurrentStreak >= 2 && (
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ background: '#f59e0b' }}
        />
      )}

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--border)]">
        <div>
          <span
            className="text-xs font-mono font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-secondary)' }}
          >
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </span>
          <h1
            className="text-2xl font-bold tracking-tight mt-0.5"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Today&apos;s Progress
          </h1>
        </div>

        {/* Streak / Celebration Badge */}
        <div className="flex items-center gap-2">
          {bestCurrentStreak >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
              style={{
                background: 'rgba(245, 158, 11, 0.14)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
              }}
            >
              <span className="fire-emoji text-sm">🔥</span>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: 'var(--accent-amber)' }}
              >
                <AnimatedNumber value={bestCurrentStreak} />-Day Streak
              </span>
            </motion.div>
          )}

          {isAllDone && (
            <motion.button
              type="button"
              onClick={handleCelebrateAgain}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.2))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: 'var(--accent-green)',
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.25)',
              }}
              title="Click to celebrate again!"
            >
              <PartyPopper size={14} /> Replay 🎉
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content: Ring + Headline + Metrics */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-5">
        {/* Progress Ring Widget */}
        <div className="flex-shrink-0">
          <HeroProgressRing completed={completed} total={total} size={128} strokeWidth={9} />
        </div>

        {/* Right Info Section */}
        <div className="flex-1 text-center sm:text-left flex flex-col justify-between self-stretch">
          <div>
            <p
              className="text-base font-semibold leading-snug"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {headline()}
            </p>

            {/* Quick Metrics Pills with Animated Numbers */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedNumber value={completed} />
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>done</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <Clock size={14} style={{ color: remaining > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }} />
                <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedNumber value={remaining} />
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>remaining</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedNumber value={total} />
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>total habits</span>
              </div>
            </div>
          </div>

          {/* Integrated Micro Quote */}
          <div
            className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="text-base leading-none select-none opacity-60">“</span>
            <span className="italic truncate">{quote.text}</span>
            <span className="opacity-50 whitespace-nowrap">— {quote.author}</span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}
