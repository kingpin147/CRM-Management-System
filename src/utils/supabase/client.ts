import { createBrowserClient } from '@supabase/ssr'

const ONE_HOUR_SECONDS = 60 * 60 // 1 hour session expiry

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: ONE_HOUR_SECONDS,
        sameSite: 'lax',
        path: '/',
      },
    }
  )
}
