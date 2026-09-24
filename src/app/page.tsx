'use client'

import { motion } from 'framer-motion'
import { ParticleBackground } from '@/components/dashboard/ParticleBackground'
import { TodayCard } from '@/components/dashboard/TodayCard'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { HabitList } from '@/components/habits/HabitList'
import { QuickAddHabit } from '@/components/habits/QuickAddHabit'
import { UnlockOverlay } from '@/components/achievements/UnlockOverlay'
import { useAppStore } from '@/store/useAppStore'
import { staggerContainer, fadeUp } from '@/lib/variants'

export default function DashboardPage() {
  const { isLoading } = useAppStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full"
          style={{
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--accent-green)',
          }}
        />
      </div>
    )
  }

  return (
    <>
      <ParticleBackground />
      <UnlockOverlay />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
          {/* Bento Grid: Today Progress Hero (Left) + 2x2 Stats Grid (Right) */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Today Hero Card */}
            <div className="lg:col-span-7 flex flex-col">
              <TodayCard />
            </div>

            {/* Quick Stats Grid */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <StatsGrid />
            </div>
          </motion.div>

          {/* Quick Add Habit Bar */}
          <motion.div variants={fadeUp}>
            <QuickAddHabit />
          </motion.div>

          {/* Habit Weekly List Section */}
          <motion.div variants={fadeUp}>
            <HabitList />
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
