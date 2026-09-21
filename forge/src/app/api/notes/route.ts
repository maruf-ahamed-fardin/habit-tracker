import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const habitId = searchParams.get('habitId')
    const date = searchParams.get('date')

    const where: Record<string, unknown> = {}
    if (habitId) where.habitId = habitId
    if (date) where.date = date

    const notes = await prisma.note.findMany({ where })
    return NextResponse.json(notes)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { habitId, date, content } = await req.json()
    if (!habitId || !date || !content) {
      return NextResponse.json({ error: 'habitId, date, content required' }, { status: 400 })
    }
    const note = await prisma.note.upsert({
      where: { habitId_date: { habitId, date } },
      update: { content },
      create: { habitId, date, content },
    })
    return NextResponse.json(note, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
  }
}
