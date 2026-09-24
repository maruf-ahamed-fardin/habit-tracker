import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Habit Tracker — Build Better Habits',
    short_name: 'Habit Tracker',
    description: 'Track your daily habits, build unbreakable streaks, and level up your discipline.',
    start_url: '/?source=pwa',
    id: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    categories: ['productivity', 'lifestyle', 'health'],
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
