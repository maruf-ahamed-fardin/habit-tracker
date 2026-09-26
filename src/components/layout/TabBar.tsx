'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, isActive, navType } from './nav'
import { springSnappy, springSoft } from '@/lib/motion'

export function TabBar() {
  const pathname = usePathname()
  const openSheet = useAppStore(s => s.openSheet)
  const [left, right] = [NAV_ITEMS.slice(0, 2), NAV_ITEMS.slice(2)]

  const tab = ({ href, label, icon: Icon }: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(pathname, href)
    return (
      <Link
        key={href}
        href={href}
        transitionTypes={navType(pathname, href)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex h-full flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
          active ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {active && (
          <motion.span
            layoutId="tab-active"
            className="absolute inset-x-2 top-1 h-1 rounded-full bg-primary"
            transition={springSoft}
          />
        )}
        <motion.span
          className="grid place-items-center transition-transform duration-200 group-active:scale-90"
          animate={active ? { y: [0, -3, 0], scale: [1, 1.12, 1] } : { y: 0, scale: 1 }}
          transition={active ? { duration: 0.4, ease: 'easeOut', times: [0, 0.4, 1] } : springSnappy}
        >
          <Icon className={cn('size-[22px]', active && 'text-primary')} strokeWidth={active ? 2.2 : 1.8} />
        </motion.span>
        {label}
      </Link>
    )
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 grid h-16 grid-cols-[1fr_1fr_72px_1fr_1fr] items-center rounded-3xl border bg-card/85 px-1 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl md:hidden"
    >
      {left.map(tab)}
      <motion.button
        type="button"
        onClick={() => openSheet()}
        whileTap={{ scale: 0.9, rotate: 90 }}
        transition={springSnappy}
        aria-label="New habit"
        className="mx-auto grid size-13 place-items-center rounded-[18px] bg-primary text-primary-foreground shadow-[0_8px_18px_-6px_var(--primary)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Plus className="size-6" strokeWidth={2.4} />
      </motion.button>
      {right.map(tab)}
    </nav>
  )
}
