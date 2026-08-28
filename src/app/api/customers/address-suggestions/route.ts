import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  if (!q || q.length < 3) {
    return NextResponse.json([])
  }

  const customers = await prisma.customer.findMany({
    where: {
      address: {
        contains: q,
        mode: 'insensitive'
      }
    },
    select: {
      address: true
    },
    distinct: ['address'],
    take: 10
  })

  return NextResponse.json(customers.map(c => c.address))
}
