import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BillingCpmView } from './BillingCpmView'

export const dynamic = 'force-dynamic'

export default async function BillingCpmPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch unposted debit/credit notes
  const rawNotes = await prisma.transaction.findMany({
    where: {
      status: { in: ['UNPOSTED_DEBIT', 'UNPOSTED_CREDIT'] }
    },
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          fullName: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format notes
  const unpostedNotes = rawNotes.map(tx => {
    const [type, exec, desc] = (tx.paymentMethod || '').split('|')
    return {
      id: tx.id,
      customerId: tx.customerId,
      customerCode: tx.customer.customerCode,
      customerName: tx.customer.fullName,
      amount: Number(tx.amount),
      type: (tx.status === 'UNPOSTED_DEBIT' ? 'DEBIT' : 'CREDIT') as 'DEBIT' | 'CREDIT',
      accountExecutive: exec || 'Operations',
      description: desc || 'Adjustment Note',
      createdAt: tx.createdAt,
    }
  })

  // Fetch unposted payments
  const rawPayments = await prisma.transaction.findMany({
    where: {
      status: 'UNPOSTED_PAYMENT'
    },
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          fullName: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const unpostedPayments = rawPayments.map(tx => {
    const [, mode, exec, desc] = (tx.paymentMethod || '').split('|')
    return {
      id: tx.id,
      customerId: tx.customerId,
      customerCode: tx.customer.customerCode,
      customerName: tx.customer.fullName,
      amount: Number(tx.amount),
      mode: mode || 'Bank Transfer',
      accountExecutive: exec || 'Sales / Billing',
      description: desc || 'Customer Payment',
      createdAt: tx.createdAt,
    }
  })

  // Fetch active system users
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true },
    orderBy: { fullName: 'asc' }
  })

  return (
    <BillingCpmView
      unpostedNotes={unpostedNotes}
      unpostedPayments={unpostedPayments}
      users={users}
    />
  )
}
