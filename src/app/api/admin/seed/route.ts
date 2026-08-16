import { NextRequest, NextResponse } from 'next/server'
import { runSeed } from '@/lib/seed-db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  const expectedSecret = process.env.ADMIN_SEED_SECRET || 'seed-crm-2026'

  if (secret !== expectedSecret) {
    return NextResponse.json(
      {
        error: 'Unauthorized. Please provide valid ?secret= query parameter.',
        hint: 'Use ?secret=' + expectedSecret,
      },
      { status: 401 }
    )
  }

  try {
    const summary = await runSeed()

    return NextResponse.json({
      success: true,
      message: '✅ Database successfully seeded on production!',
      summary,
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed database.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
