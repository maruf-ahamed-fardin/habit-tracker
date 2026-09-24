import confetti from 'canvas-confetti'

const COLORS = ['#1baf7a', '#2a78d6', '#eb6834', '#8a6fd6', '#e87ba4', '#c98f00']

/** Reserved for the big moments: a perfect day or a new achievement. */
export function celebrate() {
  if (typeof window === 'undefined') return
  const base = { disableForReducedMotion: true, colors: COLORS, ticks: 160, scalar: 0.9 }
  confetti({ ...base, particleCount: 70, spread: 70, startVelocity: 42, origin: { x: 0.5, y: 0.72 } })
  setTimeout(() => {
    confetti({ ...base, particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } })
    confetti({ ...base, particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } })
  }, 180)
}
