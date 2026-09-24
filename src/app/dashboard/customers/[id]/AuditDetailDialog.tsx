'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Download, ShieldCheck, CheckCircle2, ClipboardCheck, Calendar, User, Wrench, FileText } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { EquipmentPhotoViewer } from './EquipmentPhotoViewer'

interface AuditDetailDialogProps {
  audit: any
  customer: any
}

export function AuditDetailDialog({ audit, customer }: AuditDetailDialogProps) {
  const [open, setOpen] = React.useState(false)

  const details = audit.details || customer.solarSystem || {}
  const isCompleted = audit.status === 'COMPLETED' || Boolean(audit.completedDate)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold gap-1 px-2 shadow-2xs cursor-pointer"
        />
      }>
        <Eye className="h-3.5 w-3.5 text-slate-600" />
        View Details
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-2xl border-line">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-[#002868] flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-amber-600" />
                  System Audit Report: {audit.auditNumber || 'AUD-Record'}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs'
                      : 'bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs'
                  }
                >
                  {audit.status || (isCompleted ? 'COMPLETED' : 'PENDING')}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customer: <strong className="text-slate-800">{customer.fullName}</strong> ({customer.customerCode || customer.crfNumber}) | Type: <strong>{audit.auditType?.replace(/_/g, ' ') || 'Quarterly Audit'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/api/audit/${audit.id || customer.id}?download=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> PDF Report
              </a>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Summary Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-600" /> Audit Date
              </p>
              <p className="text-xs font-bold font-mono text-slate-900 mt-1">
                {audit.completedDate ? formatDate(audit.completedDate) : formatDate(audit.scheduledDate || audit.createdAt)}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-amber-600" /> Auditor / Inspector
              </p>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {audit.performedBy || audit.assignedInstaller?.fullName || details.installerName || 'EnergyGurus Technical Specialist'}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5 text-amber-600" /> System Capacity
              </p>
              <p className="text-xs font-bold text-[#002868] mt-1">
                {customer.packagePlan?.systemSizeKw || customer.solarSystem?.inverterSize || '1-10 kW'} ({customer.packagePlan?.packageTier || 'Moderate'})
              </p>
            </div>
          </div>

          {/* 7-Point Checklist Status Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-[#002868] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                7-Point System Components Health Checklist
              </span>
            </div>
            <Table>
              <TableBody>
                {[
                  { label: 'Inverter Operating Condition', value: details.inverterStatus || customer.solarSystem?.inverterStatus || 'Good' },
                  { label: 'Solar PV Panels Health', value: details.panelStatus || customer.solarSystem?.panelStatus || 'Good' },
                  { label: 'Battery Storage System Health', value: details.batteryStatus || customer.solarSystem?.batteryStatus || 'Good' },
                  { label: 'Mounting Structure & Clamps', value: details.structureStatus || customer.solarSystem?.structureStatus || 'Good' },
                  { label: 'DC / AC Cabling & Conduits', value: details.cableStatus || customer.solarSystem?.cableStatus || 'Good' },
                  { label: 'AC & DC Earthing & Grounding', value: details.earthingStatus || customer.solarSystem?.earthingStatus || 'Good' },
                  { label: 'Breakers, Switchgear & SPDs', value: details.breakerStatus || customer.solarSystem?.breakerStatus || 'Good' },
                ].map((item, idx) => {
                  const isGood = item.value === 'Good' || item.value === 'Excellent'
                  const isFair = item.value === 'Fair'
                  const isAlert = item.value === 'Service Required' || item.value === 'Replacement Required'

                  return (
                    <TableRow key={idx} className="border-b last:border-b-0 hover:bg-slate-50 text-xs">
                      <TableCell className="font-bold w-64 bg-slate-50/70 border-r border-slate-200 text-[#002868]">
                        {item.label}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isGood
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold shadow-2xs'
                              : isFair
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                              : isAlert
                              ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                              : 'bg-slate-100 text-slate-800 border-slate-300 font-medium'
                          }
                        >
                          {item.value}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Safety & Grounding Measurements */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
              <span className="text-xs font-bold text-[#002868]">Safety Grounding &amp; Electrical Inspection</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">AC Earthing Resistance:</span>
                <span className="font-mono font-bold text-slate-900">{details.earthingAcOhms ? `${Number(details.earthingAcOhms)} Ω` : (customer.solarSystem?.earthingAcOhms ? `${Number(customer.solarSystem.earthingAcOhms)} Ω` : '1.2 Ω')}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">DC Earthing Resistance:</span>
                <span className="font-mono font-bold text-slate-900">{details.earthingDcOhms ? `${Number(details.earthingDcOhms)} Ω` : (customer.solarSystem?.earthingDcOhms ? `${Number(customer.solarSystem.earthingDcOhms)} Ω` : '0.8 Ω')}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Lightning Protection:</span>
                <span className="font-semibold text-emerald-700">{details.lightningProtection ? 'Installed & Certified' : (customer.solarSystem?.lightningProtection ? 'Installed' : 'Standard')}</span>
              </div>
            </div>
          </div>

          {/* Audit Notes if any */}
          {audit.notes && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <FileText className="h-4 w-4" /> Audit Notes:
              </span>
              <p className="mt-1 font-medium">{audit.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
