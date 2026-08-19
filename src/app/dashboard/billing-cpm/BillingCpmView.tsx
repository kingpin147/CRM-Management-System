'use client'

import * as React from 'react'
import { PackageStatusChangeTab } from './components/PackageStatusChangeTab'
import { DebitCreditNoteTab } from './components/DebitCreditNoteTab'
import { PaymentEntryTab } from './components/PaymentEntryTab'
import { BulkStatusChangeTab } from './components/BulkStatusChangeTab'
import { FileText, CreditCard, Layers, Sliders } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const router = useRouter()

  const initialTab = searchParams.get('tab') || 'package-status'
  const [activeTab, setActiveTab] = React.useState(initialTab)

  React.useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    router.push(`/dashboard/billing-cpm?tab=${tabId}`, { scroll: false })
  }

  const tabs = [
    {
      id: 'package-status',
      label: 'Package & Status Change',
      icon: Sliders,
      count: null,
    },
    {
      id: 'debit-credit',
      label: 'Debit / Credit Notes',
      icon: FileText,
      count: unpostedNotes.length > 0 ? unpostedNotes.length : null,
      countBg: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'payments',
      label: 'Payment Entry & Approval',
      icon: CreditCard,
      count: unpostedPayments.length > 0 ? unpostedPayments.length : null,
      countBg: 'bg-emerald-100 text-emerald-900',
    },
    {
      id: 'bulk-status',
      label: 'Bulk Status Change',
      icon: Layers,
      count: null,
    },
  ]

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

      {/* Tabs Navigation Bar */}
      <div className="flex space-x-2 border-b border-line overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs lg:text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[var(--color-amber)] text-[var(--color-graphite)] bg-white shadow-xs font-bold'
                  : 'border-transparent text-[var(--color-slate-custom)] hover:text-[var(--color-ink)] hover:bg-black/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--color-amber)]' : 'text-[var(--color-slate-custom)]'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold font-mono ${tab.countBg}`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
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
