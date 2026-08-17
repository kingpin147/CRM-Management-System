import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-line bg-white shadow-sm shrink-0">
          
          {/* Mobile Navigation */}
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
                  <MainNav role={userRole} orientation="vertical" />
                </nav>
              </SheetContent>
            </Sheet>
            <span className="font-display font-bold text-lg text-[var(--color-graphite)]">EnergyGurus</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 gap-8">
            <div className="flex items-center gap-2">
              <Image src="/logo-icon.svg" alt="EnergyGurus Logo" width={28} height={28} />
              <span className="font-display font-bold text-xl text-[var(--color-graphite)]">EnergyGurus</span>
            </div>
            <MainNav role={userRole} orientation="horizontal" />
          </div>

          <div className="flex items-center justify-end space-x-4 ml-4">
            <UserNav email={user.email} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
