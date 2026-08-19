import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ManagerApprovalView } from './ManagerApprovalView'

export default async function PendingSalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dbUser = user ? await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } }) : null
  const userRole = dbUser?.role || 'SUPER_ADMIN'

  // Fetch all customer sales in pending pipeline stages
  const rawPendingCustomers = await prisma.customer.findMany({
    where: {
      status: {
        in: [
          'SIGNUP_GENERATED',
          'PENDING_PAYMENT_VERIFICATION',
          'PENDING_ACTIVATION',
        ]
      }
    },
    include: {
      packagePlan: true,
      solarSystem: true,
    },
    orderBy: { signupDate: 'desc' }
  })

  // Sanitize Prisma types to plain JSON objects
  const pendingCustomers = JSON.parse(JSON.stringify(rawPendingCustomers))

  // Action for advancing workflow status across stages
  async function advanceWorkflow(formData: FormData) {
    'use server'
    const customerId = formData.get('customerId') as string
    const currentStatus = formData.get('currentStatus') as string

    let nextStatus = currentStatus
    if (currentStatus === 'SIGNUP_GENERATED') {
      nextStatus = 'PENDING_PAYMENT_VERIFICATION' // Approved by Sales Manager -> Sent to Billing Manager
    } else if (currentStatus === 'PENDING_PAYMENT_VERIFICATION') {
      nextStatus = 'PENDING_ACTIVATION' // Payment verified by Billing Manager -> Sent to O&M Manager
    } else if (currentStatus === 'PENDING_ACTIVATION') {
      nextStatus = 'CONNECTION_ACTIVE' // Approved by O&M Manager -> Active Connection
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: { 
        status: nextStatus as any,
        ...(nextStatus === 'CONNECTION_ACTIVE' ? { activationDate: new Date() } : {})
      }
    })

    revalidatePath('/dashboard/sales/pending')
    revalidatePath('/dashboard/customers')
  }

  return (
    <ManagerApprovalView 
      customers={pendingCustomers}
      userRole={userRole}
      onAdvanceWorkflow={advanceWorkflow}
    />
  )
}
