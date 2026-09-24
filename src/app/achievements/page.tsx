'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { ACHIEVEMENTS, getXPForLevel } from '@/lib/achievements'
import { staggerContainerFast, fadeScale } from '@/lib/variants'

const TIER_ORDER: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 }

export default function AchievementsPage() {
  const { achievements, settings, isLoading } = useAppStore()
  const { level, progress, nextLevelXP } = getXPForLevel(settings.xp)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full"
          style={{ border: '2px solid var(--bg-elevated)', borderTop: '2px solid #3fd68f' }}
        />
      </div>
    )
  }

  const unlockedKeys = new Set(achievements.filter(a => a.unlockedAt).map(a => a.key))
  const unlockedCount = unlockedKeys.size

  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedKeys.has(a.key) ? 0 : 1
    const bUnlocked = unlockedKeys.has(b.key) ? 0 : 1
    if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked
    return (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9)
  })

  const tierColors: Record<string, string> = {
    platinum: '#b490f5',
    gold: '#ffd700',
    silver: '#9aa1ad',
    bronze: '#cd7f32',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Achievements
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {unlockedCount} / {ACHIEVEMENTS.length} unlocked
          </p>
        </div>

        {/* XP & Level card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden p-6 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 80% 50%, #f5a94e 0%, transparent 60%)' }}
          />

          <div className="relative z-10 flex items-center gap-6">
            <div
              className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(245,169,78,0.12) 0%, rgba(255,215,0,0.12) 100%)',
                border: '2px solid rgba(245,169,78,0.4)',
                boxShadow: '0 0 20px rgba(245,169,78,0.2)',
              }}
            >
              <div>
                <div
                  className="text-2xl font-bold text-center"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f5a94e' }}
                >
                  {level}
                </div>
                <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>LEVEL</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {settings.xp.toLocaleString()} XP
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {nextLevelXP > settings.xp ? `${(nextLevelXP - settings.xp).toLocaleString()} XP to level ${level + 1}` : 'Max level reached!'}
                  </div>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {unlockedCount} badges
                </div>
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #f5a94e 0%, #ffd700 100%)',
                    boxShadow: '0 0 8px rgba(245,169,78,0.4)',
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievement grid */}
        <motion.div
          variants={staggerContainerFast}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {sorted.map(achievement => {
            const unlocked = unlockedKeys.has(achievement.key)
            const tierColor = tierColors[achievement.tier] ?? '#9aa1ad'
            const achievementRecord = achievements.find(a => a.key === achievement.key)
            const unlockedDate = achievementRecord?.unlockedAt
              ? new Date(achievementRecord.unlockedAt).toLocaleDateString()
              : null

            return (
              <motion.div
                key={achievement.key}
                variants={fadeScale}
                className="relative overflow-hidden rounded-2xl p-4 text-center cursor-default"
                style={{
                  background: unlocked
                    ? `linear-gradient(135deg, ${achievement.color}10 0%, var(--bg-card) 100%)`
                    : 'var(--bg-card)',
                  border: `1px solid ${unlocked ? achievement.color + '40' : 'var(--border)'}`,
                  opacity: unlocked ? 1 : 0.45,
                  filter: unlocked ? 'none' : 'grayscale(0.7)',
                }}
                whileHover={{ scale: 1.04, transition: { duration: 0.15 } }}
              >
                {/* Tier badge */}
                <div
                  className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${tierColor}20`,
                    color: tierColor,
                    border: `1px solid ${tierColor}40`,
                  }}
                >
                  {achievement.tier}
                </div>

                {unlocked && (
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, ${achievement.color} 0%, transparent 70%)`,
                    }}
                  />
                )}

                <motion.div
                  className="text-4xl mb-2 relative z-10"
                  animate={unlocked ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {unlocked ? achievement.icon : '🔒'}
                </motion.div>

                <div
                  className="text-sm font-bold mb-1 relative z-10"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {achievement.title}
                </div>
                <div
                  className="text-[11px] leading-tight relative z-10"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {achievement.description}
                </div>

                {achievement.xpReward > 0 && (
                  <div
                    className="mt-2 text-[11px] font-semibold relative z-10"
                    style={{ color: '#f5a94e', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    +{achievement.xpReward} XP
                  </div>
                )}

                {unlocked && unlockedDate && (
                  <div className="mt-1 text-[10px] relative z-10" style={{ color: 'var(--text-muted)' }}>
                    Unlocked {unlockedDate}
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}
