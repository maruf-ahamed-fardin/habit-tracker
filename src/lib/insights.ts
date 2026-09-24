import type { Achievement, Check, Habit } from '@/store/useAppStore'
import { getAchievementByKey, getXPForLevel } from './achievements'
import { dayKey, fromKey, lastNDays, shiftKey, weekKeys, weekStartKey, WEEK_STARTS_ON } from './dateUtils'
import { calculateStreak, inDays, type StreakResult } from './streak'

// Every number and chart in the app reads from this file, so they always agree.

export type CheckIndex = Map<string, Set<string>>

export function indexChecks(checks: Check[]): CheckIndex {
  const idx: CheckIndex = new Map()
  for (const c of checks) {
    let set = idx.get(c.habitId)
    if (!set) idx.set(c.habitId, (set = new Set()))
    set.add(c.date)
  }
  return idx
}

const EMPTY = new Set<string>()
export const datesOf = (idx: CheckIndex, habitId: string) => idx.get(habitId) ?? EMPTY

function createdKey(h: Habit): string {
  return h.createdAt ? dayKey(new Date(h.createdAt)) : '0000-00-00'
}

/** Habits that existed on `key` (or were checked that day). */
function activeOn(habits: Habit[], idx: CheckIndex, key: string): Habit[] {
  return habits.filter(h => createdKey(h) <= key || datesOf(idx, h.id).has(key))
}

/** Share of existing habits done on a day, 0–1, or null when there were none. */
export function dayRate(habits: Habit[], idx: CheckIndex, key: string): number | null {
  const active = activeOn(habits, idx, key)
  if (active.length === 0) return null
  return active.filter(h => datesOf(idx, h.id).has(key)).length / active.length
}

export interface SeriesPoint {
  date: string
  rate: number | null
}

export function completionSeries(habits: Habit[], idx: CheckIndex, today: string, days: number): SeriesPoint[] {
  return lastNDays(today, days).map(date => {
    const r = dayRate(habits, idx, date)
    return { date, rate: r === null ? null : Math.round(r * 100) }
  })
}

/** Average completion per weekday, in week order (starting on WEEK_STARTS_ON). */
export function weekdayProfile(habits: Habit[], idx: CheckIndex, today: string, days: number) {
  const sums = Array(7).fill(0)
  const counts = Array(7).fill(0)
  for (const date of lastNDays(today, days)) {
    const r = dayRate(habits, idx, date)
    if (r === null) continue
    const slot = (fromKey(date).getDay() - WEEK_STARTS_ON + 7) % 7
    sums[slot] += r
    counts[slot]++
  }
  return weekKeys(today).map((key, slot) => ({
    day: fromKey(key).toLocaleDateString('en-US', { weekday: 'short' }),
    name: fromKey(key).toLocaleDateString('en-US', { weekday: 'long' }),
    rate: counts[slot] ? Math.round((sums[slot] / counts[slot]) * 100) : null,
  }))
}

export interface HabitRate {
  habit: Habit
  done: number
  target: number
  pct: number
}

/** Check-ins in the window compared with what the habit's weekly goal asks for. */
export function habitRates(habits: Habit[], idx: CheckIndex, today: string, days: number): HabitRate[] {
  const keys = lastNDays(today, days)
  return habits.map(habit => {
    const dates = datesOf(idx, habit.id)
    const since = createdKey(habit)
    const window = keys.filter(k => k >= since || dates.has(k))
    const done = window.filter(k => dates.has(k)).length
    const target = Math.max(1, Math.round((window.length / 7) * habit.weeklyGoal))
    return { habit, done, target, pct: Math.min(100, Math.round((done / target) * 100)) }
  })
}

/**
 * Progress towards weekly goals, 0–100: each habit contributes min(done, goal) / goal.
 * `weeksAgo` looks back; `throughSlot` limits counting to the first N+1 days of that
 * week so this week can be compared with the same point last week.
 */
export function weekProgress(habits: Habit[], idx: CheckIndex, today: string, weeksAgo = 0, throughSlot = 6): number | null {
  const days = weekKeys(shiftKey(today, -7 * weeksAgo)).slice(0, throughSlot + 1)
  const end = days[days.length - 1]
  const active = habits.filter(h => createdKey(h) <= end)
  if (active.length === 0) return null
  const total = active.reduce((sum, h) => {
    const dates = datesOf(idx, h.id)
    const done = days.filter(d => dates.has(d)).length
    return sum + Math.min(done, h.weeklyGoal) / h.weeklyGoal
  }, 0)
  return Math.round((total / active.length) * 100)
}

export function todaySlot(today: string): number {
  return weekKeys(today).indexOf(today)
}

export function perfectDays(habits: Habit[], idx: CheckIndex, keys: Iterable<string>): number {
  let n = 0
  for (const k of keys) if (dayRate(habits, idx, k) === 1) n++
  return n
}

export function checksIn(habits: Habit[], idx: CheckIndex, keys: string[]): number {
  const set = new Set(keys)
  let n = 0
  for (const h of habits) for (const d of datesOf(idx, h.id)) if (set.has(d)) n++
  return n
}

export interface HeatCell {
  date: string
  level: number // -1 = no habits / future, 0–4
  done: number
  total: number
}

/** Columns of weeks (oldest first), 7 cells each, for a GitHub-style heatmap. */
export function heatmap(habits: Habit[], idx: CheckIndex, today: string, weeks = 12): HeatCell[][] {
  const lastStart = weekStartKey(today)
  return Array.from({ length: weeks }, (_, col) => {
    const start = shiftKey(lastStart, -7 * (weeks - 1 - col))
    return weekKeys(start).map(date => {
      if (date > today) return { date, level: -1, done: 0, total: 0 }
      const active = activeOn(habits, idx, date)
      const done = active.filter(h => datesOf(idx, h.id).has(date)).length
      const level = active.length === 0 ? -1 : done === 0 ? 0 : Math.max(1, Math.ceil((done / active.length) * 4))
      return { date, level, done, total: active.length }
    })
  })
}

export function streakFor(habit: Habit, idx: CheckIndex, today: string): StreakResult {
  return calculateStreak(datesOf(idx, habit.id), habit.weeklyGoal, today)
}

/** The habit with the longest current streak (compared in days). */
export function topStreak(habits: Habit[], idx: CheckIndex, today: string) {
  let top: { habit: Habit; streak: StreakResult } | null = null
  for (const habit of habits) {
    const streak = streakFor(habit, idx, today)
    if (streak.current === 0) continue
    if (!top || inDays(streak.current, streak.unit) > inDays(top.streak.current, top.streak.unit)) top = { habit, streak }
  }
  return top
}

export function bestStreakDays(habits: Habit[], idx: CheckIndex, today: string): number {
  return habits.reduce((max, h) => {
    const s = streakFor(h, idx, today)
    return Math.max(max, inDays(s.best, s.unit))
  }, 0)
}

// ---------- XP ----------
// XP is derived from your data instead of stored, so it can never drift or reset.

export const XP_PER_CHECK = 15
export const XP_PER_HABIT = 10
export const XP_PER_PERFECT_DAY = 50

export function computeXP(habits: Habit[], checks: Check[], achievements: Achievement[], idx = indexChecks(checks)): number {
  const checkedDays = new Set(checks.map(c => c.date))
  const rewards = achievements.reduce((sum, a) => sum + (a.unlockedAt ? getAchievementByKey(a.key)?.xpReward ?? 0 : 0), 0)
  return (
    checks.length * XP_PER_CHECK +
    habits.length * XP_PER_HABIT +
    perfectDays(habits, idx, checkedDays) * XP_PER_PERFECT_DAY +
    rewards
  )
}

export function levelInfo(xp: number) {
  const { level, progress, nextLevelXP } = getXPForLevel(xp)
  return { level, progress, nextLevelXP, toNext: Math.max(0, nextLevelXP - xp) }
}
