'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Wrench, CheckCircle2, Eye, Sun, RotateCcw, ShieldCheck, MapPin, Sparkles, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { InstallerAuditModal } from './InstallerAuditModal'
import { activateIpNocConnection, assignInstallerToAudit } from './actions'
import { useRouter } from 'next/navigation'
import { SectionHeader } from '@/components/ui/section-header'
import { formatDate, calculateNextAuditDate, getAuditFrequencyLabel } from '@/lib/utils'

interface InstallerJobsViewProps {
  customers: any[]
  installers?: any[]
  currentUserId: string
  currentUserName: string
  userRole: string
}

export function InstallerJobsView({
  customers,
  installers = [],
  currentUserId,
  currentUserName,
  userRole,
}: InstallerJobsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialViewParam = searchParams.get('view')

  // Top View Mode: 'new-jobs' (New Signups Queue) vs 'audits' (Recurring System Audits Queue)
  const [viewMode, setViewMode] = React.useState<'new-jobs' | 'audits'>(() => {
    if (initialViewParam === 'new-jobs' || initialViewParam === 'jobs') return 'new-jobs'
    return 'audits'
  })

  // Sync if URL query param changes
  React.useEffect(() => {
    const v = searchParams.get('view')
    if (v === 'new-jobs' || v === 'jobs') {
      setViewMode('new-jobs')
    } else if (v === 'audits') {
      setViewMode('audits')
    }
  }, [searchParams])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCustomer, setSelectedCustomer] = React.useState<any | null>(null)
  const [modalInitialTab, setModalInitialTab] = React.useState<'specs' | 'audit'>('specs')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [filterTab, setFilterTab] = React.useState<'ALL' | 'PENDING' | 'COMPLETED' | 'ON_DEMAND'>('ALL')
  const [isActivatingId, setIsActivatingId] = React.useState<string | null>(null)
  const [assigningCustomerId, setAssigningCustomerId] = React.useState<string | null>(null)

  const isIPNOC = userRole === 'IP_NOC_EXECUTIVE'
  const isOMManager = userRole === 'OM_MANAGER' || (userRole || '').toUpperCase().includes('OM')
  const isInstaller = userRole === 'INSTALLATION' || userRole === 'INSTALLER'
  const isSales = userRole === 'SALES'
  const canAssign = isOMManager || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'MANAGER'

  // Partition Customers into:
  // 1. New Signups (Job Queue): Pending initial onboarding & setup
  // 2. Active Installations (System Audits): For continuous / recurring audits
  const isNewSignup = (c: any) => {
    return c.status === 'SIGNUP_GENERATED' || 
           c.status === 'PENDING_PAYMENT_VERIFICATION' || 
           c.status === 'PENDING_INSTALLER_AUDIT' || 
           c.status === 'PENDING_ACTIVATION' || 
           c.status === 'PENDING_IP_NOC' ||
           (!c.solarSystem?.lastAuditDate && c.status !== 'CONNECTION_ACTIVE')
  }

  const newSignupCustomers = React.useMemo(() => {
    return customers.filter(isNewSignup)
  }, [customers])

  const systemAuditCustomers = React.useMemo(() => {
    return customers.filter((c: any) => !isNewSignup(c) || c.status === 'CONNECTION_ACTIVE' || Boolean(c.solarSystem?.lastAuditDate) || (c.systemAudits && c.systemAudits.length > 0))
  }, [customers])

  // Customers for current view mode
  const currentBaseList = viewMode === 'new-jobs' ? newSignupCustomers : systemAuditCustomers

  const filteredCustomers = React.useMemo(() => {
    let baseList = currentBaseList

    if (isInstaller) {
      // Installers only see jobs assigned to them
      baseList = baseList.filter((c: any) => 
        c.assignedInstallerId === currentUserId ||
        c.status === 'PENDING_INSTALLER_AUDIT' || 
        c.systemAudits?.some((sa: any) => sa.status === 'PENDING' && sa.assignedInstallerId === currentUserId)
      )
    } else if (filterTab === 'PENDING') {
      if (viewMode === 'new-jobs') {
        baseList = baseList.filter((c: any) => c.status === 'PENDING_INSTALLER_AUDIT' || c.status === 'PENDING_IP_NOC' || !c.solarSystem?.lastAuditDate)
      } else {
        baseList = baseList.filter((c: any) => c.status === 'PENDING_INSTALLER_AUDIT' || c.systemAudits?.some((sa: any) => sa.status === 'PENDING') || !c.solarSystem?.lastAuditDate)
      }
    } else if (filterTab === 'COMPLETED') {
      if (viewMode === 'new-jobs') {
        baseList = baseList.filter((c: any) => c.status === 'CONNECTION_ACTIVE' || Boolean(c.solarSystem?.lastAuditDate))
      } else {
        baseList = baseList.filter((c: any) => Boolean(c.solarSystem?.lastAuditDate) || c.systemAudits?.some((sa: any) => sa.status === 'COMPLETED'))
      }
    } else if (filterTab === 'ON_DEMAND') {
      baseList = baseList.filter((c: any) => 
        c.systemAudits?.some((sa: any) => sa.auditType === 'ON_DEMAND') || 
        c.tickets?.some((t: any) => t.fault?.includes('Audit') || t.category?.includes('Audit'))
      )
    }

    if (!searchQuery.trim()) return baseList

    const q = searchQuery.toLowerCase().trim()
    return baseList.filter((c: any) =>
      c.fullName?.toLowerCase().includes(q) ||
      c.customerCode?.toLowerCase().includes(q) ||
      c.crfNumber?.toLowerCase().includes(q) ||
      c.contactNumber?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.assignedInstaller?.fullName?.toLowerCase().includes(q) ||
      c.solarSystem?.installerName?.toLowerCase().includes(q)
    )
  }, [currentBaseList, viewMode, searchQuery, isInstaller, filterTab, currentUserId])

  // Dynamic KPI counts for current view mode
  const newJobsPendingCount = newSignupCustomers.filter((c: any) => c.status === 'PENDING_INSTALLER_AUDIT' || c.status === 'PENDING_IP_NOC' || !c.solarSystem?.lastAuditDate).length
  const newJobsTotalCount = newSignupCustomers.length

  const auditPendingCount = systemAuditCustomers.filter((c: any) => c.systemAudits?.some((sa: any) => sa.status === 'PENDING') || c.status === 'PENDING_INSTALLER_AUDIT' || !c.solarSystem?.lastAuditDate).length
  const auditCompletedCount = systemAuditCustomers.filter((c: any) => Boolean(c.solarSystem?.lastAuditDate) || c.systemAudits?.some((sa: any) => sa.status === 'COMPLETED')).length
  const auditOnDemandCount = systemAuditCustomers.filter((c: any) => c.systemAudits?.some((sa: any) => sa.auditType === 'ON_DEMAND')).length

  const handleAssignInstaller = async (customerId: string, installerId: string, auditId?: string) => {
    if (!installerId) return
    setAssigningCustomerId(customerId)
    try {
      const fd = new FormData()
      fd.append('customerId', customerId)
      fd.append('installerId', installerId)
      if (auditId) fd.append('auditId', auditId)
      await assignInstallerToAudit(fd)
      router.refresh()
    } catch (err) {
      console.error('Failed to assign installer:', err)
    } finally {
      setAssigningCustomerId(null)
    }
  }

  const openJobCard = (c: any) => {
    setSelectedCustomer(c)
    setModalInitialTab('specs')
    setIsModalOpen(true)
  }

  const openSystemAudit = (c: any) => {
    setSelectedCustomer(c)
    setModalInitialTab('audit')
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Main Navigation Mode Selector (New Signups Job Queue vs Recurring System Audits) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#002868] tracking-tight">
                {viewMode === 'new-jobs' ? 'Assigned Jobs Queue (New Signups)' : 'System Audits Queue (Recurring & Routine)'}
              </h1>
              <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
                {viewMode === 'new-jobs' ? '⚡ New Onboarding' : '🛡️ Routine & Periodic'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {viewMode === 'new-jobs'
                ? 'Job Queue is strictly for new customer sign-ups: Fill Hardware Specs (Part 2), Initial Audit (Part 3), and Activate IP NOC.'
                : 'System Audits are due repeatedly over the customer lifecycle (Quarterly, Half-Yearly, Yearly) or requested On-Demand.'}
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setViewMode('new-jobs')
                setFilterTab('ALL')
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'new-jobs'
                  ? 'bg-[#135d86] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Assigned Jobs (New Signups)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                {newJobsTotalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('audits')
                setFilterTab('ALL')
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'audits'
                  ? 'bg-[#135d86] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              <span>System Audits (Recurring)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                {systemAuditCustomers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards for Current View Mode */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {viewMode === 'new-jobs' ? (
            <>
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-amber-800">New Signups Total</p>
                <p className="text-xl font-bold font-mono text-amber-950 mt-0.5">{newJobsTotalCount}</p>
              </div>
              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-sky-800">Pending Initial Setup</p>
                <p className="text-xl font-bold font-mono text-sky-950 mt-0.5">{newJobsPendingCount}</p>
              </div>
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-indigo-800">Pending IP NOC</p>
                <p className="text-xl font-bold font-mono text-indigo-950 mt-0.5">
                  {newSignupCustomers.filter((c: any) => c.status === 'PENDING_IP_NOC').length}
                </p>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-emerald-800">Ready to Activate</p>
                <p className="text-xl font-bold font-mono text-emerald-950 mt-0.5">
                  {newSignupCustomers.filter((c: any) => c.status === 'PENDING_ACTIVATION' || c.status === 'PENDING_IP_NOC').length}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-slate-700">Total Active Systems</p>
                <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{systemAuditCustomers.length}</p>
              </div>
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-amber-800">Audits Due / Pending</p>
                <p className="text-xl font-bold font-mono text-amber-950 mt-0.5">{auditPendingCount}</p>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-emerald-800">Completed Audits</p>
                <p className="text-xl font-bold font-mono text-emerald-950 mt-0.5">{auditCompletedCount}</p>
              </div>
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-blue-800">On-Demand Requests</p>
                <p className="text-xl font-bold font-mono text-blue-950 mt-0.5">{auditOnDemandCount}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-line bg-white overflow-hidden">
        <CardHeader className="py-4 bg-slate-50/70 border-b border-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-bold text-[#002868] flex items-center gap-2">
                {viewMode === 'new-jobs' ? <Sparkles className="h-4 w-4 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-amber-500" />}
                {viewMode === 'new-jobs' ? 'Assigned Jobs (New Signups)' : 'Recurring System Audits Queue'} ({filteredCustomers.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {viewMode === 'new-jobs'
                  ? 'Click "Job Card" to fill hardware specifications (Part 2) and complete initial setup.'
                  : 'Click "System Audit" to conduct recurring 7-point inspections for ongoing solar installations.'}
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            {!isInstaller && (
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterTab('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({currentBaseList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('PENDING')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterTab === 'PENDING' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({viewMode === 'new-jobs' ? newJobsPendingCount : auditPendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('COMPLETED')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterTab === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Completed ({viewMode === 'new-jobs' ? (newJobsTotalCount - newJobsPendingCount) : auditCompletedCount})
                </button>
                {viewMode === 'audits' && auditOnDemandCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterTab('ON_DEMAND')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      filterTab === 'ON_DEMAND' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    On-Demand ({auditOnDemandCount})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, CRF, name, city, area..."
              className="pl-9 h-9 text-xs bg-white border-slate-300"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/90 border-b border-slate-200">
              <TableRow>
                <TableHead className="font-bold text-xs text-[#002868] border-r w-24">Customer ID</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] border-r w-28">CRF #</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] border-r">Customer Details</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] border-r">System Specs &amp; Tier</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] border-r">Address / Installation Site</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] border-r text-center">Audit Status &amp; Schedule</TableHead>
                <TableHead className="text-right font-bold text-xs text-[#002868] w-64">Job Card &amp; Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-500">
                    No customers found in this queue matching your search or filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c: any) => {
                  const hasAuditCompleted = Boolean(c.solarSystem?.lastAuditDate) || c.systemAudits?.some((sa: any) => sa.status === 'COMPLETED')
                  const customerIdDisplay = c.customerCode?.replace(/\D/g, '') || c.customerCode || c.id
                  const crfDisplay = c.crfNumber || (c.customerCode ? `CRF-${c.customerCode.replace(/\D/g, '')}` : '—')

                  const onDemandAudit = c.systemAudits?.find((sa: any) => sa.auditType === 'ON_DEMAND')
                  const pendingAudit = c.systemAudits?.find((sa: any) => sa.status === 'PENDING')

                  const addressParts = [
                    c.houseNumber ? `House ${c.houseNumber}` : '',
                    c.streetNumber ? `Street ${c.streetNumber}` : '',
                    c.block ? `Block ${c.block}` : '',
                    c.subArea || '',
                    c.area || '',
                    c.city || ''
                  ].filter(Boolean).join(', ')

                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50 border-b text-xs">
                      {/* Customer ID */}
                      <TableCell className="font-mono font-bold text-slate-900 border-r">
                        {customerIdDisplay}
                      </TableCell>

                      {/* CRF # */}
                      <TableCell className="font-mono text-amber-700 font-semibold border-r">
                        {crfDisplay}
                      </TableCell>

                      {/* Customer Details & Assigned Installer */}
                      <TableCell className="border-r">
                        <span className="font-bold text-slate-900 block">{c.fullName}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">{c.contactNumber}</span>
                        
                        {!isInstaller && (
                          <div className="mt-1.5 space-y-1">
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-slate-500 font-medium">Assigned:</span>
                              <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                                {c.assignedInstaller?.fullName || c.solarSystem?.installerName || 'Unassigned'}
                              </span>
                            </div>

                            {canAssign && (
                              <div className="pt-0.5">
                                <select
                                  disabled={assigningCustomerId === c.id}
                                  value={c.assignedInstallerId || ''}
                                  onChange={(e) => handleAssignInstaller(c.id, e.target.value, pendingAudit?.id)}
                                  className="text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 rounded px-1.5 py-0.5 shadow-2xs hover:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer w-full max-w-[170px]"
                                >
                                  <option value="">-- Assign Installer --</option>
                                  {installers.map((inst: any) => (
                                    <option key={inst.id} value={inst.id}>
                                      {inst.fullName} {inst.role === 'INSTALLATION' ? '(Installer)' : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* System Specs & Tier */}
                      <TableCell className="border-r">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#002868] text-xs">
                              {c.solarSystem?.inverterBrand || 'Inverter'}: {c.solarSystem?.inverterSize || c.packagePlan?.systemSizeKw || '—'}
                            </span>
                            {c.solarSystem?.inverterType && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-slate-50 text-slate-600 border-slate-200">
                                {c.solarSystem.inverterType}
                              </Badge>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap font-medium">
                            <span>Tier: <strong className="text-slate-800">{c.packagePlan?.packageTier || 'Moderate'}</strong></span>
                            {c.solarSystem?.meterPhase && (
                              <span className="text-[10px] text-slate-500 font-mono">({c.solarSystem.meterPhase})</span>
                            )}
                          </div>

                          {c.solarSystem?.disco && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              <span>DISCO: {c.solarSystem.disco}</span>
                              {c.solarSystem.discoRefNo && <span> (#{c.solarSystem.discoRefNo})</span>}
                            </div>
                          )}

                          <div className="mt-1">
                            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[9.5px]">
                              {getAuditFrequencyLabel(c.packagePlan?.packageTier)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      {/* Address / Installation Site */}
                      <TableCell className="border-r">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-900 font-bold">
                            <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>{c.city || '—'} {c.area ? `(${c.area})` : ''}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                            {addressParts || c.address || 'Address pending'}
                          </p>
                          <div className="pt-0.5">
                            <a
                              href={
                                c.coordinates?.trim()
                                  ? (c.coordinates.startsWith('http')
                                      ? c.coordinates
                                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.coordinates)}`)
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.address || ''}, ${c.city || ''}, Pakistan`)}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 transition-colors cursor-pointer w-fit shadow-2xs"
                              title="Open exact site pin in Google Maps"
                            >
                              <MapPin className="h-2.5 w-2.5 text-amber-600" />
                              <span>{c.coordinates ? '📍 GPS Map Pin' : '📍 Open Site Map'}</span>
                            </a>
                          </div>
                        </div>
                      </TableCell>

                      {/* Audit Status & Schedule */}
                      <TableCell className="border-r text-center">
                        <div className="space-y-1 inline-flex flex-col items-center">
                          {onDemandAudit && onDemandAudit.status === 'PENDING' ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-400 font-bold text-[10px] shadow-2xs">
                              ⚡ On-Demand Request
                            </Badge>
                          ) : hasAuditCompleted ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Audit Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold text-[11px]">
                              Audit Pending
                            </Badge>
                          )}

                          <div className="text-[10px] text-slate-500 font-medium">
                            <span>Next Audit: </span>
                            <span className="font-mono font-bold text-slate-800">
                              {formatDate(
                                calculateNextAuditDate(
                                  c.solarSystem?.lastAuditDate || c.activationDate || c.signupDate,
                                  c.packagePlan?.packageTier
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Job Card & Actions Column */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/dashboard/customers/${c.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold gap-1 px-2"
                                title="View Customer Profile"
                              >
                                <Eye className="h-3 w-3 text-slate-600" />
                                View
                              </Button>
                            </Link>

                            {/* Job Card Button */}
                            <Button
                              size="sm"
                              onClick={() => openJobCard(c)}
                              className="h-7 bg-[#135d86] hover:bg-[#002868] text-white font-bold text-xs gap-1 shadow-2xs cursor-pointer px-2.5"
                              title="Open Job Card (Hardware Specs Part 2)"
                            >
                              <Sun className="h-3 w-3 text-amber-400" />
                              Job Card
                            </Button>
                          </div>

                          {/* Dedicated System Audit Link / Button under Job Card */}
                          <button
                            type="button"
                            onClick={() => openSystemAudit(c)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 hover:border-amber-400 transition-all cursor-pointer shadow-2xs group"
                            title="Conduct or Review 7-Point System Audit (Part 3)"
                          >
                            <ShieldCheck className="h-3 w-3 text-amber-600 group-hover:text-amber-700" />
                            <span>System Audit (Part 3) →</span>
                          </button>

                          {/* IP NOC Process to Activate Action */}
                          {(c.status === 'PENDING_IP_NOC' || isIPNOC) && c.status !== 'CONNECTION_ACTIVE' && (
                            <Button
                              size="sm"
                              disabled={isActivatingId === c.id}
                              onClick={async () => {
                                setIsActivatingId(c.id)
                                try {
                                  const fd = new FormData()
                                  fd.append('customerId', c.id)
                                  fd.append('ipNocUser', currentUserName)
                                  await activateIpNocConnection(fd)
                                  router.refresh()
                                } finally {
                                  setIsActivatingId(null)
                                }
                              }}
                              className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] gap-1 shadow-xs cursor-pointer px-2"
                              title="Process to Activate in CRM"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {isActivatingId === c.id ? 'Activating...' : 'Activate Connection'}
                            </Button>
                          )}
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

      {/* Interactive Specs / Audit Modal */}
      {selectedCustomer && (
        <InstallerAuditModal
          customer={selectedCustomer}
          installerName={currentUserName}
          isOpen={isModalOpen}
          initialTab={modalInitialTab}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCustomer(null)
          }}
          onSuccess={() => {
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
