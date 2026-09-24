export { cn } from 'cn'

export const PRESET_EMOJIS = [
  '💧', '💪', '🏃', '🚶', '🧘', '📚', '✍️', '🥗', '😴', '🧠',
  '💊', '🎯', '🎸', '🎨', '🌿', '☕', '🧹', '💰', '📵', '🦷',
  '🐕', '🌅', '❄️', '🔥', '⭐', '🏊', '🚴', '🍎', '📝', '🙏',
]

// First keyword match wins, so put the more specific words first.
const EMOJI_HINTS: [RegExp, string][] = [
  [/water|drink|hydrat/i, '💧'],
  [/meditat|breath|mindful|yoga/i, '🧘'],
  [/read|book|page/i, '📚'],
  [/journal|write|diary/i, '✍️'],
  [/walk|steps/i, '🚶'],
  [/run|jog/i, '🏃'],
  [/gym|workout|lift|push|exercise|train/i, '💪'],
  [/swim/i, '🏊'],
  [/bike|cycl/i, '🚴'],
  [/sleep|bed/i, '😴'],
  [/salad|veg|eat|meal|diet|cook/i, '🥗'],
  [/fruit|apple/i, '🍎'],
  [/vitamin|pill|medic/i, '💊'],
  [/phone|screen|social/i, '📵'],
  [/floss|teeth|brush/i, '🦷'],
  [/guitar|piano|music|practi/i, '🎸'],
  [/draw|paint|art|sketch/i, '🎨'],
  [/clean|tidy/i, '🧹'],
  [/save|money|budget|spend/i, '💰'],
  [/pray|grat/i, '🙏'],
  [/learn|study|code|language/i, '🧠'],
  [/dog|pet/i, '🐕'],
  [/wake|morning|sunrise/i, '🌅'],
  [/cold|shower/i, '❄️'],
  [/plant|garden/i, '🌿'],
  [/coffee|tea/i, '☕'],
]

export function guessEmoji(name: string): string | null {
  for (const [re, emoji] of EMOJI_HINTS) if (re.test(name)) return emoji
  return null
}

export const HABIT_IDEAS = [
  { name: 'Drink 2L water', emoji: '💧', weeklyGoal: 7 },
  { name: 'Walk 20 minutes', emoji: '🚶', weeklyGoal: 7 },
  { name: 'Read 20 pages', emoji: '📚', weeklyGoal: 5 },
  { name: '10 min meditation', emoji: '🧘', weeklyGoal: 7 },
  { name: 'Workout', emoji: '💪', weeklyGoal: 3 },
  { name: 'No phone after 10pm', emoji: '📵', weeklyGoal: 7 },
]

export function frequencyLabel(weeklyGoal: number): string {
  if (weeklyGoal >= 7) return 'Every day'
  return `${weeklyGoal}× a week`
}
