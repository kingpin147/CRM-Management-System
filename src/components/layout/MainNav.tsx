'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ShoppingBag, AlertCircle, BarChart3, Users, Settings, Search, CreditCard } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function MainNav({ 
  role = 'SALES_MANAGER', 
  orientation = 'vertical' 
}: { 
  role?: string;
  orientation?: 'horizontal' | 'vertical'
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard/customers') {
      return pathname === '/dashboard/customers' || pathname === '/dashboard'
    }
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/customers'
    }
    return pathname.startsWith(path)
  }

  const triggerClass = (baseActive: boolean) => {
    const base = "flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none whitespace-nowrap shrink-0"
    const layout = orientation === 'horizontal' 
      ? "px-2 py-1.5 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2" 
      : "w-full justify-between px-3 py-2 text-xs"
    
    if (baseActive) {
      return `${base} ${layout} bg-[var(--color-amber)]/15 text-[var(--color-ink)] font-bold shadow-2xs`
    }
    return `${base} ${layout} text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)]`
  }

  const linkClass = (path: string) => {
    const base = "flex items-center text-xs xl:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0"
    const layout = orientation === 'horizontal' 
      ? "px-2 py-1.5 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2" 
      : "px-3 py-2 text-xs"

    if (isActive(path)) {
      return `${base} ${layout} bg-[var(--color-amber)]/15 text-[var(--color-ink)] font-semibold shadow-2xs`
    }
    return `${base} ${layout} text-[var(--color-slate-custom)] hover:bg-black/5 hover:text-[var(--color-ink)]`
  }

  const isSuperAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role)
  const isSalesManager = ['SALES_MANAGER', 'BILLING_MANAGER', 'MANAGER'].includes(role)
  const isOMManager = role === 'OM_MANAGER'
  const isInstaller = role === 'INSTALLATION'
  const isSalesExec = role === 'SALES'
  const isIpNoc = role === 'IP_NOC_EXECUTIVE'

  const canViewAdmin = isSuperAdmin
  const canViewApproval = isSuperAdmin || isSalesManager || isOMManager
  const canViewBilling = isSuperAdmin || isSalesManager
  const canViewReports = isSuperAdmin || isSalesManager || isOMManager || isSalesExec
  const canViewAssignedJobs = isInstaller || isIpNoc

  if (orientation === 'horizontal') {
    return (
      <nav className="flex items-center gap-0.5 lg:gap-1 xl:gap-1.5">
        {/* Customer Search Tab */}
        <Link 
          href="/dashboard/customers" 
          className={linkClass('/dashboard/customers')}
        >
          <span className="flex items-center gap-1 xl:gap-1.5 font-semibold">
            <Search className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
            <span>Customer Search</span>
          </span>
        </Link>

        {/* 1. Sales / Assigned Jobs Tab */}
        {canViewAssignedJobs ? (
          <Link 
            href="/dashboard/installer/jobs" 
            className={linkClass('/dashboard/installer/jobs')}
          >
            <span className="flex items-center gap-1 xl:gap-1.5 font-semibold">
              <ShoppingBag className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
              <span>Assigned Jobs</span>
            </span>
          </Link>
        ) : canViewApproval ? (
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/sales') || pathname === '/dashboard/customers/new')}>
              <span className="flex items-center gap-1 xl:gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
                <span>Sales</span>
              </span>
              <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 opacity-70 shrink-0 ml-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white p-1.5 shadow-lg border-line rounded-xl animate-in fade-in-50 zoom-in-95">
              {!isOMManager && (
                <DropdownMenuItem>
                  <Link href="/dashboard/customers/new" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                    Create Sale
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Link href="/dashboard/sales/pending" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                  Manager Approval
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link 
            href="/dashboard/customers/new" 
            className={linkClass('/dashboard/customers/new')}
          >
            <span className="flex items-center gap-1 xl:gap-1.5 font-semibold">
              <ShoppingBag className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
              <span>Create Sale</span>
            </span>
          </Link>
        )}

        {/* 2. Billing & CPM Tab with Sub-menu (Visible to Sales & Billing Operations & Super Admin) */}
        {canViewBilling && (
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/billing-cpm'))}>
              <span className="flex items-center gap-1 xl:gap-1.5">
                <CreditCard className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
                <span>Billing & CPM</span>
              </span>
              <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 opacity-70 shrink-0 ml-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-white p-1.5 shadow-lg border-line rounded-xl animate-in fade-in-50 zoom-in-95">
              <DropdownMenuItem>
                <Link href="/dashboard/billing-cpm?tab=package-status" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                  Package & Status Change
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/billing-cpm?tab=debit-credit" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                  Debit / Credit Notes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/billing-cpm?tab=payments" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                  Payment Entry & Approval
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/billing-cpm?tab=bulk-status" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                  Bulk Status Change
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* 3. Complaint Management Tab with Sub-menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/tickets'))}>
            <span className="flex items-center gap-1 xl:gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
              <span>Complaints</span>
            </span>
            <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 opacity-70 shrink-0 ml-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-white p-1.5 shadow-lg border-line rounded-xl animate-in fade-in-50 zoom-in-95">
            <DropdownMenuItem>
              <Link href="/dashboard/tickets?status=PENDING" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                Pending Complaints
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/tickets" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                All Tickets & Support
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 4. Reports Tab with Sub-menu */}
        {canViewReports && (
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass(pathname.startsWith('/dashboard/reports'))}>
              <span className="flex items-center gap-1 xl:gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
                <span>Reports</span>
              </span>
              <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 opacity-70 shrink-0 ml-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-white p-1.5 shadow-lg border-line rounded-xl animate-in fade-in-50 zoom-in-95">
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
              {!isSalesExec && (
                <>
                  <DropdownMenuItem>
                    <Link href="/dashboard/reports?view=connectivity" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                      Connectivity Report Summary
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
                    <Link href="/dashboard/reports?view=billing" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                      Billing Report
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/reports?view=sales-incentive" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                      Incentive Disbursement Report (Sales)
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/reports?view=om-incentive" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                      Incentive Disbursement Report (O &amp; M)
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/reports?view=register" className="w-full text-xs font-semibold py-2 px-3 hover:bg-[var(--color-paper)] rounded-lg cursor-pointer">
                      Customer Register
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Admin Management if Authorized */}
        {canViewAdmin && (
          <Link href="/dashboard/admin" className={linkClass('/dashboard/admin')}>
            <span className="flex items-center gap-1 xl:gap-1.5">
              <Users className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--color-amber)] shrink-0" />
              <span>User Roles</span>
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
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Customers</p>
        <div className="space-y-0.5">
          <Link href="/dashboard/customers" className={linkClass('/dashboard/customers')}>
            <span className="flex items-center gap-1.5 font-semibold">
              <Search className="h-4 w-4 text-[var(--color-amber)]" />
              Customer Search
            </span>
          </Link>
        </div>
      </div>

      <div>
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">
          {canViewAssignedJobs ? 'Assigned Jobs' : 'Sales'}
        </p>
        <div className="space-y-0.5">
          {canViewAssignedJobs ? (
            <Link href="/dashboard/installer/jobs" className={linkClass('/dashboard/installer/jobs')}>
              Assigned Jobs
            </Link>
          ) : (
            <>
              {!isOMManager && (
                <Link href="/dashboard/customers/new" className={linkClass('/dashboard/customers/new')}>
                  Create Sale
                </Link>
              )}
              {canViewApproval && (
                <Link href="/dashboard/sales/pending" className={linkClass('/dashboard/sales/pending')}>
                  Manager Approval
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {canViewBilling && (
        <div>
          <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Billing & CPM</p>
          <div className="space-y-0.5">
            <Link href="/dashboard/billing-cpm?tab=package-status" className={linkClass('/dashboard/billing-cpm?tab=package-status')}>
              Package & Status Change
            </Link>
            <Link href="/dashboard/billing-cpm?tab=debit-credit" className={linkClass('/dashboard/billing-cpm?tab=debit-credit')}>
              Debit / Credit Notes
            </Link>
            <Link href="/dashboard/billing-cpm?tab=payments" className={linkClass('/dashboard/billing-cpm?tab=payments')}>
              Payment Entry & Approval
            </Link>
            <Link href="/dashboard/billing-cpm?tab=bulk-status" className={linkClass('/dashboard/billing-cpm?tab=bulk-status')}>
              Bulk Status Change
            </Link>
          </div>
        </div>
      )}

      <div>
        <p className="px-3 text-xs font-bold text-[var(--color-slate-custom)] uppercase tracking-wider mb-1">Complaint Management</p>
        <div className="space-y-0.5">
          <Link href="/dashboard/tickets?status=PENDING" className={linkClass('/dashboard/tickets?status=PENDING')}>
            Pending Complaints
          </Link>
          <Link href="/dashboard/tickets" className={linkClass('/dashboard/tickets')}>
            All Tickets & Support
          </Link>
        </div>
      </div>

      {canViewReports && (
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
            {!isSalesExec && (
              <>
                <Link href="/dashboard/reports?view=connectivity" className={linkClass('/dashboard/reports?view=connectivity')}>
                  Connectivity Report Summary
                </Link>
                <Link href="/dashboard/reports?view=adjustment" className={linkClass('/dashboard/reports?view=adjustment')}>
                  Adjustment Report
                </Link>
                <Link href="/dashboard/reports?view=payments" className={linkClass('/dashboard/reports?view=payments')}>
                  Payments Report
                </Link>
                <Link href="/dashboard/reports?view=billing" className={linkClass('/dashboard/reports?view=billing')}>
                  Billing Report
                </Link>
                <Link href="/dashboard/reports?view=sales-incentive" className={linkClass('/dashboard/reports?view=sales-incentive')}>
                  Incentive Disbursement Report (Sales)
                </Link>
                <Link href="/dashboard/reports?view=om-incentive" className={linkClass('/dashboard/reports?view=om-incentive')}>
                  Incentive Disbursement Report (O &amp; M)
                </Link>
                <Link href="/dashboard/reports?view=register" className={linkClass('/dashboard/reports?view=register')}>
                  Customer Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

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
