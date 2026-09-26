/**
 * Switches the theme with a circular reveal that grows from where the user
 * clicked, using the browser View Transitions API. Falls back to an instant
 * switch where the API is missing or motion is reduced.
 */
export function switchTheme(setTheme: (theme: string) => void, next: string, origin?: { x: number; y: number }) {
  if (typeof document === 'undefined') return setTheme(next)
  const root = document.documentElement
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
  if (!doc.startViewTransition || reduced) return setTheme(next)

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${r}px`)
  root.classList.add('theme-switching')

  const resolved = next === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : next
  const transition = doc.startViewTransition(() => {
    // Apply the class synchronously so the new snapshot already has the new colours;
    // next-themes then sets the same class from React state.
    root.classList.toggle('dark', resolved === 'dark')
    root.classList.toggle('light', resolved === 'light')
    root.style.colorScheme = resolved
    setTheme(next)
  })
  void transition.finished.finally(() => root.classList.remove('theme-switching'))
}
