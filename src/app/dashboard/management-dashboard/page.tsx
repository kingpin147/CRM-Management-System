import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ManagementDashboardView } from './ManagementDashboardView'

export const dynamic = 'force-dynamic'

export default async function ManagementDashboardPage() {
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
    select: { id: true, role: true, fullName: true, designation: true, email: true }
  })

  const normalizedRole = (dbUser?.role || '').toUpperCase().trim()
  const isSuperAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(normalizedRole)
  const isSalesManager = ['SALES_MANAGER', 'BILLING_MANAGER', 'MANAGER'].includes(normalizedRole)
  const isCEO = normalizedRole === 'SUPER_ADMIN' ||
                normalizedRole === 'ADMIN' ||
                normalizedRole.includes('CEO') ||
                (dbUser?.designation || '').toLowerCase().includes('ceo') ||
                (dbUser?.designation || '').toLowerCase().includes('chief executive')
  const isAjmal = (dbUser?.fullName || '').toLowerCase().includes('ajmal') ||
                  (dbUser?.designation || '').toLowerCase().includes('ajmal')

  // CEO and Sales Manager (Ajmal / Sales Managers) have authorized access
  const hasAccess = isCEO || isSuperAdmin || isSalesManager || isAjmal

  if (!hasAccess) {
    redirect('/dashboard/customers')
  }

  // Fetch all relevant data for the dashboard
  const [customers, tickets, invoices, transactions, ledgerEntries] = await Promise.all([
    prisma.customer.findMany({
      include: {
        packagePlan: true,
        solarSystem: true,
        invoices: true,
        ledgerEntries: true,
      },
      orderBy: { signupDate: 'desc' },
    }),
    prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ledgerEntry.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <div className="py-2 animate-reveal">
      <ManagementDashboardView
        initialCustomers={JSON.parse(JSON.stringify(customers))}
        initialTickets={JSON.parse(JSON.stringify(tickets))}
        initialInvoices={JSON.parse(JSON.stringify(invoices))}
        initialTransactions={JSON.parse(JSON.stringify(transactions))}
        initialLedgerEntries={JSON.parse(JSON.stringify(ledgerEntries))}
      />
    </div>
  )
}
