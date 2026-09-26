'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { format } from 'date-fns'
import { Download, Keyboard, Monitor, Moon, Smartphone, Sun, Trash2, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Page, PageHeader, DataGate } from '@/components/layout/Page'
import { Button } from '@/components/ui/button'
import { CountUp } from '@/components/ui/CountUp'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/store/useAppStore'
import { useLevel } from '@/hooks/useStats'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { XP_PER_CHECK, XP_PER_HABIT, XP_PER_PERFECT_DAY } from '@/lib/insights'
import { sound } from '@/lib/sound'
import { switchTheme } from '@/lib/theme'
import { easeOut, itemVariants, listVariants, springSnappy } from '@/lib/motion'
import { cn } from '@/lib/utils'

export default function YouPage() {
  return (
    <Page className="max-w-3xl">
      <PageHeader title="You" />
      <DataGate>
        <motion.div variants={listVariants} initial="hidden" animate="show" className="grid gap-6">
          <LevelCard />
          <Achievements />
          <Settings />
        </motion.div>
      </DataGate>
    </Page>
  )
}

function LevelCard() {
  const { level, xp, progress, nextLevelXP, toNext } = useLevel()
  return (
    <motion.section
      variants={itemVariants}
      className="hero-sheen relative grid gap-3 overflow-hidden rounded-3xl border bg-card bg-[radial-gradient(120%_120%_at_100%_0%,color-mix(in_oklab,var(--primary)_12%,var(--card))_0%,var(--card)_60%)] p-5"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Level</p>
          <p className="font-display text-5xl leading-none font-bold tabular-nums">
            <CountUp value={level} duration={0.9} />
          </p>
        </div>
        <p className="text-right text-sm text-muted-foreground">
          <CountUp value={xp} duration={1} format={n => Math.round(n).toLocaleString()} className="font-semibold text-foreground tabular-nums" /> XP
          <br />
          {toNext > 0 ? `${toNext.toLocaleString()} to level ${level + 1}` : 'Top level reached'}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={`Progress to level ${level + 1}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="relative h-2 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: easeOut, delay: 0.2 }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        +{XP_PER_CHECK} per check-in · +{XP_PER_PERFECT_DAY} per perfect day · +{XP_PER_HABIT} per habit · bonus XP from achievements
      </p>
      <p className="sr-only">Next level at {nextLevelXP} XP</p>
    </motion.section>
  )
}

const TIER_RING: Record<string, string> = {
  bronze: 'ring-[#c98f5a]/50',
  silver: 'ring-[#9aa3ad]/60',
  gold: 'ring-[#d9a400]/60',
  platinum: 'ring-[#8a6fd6]/60',
}

function Achievements() {
  const achievements = useAppStore(s => s.achievements)
  const unlocked = new Set(achievements.filter(a => a.unlockedAt).map(a => a.key))
  const list = [...ACHIEVEMENTS].sort((a, b) => Number(unlocked.has(b.key)) - Number(unlocked.has(a.key)))

  return (
    <motion.section variants={itemVariants} className="grid gap-3">
      <header className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold">Achievements</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {unlocked.size} of {ACHIEVEMENTS.length}
        </span>
      </header>
      <motion.ul variants={listVariants} className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
        {list.map(a => {
          const got = unlocked.has(a.key)
          return (
            <motion.li key={a.key} variants={itemVariants} style={{ perspective: 600 }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    aria-label={`${a.title}: ${a.description}${got ? ' (unlocked)' : ' (locked)'}`}
                    whileHover={got ? { scale: 1.08, rotateY: 12 } : { scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    transition={springSnappy}
                    className={cn(
                      'relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border bg-card text-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-3xl',
                      got ? cn('shine ring-2', TIER_RING[a.tier]) : 'opacity-35 grayscale blur-[0.6px]'
                    )}
                  >
                    {a.icon}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-center">
                  <b>{a.title}</b>
                  <br />
                  {a.description}
                  {a.xpReward > 0 && ` · +${a.xpReward} XP`}
                </TooltipContent>
              </Tooltip>
            </motion.li>
          )
        })}
      </motion.ul>
    </motion.section>
  )
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true

// Rendered only on the client (inside DataGate, after data loads), so it can
// read browser-only settings directly.
function Settings() {
  const { theme = 'system', setTheme } = useTheme()
  const lastPointer = useRef<{ x: number; y: number } | undefined>(undefined)
  const [soundOn, setSoundOn] = useState(() => sound.enabled)
  const [installed, setInstalled] = useState(isStandalone)
  const habits = useAppStore(s => s.habits)
  const checks = useAppStore(s => s.checks)
  const notes = useAppStore(s => s.notes)
  const resetAll = useAppStore(s => s.resetAll)
  const setShortcutsOpen = useAppStore(s => s.setShortcutsOpen)

  const download = (content: string, type: string, ext: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const a = document.createElement('a')
    a.href = url
    a.download = `habit-tracker-${format(new Date(), 'yyyy-MM-dd')}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    download(JSON.stringify({ habits, checks, notes, exportedAt: new Date().toISOString() }, null, 2), 'application/json', 'json')
    toast.success('Exported as JSON')
  }

  const exportCSV = () => {
    const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`
    const byId = new Map(habits.map(h => [h.id, h]))
    const rows = [
      ['habit', 'emoji', 'weekly_goal', 'date'],
      ...[...checks].sort((a, b) => a.date.localeCompare(b.date)).flatMap(c => {
        const h = byId.get(c.habitId)
        return h ? [[h.name, h.emoji, h.weeklyGoal, c.date]] : []
      }),
    ]
    download(rows.map(r => r.map(esc).join(',')).join('\n'), 'text/csv', 'csv')
    toast.success('Exported as CSV', { description: 'Opens in Excel or Google Sheets.' })
  }

  const install = async () => {
    const prompt = window.deferredPWAInstallPrompt
    if (prompt) {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
    } else {
      toast('Install from your browser', {
        description: 'Use the install icon in the address bar, or Share → Add to Home Screen on iPhone.',
      })
    }
  }

  return (
    <motion.section variants={itemVariants} className="grid gap-3">
      <h2 className="px-1 text-sm font-semibold">Settings</h2>
      <div className="divide-y overflow-hidden rounded-3xl border bg-card">
        <Row icon={<Monitor />} title="Appearance" description="Light, dark, or match device">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={theme}
            onValueChange={v => v && switchTheme(setTheme, v, lastPointer.current)}
            onPointerDown={e => {
              lastPointer.current = { x: e.clientX, y: e.clientY }
            }}
            aria-label="Theme"
          >
            <ToggleGroupItem value="light" aria-label="Light" className="data-[state=on]:bg-accent">
              <Sun />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark" className="data-[state=on]:bg-accent">
              <Moon />
            </ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label="System" className="data-[state=on]:bg-accent">
              <Monitor />
            </ToggleGroupItem>
          </ToggleGroup>
        </Row>
        <Row icon={<Volume2 />} title="Sound effects" description="Soft chimes when you check things off">
          <Switch
            checked={soundOn}
            onCheckedChange={on => {
              sound.setEnabled(on)
              setSoundOn(on)
              if (on) sound.playCheck()
            }}
            aria-label="Sound effects"
          />
        </Row>
        <Row icon={<Smartphone />} title="Install app" description={installed ? 'Installed on this device' : 'Add to your home screen'}>
          <Button variant="outline" size="sm" onClick={install} disabled={installed}>
            {installed ? 'Installed' : 'Install'}
          </Button>
        </Row>
        <Row icon={<Download />} title="Export your data" description="All habits and check-ins">
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportJSON}>
              JSON
            </Button>
          </div>
        </Row>
        <Row icon={<Keyboard />} title="Keyboard shortcuts" description="Check off habits without the mouse" className="hidden md:flex">
          <Button variant="outline" size="sm" onClick={() => setShortcutsOpen(true)}>
            Show
          </Button>
        </Row>
        <Row icon={<Trash2 />} title="Reset everything" description="Delete all habits, check-ins and notes" danger>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes {habits.length} {habits.length === 1 ? 'habit' : 'habits'}, {checks.length} check-ins and your notes. Export first if you want a copy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={async () => {
                    if (await resetAll()) toast('All data deleted')
                  }}
                >
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Row>
      </div>
    </motion.section>
  )
}

function Row({
  icon,
  title,
  description,
  children,
  danger,
  className,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  danger?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3.5', className)}>
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl bg-muted [&_svg]:size-4', danger && 'text-destructive')}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}
