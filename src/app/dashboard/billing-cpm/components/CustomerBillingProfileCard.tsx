'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, ExternalLink, ChevronDown, ChevronUp, History } from 'lucide-react'

import { SectionHeader } from '@/components/ui/section-header'

type CustomerBillingData = {
  id: string
  customerCode: string
  crfNumber?: string | null
  fullName: string
  contactNumber: string
  email?: string | null
  cnic?: string | null
  customerType?: string | null
  address: string
  subArea?: string | null
  area?: string | null
  city: string
  status: string
  currentBalance: number
  totalInvoiced?: number
  totalPaid?: number
  packagePlan?: {
    systemSizeKw?: string
    packageTier?: string
    billingType?: string
    monitoringTime?: string
    totalAmount?: number
  } | null
  recentLedger?: {
    id: string
    date: string | Date
    refNumber?: string | null
    narration: string
    debit: number
    credit: number
    balance: number
  }[]
}

export function CustomerBillingProfileCard({ customer }: { customer: CustomerBillingData }) {
  const [showLedger, setShowLedger] = React.useState(false)

  if (!customer) return null

  const isDebtor = customer.currentBalance > 0
  const isCreditor = customer.currentBalance < 0

  return (
    <div className="space-y-4 transition-all animate-in fade-in-50">
      
      {/* 1. Header Summary Card (Navy Header matching Customer Profile) */}
      <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
        <SectionHeader
          leftAction={
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <User className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="font-mono text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                ID: {customer.customerCode}
              </Badge>
            </div>
          }
          action={
            <div className="flex items-center gap-2 shrink-0">
              <Badge 
                variant="outline"
                className={
                  customer.status === 'CONNECTION_ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-semibold px-2 py-0.5'
                    : 'bg-amber-100 text-amber-800 border-amber-300 text-xs font-semibold px-2 py-0.5'
                }
              >
                {customer.status?.replace(/_/g, ' ')}
              </Badge>
              <Link href={`/dashboard/customers/${customer.id}`} target="_blank">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs font-semibold border-slate-300 text-[#f26522] gap-1 cursor-pointer hover:bg-orange-50">
                  Full Profile <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          }
        >
          {customer.fullName}
        </SectionHeader>

        {/* 2. Customer Profile Details Grid (Matching Customer Profile & Ledger View) */}
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* Left Column: Personal Identification */}
            <div>
              <Table>
                <TableBody>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs w-36 bg-slate-50/70 border-r border-slate-200 text-[#002868]">Customer ID</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {customer.customerCode}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50/70 border-r border-slate-200 text-[#002868]">Customer Name</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-900">{customer.fullName}</TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50/70 border-r border-slate-200 text-[#002868]">Contact Number</TableCell>
                    <TableCell className="text-xs text-slate-900 font-medium font-mono">{customer.contactNumber}</TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50/70 border-r border-slate-200 text-[#002868]">Email</TableCell>
                    <TableCell className="text-xs text-slate-800">{customer.email || '—'}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50/70 border-r border-slate-200 text-[#002868]">CNIC #</TableCell>
                    <TableCell className="text-xs font-mono text-slate-800">{customer.cnic || '—'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Right Column: Financial Ledger Summary & Active Package */}
            <div>
              <Table>
                <TableBody>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs w-36 bg-slate-50/70 border-r border-slate-200 text-[#002868]">Current Balance</TableCell>
                    <TableCell className="text-xs font-mono font-bold">
                      <span className={isDebtor ? 'text-rose-600 font-extrabold text-sm' : isCreditor ? 'text-emerald-600 font-extrabold text-sm' : 'text-slate-700'}>
                        Rs. {Math.abs(customer.currentBalance).toLocaleString()} {isDebtor ? ' (Dr Payable)' : isCreditor ? ' (Cr Advance)' : ' (Cleared)'}
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50/70 border-r border-slate-200 text-[#002868]">Total Invoiced</TableCell>
                    <TableCell className="text-xs font-mono text-slate-800">
                      Rs. {(customer.totalInvoiced || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50/70 border-r border-slate-200 text-[#002868]">Total Received</TableCell>
                    <TableCell className="text-xs font-mono text-emerald-700 font-semibold">
                      Rs. {(customer.totalPaid || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50/70 border-r border-slate-200 text-[#002868]">Package Plan</TableCell>
                    <TableCell className="text-xs text-slate-800">
                      {customer.packagePlan ? (
                        <span className="font-semibold text-[#002868]">
                          {customer.packagePlan.packageTier} ({customer.packagePlan.systemSizeKw}) &bull; Rs. {(customer.packagePlan.totalAmount || 0).toLocaleString()} / {customer.packagePlan.billingType}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No package assigned</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

          </div>
        </CardContent>

        {/* 3. Collapsible Ledger Activity Section */}
        {customer.recentLedger && customer.recentLedger.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/50 p-2.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowLedger(!showLedger)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#002868] hover:text-amber-600 transition-colors cursor-pointer"
              >
                <History className="h-3.5 w-3.5" />
                <span>{showLedger ? 'Hide Recent Ledger Activity' : `View Recent Ledger Activity (${customer.recentLedger.length} entries)`}</span>
                {showLedger ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              <span className="text-[11px] text-slate-500 font-mono">
                Ledger Status: {isDebtor ? 'Outstanding Payable' : 'Up to date'}
              </span>
            </div>

            {showLedger && (
              <div className="mt-3 bg-white rounded-lg border border-slate-200 overflow-hidden animate-in fade-in-50">
                <Table>
                  <TableHeader className="bg-slate-100/80">
                    <TableRow>
                      <TableHead className="text-[11px] font-bold text-slate-700 py-2">Date</TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-700 py-2">Ref #</TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-700 py-2">Description</TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-700 text-right py-2">Debit (Rs.)</TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-700 text-right py-2">Credit (Rs.)</TableHead>
                      <TableHead className="text-[11px] font-bold text-slate-700 text-right py-2">Balance (Rs.)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.recentLedger.map((le, idx) => (
                      <TableRow key={le.id || idx} className="hover:bg-slate-50/80">
                        <TableCell className="text-xs font-mono text-slate-600 py-2">
                          {new Date(le.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-semibold text-slate-800 py-2">
                          {le.refNumber || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 py-2">
                          {le.narration}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-rose-600 font-semibold py-2">
                          {le.debit > 0 ? le.debit.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-emerald-600 font-semibold py-2">
                          {le.credit > 0 ? le.credit.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-right py-2 text-slate-900">
                          {le.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
