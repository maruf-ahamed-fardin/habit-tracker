import confetti from 'canvas-confetti'

// Subtle local burst at button coordinates
export function triggerCheckConfetti(x?: number, y?: number) {
  if (typeof window === 'undefined') return

  const origin =
    x !== undefined && y !== undefined
      ? { x: x / window.innerWidth, y: y / window.innerHeight }
      : { x: 0.5, y: 0.6 }

  confetti({
    particleCount: 22,
    spread: 55,
    startVelocity: 18,
    origin,
    colors: ['#10b981', '#34d399', '#38bdf8', '#f59e0b', '#ffffff'],
    ticks: 80,
    gravity: 1.1,
    scalar: 0.75,
    shapes: ['circle'],
    disableForReducedMotion: true,
  })
}

// Grand celebratory fireworks display (e.g. 100% daily completion)
export function triggerAllDoneConfetti() {
  if (typeof window === 'undefined') return

  const count = 160
  const defaults = {
    origin: { y: 0.7 },
    disableForReducedMotion: true,
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10b981', '#34d399', '#6ee7b7'],
  })
  fire(0.2, {
    spread: 60,
    colors: ['#f59e0b', '#fbbf24', '#fde68a'],
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#38bdf8', '#818cf8', '#c084fc'],
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#ffffff', '#10b981', '#f59e0b'],
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#10b981', '#38bdf8'],
  })
}
