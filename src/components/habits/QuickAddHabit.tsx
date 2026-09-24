'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { PRESET_EMOJIS, CATEGORIES, cn } from '@/lib/utils'
import { sound } from '@/lib/sound'
import { triggerCheckConfetti } from '@/lib/confetti'
import { HabitForm } from './HabitForm'

export function QuickAddHabit() {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⚡')
  const [weeklyGoal, setWeeklyGoal] = useState(7)
  const [category, setCategory] = useState('personal')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showFullModal, setShowFullModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasInputError, setHasInputError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { addHabit, habits, addXP } = useAppStore()

  const currentCat = CATEGORIES.find(c => c.value === category) || CATEGORIES[0]

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      sound.playClick()
      setHasInputError(true)
      setTimeout(() => setHasInputError(false), 1200)
      toast.error('Please enter a habit name first!', { id: 'quick-add-empty' })
      inputRef.current?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          emoji,
          weeklyGoal,
          category,
          color: currentCat.color,
        }),
      })

      if (!res.ok) throw new Error('Failed to create habit')
      const newHabit = await res.json()
      addHabit(newHabit)
      addXP(10)

      sound.playCheck()
      triggerCheckConfetti()

      // First habit achievement check
      if (habits.length === 0) {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'first_habit' }),
        }).catch(() => {})
      }

      toast.success(`"${trimmed}" added! (+10 XP)`, { icon: emoji })
      setName('')
      inputRef.current?.focus()
    } catch {
      toast.error('Failed to add habit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-2.5 p-2 sm:p-3 rounded-2xl transition-all shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent-green)]/30"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Emoji Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setShowEmojiPicker(!showEmojiPicker)
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
            title="Select icon"
          >
            {emoji}
          </button>

          {/* Emoji Popover */}
          <AnimatePresence>
            {showEmojiPicker && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowEmojiPicker(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute left-0 top-12 z-40 p-3 rounded-2xl shadow-xl w-60 grid grid-cols-5 gap-1.5"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  {PRESET_EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        sound.playClick()
                        setEmoji(e)
                        setShowEmojiPicker(false)
                        inputRef.current?.focus()
                      }}
                      className="w-9 h-9 text-lg flex items-center justify-center rounded-xl hover:bg-[var(--bg-elevated)] transition-colors active:scale-90"
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Habit Name Input */}
        <div className="flex-1 min-w-[190px]">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value)
              if (hasInputError) setHasInputError(false)
            }}
            placeholder="Quick Add: Type habit name & press Enter… [N]"
            className={cn(
              "w-full h-10 px-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)]",
              hasInputError && "ring-2 ring-[var(--accent-rose)] animate-shake"
            )}
            style={{
              background: 'var(--bg-elevated)',
              border: hasInputError ? '1px solid var(--accent-rose)' : '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Category Pill Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setShowCategoryPicker(!showCategoryPicker)
            }}
            className="h-10 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: `${currentCat.color}18`,
              color: currentCat.color,
              border: `1px solid ${currentCat.color}40`,
            }}
          >
            <span>{currentCat.icon}</span>
            <span className="hidden sm:inline capitalize">{currentCat.label}</span>
            <ChevronDown size={12} />
          </button>

          <AnimatePresence>
            {showCategoryPicker && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowCategoryPicker(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute right-0 top-12 z-40 p-2 rounded-2xl shadow-xl w-44 space-y-1"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        sound.playClick()
                        setCategory(cat.value)
                        setShowCategoryPicker(false)
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-colors text-left"
                      style={{
                        color: category === cat.value ? cat.color : 'var(--text-primary)',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Weekly Goal Selector (1-7) */}
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] px-2 py-1 rounded-xl border border-[var(--border)]">
          <span className="text-[11px] font-mono text-[var(--text-muted)] px-1 hidden md:inline">
            Goal:
          </span>
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => {
                sound.playClick()
                setWeeklyGoal(n)
              }}
              className="w-6 h-7 rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: weeklyGoal === n ? 'var(--accent-green)' : 'transparent',
                color: weeklyGoal === n ? '#ffffff' : 'var(--text-secondary)',
              }}
              title={`${n} days per week`}
            >
              {n}
            </button>
          ))}
          <span className="text-[11px] text-[var(--text-muted)] pl-0.5 pr-1 hidden lg:inline">
            /wk
          </span>
        </div>

        {/* Add Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            boxShadow: name.trim() ? '0 0 18px rgba(16, 185, 129, 0.45)' : 'none',
            opacity: name.trim() ? 1 : 0.88,
          }}
          title={name.trim() ? 'Click to add habit (or press Enter)' : 'Type a habit name first, then click Add'}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add</span>
          <span className="hidden sm:inline opacity-80 font-mono text-[10px]">⏎</span>
        </motion.button>

        {/* More Options Modal Toggle */}
        <button
          type="button"
          onClick={() => {
            sound.playClick()
            setShowFullModal(true)
          }}
          className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
          title="More options & custom settings"
        >
          <SlidersHorizontal size={15} />
        </button>
      </form>

      {/* Full Habit Creation Modal */}
      <HabitForm
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        showTrigger={false}
      />
    </div>
  )
}
