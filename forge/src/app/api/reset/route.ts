import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    await prisma.check.deleteMany()
    await prisma.note.deleteMany()
    await prisma.habit.deleteMany()
    await prisma.achievement.deleteMany()
    await prisma.settings.deleteMany()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 })
  }
}
