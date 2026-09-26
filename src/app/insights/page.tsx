'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Page, PageHeader, DataGate } from '@/components/layout/Page'
import { Button } from '@/components/ui/button'
import { CountUp } from '@/components/ui/CountUp'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { HabitRates, Heatmap, TrendChart, WeekdayChart } from '@/components/insights/Charts'
import { useAppStore } from '@/store/useAppStore'
import { useCheckIndex } from '@/hooks/useStats'
import {
  checksIn,
  completionSeries,
  habitRates,
  heatmap,
  perfectDays,
  todaySlot,
  topStreak,
  weekdayProfile,
  weekProgress,
} from '@/lib/insights'
import { lastNDays, shiftKey } from '@/lib/dateUtils'
import { itemVariants, listVariants } from '@/lib/motion'

const RANGES = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
]

export default function InsightsPage() {
  const [range, setRange] = useState(30)
  return (
    <Page>
      <PageHeader
        eyebrow={`Last ${range} days`}
        title="Insights"
        actions={
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={String(range)}
            onValueChange={v => v && setRange(Number(v))}
            aria-label="Time range"
          >
            {RANGES.map(r => (
              <ToggleGroupItem key={r.value} value={r.value} className="px-2.5 text-xs data-[state=on]:bg-accent">
                {r.label.replace(' days', 'd')}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />
      <DataGate skeleton={<InsightsSkeleton />}>
        <InsightsContent range={range} />
      </DataGate>
    </Page>
  )
}

function InsightsContent({ range }: { range: number }) {
  const habits = useAppStore(s => s.habits)
  const today = useAppStore(s => s.today)
  const openSheet = useAppStore(s => s.openSheet)
  const idx = useCheckIndex()

  const stats = useMemo(() => {
    const keys = lastNDays(today, range)
    const prevKeys = lastNDays(shiftKey(today, -range), range)
    const series = completionSeries(habits, idx, today, range)
    const prevSeries = completionSeries(habits, idx, shiftKey(today, -range), range)
    const avg = (pts: typeof series) => {
      const v = pts.filter(p => p.rate !== null)
      return v.length ? Math.round(v.reduce((s, p) => s + (p.rate ?? 0), 0) / v.length) : null
    }
    const week = weekProgress(habits, idx, today, 0)
    const lastWeek = weekProgress(habits, idx, today, 1, todaySlot(today))
    const completion = avg(series)
    const prevCompletion = avg(prevSeries)
    const weekdays = weekdayProfile(habits, idx, today, Math.max(range, 28))
    const valid = weekdays.filter(w => w.rate !== null)
    const best = valid.length ? valid.reduce((a, b) => ((b.rate ?? 0) > (a.rate ?? 0) ? b : a)) : null
    const worst = valid.length ? valid.reduce((a, b) => ((b.rate ?? 0) < (a.rate ?? 0) ? b : a)) : null
    return {
      series,
      week,
      weekDelta: week !== null && lastWeek !== null ? week - lastWeek : null,
      completion,
      completionDelta: completion !== null && prevCompletion !== null && prevSeries.some(p => p.rate !== null) ? completion - prevCompletion : null,
      perfect: perfectDays(habits, idx, keys),
      checkins: checksIn(habits, idx, keys),
      prevCheckins: checksIn(habits, idx, prevKeys),
      top: topStreak(habits, idx, today),
      weekdays,
      best,
      worst,
      rates: habitRates(habits, idx, today, range),
      heat: heatmap(habits, idx, today, 12),
    }
  }, [habits, idx, today, range])

  if (habits.length === 0) {
    return (
      <motion.section
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid justify-items-center gap-3 rounded-3xl border bg-card px-6 py-14 text-center"
      >
        <motion.div variants={itemVariants} aria-hidden="true" className="flex h-12 items-end gap-1.5">
          {[0.35, 0.6, 0.45, 0.8, 1].map((h, i) => (
            <motion.span
              key={i}
              className="w-3 rounded-t-[3px] bg-primary/70"
              initial={{ height: 0 }}
              animate={{ height: `${h * 100}%` }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            />
          ))}
        </motion.div>
        <motion.h2 variants={itemVariants} className="font-display text-2xl font-bold">
          Nothing to chart yet
        </motion.h2>
        <motion.p variants={itemVariants} className="max-w-sm text-sm text-muted-foreground">
          Add a habit and check it off for a few days. Your trends, best days and streaks will show up here.
        </motion.p>
        <motion.div variants={itemVariants} whileTap={{ scale: 0.97 }}>
          <Button className="mt-2 h-10 rounded-xl" onClick={() => openSheet()}>
            <Plus />
            Add a habit
          </Button>
        </motion.div>
      </motion.section>
    )
  }

  return (
    <motion.div key={range} variants={listVariants} initial="hidden" animate="show" className="grid gap-4">
      <motion.div variants={listVariants} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="This week" value={stats.week ?? 0} suffix="%" delta={stats.weekDelta} deltaNote="vs same point last week" hint="of weekly goals reached" />
        <Tile label="Completion" value={stats.completion ?? 0} suffix="%" delta={stats.completionDelta} deltaNote={`vs previous ${range} days`} hint={`average over ${range} days`} />
        <Tile
          label="Best current streak"
          value={stats.top?.streak.current ?? 0}
          suffix={stats.top ? (stats.top.streak.unit === 'week' ? (stats.top.streak.current === 1 ? 'week' : 'weeks') : stats.top.streak.current === 1 ? 'day' : 'days') : 'days'}
          hint={stats.top ? `${stats.top.habit.emoji} ${stats.top.habit.name}` : 'Check in today to start one'}
        />
        <Tile
          label="Perfect days"
          value={stats.perfect}
          suffix={`/ ${range}`}
          hint={`${stats.checkins.toLocaleString()} check-ins${stats.prevCheckins ? ` (${stats.checkins >= stats.prevCheckins ? '+' : '−'}${Math.abs(stats.checkins - stats.prevCheckins)})` : ''}`}
        />
      </motion.div>

      <Card title="Completion trend" subtitle={range > 7 ? 'Share of habits done each day, 7-day average' : 'Share of habits done each day'}>
        <TrendChart series={stats.series} smooth={range > 7 ? 7 : 1} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Your week"
          subtitle={
            stats.best && stats.worst && stats.best !== stats.worst
              ? `Strongest on ${stats.best.name}s, weakest on ${stats.worst.name}s`
              : 'Average completion for each weekday'
          }
        >
          <WeekdayChart data={stats.weekdays} />
        </Card>
        <Card title="By habit" subtitle={`Check-ins vs. each habit's goal, last ${range} days`}>
          <HabitRates rates={stats.rates} />
        </Card>
      </div>

      <Card title="Last 12 weeks" subtitle="Each square is a day. Darker means more habits done.">
        <Heatmap columns={stats.heat} today={today} />
      </Card>
    </motion.div>
  )
}

function Tile({
  label,
  value,
  suffix,
  delta,
  deltaNote,
  hint,
}: {
  label: string
  value: number
  suffix?: string
  delta?: number | null
  deltaNote?: string
  hint?: string
}) {
  return (
    <motion.div variants={itemVariants} className="grid content-start gap-1 rounded-2xl border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-1">
        <CountUp value={value} format={n => Math.round(n).toLocaleString()} className="text-3xl font-semibold tracking-tight tabular-nums" />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </span>
      {delta !== undefined && delta !== null ? (
        <span className="text-xs text-muted-foreground">
          <b className={delta >= 0 ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts
          </b>{' '}
          {deltaNote}
        </span>
      ) : (
        hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>
      )}
    </motion.div>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.section variants={itemVariants} className="grid content-start gap-4 rounded-3xl border bg-card p-4 sm:p-5">
      <header className="grid gap-0.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </motion.section>
  )
}

function InsightsSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-3xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  )
}
