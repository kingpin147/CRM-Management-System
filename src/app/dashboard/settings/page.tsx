'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { changePassword } from './actions'

export default function SettingsPage() {
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
        // Clear the form
        const form = document.getElementById('change-password-form') as HTMLFormElement
        form?.reset()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-reveal max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Settings</h1>
        <p className="text-[var(--color-slate-custom)] mt-1">Manage your account preferences.</p>
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password. You will need your current password to make changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="change-password-form" action={handleSubmit} className="space-y-4">
            {message && (
              <div className={
                "p-3 text-sm rounded-lg text-center font-medium " + (message.type === 'error'
                  ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                  : 'bg-sky-50 border border-sky-200 text-sky-800')
              }>
                {message.text}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required className="border-[var(--color-line)]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={6} className="border-[var(--color-line)]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} className="border-[var(--color-line)]" />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
