import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton', theme: 'dark', xp: 0 },
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: body,
      create: { id: 'singleton', ...body },
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
