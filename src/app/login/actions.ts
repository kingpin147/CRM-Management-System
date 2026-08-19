'use server'

import { createClient } from '@/utils/supabase/server'

export type LoginActionState = {
  error?: string | null
  success?: boolean
}

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Please enter both email and password.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      return { error: error.message || 'Invalid email or password.' }
    }

    if (!data.session) {
      return { error: 'Failed to establish user session. Please try again.' }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Login action error:', err)
    return { error: err.message || 'An unexpected error occurred during login.' }
  }
}

export async function seedDatabaseAction() {
  try {
    const { runSeed } = await import('@/lib/seed-db')
    await runSeed()
    return { success: true, message: 'Database successfully seeded!' }
  } catch (err: any) {
    console.error('Seed error:', err)
    return { error: err.message || 'Seeding failed' }
  }
}
