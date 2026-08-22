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

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true }
  })
  if (!dbUser?.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(dbUser.role)) {
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

  const { view } = await searchParams
  const initialView = (typeof view === 'string' ? view : 'status')

  return (
    <div className="space-y-6 animate-reveal">
      <ReportsView customers={customers} initialView={initialView} />
    </div>
  )
}

