import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsView } from './ReportsView'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true }
  })
  const userRole = dbUser?.role || 'SALES'

  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)) {
    redirect('/dashboard/customers')
  }

  // Fetch all customers with relations for multi-category reports
  const rawCustomers = await prisma.customer.findMany({
    include: {
      solarSystem: true,
      packagePlan: true,
      invoices: true,
      transactions: true,
      ledgerEntries: true,
    },
    orderBy: {
      signupDate: 'desc',
    },
  })

  // Sanitize Decimal and Date instances to plain JSON primitives
  const customers = JSON.parse(JSON.stringify(rawCustomers))

  return (
    <div className="space-y-6 animate-reveal">
      <ReportsView customers={customers} />
    </div>
  )
}
