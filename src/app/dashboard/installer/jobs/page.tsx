import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InstallerJobsView } from './InstallerJobsView'

export default async function InstallerJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, fullName: true, role: true }
  })

  if (!dbUser?.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OM_MANAGER', 'INSTALLATION', 'IP_NOC_EXECUTIVE'].includes(dbUser.role)) {
    redirect('/dashboard/customers')
  }

  const isTechnician = dbUser.role === 'INSTALLATION'

  // Fetch jobs assigned to this installer (or all jobs for O&M / Super Admin)
  const whereClause = isTechnician
    ? {
        AND: [
          { status: { in: ['PENDING_ACTIVATION', 'PENDING_PAYMENT_VERIFICATION', 'CONNECTION_ACTIVE'] } },
          {
            OR: [
              { assignedInstallerId: dbUser.id },
              { solarSystem: { is: { installerName: { contains: dbUser.fullName, mode: 'insensitive' } } } }
            ]
          }
        ]
      }
    : {
        status: { in: ['PENDING_ACTIVATION', 'PENDING_PAYMENT_VERIFICATION', 'CONNECTION_ACTIVE'] }
      }

  const rawCustomers = await prisma.customer.findMany({
    where: whereClause as any,
    include: {
      packagePlan: true,
      solarSystem: true,
      accountExecutive: true,
      assignedInstaller: true,
    },
    orderBy: { signupDate: 'desc' }
  })

  const customers = JSON.parse(JSON.stringify(rawCustomers))

  return (
    <div className="space-y-6 animate-reveal">
      <InstallerJobsView 
        customers={customers} 
        currentUserId={dbUser.id}
        currentUserName={dbUser.fullName}
        userRole={dbUser.role} 
      />
    </div>
  )
}
