import { addDays, format, parseISO, startOfWeek, subDays } from 'date-fns'

/** Weeks start on Sunday, matching how weekly goals were counted before. */
export const WEEK_STARTS_ON = 0 as const

/** yyyy-MM-dd in the user's local time zone. */
export function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Parse a yyyy-MM-dd key as local noon, so DST shifts never move the day. */
export function fromKey(key: string): Date {
  return parseISO(`${key}T12:00:00`)
}

export function shiftKey(key: string, days: number): string {
  return dayKey(addDays(fromKey(key), days))
}

export function weekStartKey(key: string): string {
  return dayKey(startOfWeek(fromKey(key), { weekStartsOn: WEEK_STARTS_ON }))
}

/** The 7 day keys of the week containing `key`. */
export function weekKeys(key: string): string[] {
  const start = weekStartKey(key)
  return Array.from({ length: 7 }, (_, i) => shiftKey(start, i))
}

/** The last `n` day keys ending at (and including) `endKey`, oldest first. */
export function lastNDays(endKey: string, n: number): string[] {
  const end = fromKey(endKey)
  return Array.from({ length: n }, (_, i) => dayKey(subDays(end, n - 1 - i)))
}

export function msUntilMidnight(now = new Date()): number {
  const next = new Date(now)
  next.setHours(24, 0, 0, 50)
  return next.getTime() - now.getTime()
}
