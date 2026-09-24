'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { checkAchievements, getAchievementByKey } from '@/lib/achievements'
import { bestStreakDays } from '@/lib/insights'
import { dayKey, msUntilMidnight } from '@/lib/dateUtils'
import { useCheckIndex, useLevel } from '@/hooks/useStats'
import { sound } from '@/lib/sound'

export function DataProvider({ children }: { children: React.ReactNode }) {
  const load = useAppStore(s => s.load)
  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <TodayWatcher />
      <AchievementWatcher />
      {children}
    </>
  )
}

/** Keeps `today` correct when the app stays open past midnight or wakes from the background. */
function TodayWatcher() {
  const setToday = useAppStore(s => s.setToday)
  useEffect(() => {
    const sync = () => setToday(dayKey(new Date()))
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        sync()
        schedule()
      }, msUntilMidnight())
    }
    schedule()
    const onVisible = () => document.visibilityState === 'visible' && sync()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', sync)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', sync)
    }
  }, [setToday])
  return null
}

/** Unlocks achievements as your data changes, and announces new ones. */
function AchievementWatcher() {
  const isLoading = useAppStore(s => s.isLoading)
  const habits = useAppStore(s => s.habits)
  const checks = useAppStore(s => s.checks)
  const notes = useAppStore(s => s.notes)
  const achievements = useAppStore(s => s.achievements)
  const today = useAppStore(s => s.today)
  const unlock = useAppStore(s => s.unlockAchievements)
  const idx = useCheckIndex()
  const { xp } = useLevel()

  useEffect(() => {
    if (isLoading || achievements.length === 0) return
    const earned = checkAchievements({
      totalCheckins: checks.length,
      bestStreak: bestStreakDays(habits, idx, today),
      currentStreaks: [],
      habitCount: habits.length,
      hasNote: notes.length > 0,
      hasUsedShield: false,
      hour: -1, // time-of-day badges are awarded at check-in time by useCheckIn
      totalXP: xp,
    })
    const locked = new Set(achievements.filter(a => !a.unlockedAt).map(a => a.key))
    const fresh = earned.filter(k => locked.has(k))
    if (fresh.length) void unlock(fresh)
  }, [isLoading, habits, checks, notes, achievements, today, idx, xp, unlock])

  // Announce anything that becomes unlocked after the first load.
  const seen = useRef<Set<string> | null>(null)
  useEffect(() => {
    if (isLoading) return
    const unlocked = achievements.filter(a => a.unlockedAt).map(a => a.key)
    if (seen.current === null) {
      seen.current = new Set(unlocked)
      return
    }
    const fresh = unlocked.filter(k => !seen.current!.has(k))
    fresh.forEach(k => seen.current!.add(k))
    if (fresh.length === 0) return
    sound.playLevelUp()
    if (fresh.length > 2) {
      toast.success(`${fresh.length} achievements unlocked`, { description: 'See them on the You page.' })
      return
    }
    for (const key of fresh) {
      const def = getAchievementByKey(key)
      if (def) toast(`${def.icon} ${def.title}`, { description: `Achievement unlocked · ${def.description}` })
    }
  }, [isLoading, achievements])

  return null
}
