'use client'

import { useEffect, useRef } from 'react'

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles: HTMLDivElement[] = []
    const colors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b']
    const count = 25

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.className = 'particle'

      const size = Math.random() * 4 + 1
      const color = colors[Math.floor(Math.random() * colors.length)]
      const left = Math.random() * 100
      const duration = Math.random() * 20 + 15
      const delay = Math.random() * 15

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${left}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        box-shadow: 0 0 ${size * 2}px ${color};
      `
      container.appendChild(p)
      particles.push(p)
    }

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [])

  return <div ref={containerRef} className="particles-bg" aria-hidden="true" />
}
