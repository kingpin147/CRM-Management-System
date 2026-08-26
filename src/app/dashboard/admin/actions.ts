'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'
import { sendInvitationEmail } from '@/utils/brevo'
import { createClient } from '@/utils/supabase/server'

export async function createUser(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as Role
    const designation = formData.get('designation') as string

    if (!email || !password || !name) {
      return { error: 'Missing required fields' }
    }

    const adminAuthClient = createAdminClient()

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role,
        designation: designation || null,
      }
    })

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError)
      return { error: authError?.message || 'Failed to create user in Auth system' }
    }

    // 2. Create user record in Prisma Database
    try {
      await prisma.user.create({
        data: {
          supabaseId: authData.user.id,
          email,
          fullName: name,
          role,
          designation: designation || null,
        }
      })
    } catch (dbError) {
      console.error('Prisma db error:', dbError)
      // Cleanup auth user if db creation fails
      await adminAuthClient.auth.admin.deleteUser(authData.user.id)
      return { error: 'Failed to create user profile in database' }
    }

    // 3. Attempt to send invitation email (non-blocking)
    try {
      await sendInvitationEmail(email, name, role)
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // We don't return error here because the user was created successfully
    }

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in createUser:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Ensure requester has permissions to act on target
async function checkPermissions(targetUserId: string, requireSuperAdmin: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, error: 'Unauthorized' }

  const requester = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, role: true }
  })
  
  if (!requester || (requireSuperAdmin && requester.role !== 'SUPER_ADMIN')) {
     return { allowed: false, error: 'Insufficient permissions' }
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true, supabaseId: true }
  })

  if (!target) return { allowed: false, error: 'Target user not found' }

  // Admin cannot modify Super Admin. Super Admin can modify anyone.
  if (target.role === 'SUPER_ADMIN' && requester.role !== 'SUPER_ADMIN') {
    return { allowed: false, error: 'Cannot modify a SUPER_ADMIN' }
  }

  // Cannot delete/disable yourself
  if (requester.id === targetUserId) {
    return { allowed: false, error: 'Cannot perform this action on your own account' }
  }

  return { allowed: true, target, requester }
}

export async function deleteUser(targetUserId: string) {
  try {
    const { allowed, error, target } = await checkPermissions(targetUserId)
    if (!allowed || !target) return { error }

    const adminAuthClient = createAdminClient()
    
    // 1. Delete from Prisma
    await prisma.user.delete({
      where: { id: targetUserId }
    })

    // 2. Delete from Supabase Auth
    await adminAuthClient.auth.admin.deleteUser(target.supabaseId)

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    console.error('Delete user error:', err)
    return { error: err.message || 'An error occurred while deleting the user' }
  }
}

export async function toggleUserStatus(targetUserId: string, newStatus: boolean) {
  try {
    const { allowed, error, target } = await checkPermissions(targetUserId)
    if (!allowed || !target) return { error }

    const adminAuthClient = createAdminClient()
    
    // Update Prisma
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: newStatus }
    })

    // Update Supabase Auth (Ban / Unban)
    if (!newStatus) {
      await adminAuthClient.auth.admin.updateUserById(target.supabaseId, { ban_duration: '100000h' })
    } else {
      await adminAuthClient.auth.admin.updateUserById(target.supabaseId, { ban_duration: 'none' })
    }

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    console.error('Toggle status error:', err)
    return { error: err.message || 'An error occurred while toggling user status' }
  }
}

export async function resetUserPassword(targetUserId: string) {
  try {
    const { allowed, error, target } = await checkPermissions(targetUserId)
    if (!allowed || !target) return { error }

    // Generate random 12 char password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let newPassword = ''
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const adminAuthClient = createAdminClient()
    const { error: authError } = await adminAuthClient.auth.admin.updateUserById(target.supabaseId, {
      password: newPassword
    })

    if (authError) return { error: authError.message }

    return { success: true, newPassword }
  } catch (err: any) {
    console.error('Reset password error:', err)
    return { error: err.message || 'An error occurred while resetting password' }
  }
}

export async function updateUserRole(targetUserId: string, newRole: Role) {
  try {
    const { allowed, error, target, requester } = await checkPermissions(targetUserId)
    if (!allowed || !target || !requester) return { error }

    // Standard ADMIN cannot promote users to SUPER_ADMIN
    if (newRole === 'SUPER_ADMIN' && requester.role !== 'SUPER_ADMIN') {
      return { error: 'Only a Super Admin can promote a user to Super Admin' }
    }

    const adminAuthClient = createAdminClient()

    // 1. Update Prisma
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole }
    })

    // 2. Update Supabase user metadata
    await adminAuthClient.auth.admin.updateUserById(target.supabaseId, {
      user_metadata: { role: newRole }
    })

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    console.error('Update user role error:', err)
    return { error: err.message || 'An error occurred while updating user role' }
  }
}


