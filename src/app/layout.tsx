import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { DataProvider } from '@/components/providers/DataProvider'
import { Navbar } from '@/components/layout/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Habit Tracker — Build Better Habits',
  description: 'A premium, animated habit tracker. Build your best self — one day at a time.',
  keywords: ['habit tracker', 'productivity', 'streak', 'daily habits'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <DataProvider>
          <div className="relative min-h-dvh" style={{ background: 'var(--bg-base)' }}>
            <Navbar />
            <main className="pb-24 pt-20">
              {children}
            </main>
          </div>
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
