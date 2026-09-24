import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(habits)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, emoji, color, category, weeklyGoal, reminderTime } = body

    if (!name || !emoji) {
      return NextResponse.json({ error: 'Name and emoji are required' }, { status: 400 })
    }

    const count = await prisma.habit.count()
    const habit = await prisma.habit.create({
      data: {
        name,
        emoji,
        color: color || '#3fd68f',
        category: category || 'personal',
        weeklyGoal: weeklyGoal || 7,
        order: count,
        reminderTime: reminderTime || null,
      },
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}
