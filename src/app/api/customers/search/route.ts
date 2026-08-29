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
  const customerCode  = searchParams.get('customerCode')?.trim() || ''
  const crfNumber     = searchParams.get('crfNumber')?.trim()    || ''
  const fullName      = searchParams.get('fullName')?.trim()     || ''
  const contactNumber = searchParams.get('contactNumber')?.trim()|| ''
  const cnic          = searchParams.get('cnic')?.trim()         || ''
  const email         = searchParams.get('email')?.trim()        || ''
  const address       = searchParams.get('address')?.trim()      || ''

  // Require at least one filter to be provided
  const hasFilter = customerCode || crfNumber || fullName || contactNumber || cnic || email || address
  if (!hasFilter) {
    return NextResponse.json({ error: 'Please provide at least one search criterion.' }, { status: 400 })
  }

  const where: Record<string, unknown> = {}

  if (customerCode) {
    where.customerCode = { contains: customerCode, mode: 'insensitive' }
  }
  if (crfNumber) {
    where.crfNumber = { contains: crfNumber, mode: 'insensitive' }
  }
  if (fullName) {
    where.fullName = { contains: fullName, mode: 'insensitive' }
  }
  if (contactNumber) {
    where.OR = [
      { contactNumber: { contains: contactNumber } },
      { pocNumber: { contains: contactNumber } }
    ]
  }
  if (cnic) {
    where.cnic = { contains: cnic, mode: 'insensitive' }
  }
  if (email) {
    where.email = { contains: email, mode: 'insensitive' }
  }
  if (address) {
    where.address = { contains: address, mode: 'insensitive' }
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { signupDate: 'desc' },
    take: 200, // safety cap
  })

  return NextResponse.json(JSON.parse(JSON.stringify(customers)))
}
