'use client'

import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

export function ThemeToggle() {
  const { settings, setSettings } = useAppStore()
  const isDark = settings.theme === 'dark'

  const toggle = async () => {
    const newTheme = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    setSettings({ ...settings, theme: newTheme })
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    })
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-[var(--bg-elevated)] active:scale-95"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light Mode [T]' : 'Switch to Night Mode [T]'}
    >
      <motion.div
        key={isDark ? 'sun' : 'moon'}
        initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? (
          <Sun size={16} className="text-[#f5a94e]" />
        ) : (
          <Moon size={16} className="text-[#6366f1]" />
        )}
      </motion.div>
    </motion.button>
  )
}
