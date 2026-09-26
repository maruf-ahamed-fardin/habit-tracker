import type { Transition, Variants } from 'framer-motion'

/**
 * The one place motion values live. Components import from here so every
 * spring, duration and stagger in the app feels like the same material.
 */

/** Snappy spring for things the user just touched (buttons, chips, checks). */
export const springSnappy: Transition = { type: 'spring', stiffness: 520, damping: 32, mass: 0.8 }
/** Soft spring for things that move on their own (cards, sheets, pills). */
export const springSoft: Transition = { type: 'spring', stiffness: 300, damping: 30, mass: 1 }
/** Bouncy spring reserved for rewards: a check landing, a badge unlocking. */
export const springBouncy: Transition = { type: 'spring', stiffness: 420, damping: 18, mass: 0.9 }

/** The app's ease-out curve for tweened fades and fills. */
export const easeOut = [0.2, 0.8, 0.2, 1] as const

export const duration = {
  fast: 0.18,
  base: 0.3,
  slow: 0.55,
} as const

/** Gap between list items when they enter together. */
export const staggerGap = 0.045

/** Parent variants for a list whose children enter one after another. */
export const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: staggerGap, delayChildren: 0.04 } },
}

/** Child variants: fade in from slightly below. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: easeOut } },
}

/** Fade + rise for a block replacing another in the same place. */
export const swapVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOut } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.fast, ease: 'easeIn' } },
}

/** Fires a short haptic pulse where the device supports it. Silent otherwise. */
export function haptic(pattern: number | number[] = 10) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  try {
    navigator.vibrate(pattern)
  } catch {}
}
