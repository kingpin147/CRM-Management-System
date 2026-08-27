import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createAdminClient } from '@/utils/supabase/admin'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const adminAuthClient = createAdminClient()

    // 1. Target Super Admins to remove
    const emailsToRemove = [
      'energygurusonline@gmail.com',
      'energyguruscrm@gmail.com',
    ]

    // 2. Find or create the main super admin to re-link any relations
    let nomikingUser = await prisma.user.findFirst({
      where: { email: { equals: 'nomiking0072012@gmail.com', mode: 'insensitive' } }
    })

    // Update nomiking's name and designation as requested
    if (nomikingUser) {
      nomikingUser = await prisma.user.update({
        where: { id: nomikingUser.id },
        data: {
          fullName: 'Muhammad Nouman Attique',
          designation: 'Website Developer',
          role: Role.SUPER_ADMIN,
        }
      })
      if (nomikingUser.supabaseId) {
        try {
          await adminAuthClient.auth.admin.updateUserById(nomikingUser.supabaseId, {
            user_metadata: {
              full_name: 'Muhammad Nouman Attique',
              designation: 'Website Developer',
              role: 'SUPER_ADMIN'
            }
          })
        } catch (e) {
          console.warn('Could not update metadata in supabase for nomiking:', e)
        }
      }
    }

    // 3. Create or update Super Admin Aafaaq Ali Khan (CEO)
    const ceoEmail = 'ak@energygurus.online'
    let ceoUser = await prisma.user.findFirst({
      where: { email: { equals: ceoEmail, mode: 'insensitive' } }
    })

    if (!ceoUser) {
      // Check if user already exists in Supabase Auth
      let authUserId = ''
      const { data: existingAuth } = await adminAuthClient.auth.admin.listUsers()
      const foundAuth = existingAuth?.users?.find(u => u.email?.toLowerCase() === ceoEmail.toLowerCase())
      
      if (foundAuth) {
        authUserId = foundAuth.id
        await adminAuthClient.auth.admin.updateUserById(authUserId, {
          user_metadata: {
            full_name: 'Aafaaq Ali Khan',
            designation: 'CEO',
            role: 'SUPER_ADMIN'
          }
        })
      } else {
        const { data: newAuth, error: newAuthErr } = await adminAuthClient.auth.admin.createUser({
          email: ceoEmail,
          password: 'Password@123456',
          email_confirm: true,
          user_metadata: {
            full_name: 'Aafaaq Ali Khan',
            designation: 'CEO',
            role: 'SUPER_ADMIN'
          }
        })
        if (newAuthErr) throw newAuthErr
        authUserId = newAuth.user.id
      }

      ceoUser = await prisma.user.create({
        data: {
          supabaseId: authUserId,
          email: ceoEmail,
          fullName: 'Aafaaq Ali Khan',
          designation: 'CEO',
          role: Role.SUPER_ADMIN,
          isActive: true
        }
      })
    } else {
      ceoUser = await prisma.user.update({
        where: { id: ceoUser.id },
        data: {
          fullName: 'Aafaaq Ali Khan',
          designation: 'CEO',
          role: Role.SUPER_ADMIN,
          isActive: true
        }
      })
    }

    // 4. Remove energygurusonline and energyguruscrm users
    const fallbackAdminId = ceoUser ? ceoUser.id : (nomikingUser ? nomikingUser.id : null)

    for (const email of emailsToRemove) {
      const u = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      })

      if (u) {
        // Re-assign customers if any
        if (fallbackAdminId) {
          await prisma.customer.updateMany({
            where: { accountExecutiveId: u.id },
            data: { accountExecutiveId: fallbackAdminId }
          })
          await prisma.customer.updateMany({
            where: { assignedInstallerId: u.id },
            data: { assignedInstallerId: fallbackAdminId }
          })
        }

        // Delete from Prisma
        await prisma.user.delete({ where: { id: u.id } })

        // Delete from Supabase Auth
        if (u.supabaseId) {
          try {
            await adminAuthClient.auth.admin.deleteUser(u.supabaseId)
          } catch (e) {
            console.warn('Could not delete auth user:', e)
          }
        }
      }
    }

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      message: 'Super Admin users updated successfully',
      users: allUsers.map(u => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        designation: u.designation,
        role: u.role
      }))
    })
  } catch (error: any) {
    console.error('Error updating users:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
