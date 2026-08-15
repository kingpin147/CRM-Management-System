'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import { PrismaClient, Role } from '@prisma/client'
import { sendInvitationEmail } from '@/utils/brevo'

const prisma = new PrismaClient()

export async function createUser(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as Role

    if (!email || !password || !name) {
      return { error: 'Missing required fields' }
    }

    const adminAuthClient = createAdminClient()

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: 'Failed to create user in Auth' }
    }

    // 2. Create user in Postgres (Prisma)
    await prisma.user.create({
      data: {
        supabaseId: authData.user.id,
        email: authData.user.email!,
        fullName: name,
        role: role || Role.SALES_MANAGER,
      }
    })

    // 3. Send Brevo Invitation Email
    await sendInvitationEmail(email, name, role || Role.SALES_MANAGER)

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (error: any) {
    if (error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return { error: 'Admin functionality requires the SUPABASE_SERVICE_ROLE_KEY in your environment variables.' }
    }
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function deleteUser(id: string) {
  try {
    const adminAuthClient = createAdminClient()

    // 1. Delete from Supabase Auth
    const { error: authError } = await adminAuthClient.auth.admin.deleteUser(id)
    if (authError) {
      return { error: authError.message }
    }

    // 2. Delete from Postgres (Prisma)
    await prisma.user.delete({
      where: { id }
    })

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' }
  }
}
