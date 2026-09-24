'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { CATEGORIES, PRESET_EMOJIS } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  emoji: z.string().min(1, 'Emoji is required'),
  weeklyGoal: z.number().int().min(1).max(7),
  category: z.string(),
  color: z.string(),
  reminderTime: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function HabitForm({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showTrigger = true,
}: {
  isOpen?: boolean
  onClose?: () => void
  showTrigger?: boolean
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = typeof externalIsOpen === 'boolean'
  const isOpen = isControlled ? externalIsOpen : internalIsOpen
  const setIsOpen = (val: boolean) => {
    if (isControlled) {
      if (!val && externalOnClose) externalOnClose()
    } else {
      setInternalIsOpen(val)
    }
  }

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { addHabit, habits, addXP } = useAppStore()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      emoji: '💪',
      weeklyGoal: 7,
      category: 'personal',
      color: '#10b981',
    },
  })

  const emoji = watch('emoji')
  const color = watch('color')

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
      const habit = await res.json()
      addHabit(habit)
      addXP(10)

      // Check first habit achievement
      if (habits.length === 0) {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'first_habit' }),
        }).catch(() => {})
      }

      toast.success(`"${data.name}" added to your habits! (+10 XP)`)
      reset()
      setIsOpen(false)
    } catch {
      toast.error('Failed to add habit')
    }
  }

  return (
    <div>
      {/* Optional Trigger Button */}
      {showTrigger && (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(16,185,129,0.3)',
          }}
        >
          <Plus size={18} />
          Add New Habit
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-6"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  New Habit
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                {/* Emoji + Name row */}
                <div className="flex gap-3">
                  {/* Emoji button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-14 h-14 rounded-xl text-3xl flex items-center justify-center transition-all"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '2px solid var(--border)',
                      }}
                    >
                      {emoji}
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute top-16 left-0 z-10 p-3 rounded-xl grid grid-cols-5 gap-2 w-52"
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-elevated)',
                          }}
                        >
                          {PRESET_EMOJIS.map(e => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => {
                                setValue('emoji', e)
                                setShowEmojiPicker(false)
                              }}
                              className="w-8 h-8 text-xl flex items-center justify-center rounded-lg hover:bg-[var(--bg-card)] transition-colors"
                            >
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Name input */}
                  <div className="flex-1">
                    <input
                      {...register('name')}
                      placeholder="Habit name…"
                      className="w-full h-14 px-4 rounded-xl text-base outline-none transition-all"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${errors.name ? '#ef6e6e' : 'var(--border)'}`,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(onSubmit)() } }}
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: '#ef6e6e' }}>{errors.name.message}</p>}
                  </div>
                </div>

                {/* Weekly Goal */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Weekly Goal
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(n => {
                      const goal = watch('weeklyGoal')
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setValue('weeklyGoal', n)}
                          className="flex-1 h-9 rounded-lg text-sm font-mono font-semibold transition-all"
                          style={{
                            background: goal === n ? 'var(--accent-green)' : 'var(--bg-elevated)',
                            color: goal === n ? '#ffffff' : 'var(--text-secondary)',
                            border: `1px solid ${goal === n ? 'var(--accent-green)' : 'var(--border)'}`,
                          }}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => {
                      const selected = watch('category') === cat.value
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => { setValue('category', cat.value); setValue('color', cat.color) }}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all"
                          style={{
                            background: selected ? `${cat.color}20` : 'var(--bg-elevated)',
                            border: `1px solid ${selected ? cat.color : 'var(--border)'}`,
                            color: selected ? cat.color : 'var(--text-secondary)',
                          }}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Reminder time */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Reminder (optional)
                  </label>
                  <input
                    {...register('reminderTime')}
                    type="time"
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none font-mono"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-12 rounded-xl font-semibold text-sm disabled:opacity-50 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                  }}
                >
                  {isSubmitting ? 'Adding…' : '+ Add Habit'}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

