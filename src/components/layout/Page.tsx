'use client'

import { ViewTransition, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

const NAV_TYPES = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back' } as const

/**
 * Marks <body data-navigated> from the first client-side navigation on, so the
 * CSS entrance (.page-enter / .content-enter) only plays on the initial load
 * and the view transition owns every route change after that.
 */
export function NavigationWatcher() {
  const pathname = usePathname()
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    document.body.dataset.navigated = ''
  }, [pathname])
  return null
}

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ViewTransition enter={{ ...NAV_TYPES, default: 'page-fade' }} exit={{ ...NAV_TYPES, default: 'none' }} default="none">
      <div
        className={cn(
          'page-enter mx-auto w-full max-w-5xl px-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 md:pt-8 lg:px-8',
          className
        )}
      >
        {children}
      </div>
    </ViewTransition>
  )
}

export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  actions?: React.ReactNode
}) {
  const sentinel = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-px" />
      <header
        data-stuck={stuck || undefined}
        className={cn(
          'sticky top-0 z-20 -mx-4 mb-4 flex items-end justify-between gap-4 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
          'transition-[box-shadow,background-color] duration-300',
          stuck && 'bg-background/80 shadow-[0_1px_0_var(--border)] backdrop-blur-xl'
        )}
      >
        <div className="min-w-0">
          {eyebrow && (
            <p
              className={cn(
                'overflow-hidden text-xs font-medium tracking-wider text-muted-foreground uppercase transition-[opacity,height] duration-200',
                stuck ? 'h-0 opacity-0' : 'h-4 opacity-100'
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'font-display leading-tight font-bold transition-[font-size] duration-300',
              stuck ? 'text-[22px] md:text-2xl' : 'text-[32px] md:text-4xl'
            )}
          >
            {title}
          </h1>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
    </>
  )
}

/** Renders a skeleton while data loads and a retry card if loading failed. */
export function DataGate({ children, skeleton }: { children: React.ReactNode; skeleton?: React.ReactNode }) {
  const isLoading = useAppStore(s => s.isLoading)
  const loadError = useAppStore(s => s.loadError)
  const load = useAppStore(s => s.load)

  if (isLoading) return <>{skeleton ?? <DefaultSkeleton />}</>
  if (loadError) {
    return (
      <div className="grid justify-items-center gap-3 rounded-2xl border bg-card px-6 py-12 text-center">
        <p className="font-display text-xl font-bold">Couldn’t load your habits</p>
        <p className="max-w-sm text-sm text-muted-foreground">The app couldn’t reach its database. Make sure the dev server is running, then try again.</p>
        <Button
          variant="outline"
          onClick={() => {
            useAppStore.setState({ isLoading: true })
            void load()
          }}
        >
          <RotateCw />
          Try again
        </Button>
      </div>
    )
  }
  return <div className="content-enter">{children}</div>
}

function DefaultSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  )
}
