import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { DataProvider } from '@/components/providers/DataProvider'
import { PWARegister } from '@/components/providers/PWARegister'
import { AppShell } from '@/components/layout/AppShell'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', weight: ['600', '700', '800'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0f1211' },
    { media: '(prefers-color-scheme: light)', color: '#f6f7f4' },
  ],
}

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'A calm habit tracker. Tap once a day, watch your streaks grow.',
  applicationName: 'Habit Tracker',
  keywords: ['habit tracker', 'productivity', 'streak', 'daily habits', 'pwa'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Habit Tracker',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Habit Tracker',
    description: 'A calm habit tracker. Tap once a day, watch your streaks grow.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(geist.variable, geistMono.variable, bricolage.variable)}>
      <body>
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            <DataProvider>
              <AppShell>{children}</AppShell>
            </DataProvider>
            <PWARegister />
            <Toaster position="top-center" closeButton={false} />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
