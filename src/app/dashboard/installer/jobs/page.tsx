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

  const userRole = (dbUser?.role || '').toUpperCase().trim()
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER', 'BILLING_MANAGER', 'OM_MANAGER', 'INSTALLATION', 'INSTALLER', 'IP_NOC_EXECUTIVE']

  if (!dbUser || !userRole || !allowedRoles.includes(userRole)) {
    redirect('/dashboard/customers')
  }

  const isTechnician = userRole === 'INSTALLATION' || userRole === 'INSTALLER'

  // Fetch jobs assigned to this installer (or all active jobs for O&M / Super Admin)
  const nameParts = (dbUser?.fullName || '').split(' ').filter(p => p.length > 2)
  const whereClause = isTechnician
    ? {
        OR: [
          { assignedInstallerId: dbUser.id },
          ...(dbUser?.fullName ? [{ solarSystem: { is: { installerName: { contains: dbUser.fullName, mode: 'insensitive' as const } } } }] : []),
          ...nameParts.map(part => ({
            solarSystem: { is: { installerName: { contains: part, mode: 'insensitive' as const } } }
          }))
        ]
      }
    : {}

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
        currentUserName={dbUser.fullName || 'Installer'}
        userRole={userRole} 
      />
    </div>
  )
}
