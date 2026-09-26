'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { useAppStore, type Habit } from '@/store/useAppStore'
import { celebrate } from '@/lib/confetti'
import { sound } from '@/lib/sound'
import { haptic } from '@/lib/motion'
import { XP_PER_PERFECT_DAY } from '@/lib/insights'

function celebrateOnce(day: string) {
  const key = `habit-tracker:perfect:${day}`
  try {
    if (localStorage.getItem(key)) return false
    localStorage.setItem(key, '1')
  } catch {}
  return true
}

/**
 * The one way the app checks a habit on or off: cards, the week grid, the
 * calendar, keyboard shortcuts and the command menu all go through here.
 */
export function useCheckIn() {
  const toggleCheck = useAppStore(s => s.toggleCheck)

  return useCallback(
    (habit: Habit, date?: string, { quiet = false }: { quiet?: boolean } = {}) => {
      const state = useAppStore.getState()
      const day = date ?? state.today
      const had = state.checks.some(c => c.habitId === habit.id && c.date === day)

      // toggleCheck updates the store synchronously before its first await,
      // so the state read below already includes this change.
      const result = toggleCheck(habit.id, day)
      if (had) {
        sound.playUncheck()
        haptic(6)
        return result
      }

      sound.playCheck()
      haptic(12)
      const after = useAppStore.getState()
      const doneToday = after.habits.filter(h => after.checks.some(c => c.habitId === h.id && c.date === day)).length
      const isToday = day === after.today

      if (isToday && doneToday === after.habits.length && celebrateOnce(day)) {
        sound.playFanfare()
        haptic([20, 60, 30])
        celebrate()
        toast.success('Perfect day!', { description: `Every habit done. +${XP_PER_PERFECT_DAY} XP` })
      } else if (!quiet) {
        toast(`${habit.emoji} ${habit.name}`, {
          id: `check-${habit.id}`,
          description: isToday ? 'Done for today' : `Marked done for ${day}`,
          action: { label: 'Undo', onClick: () => void toggleCheck(habit.id, day) },
        })
      }

      if (isToday) {
        const hour = new Date().getHours()
        const timed = hour < 4 ? 'night_owl' : hour >= 5 && hour < 7 ? 'early_bird' : null
        if (timed && after.achievements.some(a => a.key === timed && !a.unlockedAt)) {
          void after.unlockAchievements([timed])
        }
      }
      return result
    },
    [toggleCheck]
  )
}
