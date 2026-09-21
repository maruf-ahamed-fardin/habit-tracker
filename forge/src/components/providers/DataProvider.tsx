'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { setHabits, setChecks, setNotes, setAchievements, setSettings, setIsLoading } = useAppStore()

  useEffect(() => {
    async function loadAll() {
      try {
        const [habitsRes, checksRes, notesRes, achievementsRes, settingsRes] = await Promise.all([
          fetch('/api/habits'),
          fetch('/api/checks'),
          fetch('/api/notes'),
          fetch('/api/achievements'),
          fetch('/api/settings'),
        ])

        const [habits, checks, notes, achievements, settings] = await Promise.all([
          habitsRes.json(),
          checksRes.json(),
          notesRes.json(),
          achievementsRes.json(),
          settingsRes.json(),
        ])

        setHabits(habits)
        setChecks(checks)
        setNotes(notes)
        setAchievements(achievements)
        setSettings(settings)

        // Apply theme
        document.documentElement.setAttribute('data-theme', settings.theme || 'dark')
      } catch (e) {
        console.error('Failed to load data:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadAll()
  }, [setHabits, setChecks, setNotes, setAchievements, setSettings, setIsLoading])

  return <>{children}</>
}
