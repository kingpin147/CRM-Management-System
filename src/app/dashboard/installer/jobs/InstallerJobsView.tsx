'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Wrench, CheckCircle2, Eye, Sun, RotateCcw, Download, ShieldCheck, MapPin } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCustomer, setSelectedCustomer] = React.useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [filterTab, setFilterTab] = React.useState<'ALL' | 'PENDING' | 'COMPLETED' | 'ON_DEMAND'>('ALL')
  const [isActivatingId, setIsActivatingId] = React.useState<string | null>(null)
  const [assigningCustomerId, setAssigningCustomerId] = React.useState<string | null>(null)

  const isIPNOC = userRole === 'IP_NOC_EXECUTIVE'
  const isOMManager = userRole === 'OM_MANAGER' || (userRole || '').toUpperCase().includes('OM')
  const isInstaller = userRole === 'INSTALLATION' || userRole === 'INSTALLER'
  const isSales = userRole === 'SALES'
  const canAssign = isOMManager || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'MANAGER'

  const filteredCustomers = React.useMemo(() => {
    let baseList = customers;

    if (isInstaller) {
      // Installers only see jobs pending their audit
      baseList = customers.filter((c: any) => 
        c.status === 'PENDING_INSTALLER_AUDIT' || 
        c.systemAudits?.some((sa: any) => sa.status === 'PENDING' && sa.assignedInstallerId === currentUserId)
      );
    } else if (filterTab === 'PENDING') {
      if (isIPNOC) {
        baseList = customers.filter((c: any) => c.status === 'PENDING_IP_NOC');
      } else if (isSales) {
        baseList = customers.filter((c: any) => c.status === 'PENDING_INSTALLER_AUDIT' || c.status === 'SIGNUP_GENERATED' || c.status === 'PENDING_PAYMENT_VERIFICATION' || !c.solarSystem?.lastAuditDate);
      } else {
        baseList = customers.filter((c: any) => c.status === 'PENDING_INSTALLER_AUDIT' || c.systemAudits?.some((sa: any) => sa.status === 'PENDING'));
      }
    } else if (filterTab === 'COMPLETED') {
      if (isIPNOC) {
        baseList = customers.filter((c: any) => c.status === 'CONNECTION_ACTIVE');
      } else if (isSales) {
        baseList = customers.filter((c: any) => Boolean(c.solarSystem?.lastAuditDate));
      } else {
        baseList = customers.filter((c: any) => c.status !== 'PENDING_INSTALLER_AUDIT' && (Boolean(c.solarSystem?.lastAuditDate) || c.systemAudits?.some((sa: any) => sa.status === 'COMPLETED')));
      }
    } else if (filterTab === 'ON_DEMAND') {
      baseList = customers.filter((c: any) => 
        c.systemAudits?.some((sa: any) => sa.auditType === 'ON_DEMAND') || 
        c.tickets?.some((t: any) => t.fault?.includes('Audit') || t.category?.includes('Audit'))
      );
    }

    if (!searchQuery.trim()) return baseList;

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
  }, [customers, searchQuery, isIPNOC, isOMManager, isInstaller, isSales, filterTab, currentUserId])

  // KPIs dynamically rendered based on user role
  const pendingCount = isIPNOC
    ? customers.filter((c: any) => c.status === 'PENDING_IP_NOC').length
    : isSales
    ? customers.filter((c: any) => c.status === 'PENDING_INSTALLER_AUDIT' || c.status === 'SIGNUP_GENERATED' || c.status === 'PENDING_PAYMENT_VERIFICATION' || !c.solarSystem?.lastAuditDate).length
    : customers.filter((c: any) => c.status === 'PENDING_INSTALLER_AUDIT' || c.systemAudits?.some((sa: any) => sa.status === 'PENDING')).length

  const completedCount = isIPNOC
    ? customers.filter((c: any) => c.status === 'CONNECTION_ACTIVE').length
    : isSales
    ? customers.filter((c: any) => Boolean(c.solarSystem?.lastAuditDate)).length
    : customers.filter((c: any) => c.status !== 'PENDING_INSTALLER_AUDIT' && (Boolean(c.solarSystem?.lastAuditDate) || c.systemAudits?.some((sa: any) => sa.status === 'COMPLETED'))).length

  const onDemandCount = customers.filter((c: any) => 
    c.systemAudits?.some((sa: any) => sa.auditType === 'ON_DEMAND')
  ).length

  // Header dynamic details
  const headerTitle = isIPNOC 
    ? "IP NOC Operations & Assigned Jobs" 
    : isOMManager 
    ? "O&M Management & System Audits Queue" 
    : isSales
    ? "Sales Operations & Assigned Jobs"
    : "Installer Field Operations & Assigned Jobs"
    
  const portalBadge = isIPNOC 
    ? "IP NOC Portal" 
    : isOMManager 
    ? "O&M Portal" 
    : isSales
    ? "Sales Portal"
    : "Installer Portal"
    
  const subtitleLabel = isIPNOC 
    ? "Setup IP NOC & Configure Connection." 
    : isOMManager 
    ? "Assign Pending Audits to Field Installers, Monitor System Health & Track Completed Audits."
    : isSales
    ? "Collect Solar System Hardware Specs (Part 2) & Audit Details (Part 3)."
    : "Fill Solar Hardware Specs (Part 2) & 7-Point System Audit (Part 3)."

  const pendingLabel = isIPNOC ? "Pending Setup" : "Pending Audits"
  const completedLabel = isIPNOC ? "Connections Active" : "Completed"

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
              {headerTitle}
            </h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
              {portalBadge}
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate-custom)] mt-1">
            Logged in Specialist: <strong className="text-slate-800">{currentUserName}</strong> | {subtitleLabel}
          </p>
        </div>

        {/* Quick KPI Count */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => !isInstaller && setFilterTab(filterTab === 'PENDING' ? 'ALL' : 'PENDING')}
            className={`bg-amber-50 border px-4 py-2 rounded-xl text-center transition-all ${
              isInstaller ? 'cursor-default border-amber-300' : 'cursor-pointer hover:shadow-xs ' + (filterTab === 'PENDING' ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-100/70' : 'border-amber-200')
            }`}
          >
            <p className="text-[10px] font-bold uppercase text-amber-800">{pendingLabel}</p>
            <p className="text-xl font-bold font-mono text-amber-950">{pendingCount}</p>
          </button>
          {!isInstaller && (
            <button
              type="button"
              onClick={() => setFilterTab(filterTab === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
              className={`bg-emerald-50 border px-4 py-2 rounded-xl text-center transition-all cursor-pointer hover:shadow-xs ${
                filterTab === 'COMPLETED' ? 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-100/70' : 'border-emerald-200'
              }`}
            >
              <p className="text-[10px] font-bold uppercase text-emerald-800">{completedLabel}</p>
              <p className="text-xl font-bold font-mono text-emerald-950">{completedCount}</p>
            </button>
          )}
          {onDemandCount > 0 && !isInstaller && (
            <button
              type="button"
              onClick={() => setFilterTab(filterTab === 'ON_DEMAND' ? 'ALL' : 'ON_DEMAND')}
              className={`bg-blue-50 border px-4 py-2 rounded-xl text-center transition-all cursor-pointer hover:shadow-xs ${
                filterTab === 'ON_DEMAND' ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-100/70' : 'border-blue-200'
              }`}
            >
              <p className="text-[10px] font-bold uppercase text-blue-800">On-Demand</p>
              <p className="text-xl font-bold font-mono text-blue-950">{onDemandCount}</p>
            </button>
          )}
        </div>
      </div>

      {/* Main Assigned Jobs Table Card */}
      <SectionHeader leftAction={<Wrench className="h-4 w-4 text-amber-600" />}>
        System Audits &amp; Assigned Jobs Queue
      </SectionHeader>
      <Card className="shadow-sm border-line bg-white overflow-hidden">
        <CardHeader className="py-4 bg-slate-50/70 border-b border-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-bold text-[#002868] flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-600" />
                System Audits &amp; Assigned Jobs Queue ({filteredCustomers.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {canAssign 
                  ? "O&M Manager can assign pending audits to installers and review completed field reports." 
                  : "Click 'Edit Specs & Audit' to input technical parameters and submit to O&M Manager."}
              </CardDescription>
            </div>

            {/* Filter Tabs (only for managers/admins/NOC, installers only have pending active queue) */}
            {!isInstaller && (
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterTab('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({customers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('PENDING')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterTab === 'PENDING' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('COMPLETED')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterTab === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Completed ({completedCount})
                </button>
                {onDemandCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterTab('ON_DEMAND')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      filterTab === 'ON_DEMAND' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    On-Demand ({onDemandCount})
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
                <TableHead className="text-right font-bold text-xs text-[#002868] w-56">Field Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-500">
                    No assigned customer jobs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c: any) => {
                  const hasAuditCompleted = c.status !== 'PENDING_INSTALLER_AUDIT' && Boolean(c.solarSystem?.lastAuditDate)
                  const customerIdDisplay = c.customerCode?.replace(/\D/g, '') || c.customerCode || c.id
                  const crfDisplay = c.crfNumber || (c.customerCode ? `CRF-${c.customerCode.replace(/\D/g, '')}` : '—')

                  // Check if there is an on-demand audit request
                  const onDemandAudit = c.systemAudits?.find((sa: any) => sa.auditType === 'ON_DEMAND')
                  const pendingAudit = c.systemAudits?.find((sa: any) => sa.status === 'PENDING')

                  // Format detailed address
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

                      {/* Customer Name & Contact & Installer Assignment */}
                      <TableCell className="border-r">
                        <span className="font-bold text-slate-900 block">{c.fullName}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">{c.contactNumber}</span>
                        
                        {/* Installer Assignment Section for O&M Manager */}
                        {!isInstaller && (
                          <div className="mt-1.5 space-y-1">
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-slate-500 font-medium">Assigned:</span>
                              <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                                {c.assignedInstaller?.fullName || c.solarSystem?.installerName || 'Unassigned'}
                              </span>
                            </div>

                            {/* O&M Manager Quick Assign Dropdown */}
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

                      {/* System & Hardware Specs (Job Card specs) */}
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
                              Audit Submitted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold text-[11px]">
                              Audit Pending
                            </Badge>
                          )}

                          {/* Next Audit Date */}
                          <div className="text-[10px] text-slate-500 font-medium">
                            <span>Next: </span>
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

                      {/* Action Buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/customers/${c.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold gap-1"
                              title="View Customer Profile"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-600" />
                              View
                            </Button>
                          </Link>

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
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                              title="Process to Activate in CRM"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {isActivatingId === c.id ? 'Activating...' : 'Process to Activate'}
                            </Button>
                          )}

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(c)
                              setIsModalOpen(true)
                            }}
                            className="h-8 bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Wrench className="h-3.5 w-3.5 text-amber-400" />
                            {isIPNOC ? 'Review Specs' : 'Edit Specs & Audit'}
                          </Button>
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

      {/* Interactive Audit Modal */}
      {selectedCustomer && (
        <InstallerAuditModal
          customer={selectedCustomer}
          installerName={currentUserName}
          isOpen={isModalOpen}
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
