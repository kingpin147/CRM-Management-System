'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, Clock, Receipt, Wrench, Search, Layers, ArrowRight, UserCheck, Edit3, FileText } from 'lucide-react'
import { EditCrfModal } from './components/EditCrfModal'

type CustomerRecord = {
  id: string
  customerCode: string
  crfNumber: string | null
  fullName: string
  cnic: string
  contactNumber: string
  email?: string | null
  address?: string | null
  block?: string | null
  area?: string | null
  city: string
  status: string
  signupDate: string | Date | null
  assignedInstallerId?: string | null
  assignedInstaller?: { id: string; fullName: string } | null
  packagePlan: {
    packageTier?: string | null
    systemSizeKw?: string | null
    billingType?: string | null
    monitoringTime?: string | null
    totalAmount?: number | string | null
  } | null
  solarSystem: any | null
}

interface ManagerApprovalViewProps {
  customers: CustomerRecord[]
  installers?: Array<{ id: string; fullName: string; role: string; email: string }>
  userRole: string
  onAdvanceWorkflow: (formData: FormData) => Promise<void>
  onUpdateCrfWorkflow?: (formData: FormData) => Promise<void>
}

function formatCustomerId(code?: string | null): string {
  if (!code) return ''
  const digits = code.replace(/\D/g, '')
  return digits || code.replace(/^[A-Za-z]+-/, '')
}

function formatCrfNumber(crf?: string | null, code?: string | null): string {
  if (crf && crf.trim()) {
    return crf.startsWith('CRF-') ? crf : `CRF-${crf.replace(/^CRF/i, '').replace(/^-+/, '')}`
  }
  if (code) {
    const digits = code.replace(/\D/g, '')
    if (digits) return `CRF-${digits}`
  }
  return '—'
}

export function ManagerApprovalView({
  customers,
  installers,
  userRole,
  onAdvanceWorkflow,
  onUpdateCrfWorkflow,
}: ManagerApprovalViewProps) {
  const [editingCustomer, setEditingCustomer] = React.useState<CustomerRecord | null>(null)
  // Determine initial stage based on logged in user role
  const roleUpper = (userRole || '').toUpperCase()
  const isSales = roleUpper === 'SALES_MANAGER' || roleUpper === 'SALES'
  const isBilling = roleUpper === 'BILLING_MANAGER'
  const isOM = roleUpper === 'OM_MANAGER' || roleUpper === 'INSTALLATION'
  const isSpecificRole = isSales || isBilling || isOM

  const getInitialStage = (): 'ALL' | 'STAGE_1' | 'STAGE_2' | 'STAGE_3' => {
    if (isSales) return 'STAGE_1'
    if (isBilling) return 'STAGE_2'
    if (isOM) return 'STAGE_3'
    // Default to ALL for Admins, Super Admins, and General Managers
    return 'ALL'
  }

  const [selectedStage, setSelectedStage] = React.useState<'ALL' | 'STAGE_1' | 'STAGE_2' | 'STAGE_3'>(getInitialStage())
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSubmittingId, setIsSubmittingId] = React.useState<string | null>(null)

  const stage1Customers = React.useMemo(() => customers.filter(c => c.status === 'SIGNUP_GENERATED'), [customers])
  const stage2Customers = React.useMemo(() => customers.filter(c => c.status === 'PENDING_PAYMENT_VERIFICATION'), [customers])
  const stage3Customers = React.useMemo(() => customers.filter(c => c.status === 'PENDING_ACTIVATION'), [customers])

  const filteredCustomers = React.useMemo(() => {
    let list: CustomerRecord[] = []
    if (selectedStage === 'STAGE_1') list = stage1Customers
    else if (selectedStage === 'STAGE_2') list = stage2Customers
    else if (selectedStage === 'STAGE_3') list = stage3Customers
    else list = customers

    if (!searchQuery.trim()) return list

    const q = searchQuery.toLowerCase().trim()
    return list.filter(c => 
      c.fullName?.toLowerCase().includes(q) ||
      c.customerCode?.toLowerCase().includes(q) ||
      formatCustomerId(c.customerCode).includes(q) ||
      c.crfNumber?.toLowerCase().includes(q) ||
      formatCrfNumber(c.crfNumber, c.customerCode).toLowerCase().includes(q) ||
      c.contactNumber?.toLowerCase().includes(q) ||
      c.cnic?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    )
  }, [customers, selectedStage, searchQuery, stage1Customers, stage2Customers, stage3Customers])

  const handleAdvance = async (e: React.FormEvent<HTMLFormElement>, customerId: string) => {
    e.preventDefault()
    setIsSubmittingId(customerId)
    const formData = new FormData(e.currentTarget)
    try {
      await onAdvanceWorkflow(formData)
    } finally {
      setIsSubmittingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
            Manager Approval Pipeline
          </h1>
          <p className="text-[var(--color-slate-custom)] mt-1 text-sm">
            Review, approve, and advance customer accounts across Sales Manager, Billing Manager, and O&M Manager stages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] px-3 py-1 text-xs font-semibold shadow-xs">
            Logged in Role: {userRole}
          </Badge>
        </div>
      </div>

      {/* 3-Stage Pipeline Cards (Interactive Filter Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1: Sales Manager Approval Card */}
        {(!isSpecificRole || isSales) && (
        <Card 
          onClick={() => setSelectedStage(selectedStage === 'STAGE_1' ? (isSales ? 'STAGE_1' : 'ALL') : 'STAGE_1')}
          className={`cursor-pointer transition-all duration-200 border-2 ${
            selectedStage === 'STAGE_1' 
              ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/30' 
              : 'border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/60 hover:border-amber-400'
          }`}
        >
          <CardContent className="p-4.5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                Stage 1: Pending on Sales
              </div>
              <p className="text-xs text-amber-800/80">Sign Up Created → Pending Sales Manager Approval</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-amber-950 font-mono">{stage1Customers.length}</span>
                <span className="text-xs font-semibold text-amber-800">Pending Approvals</span>
              </div>
            </div>
            {selectedStage === 'STAGE_1' && (
              <Badge className="bg-amber-600 text-white text-[11px] font-bold">Active View</Badge>
            )}
          </CardContent>
        </Card>
        )}

        {/* Stage 2: Billing Manager Payment Verification Card */}
        {(!isSpecificRole || isBilling || isSales) && (
        <Card 
          onClick={() => setSelectedStage(selectedStage === 'STAGE_2' ? (isSales ? 'STAGE_2' : 'ALL') : 'STAGE_2')}
          className={`cursor-pointer transition-all duration-200 border-2 ${
            selectedStage === 'STAGE_2' 
              ? 'border-blue-500 bg-blue-50/80 shadow-md ring-2 ring-blue-400/30' 
              : 'border-blue-200/70 bg-blue-50/30 hover:bg-blue-50/60 hover:border-blue-400'
          }`}
        >
          <CardContent className="p-4.5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Receipt className="h-4 w-4 text-blue-600" />
                Stage 2: Pending for Payment Verification
              </div>
              <p className="text-xs text-blue-800/80">Sales Manager Approved → Pending Billing Manager Verification</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-blue-950 font-mono">{stage2Customers.length}</span>
                <span className="text-xs font-semibold text-blue-800">Pending Verifications</span>
              </div>
            </div>
            {selectedStage === 'STAGE_2' && (
              <Badge className="bg-blue-600 text-white text-[11px] font-bold">Active View</Badge>
            )}
          </CardContent>
        </Card>
        )}

        {/* Stage 3: O&M Manager Approval Card */}
        {(!isSpecificRole || isOM) && (
        <Card 
          onClick={() => setSelectedStage(selectedStage === 'STAGE_3' ? 'ALL' : 'STAGE_3')}
          className={`cursor-pointer transition-all duration-200 border-2 ${
            selectedStage === 'STAGE_3' 
              ? 'border-[#002868] bg-sky-50/80 shadow-md ring-2 ring-[#002868]/30' 
              : 'border-sky-200/70 bg-sky-50/30 hover:bg-sky-50/60 hover:border-[#002868]/60'
          }`}
        >
          <CardContent className="p-4.5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#002868] font-bold text-sm">
                <Wrench className="h-4 w-4 text-[#002868]" />
                Stage 3: Pending for O&M
              </div>
              <p className="text-xs text-sky-800/80">Payment Verified → Pending O&M Manager Approval</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-[#002868] font-mono">{stage3Customers.length}</span>
                <span className="text-xs font-semibold text-[#002868]">Pending Approvals</span>
              </div>
            </div>
            {selectedStage === 'STAGE_3' && (
              <Badge className="bg-[#002868] text-white text-[11px] font-bold">Active View</Badge>
            )}
          </CardContent>
        </Card>
        )}
      </div>

      {/* Pipeline Table with Filter Tabs & Search */}
      <Card className="shadow-sm border-line bg-white">
        <CardHeader className="py-4 border-b border-line">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {!isSpecificRole && (
              <button
                type="button"
                onClick={() => setSelectedStage('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStage === 'ALL'
                    ? 'bg-[#002868] text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Stages ({customers.length})
              </button>
              )}

              {(!isSpecificRole || isSales) && (
              <button
                type="button"
                onClick={() => setSelectedStage('STAGE_1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStage === 'STAGE_1'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Sales Manager List ({stage1Customers.length})
              </button>
              )}

              {(!isSpecificRole || isBilling || isSales) && (
              <button
                type="button"
                onClick={() => setSelectedStage('STAGE_2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStage === 'STAGE_2'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                Payment Verification ({stage2Customers.length})
              </button>
              )}

              {(!isSpecificRole || isOM) && (
              <button
                type="button"
                onClick={() => setSelectedStage('STAGE_3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStage === 'STAGE_3'
                    ? 'bg-[#002868] text-white shadow-xs font-bold'
                    : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
                }`}
              >
                O&M Manager List ({stage3Customers.length})
              </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search name, CRF, CNIC, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 border-line"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="font-bold text-xs text-[#002868]">Customer ID</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">CRF #</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Customer Name</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">System / Package</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Contact & City</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Current Stage</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Responsible Dept</TableHead>
                <TableHead className="text-right font-bold text-xs text-[#002868]">Workflow Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-xs text-slate-500">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-700">No customers found in this approval queue.</p>
                      <p className="text-[11px] text-slate-400">All pending accounts have been reviewed or match no search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => {
                  const isStage1 = c.status === 'SIGNUP_GENERATED'
                  const isStage2 = c.status === 'PENDING_PAYMENT_VERIFICATION'
                  const isStage3 = c.status === 'PENDING_ACTIVATION'
                  const isSubmitting = isSubmittingId === c.id

                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/80 border-b text-xs">
                      {/* Column 1: Customer ID (Digits Only) */}
                      <TableCell className="font-mono text-xs font-bold text-[#002868]">
                        <Link href={`/dashboard/customers/${c.id}`} className="hover:underline font-bold text-[#002868]">
                          {formatCustomerId(c.customerCode || c.id)}
                        </Link>
                      </TableCell>

                      {/* Column 2: CRF # */}
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">
                        {formatCrfNumber(c.crfNumber, c.customerCode)}
                      </TableCell>

                      {/* Column 3: Customer Name & CNIC */}
                      <TableCell className="font-medium text-xs text-[var(--color-ink)]">
                        <Link href={`/dashboard/customers/${c.id}`} className="hover:underline font-bold text-slate-900 block">
                          {c.fullName}
                        </Link>
                        <span className="text-[11px] text-slate-500 font-mono">{c.cnic}</span>
                      </TableCell>

                      {/* System & Package Tier */}
                      <TableCell className="text-xs">
                        <span className="font-bold text-slate-800">{c.packagePlan?.packageTier || 'Comprehensive'}</span>
                        <span className="block text-[11px] text-slate-500">{c.packagePlan?.systemSizeKw || '1-10 kW'}</span>
                      </TableCell>

                      {/* Contact & City */}
                      <TableCell className="text-xs">
                        <span className="font-mono text-slate-700">{c.contactNumber}</span>
                        <span className="block text-[11px] text-slate-500 font-medium">{c.city}</span>
                      </TableCell>

                      {/* Current Stage Badge */}
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline"
                          className={
                            isStage1 ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold' :
                            isStage2 ? 'bg-blue-100 text-blue-950 border-blue-300 font-bold' :
                            'bg-sky-100 text-sky-950 border-sky-300 font-bold'
                          }
                        >
                          {isStage1 ? 'Pending on Sales' : isStage2 ? 'Pending for Payment Verification' : 'Pending for O&M'}
                        </Badge>
                      </TableCell>

                      {/* Responsible Department & Assigned Technician */}
                      <TableCell className="text-xs">
                        <span className="font-semibold text-slate-800 block">
                          {isStage1 ? 'Sales Manager' : isStage2 ? 'Billing Manager' : 'O&M Manager'}
                        </span>
                        {c.assignedInstaller && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-medium mt-0.5">
                            Assigned: {c.assignedInstaller.fullName}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Workflow Action Buttons (Edit CRF + Approval) */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1. Edit / Check CRF Form Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCustomer(c)}
                            className="text-xs border-slate-300 text-slate-700 font-semibold gap-1 hover:bg-slate-100 shadow-2xs cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-amber-600" />
                            Check & Edit CRF
                          </Button>

                          {/* 2. Direct Stage Approval Button */}
                          <form onSubmit={(e) => handleAdvance(e, c.id)} className="inline-block">
                            <input type="hidden" name="customerId" value={c.id} />
                            <input type="hidden" name="currentStatus" value={c.status} />
                            <Button 
                              type="submit" 
                              size="sm" 
                              disabled={isSubmitting}
                              className={
                                isStage1 ? 'bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shadow-xs font-bold cursor-pointer' :
                                isStage2 ? 'bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs font-bold cursor-pointer' :
                                'bg-[#002868] hover:bg-[#001d4a] text-white text-xs gap-1.5 shadow-xs font-bold cursor-pointer'
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {isSubmitting 
                                ? 'Advancing...' 
                                : isStage1 ? 'Sales Manager Approval' 
                                : isStage2 ? 'Payment Verified' 
                                : 'O&M Manager Approval'}
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit CRF Modal for Managers */}
      {editingCustomer && onUpdateCrfWorkflow && (
        <EditCrfModal
          customer={editingCustomer}
          installers={installers}
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSaveCrf={onUpdateCrfWorkflow}
        />
      )}
    </div>
  )
}
