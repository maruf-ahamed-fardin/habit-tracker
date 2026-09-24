// Habit colors. The order is deliberate: neighbours stay distinguishable for
// colour-blind users (validated in light and dark). Each key maps to a
// --habit-<key> CSS variable that swaps its value per theme in globals.css.
export const HABIT_COLORS = [
  { key: 'mint', label: 'Mint', hex: '#1baf7a' },
  { key: 'sky', label: 'Sky', hex: '#2a78d6' },
  { key: 'apricot', label: 'Apricot', hex: '#eb6834' },
  { key: 'lilac', label: 'Lilac', hex: '#8a6fd6' },
  { key: 'rose', label: 'Rose', hex: '#e87ba4' },
  { key: 'honey', label: 'Honey', hex: '#c98f00' },
] as const

export type HabitColorKey = (typeof HABIT_COLORS)[number]['key']

// Colours saved by the previous version of the app.
const LEGACY: Record<string, HabitColorKey> = {
  '#10b981': 'mint',
  '#34d399': 'mint',
  '#3fd68f': 'mint',
  '#38bdf8': 'sky',
  '#60a5fa': 'sky',
  '#a855f7': 'lilac',
  '#a78bfa': 'lilac',
  '#b490f5': 'lilac',
  '#f59e0b': 'honey',
  '#ffd700': 'honey',
  '#f5a94e': 'apricot',
  '#fb923c': 'apricot',
  '#f472b6': 'rose',
  '#e879f9': 'rose',
  '#9aa1ad': 'sky', // the old default for habits without a category colour
}

export function habitColorKey(hex: string | null | undefined): HabitColorKey {
  const h = (hex || '').toLowerCase()
  return HABIT_COLORS.find(c => c.hex === h)?.key ?? LEGACY[h] ?? 'mint'
}

/** CSS colour value for a habit, theme-aware. */
export function habitColor(hex: string | null | undefined): string {
  return `var(--habit-${habitColorKey(hex)})`
}

/** The least-used palette colour, so new habits spread across the palette. */
export function nextHabitColor(existing: { color: string }[]): string {
  const counts = new Map<HabitColorKey, number>()
  for (const h of existing) {
    const k = habitColorKey(h.color)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  let best: (typeof HABIT_COLORS)[number] = HABIT_COLORS[0]
  for (const c of HABIT_COLORS) {
    if ((counts.get(c.key) ?? 0) < (counts.get(best.key) ?? 0)) best = c
  }
  return best.hex
}
