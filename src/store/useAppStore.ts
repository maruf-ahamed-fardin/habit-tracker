'use client'

import { create } from 'zustand'

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  category: string
  weeklyGoal: number
  order: number
  streakShield: boolean
  reminderTime?: string | null
  createdAt: string
}

export interface Check {
  id: string
  habitId: string
  date: string
}

export interface Note {
  id: string
  habitId: string
  date: string
  content: string
}

export interface Achievement {
  id: string
  key: string
  unlockedAt: string | null
}

export interface AppSettings {
  theme: 'dark' | 'light'
  xp: number
}

interface AppStore {
  habits: Habit[]
  checks: Check[]
  notes: Note[]
  achievements: Achievement[]
  settings: AppSettings
  pendingAchievement: string | null
  isLoading: boolean

  setHabits: (habits: Habit[]) => void
  setChecks: (checks: Check[]) => void
  setNotes: (notes: Note[]) => void
  setAchievements: (achievements: Achievement[]) => void
  setSettings: (settings: AppSettings) => void
  setPendingAchievement: (key: string | null) => void
  setIsLoading: (v: boolean) => void

  addHabit: (habit: Habit) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  removeHabit: (id: string) => void
  toggleCheck: (check: Check | null, habitId: string, date: string) => void
  addNote: (note: Note) => void
  updateNote: (id: string, content: string) => void
  unlockAchievement: (key: string) => void
  addXP: (amount: number) => void
}

export const useAppStore = create<AppStore>((set) => ({
  habits: [],
  checks: [],
  notes: [],
  achievements: [],
  settings: { theme: 'dark', xp: 0 },
  pendingAchievement: null,
  isLoading: true,

  setHabits: (habits) => set({ habits }),
  setChecks: (checks) => set({ checks }),
  setNotes: (notes) => set({ notes }),
  setAchievements: (achievements) => set({ achievements }),
  setSettings: (settings) => set({ settings }),
  setPendingAchievement: (key) => set({ pendingAchievement: key }),
  setIsLoading: (v) => set({ isLoading: v }),

  addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),
  updateHabit: (id, updates) =>
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),
  removeHabit: (id) =>
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      checks: s.checks.filter((c) => c.habitId !== id),
      notes: s.notes.filter((n) => n.habitId !== id),
    })),
  toggleCheck: (existing, habitId, date) =>
    set((s) => {
      if (existing) {
        return { checks: s.checks.filter((c) => !(c.habitId === habitId && c.date === date)) }
      } else {
        const newCheck: Check = { id: `${habitId}-${date}`, habitId, date }
        return { checks: [...s.checks, newCheck] }
      }
    }),
  addNote: (note) =>
    set((s) => ({
      notes: s.notes.some((n) => n.habitId === note.habitId && n.date === note.date)
        ? s.notes.map((n) => (n.habitId === note.habitId && n.date === note.date ? note : n))
        : [...s.notes, note],
    })),
  updateNote: (id, content) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, content } : n)) })),
  unlockAchievement: (key) =>
    set((s) => ({
      achievements: s.achievements.map((a) =>
        a.key === key && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
      ),
    })),
  addXP: (amount) =>
    set((s) => ({
      settings: { ...s.settings, xp: s.settings.xp + amount },
    })),
}))
