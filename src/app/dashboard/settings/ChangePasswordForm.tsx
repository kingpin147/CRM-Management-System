'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { changePassword } from './actions'
import { Loader2, KeyRound, CheckCircle2, RotateCcw } from 'lucide-react'

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await changePassword(formData)
      if (result.error) {
        setErrorMessage(result.error)
      } else {
        setIsSuccess(true)
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
        {isSuccess ? (
          <div className="py-6 px-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Password Changed Successfully!</h3>
              <p className="text-xs text-emerald-700 mt-1">Your account password has been updated and is active now.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSuccess(false)
                setErrorMessage(null)
              }}
              className="mt-2 text-xs font-semibold text-emerald-800 border-emerald-300 hover:bg-emerald-100 gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change Password Again
            </Button>
          </div>
        ) : (
          <form id="change-password-form" action={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-2.5 text-xs rounded-lg text-center font-medium bg-destructive/10 border border-destructive/20 text-destructive">
                {errorMessage}
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
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-xs font-bold gap-2 cursor-pointer">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</> : 'Update Password'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
