import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, subDays, addDays, isBefore, isAfter, isToday, isSameDay } from 'date-fns'

export const TODAY = format(new Date(), 'yyyy-MM-dd')

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function formatDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDayLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEE')
}

export function formatDayNumber(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd')
}

export function getWeekDays(weekStart: Date): Date[] {
  return eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 0 }),
  })
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 0 })
}

export function isFutureDate(dateStr: string): boolean {
  return isAfter(parseISO(dateStr), new Date())
}

export function isTodayDate(dateStr: string): boolean {
  return isToday(parseISO(dateStr))
}

export function getLast12WeeksGrid(): string[][] {
  const today = new Date()
  const grid: string[][] = []

  // 12 columns (weeks), 7 rows (days Sun-Sat)
  for (let col = 11; col >= 0; col--) {
    const weekStart = startOfWeek(subDays(today, col * 7), { weekStartsOn: 0 })
    const days = getWeekDays(weekStart)
    grid.push(days.map(d => formatDate(d)))
  }

  return grid
}

export { format, parseISO, subDays, addDays, isBefore, isAfter, isToday, isSameDay, startOfWeek, endOfWeek }
