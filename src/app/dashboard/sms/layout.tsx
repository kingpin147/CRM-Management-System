import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export default async function SMSDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user role and designation from Prisma DB
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: user.id },
        ...(user.email ? [{ email: { equals: user.email, mode: 'insensitive' as const } }] : [])
      ]
    },
    select: { role: true, designation: true, isActive: true }
  })

  const role = (dbUser?.role || '').toUpperCase().trim()
  const designation = (dbUser?.designation || '').toLowerCase().trim()
  const isCEO = designation.includes('ceo') || designation.includes('chief executive')

  // Strictly allowed roles: SUPER_ADMIN, ADMIN, SALES_MANAGER, BILLING_MANAGER, MANAGER, or CEO
  const isAuthorized = Boolean(
    dbUser?.isActive && (
      ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'BILLING_MANAGER', 'MANAGER'].includes(role) ||
      isCEO
    )
  )

  // Explicitly deny Field Installers, IP NOC, and basic Sales Reps
  if (!isAuthorized) {
    redirect('/dashboard/customers')
  }

  return <div className="w-full">{children}</div>
}
