'use client'

import * as React from 'react'
import { PackageStatusChangeTab } from './components/PackageStatusChangeTab'
import { DebitCreditNoteTab } from './components/DebitCreditNoteTab'
import { PaymentEntryTab } from './components/PaymentEntryTab'
import { BulkStatusChangeTab } from './components/BulkStatusChangeTab'
import { useSearchParams } from 'next/navigation'
import { SectionHeader } from '@/components/ui/section-header'
import { CreditCard } from 'lucide-react'

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

  const getTabLabel = () => {
    switch (activeTab) {
      case 'package-status': return 'Package & Status Change'
      case 'debit-credit': return 'Debit / Credit Notes'
      case 'payments': return 'Payment Entry & Approval'
      case 'bulk-status': return 'Bulk Status Change'
      default: return 'Billing & CPM'
    }
  }

  return (
    <div className="space-y-6 animate-reveal">
      <SectionHeader>
        <span className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#F58220]" />
          {getTabLabel()}
        </span>
      </SectionHeader>

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
