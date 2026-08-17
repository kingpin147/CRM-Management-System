'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MainNav({ 
  role = 'SALES', 
  orientation = 'vertical' 
}: { 
  role?: string;
  orientation?: 'horizontal' | 'vertical'
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const linkClass = (path: string) => {
    const baseClass = "flex items-center text-sm font-medium rounded-lg transition-all duration-200"
    
    // Layout-specific classes
    const layoutClass = orientation === 'horizontal' 
      ? "px-3.5 py-1.5" // horizontal spacing
      : "px-3 py-2" // vertical spacing

    // State-specific classes
    if (isActive(path)) {
      return `${baseClass} ${layoutClass} bg-[var(--color-amber)]/15 text-[var(--color-ink)] font-semibold shadow-xs`
    }
    return `${baseClass} ${layoutClass} text-[var(--color-slate-custom)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]`
  }

  const canViewLedger = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(role)
  const canViewReports = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(role)
  const canViewAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role)

  const Container = orientation === 'horizontal' ? 'nav' : 'div'
  const containerClass = orientation === 'horizontal' ? 'flex items-center space-x-1' : 'space-y-1'

  // Helper for rendering section headers in vertical mode
  const SectionHeader = ({ children }: { children: React.ReactNode }) => {
    if (orientation === 'horizontal') return null
    return (
      <div className="pt-4 mt-4 border-t border-line">
        <p className="px-3 text-xs font-semibold text-[var(--color-slate-custom)] uppercase tracking-wider mb-2">
          {children}
        </p>
      </div>
    )
  }

  return (
    <Container className={containerClass}>
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
        <>
          <SectionHeader>Management</SectionHeader>
          <Link href="/dashboard/admin" className={linkClass('/dashboard/admin')}>
            User Roles
          </Link>
        </>
      )}

      <>
        <SectionHeader>Account</SectionHeader>
        <Link href="/dashboard/settings" className={linkClass('/dashboard/settings')}>
          Settings
        </Link>
      </>
    </Container>
  )
}
