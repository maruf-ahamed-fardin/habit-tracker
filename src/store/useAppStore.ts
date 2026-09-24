'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import { dayKey } from '@/lib/dateUtils'

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

export interface HabitInput {
  name: string
  emoji: string
  color: string
  weeklyGoal: number
  reminderTime?: string | null
}

interface AppStore {
  habits: Habit[]
  checks: Check[]
  notes: Note[]
  achievements: Achievement[]
  isLoading: boolean
  loadError: boolean
  /** Today's yyyy-MM-dd key, kept current by <TodayWatcher /> across midnight. */
  today: string

  sheet: { open: boolean; habitId: string | null }
  commandOpen: boolean
  shortcutsOpen: boolean

  load: () => Promise<void>
  setToday: (key: string) => void
  openSheet: (habitId?: string | null) => void
  closeSheet: () => void
  setCommandOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void

  /** Returns the new checked state (unchanged if the save failed or one is in flight). */
  toggleCheck: (habitId: string, date: string) => Promise<boolean>
  createHabit: (input: HabitInput) => Promise<Habit | null>
  updateHabit: (id: string, patch: Partial<HabitInput>) => Promise<boolean>
  deleteHabit: (id: string) => Promise<boolean>
  reorderHabits: (ids: string[]) => Promise<void>
  saveNote: (habitId: string, date: string, content: string) => Promise<boolean>
  unlockAchievements: (keys: string[]) => Promise<void>
  resetAll: () => Promise<boolean>
}

async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {}
  const res = await fetch(url, {
    ...rest,
    ...(json !== undefined && {
      body: JSON.stringify(json),
      headers: { 'Content-Type': 'application/json' },
    }),
  })
  if (!res.ok) throw new Error(`${rest.method ?? 'GET'} ${url} failed (${res.status})`)
  return res.json() as Promise<T>
}

const SAVE_FAILED = "Couldn't save that change. Check your connection and try again."
const pending = new Set<string>()

export const useAppStore = create<AppStore>((set, get) => ({
  habits: [],
  checks: [],
  notes: [],
  achievements: [],
  isLoading: true,
  loadError: false,
  today: dayKey(new Date()),

  sheet: { open: false, habitId: null },
  commandOpen: false,
  shortcutsOpen: false,

  load: async () => {
    try {
      const [habits, checks, notes, achievements] = await Promise.all([
        api<Habit[]>('/api/habits'),
        api<Check[]>('/api/checks'),
        api<Note[]>('/api/notes'),
        api<Achievement[]>('/api/achievements'),
      ])
      set({ habits, checks, notes, achievements, isLoading: false, loadError: false })
    } catch (e) {
      console.error('Failed to load data:', e)
      set({ isLoading: false, loadError: true })
    }
  },

  setToday: today => set(s => (s.today === today ? s : { today })),
  openSheet: (habitId = null) => set({ sheet: { open: true, habitId } }),
  closeSheet: () => set(s => ({ sheet: { ...s.sheet, open: false } })),
  setCommandOpen: commandOpen => set({ commandOpen }),
  setShortcutsOpen: shortcutsOpen => set({ shortcutsOpen }),

  toggleCheck: async (habitId, date) => {
    const key = `${habitId}:${date}`
    const had = get().checks.some(c => c.habitId === habitId && c.date === date)
    if (pending.has(key)) return had
    pending.add(key)

    const add = () => set(s => ({ checks: [...s.checks, { id: key, habitId, date }] }))
    const remove = () => set(s => ({ checks: s.checks.filter(c => !(c.habitId === habitId && c.date === date)) }))

    if (had) remove()
    else add()
    try {
      if (had) await api(`/api/checks?habitId=${encodeURIComponent(habitId)}&date=${date}`, { method: 'DELETE' })
      else await api('/api/checks', { method: 'POST', json: { habitId, date } })
      return !had
    } catch {
      if (had) add()
      else remove()
      toast.error(SAVE_FAILED)
      return had
    } finally {
      pending.delete(key)
    }
  },

  createHabit: async input => {
    try {
      const habit = await api<Habit>('/api/habits', { method: 'POST', json: input })
      set(s => ({ habits: [...s.habits, habit] }))
      return habit
    } catch {
      toast.error("Couldn't create the habit. Try again.")
      return null
    }
  },

  updateHabit: async (id, patch) => {
    const before = get().habits.find(h => h.id === id)
    if (!before) return false
    set(s => ({ habits: s.habits.map(h => (h.id === id ? { ...h, ...patch } : h)) }))
    try {
      await api(`/api/habits/${id}`, { method: 'PATCH', json: patch })
      return true
    } catch {
      set(s => ({ habits: s.habits.map(h => (h.id === id ? before : h)) }))
      toast.error(SAVE_FAILED)
      return false
    }
  },

  deleteHabit: async id => {
    const snapshot = { habits: get().habits, checks: get().checks, notes: get().notes }
    set(s => ({
      habits: s.habits.filter(h => h.id !== id),
      checks: s.checks.filter(c => c.habitId !== id),
      notes: s.notes.filter(n => n.habitId !== id),
    }))
    try {
      await api(`/api/habits/${id}`, { method: 'DELETE' })
      return true
    } catch {
      set(snapshot)
      toast.error("Couldn't delete the habit. Try again.")
      return false
    }
  },

  reorderHabits: async ids => {
    const before = get().habits
    const byId = new Map(before.map(h => [h.id, h]))
    const next = ids.map((id, order) => ({ ...byId.get(id)!, order })).filter(h => h.id)
    set({ habits: next })
    try {
      await Promise.all(
        next
          .filter(h => byId.get(h.id)?.order !== h.order)
          .map(h => api(`/api/habits/${h.id}`, { method: 'PATCH', json: { order: h.order } }))
      )
    } catch {
      set({ habits: before })
      toast.error(SAVE_FAILED)
    }
  },

  saveNote: async (habitId, date, content) => {
    try {
      const note = await api<Note>('/api/notes', { method: 'POST', json: { habitId, date, content } })
      set(s => ({
        notes: s.notes.some(n => n.habitId === habitId && n.date === date)
          ? s.notes.map(n => (n.habitId === habitId && n.date === date ? note : n))
          : [...s.notes, note],
      }))
      return true
    } catch {
      toast.error("Couldn't save the note. Try again.")
      return false
    }
  },

  unlockAchievements: async keys => {
    const now = new Date().toISOString()
    set(s => ({
      achievements: s.achievements.map(a => (keys.includes(a.key) && !a.unlockedAt ? { ...a, unlockedAt: now } : a)),
    }))
    await Promise.all(
      keys.map(key => api('/api/achievements', { method: 'POST', json: { key } }).catch(() => undefined))
    )
  },

  resetAll: async () => {
    try {
      await api('/api/reset', { method: 'DELETE' })
      const achievements = await api<Achievement[]>('/api/achievements')
      set({ habits: [], checks: [], notes: [], achievements })
      return true
    } catch {
      toast.error("Couldn't reset your data. Try again.")
      return false
    }
  },
}))
