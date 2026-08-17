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
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/customers">
          <Button variant="ghost" size="sm" className="text-[var(--color-slate-custom)] hover:text-[var(--color-ink)]">
            ← Back to Customer Search
          </Button>
        </Link>
        <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
              {customer.fullName}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[var(--color-slate-custom)] font-mono text-sm">
                CRF: {customer.crfNumber || customer.customerCode}
              </span>
              <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-line)]">
                {customer.customerType}
              </Badge>
              <Badge 
                variant="outline" 
                className={
                  customer.status === 'CONNECTION_ACTIVE' 
                    ? 'bg-green-100 text-green-800 border-green-200 font-medium'
                    : 'bg-amber-100 text-amber-800 border-amber-200 font-medium'
                }
              >
                {customer.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          {canEditProfile && (
            <div className="flex gap-2">
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
            {/* Customer Details Card */}
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm border-b border-[#001d4a] tracking-wide">
                Customer Profile
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-b hover:bg-transparent">
                      <TableCell className="font-bold text-xs w-48 bg-slate-50 border-r border-slate-200 text-[#002868]">Customer ID</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">{customer.customerCode}</TableCell>
                    </TableRow>
                    <TableRow className="border-b hover:bg-transparent">
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Customer Name</TableCell>
                      <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.fullName}</TableCell>
                    </TableRow>
                    <TableRow className="border-b hover:bg-transparent">
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Installation Address:</TableCell>
                      <TableCell className="text-xs text-[var(--color-ink)]">{customer.address}{customer.block ? `, ${customer.block}` : ''}, {customer.city}, Pakistan</TableCell>
                    </TableRow>
                    <TableRow className="border-b hover:bg-transparent">
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Contact #</TableCell>
                      <TableCell className="text-xs text-[var(--color-ink)] font-medium">{customer.contactNumber}</TableCell>
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
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Email:</TableCell>
                      <TableCell className="text-xs text-[var(--color-ink)]">{customer.email || '—'}</TableCell>
                    </TableRow>
                    <TableRow className="border-b hover:bg-transparent">
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">CRF Number:</TableCell>
                      <TableCell className="font-mono text-xs text-[var(--color-ink)]">{customer.crfNumber || '—'}</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Activation Date:</TableCell>
                      <TableCell className="text-xs text-[var(--color-ink)]">
                        {customer.activationDate ? new Date(customer.activationDate).toLocaleDateString() : (customer.signupDate ? new Date(customer.signupDate).toLocaleDateString() : 'Pending Activation')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Package Details Section parked below Customer Details */}
            <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
              <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm text-center border-b border-[#001d4a] tracking-wide">
                Package Details
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-b hover:bg-transparent">
                      <TableCell className="font-bold text-xs w-48 bg-slate-50 border-r border-slate-200 text-[#002868]">System Type:</TableCell>
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

                    <TableRow className="border-b hover:bg-transparent">
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Billing Type</TableCell>
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

                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Next Billing date</TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        Next billing date will appear as per billing type ({customer.packagePlan?.nextBillingDate ? new Date(customer.packagePlan.nextBillingDate).toLocaleDateString() : 'Calculated automatically'})
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. System Details Tab (Solar System Details matching Excel Mockup) */}
        {activeTab === 'system' && (
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
              <Table>
                <TableBody>
                  {/* Meter Type */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs w-52 bg-slate-50 border-r border-slate-200 text-[#002868]">Meter Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Green Meter', 'Non Green'].map(m => {
                          const isSelected = (customer.solarSystem?.meterType?.toLowerCase() === m.toLowerCase()) || (!customer.solarSystem?.meterType && m === 'Green Meter')
                          return (
                            <Badge 
                              key={m} 
                              variant="outline" 
                              className={isSelected ? "bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-xs" : "bg-slate-50 text-slate-500"}
                            >
                              {isSelected ? '☑ ' : '☐ '} {m}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Zero Export Device */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Zero Export Device</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Installed', 'Not Installed'].map(z => {
                          const isSelected = (customer.solarSystem?.zeroExportDevice && z === 'Installed') || (!customer.solarSystem?.zeroExportDevice && z === 'Not Installed')
                          return (
                            <Badge 
                              key={z} 
                              variant="outline" 
                              className={isSelected ? "bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-xs" : "bg-slate-50 text-slate-500"}
                            >
                              {isSelected ? '☑ ' : '☐ '} {z}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* DISCO */}
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
                      {customer.customerCode || customer.id}
                    </TableCell>
                  </TableRow>

                  {/* Inverter Brand */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Brand</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {['Huawei', 'Solis', 'Growatt', 'Knox', 'Deye', 'Fronius', 'Inverex', 'Sungrow', 'GoodWe', 'Other'].map(b => {
                          const isSelected = customer.solarSystem?.inverterBrand?.toLowerCase() === b.toLowerCase() || (!customer.solarSystem?.inverterBrand && b === 'Huawei')
                          return (
                            <Badge 
                              key={b} 
                              variant="outline" 
                              className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}
                            >
                              {b}
                            </Badge>
                          )
                        })}
                        {customer.solarSystem?.inverterBrand && !['huawei', 'solis', 'growatt', 'knox', 'deye', 'fronius', 'inverex', 'sungrow', 'goodwe', 'other'].includes(customer.solarSystem.inverterBrand.toLowerCase()) && (
                          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold">
                            {customer.solarSystem.inverterBrand}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Inverter Type */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Hybrid', 'On-grid', 'Hybrid + On-grid'].map(it => {
                          const isSelected = (customer.solarSystem?.inverterType?.toLowerCase().replace(/[\s\-_]/g, '') === it.toLowerCase().replace(/[\s\-_+]/g, '')) || (!customer.solarSystem?.inverterType && it === 'Hybrid')
                          return (
                            <Badge key={it} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"} >
                              {isSelected ? '☑ ' : '☐ '} {it}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Inverter Phase Type */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Phase Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Single Phase', 'Three Phase'].map(p => {
                          const isSelected = (customer.solarSystem?.inverterPhase?.toLowerCase().includes(p.toLowerCase().slice(0, 4))) || (!customer.solarSystem?.inverterPhase && p === 'Three Phase')
                          return (
                            <Badge key={p} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
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
                      {customer.solarSystem?.noOfInverters || 1}
                    </TableCell>
                  </TableRow>

                  {/* Inverter Serial # */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Serial #</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                      {customer.solarSystem?.inverterSerial || 'INV-99382'}
                    </TableCell>
                  </TableRow>

                  {/* Inverter Category & Size */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Inverter Category</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['High Voltage', 'Low Voltage'].map(cat => {
                          const isSelected = (customer.solarSystem?.inverterCategory?.toLowerCase() === cat.toLowerCase()) || (!customer.solarSystem?.inverterCategory && cat === 'High Voltage')
                          return (
                            <Badge key={cat} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
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
                      {customer.solarSystem?.inverterSize || '6 kW'}
                    </TableCell>
                  </TableRow>

                  {/* Meter Phase */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Meter Phase</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Single Phase', 'Three Phase'].map(mp => {
                          const isSelected = (customer.solarSystem?.meterPhase?.toLowerCase().includes(mp.toLowerCase().slice(0, 4))) || (!customer.solarSystem?.meterPhase && mp === 'Three Phase')
                          return (
                            <Badge key={mp} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                              {isSelected ? '☑ ' : '☐ '} {mp}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Panel Technology */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Technology</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {['TOPCON', 'ABC', 'HJT', 'HIBC', 'TBC', 'PERC', 'Other'].map(tech => {
                          const isSelected = (customer.solarSystem?.panelTechnology?.toUpperCase().includes(tech)) || (!customer.solarSystem?.panelTechnology && tech === 'TOPCON')
                          return (
                            <Badge key={tech} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                              {isSelected ? '☑ ' : '☐ '} {tech}
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
                            <Badge 
                              key={pb} 
                              variant="outline" 
                              className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}
                            >
                              {pb}
                            </Badge>
                          )
                        })}
                        {customer.solarSystem?.panelBrand && !['aiko', 'longi', 'risen', 'trina solar', 'jinko', 'canadian solar', 'astronergy', 'ja solar', 'other'].includes(customer.solarSystem.panelBrand.toLowerCase()) && (
                          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold">
                            {customer.solarSystem.panelBrand}
                          </Badge>
                        )}
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
                      <span className="text-[10px] text-slate-500 font-normal">(Panel Wattage x No of Panels)</span>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[#002868] bg-sky-50/50">
                      {customer.solarSystem?.totalWattage || ((customer.solarSystem?.panelWattage || 585) * (customer.solarSystem?.noOfPanels || 10))} W ({(((customer.solarSystem?.totalWattage || ((customer.solarSystem?.panelWattage || 585) * (customer.solarSystem?.noOfPanels || 10)))) / 1000).toFixed(2)} kW)
                    </TableCell>
                  </TableRow>

                  {/* Panel Type */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Panel Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Monofacial', 'Bifacial'].map(pt => {
                          const isSelected = (customer.solarSystem?.panelType?.toLowerCase() === pt.toLowerCase()) || (!customer.solarSystem?.panelType && pt === 'Monofacial')
                          return (
                            <Badge key={pt} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                              {isSelected ? '☑ ' : '☐ '} {pt}
                            </Badge>
                          )
                        })}
                      </div>
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
                            <Badge key={bc} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                              {isSelected ? '☑ ' : '☐ '} {bc}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Battery Type */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Battery Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Lithium', 'Lead Acid', 'Dry'].map(bt => {
                          const isSelected = (customer.solarSystem?.batteryType?.toLowerCase().includes(bt.toLowerCase().slice(0, 4))) || (!customer.solarSystem?.batteryType && bt === 'Lithium')
                          return (
                            <Badge key={bt} variant="outline" className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-500"}>
                              {isSelected ? '☑ ' : '☐ '} {bt}
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
                            <Badge 
                              key={bb} 
                              variant="outline" 
                              className={isSelected ? "bg-[#002868] text-white border-[#002868] font-bold shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}
                            >
                              {bb}
                            </Badge>
                          )
                        })}
                        {customer.solarSystem?.batteryBrand && !['dyness', 'narada', 'pylontech', 'sacred sun', 'byd', 'huawei', 'inverex', 'growatt', 'other'].includes(customer.solarSystem.batteryBrand.toLowerCase()) && (
                          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold">
                            {customer.solarSystem.batteryBrand}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* No. of Batteries */}
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">No. of Batteries</TableCell>
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)]">
                      {customer.solarSystem?.noOfBatteries || 2}
                    </TableCell>
                  </TableRow>

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
                          <span className="font-bold text-slate-600 mr-2">Date of Last Check:</span>
                          <span className="text-slate-700 font-medium">
                            {customer.solarSystem?.earthingLastCheck ? new Date(customer.solarSystem.earthingLastCheck).toLocaleDateString() : '6/20/2021'}
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
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)] flex items-center gap-2">
                      <span className="text-slate-500">📅</span>
                      {customer.solarSystem?.systemInstallationDate ? new Date(customer.solarSystem.systemInstallationDate).toLocaleDateString() : (customer.activationDate ? new Date(customer.activationDate).toLocaleDateString() : 'Pending Confirmation')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 3. Customer Ledger Tab (Image 5 Layout) */}
        {activeTab === 'ledger' && (
          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <div className="bg-[#002868] text-white px-4 py-2.5 font-bold text-sm text-center border-b border-[#001d4a] flex justify-between items-center tracking-wide">
              <span className="flex-1 text-center font-bold">Customer Ledger</span>
              <div className="flex gap-2">
                <a 
                  href={`/api/invoice/${customer.id}`} 
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
                  {/* Sample rows matching Image 5 mockup format */}
                  <TableRow className="bg-[#EEF4FB] hover:bg-[#E3EDF8] border-b border-blue-200 text-xs">
                    <TableCell className="font-medium border-r border-blue-200">10-Aug-26</TableCell>
                    <TableCell className="font-mono font-semibold border-r border-blue-200">
                      <a 
                        href={`/api/invoice/LHR-146062`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#002868] hover:text-blue-900 underline font-bold inline-flex items-center gap-1 group"
                        title="Click to view/download Invoice PDF"
                      >
                        LHR-146062
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300 font-bold">PDF</span>
                      </a>
                    </TableCell>
                    <TableCell className="border-r border-blue-200">Sales Invoice</TableCell>
                    <TableCell className="text-right border-r border-blue-200 font-semibold">1,000</TableCell>
                    <TableCell className="text-right border-r border-blue-200">0</TableCell>
                    <TableCell className="text-right font-bold">1,000</TableCell>
                  </TableRow>

                  <TableRow className="bg-[#EEF4FB] hover:bg-[#E3EDF8] border-b border-blue-200 text-xs">
                    <TableCell className="font-medium border-r border-blue-200">12-Aug-26</TableCell>
                    <TableCell className="font-mono font-semibold border-r border-blue-200">PAY-KuickPay-303798</TableCell>
                    <TableCell className="border-r border-blue-200">PAYMENT / COLLECTION AGAINST BILLING BY KUICKPAY</TableCell>
                    <TableCell className="text-right border-r border-blue-200">0</TableCell>
                    <TableCell className="text-right border-r border-blue-200 font-semibold">1000</TableCell>
                    <TableCell className="text-right font-bold">-</TableCell>
                  </TableRow>

                  <TableRow className="bg-[#EEF4FB] hover:bg-[#E3EDF8] border-b border-blue-200 text-xs">
                    <TableCell className="font-medium border-r border-blue-200">1-Sep-26</TableCell>
                    <TableCell className="font-mono font-semibold border-r border-blue-200">
                      <a 
                        href={`/api/invoice/LHR-175946`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#002868] hover:text-blue-900 underline font-bold inline-flex items-center gap-1 group"
                        title="Click to view/download Invoice PDF"
                      >
                        LHR-175946
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300 font-bold">PDF</span>
                      </a>
                    </TableCell>
                    <TableCell className="border-r border-blue-200">RECURRING INVOICE PERIOD Sep-2026</TableCell>
                    <TableCell className="text-right border-r border-blue-200 font-semibold">1000</TableCell>
                    <TableCell className="text-right border-r border-blue-200">0</TableCell>
                    <TableCell className="text-right font-bold">1,000</TableCell>
                  </TableRow>

                  {/* Render additional database ledger entries if any */}
                  {(customer.ledgerEntries || []).map((le: any) => {
                    const isInvoice = le.invoiceId || (le.refNumber && (le.refNumber.startsWith('INV-') || le.refNumber.startsWith('LHR-') || le.narration?.toLowerCase().includes('invoice')))
                    const invoiceTarget = le.invoiceId || le.refNumber || customer.id

                    return (
                      <TableRow key={le.id} className="border-b hover:bg-slate-50 text-xs">
                        <TableCell className="font-medium border-r">{new Date(le.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono font-semibold border-r">
                          {isInvoice ? (
                            <a 
                              href={`/api/invoice/${invoiceTarget}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#002868] hover:text-blue-950 underline font-bold inline-flex items-center gap-1 group"
                              title="Click to view/download Invoice PDF"
                            >
                              {le.refNumber || 'View Invoice'}
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300 font-bold">PDF</span>
                            </a>
                          ) : (
                            le.refNumber
                          )}
                        </TableCell>
                        <TableCell className="border-r">{le.narration}</TableCell>
                        <TableCell className="text-right border-r font-medium text-rose-700">{Number(le.debit) > 0 ? Number(le.debit).toLocaleString() : '0'}</TableCell>
                        <TableCell className="text-right border-r font-medium text-sky-700">{Number(le.credit) > 0 ? Number(le.credit).toLocaleString() : '0'}</TableCell>
                        <TableCell className="text-right font-bold">PKR {Number(le.balance).toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}
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
                        <TableCell className="font-mono text-slate-600 border-r">{new Date(t.createdAt).toLocaleString()}</TableCell>
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
          <Card className="shadow-sm border-slate-200 bg-white max-w-2xl mx-auto">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg font-bold text-[#002868]">Create / Update Solar Plan & Package</CardTitle>
              <CardDescription className="text-xs">Configure system kW capacity, O&M package tier, billing cycle, and hardware setup for this customer.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PackageFormDialog customerId={customer.id} />
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}



