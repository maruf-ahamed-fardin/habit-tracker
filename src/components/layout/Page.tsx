'use client'

import { motion } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('mx-auto w-full max-w-5xl px-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 md:pt-8 lg:px-8', className)}
    >
      {children}
    </motion.div>
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
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{eyebrow}</p>}
        <h1 className="font-display text-[32px] leading-tight font-bold md:text-4xl">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
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
  return <>{children}</>
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
