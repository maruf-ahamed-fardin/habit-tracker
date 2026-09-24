import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CATEGORIES = [
  { value: 'health', label: 'Health', color: '#3fd68f', icon: '💪' },
  { value: 'fitness', label: 'Fitness', color: '#f5a94e', icon: '🏃' },
  { value: 'learning', label: 'Learning', color: '#60a5fa', icon: '📚' },
  { value: 'work', label: 'Work', color: '#a78bfa', icon: '💼' },
  { value: 'mindfulness', label: 'Mindfulness', color: '#f472b6', icon: '🧘' },
  { value: 'personal', label: 'Personal', color: '#9aa1ad', icon: '⭐' },
  { value: 'social', label: 'Social', color: '#fb923c', icon: '👥' },
  { value: 'creative', label: 'Creative', color: '#e879f9', icon: '🎨' },
]

export const MOTIVATIONAL_QUOTES = [
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Small habits make a big difference. Consistency beats intensity.", author: "James Clear" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "In essence, if we want to direct our lives, we must take control of our consistent actions.", author: "Tony Robbins" },
  { text: "Habit is a cable; we weave a thread of it each day, and at last we cannot break it.", author: "Horace Mann" },
]

export function getMotivationalQuote(seed?: number): { text: string; author: string } {
  const idx = seed !== undefined ? seed % MOTIVATIONAL_QUOTES.length : Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
  return MOTIVATIONAL_QUOTES[idx]
}

export const PRESET_EMOJIS = [
  '💪', '🏃', '🚴', '🧘', '📚', '✍️', '💧', '🥗', '😴', '🧠',
  '💊', '🎯', '🎸', '🎨', '🌿', '☕', '🧹', '💰', '📱', '🔕',
  '🐕', '🌅', '❄️', '🔥', '⭐', '🎭', '🏊', '🧃', '📝', '🎮',
]

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}
