'use client'

import React from 'react'

interface LogoProps {
  size?: number
  className?: string
  withText?: boolean
  showBadge?: boolean
}

export function Logo({
  size = 36,
  className = '',
  withText = false,
  showBadge = true,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Scalable Vector Brandmark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.35))',
        }}
        aria-label="Habit Tracker Logo"
      >
        <defs>
          {/* Background Squircle Gradient */}
          <linearGradient id="ht-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#101726" />
            <stop offset="100%" stopColor="#080c14" />
          </linearGradient>

          {/* Border Gradient */}
          <linearGradient id="ht-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
          </linearGradient>

          {/* Left Pillar: Emerald to Cyan */}
          <linearGradient id="ht-left-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Right Pillar: Cyan to Deep Blue */}
          <linearGradient id="ht-right-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Check Swoop: Vibrant Gradient */}
          <linearGradient id="ht-check-swoop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="40%" stopColor="#34d399" />
            <stop offset="80%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Golden Spark Gradient */}
          <linearGradient id="ht-spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Ambient Glow */}
          <radialGradient id="ht-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Badge Background */}
        {showBadge && (
          <>
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="24"
              fill="url(#ht-bg-grad)"
              stroke="url(#ht-border-grad)"
              strokeWidth="2.5"
            />
            {/* Center ambient glow */}
            <circle cx="50" cy="50" r="30" fill="url(#ht-center-glow)" />
          </>
        )}

        {/* Left Pillar of the "H" */}
        <rect
          x="23"
          y="22"
          width="13"
          height="56"
          rx="6.5"
          fill="url(#ht-left-pillar)"
        />

        {/* Right Pillar of the "H" */}
        <rect
          x="64"
          y="22"
          width="13"
          height="56"
          rx="6.5"
          fill="url(#ht-right-pillar)"
        />

        {/* Dynamic Habit Checkmark crossbar bridging both pillars */}
        <path
          d="M 30 48 L 47 63 C 48.5 64.5 51 64.5 52.5 63 L 73 34"
          fill="none"
          stroke="url(#ht-check-swoop)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Golden Streak Spark at upper-right momentum apex */}
        <path
          d="M 76 16 Q 76 22 82 22 Q 76 22 76 28 Q 76 22 70 22 Q 76 22 76 16 Z"
          fill="url(#ht-spark-grad)"
          filter="drop-shadow(0 0 4px rgba(245, 158, 11, 0.8))"
        />
        <circle cx="76" cy="22" r="2" fill="#ffffff" />
      </svg>

      {/* Brand Typography */}
      {withText && (
        <span
          className="text-xl font-bold tracking-tight select-none"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Habit Tracker
        </span>
      )}
    </div>
  )
}
