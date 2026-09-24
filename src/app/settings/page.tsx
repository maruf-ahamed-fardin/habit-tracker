'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Download, Trash2, Bell, Moon, Sun, Shield, Smartphone } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAppStore } from '@/store/useAppStore'
import { format } from 'date-fns'

export default function SettingsPage() {
  const { habits, checks, notes, achievements, settings, setSettings, setHabits, setChecks, setNotes, setAchievements, isLoading } = useAppStore()
  const [resetting, setResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true
      setIsInstalled(isStandalone)

      const handleAppInstalled = () => {
        setIsInstalled(true)
      }
      window.addEventListener('appinstalled', handleAppInstalled)
      return () => window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (typeof window === 'undefined') return
    if (window.deferredPWAInstallPrompt) {
      await window.deferredPWAInstallPrompt.prompt()
      const { outcome } = await window.deferredPWAInstallPrompt.userChoice
      if (outcome === 'accepted') {
        toast.success('🎉 Habit Tracker installed!')
        setIsInstalled(true)
      }
    } else {
      if (isInstalled) {
        toast.success('Habit Tracker is already installed as an app!')
      } else {
        toast('To install: click the Install icon in your browser address bar or Share > Add to Home Screen', {
          icon: '📱',
          duration: 5000,
        })
      }
    }
  }

  const toggleTheme = async () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    setSettings({ ...settings, theme: newTheme })
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    })
    toast.success(`Switched to ${newTheme} mode`)
  }

  const exportJSON = () => {
    const data = { habits, checks, notes, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habit-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported as JSON')
  }

  const exportCSV = () => {
    const rows = [
      ['habit_name', 'emoji', 'category', 'weekly_goal', 'date', 'completed'],
      ...habits.flatMap(h =>
        checks
          .filter(c => c.habitId === h.id)
          .map(c => [h.name, h.emoji, h.category, h.weeklyGoal, c.date, 'true'])
      ),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habit-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported as CSV')
  }

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      toast.success('Notifications enabled!')
      new Notification('Habit Tracker Reminders Active', {
        body: 'You\'ll be reminded when your habits are due.',
        icon: '/favicon.ico',
      })
    } else {
      toast.error('Notifications blocked. Please enable in browser settings.')
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await fetch('/api/reset', { method: 'DELETE' })
      setHabits([])
      setChecks([])
      setNotes([])
      setAchievements([])
      setShowResetConfirm(false)
      toast.success('All data has been reset')
    } catch {
      toast.error('Failed to reset data')
    } finally {
      setResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full"
          style={{ border: '2px solid var(--bg-elevated)', borderTop: '2px solid var(--accent-green)' }}
        />
      </div>
    )
  }

  const SETTINGS_SECTIONS = [
    {
      title: 'Appearance',
      items: [
        {
          icon: settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />,
          label: 'Theme',
          description: `Currently using ${settings.theme} mode`,
          action: (
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {settings.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          ),
        },
      ],
    },
    {
      title: 'App & Installation',
      items: [
        {
          icon: <Smartphone size={18} />,
          label: 'Progressive Web App (PWA)',
          description: isInstalled
            ? 'Habit Tracker is running in standalone mode'
            : 'Install Habit Tracker on your phone or desktop for quick offline access',
          action: (
            <button
              onClick={handleInstallPWA}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all"
              style={{
                background: isInstalled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-elevated)',
                border: isInstalled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                color: isInstalled ? '#10b981' : 'var(--text-primary)',
              }}
            >
              <Smartphone size={15} />
              <span>{isInstalled ? 'Installed' : 'Install App'}</span>
            </button>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: <Bell size={18} />,
          label: 'Browser Notifications',
          description: 'Enable habit reminders in your browser',
          action: (
            <button
              onClick={requestNotifications}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Enable
            </button>
          ),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: <Download size={18} />,
          label: 'Export as JSON',
          description: `${habits.length} habits, ${checks.length} check-ins`,
          action: (
            <button
              onClick={exportJSON}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Export JSON
            </button>
          ),
        },
        {
          icon: <Download size={18} />,
          label: 'Export as CSV',
          description: 'Compatible with Excel, Google Sheets',
          action: (
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Export CSV
            </button>
          ),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: <Trash2 size={18} style={{ color: '#ef6e6e' }} />,
          label: 'Reset All Data',
          description: 'Permanently delete all habits, check-ins, and notes',
          action: (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'rgba(239,110,110,0.15)', border: '1px solid rgba(239,110,110,0.3)', color: '#ef6e6e' }}
            >
              Reset All
            </button>
          ),
        },
      ],
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Customize your Habit Tracker experience
          </p>
        </div>

        {/* App info card */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Logo size={48} showBadge />
          <div>
            <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Habit Tracker
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              v1.0.0 · Build Better Habits
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-bold font-mono" style={{ color: '#f5a94e', fontFamily: 'var(--font-mono)' }}>
              {settings.xp.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>XP earned</div>
          </div>
        </div>

        {/* Settings sections */}
        {SETTINGS_SECTIONS.map(section => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
              >
                {section.title}
              </h3>
            </div>
            <div>
              {section.items.map((setting, i) => (
                <div
                  key={setting.label}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                >
                  <div style={{ color: 'var(--text-secondary)' }}>{setting.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {setting.label}
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {setting.description}
                    </div>
                  </div>
                  {setting.action}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Reset confirm modal */}
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,110,110,0.3)' }}
            >
              <div className="text-4xl mb-3 text-center">⚠️</div>
              <h3
                className="text-xl font-bold text-center mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Reset All Data?
              </h3>
              <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
                This will permanently delete all your habits, check-ins, notes, and achievements. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: '#ef6e6e', color: 'white' }}
                >
                  {resetting ? 'Resetting…' : 'Yes, Reset'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
