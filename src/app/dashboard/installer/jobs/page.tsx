import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InstallerJobsView } from './InstallerJobsView'

export default async function InstallerJobsPage() {
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
    select: { id: true, fullName: true, role: true, designation: true }
  })

  const userRole = (dbUser?.role || '').toUpperCase().trim()
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER', 'SALES', 'BILLING_MANAGER', 'OM_MANAGER', 'INSTALLATION', 'INSTALLER', 'IP_NOC_EXECUTIVE']

  if (!dbUser || !userRole || !allowedRoles.includes(userRole)) {
    redirect('/dashboard/customers')
  }

  const isSuperAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(userRole)
  const isTechnician = userRole === 'INSTALLATION' || userRole === 'INSTALLER'
  const isIPNOC = userRole === 'IP_NOC_EXECUTIVE'
  const isOMManager = userRole === 'OM_MANAGER' || 
                      userRole.includes('OM') ||
                      (dbUser?.designation || '').toLowerCase().includes('o & m') || 
                      (dbUser?.designation || '').toLowerCase().includes('o&m') ||
                      (dbUser?.designation || '').toLowerCase().includes('operations & maintenance') ||
                      (dbUser?.designation || '').toLowerCase().includes('om manager')
  const isSales = userRole === 'SALES' || (dbUser?.designation || '').toLowerCase().includes('sales') || (dbUser?.designation || '').toLowerCase().includes('account executive')

  // Fetch jobs assigned specifically to this installer or sales specialist, or all jobs for O&M/Admin
  const nameParts = (dbUser?.fullName || '').split(' ').filter(p => p.length > 2)
  const whereClause = isTechnician
    ? {
        OR: [
          { status: 'PENDING_INSTALLER_AUDIT', assignedInstallerId: dbUser.id },
          { systemAudits: { some: { assignedInstallerId: dbUser.id, status: 'PENDING' } } },
          ...(dbUser?.fullName ? [{ solarSystem: { is: { installerName: { contains: dbUser.fullName, mode: 'insensitive' as const } } } }] : []),
          ...nameParts.map(part => ({
            solarSystem: { is: { installerName: { contains: part, mode: 'insensitive' as const } } }
          }))
        ]
      }
    : isIPNOC
    ? {
        status: { in: ['PENDING_IP_NOC', 'CONNECTION_ACTIVE'] }
      }
    : (isOMManager || isSuperAdmin)
    ? {} // O&M Manager and Admins have full access to view all audit queues and installations across the system
    : isSales
    ? {
        OR: [
          { accountExecutiveId: dbUser.id },
          { assignedInstallerId: dbUser.id },
          ...(dbUser?.fullName ? [
            { accountExecutive: { is: { fullName: { contains: dbUser.fullName, mode: 'insensitive' as const } } } },
            { solarSystem: { is: { installerName: { contains: dbUser.fullName, mode: 'insensitive' as const } } } }
          ] : []),
          ...nameParts.flatMap(part => [
            { accountExecutive: { is: { fullName: { contains: part, mode: 'insensitive' as const } } } },
            { solarSystem: { is: { installerName: { contains: part, mode: 'insensitive' as const } } } }
          ]),
          { status: { in: ['SIGNUP_GENERATED', 'PENDING_PAYMENT_VERIFICATION', 'PENDING_INSTALLER_AUDIT', 'PENDING_ACTIVATION', 'PENDING_IP_NOC', 'CONNECTION_ACTIVE'] } }
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
      systemAudits: {
        include: {
          details: true,
          assignedInstaller: true,
          ticket: true
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { signupDate: 'desc' }
  })

  const rawInstallers = await prisma.user.findMany({
    where: {
      role: { in: ['INSTALLATION', 'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OM_MANAGER'] },
      isActive: true
    },
    select: { id: true, fullName: true, role: true, designation: true },
    orderBy: { fullName: 'asc' }
  })

  const customers = JSON.parse(JSON.stringify(rawCustomers))
  const installers = JSON.parse(JSON.stringify(rawInstallers))

  return (
    <div className="space-y-6 animate-reveal">
      <InstallerJobsView 
        customers={customers} 
        installers={installers}
        currentUserId={dbUser.id}
        currentUserName={dbUser.fullName || 'Installer'}
        userRole={userRole} 
      />
    </div>
  )
}
