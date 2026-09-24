'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/ui/Logo'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

declare global {
  interface Window {
    deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

const DISMISSED_KEY = 'pwa-prompt-dismissed'

export function PWARegister() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if ('caches' in window) {
      // Remove the cache from the first service worker version, which could hold stale chunks.
      caches.keys().then(keys => keys.filter(k => k === 'habit-tracker-v1').forEach(k => caches.delete(k)))
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => reg.update())
        .catch(err => console.error('[PWA] Service worker registration failed:', err))
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      window.deferredPWAInstallPrompt = evt
      if (!sessionStorage.getItem(DISMISSED_KEY)) setPrompt(evt)
    }
    const onInstalled = () => {
      window.deferredPWAInstallPrompt = null
      setPrompt(null)
      toast.success('Installed', { description: 'Habit Tracker is on your device now.' })
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setPrompt(null)
  }

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  return (
    <AnimatePresence>
      {prompt && (
        <motion.div
          role="dialog"
          aria-label="Install Habit Tracker"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-popover p-3 shadow-lg md:bottom-6 md:left-auto md:right-6"
        >
          <LogoMark className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install Habit Tracker</p>
            <p className="text-xs text-muted-foreground">Open it from your home screen, even offline.</p>
          </div>
          <Button size="sm" onClick={install}>
            <Download />
            Install
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={dismiss} aria-label="Not now">
            <X />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
