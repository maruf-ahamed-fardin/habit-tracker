'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useCheckIn } from '@/hooks/useCheckIn'
import { HabitSheet } from '@/components/habits/HabitSheet'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'
import { CommandMenu } from './CommandMenu'
import { ShortcutsDialog } from './ShortcutsDialog'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="min-h-dvh pb-32 md:pb-12 md:pl-60">{children}</main>
      <TabBar />
      <HabitSheet />
      <CommandMenu />
      <ShortcutsDialog />
      <GlobalShortcuts />
    </>
  )
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

function GlobalShortcuts() {
  const checkIn = useCheckIn()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useAppStore.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        s.setCommandOpen(!s.commandOpen)
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (s.sheet.open || s.commandOpen || document.querySelector('[role="dialog"]')) return

      if (e.key === '?') {
        e.preventDefault()
        s.setShortcutsOpen(true)
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        s.openSheet()
      } else if (/^[1-9]$/.test(e.key)) {
        const habit = s.habits[Number(e.key) - 1]
        if (habit) {
          e.preventDefault()
          void checkIn(habit)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [checkIn])

  return null
}
