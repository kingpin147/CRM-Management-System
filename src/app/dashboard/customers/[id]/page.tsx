import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PackageFormDialog } from './PackageFormDialog'
import { EditCustomerDialog } from './EditCustomerDialog'
import { SolarSystemDialog } from './SolarSystemDialog'
import { RecordPaymentDialog } from './RecordPaymentDialog'
import { GenerateInvoiceDialog } from './GenerateInvoiceDialog'
import { ExportLedgerCsvButton } from './ExportLedgerCsvButton'
import { toggleInvoiceStatus } from './actions'
import { CustomerTicketForm } from './CustomerTicketForm'
import { TicketUpdateDialog } from '@/app/dashboard/tickets/TicketUpdateDialog'
import { TicketClosedSetupDialog } from './TicketClosedSetupDialog'
import { EquipmentPhotoViewer } from './EquipmentPhotoViewer'
import { Sun, Battery, ShieldCheck, Zap, Receipt, MessageSquare, Mail, History as HistoryIcon, Download, ClipboardCheck, MapPin, ExternalLink } from 'lucide-react'
import { formatDate, formatDateTime, calculateNextAuditDate, getAuditFrequencyLabel } from '@/lib/utils'
import { createClient } from '@/utils/supabase/server'
import { SectionHeader } from '@/components/ui/section-header'
import { CustomerIdQuickSwitch } from './CustomerIdQuickSwitch'


export default async function CustomerDetailPage({ 
  params,
  searchParams
}: { 
  params: { id: string }
  searchParams: { tab?: string }
}) {
  const { id } = await params
  const { tab } = await searchParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dbUser = user ? await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } }) : null
  const userRole = dbUser?.role

  const rawCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id },
        { customerCode: { contains: id, mode: 'insensitive' } },
        { customerCode: { contains: id.replace(/\D/g, ''), mode: 'insensitive' } },
      ],
    },
    include: {
      solarSystem: true,
      packagePlan: true,
      tickets: {
        include: {
          histories: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      ledgerEntries: {
        orderBy: { createdAt: 'desc' }
      },
      invoices: {
        orderBy: { createdAt: 'desc' }
      },
      transactions: {
        orderBy: { createdAt: 'desc' }
      },
      customerHistory: {
        orderBy: { createdAt: 'desc' }
      },
      communicationLogs: {
        orderBy: { createdAt: 'desc' }
      },
    }
  })

  if (!rawCustomer) {
    notFound()
  }

  // Sanitize Decimal and custom instances to plain JSON primitives
  const customer = JSON.parse(JSON.stringify(rawCustomer))

  const canViewLedger = userRole ? ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BILLING_MANAGER', 'SALES_MANAGER', 'SALES'].includes(userRole) : false
  const canEditProfile = userRole ? ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER', 'SALES'].includes(userRole) : false
  const canEditSolarSpecs = userRole ? ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OM_MANAGER', 'INSTALLATION'].includes(userRole) : false
  const canRecordPayment = userRole ? ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BILLING_MANAGER', 'SALES_MANAGER', 'SALES'].includes(userRole) : false

  const smsLogs = (customer.communicationLogs || []).filter((l: any) => l.channel === 'SMS')
  const emailLogs = (customer.communicationLogs || []).filter((l: any) => l.channel === 'EMAIL')

  const allTabs = [
    { id: 'profile', label: 'Customer Profile', allowed: true },
    { id: 'system', label: 'System Details', allowed: true },
    { id: 'audit', label: 'System Audit', allowed: true },
    { id: 'ledger', label: 'Customer Ledger', allowed: canViewLedger },
    { id: 'ticket', label: 'Create Ticket', allowed: true },
    { id: 'complaints', label: `Complaints Details (${customer.tickets?.length || 0})`, allowed: true },
    { id: 'history', label: 'Customer History', allowed: true },
    { id: 'sms-history', label: `SMS History (${smsLogs.length})`, allowed: true },
    { id: 'email-history', label: `Email History (${emailLogs.length})`, allowed: true },
  ]

  const tabs = allTabs.filter(t => t.allowed)
  const currentTab = tab === 'package' ? 'system' : (tab || 'profile')
  const activeTab = tabs.some(t => t.id === currentTab) ? currentTab : 'profile'

  // Compute ledger financial summaries and current payable
  const totalInvoiced = (customer.invoices || []).reduce((acc: number, inv: any) => acc + (Number(inv.totalAmount) || 0), 0)
  const totalPaid = (customer.transactions || []).reduce((acc: number, tx: any) => acc + (Number(tx.amount) || 0), 0)
  const currentBalance = (customer.ledgerEntries && customer.ledgerEntries.length > 0)
    ? Number(customer.ledgerEntries[0].balance)
    : (totalInvoiced - totalPaid)
  const currentPayable = Math.max(0, currentBalance)

  return (
    <div className="space-y-6 animate-reveal">
      {/* Top Header & Back Button */}
      <div className="space-y-2 mb-4">
        <div>
          <Link href="/dashboard/customers" className="inline-block">
            <Button variant="ghost" size="sm" className="text-[var(--color-slate-custom)] hover:text-[var(--color-ink)] px-1 hover:bg-transparent -ml-1 text-xs font-semibold flex items-center gap-1">
              ← Back to Customer Search
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CustomerIdQuickSwitch currentCustomerCode={customer.customerCode} />
          <div className="flex gap-2 shrink-0 items-center">
            {canEditProfile && (
              <EditCustomerDialog customer={customer} />
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation matching Invoice Theme */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px bg-slate-100/80 p-1.5 rounded-t-xl">
        {tabs.map(t => (
          <Link 
            key={t.id} 
            href={`/dashboard/customers/${id}?tab=${t.id}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-all rounded-t-lg cursor-pointer ${
              activeTab === t.id
                ? 'border-[#f16232] text-white font-bold bg-[#f16232] shadow-xs'
                : 'border-[#136d86] text-white bg-[#136d86] hover:bg-[#136d86]/90 hover:text-white'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>


      {/* Tab Content */}
      <div className="mt-6 space-y-6">
        {/* 1. Customer Profile Tab with Package Details Parked Below */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Customer Details Card - 2 Column Side by Side */}
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <SectionHeader>Customer Profile</SectionHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left Column: Personal & Contact Information */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Customer ID</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-[var(--color-ink)]">
                            {customer.customerCode?.replace(/\D/g, '') || customer.customerCode?.replace(/^[A-Za-z]+-/, '') || customer.id}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer Name</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.fullName}</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Contact #</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-medium font-mono">{customer.contactNumber}</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">POC #</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-medium font-mono">{customer.pocNumber || '—'}</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Email:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)]">{customer.email || '—'}</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">CNIC #:</TableCell>
                          <TableCell className="text-xs font-mono text-[var(--color-ink)]">{customer.cnic || '—'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Right Column: Address & Account Status */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Installation Address:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="font-medium">{customer.address || '—'}</span>
                              <a
                                href={
                                  customer.coordinates?.trim()
                                    ? (customer.coordinates.startsWith('http')
                                        ? customer.coordinates
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.coordinates)}`)
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customer.address || ''}, ${customer.city || ''}, Pakistan`)}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold transition-all shadow-2xs cursor-pointer shrink-0 w-fit"
                                title="Open exact pinpoint location in Google Maps"
                              >
                                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                                <span>Open Google Maps Pin</span>
                              </a>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">GPS Coordinates:</TableCell>
                          <TableCell className="text-xs font-mono font-semibold text-slate-800">
                            {customer.coordinates ? (
                              <a
                                href={
                                  customer.coordinates.startsWith('http')
                                    ? customer.coordinates
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.coordinates)}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#002868] hover:text-amber-600 underline font-bold inline-flex items-center gap-1"
                              >
                                <span>{customer.coordinates}</span>
                                <ExternalLink className="h-3 w-3 text-amber-600" />
                              </a>
                            ) : (
                              <span className="text-slate-400 font-normal">Not Specified (Maps to Address)</span>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer Type</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                              {customer.customerType ? (customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1).toLowerCase()) : 'Residential'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer Status</TableCell>
                          <TableCell className="text-xs">
                            {(() => {
                              const st = customer.status
                              if (st === 'SIGNUP_GENERATED') {
                                return <Badge variant="outline" className="bg-amber-100 text-amber-950 border-amber-300 font-bold shadow-xs">Pending on Sales</Badge>
                              }
                              if (st === 'PENDING_PAYMENT_VERIFICATION') {
                                return <Badge variant="outline" className="bg-blue-100 text-blue-950 border-blue-300 font-bold shadow-xs">Pending for Payment Verification</Badge>
                              }
                              if (st === 'PENDING_ACTIVATION') {
                                return <Badge variant="outline" className="bg-sky-100 text-sky-950 border-sky-300 font-bold shadow-xs">Pending for O&M</Badge>
                              }
                              if (st === 'CONNECTION_ACTIVE') {
                                return <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">Active</Badge>
                              }
                              if (st === 'TEMPORARY_BLOCKED') {
                                return <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">Temporary Blocked</Badge>
                              }
                              if (st === 'PERMANENT_DISCONNECTION') {
                                return <Badge variant="outline" className="bg-rose-100 text-rose-900 border-rose-300 font-bold">Terminated</Badge>
                              }
                              return <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">{st ? st.replace(/_/g, ' ') : 'Pending on Sales'}</Badge>
                            })()}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">CRF Number:</TableCell>
                          <TableCell className="font-mono text-xs text-[var(--color-ink)]">
                            <a 
                              href={`/api/signup/${customer.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#002868] hover:text-amber-600 font-bold underline inline-flex items-center gap-1 hover:bg-amber-50 px-1 py-0.5 rounded transition-all cursor-pointer"
                              title="Click to open Customer Signup PDF Form (CRF)"
                            >
                              {customer.crfNumber || (customer.customerCode ? `CRF-${customer.customerCode.replace(/\D/g, '')}` : '—')}
                              <Download className="h-3 w-3 text-amber-600" />
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Activation Date:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-semibold font-mono">
                            {customer.status === 'CONNECTION_ACTIVE' && customer.activationDate ? (
                              formatDate(customer.activationDate)
                            ) : (
                              <span className="text-slate-400 font-normal">Pending O&M Approval</span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Details Section - 2 Column Side by Side */}
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <SectionHeader>Package Details</SectionHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left Column: System & Package Spec */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">System Type:</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                              {customer.packagePlan?.systemSizeKw || '1 – 10 kW'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Package:</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                              {customer.packagePlan?.packageTier || 'Basic'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Monitoring Time</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                              {customer.packagePlan?.monitoringTime || '12 Hours'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Right Column: Billing & Schedule */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Billing Type</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                              {customer.packagePlan?.billingType || 'Monthly'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Next Billing date</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-semibold font-mono">
                            {customer.status === 'CONNECTION_ACTIVE' && customer.packagePlan?.nextBillingDate ? (
                              formatDate(customer.packagePlan.nextBillingDate)
                            ) : (
                              <span className="text-slate-400 font-normal">Pending Activation</span>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Current Payable</TableCell>
                          <TableCell className="text-xs font-mono font-semibold">
                            {currentPayable > 0 ? (
                              <span className="font-bold text-[#002868]">
                                PKR {currentPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-[var(--color-ink)]">0</span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* 2. Solar System Details Tab (2-Column Balanced Layout) */}
        {activeTab === 'system' && (() => {
          const invBrands = customer.solarSystem?.inverterBrand 
            ? customer.solarSystem.inverterBrand.split(',').map((s: string) => s.trim()).filter(Boolean)
            : []
          const invSerials = (customer.solarSystem?.inverterSerials && customer.solarSystem.inverterSerials.length > 0)
            ? customer.solarSystem.inverterSerials
            : (customer.solarSystem?.inverterSerial 
                ? customer.solarSystem.inverterSerial.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [])
          const noOfInverters = customer.solarSystem?.noOfInverters != null 
            ? Number(customer.solarSystem.noOfInverters) 
            : Math.max(invBrands.length, invSerials.length)

          const batSerials = (customer.solarSystem?.batterySerials && customer.solarSystem.batterySerials.length > 0)
            ? customer.solarSystem.batterySerials
            : (customer.solarSystem?.batterySerial 
                ? customer.solarSystem.batterySerial.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [])
          const noOfBatteries = customer.solarSystem?.noOfBatteries != null 
            ? Number(customer.solarSystem.noOfBatteries) 
            : batSerials.length

          const totalWattageVal = Number(customer.solarSystem?.totalWattage || 0)
          const structureDisplay = [customer.solarSystem?.structureType, customer.solarSystem?.structureMaterial ? `(${customer.solarSystem.structureMaterial})` : null].filter(Boolean).join(' ') || '—'

          return (
            <div className="space-y-6">
              <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
                <SectionHeader
                  action={
                    canEditSolarSpecs && (
                      <SolarSystemDialog customerId={customer.id} solarSystem={customer.solarSystem} />
                    )
                  }
                >
                  Solar System Details
                </SectionHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* Left Column: Grid Connection, Inverters, Grounding & Installation */}
                    <div className="w-full">
                      <SectionHeader>
                        Grid Connection & Inverter System
                      </SectionHeader>
                      <Table>
                        <TableBody>
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Meter Type</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.meterType ? (
                                <Badge variant="outline" className="bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-xs">
                                  {customer.solarSystem.meterType}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Zero Export Device</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.zeroExportDevice ? (
                                <Badge variant="outline" className="bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-xs">
                                  Installed
                                </Badge>
                              ) : (customer.solarSystem?.inverterBrand || customer.solarSystem?.meterType) ? (
                                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-medium">
                                  Not Installed
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">DISCO</TableCell>
                            <TableCell className="text-xs font-semibold text-[var(--color-ink)] bg-sky-50/60 w-fit">
                              {customer.solarSystem?.disco ? (
                                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200 font-bold">
                                  {customer.solarSystem.disco}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* DISCO Consumer ID */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">
                              {customer.solarSystem?.disco || 'DISCO'} Consumer ID
                            </TableCell>
                            <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                              {customer.solarSystem?.discoRefNo || '—'}
                            </TableCell>
                          </TableRow>

                          {/* Inverter Brand */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Brand</TableCell>
                            <TableCell className="text-xs">
                              {invBrands.length > 0 || customer.solarSystem?.inverterBrand ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {invBrands.join(', ') || customer.solarSystem?.inverterBrand}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Inverter Type */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Type</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.inverterType ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.inverterType}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Inverter Phase */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Phase Type</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.inverterPhase ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.inverterPhase}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Inverter Category */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Category</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.inverterCategory ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.inverterCategory}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Inverter Size */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Size</TableCell>
                            <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                              {customer.solarSystem?.inverterSize || '—'}
                            </TableCell>
                          </TableRow>

                          {/* Meter Phase */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Meter Phase</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.meterPhase ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.meterPhase}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* No. of Inverters */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">No. of Inverters</TableCell>
                            <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                              {noOfInverters > 0 ? noOfInverters : '—'}
                            </TableCell>
                          </TableRow>

                          {/* Inverter Units Breakdown & Warranty */}
                          {noOfInverters > 1 ? (
                            <TableRow className="border-b hover:bg-transparent bg-amber-50/20">
                              <TableCell className="font-bold text-xs bg-amber-50/60 border-r border-slate-200 text-[#002868]">
                                <div>Inverters Units</div>
                                <span className="text-[10px] text-amber-800 font-normal">All {noOfInverters} units</span>
                              </TableCell>
                              <TableCell className="text-xs p-2.5">
                                <div className="space-y-2">
                                  {Array.from({ length: noOfInverters }).map((_, idx) => {
                                    const brand = invBrands[idx] || invBrands[0] || customer.solarSystem?.inverterBrand || '—'
                                    const serial = invSerials[idx] || (idx === 0 ? (customer.solarSystem?.inverterSerial || '—') : `${customer.solarSystem?.inverterSerial || 'INV'}-${idx + 1}`)
                                    return (
                                      <div key={idx} className="p-2.5 rounded-lg border border-amber-200/80 bg-white shadow-2xs space-y-1">
                                        <div className="font-bold text-[#002868] text-xs flex items-center justify-between border-b border-slate-100 pb-1">
                                          <span>Inverter #{idx + 1}</span>
                                          <Badge variant="outline" className="bg-amber-100 text-amber-950 border-amber-300 font-bold text-[10px]">{brand}</Badge>
                                        </div>
                                        <div className="text-[11px] text-slate-700 flex justify-between">
                                          <span className="font-semibold text-slate-500">Serial #:</span> 
                                          <span className="font-mono font-bold text-[#002868]">{serial}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-700 flex justify-between items-center">
                                          <span className="font-semibold text-slate-500">Warranty End:</span> 
                                          <span className="font-mono font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                            {formatDate(customer.solarSystem?.inverterWarrantyEnds?.[idx] || customer.solarSystem?.inverterWarrantyEnd)}
                                          </span>
                                        </div>
                                        {(customer.solarSystem?.inverterImages?.[idx] || customer.solarSystem?.inverterImages?.[0]) && (
                                          <div className="text-[11px] text-slate-700 flex justify-between items-center pt-1 border-t border-slate-100">
                                            <span className="font-semibold text-slate-500">Inverter #{idx + 1} Image:</span> 
                                            <EquipmentPhotoViewer
                                              imageUrl={customer.solarSystem?.inverterImages?.[idx] || customer.solarSystem?.inverterImages?.[0]}
                                              title={`Inverter #${idx + 1} (${brand}) Hardware Photo`}
                                              buttonLabel={`View Inverter #${idx + 1} Photo`}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              <TableRow className="border-b hover:bg-transparent">
                                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Serial #</TableCell>
                                <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                                  {customer.solarSystem?.inverterSerial || '—'}
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-b hover:bg-transparent">
                                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Warranty End Date</TableCell>
                                <TableCell className="font-mono text-xs font-semibold text-amber-900">
                                  {formatDate(customer.solarSystem?.inverterWarrantyEnd)}
                                </TableCell>
                              </TableRow>
                            </>
                          )}

                          {/* Inverter Photo Small Pop-up Button */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Photo</TableCell>
                            <TableCell className="text-xs">
                              <EquipmentPhotoViewer
                                imageUrl={customer.solarSystem?.inverterImages?.[0]}
                                title={`${customer.solarSystem?.inverterBrand || 'Inverter'} Hardware Photo`}
                                buttonLabel="View Inverter Photo"
                              />
                            </TableCell>
                          </TableRow>

                          {/* Earthing / OHMs */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Earthing & OHMs</TableCell>
                            <TableCell className="text-xs p-0">
                              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-t-0">
                                <div className="p-2.5">
                                  <span className="font-bold text-slate-600 mr-2">AC:</span>
                                  <span className="font-semibold text-[#002868]">
                                    {customer.solarSystem?.earthingAcOhms != null && Number(customer.solarSystem?.earthingAcOhms) > 0 ? `${customer.solarSystem.earthingAcOhms} Ω` : '—'}
                                  </span>
                                </div>
                                <div className="p-2.5">
                                  <span className="font-bold text-slate-600 mr-2">DC:</span>
                                  <span className="font-semibold text-[#002868]">
                                    {customer.solarSystem?.earthingDcOhms != null && Number(customer.solarSystem?.earthingDcOhms) > 0 ? `${customer.solarSystem.earthingDcOhms} Ω` : '—'}
                                  </span>
                                </div>
                                <div className="p-2.5 bg-slate-50/50">
                                  <span className="font-bold text-slate-600 mr-2">Last Check:</span>
                                  <span className="text-slate-700 font-medium">
                                    {formatDate(customer.solarSystem?.earthingLastCheck)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Ingress Protection (IP) */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Ingress Protection (IP)</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.ingressProtection ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.ingressProtection.startsWith('IP') ? customer.solarSystem.ingressProtection : `IP ${customer.solarSystem.ingressProtection}`}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Structure Type */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Structure Type & Material</TableCell>
                            <TableCell className="text-xs">
                              {structureDisplay !== '—' ? (
                                <div className="flex gap-2 items-center flex-wrap">
                                  {customer.solarSystem?.structureType && (
                                    <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                      {customer.solarSystem.structureType}
                                    </Badge>
                                  )}
                                  {customer.solarSystem?.structureMaterial && (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-950 border-amber-400 font-semibold">
                                      {customer.solarSystem.structureMaterial}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* System Installation Date */}
                          <TableRow className="hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">System Installation Date</TableCell>
                            <TableCell className="text-xs font-semibold text-[var(--color-ink)] flex items-center gap-2 font-mono">
                              <span className="text-slate-500">📅</span>
                              {formatDate(customer.solarSystem?.systemInstallationDate)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Right Column: Solar Array, Battery Storage */}
                    <div className="w-full">
                      <SectionHeader>
                        PV Panels & Battery Energy Storage
                      </SectionHeader>
                      <Table>
                        <TableBody>
                          {/* Panel Technology */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Technology</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.panelTechnology ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.panelTechnology}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Panel Brand */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Brand</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.panelBrand ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.panelBrand}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Panel Wattage & No of Panels */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Wattage</TableCell>
                            <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                              {customer.solarSystem?.panelWattage && Number(customer.solarSystem.panelWattage) > 0 ? `${customer.solarSystem.panelWattage} W` : '—'}
                            </TableCell>
                          </TableRow>

                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">No of Panels</TableCell>
                            <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                              {customer.solarSystem?.noOfPanels && Number(customer.solarSystem.noOfPanels) > 0 ? customer.solarSystem.noOfPanels : '—'}
                            </TableCell>
                          </TableRow>

                          {/* Total Wattage */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">
                              <div>Total Wattage</div>
                              <span className="text-[10px] text-slate-500 font-normal">(Wattage x Panels)</span>
                            </TableCell>
                            <TableCell className="text-xs font-bold text-[#002868] bg-sky-50/50">
                              {totalWattageVal > 0 ? `${totalWattageVal} W (${(totalWattageVal / 1000).toFixed(2)} kW)` : '—'}
                            </TableCell>
                          </TableRow>

                          {/* Panel Warranty End Date */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Warranty End Date</TableCell>
                            <TableCell className="font-mono text-xs font-semibold text-amber-900">
                              {formatDate(customer.solarSystem?.panelWarrantyEnd)}
                            </TableCell>
                          </TableRow>

                          {/* Battery Category */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Battery Category</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.batteryCategory ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.batteryCategory}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Battery Brand */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Battery Brand</TableCell>
                            <TableCell className="text-xs">
                              {customer.solarSystem?.batteryBrand && customer.solarSystem.batteryBrand !== 'N/A' ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  {customer.solarSystem.batteryBrand}
                                </Badge>
                              ) : (customer.solarSystem?.batteryBrand === 'N/A' && Number(customer.solarSystem?.noOfBatteries) > 0) ? (
                                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold shadow-xs">
                                  N/A
                                </Badge>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* No. of Batteries */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">No. of Batteries</TableCell>
                            <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                              {noOfBatteries > 0 ? noOfBatteries : '—'}
                            </TableCell>
                          </TableRow>

                          {/* Battery Units Breakdown & Warranty */}
                          {noOfBatteries > 1 ? (
                            <TableRow className="border-b hover:bg-transparent bg-amber-50/20">
                              <TableCell className="font-bold text-xs bg-amber-50/60 border-r border-slate-200 text-[#002868]">
                                <div>Batteries Units</div>
                                <span className="text-[10px] text-amber-800 font-normal">All {noOfBatteries} units</span>
                              </TableCell>
                              <TableCell className="text-xs p-2.5">
                                <div className="space-y-2">
                                  {Array.from({ length: noOfBatteries }).map((_, idx) => {
                                    const brand = customer.solarSystem?.batteryBrand || '—'
                                    const serial = batSerials[idx] || (idx === 0 ? (customer.solarSystem?.batterySerial || '—') : `${customer.solarSystem?.batterySerial || 'BAT'}-${idx + 1}`)
                                    return (
                                      <div key={idx} className="p-2.5 rounded-lg border border-amber-200/80 bg-white shadow-2xs space-y-1">
                                        <div className="font-bold text-[#002868] text-xs flex items-center justify-between border-b border-slate-100 pb-1">
                                          <span>Battery #{idx + 1}</span>
                                          <Badge variant="outline" className="bg-amber-100 text-amber-950 border-amber-300 font-bold text-[10px]">{brand}</Badge>
                                        </div>
                                        <div className="text-[11px] text-slate-700 flex justify-between">
                                          <span className="font-semibold text-slate-500">Serial #:</span> 
                                          <span className="font-mono font-bold text-[#002868]">{serial}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-700 flex justify-between items-center">
                                          <span className="font-semibold text-slate-500">Warranty End:</span> 
                                          <span className="font-mono font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                            {formatDate(customer.solarSystem?.batteryWarrantyEnds?.[idx] || customer.solarSystem?.batteryWarrantyEnd)}
                                          </span>
                                        </div>
                                        {(customer.solarSystem?.batteryImages?.[idx] || customer.solarSystem?.batteryImages?.[0]) && (
                                          <div className="text-[11px] text-slate-700 flex justify-between items-center pt-1 border-t border-slate-100">
                                            <span className="font-semibold text-slate-500">Battery #{idx + 1} Image:</span> 
                                            <EquipmentPhotoViewer
                                              imageUrl={customer.solarSystem?.batteryImages?.[idx] || customer.solarSystem?.batteryImages?.[0]}
                                              title={`Battery #${idx + 1} (${brand}) Hardware Photo`}
                                              buttonLabel={`View Battery #${idx + 1} Photo`}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              <TableRow className="border-b hover:bg-transparent">
                                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Battery Serial #</TableCell>
                                <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                                  {customer.solarSystem?.batterySerial || '—'}
                                </TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-transparent">
                                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Battery Warranty End Date</TableCell>
                                <TableCell className="font-mono text-xs font-semibold text-amber-900">
                                  {formatDate(customer.solarSystem?.batteryWarrantyEnd)}
                                </TableCell>
                              </TableRow>
                            </>
                          )}

                          {/* Battery Photo Small Pop-up Button */}
                          <TableRow className="border-b hover:bg-transparent">
                            <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Battery Photo</TableCell>
                            <TableCell className="text-xs">
                              <EquipmentPhotoViewer
                                imageUrl={customer.solarSystem?.batteryImages?.[0]}
                                title={`${customer.solarSystem?.batteryBrand || 'Battery'} Hardware Photo`}
                                buttonLabel="View Battery Photo"
                                className="h-7 text-xs bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100 font-bold gap-1 px-2.5 shadow-2xs cursor-pointer"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

          </div>
          )
        })()}

        {/* 2.5 System Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <SectionHeader
                leftAction={
                  <ClipboardCheck className="h-4 w-4 text-amber-500 shrink-0" />
                }
                action={
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/audit/${customer.id}?download=true`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Audit Report PDF
                    </a>
                    <a
                      href={`/api/audit/${customer.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#002868] bg-white border border-[#002868] hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View PDF
                    </a>
                  </div>
                }
              >
                System Audit Details & Checklist
              </SectionHeader>

              {/* Recurring & Demand Notice Alert */}
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs text-amber-950 font-medium flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Regular system audits are repeated on a <strong>Quarterly, Half-Yearly, and Yearly</strong> basis as per the subscription plan.
                  </span>
                </div>
                <div className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded text-xs">
                  On Customer On-Demand Audit Request: <span className="text-[#002868]">PKR 3,000/-</span> will be charged
                </div>
              </div>

              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left: Audit Info & Inspector */}
                  <div className="w-full">
                    <SectionHeader>
                      Audit Information & Inspector Details
                    </SectionHeader>
                    <Table>
                      <TableBody>
                        {/* 1st Audit Date */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">1st Audit Date</TableCell>
                          <TableCell className="text-xs font-mono font-semibold text-slate-800">
                            {formatDate(customer.solarSystem?.firstAuditDate || customer.solarSystem?.systemInstallationDate || customer.activationDate || customer.signupDate)}
                          </TableCell>
                        </TableRow>

                        {/* Date of Last Audit */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Date of Last Audit</TableCell>
                          <TableCell className="text-xs font-mono font-bold text-[#002868]">
                            {customer.solarSystem?.lastAuditDate 
                              ? formatDate(customer.solarSystem.lastAuditDate) 
                              : (customer.solarSystem?.systemInstallationDate ? formatDate(customer.solarSystem.systemInstallationDate) : 'Pending Schedule')}
                          </TableCell>
                        </TableRow>

                        {/* Next Scheduled Audit Date */}
                        <TableRow className="border-b hover:bg-transparent bg-amber-50/40">
                          <TableCell className="font-bold text-xs bg-amber-100/60 border-r border-slate-200 text-amber-950">Next Scheduled Audit</TableCell>
                          <TableCell className="text-xs font-mono font-bold text-amber-900">
                            <div className="flex items-center gap-2">
                              <span>
                                {formatDate(
                                  customer.solarSystem?.nextAuditDate ||
                                  calculateNextAuditDate(
                                    customer.solarSystem?.lastAuditDate || customer.solarSystem?.firstAuditDate || customer.activationDate || customer.signupDate,
                                    customer.packagePlan?.packageTier
                                  )
                                )}
                              </span>
                              <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                                {getAuditFrequencyLabel(customer.packagePlan?.packageTier)}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Installer / Auditor Name</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-800">
                            {customer.solarSystem?.installerName || customer.assignedInstaller?.fullName || 'EnergyGurus Technical Team'}
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Auditor Company</TableCell>
                          <TableCell className="text-xs text-slate-700">
                            {customer.solarSystem?.installerCompany || 'EnergyGurus Private Limited'}
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Auditor Contact #</TableCell>
                          <TableCell className="text-xs font-mono text-slate-700">
                            {customer.solarSystem?.installerContact || '0300-0000000'}
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Auditor Email</TableCell>
                          <TableCell className="text-xs text-slate-700">
                            {customer.solarSystem?.installerEmail || 'om@energygurus.com'}
                          </TableCell>
                        </TableRow>

                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">On-Demand Audit Fee</TableCell>
                          <TableCell className="text-xs font-bold text-emerald-800 font-mono">
                            PKR 3,000.00
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Right: 7-Point Audit Checklist Statuses */}
                  <div className="w-full">
                    <SectionHeader>
                      7-Point System Components Audit Checklist
                    </SectionHeader>
                    <Table>
                      <TableBody>
                        {[
                          { label: 'Inverter Status', value: customer.solarSystem?.inverterStatus || 'Good' },
                          { label: 'Solar Panels Status', value: customer.solarSystem?.panelStatus || 'Good' },
                          { label: 'Battery Storage Status', value: customer.solarSystem?.batteryStatus || 'Good' },
                          { label: 'Mounting Structure Status', value: customer.solarSystem?.structureStatus || 'Good' },
                          { label: 'DC/AC Cabling Status', value: customer.solarSystem?.cableStatus || 'Good' },
                          { label: 'AC & DC Earthing Status', value: customer.solarSystem?.earthingStatus || 'Good' },
                          { label: 'Breakers & Protection Status', value: customer.solarSystem?.breakerStatus || 'Good' },
                        ].map((item, idx) => {
                          const isGood = item.value === 'Good' || item.value === 'Excellent'
                          const isFair = item.value === 'Fair'
                          const isAlert = item.value === 'Service Required' || item.value === 'Replacement Required'

                          return (
                            <TableRow key={idx} className="border-b last:border-b-0 hover:bg-transparent">
                              <TableCell className="font-bold text-xs w-48 bg-slate-50 border-r border-slate-200 text-[#002868]">
                                {item.label}
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge
                                  variant="outline"
                                  className={
                                    isGood
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold shadow-xs'
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. Customer Ledger Tab */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* Customer Details Card (2-Column Side by Side) */}
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <SectionHeader>Customer Details</SectionHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left Column: Personal Information */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-40 bg-slate-50 border-r border-slate-200 text-[#002868]">Customer ID:</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-[var(--color-ink)]">
                            {customer.customerCode?.replace(/^[A-Za-z]+-/, '') || customer.id}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer Name:</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.fullName}</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Contact #:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-medium font-mono">{customer.contactNumber}</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">POC #:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-medium font-mono">{customer.pocNumber || '—'}</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Email:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)]">{customer.email || '—'}</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">CNIC #:</TableCell>
                          <TableCell className="text-xs font-mono text-[var(--color-ink)]">{customer.cnic || '—'}</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Address:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)]">
                            {customer.address || '—'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Right Column: System & Plan Specs */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-40 bg-slate-50 border-r border-slate-200 text-[#002868]">System Type:</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {customer.packagePlan?.systemSizeKw || customer.solarSystem?.inverterSize || '1-10 kW'}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Package:</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {customer.packagePlan?.packageTier || 'Moderate'}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Monitoring Time:</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {customer.packagePlan?.monitoringTime || '12 Hours'}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Billing Type:</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {customer.packagePlan?.billingType || 'Quarterly'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Ledger Table */}
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <SectionHeader
                action={
                  <div className="flex gap-2">
                    <a 
                      href={`/api/ledger/${customer.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold shadow-xs transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </a>
                  </div>
                }
              >
                Customer Ledger
              </SectionHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-xs text-[#002868] border-r w-28">Payment Date</TableHead>
                      <TableHead className="font-bold text-xs text-[#002868] border-r w-56">Ref # ( Receipt and Invoice#)</TableHead>
                      <TableHead className="font-bold text-xs text-[#002868] border-r min-w-[240px]">Description</TableHead>
                      <TableHead className="font-bold text-xs text-[#002868] border-r text-right w-24">Debit</TableHead>
                      <TableHead className="font-bold text-xs text-[#002868] border-r text-right w-24">Credit</TableHead>
                      <TableHead className="font-bold text-xs text-[#002868] text-right w-32">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Render database ledger entries for this customer */}
                    {customer.ledgerEntries && customer.ledgerEntries.length > 0 ? (
                      customer.ledgerEntries.map((le: any) => {
                        const rawRef = (le.refNumber || '').trim()
                        const rawNarr = (le.narration || '').trim()
                        const code = rawRef.replace(/^(TX-|DB-ADJ-|CR-ADJ-|Debit Note-|Credit Note-)/i, '').trim()

                        const isDebitNote = rawNarr.toLowerCase().includes('debit note') || rawRef.startsWith('DB-ADJ-') || (rawRef.startsWith('TX-') && Number(le.debit) > 0 && !rawNarr.toLowerCase().includes('invoice') && !rawNarr.toLowerCase().includes('subscription'))
                        const isCreditNote = rawNarr.toLowerCase().includes('credit note') || rawRef.startsWith('CR-ADJ-') || (rawRef.startsWith('TX-') && Number(le.credit) > 0 && !rawNarr.toLowerCase().includes('payment'))

                        let formattedRef = rawRef
                        let formattedNarr = rawNarr

                        if (isDebitNote) {
                          formattedRef = rawRef.startsWith('Debit Note-') ? rawRef : `Debit Note-${code}`
                          let reason = rawNarr
                            .replace(/^Debit Note:\s*/i, '')
                            .replace(/^Package Change Debit Note\s*/i, '')
                            .replace(/^Debit Note charged against\s*/i, '')
                            .trim()
                          if (reason.includes('(') && reason.includes('->')) {
                            reason = 'Package Upgrade'
                          }
                          formattedNarr = `Debit Note charged against ${reason || 'Manual Adjustment'}`
                        } else if (isCreditNote) {
                          formattedRef = rawRef.startsWith('Credit Note-') ? rawRef : `Credit Note-${code}`
                          let reason = rawNarr
                            .replace(/^Credit Note:\s*/i, '')
                            .replace(/^Package Change Credit Note\s*/i, '')
                            .replace(/^Credit Note Adjustment against\s*/i, '')
                            .trim()
                          if (reason.includes('(') && reason.includes('->')) {
                            reason = 'Package Downgrade'
                          }
                          formattedNarr = `Credit Note Adjustment against ${reason || 'Manual Adjustment'}`
                        }

                        const isPayment = !isDebitNote && !isCreditNote && (Number(le.credit) > 0 || rawNarr.toLowerCase().includes('payment') || rawNarr.toLowerCase().includes('collection') || rawRef.startsWith('PAY-') || rawRef.startsWith('RCP-') || rawRef.startsWith('PRV-'))
                        const isReversal = rawRef.startsWith('REV-') || rawNarr.toLowerCase().includes('reversal')
                        const isInvoice = !isDebitNote && !isCreditNote && !isPayment && !isReversal && (le.invoiceId || Number(le.debit) > 0 || rawRef.startsWith('INV-') || rawRef.startsWith('LHR-') || rawNarr.toLowerCase().includes('invoice'))

                        const refLabel = isPayment && !rawRef.startsWith('PRV-') && !rawRef.startsWith('RCP-') && !rawRef.startsWith('PAY-')
                          ? `PRV-${rawRef.replace(/^(INV|TX)-/, '')}`
                          : formattedRef

                        return (
                          <TableRow key={le.id} className="border-b hover:bg-slate-50 text-xs">
                            <TableCell className="font-medium border-r font-mono whitespace-nowrap">{formatDate(le.createdAt)}</TableCell>
                            <TableCell className="font-mono font-semibold border-r">
                              {isDebitNote ? (
                                <a 
                                  href={`/api/note/${le.id || le.refNumber || customer.id}?customerId=${customer.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-red-700 hover:text-red-950 underline font-bold inline-flex items-center gap-1.5 group"
                                  title="View/Download Debit Note Voucher PDF"
                                >
                                  {refLabel}
                                  <span className="p-1 rounded bg-red-100 border border-red-300 shadow-2xs group-hover:bg-red-200 transition-colors">
                                    <Download className="w-3.5 h-3.5 text-red-700" />
                                  </span>
                                </a>
                              ) : isCreditNote ? (
                                <a 
                                  href={`/api/note/${le.id || le.refNumber || customer.id}?customerId=${customer.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-950 underline font-bold inline-flex items-center gap-1.5 group"
                                  title="View/Download Credit Note Voucher PDF"
                                >
                                  {refLabel}
                                  <span className="p-1 rounded bg-emerald-100 border border-emerald-300 shadow-2xs group-hover:bg-emerald-200 transition-colors">
                                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                                  </span>
                                </a>
                              ) : isInvoice ? (
                                <a 
                                  href={`/api/invoice/${le.invoiceId || le.refNumber || customer.id}?customerId=${customer.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#002868] hover:text-blue-950 underline font-bold inline-flex items-center gap-1.5 group"
                                  title="View/Download Invoice PDF"
                                >
                                  {refLabel}
                                  <span className="p-1 rounded bg-amber-100 border border-amber-300 shadow-2xs group-hover:bg-amber-200 transition-colors">
                                    <Download className="w-3.5 h-3.5 text-amber-800" />
                                  </span>
                                </a>
                              ) : isPayment ? (
                                <a 
                                  href={`/api/receipt/${le.id || le.refNumber || customer.id}?customerId=${customer.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-950 underline font-bold inline-flex items-center gap-1.5 group"
                                  title="View/Download Payment Receipt PDF"
                                >
                                  {refLabel || 'PRV-Receipt'}
                                  <span className="p-1 rounded bg-emerald-100 border border-emerald-300 shadow-2xs group-hover:bg-emerald-200 transition-colors">
                                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                                  </span>
                                </a>
                              ) : (
                                <span className={isReversal ? "text-slate-600 font-semibold" : ""}>{refLabel}</span>
                              )}
                            </TableCell>
                            <TableCell className="border-r font-medium">{formattedNarr}</TableCell>
                            <TableCell className="text-right border-r font-medium text-rose-700">{Number(le.debit) > 0 ? Number(le.debit).toLocaleString() : '0'}</TableCell>
                            <TableCell className="text-right border-r font-bold text-emerald-700">{Number(le.credit) > 0 ? Number(le.credit).toLocaleString() : '0'}</TableCell>
                            <TableCell className="text-right font-bold">PKR {Number(le.balance).toLocaleString()}</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                          No ledger transactions recorded yet for this customer. Record a payment or generate an invoice to populate the ledger.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 4. Create Ticket Tab */}
        {activeTab === 'ticket' && (
          <CustomerTicketForm customerId={customer.id} />
        )}

        {/* 5. Complaints Details Tab (Image 2 Layout) */}
        {activeTab === 'complaints' && (
          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <SectionHeader>Complaint History</SectionHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Department</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Ticket Number</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Date & Time</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Service / Category</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Complaint</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Escalation</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Priority</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Status</TableHead>
                    <TableHead className="text-right font-bold text-xs text-[#002868]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!customer.tickets || customer.tickets.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-[var(--color-slate-custom)]">
                        No service complaints found for this customer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customer.tickets.map((t: any) => (
                      <TableRow key={t.id} className="hover:bg-slate-50 border-b text-xs">
                        <TableCell className="font-medium border-r">{t.assignedTo || 'Operation & Maintenance'}</TableCell>
                        <TableCell className="font-mono font-semibold border-r text-[var(--color-graphite)]">{t.ticketNumber}</TableCell>
                        <TableCell className="font-mono text-slate-700 font-semibold border-r">{formatDateTime(t.createdAt)}</TableCell>
                        <TableCell className="border-r">
                          <Badge variant="outline" className="bg-white text-xs font-semibold">{t.category}</Badge>
                          {t.fault && <span className="block text-[11px] text-slate-500">{t.fault}</span>}
                        </TableCell>
                        <TableCell className="border-r text-slate-700">{t.source || 'UAN, Email, Whatsapp'}</TableCell>
                        <TableCell className="border-r text-slate-700">{t.escalation || 'Level-1'}</TableCell>
                        <TableCell className="border-r font-medium">{t.actionPriority || 'High'}</TableCell>
                        <TableCell className="border-r">
                          <Badge 
                            variant="outline"
                            className={
                              t.status === 'PENDING' || t.status === 'Pending'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                                : t.status === 'RESOLVED' || t.status === 'Resolved'
                                ? 'bg-[#002868] text-white border-[#002868] font-semibold'
                                : t.status === 'CLOSED' || t.status === 'Closed'
                                ? 'bg-slate-100 text-slate-900 border-slate-300 font-semibold'
                                : 'bg-sky-100 text-sky-900 border-sky-300 font-semibold'
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <TicketClosedSetupDialog ticket={{ ...t, customer }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 6. Customer History Tab */}
        {activeTab === 'history' && (
          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <SectionHeader
              leftAction={
                <HistoryIcon className="h-4 w-4 text-amber-500 shrink-0" />
              }
              action={
                <Badge variant="outline" className="bg-[#f26522]/10 text-[#f26522] border-[#f26522]/30 text-xs font-medium">
                  Permanent Retention Record
                </Badge>
              }
            >
              Customer Status & Subscription History
            </SectionHeader>

            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-950 font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                All status transitions, plan modifications, disconnections, and termination logs are permanently preserved in history, even if a customer is disconnected, leaves, or is deleted.
              </span>
            </div>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-44">Date & Time</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-36">Action Type</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Status Transition</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Package Details</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Remarks / Notes</TableHead>
                    <TableHead className="text-right font-bold text-xs text-[#002868] w-36">Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const historyList = (customer.customerHistory && customer.customerHistory.length > 0)
                      ? customer.customerHistory
                      : [
                          {
                            id: 'h-auto-3',
                            createdAt: customer.activationDate || customer.createdAt || new Date(),
                            actionType: 'CONNECTION_ACTIVE',
                            oldStatus: 'PENDING_ACTIVATION',
                            newStatus: customer.status || 'CONNECTION_ACTIVE',
                            oldPackage: null,
                            newPackage: customer.packagePlan ? `${customer.packagePlan.packageTier} (${customer.packagePlan.systemSizeKw})` : null,
                            notes: `Customer account activated with status ${customer.status?.replace(/_/g, ' ')}`,
                            performedBy: customer.accountExecutive?.fullName || 'Sales & Activation Team'
                          },
                          ...(customer.signupDate ? [{
                            id: 'h-auto-1',
                            createdAt: customer.signupDate || customer.createdAt,
                            actionType: 'SIGNUP_GENERATED',
                            oldStatus: null,
                            newStatus: 'SIGNUP_GENERATED',
                            oldPackage: null,
                            newPackage: null,
                            notes: `Initial customer signup generated (CRF: ${customer.crfNumber || customer.customerCode})`,
                            performedBy: customer.accountExecutive?.fullName || 'Customer Signup Portal'
                          }] : [])
                        ]

                    return historyList.map((h: any) => (
                      <TableRow key={h.id} className="hover:bg-slate-50 border-b text-xs">
                        <TableCell className="font-mono text-slate-700 font-semibold border-r">
                          {formatDateTime(h.createdAt)}
                        </TableCell>

                        <TableCell className="border-r">
                          <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300 font-mono text-[10px]">
                            {h.actionType?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>

                        <TableCell className="border-r">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {h.oldStatus && (
                              <>
                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px]">
                                  {h.oldStatus.replace(/_/g, ' ')}
                                </Badge>
                                <span className="text-slate-400 font-bold">&rarr;</span>
                              </>
                            )}
                            {h.newStatus ? (
                              <Badge 
                                variant="outline"
                                className={
                                  h.newStatus === 'CONNECTION_ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[11px]'
                                    : h.newStatus === 'PERMANENT_DISCONNECTION' || h.newStatus === 'TERMINATED'
                                    ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold text-[11px]'
                                    : 'bg-amber-100 text-amber-900 border-amber-300 font-semibold text-[11px]'
                                }
                              >
                                {h.newStatus.replace(/_/g, ' ')}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="border-r text-slate-800">
                          {h.oldPackage || h.newPackage ? (
                            <div className="text-[11px]">
                              {h.oldPackage && <span className="text-slate-500 line-through mr-1">{h.oldPackage}</span>}
                              {h.newPackage && <span className="font-semibold text-[#002868]">{h.newPackage}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>

                        <TableCell className="border-r text-slate-700 max-w-[280px]">
                          {h.notes || 'Status transition recorded'}
                        </TableCell>

                        <TableCell className="text-right font-medium text-slate-600">
                          {h.performedBy || 'System Executive'}
                        </TableCell>
                      </TableRow>
                    ))
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 7. SMS History Tab */}
        {activeTab === 'sms-history' && (
          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <SectionHeader
              leftAction={
                <MessageSquare className="h-4 w-4 text-amber-500 shrink-0" />
              }
            >
              SMS Communication History
            </SectionHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-44">Date & Time</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-36">Message Type</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-36">Recipient #</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Message Content</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-28">Status</TableHead>
                    <TableHead className="text-right font-bold text-xs text-[#002868] w-32">Message ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!smsLogs || smsLogs.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                        No SMS logs found for this customer. SMS notifications will be logged here automatically upon invoice creation or reminders.
                      </TableCell>
                    </TableRow>
                  ) : (
                    smsLogs.map((log: any) => (
                      <TableRow key={log.id} className="hover:bg-slate-50 border-b text-xs">
                        <TableCell className="font-mono text-slate-700 font-semibold border-r">
                          {formatDateTime(log.sentAt || log.createdAt)}
                        </TableCell>
                        <TableCell className="border-r">
                          <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300 font-semibold text-[10px]">
                            {log.type === 'INVOICE'
                              ? 'Monthly Bill'
                              : log.type === 'DUE_REMINDER'
                              ? 'Due Alert'
                              : log.type === 'OVERDUE_REMINDER'
                              ? 'Overdue Notice'
                              : log.type?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-slate-800 border-r font-medium">
                          {log.recipient}
                        </TableCell>
                        <TableCell className="border-r text-slate-700 max-w-[340px] leading-relaxed">
                          {log.messageBody}
                          {log.errorDetails && (
                            <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                              Error: {log.errorDetails}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="border-r">
                          {log.status === 'DELIVERED' ? (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[11px]">
                              Delivered
                            </Badge>
                          ) : log.status === 'SENT' ? (
                            <Badge variant="outline" className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-[11px]">
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-[11px]">
                              {log.status === 'UNDELIVERED' ? 'Undelivered' : 'Failed'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-500 text-[11px]">
                          {log.externalId || '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 8. Email History Tab */}
        {activeTab === 'email-history' && (
          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <SectionHeader
              leftAction={
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
              }
              
            >
              Email Communication History
            </SectionHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-44">Date & Time</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-36">Email Type</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-48">Recipient Email</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Subject & Details</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r w-28">Status</TableHead>
                    <TableHead className="text-right font-bold text-xs text-[#002868] w-36">Delivery Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!emailLogs || emailLogs.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                        No email communication logged for this customer yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    emailLogs.map((log: any) => (
                      <TableRow key={log.id} className="hover:bg-slate-50 border-b text-xs">
                        <TableCell className="font-mono text-slate-700 font-semibold border-r">
                          {formatDateTime(log.sentAt || log.createdAt)}
                        </TableCell>
                        <TableCell className="border-r">
                          <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300 font-semibold text-[10px]">
                            {log.type === 'INVOICE'
                              ? 'Invoice Dispatch'
                              : log.type === 'INVITATION'
                              ? 'Account Invite'
                              : log.type?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-slate-800 border-r">
                          {log.recipient}
                        </TableCell>
                        <TableCell className="border-r text-slate-700 max-w-[340px]">
                          <div className="font-semibold text-[#002868]">{log.subject || 'Solar O&M Notification'}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{log.messageBody}</div>
                          {log.errorDetails && (
                            <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                              Error: {log.errorDetails}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="border-r">
                          {log.status === 'OPENED' ? (
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold text-[11px]">
                              Opened
                            </Badge>
                          ) : log.status === 'DELIVERED' ? (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[11px]">
                              Delivered
                            </Badge>
                          ) : log.status === 'SENT' ? (
                            <Badge variant="outline" className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-[11px]">
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-[11px]">
                              {log.status === 'UNDELIVERED' ? 'Undelivered' : 'Failed'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[11px] text-slate-600">
                          {log.deliveredAt ? (
                            <span className="text-emerald-700">Delivered on {formatDate(log.deliveredAt)}</span>
                          ) : log.errorDetails ? (
                            <span className="text-rose-600">Failed / Incorrect Email</span>
                          ) : (
                            <span className="text-slate-400">Dispatched</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}



