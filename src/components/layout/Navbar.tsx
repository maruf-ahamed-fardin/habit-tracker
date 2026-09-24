'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Flame, BarChart3, Trophy, Settings, Zap, Volume2, VolumeX, Keyboard } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { ThemeToggle } from './ThemeToggle'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: Flame },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const { settings, setSettings } = useAppStore()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    sound.enabled = next
    if (next) sound.playClick()
    toast(next ? '🔊 Sound effects ON' : '🔇 Sound effects muted', { id: 'sound-toggle', duration: 1500 })
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setShortcutsOpen(o => !o)
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        handleToggleSound()
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
        setSettings({ ...settings, theme: newTheme })
        document.documentElement.setAttribute('data-theme', newTheme)
        sound.playClick()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [soundEnabled, settings, setSettings])

  return (
    <>
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Desktop Top Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 glass safe-top"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
                boxShadow: '0 0 18px rgba(16,185,129,0.4)',
                color: '#ffffff',
              }}
            >
              H
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Habit Tracker
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200',
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  )}
                  onClick={() => sound.playClick()}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                      transition={{ type: 'spring' as const, stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon
                    size={16}
                    className={cn(
                      'relative z-10 transition-colors',
                      isActive ? 'text-[var(--accent-green)]' : 'text-[var(--text-secondary)]'
                    )}
                  />
                  <span className="relative z-10">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* XP Display with Animated Ticker */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              title="Your Total Experience Points"
            >
              <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-amber)' }}>
                <AnimatedNumber value={settings.xp} /> XP
              </span>
            </div>

            {/* Sound FX Button */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[var(--bg-elevated)] active:scale-95"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: soundEnabled ? 'var(--accent-green)' : 'var(--text-muted)',
              }}
              title={soundEnabled ? 'Mute Sound FX [M]' : 'Enable Sound FX [M]'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Keyboard Shortcuts Helper */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="hidden lg:flex w-9 h-9 rounded-xl items-center justify-center transition-all hover:bg-[var(--bg-elevated)] active:scale-95"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              title="Keyboard Shortcuts [?]"
            >
              <Keyboard size={16} />
            </button>

            {/* Date */}
            <div className="hidden xl:block text-xs font-mono px-2" style={{ color: 'var(--text-secondary)' }}>
              {format(new Date(), 'EEE, MMM d')}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom md:hidden"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                  isActive ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'
                )}
                onClick={() => sound.playClick()}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'var(--bg-elevated)' }}
                    transition={{ type: 'spring' as const, stiffness: 450, damping: 32 }}
                  />
                )}
                <Icon
                  size={20}
                  className={cn(
                    'relative z-10 transition-colors',
                    isActive ? 'text-[var(--accent-green)]' : 'text-[var(--text-secondary)]'
                  )}
                />
                <span className="relative z-10 text-[10px] font-medium">{label}</span>
                {isActive && <span className="nav-indicator" />}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
