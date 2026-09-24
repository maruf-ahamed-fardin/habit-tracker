import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('grid size-8 shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground', className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-[55%]" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5.5 12.5 4 4 9-9" />
      </svg>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-display text-lg font-bold">Habit Tracker</span>
    </span>
  )
}
