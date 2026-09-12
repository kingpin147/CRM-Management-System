import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsView } from './ReportsView'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: user.id },
        ...(user.email ? [{ email: { equals: user.email, mode: 'insensitive' as const } }] : [])
      ]
    },
    select: { role: true, fullName: true, designation: true }
  })

  const isOMOrFieldTeam = (dbUser?.role === 'OM_MANAGER' || dbUser?.role === 'INSTALLATION' || dbUser?.role === 'IP_NOC_EXECUTIVE') ||
                  (dbUser?.fullName || '').toLowerCase().includes('hayat') || 
                  (dbUser?.fullName || '').toLowerCase().includes('ahsan ali') ||
                  (dbUser?.designation || '').toLowerCase().includes('o & m') ||
                  (dbUser?.designation || '').toLowerCase().includes('o&m')

  if (isOMOrFieldTeam || !dbUser?.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER', 'BILLING_MANAGER', 'SALES'].includes(dbUser.role)) {
    redirect('/dashboard/customers')
  }
  const userRole = dbUser.role

  // Fetch all customers with relations for multi-category reports
  const rawCustomers = await prisma.customer.findMany({
    include: {
      solarSystem: true,
      packagePlan: true,
      invoices: true,
      transactions: true,
      ledgerEntries: true,
      accountExecutive: true,
      assignedInstaller: true,
    },
    orderBy: {
      signupDate: 'desc',
    },
  })

  // Sanitize Decimal and Date instances to plain JSON primitives
  const customers = JSON.parse(JSON.stringify(rawCustomers))

  const rawUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true, role: true }
  })
  const users = JSON.parse(JSON.stringify(rawUsers))

  const { view } = await searchParams
  const initialView = (typeof view === 'string' ? view : 'status')

  return (
    <div className="space-y-6 animate-reveal">
      <ReportsView customers={customers} users={users} initialView={initialView} userRole={userRole} />
    </div>
  )
}

