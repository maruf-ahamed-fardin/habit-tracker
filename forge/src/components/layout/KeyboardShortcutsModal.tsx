'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Command } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'N', label: 'Focus Quick Add Habit' },
  { key: 'T', label: 'Toggle Dark / Light Theme' },
  { key: 'M', label: 'Toggle Sound Effects (FX)' },
  { key: '← / →', label: 'Navigate Prev / Next Week' },
  { key: '1 – 9', label: 'Check / Uncheck Today’s Habit #1 to #9' },
  { key: '?', label: 'Open / Close this Shortcuts Menu' },
  { key: 'Esc', label: 'Close Active Modals' },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 28 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto rounded-2xl overflow-hidden p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Command size={18} style={{ color: 'var(--accent-green)' }} />
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                >
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="divide-y divide-[var(--border-subtle)] mt-3">
              {SHORTCUTS.map(sc => (
                <div key={sc.key} className="flex items-center justify-between py-2.5">
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {sc.label}
                  </span>
                  <kbd
                    className="px-2 py-1 rounded-md text-xs font-mono font-semibold"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--accent-green)',
                      boxShadow: '0 2px 0 var(--border)',
                    }}
                  >
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)] font-mono">
              Press <span className="text-[var(--text-primary)] font-bold">Esc</span> or click outside to dismiss
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
