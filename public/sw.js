// Habit Tracker — Progressive Web App Service Worker
const CACHE_NAME = 'habit-tracker-v3'
const IS_DEV =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname.endsWith('.local')

const STATIC_ASSETS = [
  '/',
  '/habits',
  '/insights',
  '/you',
  '/manifest.json',
  '/favicon.svg',
  '/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// 1. Install Event: Skip waiting and cache app shell (production only)
self.addEventListener('install', (event) => {
  self.skipWaiting()
  if (IS_DEV) {
    // In development mode, do not pre-cache to avoid serving stale bundles during HMR
    return
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching non-fatal warning:', err)
      })
    })
  )
})

// 2. Activate Event: Clean up outdated caches immediately and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Deleting obsolete cache:', key)
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // In development, bypass service worker caching completely so changes reflect instantly
  if (IS_DEV) {
    return
  }

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return
  }

  // Skip Next.js HMR or development internals
  if (url.pathname.includes('/_next/webpack-hmr') || url.pathname.includes('hot-update')) {
    return
  }

  // API Requests: Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // Static Assets (_next/static, images, icons, fonts): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        }).catch(() => cached)

        return cached || fetchPromise
      })
    )
    return
  }

  // Page Navigations: Network-First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        return caches.match('/')
      })
  )
})

