import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MainNav } from '@/components/layout/MainNav'
import prisma from '@/lib/prisma'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UserNav } from '@/components/layout/UserNav'
import { Logo } from '@/components/ui/logo'

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

  // Fetch user role from Prisma DB to determine navigation options
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true, fullName: true, designation: true }
  })
  const userRole = dbUser?.role || ''
  const userDesignation = dbUser?.designation || ''
  const userFullName = dbUser?.fullName || ''

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs shrink-0">
          
          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Logo
                  href="/dashboard/customers"
                  iconSize={28}
                  className="h-16 px-6 border-b border-line shadow-sm hover:opacity-80 transition-opacity"
                />
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                  <MainNav role={userRole} orientation="vertical" />
                </nav>
              </SheetContent>
            </Sheet>
            <Logo href="/dashboard/customers" iconSize={24} className="hover:opacity-80 transition-opacity" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 gap-2 lg:gap-4 xl:gap-6 min-w-0">
            <Logo href="/dashboard/customers" iconSize={28} className="hover:opacity-80 transition-opacity" />
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
              <MainNav role={userRole} orientation="horizontal" />
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
