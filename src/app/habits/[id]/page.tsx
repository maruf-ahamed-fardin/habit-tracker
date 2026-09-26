'use client'

import { ViewTransition, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { ArrowLeft, Bell, Check, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Page, DataGate } from '@/components/layout/Page'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore, type Habit } from '@/store/useAppStore'
import { useCheckIn } from '@/hooks/useCheckIn'
import { useCheckIndex } from '@/hooks/useStats'
import { datesOf, habitRates, streakFor } from '@/lib/insights'
import { dayKey, fromKey, shiftKey, weekKeys } from '@/lib/dateUtils'
import { habitColor } from '@/lib/colors'
import { formatStreak } from '@/lib/streak'
import { itemVariants, listVariants, springSnappy } from '@/lib/motion'
import { cn, frequencyLabel } from '@/lib/utils'

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <Page className="max-w-3xl">
      <Link
        href="/habits"
        transitionTypes={['nav-back']}
        className="group mb-4 inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Habits
      </Link>
      <DataGate>
        <HabitDetail id={id} />
      </DataGate>
    </Page>
  )
}

function HabitDetail({ id }: { id: string }) {
  const habit = useAppStore(s => s.habits.find(h => h.id === id))
  const today = useAppStore(s => s.today)
  const openSheet = useAppStore(s => s.openSheet)
  const idx = useCheckIndex()

  if (!habit) {
    return (
      <section className="grid justify-items-center gap-3 rounded-3xl border bg-card px-6 py-14 text-center">
        <h1 className="font-display text-2xl font-bold">Habit not found</h1>
        <p className="text-sm text-muted-foreground">It may have been deleted.</p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/habits">Back to habits</Link>
        </Button>
      </section>
    )
  }

  const streak = streakFor(habit, idx, today)
  const total = datesOf(idx, habit.id).size
  const rate30 = habitRates([habit], idx, today, 30)[0].pct
  const color = habitColor(habit.color)

  return (
    <motion.div variants={listVariants} initial="hidden" animate="show" className="grid gap-5" style={{ '--c': color } as React.CSSProperties}>
      <motion.header variants={itemVariants} className="flex items-center gap-4">
        <ViewTransition name={`habit-${habit.id}`} share="morph" default="none">
          <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--c)_15%,var(--card))] text-4xl">
            {habit.emoji}
          </span>
        </ViewTransition>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl leading-tight font-bold sm:text-3xl">{habit.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span>{frequencyLabel(habit.weeklyGoal)}</span>
            {habit.reminderTime && (
              <span className="inline-flex items-center gap-1">
                <Bell className="size-3.5" />
                {habit.reminderTime}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" className="h-9 rounded-xl" onClick={() => openSheet(habit.id)}>
          <Pencil />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      </motion.header>

      <motion.div variants={listVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Current streak" value={formatStreak(streak.current, streak.unit)} highlight={streak.current > 0} />
        <Stat label="Best streak" value={formatStreak(streak.best, streak.unit)} />
        <Stat label="Last 30 days" value={`${rate30}%`} note="of goal" />
        <Stat label="All-time" value={total.toLocaleString()} note={total === 1 ? 'check-in' : 'check-ins'} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MonthCalendar habit={habit} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Notes habit={habit} />
      </motion.div>
    </motion.div>
  )
}

function Stat({ label, value, note, highlight }: { label: string; value: string; note?: string; highlight?: boolean }) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn('grid gap-1 overflow-hidden rounded-2xl border bg-card p-4', highlight && 'border-[color-mix(in_oklab,var(--c)_35%,var(--border))]')}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={springSnappy}
          className="text-xl font-semibold tabular-nums"
        >
          {value}
          {note && <span className="ml-1 text-xs font-normal text-muted-foreground">{note}</span>}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}

function MonthCalendar({ habit }: { habit: Habit }) {
  const today = useAppStore(s => s.today)
  const idx = useCheckIndex()
  const checkIn = useCheckIn()
  const [month, setMonth] = useState(() => startOfMonth(fromKey(today)))
  const dates = datesOf(idx, habit.id)

  const { cells, doneThisMonth } = useMemo(() => {
    const first = dayKey(month)
    const last = dayKey(endOfMonth(month))
    const start = weekKeys(first)[0]
    const cells: string[] = []
    for (let d = start; d <= last || cells.length % 7 !== 0; d = shiftKey(d, 1)) cells.push(d)
    return { cells, doneThisMonth: cells.filter(d => d >= first && d <= last && dates.has(d)).length }
  }, [month, dates])

  const monthKey = format(month, 'yyyy-MM')
  const isCurrentMonth = monthKey === today.slice(0, 7)

  return (
    <section className="grid gap-4 rounded-3xl border bg-card p-4 sm:p-5">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{format(month, 'MMMM yyyy')}</h2>
          <p className="text-xs text-muted-foreground">
            {doneThisMonth} {doneThisMonth === 1 ? 'day' : 'days'} done · tap a day to change it
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setMonth(m => subMonths(m, 1))}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next month" disabled={isCurrentMonth} onClick={() => setMonth(m => addMonths(m, 1))}>
            <ChevronRight />
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {weekKeys(today).map(d => (
          <span key={d} className="pb-1 text-[11px] font-medium text-muted-foreground">
            {format(fromKey(d), 'EEEEE')}
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="-mt-2 grid grid-cols-7 gap-1.5 text-center"
        >
          {cells.map(d => {
            const inMonth = d.slice(0, 7) === monthKey
            const done = dates.has(d)
            const future = d > today
            return (
              <motion.button
                key={d}
                type="button"
                role="checkbox"
                aria-checked={done}
                aria-label={format(fromKey(d), 'EEEE, MMMM d')}
                disabled={future}
                onClick={() => checkIn(habit, d, { quiet: true })}
                whileTap={future ? undefined : { scale: 0.82 }}
                animate={done ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                className={cn(
                  'relative mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-xl text-sm tabular-nums outline-none transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-35',
                  done ? 'bg-[var(--c)] font-semibold text-white' : 'hover:bg-muted',
                  !inMonth && !done && 'text-muted-foreground/50',
                  d === today && !done && 'ring-2 ring-[var(--c)]'
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : fromKey(d).getDate()}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

function Notes({ habit }: { habit: Habit }) {
  const today = useAppStore(s => s.today)
  const notes = useAppStore(s => s.notes)
  const saveNote = useAppStore(s => s.saveNote)
  const todayNote = notes.find(n => n.habitId === habit.id && n.date === today)
  const [text, setText] = useState(todayNote?.content ?? '')
  const [saving, setSaving] = useState(false)
  const past = notes
    .filter(n => n.habitId === habit.id && n.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  const save = async () => {
    if (!text.trim()) return
    setSaving(true)
    if (await saveNote(habit.id, today, text.trim())) toast.success('Note saved')
    setSaving(false)
  }

  return (
    <section className="grid gap-3 rounded-3xl border bg-card p-4 sm:p-5">
      <header>
        <h2 className="text-sm font-semibold">Today’s note</h2>
        <p className="text-xs text-muted-foreground">How did it go? A line is enough.</p>
      </header>
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="e.g. Walked with a friend, felt great"
        aria-label="Today's note"
        className="min-h-20 rounded-xl"
      />
      <Button onClick={save} disabled={saving || !text.trim() || text.trim() === todayNote?.content} className="h-9 w-fit rounded-xl">
        {todayNote ? 'Update note' : 'Save note'}
      </Button>
      {past.length > 0 && (
        <motion.ul variants={listVariants} initial="hidden" animate="show" className="mt-2 grid gap-3 border-t pt-4">
          {past.map(n => (
            <motion.li key={n.id} variants={itemVariants} className="grid gap-0.5 text-sm">
              <span className="text-xs text-muted-foreground">{format(fromKey(n.date), 'EEE, MMM d')}</span>
              <span>{n.content}</span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  )
}
