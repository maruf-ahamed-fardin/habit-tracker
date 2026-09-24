'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { computeXP, indexChecks, levelInfo } from '@/lib/insights'

export function useCheckIndex() {
  const checks = useAppStore(s => s.checks)
  return useMemo(() => indexChecks(checks), [checks])
}

export function useLevel() {
  const habits = useAppStore(s => s.habits)
  const checks = useAppStore(s => s.checks)
  const achievements = useAppStore(s => s.achievements)
  const idx = useCheckIndex()
  return useMemo(() => {
    const xp = computeXP(habits, checks, achievements, idx)
    return { xp, ...levelInfo(xp) }
  }, [habits, checks, achievements, idx])
}
