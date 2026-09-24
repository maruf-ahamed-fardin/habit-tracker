import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Habit Tracker',
    short_name: 'Habit Tracker',
    description: 'A calm habit tracker. Tap once a day, watch your streaks grow.',
    start_url: '/?source=pwa',
    id: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f7f4',
    theme_color: '#3f7a5e',
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
