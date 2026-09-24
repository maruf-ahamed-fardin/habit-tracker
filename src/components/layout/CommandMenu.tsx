'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Check, Keyboard, Moon, Plus, Sun } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useAppStore } from '@/store/useAppStore'
import { useCheckIn } from '@/hooks/useCheckIn'
import { NAV_ITEMS } from './nav'

export function CommandMenu() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const open = useAppStore(s => s.commandOpen)
  const setOpen = useAppStore(s => s.setCommandOpen)
  const habits = useAppStore(s => s.habits)
  const checks = useAppStore(s => s.checks)
  const today = useAppStore(s => s.today)
  const openSheet = useAppStore(s => s.openSheet)
  const setShortcutsOpen = useAppStore(s => s.setShortcutsOpen)
  const checkIn = useCheckIn()

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Check off a habit, jump to a page, or run an action">
      <CommandInput placeholder="Type a habit or command…" />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>
        {habits.length > 0 && (
          <CommandGroup heading="Check off today">
            {habits.map((h, i) => {
              const done = checks.some(c => c.habitId === h.id && c.date === today)
              return (
                <CommandItem key={h.id} value={`check ${h.name}`} onSelect={() => run(() => checkIn(h))}>
                  <span className="text-base leading-none">{h.emoji}</span>
                  <span className="truncate">{h.name}</span>
                  {done && <Check className="text-primary" />}
                  {i < 9 && <CommandShortcut>{i + 1}</CommandShortcut>}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <CommandItem key={href} value={`go ${label}`} onSelect={() => run(() => router.push(href))}>
              <Icon />
              {label}
            </CommandItem>
          ))}
          {habits.map(h => (
            <CommandItem key={`open-${h.id}`} value={`open ${h.name} details`} onSelect={() => run(() => router.push(`/habits/${h.id}`))}>
              <span className="text-base leading-none">{h.emoji}</span>
              {h.name} details
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="new habit add create" onSelect={() => run(() => openSheet())}>
            <Plus />
            New habit
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="toggle theme dark light"
            onSelect={() => run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))}
          >
            {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} theme
          </CommandItem>
          <CommandItem value="keyboard shortcuts help" onSelect={() => run(() => setShortcutsOpen(true))}>
            <Keyboard />
            Keyboard shortcuts
            <CommandShortcut>?</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
