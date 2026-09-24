'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/ui/Logo'
import { useAppStore } from '@/store/useAppStore'
import { useLevel } from '@/hooks/useStats'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, isActive } from './nav'

export function Sidebar() {
  const pathname = usePathname()
  const openSheet = useAppStore(s => s.openSheet)
  const setCommandOpen = useAppStore(s => s.setCommandOpen)
  const isLoading = useAppStore(s => s.isLoading)
  const { level, xp, progress, nextLevelXP } = useLevel()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-1 border-r bg-sidebar px-3 py-5 md:flex">
      <Link href="/" className="mb-5 rounded-lg px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <Logo />
      </Link>

      <Button onClick={() => openSheet()} className="mb-2 h-10 justify-start gap-2 rounded-xl px-3 text-sm">
        <Plus className="size-4" />
        New habit
        <kbd className="ml-auto rounded bg-primary-foreground/15 px-1.5 font-mono text-[11px]">N</kbd>
      </Button>
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="mb-4 flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Search className="size-4" />
        Search
        <kbd className="ml-auto font-mono text-[11px]">Ctrl K</kbd>
      </button>

      <nav className="flex flex-col gap-0.5" aria-label="Main">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-sidebar-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon className={cn('relative size-[18px]', active && 'text-primary')} />
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </nav>

      {!isLoading && (
        <Link
          href="/you"
          className="mt-auto grid gap-2 rounded-2xl bg-sidebar-accent p-3.5 outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">Level {level}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </span>
          </span>
          <Progress value={progress * 100} className="h-1.5" aria-label="Progress to next level" />
        </Link>
      )}
    </aside>
  )
}
