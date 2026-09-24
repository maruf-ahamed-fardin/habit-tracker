'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'
import { sound } from '@/lib/sound'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface Window {
    deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // 1. Register Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope)
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error)
          })
      })
    }
  }, [])

  // 2. Listen for BeforeInstallPrompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      window.deferredPWAInstallPrompt = promptEvent
      setInstallPrompt(promptEvent)

      // Only show banner if not previously dismissed in this session
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    const handleAppInstalled = () => {
      window.deferredPWAInstallPrompt = null
      setInstallPrompt(null)
      setShowBanner(false)
      sound.playFanfare()
      toast.success('🎉 Habit Tracker installed on your device!', { duration: 4000 })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    sound.playClick()
    if (!installPrompt) {
      toast('To install: click the Install icon in your browser address bar or Share > Add to Home Screen', {
        icon: '📱',
        duration: 4500,
      })
      return
    }

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
  }

  const handleDismiss = () => {
    sound.playClick()
    setShowBanner(false)
    setIsDismissed(true)
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (!showBanner || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-4 rounded-2xl shadow-2xl glass"
        style={{
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Smartphone size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Install Habit Tracker App
            </h4>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Add to your home screen for quick offline access and habit check-ins.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Download size={13} strokeWidth={2.5} />
                <span>Install</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Not now
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
            aria-label="Close install prompt"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
