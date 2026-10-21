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
    // Check initial activity timestamp on mount
    const now = Date.now()
    let lastActive = now

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (parsed) {
          if (now - parsed >= timeoutMs) {
            // Already expired while away
            isLoggingOutRef.current = true
            supabase.auth.signOut().catch(() => {})
            router.push('/login?reason=session_expired')
            return
          }
          lastActive = parsed
        }
      } else {
        localStorage.setItem(STORAGE_KEY, now.toString())
      }
    } catch {
      // ignore
    }

    let lastRecorded = lastActive

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
          activeTime = parseInt(stored, 10) || lastRecorded
        }
      } catch {
        activeTime = lastRecorded
      }

      const elapsed = Date.now() - activeTime
      if (elapsed >= timeoutMs) {
        isLoggingOutRef.current = true
        clearInterval(interval)
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
    }
  }, [timeoutMs, router, supabase])

  return null
}
