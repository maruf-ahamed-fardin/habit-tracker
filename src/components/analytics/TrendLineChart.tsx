'use client'

import { useAppStore } from '@/store/useAppStore'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="font-bold mb-1">{label}</div>
      <div style={{ color: '#3fd68f' }}>{payload[0]?.value ?? 0}% complete</div>
    </div>
  )
}

export function TrendLineChart() {
  const { habits, checks } = useAppStore()

  const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })

  const data = days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    const total = habits.length
    const done = habits.filter(h => checks.some(c => c.habitId === h.id && c.date === dateStr)).length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return {
      date: format(d, 'M/d'),
      pct,
      done,
      total,
    }
  })

  return (
    <div>
      <h3
        className="text-lg font-bold mb-4"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        30-Day Trend
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3fd68f" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3fd68f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={6}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="pct"
              stroke="#3fd68f"
              strokeWidth={2}
              fill="url(#trendGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#3fd68f', stroke: 'var(--bg-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
