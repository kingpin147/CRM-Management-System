'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { changePassword } from './actions'
import { Loader2, KeyRound } from 'lucide-react'

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    try {
      const result = await changePassword(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        const form = document.getElementById('change-password-form') as HTMLFormElement
        form?.reset()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-sm border-line">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-[var(--color-graphite)]">
          <KeyRound className="w-5 h-5 text-[var(--color-amber)]" />
          Change Password
        </CardTitle>
        <CardDescription>Update your account password. You will need your current password to make changes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="change-password-form" action={handleSubmit} className="space-y-4">
          {message && (
            <div className={
              "p-3 text-xs rounded-lg text-center font-medium " + (message.type === 'error'
                ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800')
            }>
              {message.text}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required className="border-[var(--color-line)] h-10 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" required minLength={6} className="border-[var(--color-line)] h-10 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} className="border-[var(--color-line)] h-10 text-xs" />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto text-xs font-bold gap-2">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</> : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
