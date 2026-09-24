'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Flame, GripVertical, Plus, Search } from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Page, PageHeader, DataGate } from '@/components/layout/Page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore, type Habit } from '@/store/useAppStore'
import { useCheckIndex } from '@/hooks/useStats'
import { habitRates, streakFor, type CheckIndex } from '@/lib/insights'
import { habitColor } from '@/lib/colors'
import { formatStreak } from '@/lib/streak'
import { cn, frequencyLabel } from '@/lib/utils'

export default function HabitsPage() {
  const openSheet = useAppStore(s => s.openSheet)
  const count = useAppStore(s => s.habits.length)
  const isLoading = useAppStore(s => s.isLoading)
  return (
    <Page>
      <PageHeader
        eyebrow={isLoading ? ' ' : `${count} ${count === 1 ? 'habit' : 'habits'}`}
        title="Habits"
        actions={
          <Button onClick={() => openSheet()} className="hidden h-9 rounded-xl sm:inline-flex">
            <Plus />
            New habit
          </Button>
        }
      />
      <DataGate>
        <HabitsList />
      </DataGate>
    </Page>
  )
}

function HabitsList() {
  const habits = useAppStore(s => s.habits)
  const today = useAppStore(s => s.today)
  const reorder = useAppStore(s => s.reorderHabits)
  const openSheet = useAppStore(s => s.openSheet)
  const idx = useCheckIndex()
  const [query, setQuery] = useState('')

  const rates = useMemo(() => new Map(habitRates(habits, idx, today, 30).map(r => [r.habit.id, r.pct])), [habits, idx, today])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (habits.length === 0) {
    return (
      <section className="grid justify-items-center gap-3 rounded-3xl border bg-card px-6 py-14 text-center">
        <h2 className="font-display text-2xl font-bold">No habits yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">Create one to get started. You can add more any time with the + button.</p>
        <Button className="mt-2 h-10 rounded-xl" onClick={() => openSheet()}>
          <Plus />
          New habit
        </Button>
      </section>
    )
  }

  const filtered = query.trim() ? habits.filter(h => h.name.toLowerCase().includes(query.trim().toLowerCase())) : habits
  const canDrag = !query.trim()

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = habits.map(h => h.id)
    void reorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  return (
    <div className="grid gap-4">
      {habits.length > 8 && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search habits"
            aria-label="Search habits"
            className="h-10 rounded-xl pl-9"
          />
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={filtered.map(h => h.id)} strategy={verticalListSortingStrategy}>
          <ul className="grid gap-2.5">
            {filtered.map(h => (
              <HabitRow key={h.id} habit={h} idx={idx} today={today} rate={rates.get(h.id) ?? 0} draggable={canDrag} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No habits match “{query}”.</p>}
      {canDrag && habits.length > 1 && (
        <p className="text-center text-xs text-muted-foreground">Drag the handle to reorder. The order is used on Today and for the 1–9 shortcuts.</p>
      )}
    </div>
  )
}

function HabitRow({ habit, idx, today, rate, draggable }: { habit: Habit; idx: CheckIndex; today: string; rate: number; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
    disabled: !draggable,
  })
  const streak = streakFor(habit, idx, today)
  const color = habitColor(habit.color)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, '--c': color } as React.CSSProperties}
      className={cn('relative flex items-center gap-1 rounded-2xl border bg-card pr-2', isDragging && 'z-10 shadow-lg')}
    >
      {draggable && (
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={`Reorder ${habit.name}`}
          className="grid h-full w-8 shrink-0 cursor-grab touch-none place-items-center self-stretch rounded-l-2xl text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <Link
        href={`/habits/${habit.id}`}
        className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-xl py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50', !draggable && 'pl-3')}
      >
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-[color-mix(in_oklab,var(--c)_14%,var(--card))] text-[22px]">
          {habit.emoji}
        </span>
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="truncate text-[15px] font-semibold">{habit.name}</span>
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>{frequencyLabel(habit.weeklyGoal)}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{rate}% last 30 days</span>
            {streak.current > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                  <Flame className="size-3.5 fill-flame text-flame" aria-hidden="true" />
                  {formatStreak(streak.current, streak.unit, true)}
                </span>
              </>
            )}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  )
}
