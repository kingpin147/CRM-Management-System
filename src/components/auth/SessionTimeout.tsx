'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface SessionTimeoutProps {
  /** Inactivity timeout in minutes. Defaults to 60 minutes (1 hour). */
  timeoutMinutes?: number
}

const STORAGE_KEY = 'crm_last_user_activity'

export function SessionTimeout({ timeoutMinutes = 60 }: SessionTimeoutProps) {
  const router = useRouter()
  const supabase = createClient()
  const timeoutMs = timeoutMinutes * 60 * 1000
  const isLoggingOutRef = useRef(false)

  useEffect(() => {
    // When SessionTimeout mounts in dashboard, user has just navigated/logged in.
    // Reset activity timestamp to current time to prevent stale timestamps from previous sessions
    // from triggering an immediate logout loop.
    const mountTime = Date.now()
    let lastRecorded = mountTime

    try {
      localStorage.setItem(STORAGE_KEY, mountTime.toString())
    } catch {
      // ignore
    }

    // Keep auth state in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        const now = Date.now()
        lastRecorded = now
        try {
          localStorage.setItem(STORAGE_KEY, now.toString())
        } catch {}
      } else if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {}
      }
    })

    const updateActivity = () => {
      const current = Date.now()
      // Throttle localStorage writes to once every 3 seconds
      if (current - lastRecorded > 3000) {
        lastRecorded = current
        try {
          localStorage.setItem(STORAGE_KEY, current.toString())
        } catch {
          // ignore
        }
      }
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(evt => window.addEventListener(evt, updateActivity, { passive: true }))

    // Check interval every 10 seconds
    const interval = setInterval(async () => {
      if (isLoggingOutRef.current) return

      let activeTime = lastRecorded
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = parseInt(stored, 10)
          if (parsed && !isNaN(parsed)) {
            activeTime = parsed
          }
        }
      } catch {
        activeTime = lastRecorded
      }

      const elapsed = Date.now() - activeTime
      if (elapsed >= timeoutMs) {
        isLoggingOutRef.current = true
        clearInterval(interval)
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {}
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.error('Session timeout sign out error:', e)
        }
        router.push('/login?reason=session_expired')
      }
    }, 10000)

    return () => {
      events.forEach(evt => window.removeEventListener(evt, updateActivity))
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [timeoutMs, router, supabase])

  return null
}
