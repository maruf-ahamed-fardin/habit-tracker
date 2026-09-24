'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import type { Habit } from '@/store/useAppStore'
import type { StreakResult } from '@/lib/streak'
import { formatStreak } from '@/lib/streak'
import { habitColor } from '@/lib/colors'
import { cn } from '@/lib/utils'

export interface WeekDot {
  date: string
  done: boolean
  isToday: boolean
}

export function HabitCard({
  habit,
  checked,
  week,
  weekDone,
  streak,
  shortcut,
  onToggle,
}: {
  habit: Habit
  checked: boolean
  week: WeekDot[]
  weekDone: number
  streak: StreakResult
  shortcut?: number
  onToggle: () => void
}) {
  const color = habitColor(habit.color)
  const goalMet = weekDone >= habit.weeklyGoal

  return (
    <motion.button
      layout="position"
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-checked={checked}
      onClick={onToggle}
      whileTap={{ scale: 0.985 }}
      style={{ '--c': color } as React.CSSProperties}
      className={cn(
        'group relative isolate flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-card py-3 pr-4 pl-3 text-left outline-none',
        'transition-[border-color,box-shadow] duration-300 hover:shadow-[0_4px_16px_-8px_rgb(0_0_0/0.15)] focus-visible:ring-3 focus-visible:ring-ring/50',
        checked && 'border-[color-mix(in_oklab,var(--c)_40%,var(--border))]'
      )}
    >
      <span aria-hidden="true" className="habit-fill absolute inset-0 -z-10 bg-[color-mix(in_oklab,var(--c)_13%,var(--card))]" />

      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-[color-mix(in_oklab,var(--c)_14%,var(--card))] text-[22px]"
      >
        {habit.emoji}
      </span>

      <span className="grid min-w-0 flex-1 gap-1.5">
        <span className="truncate text-[15px] leading-tight font-semibold">{habit.name}</span>
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
          <span className="flex gap-[3px]" aria-hidden="true">
            {week.map(d => (
              <i
                key={d.date}
                className={cn(
                  'size-[7px] rounded-full bg-border',
                  d.done && 'bg-[var(--c)]',
                  d.isToday && 'shadow-[0_0_0_1.5px_var(--card),0_0_0_2.5px_var(--c)]'
                )}
              />
            ))}
          </span>
          <span className={cn('tabular-nums', goalMet && 'font-medium text-foreground')}>
            {weekDone}/{habit.weeklyGoal} this week
          </span>
          {streak.current > 1 && (
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <Flame className="size-3.5 fill-flame text-flame" aria-hidden="true" />
              {formatStreak(streak.current, streak.unit, true)}
              <span className="sr-only"> streak</span>
            </span>
          )}
        </span>
      </span>

      {shortcut !== undefined && (
        <kbd className="hidden rounded border px-1.5 font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 lg:block">
          {shortcut}
        </kbd>
      )}

      <span
        aria-hidden="true"
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full border-2 border-border transition-colors duration-300',
          checked && 'border-[var(--c)] bg-[var(--c)]'
        )}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="white" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path className="check-draw" d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
    </motion.button>
  )
}
