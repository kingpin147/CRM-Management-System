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
import { useRouter } from 'next/navigation'

interface InstallerJobsViewProps {
  customers: any[]
  currentUserId: string
  currentUserName: string
  userRole: string
}

export function InstallerJobsView({
  customers,
  currentUserId,
  currentUserName,
  userRole,
}: InstallerJobsViewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCustomer, setSelectedCustomer] = React.useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase().trim()
    return customers.filter((c: any) =>
      c.fullName?.toLowerCase().includes(q) ||
      c.customerCode?.toLowerCase().includes(q) ||
      c.crfNumber?.toLowerCase().includes(q) ||
      c.contactNumber?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q)
    )
  }, [customers, searchQuery])

  const pendingAuditCount = customers.filter((c: any) => !c.solarSystem?.lastAuditDate || c.status === 'PENDING_ACTIVATION').length
  const completedAuditCount = customers.filter((c: any) => c.solarSystem?.lastAuditDate).length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
              Installer Field Operations &amp; Assigned Jobs
            </h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
              Installer Portal
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate-custom)] mt-1">
            Logged in Specialist: <strong className="text-slate-800">{currentUserName}</strong> | Fill Solar Hardware Specs (Part 2) &amp; 7-Point System Audit (Part 3).
          </p>
        </div>

        {/* Quick KPI Count */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase text-amber-800">Pending Audits</p>
            <p className="text-xl font-bold font-mono text-amber-950">{pendingAuditCount}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-800">Completed</p>
            <p className="text-xl font-bold font-mono text-emerald-950">{completedAuditCount}</p>
          </div>
        </div>
      </div>

      {/* Main Assigned Jobs Table Card */}
      <Card className="shadow-sm border-line bg-white overflow-hidden">
        <CardHeader className="py-4 bg-slate-50/70 border-b border-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base font-bold text-[#002868] flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-600" />
              Assigned Customer Jobs Queue ({filteredCustomers.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Click &quot;Edit Solar &amp; Audit Specs&quot; to input technical parameters and submit to O&amp;M Manager.
            </CardDescription>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, CRF, name, city..."
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
                <TableHead className="font-bold text-xs text-[#002868] border-r">System Capacity &amp; Tier</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] border-r">City &amp; Installation Area</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] border-r text-center">Audit Status</TableHead>
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
                  const hasAuditCompleted = Boolean(c.solarSystem?.lastAuditDate || c.solarSystem?.inverterBrand)
                  const customerIdDisplay = c.customerCode?.replace(/\D/g, '') || c.customerCode || c.id
                  const crfDisplay = c.crfNumber || (c.customerCode ? `CRF-${c.customerCode.replace(/\D/g, '')}` : '—')

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

                      {/* Customer Name & Contact */}
                      <TableCell className="border-r">
                        <span className="font-bold text-slate-900 block">{c.fullName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{c.contactNumber}</span>
                      </TableCell>

                      {/* System Capacity & Tier */}
                      <TableCell className="border-r">
                        <span className="font-bold text-[#002868] block">
                          {c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '1-10 kW'}
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {c.packagePlan?.packageTier || 'Moderate'} ({c.packagePlan?.monitoringTime || '12 Hours'})
                        </span>
                      </TableCell>

                      {/* Address & City */}
                      <TableCell className="border-r">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>{c.city || '—'} {c.area ? `(${c.area})` : ''}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{c.address}</span>
                      </TableCell>

                      {/* Audit Status */}
                      <TableCell className="border-r text-center">
                        {hasAuditCompleted ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Audit Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold text-[11px]">
                            Audit Pending
                          </Badge>
                        )}
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

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(c)
                              setIsModalOpen(true)
                            }}
                            className="h-8 bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Wrench className="h-3.5 w-3.5 text-amber-400" />
                            Edit Specs &amp; Audit
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
