'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { HabitRate, HeatCell, SeriesPoint } from '@/lib/insights'
import { fromKey } from '@/lib/dateUtils'
import { habitColor } from '@/lib/colors'
import { cn } from '@/lib/utils'

const config = { value: { label: 'Completion', color: 'var(--primary)' } } satisfies ChartConfig

function TooltipBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <span className="font-medium">{title}</span>
      <span className="text-muted-foreground">{children}</span>
    </div>
  )
}

/** Daily completion, smoothed with a trailing average when the range is long. */
export function TrendChart({ series, smooth }: { series: SeriesPoint[]; smooth: number }) {
  const data = series.map((p, i) => {
    const win = series.slice(Math.max(0, i - smooth + 1), i + 1).filter(x => x.rate !== null)
    const value = win.length ? Math.round(win.reduce((s, x) => s + (x.rate ?? 0), 0) / win.length) : null
    return { date: p.date, day: p.rate, value }
  })
  const lastIndex = data.findLastIndex(d => d.value !== null)

  return (
    <ChartContainer config={config} className="aspect-auto h-52 w-full">
      <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={36}
          tickFormatter={d => format(fromKey(d), 'MMM d')}
        />
        <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={40} />
        <ChartTooltip
          cursor={{ strokeWidth: 1 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as (typeof data)[number]
            return (
              <TooltipBox title={format(fromKey(p.date), 'EEE, MMM d')}>
                {p.day === null ? 'No habits yet' : `${p.day}% that day`}
                {smooth > 1 && p.value !== null && ` · ${p.value}% ${smooth}-day avg`}
              </TooltipBox>
            )
          }}
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill="url(#trend-fill)"
          connectNulls
          dot={({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) =>
            index === lastIndex && cx !== undefined && cy !== undefined ? (
              <circle key="end" cx={cx} cy={cy} r={4.5} fill="var(--color-value)" stroke="var(--card)" strokeWidth={2} />
            ) : (
              <g key={index} />
            )
          }
          activeDot={{ r: 4.5, strokeWidth: 2, stroke: 'var(--card)' }}
          animationDuration={700}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function WeekdayChart({ data }: { data: { day: string; name: string; rate: number | null }[] }) {
  const rates = data.map(d => d.rate ?? -1)
  const valid = rates.filter(r => r >= 0)
  const max = valid.length ? Math.max(...valid) : -1
  const min = valid.length ? Math.min(...valid) : -1
  const chart = data.map((d, i) => ({ ...d, value: d.rate ?? 0, key: i, highlight: d.rate !== null && (d.rate === max || d.rate === min) }))

  return (
    <ChartContainer config={config} className="aspect-auto h-44 w-full">
      <BarChart data={chart} margin={{ top: 20, right: 4, bottom: 0, left: 4 }}>
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={d => d.slice(0, 1)} />
        <ChartTooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as (typeof chart)[number]
            return <TooltipBox title={`${p.name}s`}>{p.rate === null ? 'No data yet' : `${p.rate}% average`}</TooltipBox>
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={700}>
          {chart.map(d => (
            <Cell key={d.key} fill="var(--color-value)" fillOpacity={d.highlight ? 1 : 0.4} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            offset={6}
            className="fill-muted-foreground"
            fontSize={11}
            content={({ x, y, width, value, index }) => {
              if (index === undefined || !chart[index]?.highlight) return null
              return (
                <text x={Number(x) + Number(width) / 2} y={Number(y) - 6} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                  {value}%
                </text>
              )
            }}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function HabitRates({ rates }: { rates: HabitRate[] }) {
  const sorted = [...rates].sort((a, b) => b.pct - a.pct)
  return (
    <ul className="grid gap-3.5">
      {sorted.map(({ habit, done, target, pct }) => (
        <li key={habit.id} className="grid grid-cols-[24px_minmax(0,1fr)_44px] items-center gap-x-2.5 gap-y-1.5 text-sm">
          <span aria-hidden="true" className="row-span-2 text-lg leading-none">
            {habit.emoji}
          </span>
          <span className="truncate">{habit.name}</span>
          <span className="row-span-2 text-right font-semibold tabular-nums">{pct}%</span>
          <span className="flex items-center gap-2">
            <span className="h-2 flex-1 overflow-hidden rounded-r-[4px] bg-muted">
              <span
                className="block h-full rounded-r-[4px] transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%`, background: habitColor(habit.color) }}
              />
            </span>
            <span className="w-14 text-right text-[11px] text-muted-foreground tabular-nums">
              {done}/{target}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

const LEVEL_MIX = [0, 28, 52, 76, 100]

export function Heatmap({ columns, today }: { columns: HeatCell[][]; today: string }) {
  const levelColor = (l: number) =>
    l <= 0 ? 'var(--muted)' : `color-mix(in oklab, var(--primary) ${LEVEL_MIX[l]}%, var(--card))`

  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto pb-1">
        <div className="grid w-fit auto-cols-min grid-flow-col grid-rows-7 gap-[3px]">
          {columns.flat().map(cell =>
            cell.level < 0 ? (
              <span
                key={cell.date}
                aria-hidden="true"
                className={cn('size-[14px] rounded-[4px] sm:size-4', cell.date <= today && 'bg-muted/50')}
              />
            ) : (
              <Tooltip key={cell.date}>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label={`${format(fromKey(cell.date), 'EEE MMM d')}: ${cell.done} of ${cell.total} habits`}
                    className={cn('size-[14px] rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-4')}
                    style={{ background: levelColor(cell.level) }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {format(fromKey(cell.date), 'EEE, MMM d')} · {cell.done} of {cell.total} habits
                </TooltipContent>
              </Tooltip>
            )
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
        Less
        {[0, 1, 2, 3, 4].map(l => (
          <span key={l} className="size-3 rounded-[3px]" style={{ background: levelColor(l) }} />
        ))}
        More
      </div>
    </div>
  )
}
