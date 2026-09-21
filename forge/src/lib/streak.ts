import { parseISO, subDays, format, isAfter } from 'date-fns'

export interface StreakResult {
  current: number
  best: number
}

/**
 * Calculates current and best streak for a habit given its checked dates.
 * Current streak: consecutive days backward from today (or yesterday if today not checked).
 * Best streak: longest consecutive run in entire history.
 */
export function calculateStreak(
  checkedDates: string[],
  today: string = format(new Date(), 'yyyy-MM-dd')
): StreakResult {
  if (checkedDates.length === 0) return { current: 0, best: 0 }

  const dateSet = new Set(checkedDates)
  const sortedDates = [...checkedDates].sort()

  // Current streak
  let current = 0
  let checkFrom = today

  // If today isn't checked, try starting from yesterday
  if (!dateSet.has(today)) {
    const yesterday = format(subDays(parseISO(today), 1), 'yyyy-MM-dd')
    if (!dateSet.has(yesterday)) {
      checkFrom = today // will result in 0
    } else {
      checkFrom = yesterday
    }
  }

  if (dateSet.has(checkFrom)) {
    let cursor = checkFrom
    while (dateSet.has(cursor)) {
      current++
      cursor = format(subDays(parseISO(cursor), 1), 'yyyy-MM-dd')
    }
  }

  // Best streak: iterate all sorted dates and find longest consecutive run
  let best = 0
  let runLength = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = sortedDates[i - 1]
    const curr = sortedDates[i]
    const expectedNext = format(
      new Date(parseISO(prev).getTime() + 86400000),
      'yyyy-MM-dd'
    )

    if (curr === expectedNext) {
      runLength++
    } else {
      best = Math.max(best, runLength)
      runLength = 1
    }
  }
  best = Math.max(best, runLength)

  return { current, best }
}

/**
 * Returns the best streak across all habits.
 */
export function getBestOverallStreak(
  habitsWithDates: { id: string; checks: string[] }[]
): number {
  let best = 0
  for (const habit of habitsWithDates) {
    const { best: habitBest } = calculateStreak(habit.checks)
    best = Math.max(best, habitBest)
  }
  return best
}
