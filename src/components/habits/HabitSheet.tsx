'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppStore, type Habit } from '@/store/useAppStore'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { HABIT_COLORS, habitColorKey, nextHabitColor } from '@/lib/colors'
import { HABIT_IDEAS, PRESET_EMOJIS, cn, guessEmoji } from '@/lib/utils'

export function HabitSheet() {
  const sheet = useAppStore(s => s.sheet)
  const closeSheet = useAppStore(s => s.closeSheet)
  const habit = useAppStore(s => (sheet.habitId ? s.habits.find(h => h.id === sheet.habitId) : undefined))
  const isDesktop = useIsDesktop()
  const title = habit ? 'Edit habit' : 'New habit'
  const description = habit ? 'Changes save for every day, past and future.' : 'Only the name is required. You can change everything later.'
  const onOpenChange = (open: boolean) => !open && closeSheet()
  // Remount the form each time the sheet opens so it starts fresh.
  const formKey = `${sheet.habitId ?? 'new'}-${sheet.open}`

  if (isDesktop) {
    return (
      <Dialog open={sheet.open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <HabitForm key={formKey} habit={habit} onDone={closeSheet} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={sheet.open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle className="font-display text-xl">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <HabitForm key={formKey} habit={habit} onDone={closeSheet} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

const FREQUENCIES = [
  { value: '7', label: 'Every day' },
  { value: '5', label: '5× a week' },
  { value: '3', label: '3× a week' },
  { value: 'custom', label: 'Custom' },
]

function HabitForm({ habit, onDone }: { habit?: Habit; onDone: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const habits = useAppStore(s => s.habits)
  const createHabit = useAppStore(s => s.createHabit)
  const updateHabit = useAppStore(s => s.updateHabit)
  const deleteHabit = useAppStore(s => s.deleteHabit)
  const ids = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(habit?.name ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? '✨')
  const [emojiTouched, setEmojiTouched] = useState(Boolean(habit))
  const [goal, setGoal] = useState(habit?.weeklyGoal ?? 7)
  const [custom, setCustom] = useState(Boolean(habit && ![7, 5, 3].includes(habit.weeklyGoal)))
  const [color, setColor] = useState(habit?.color ?? nextHabitColor(habits))
  const [reminder, setReminder] = useState(habit?.reminderTime ?? '')
  const [moreOpen, setMoreOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250)
    return () => clearTimeout(t)
  }, [])

  const onName = (value: string) => {
    setName(value)
    if (error) setError('')
    if (!emojiTouched) setEmoji(guessEmoji(value) ?? '✨')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give your habit a name, like "Walk 20 minutes".')
      inputRef.current?.focus()
      return
    }
    setSaving(true)
    const input = { name: trimmed, emoji, color: habitColorHex(color), weeklyGoal: goal, reminderTime: reminder || null }
    if (habit) {
      const ok = await updateHabit(habit.id, input)
      setSaving(false)
      if (ok) {
        toast.success('Changes saved')
        onDone()
      }
    } else {
      const created = await createHabit(input)
      setSaving(false)
      if (created) {
        toast.success(`${created.emoji} ${created.name} added`, { description: 'It’s on your Today list.' })
        onDone()
      }
    }
  }

  const remove = async () => {
    if (!habit) return
    setConfirmDelete(false)
    onDone()
    if (await deleteHabit(habit.id)) {
      toast(`Deleted "${habit.name}"`)
      if (pathname.startsWith(`/habits/${habit.id}`)) router.push('/habits')
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor={`${ids}-name`}>What do you want to do?</Label>
        <div className="flex gap-2">
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`Icon: ${emoji}. Change icon`}
                className="grid size-11 shrink-0 place-items-center rounded-xl border bg-muted text-2xl transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95"
              >
                {emoji}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-2">
              <div className="grid grid-cols-6 gap-1">
                {PRESET_EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    aria-label={`Use ${e}`}
                    onClick={() => {
                      setEmoji(e)
                      setEmojiTouched(true)
                      setEmojiOpen(false)
                    }}
                    className={cn(
                      'grid aspect-square place-items-center rounded-lg text-xl outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
                      e === emoji && 'bg-accent ring-2 ring-primary/50'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input
            ref={inputRef}
            id={`${ids}-name`}
            value={name}
            onChange={e => onName(e.target.value)}
            placeholder="e.g. Walk 20 minutes"
            maxLength={60}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${ids}-err` : undefined}
            className="h-11 rounded-xl text-base md:text-sm"
          />
        </div>
        {error && (
          <p id={`${ids}-err`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        {!habit && (
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pt-1 scrollbar-none">
            {HABIT_IDEAS.filter(i => !habits.some(h => h.name.toLowerCase() === i.name.toLowerCase())).map(idea => (
              <button
                key={idea.name}
                type="button"
                onClick={() => {
                  setName(idea.name)
                  setEmoji(idea.emoji)
                  setEmojiTouched(true)
                  setGoal(idea.weeklyGoal)
                  setCustom(false)
                  setError('')
                }}
                className="shrink-0 rounded-full border border-dashed px-3 py-1.5 text-xs text-muted-foreground transition-colors outline-none hover:border-solid hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {idea.emoji} {idea.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label id={`${ids}-freq`}>How often?</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-labelledby={`${ids}-freq`}
          value={custom ? 'custom' : String(goal)}
          onValueChange={v => {
            if (!v) return
            if (v === 'custom') {
              setCustom(true)
              if ([7, 5, 3].includes(goal)) setGoal(4)
            } else {
              setCustom(false)
              setGoal(Number(v))
            }
          }}
          className="grid w-full grid-cols-4"
        >
          {FREQUENCIES.map(f => (
            <ToggleGroupItem key={f.value} value={f.value} className="h-10 px-1 text-xs data-[state=on]:bg-accent data-[state=on]:text-foreground sm:text-sm">
              {f.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <AnimatePresence initial={false}>
          {custom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 pt-1 text-sm">
                <Button type="button" variant="outline" size="icon" aria-label="Fewer days" onClick={() => setGoal(g => Math.max(1, g - 1))} disabled={goal <= 1}>
                  <Minus />
                </Button>
                <span className="min-w-24 text-center tabular-nums" aria-live="polite">
                  <b className="text-base">{goal}</b> {goal === 1 ? 'day' : 'days'} a week
                </span>
                <Button type="button" variant="outline" size="icon" aria-label="More days" onClick={() => setGoal(g => Math.min(7, g + 1))} disabled={goal >= 7}>
                  <Plus />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {goal < 7 && (
          <p className="text-xs text-muted-foreground">Rest days won’t break your streak. It counts weeks where you hit {goal}.</p>
        )}
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setMoreOpen(o => !o)}
          aria-expanded={moreOpen}
          className="flex w-fit items-center gap-1 rounded-md text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          More options
          <ChevronDown className={cn('size-4 transition-transform', moreOpen && 'rotate-180')} />
        </button>
        <AnimatePresence initial={false}>
          {moreOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 pb-1">
                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-sm font-medium">Color</legend>
                  <div className="flex flex-wrap gap-2">
                    {HABIT_COLORS.map(c => {
                      const selected = habitColorKey(color) === c.key
                      return (
                        <button
                          key={c.key}
                          type="button"
                          aria-label={c.label}
                          aria-pressed={selected}
                          onClick={() => setColor(c.hex)}
                          className={cn(
                            'size-8 rounded-full outline-none ring-offset-2 ring-offset-background transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50',
                            selected && 'ring-2 ring-foreground'
                          )}
                          style={{ background: `var(--habit-${c.key})` }}
                        />
                      )
                    })}
                  </div>
                </fieldset>
                <div className="grid gap-2">
                  <Label htmlFor={`${ids}-reminder`}>Reminder time</Label>
                  <Input
                    id={`${ids}-reminder`}
                    type="time"
                    value={reminder}
                    onChange={e => setReminder(e.target.value)}
                    className="h-10 w-36 rounded-xl"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
        {habit && (
          <Button type="button" variant="ghost" className="h-11 text-destructive hover:text-destructive sm:mr-auto" onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            Delete habit
          </Button>
        )}
        <Button type="submit" disabled={saving} className="h-11 rounded-xl text-base sm:ml-auto sm:min-w-36 sm:text-sm">
          {habit ? 'Save changes' : 'Create habit'}
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{habit?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the habit with all its check-ins and notes. It can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              Delete habit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

function habitColorHex(color: string) {
  return HABIT_COLORS.find(c => c.key === habitColorKey(color))!.hex
}
