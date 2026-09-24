'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Flame, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Page, PageHeader, DataGate } from '@/components/layout/Page'
import { SegmentedRing } from '@/components/today/SegmentedRing'
import { HabitCard } from '@/components/today/HabitCard'
import { WeekGrid } from '@/components/today/WeekGrid'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/useAppStore'
import { useCheckIn } from '@/hooks/useCheckIn'
import { useCheckIndex, useLevel } from '@/hooks/useStats'
import { datesOf, dayRate, streakFor, todaySlot, weekProgress } from '@/lib/insights'
import { fromKey, weekKeys } from '@/lib/dateUtils'
import { formatStreak, inDays } from '@/lib/streak'
import { habitColor, nextHabitColor } from '@/lib/colors'
import { HABIT_IDEAS, cn } from '@/lib/utils'

export default function TodayPage() {
  const today = useAppStore(s => s.today)
  return (
    <Page>
      <PageHeader
        eyebrow={<span suppressHydrationWarning>{format(fromKey(today), 'EEEE · MMMM d')}</span>}
        title="Today"
        actions={<LevelChip />}
      />
      <DataGate skeleton={<TodaySkeleton />}>
        <TodayContent />
      </DataGate>
    </Page>
  )
}

function LevelChip() {
  const isLoading = useAppStore(s => s.isLoading)
  const { level } = useLevel()
  if (isLoading) return null
  return (
    <Link
      href="/you"
      className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
    >
      <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
      Level {level}
    </Link>
  )
}

function TodayContent() {
  const habits = useAppStore(s => s.habits)
  const today = useAppStore(s => s.today)
  const idx = useCheckIndex()
  const checkIn = useCheckIn()

  const rows = useMemo(() => {
    const week = weekKeys(today)
    return habits.map((habit, i) => {
      const dates = datesOf(idx, habit.id)
      const checked = dates.has(today)
      const weekDone = week.filter(d => dates.has(d)).length
      return {
        habit,
        shortcut: i < 9 ? i + 1 : undefined,
        checked,
        weekDone,
        // Weekly goal already met and not done today: it's a rest day for this habit.
        resting: !checked && habit.weeklyGoal < 7 && weekDone >= habit.weeklyGoal,
        week: week.map(d => ({ date: d, done: dates.has(d), isToday: d === today })),
        streak: streakFor(habit, idx, today),
      }
    })
  }, [habits, idx, today])

  if (habits.length === 0) return <EmptyToday />

  const due = rows.filter(r => !r.resting)
  const resting = rows.filter(r => r.resting)
  const done = due.filter(r => r.checked).length
  const left = due.length - done
  const top = rows.filter(r => r.streak.current > 1).sort(byStreak)[0]

  const message =
    left === 0
      ? 'Perfect day. Nothing left to do.'
      : done === 0
        ? `${due.length} ${due.length === 1 ? 'habit' : 'habits'} today. Start with the easiest one.`
        : `${left} to go. Keep it rolling.`

  const card = (r: (typeof rows)[number]) => (
    <HabitCard
      key={r.habit.id}
      habit={r.habit}
      checked={r.checked}
      week={r.week}
      weekDone={r.weekDone}
      streak={r.streak}
      shortcut={r.shortcut}
      onToggle={() => checkIn(r.habit)}
    />
  )

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid gap-5">
        <section aria-label="Today's progress" className="flex items-center gap-5 rounded-3xl border bg-card p-4 sm:p-5">
          <SegmentedRing segments={due.map(r => ({ id: r.habit.id, color: habitColor(r.habit.color), done: r.checked }))} size={112}>
            <span className="text-[28px] leading-none font-semibold tabular-nums">
              {done}/{due.length}
            </span>
            <span className="mt-1 text-[11px] text-muted-foreground">done</span>
          </SegmentedRing>
          <div className="grid min-w-0 gap-2">
            <p className="font-display text-lg leading-snug font-semibold sm:text-xl" aria-live="polite">
              {message}
            </p>
            {top && (
              <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <Flame className="size-3.5 shrink-0 fill-flame text-flame" aria-hidden="true" />
                <span className="truncate">
                  <b className="font-semibold text-foreground">{formatStreak(top.streak.current, top.streak.unit)}</b> · {top.habit.name}
                </span>
              </span>
            )}
          </div>
        </section>

        <Tabs defaultValue="list" className="gap-4">
          <div className="flex items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="list" className="px-3">Checklist</TabsTrigger>
              <TabsTrigger value="week" className="px-3">Week</TabsTrigger>
            </TabsList>
            <span className="text-xs text-muted-foreground">Tap a habit to check it off</span>
          </div>

          <TabsContent value="list" className="grid gap-2.5">
            {due.map(card)}
            {resting.length > 0 && (
              <>
                <p className="mt-3 px-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Weekly goal met · rest or keep going
                </p>
                {resting.map(card)}
              </>
            )}
          </TabsContent>
          <TabsContent value="week">
            <WeekGrid />
          </TabsContent>
        </Tabs>
      </div>

      <aside className="hidden gap-4 lg:grid">
        <ThisWeekCard />
        <StreaksCard rows={rows} />
      </aside>
    </div>
  )
}

type StreakRow = { streak: { current: number; unit: 'day' | 'week' } }
const byStreak = (a: StreakRow, b: StreakRow) => inDays(b.streak.current, b.streak.unit) - inDays(a.streak.current, a.streak.unit)

function ThisWeekCard() {
  const habits = useAppStore(s => s.habits)
  const today = useAppStore(s => s.today)
  const idx = useCheckIndex()
  const days = weekKeys(today)
  const progress = weekProgress(habits, idx, today, 0) ?? 0
  const lastWeek = weekProgress(habits, idx, today, 1, todaySlot(today))
  const delta = lastWeek === null ? null : progress - lastWeek

  return (
    <section className="grid gap-4 rounded-3xl border bg-card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">This week</h2>
        {delta !== null && (
          <span className="text-xs text-muted-foreground">
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts vs last week
          </span>
        )}
      </div>
      <p className="-mt-2">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{progress}</span>
        <span className="ml-0.5 text-lg text-muted-foreground">%</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">of weekly goals reached</span>
      </p>
      <div className="grid h-24 grid-cols-7 items-end gap-2" role="img" aria-label="Completion for each day this week">
        {days.map(d => {
          const future = d > today
          const r = future ? null : dayRate(habits, idx, d)
          return (
            <div key={d} className="grid h-full grid-rows-[1fr_auto] items-end gap-1.5 text-center">
              <div className="relative h-full rounded-t-[4px] bg-muted">
                <div
                  className={cn('absolute inset-x-0 bottom-0 rounded-t-[4px] bg-primary transition-[height] duration-700', d !== today && 'opacity-60')}
                  style={{ height: `${Math.round((r ?? 0) * 100)}%` }}
                  title={r === null ? undefined : `${Math.round(r * 100)}%`}
                />
              </div>
              <span className={cn('text-[11px] text-muted-foreground', d === today && 'font-semibold text-foreground')}>
                {format(fromKey(d), 'EEEEE')}
              </span>
            </div>
          )
        })}
      </div>
      <Link href="/insights" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        See all insights <ArrowRight className="size-3.5" />
      </Link>
    </section>
  )
}

function StreaksCard({ rows }: { rows: { habit: { id: string; name: string; emoji: string }; streak: { current: number; unit: 'day' | 'week' } }[] }) {
  const top = [...rows]
    .filter(r => r.streak.current > 0)
    .sort(byStreak)
    .slice(0, 4)
  return (
    <section className="grid gap-3 rounded-3xl border bg-card p-5">
      <h2 className="text-sm font-semibold">Current streaks</h2>
      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground">Check something off today to start a streak.</p>
      ) : (
        <ul className="grid gap-2.5">
          {top.map(r => (
            <li key={r.habit.id} className="flex items-center gap-2.5 text-sm">
              <span aria-hidden="true">{r.habit.emoji}</span>
              <span className="min-w-0 flex-1 truncate">{r.habit.name}</span>
              <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                <Flame className="size-3.5 fill-flame text-flame" aria-hidden="true" />
                {formatStreak(r.streak.current, r.streak.unit, true)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function EmptyToday() {
  const habits = useAppStore(s => s.habits)
  const createHabit = useAppStore(s => s.createHabit)
  const openSheet = useAppStore(s => s.openSheet)

  const addIdea = async (idea: (typeof HABIT_IDEAS)[number]) => {
    const created = await createHabit({ ...idea, color: nextHabitColor(useAppStore.getState().habits) })
    if (created) toast.success(`${created.emoji} ${created.name} added`)
  }

  return (
    <section className="grid justify-items-center gap-5 rounded-3xl border bg-card px-5 py-12 text-center">
      <SegmentedRing segments={[]} size={96} stroke={9}>
        <span className="text-3xl" aria-hidden="true">🌱</span>
      </SegmentedRing>
      <div className="grid max-w-sm gap-2">
        <h2 className="font-display text-2xl font-bold">Start with one small habit</h2>
        <p className="text-sm text-muted-foreground">Pick an idea below to add it right away, or write your own. Each day, just tap it when it’s done.</p>
      </div>
      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {HABIT_IDEAS.filter(i => !habits.some(h => h.name === i.name)).map(idea => (
          <Button key={idea.name} variant="outline" className="h-9 rounded-full" onClick={() => addIdea(idea)}>
            <span aria-hidden="true">{idea.emoji}</span>
            {idea.name}
          </Button>
        ))}
      </div>
      <Button className="h-11 rounded-xl px-5" onClick={() => openSheet()}>
        <Plus />
        Create your own
      </Button>
    </section>
  )
}

function TodaySkeleton() {
  return (
    <div className="grid gap-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-36 rounded-3xl" />
      <Skeleton className="h-8 w-48 rounded-lg" />
      {[0, 1, 2, 3].map(i => (
        <Skeleton key={i} className="h-[70px] rounded-2xl" />
      ))}
    </div>
  )
}
