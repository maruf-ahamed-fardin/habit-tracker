import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const habitId = searchParams.get('habitId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {}
    if (habitId) where.habitId = habitId
    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      }
    }

    const checks = await prisma.check.findMany({ where, orderBy: { date: 'asc' } })
    return NextResponse.json(checks)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { habitId, date } = body

    if (!habitId || !date) {
      return NextResponse.json({ error: 'habitId and date required' }, { status: 400 })
    }

    const check = await prisma.check.upsert({
      where: { habitId_date: { habitId, date } },
      update: {},
      create: { habitId, date },
    })

    return NextResponse.json(check, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create check' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const habitId = searchParams.get('habitId')
    const date = searchParams.get('date')

    if (!habitId || !date) {
      return NextResponse.json({ error: 'habitId and date required' }, { status: 400 })
    }

    await prisma.check.deleteMany({ where: { habitId, date } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete check' }, { status: 500 })
  }
}
