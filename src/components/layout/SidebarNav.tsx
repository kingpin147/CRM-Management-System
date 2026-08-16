'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarNav({ role = 'SALES' }: { role?: string }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const linkClass = (path: string) => {
    if (isActive(path)) {
      return "flex items-center px-3 py-2 text-sm font-medium rounded-md bg-[var(--color-amber)]/10 text-[var(--color-ink)] hover:bg-[var(--color-amber)]/20 transition-colors"
    }
    return "flex items-center px-3 py-2 text-sm font-medium rounded-md text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)] transition-colors"
  }

  const canViewLedger = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(role)
  const canViewReports = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(role)
  const canViewAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role)

  return (
    <>
      <Link href="/dashboard/customers" className={linkClass('/dashboard/customers')}>
        Customers
      </Link>
      
      <Link href="/dashboard/tickets" className={linkClass('/dashboard/tickets')}>
        Complaints & Tickets
      </Link>

      {canViewLedger && (
        <Link href="/dashboard/ledger" className={linkClass('/dashboard/ledger')}>
          Ledger & Invoices
        </Link>
      )}

      {canViewReports && (
        <Link href="/dashboard/reports" className={linkClass('/dashboard/reports')}>
          Reports
        </Link>
      )}

      {canViewAdmin && (
        <div className="pt-4 mt-4 border-t border-line">
          <p className="px-3 text-xs font-semibold text-[var(--color-slate-custom)] uppercase tracking-wider mb-2">
            Management
          </p>
          <Link href="/dashboard/admin" className={linkClass('/dashboard/admin')}>
            User Roles
          </Link>
        </div>
      )}

      <div className="pt-4 mt-4 border-t border-line">
        <p className="px-3 text-xs font-semibold text-[var(--color-slate-custom)] uppercase tracking-wider mb-2">
          Account
        </p>
        <Link href="/dashboard/settings" className={linkClass('/dashboard/settings')}>
          Settings
        </Link>
      </div>
    </>
  )
}
