import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { DataProvider } from '@/components/providers/DataProvider'
import { PWARegister } from '@/components/providers/PWARegister'
import { Navbar } from '@/components/layout/Navbar'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
}

export const metadata: Metadata = {
  title: 'Habit Tracker — Build Better Habits',
  description: 'A premium, animated habit tracker. Build your best self — one day at a time.',
  applicationName: 'Habit Tracker',
  keywords: ['habit tracker', 'productivity', 'streak', 'daily habits', 'pwa'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
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
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Habit Tracker — Build Better Habits',
    description: 'A premium, animated habit tracker.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <DataProvider>
          <div className="relative min-h-dvh" style={{ background: 'var(--bg-base)' }}>
            <Navbar />
            <main className="pb-24 pt-20">
              {children}
            </main>
          </div>
          <PWARegister />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: 'transparent' },
              },
              error: {
                iconTheme: { primary: '#f43f5e', secondary: 'transparent' },
              },
            }}
          />
        </DataProvider>
      </body>
    </html>
  )
}

