export interface AchievementDef {
  key: string
  title: string
  description: string
  icon: string
  xpReward: number
  color: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Streak milestones
  {
    key: 'streak_3',
    title: 'Kindling',
    description: 'Reach a 3-day streak on any habit',
    icon: '🔥',
    xpReward: 50,
    color: '#f5a94e',
    tier: 'bronze',
  },
  {
    key: 'streak_7',
    title: 'Week Warrior',
    description: 'Reach a 7-day streak on any habit',
    icon: '⚡',
    xpReward: 100,
    color: '#f5a94e',
    tier: 'silver',
  },
  {
    key: 'streak_14',
    title: 'Two-Week Titan',
    description: '14-day streak on any habit',
    icon: '🗡️',
    xpReward: 200,
    color: '#10b981',
    tier: 'silver',
  },
  {
    key: 'streak_30',
    title: 'Monthly Master',
    description: '30-day streak on any habit',
    icon: '🏆',
    xpReward: 500,
    color: '#ffd700',
    tier: 'gold',
  },
  {
    key: 'streak_100',
    title: 'Centurion',
    description: '100-day streak — absolute legend',
    icon: '💎',
    xpReward: 2000,
    color: '#b490f5',
    tier: 'platinum',
  },
  // Completion milestones
  {
    key: 'first_checkin',
    title: 'First Spark',
    description: 'Complete your first habit check-in',
    icon: '✨',
    xpReward: 25,
    color: '#10b981',
    tier: 'bronze',
  },
  {
    key: 'checkins_50',
    title: 'Half-Century',
    description: '50 total check-ins across all habits',
    icon: '📈',
    xpReward: 150,
    color: '#10b981',
    tier: 'silver',
  },
  {
    key: 'checkins_100',
    title: 'Centurion Checks',
    description: '100 total check-ins',
    icon: '🎯',
    xpReward: 300,
    color: '#10b981',
    tier: 'gold',
  },
  {
    key: 'checkins_500',
    title: 'Iron Will',
    description: '500 total check-ins',
    icon: '🦾',
    xpReward: 1000,
    color: '#b490f5',
    tier: 'platinum',
  },
  // Perfect day / week
  {
    key: 'perfect_day',
    title: 'Perfect Day',
    description: 'Complete all habits in a single day',
    icon: '🌟',
    xpReward: 75,
    color: '#ffd700',
    tier: 'bronze',
  },
  {
    key: 'perfect_week',
    title: 'Flawless Week',
    description: 'Hit your weekly goal for every habit in one week',
    icon: '🏅',
    xpReward: 250,
    color: '#ffd700',
    tier: 'gold',
  },
  // Habit building
  {
    key: 'first_habit',
    title: 'Builder Begins',
    description: 'Add your first habit',
    icon: '🧱',
    xpReward: 10,
    color: '#9aa1ad',
    tier: 'bronze',
  },
  {
    key: 'habits_5',
    title: 'Multi-Tasker',
    description: 'Track 5 habits simultaneously',
    icon: '🎪',
    xpReward: 100,
    color: '#9aa1ad',
    tier: 'silver',
  },
  // Notes
  {
    key: 'first_note',
    title: 'Journaling Begins',
    description: 'Write your first daily note',
    icon: '📝',
    xpReward: 30,
    color: '#60a5fa',
    tier: 'bronze',
  },
  // Streak shield
  {
    key: 'shield_used',
    title: 'Streak Savior',
    description: 'Use a streak shield to protect your progress',
    icon: '🛡️',
    xpReward: 50,
    color: '#60a5fa',
    tier: 'bronze',
  },
  // Early adopter
  {
    key: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a check-in after midnight',
    icon: '🦉',
    xpReward: 40,
    color: '#9aa1ad',
    tier: 'bronze',
  },
  {
    key: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a check-in before 7am',
    icon: '🐦',
    xpReward: 40,
    color: '#ffd700',
    tier: 'bronze',
  },
  // XP milestones
  {
    key: 'xp_500',
    title: 'Rising Force',
    description: 'Earn 500 XP total',
    icon: '⭐',
    xpReward: 0,
    color: '#f5a94e',
    tier: 'silver',
  },
  {
    key: 'xp_2000',
    title: 'Power Surge',
    description: 'Earn 2,000 XP total',
    icon: '🚀',
    xpReward: 0,
    color: '#b490f5',
    tier: 'gold',
  },
  {
    key: 'xp_10000',
    title: 'Habit Master',
    description: 'Earn 10,000 XP — you are unstoppable',
    icon: '👑',
    xpReward: 0,
    color: '#ffd700',
    tier: 'platinum',
  },
]

export function getAchievementByKey(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.key === key)
}

export function checkAchievements(params: {
  totalCheckins: number
  bestStreak: number
  currentStreaks: number[]
  habitCount: number
  hasNote: boolean
  hasUsedShield: boolean
  hour: number
  totalXP: number
}): string[] {
  const toUnlock: string[] = []
  const { totalCheckins, bestStreak, currentStreaks, habitCount, hasNote, hasUsedShield, hour, totalXP } = params

  if (totalCheckins >= 1) toUnlock.push('first_checkin')
  if (totalCheckins >= 50) toUnlock.push('checkins_50')
  if (totalCheckins >= 100) toUnlock.push('checkins_100')
  if (totalCheckins >= 500) toUnlock.push('checkins_500')

  if (bestStreak >= 3) toUnlock.push('streak_3')
  if (bestStreak >= 7) toUnlock.push('streak_7')
  if (bestStreak >= 14) toUnlock.push('streak_14')
  if (bestStreak >= 30) toUnlock.push('streak_30')
  if (bestStreak >= 100) toUnlock.push('streak_100')

  if (habitCount >= 1) toUnlock.push('first_habit')
  if (habitCount >= 5) toUnlock.push('habits_5')

  if (hasNote) toUnlock.push('first_note')
  if (hasUsedShield) toUnlock.push('shield_used')

  if (hour >= 0 && hour < 4) toUnlock.push('night_owl')
  if (hour >= 5 && hour < 7) toUnlock.push('early_bird')

  if (totalXP >= 500) toUnlock.push('xp_500')
  if (totalXP >= 2000) toUnlock.push('xp_2000')
  if (totalXP >= 10000) toUnlock.push('xp_10000')

  return toUnlock
}

export function getXPForLevel(xp: number): { level: number; progress: number; nextLevelXP: number } {
  const levels = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000]
  let level = 1
  for (let i = 1; i < levels.length; i++) {
    if (xp >= levels[i]) level = i + 1
    else break
  }
  const currentLevelXP = levels[Math.min(level - 1, levels.length - 1)]
  const nextLevelXP = levels[Math.min(level, levels.length - 1)]
  const progress = nextLevelXP === currentLevelXP ? 1 : (xp - currentLevelXP) / (nextLevelXP - currentLevelXP)
  return { level, progress: Math.min(progress, 1), nextLevelXP }
}
