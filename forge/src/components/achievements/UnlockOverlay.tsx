'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getAchievementByKey } from '@/lib/achievements'

export function UnlockOverlay() {
  const { pendingAchievement, setPendingAchievement } = useAppStore()
  const achievement = pendingAchievement ? getAchievementByKey(pendingAchievement) : null

  useEffect(() => {
    if (pendingAchievement) {
      const timer = setTimeout(() => setPendingAchievement(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [pendingAchievement, setPendingAchievement])

  return (
    <AnimatePresence>
      {achievement && (
        <>
          {/* Dark backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPendingAchievement(null)}
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          />

          {/* Confetti particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: '50vw',
                y: '50vh',
                scale: 0,
              }}
              animate={{
                opacity: 0,
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: Math.random() * 2 + 0.5,
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              className="fixed z-[100] pointer-events-none"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: ['#3fd68f', '#f5a94e', '#a78bfa', '#60a5fa', '#ffd700'][i % 5],
              }}
            />
          ))}

          {/* Achievement card */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none">
            <motion.div
              className="achievement-card-reveal"
              style={{ pointerEvents: 'auto' }}
            >
              <div
                className="relative w-80 rounded-3xl overflow-hidden p-8 text-center"
                style={{
                  background: `linear-gradient(135deg, ${achievement.color}15 0%, var(--bg-card) 100%)`,
                  border: `2px solid ${achievement.color}`,
                  boxShadow: `0 0 60px ${achievement.color}40, var(--shadow-elevated)`,
                }}
              >
                {/* Glow orb */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-20 blur-3xl"
                  style={{ background: achievement.color }}
                />

                {/* Tier badge */}
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                  style={{
                    background: `${achievement.color}20`,
                    color: achievement.color,
                    border: `1px solid ${achievement.color}40`,
                  }}
                >
                  {achievement.tier} achievement
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 15 }}
                  className="text-7xl mb-4"
                >
                  {achievement.icon}
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: achievement.color }}>
                    Achievement Unlocked!
                  </div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                  >
                    {achievement.title}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {achievement.description}
                  </p>

                  {achievement.xpReward > 0 && (
                    <div
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-mono font-bold text-sm"
                      style={{
                        background: 'rgba(245,169,78,0.15)',
                        border: '1px solid rgba(245,169,78,0.3)',
                        color: '#f5a94e',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      ⚡ +{achievement.xpReward} XP
                    </div>
                  )}
                </motion.div>

                {/* Tap to dismiss */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-xs mt-6 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => setPendingAchievement(null)}
                >
                  Tap anywhere to dismiss
                </motion.p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

