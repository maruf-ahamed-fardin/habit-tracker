import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ACHIEVEMENTS } from '@/lib/achievements'

export async function GET() {
  try {
    // Ensure all achievement records exist
    for (const a of ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { key: a.key },
        update: {},
        create: { key: a.key },
      })
    }
    const achievements = await prisma.achievement.findMany()
    return NextResponse.json(achievements)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json()
    const achievement = await prisma.achievement.update({
      where: { key },
      data: { unlockedAt: new Date() },
    })
    return NextResponse.json(achievement)
  } catch {
    return NextResponse.json({ error: 'Failed to unlock achievement' }, { status: 500 })
  }
}
