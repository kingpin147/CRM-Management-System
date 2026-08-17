'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ShoppingBag, AlertCircle, BarChart3, Truck, Users, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  const triggerClass = (baseActive: boolean) => {
    const base = "flex items-center gap-1 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none"
    const layout = orientation === 'horizontal' ? "px-3.5 py-2" : "w-full justify-between px-3 py-2"
    
    if (baseActive) {
      return `${base} ${layout} bg-[var(--color-amber)]/15 text-[var(--color-ink)] font-bold shadow-2xs`
    }
    return `${base} ${layout} text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)]`
  }

  const linkClass = (path: string) => {
    const base = "flex items-center text-sm font-medium rounded-lg transition-all duration-200"
    const layout = orientation === 'horizontal' ? "px-3.5 py-2" : "px-3 py-2"

    if (isActive(path)) {
      return `${base} ${layout} bg-[var(--color-amber)]/15 text-[var(--color-ink)] font-semibold shadow-2xs`
    }
    return `${base} ${layout} text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)]`
  }

  const canViewAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role)

  if (orientation === 'horizontal') {
    return (
      <nav className="flex items-center space-x-2">
        {/* 1. Sales Tab with Sub-menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/sales') || pathname === '/dashboard/customers/new')}>
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-[var(--color-amber)]" />
              Sales
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-white p-1.5 shadow-md border-line rounded-xl">
            <DropdownMenuItem>
              <Link href="/dashboard/customers/new" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Create Sale
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/sales/pending" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Pending Sale
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 2. Complain Management Tab with Sub-menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/tickets'))}>
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-[var(--color-amber)]" />
              Complain Management
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-white p-1.5 shadow-md border-line rounded-xl">
            <DropdownMenuItem>
              <Link href="/dashboard/tickets?status=PENDING" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Pending Complains
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/tickets" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                All Tickets & Support
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 3. Reports Tab with Sub-menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/reports'))}>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[var(--color-amber)]" />
              Reports
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white p-1.5 shadow-md border-line rounded-xl">
            <DropdownMenuItem>
              <Link href="/dashboard/reports?view=status" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Customer Status Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/reports?view=sales" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Sales Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/reports?view=receivable" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Customer Receivable
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/reports?view=adjustment" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Adjustment Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/reports?view=payments" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Payments Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/reports?view=register" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Customer Register
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 4. Service Delivery Tab with Sub-menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/service-delivery'))}>
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-[var(--color-amber)]" />
              Service Delivery
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 bg-white p-1.5 shadow-md border-line rounded-xl">
            <DropdownMenuItem>
              <Link href="/dashboard/service-delivery/inventory" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Inventory Management
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Management if Authorized */}
        {canViewAdmin && (
          <Link href="/dashboard/admin" className={linkClass('/dashboard/admin')}>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[var(--color-amber)]" />
              User Roles
            </span>
          </Link>
        )}
      </nav>
    )
  }

  // Mobile / Vertical Orientation
  return (
    <div className="space-y-4">
      <div>
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Sales</p>
        <div className="space-y-0.5">
          <Link href="/dashboard/customers/new" className={linkClass('/dashboard/customers/new')}>
            Create Sale
          </Link>
          <Link href="/dashboard/sales/pending" className={linkClass('/dashboard/sales/pending')}>
            Pending Sale
          </Link>
        </div>
      </div>

      <div>
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Complain Management</p>
        <div className="space-y-0.5">
          <Link href="/dashboard/tickets?status=PENDING" className={linkClass('/dashboard/tickets?status=PENDING')}>
            Pending Complains
          </Link>
          <Link href="/dashboard/tickets" className={linkClass('/dashboard/tickets')}>
            All Tickets
          </Link>
        </div>
      </div>

      <div>
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Reports</p>
        <div className="space-y-0.5">
          <Link href="/dashboard/reports?view=status" className={linkClass('/dashboard/reports?view=status')}>
            Customer Status Report
          </Link>
          <Link href="/dashboard/reports?view=sales" className={linkClass('/dashboard/reports?view=sales')}>
            Sales Report
          </Link>
          <Link href="/dashboard/reports?view=receivable" className={linkClass('/dashboard/reports?view=receivable')}>
            Customer Receivable
          </Link>
          <Link href="/dashboard/reports?view=adjustment" className={linkClass('/dashboard/reports?view=adjustment')}>
            Adjustment Report
          </Link>
          <Link href="/dashboard/reports?view=payments" className={linkClass('/dashboard/reports?view=payments')}>
            Payments Report
          </Link>
          <Link href="/dashboard/reports?view=register" className={linkClass('/dashboard/reports?view=register')}>
            Customer Register
          </Link>
        </div>
      </div>

      <div>
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Service Delivery</p>
        <div className="space-y-0.5">
          <Link href="/dashboard/service-delivery/inventory" className={linkClass('/dashboard/service-delivery/inventory')}>
            Inventory Management
          </Link>
        </div>
      </div>

      {canViewAdmin && (
        <div>
          <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Management</p>
          <Link href="/dashboard/admin" className={linkClass('/dashboard/admin')}>
            User Roles & Permissions
          </Link>
        </div>
      )}

      <div>
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Account</p>
        <Link href="/dashboard/settings" className={linkClass('/dashboard/settings')}>
          Settings
        </Link>
      </div>
    </div>
  )
}

