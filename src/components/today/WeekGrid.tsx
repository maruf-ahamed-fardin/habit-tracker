'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { useCheckIn } from '@/hooks/useCheckIn'
import { useCheckIndex } from '@/hooks/useStats'
import { datesOf } from '@/lib/insights'
import { fromKey, shiftKey, weekKeys } from '@/lib/dateUtils'
import { habitColor } from '@/lib/colors'
import { cn } from '@/lib/utils'

/** A week of check boxes for every habit, for catching up on days you forgot to log. */
export function WeekGrid() {
  const habits = useAppStore(s => s.habits)
  const today = useAppStore(s => s.today)
  const idx = useCheckIndex()
  const checkIn = useCheckIn()
  const [offset, setOffset] = useState(0)

  const days = weekKeys(shiftKey(today, -7 * offset))
  const label =
    offset === 0 ? 'This week' : offset === 1 ? 'Last week' : `${format(fromKey(days[0]), 'MMM d')} – ${format(fromKey(days[6]), 'MMM d')}`

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous week" onClick={() => setOffset(o => o + 1)}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next week" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - 1))}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2.5 pl-3 text-left text-xs font-medium text-muted-foreground">
                <span className="sr-only">Habit</span>
              </th>
              {days.map(d => (
                <th key={d} scope="col" className="px-0.5 py-2 text-center font-normal">
                  <span
                    className={cn(
                      'mx-auto grid w-8 gap-0.5 rounded-lg py-1 text-[11px] leading-none text-muted-foreground',
                      d === today && 'bg-accent text-foreground'
                    )}
                  >
                    <span>{format(fromKey(d), 'EEEEE')}</span>
                    <span className="font-semibold tabular-nums">{format(fromKey(d), 'd')}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(h => {
              const dates = datesOf(idx, h.id)
              const color = habitColor(h.color)
              return (
                <tr key={h.id} className="border-b last:border-b-0">
                  <th scope="row" className="max-w-0 py-2 pl-3 text-left font-normal sm:w-[40%]">
                    <Link href={`/habits/${h.id}`} transitionTypes={['nav-forward']} className="flex min-w-0 items-center gap-2 rounded-md outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
                      <span className="text-lg leading-none" aria-hidden="true">
                        {h.emoji}
                      </span>
                      <span className="hidden truncate sm:inline">{h.name}</span>
                      <span className="sr-only sm:hidden">{h.name}</span>
                    </Link>
                  </th>
                  {days.map(d => {
                    const done = dates.has(d)
                    const future = d > today
                    return (
                      <td key={d} className="px-0.5 py-2 text-center">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={done}
                          aria-label={`${h.name}, ${format(fromKey(d), 'EEEE MMM d')}`}
                          disabled={future}
                          onClick={() => checkIn(h, d, { quiet: d === today })}
                          className={cn(
                            'mx-auto grid size-8 place-items-center rounded-lg border outline-none transition-all active:scale-90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-30',
                            done ? 'border-transparent text-white' : 'bg-background hover:border-foreground/30'
                          )}
                          style={done ? { background: color } : undefined}
                        >
                          {done && <Check className="size-4" strokeWidth={3} />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
