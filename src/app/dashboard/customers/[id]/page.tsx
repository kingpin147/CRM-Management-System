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
import { Sun, Battery, ShieldCheck, Zap, Receipt, MessageSquare, Mail, History as HistoryIcon, Download } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { createClient } from '@/utils/supabase/server'


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
  const userRole = dbUser?.role || 'SUPER_ADMIN'

  const rawCustomer = await prisma.customer.findUnique({
    where: { id },
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
    }
  })

  if (!rawCustomer) {
    notFound()
  }

  // Sanitize Decimal and custom instances to plain JSON primitives
  const customer = JSON.parse(JSON.stringify(rawCustomer))

  const canViewLedger = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)
  const canEditProfile = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)
  const canEditSolarSpecs = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'INSTALLATION'].includes(userRole)
  const canRecordPayment = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)

  const allTabs = [
    { id: 'profile', label: 'Customer Profile', allowed: true },
    { id: 'system', label: 'System Details', allowed: true },
    { id: 'ledger', label: 'Customer Ledger', allowed: canViewLedger },
    { id: 'ticket', label: 'Create Ticket', allowed: true },
    { id: 'complaints', label: `Complaints Details (${customer.tickets?.length || 0})`, allowed: true },
    { id: 'plan', label: 'Create Plan', allowed: canEditProfile },
  ]

  const tabs = allTabs.filter(t => t.allowed)
  const currentTab = tab === 'package' ? 'system' : (tab || 'profile')
  const activeTab = tabs.some(t => t.id === currentTab) ? currentTab : 'profile'

  // Compute ledger financial summaries
  const totalInvoiced = (customer.invoices || []).reduce((acc: number, inv: any) => acc + (Number(inv.totalAmount) || 0), 0)
  const totalPaid = (customer.transactions || []).reduce((acc: number, tx: any) => acc + (Number(tx.amount) || 0), 0)
  const currentBalance = (customer.ledgerEntries && customer.ledgerEntries.length > 0)
    ? Number(customer.ledgerEntries[0].balance)
    : (totalInvoiced - totalPaid)

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
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
              {customer.fullName}
            </h1>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-[var(--color-slate-custom)] font-mono text-xs sm:text-sm">
                CRF: {customer.crfNumber || customer.customerCode}
              </span>
              <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-line)] text-xs">
                {customer.customerType}
              </Badge>
              <Badge 
                variant="outline" 
                className={
                  customer.status === 'CONNECTION_ACTIVE' 
                    ? 'bg-green-100 text-green-800 border-green-200 font-medium text-xs'
                    : 'bg-amber-100 text-amber-800 border-amber-200 font-medium text-xs'
                }
              >
                {customer.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          {canEditProfile && (
            <div className="flex gap-2 shrink-0">
              <EditCustomerDialog customer={customer} />
            </div>
          )}
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
                ? 'border-[#002868] text-white font-bold bg-[#002868] shadow-xs'
                : 'border-transparent text-slate-600 hover:text-[#002868] hover:bg-slate-200/60'
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
              <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm border-b border-[#001d4a] tracking-wide">
                Customer Profile
              </div>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left Column: Personal & Contact Information */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Customer ID</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-[var(--color-ink)]">
                            {customer.customerCode?.replace(/^[A-Za-z]+-/, '') || customer.id}
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
                          <TableCell className="text-xs text-[var(--color-ink)]">{customer.address}{customer.block ? `, ${customer.block}` : ''}, {customer.city}, Pakistan</TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer Type</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Residential', 'Corporate', 'Industrial'].map(type => (
                                <Badge key={type} variant="outline" className={customer.customerType?.toUpperCase() === type.toUpperCase() ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-400"}>
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer Status</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Active', 'Temporary Blocked', 'Terminated'].map(st => (
                                <Badge key={st} variant="outline" className={
                                  customer.status === 'CONNECTION_ACTIVE' && st === 'Active' ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" :
                                  customer.status === 'TEMPORARY_BLOCKED' && st === 'Temporary Blocked' ? "bg-amber-100 text-amber-900 border-amber-300 font-bold" :
                                  customer.status === 'PERMANENT_DISCONNECTION' && st === 'Terminated' ? "bg-rose-100 text-rose-900 border-rose-300 font-bold" :
                                  "bg-slate-50 text-slate-400"
                                }>
                                  {st}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">CRF Number:</TableCell>
                          <TableCell className="font-mono text-xs text-[var(--color-ink)]">{customer.crfNumber || '—'}</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Activation Date:</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-semibold font-mono">
                            {customer.activationDate ? formatDate(customer.activationDate) : (customer.signupDate ? formatDate(customer.signupDate) : 'Pending Activation')}
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
              <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm text-center border-b border-[#001d4a] tracking-wide">
                Package Details
              </div>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left Column: System & Package Spec */}
                  <div className="w-full">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">System Type:</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2 flex-wrap">
                              {['1 – 10 kW', '10 – 20 kW', '20 – 30 kW', '30 kW & Above'].map(st => (
                                <Badge key={st} variant="outline" className={customer.packagePlan?.systemSizeKw === st || (customer.solarSystem?.inverterSize && customer.solarSystem.inverterSize.includes(st.slice(0, 2))) ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                  {st}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Package:</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Basic', 'Moderate', 'Comprehensive'].map(pkg => (
                                <Badge key={pkg} variant="outline" className={customer.packagePlan?.packageTier === pkg ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                  {pkg}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Monitoring Time</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['12 hours', '24 hours'].map(mt => (
                                <Badge key={mt} variant="outline" className={customer.packagePlan?.monitoringTime === mt ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                  {mt}
                                </Badge>
                              ))}
                            </div>
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
                            <div className="flex gap-2 flex-wrap">
                              {['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'].map(bt => (
                                <Badge key={bt} variant="outline" className={customer.packagePlan?.billingType === bt ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                  {bt}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Subscription Charges</TableCell>
                          <TableCell className="text-xs font-bold text-[#002868] font-mono">
                            PKR {Number(customer.packagePlan?.totalAmount || customer.packagePlan?.monthlyBasePrice || 50000).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Next Billing date</TableCell>
                          <TableCell className="text-xs text-[var(--color-ink)] font-semibold font-mono">
                            {formatDate(customer.packagePlan?.nextBillingDate)}
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
            : ['Huawei']
          const invSerials = customer.solarSystem?.inverterSerial 
            ? customer.solarSystem.inverterSerial.split(',').map((s: string) => s.trim()).filter(Boolean)
            : []
          const noOfInverters = Math.max(1, Number(customer.solarSystem?.noOfInverters) || 1, invBrands.length, invSerials.length)

          const batSerials = customer.solarSystem?.batterySerial 
            ? customer.solarSystem.batterySerial.split(',').map((s: string) => s.trim()).filter(Boolean)
            : []
          const noOfBatteries = Math.max(1, Number(customer.solarSystem?.noOfBatteries) || 1, batSerials.length)
          const catBadge = (c: string) => c.toLowerCase() === 'high voltage' ? 'High' : 'Low'

          return (
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm text-center border-b border-[#001d4a] flex justify-between items-center tracking-wide">
                <span className="flex-1 text-center font-bold">Solar System Details</span>
                {canEditSolarSpecs && (
                  <div className="shrink-0">
                    <SolarSystemDialog customerId={customer.id} solarSystem={customer.solarSystem} />
                  </div>
                )}
              </div>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Left Column: Grid Connection, Inverters, Grounding & Installation */}
                  <div className="w-full">
                    <div className="bg-slate-100/80 px-4 py-2 text-xs font-bold text-[#002868] border-b border-slate-200 uppercase tracking-wider">
                      Grid Connection & Inverter System
                    </div>
                    <Table>
                      <TableBody>
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Meter Type</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Green Meter', 'Non Green'].map(m => {
                                const isSelected = (customer.solarSystem?.meterType?.toLowerCase() === m.toLowerCase()) || (!customer.solarSystem?.meterType && m === 'Green Meter')
                                return (
                                  <Badge key={m} variant="outline" className={isSelected ? "bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                    {isSelected ? '☑ ' : '☐ '} {m}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Zero Export Device</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Installed', 'Not Installed'].map(z => {
                                const isSelected = (customer.solarSystem?.zeroExportDevice && z === 'Installed') || (!customer.solarSystem?.zeroExportDevice && z === 'Not Installed')
                                return (
                                  <Badge key={z} variant="outline" className={isSelected ? "bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                    {isSelected ? '☑ ' : '☐ '} {z}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">DISCO</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)] bg-sky-50/60 w-fit">
                            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200 font-bold">
                              {customer.solarSystem?.disco || 'LESCO'}
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* Customer ID */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer ID</TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                            {customer.customerCode?.replace(/^[A-Za-z]+-/, '') || customer.customerCode || customer.id}
                          </TableCell>
                        </TableRow>

                        {/* Inverter Brand */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Brand</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {['Huawei', 'Solis', 'Growatt', 'Knox', 'Deye', 'Fronius', 'Inverex', 'Sungrow', 'GoodWe', 'Other'].map(b => {
                                const isSelected = invBrands.some((ib: string) => ib.toLowerCase() === b.toLowerCase()) || (!customer.solarSystem?.inverterBrand && b === 'Huawei')
                                return (
                                  <Badge key={b} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}>
                                    {b}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Inverter Type */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Type</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Hybrid', 'On-grid', 'Hybrid + On-grid'].map(t => {
                                const isSelected = (customer.solarSystem?.inverterType?.toLowerCase() === t.toLowerCase()) || (!customer.solarSystem?.inverterType && t === 'Hybrid')
                                return (
                                  <Badge key={t} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"} >
                                    {isSelected ? '☑ ' : '☐ '} {t}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Inverter Phase */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Phase Type</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Single Phase', 'Three Phase'].map(p => {
                                const isSelected = (customer.solarSystem?.inverterPhase?.toLowerCase() === p.toLowerCase()) || (!customer.solarSystem?.inverterPhase && p === 'Three Phase')
                                return (
                                  <Badge key={p} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"} >
                                    {isSelected ? '☑ ' : '☐ '} {p}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Inverter Category */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Category</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['High Voltage', 'Low Voltage'].map(cat => {
                                const isSelected = (customer.solarSystem?.inverterCategory?.toLowerCase() === cat.toLowerCase()) || (!customer.solarSystem?.inverterCategory && cat === 'Low Voltage')
                                return (
                                  <Badge key={cat} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"} >
                                    {isSelected ? '☑ ' : '☐ '} {cat}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Inverter Size */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Size</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {customer.solarSystem?.inverterSize || '10 kW'}
                          </TableCell>
                        </TableRow>

                        {/* Meter Phase */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Meter Phase</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2">
                              {['Single Phase', 'Three Phase'].map(p => {
                                const isSelected = (customer.solarSystem?.meterPhase?.toLowerCase() === p.toLowerCase()) || (!customer.solarSystem?.meterPhase && p === 'Three Phase')
                                return (
                                  <Badge key={p} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"} >
                                    {isSelected ? '☑ ' : '☐ '} {p}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* No. of Inverters */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">No. of Inverters</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {noOfInverters}
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
                                  const brand = invBrands[idx] || invBrands[0] || customer.solarSystem?.inverterBrand || 'Huawei'
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
                                          {formatDate(customer.solarSystem?.inverterWarrantyEnd)}
                                        </span>
                                      </div>
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

                        {/* Earthing / OHMs */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Earthing & OHMs</TableCell>
                          <TableCell className="text-xs p-0">
                            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-t-0">
                              <div className="p-2.5">
                                <span className="font-bold text-slate-600 mr-2">AC:</span>
                                <span className="font-semibold text-[#002868]">{Number(customer.solarSystem?.earthingAcOhms) || 0.5} Ω</span>
                              </div>
                              <div className="p-2.5">
                                <span className="font-bold text-slate-600 mr-2">DC:</span>
                                <span className="font-semibold text-[#002868]">{Number(customer.solarSystem?.earthingDcOhms) || 0.5} Ω</span>
                              </div>
                              <div className="p-2.5 bg-slate-50/50">
                                <span className="font-bold text-slate-600 mr-2">Last Check:</span>
                                <span className="text-slate-700 font-medium">
                                  {formatDate(customer.solarSystem?.earthingLastCheck || '2021-06-20')}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Ingress Protection (IP) */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Ingress Protection (IP)</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-2 flex-wrap">
                              {['20', '21', '34', '40', '65', '67'].map(ip => {
                                const isSelected = (customer.solarSystem?.ingressProtection === ip) || (!customer.solarSystem?.ingressProtection && ip === '20')
                                return (
                                  <Badge key={ip} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                    IP {ip}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Structure Type */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Structure Type</TableCell>
                          <TableCell className="text-xs space-y-2">
                            <div className="flex gap-2">
                              {['Elevated', 'Standard'].map(st => {
                                const isSelected = (customer.solarSystem?.structureType?.toLowerCase() === st.toLowerCase()) || (!customer.solarSystem?.structureType && st === 'Elevated')
                                return (
                                  <Badge key={st} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                    {isSelected ? '☑ ' : '☐ '} {st}
                                  </Badge>
                                )
                              })}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {['Painted', 'Aluminium (L1)', 'Aluminium (L2)', 'Hot Dip Galvanized (L1)', 'Pre Galvanized (L2)'].map(mat => {
                                const isSelected = (customer.solarSystem?.structureMaterial?.toLowerCase().includes(mat.toLowerCase().slice(0, 5))) || (!customer.solarSystem?.structureMaterial && mat === 'Painted')
                                return (
                                  <Badge key={mat} variant="outline" className={isSelected ? "bg-amber-100 text-amber-950 border-amber-400 font-semibold" : "bg-slate-50 text-slate-500"}>
                                    {mat}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* System Installation Date */}
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">System Installation Date</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)] flex items-center gap-2 font-mono">
                            <span className="text-slate-500">📅</span>
                            {formatDate(customer.solarSystem?.systemInstallationDate || customer.activationDate || customer.signupDate)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Right Column: Solar Array, Battery Storage */}
                  <div className="w-full">
                    <div className="bg-slate-100/80 px-4 py-2 text-xs font-bold text-[#002868] border-b border-slate-200 uppercase tracking-wider">
                      PV Panels & Battery Energy Storage
                    </div>
                    <Table>
                      <TableBody>
                        {/* Panel Technology */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs w-44 bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Technology</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex flex-wrap gap-1.5">
                              {['TOPCON', 'ABC', 'HJT', 'HIBC', 'TBC', 'PERC', 'Other'].map(tech => {
                                const isSelected = (customer.solarSystem?.panelTechnology?.toUpperCase().includes(tech)) || (!customer.solarSystem?.panelTechnology && tech === 'TOPCON')
                                return (
                                  <Badge key={tech} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                                    {tech}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Panel Brand */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Brand</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {['AIKO', 'LONGi', 'Risen', 'Trina Solar', 'Jinko', 'Canadian Solar', 'Astronergy', 'JA Solar', 'Other'].map(pb => {
                                const isSelected = customer.solarSystem?.panelBrand?.toLowerCase() === pb.toLowerCase() || (!customer.solarSystem?.panelBrand && pb === 'AIKO')
                                return (
                                  <Badge key={pb} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}>
                                    {pb}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Panel Wattage & No of Panels */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Wattage</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {customer.solarSystem?.panelWattage || 585} W
                          </TableCell>
                        </TableRow>

                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">No of Panels</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {customer.solarSystem?.noOfPanels || 10}
                          </TableCell>
                        </TableRow>

                        {/* Total Wattage */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">
                            <div>Total Wattage</div>
                            <span className="text-[10px] text-slate-500 font-normal">(Wattage x Panels)</span>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-[#002868] bg-sky-50/50">
                            {customer.solarSystem?.totalWattage || ((customer.solarSystem?.panelWattage || 585) * (customer.solarSystem?.noOfPanels || 10))} W ({(((customer.solarSystem?.totalWattage || ((customer.solarSystem?.panelWattage || 585) * (customer.solarSystem?.noOfPanels || 10)))) / 1000).toFixed(2)} kW)
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
                            <div className="flex gap-2">
                              {['High Voltage', 'Low Voltage'].map(bc => {
                                const isSelected = (customer.solarSystem?.batteryCategory?.toLowerCase() === bc.toLowerCase()) || (!customer.solarSystem?.batteryCategory && bc === 'High Voltage')
                                return (
                                  <Badge key={bc} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"} >
                                    {isSelected ? '☑ ' : '☐ '} {catBadge(bc)}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Battery Brand */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Battery Brand</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {['Dyness', 'Narada', 'Pylontech', 'Sacred Sun', 'BYD', 'Huawei', 'Inverex', 'Growatt', 'Other'].map(bb => {
                                const isSelected = customer.solarSystem?.batteryBrand?.toLowerCase() === bb.toLowerCase() || (!customer.solarSystem?.batteryBrand && bb === 'Dyness')
                                return (
                                  <Badge key={bb} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}>
                                    {bb}
                                  </Badge>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* No. of Batteries */}
                        <TableRow className="border-b hover:bg-transparent">
                          <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">No. of Batteries</TableCell>
                          <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                            {noOfBatteries}
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
                                  const brand = customer.solarSystem?.batteryBrand || 'Dyness'
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
                                          {formatDate(customer.solarSystem?.batteryWarrantyEnd)}
                                        </span>
                                      </div>
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
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {/* 3. Customer Ledger Tab (Image 5 Layout) */}
        {activeTab === 'ledger' && (
          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm text-center border-b border-[#001d4a] flex justify-between items-center tracking-wide">
              <span className="flex-1 text-center font-bold">Customer Ledger</span>
              <div className="flex gap-2">
                <a 
                  href={`/api/invoice/${customer.invoices?.[0]?.id || customer.id}?customerId=${customer.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold shadow-xs transition-all"
                >
                  <Receipt className="w-3.5 h-3.5 text-white" />
                  View Invoice PDF
                </a>
              </div>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Payment Date</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Ref # ( Receipt and Invoice#)</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Narration</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r text-right">Debit</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r text-right">Credit</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Render database ledger entries for this customer */}
                  {customer.ledgerEntries && customer.ledgerEntries.length > 0 ? (
                    customer.ledgerEntries.map((le: any) => {
                      const isPayment = Number(le.credit) > 0 || le.narration?.toLowerCase().includes('payment') || le.narration?.toLowerCase().includes('collection') || le.refNumber?.startsWith('PAY-') || le.refNumber?.startsWith('RCP-') || le.refNumber?.startsWith('PRV-')
                      const isReversal = le.refNumber?.startsWith('REV-') || le.narration?.toLowerCase().includes('reversal')
                      const isInvoice = !isPayment && !isReversal && (le.invoiceId || Number(le.debit) > 0 || le.refNumber?.startsWith('INV-') || le.refNumber?.startsWith('LHR-') || le.narration?.toLowerCase().includes('invoice'))

                      const refLabel = isPayment && !le.refNumber?.startsWith('PRV-') && !le.refNumber?.startsWith('RCP-') && !le.refNumber?.startsWith('PAY-')
                        ? `PRV-${le.refNumber.replace(/^(INV|TX)-/, '')}`
                        : le.refNumber

                      return (
                        <TableRow key={le.id} className="border-b hover:bg-slate-50 text-xs">
                          <TableCell className="font-medium border-r font-mono">{formatDate(le.createdAt)}</TableCell>
                          <TableCell className="font-mono font-semibold border-r">
                            {isInvoice ? (
                              <a 
                                href={`/api/invoice/${le.invoiceId || le.refNumber || customer.id}?customerId=${customer.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#002868] hover:text-blue-950 underline font-bold inline-flex items-center gap-1 group"
                                title="Click to view/download Invoice PDF"
                              >
                                {le.refNumber || 'View Invoice'}
                                <span className="text-[10px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300 font-bold">Invoice PDF</span>
                              </a>
                            ) : isPayment ? (
                              <a 
                                href={`/api/receipt/${le.id || le.refNumber || customer.id}?customerId=${customer.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-950 underline font-bold inline-flex items-center gap-1 group"
                                title="Click to view/download Payment Receipt Voucher PDF"
                              >
                                {refLabel || 'PRV-Receipt'}
                                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1 py-0.2 rounded border border-emerald-300 font-bold">Voucher PDF</span>
                              </a>
                            ) : (
                              <span className={isReversal ? "text-slate-600 font-semibold" : ""}>{le.refNumber}</span>
                            )}
                          </TableCell>
                          <TableCell className="border-r">{le.narration}</TableCell>
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
        )}

        {/* 4. Create Ticket Tab */}
        {activeTab === 'ticket' && (
          <CustomerTicketForm customerId={customer.id} />
        )}

        {/* 5. Complaints Details Tab (Image 2 Layout) */}
        {activeTab === 'complaints' && (
          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm text-center border-b border-[#001d4a] tracking-wide">
              Complaint History
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Department</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Ticket Number</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">DateTime</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Service/Category</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Complain</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Escalation</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] border-r">Priorty</TableHead>
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

        {/* 6. Create Plan Tab */}
        {activeTab === 'plan' && (
          <Card className="shadow-sm border-slate-200 bg-white max-w-4xl mx-auto overflow-hidden">
            <div className="bg-[#002868] text-white px-6 py-3 font-bold text-sm border-b border-[#001d4a]">
              Create / Update Solar Plan & Package
            </div>
            <CardContent className="p-6">
              <PackageFormDialog customerId={customer.id} inline={true} />
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}



