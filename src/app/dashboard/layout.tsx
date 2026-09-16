import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MainNav } from '@/components/layout/MainNav'
import { MobileNav } from '@/components/layout/MobileNav'
import prisma from '@/lib/prisma'
import { UserNav } from '@/components/layout/UserNav'
import { Logo } from '@/components/ui/logo'
import { SessionTimeout } from '@/components/auth/SessionTimeout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user role and name from Prisma DB to determine navigation options and header profile
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: user.id },
        ...(user.email ? [{ email: { equals: user.email, mode: 'insensitive' as const } }] : [])
      ]
    },
    select: { id: true, supabaseId: true, role: true, fullName: true, designation: true, email: true }
  })

  // If supabaseId was not linked yet, auto-sync it
  if (dbUser && !dbUser.supabaseId && user.id) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { supabaseId: user.id }
    }).catch(() => {})
  }

  const userRole = dbUser?.role || ''
  const userDesignation = dbUser?.designation || ''
  const userFullName = dbUser?.fullName || (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || ''

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SessionTimeout timeoutMinutes={20} />
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs shrink-0">
          
          {/* Mobile Navigation */}
          <MobileNav role={userRole} fullName={userFullName} designation={userDesignation} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 gap-2 lg:gap-4 xl:gap-6 min-w-0">
            <Logo href="/dashboard/customers" iconSize={28} className="hover:opacity-80 transition-opacity" />
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
              <MainNav role={userRole} fullName={userFullName} designation={userDesignation} orientation="horizontal" />
            </div>
          </div>

          <div className="flex items-center justify-end shrink-0 ml-2">
            <UserNav email={user.email} fullName={userFullName} designation={userDesignation} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
