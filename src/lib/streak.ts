import { dayKey, shiftKey, weekStartKey } from './dateUtils'

export interface StreakResult {
  current: number
  best: number
  /** Daily habits count days in a row; habits with a weekly goal below 7 count weeks. */
  unit: 'day' | 'week'
}

/**
 * Streak for one habit.
 *
 * Every-day habits: consecutive checked days, ending today (or yesterday while
 * today is still open).
 *
 * Habits with a weekly goal (e.g. 3× a week): consecutive weeks that met the
 * goal. The current week counts once the goal is met and never breaks the
 * streak while it is still in progress, so planned rest days are safe.
 */
export function calculateStreak(
  checkedDates: Iterable<string>,
  weeklyGoal = 7,
  today: string = dayKey(new Date())
): StreakResult {
  const dates = checkedDates instanceof Set ? (checkedDates as Set<string>) : new Set(checkedDates)
  if (dates.size === 0) return { current: 0, best: 0, unit: weeklyGoal >= 7 ? 'day' : 'week' }
  return weeklyGoal >= 7 ? dailyStreak(dates, today) : weeklyStreak(dates, weeklyGoal, today)
}

function dailyStreak(dates: Set<string>, today: string): StreakResult {
  let current = 0
  let cursor = dates.has(today) ? today : shiftKey(today, -1)
  while (dates.has(cursor)) {
    current++
    cursor = shiftKey(cursor, -1)
  }

  let best = 0
  let run = 0
  let prev: string | null = null
  for (const d of [...dates].sort()) {
    run = prev !== null && shiftKey(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return { current, best: Math.max(best, current), unit: 'day' }
}

function weeklyStreak(dates: Set<string>, goal: number, today: string): StreakResult {
  const perWeek = new Map<string, number>()
  for (const d of dates) {
    if (d > today) continue
    const w = weekStartKey(d)
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1)
  }
  const met = (w: string) => (perWeek.get(w) ?? 0) >= goal
  const thisWeek = weekStartKey(today)

  let current = met(thisWeek) ? 1 : 0
  let cursor = shiftKey(thisWeek, -7)
  while (met(cursor)) {
    current++
    cursor = shiftKey(cursor, -7)
  }

  const weeks = [...perWeek.keys()].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const w of weeks) {
    if (!met(w)) {
      run = 0
      prev = w
      continue
    }
    run = prev !== null && shiftKey(prev, 7) === w && met(prev) ? run + 1 : 1
    best = Math.max(best, run)
    prev = w
  }
  return { current, best: Math.max(best, current), unit: 'week' }
}

export function formatStreak(n: number, unit: 'day' | 'week', short = false): string {
  if (short) return `${n}${unit === 'day' ? 'd' : 'w'}`
  return `${n} ${unit}${n === 1 ? '' : 's'}`
}

/** A streak length in days, so daily and weekly habits can be compared. */
export function inDays(n: number, unit: 'day' | 'week'): number {
  return unit === 'week' ? n * 7 : n
}
