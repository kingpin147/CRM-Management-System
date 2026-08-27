import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChangePasswordForm } from './ChangePasswordForm'
import { User, Users, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  const userRole = dbUser?.role
  return (
    <div className="space-y-6 animate-reveal max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Account &amp; User Settings</h1>
        <p className="text-[var(--color-slate-custom)] mt-1">Manage your account profile, credentials, and access settings.</p>
      </div>

      {/* User Profile Card */}
      <Card className="shadow-sm border-line">
        <CardHeader className="pb-4 border-b border-line bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#002868] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                {dbUser?.fullName ? dbUser.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-[var(--color-graphite)]">
                  {dbUser?.fullName || 'Platform User'}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 font-mono">
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white text-xs font-bold border-amber-300 text-amber-900 px-2.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[var(--color-amber)] inline" />
                {userRole?.replace('_', ' ') || 'Unassigned'}
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-semibold px-2 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Assigned Role:</span>
            <span className="font-bold text-[var(--color-ink)] text-sm">{userRole?.replace('_', ' ') || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Email Address:</span>
            <span className="font-medium text-gray-700">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Member Since:</span>
            <span className="font-medium text-gray-700 font-mono">
              {formatDate(dbUser?.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>



      {/* Change Password Component */}
      <ChangePasswordForm />
    </div>
  )
}
