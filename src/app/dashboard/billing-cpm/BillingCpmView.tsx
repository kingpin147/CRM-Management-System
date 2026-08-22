'use client'

import * as React from 'react'
import { PackageStatusChangeTab } from './components/PackageStatusChangeTab'
import { DebitCreditNoteTab } from './components/DebitCreditNoteTab'
import { PaymentEntryTab } from './components/PaymentEntryTab'
import { BulkStatusChangeTab } from './components/BulkStatusChangeTab'
import { useSearchParams } from 'next/navigation'

interface BillingCpmViewProps {
  unpostedNotes: any[]
  unpostedPayments: any[]
  users: { id: string; fullName: string }[]
}

export function BillingCpmView({
  unpostedNotes,
  unpostedPayments,
  users
}: BillingCpmViewProps) {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'package-status'

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
            Billing & CPM
          </h1>
          <p className="text-xs text-[var(--color-slate-custom)] mt-0.5">
            Billing System & Change Process Management — Package upgrades, manual debit/credit adjustments, payment verification, and bulk status updates.
          </p>
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="pt-1">
        {activeTab === 'package-status' && (
          <PackageStatusChangeTab />
        )}

        {activeTab === 'debit-credit' && (
          <DebitCreditNoteTab unpostedNotes={unpostedNotes} users={users} />
        )}

        {activeTab === 'payments' && (
          <PaymentEntryTab unpostedPayments={unpostedPayments} users={users} />
        )}

        {activeTab === 'bulk-status' && (
          <BulkStatusChangeTab />
        )}
      </div>

    </div>
  )
}
