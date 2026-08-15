import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarNav } from '@/components/layout/SidebarNav'
import prisma from '@/lib/prisma'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UserNav } from '@/components/layout/UserNav'

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
    where: { supabaseId: user.id }
  })
  const userRole = dbUser?.role || 'SALES'

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 border-r border-line bg-paper flex-shrink-0 flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-line shadow-sm">
          <Image src="/logo-icon.svg" alt="EnergyGurus Logo" width={28} height={28} />
          <span className="font-display font-bold text-xl text-[var(--color-graphite)]">EnergyGurus</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <SidebarNav role={userRole} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-line bg-white shadow-sm shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-16 flex items-center gap-2 px-6 border-b border-line shadow-sm">
                  <Image src="/logo-icon.svg" alt="EnergyGurus Logo" width={28} height={28} />
                  <span className="font-display font-bold text-xl text-[var(--color-graphite)]">EnergyGurus</span>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                  <SidebarNav role={userRole} />
                </nav>
              </SheetContent>
            </Sheet>
            <span className="font-display font-bold text-lg text-[var(--color-graphite)]">EnergyGurus</span>
          </div>
          <div className="flex items-center justify-end w-full space-x-4">
            {/* Header controls like global search or notifications */}
            <UserNav email={user.email} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
