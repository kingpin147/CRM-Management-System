import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

  // TODO: Fetch user role from Prisma DB to determine navigation options

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-line bg-paper flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-line shadow-sm">
          <Image src="/logo-icon.svg" alt="EnergyGurus Logo" width={28} height={28} />
          <span className="font-display font-bold text-xl text-[var(--color-graphite)]">EnergyGurus</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-[var(--color-amber)]/10 text-[var(--color-ink)] hover:bg-[var(--color-amber)]/20 transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/customers" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)] transition-colors">
            Customers
          </Link>
          <Link href="/dashboard/tickets" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)] transition-colors">
            Complaints
          </Link>
          <Link href="/dashboard/ledger" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)] transition-colors">
            Ledger & Invoices
          </Link>
          
          <div className="pt-4 mt-4 border-t border-line">
            <p className="px-3 text-xs font-semibold text-[var(--color-slate-custom)] uppercase tracking-wider mb-2">
              Management
            </p>
            <Link href="/dashboard/admin" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)] transition-colors">
              User Roles
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-line">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-teal)] flex items-center justify-center text-white font-bold text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-[var(--color-ink)] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-line bg-white shadow-sm">
          <div className="md:hidden">
            <span className="font-display font-bold text-lg text-[var(--color-graphite)]">EnergyGurus</span>
          </div>
          <div className="flex items-center justify-end w-full space-x-4">
            {/* Header controls like global search or notifications */}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
