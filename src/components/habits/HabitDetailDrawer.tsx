'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame, Calendar, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useAppStore, type Habit } from '@/store/useAppStore'
import { calculateStreak } from '@/lib/streak'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import toast from 'react-hot-toast'

interface HabitDetailDrawerProps {
  habit: Habit
  isOpen: boolean
  onClose: () => void
}

export function HabitDetailDrawer({ habit, isOpen, onClose }: HabitDetailDrawerProps) {
  const { checks, notes, addNote } = useAppStore()
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const habitChecks = checks.filter(c => c.habitId === habit.id).map(c => c.date)
  const { current, best } = calculateStreak(habitChecks)

  // Last 30 days chart data
  const days30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
  const chartData = days30.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    return {
      date: format(d, 'MMM d'),
      done: habitChecks.includes(dateStr) ? 1 : 0,
    }
  })

  // Today's note
  const todayNote = notes.find(n => n.habitId === habit.id && n.date === today)

  const saveNote = async () => {
    if (!noteText.trim()) return
    setSavingNote(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId: habit.id, date: today, content: noteText.trim() }),
      })
      const note = await res.json()
      addNote(note)
      setNoteText('')
      toast.success('Note saved!')
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
            style={{
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-6"
              style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{habit.emoji}</span>
                <div>
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                  >
                    {habit.name}
                  </h2>
                  <div
                    className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium capitalize"
                    style={{ background: `${habit.color}20`, color: habit.color }}
                  >
                    {habit.category}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Streak stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Current Streak', value: `${current}d`, icon: <Flame size={16} style={{ color: '#f5a94e' }} /> },
                  { label: 'Best Streak', value: `${best}d`, icon: <span>⚡</span> },
                  { label: 'Total Check-ins', value: habitChecks.length, icon: <Calendar size={16} style={{ color: '#60a5fa' }} /> },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="p-3 rounded-xl text-center"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex justify-center mb-1">{icon}</div>
                    <div className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* 30-day bar chart */}
              <div>
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}
                >
                  Last 30 Days
                </h3>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={6} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <Bar dataKey="done" radius={[2, 2, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={i} fill={d.done ? habit.color : 'var(--bg-elevated)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly goal info */}
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Weekly Goal
                  </span>
                  <span className="text-sm font-mono font-bold" style={{ color: habit.color, fontFamily: 'var(--font-mono)' }}>
                    {habit.weeklyGoal}x / week
                  </span>
                </div>
                {habit.reminderTime && (
                  <div className="text-xs flex items-center gap-1.5 mt-2" style={{ color: 'var(--text-muted)' }}>
                    <span>⏰</span>
                    <span>Reminder at {habit.reminderTime}</span>
                  </div>
                )}
              </div>

              {/* Daily note */}
              <div>
                <h3
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}
                >
                  <BookOpen size={14} />
                  Today&apos;s Note
                </h3>
                {todayNote ? (
                  <div
                    className="p-3 rounded-xl text-sm"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {todayNote.content}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value.slice(0, 280))}
                      placeholder="Write a note for today…"
                      rows={3}
                      className="w-full p-3 rounded-xl text-sm resize-none outline-none"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {noteText.length}/280
                      </span>
                      <button
                        onClick={saveNote}
                        disabled={!noteText.trim() || savingNote}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                        style={{ background: habit.color, color: '#0d1017' }}
                      >
                        {savingNote ? 'Saving…' : 'Save Note'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

