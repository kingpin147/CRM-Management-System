import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

const KEEP_SUPER_ADMIN_EMAILS = [
  'energygurusonline@gmail.com',
  'energyguruscrm@gmail.com',
  'nomiking0072012@gmail.com',
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  try {
    const adminAuthClient = createAdminClient()

    // 1. Fetch all users from Prisma
    const allUsers = await prisma.user.findMany()

    // Find our main super admin user to reassign any customer links
    const mainSuperAdmin = allUsers.find(u => 
      KEEP_SUPER_ADMIN_EMAILS.includes(u.email.toLowerCase())
    )

    const usersToDelete = allUsers.filter(u => 
      !KEEP_SUPER_ADMIN_EMAILS.includes(u.email.toLowerCase())
    )

    const deletedEmails: string[] = []

    // 2. Clear customer links & delete Prisma users
    for (const user of usersToDelete) {
      await prisma.customer.updateMany({
        where: { accountExecutiveId: user.id },
        data: { accountExecutiveId: mainSuperAdmin ? mainSuperAdmin.id : null }
      })

      await prisma.customer.updateMany({
        where: { assignedInstallerId: user.id },
        data: { assignedInstallerId: mainSuperAdmin ? mainSuperAdmin.id : null }
      })

      await prisma.user.delete({
        where: { id: user.id }
      })

      // If user had a valid UUID supabaseId, delete it directly
      if (user.supabaseId && UUID_REGEX.test(user.supabaseId)) {
        try {
          await adminAuthClient.auth.admin.deleteUser(user.supabaseId)
        } catch (e: any) {
          // ignore
        }
      }

      deletedEmails.push(user.email)
    }

    // 3. Search and clean any matching demo users directly from Supabase Auth
    try {
      const { data: authUsers } = await adminAuthClient.auth.admin.listUsers({ perPage: 100 })
      if (authUsers?.users) {
        for (const authUser of authUsers.users) {
          const email = authUser.email?.toLowerCase() || ''
          if (email && !KEEP_SUPER_ADMIN_EMAILS.includes(email)) {
            // Delete demo auth user
            await adminAuthClient.auth.admin.deleteUser(authUser.id)
          }
        }
      }
    } catch (authListErr: any) {
      console.warn('Could not list/clean auth users:', authListErr?.message)
    }

    const remainingUsers = await prisma.user.findMany()

    return NextResponse.json({
      success: true,
      message: `Cleaned users. Kept ${remainingUsers.length} Super Admin users.`,
      remainingUsers: remainingUsers.map(u => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role }))
    })
  } catch (error: any) {
    console.error('Error cleaning users:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
