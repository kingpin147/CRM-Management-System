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
    { id: 'package', label: 'Package Details', allowed: true },
    { id: 'ledger', label: 'Customer Ledger', allowed: canViewLedger },
    { id: 'ticket', label: 'Create Ticket', allowed: true },
    { id: 'complaints', label: `Complaints Details (${customer.tickets?.length || 0})`, allowed: true },
    { id: 'plan', label: 'Create Plan', allowed: canEditProfile },
  ]

  const tabs = allTabs.filter(t => t.allowed)
  const activeTab = tabs.some(t => t.id === tab) ? (tab || 'profile') : 'profile'

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

      {/* Tabs Navigation matching Excel Mockup Tabs */}
      <div className="flex space-x-1 border-b border-line overflow-x-auto pb-px bg-emerald-50/30 p-1.5 rounded-t-xl">
        {tabs.map(t => (
          <Link key={t.id} href={`/dashboard/customers/${id}?tab=${t.id}`}>
            <button
              className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-all rounded-t-lg cursor-pointer ${
                activeTab === t.id
                  ? 'border-emerald-600 text-emerald-950 font-bold bg-emerald-100/80 shadow-xs'
                  : 'border-transparent text-gray-600 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              {t.label}
            </button>
          </Link>
        ))}
      </div>


      {/* Tab Content */}
      <div className="mt-6 space-y-6">

        {/* 1. Customer Profile Tab (Image 2 Layout) */}
        {activeTab === 'profile' && (
          <Card className="shadow-sm border-line overflow-hidden bg-white">
            <div className="bg-[#C6E0B4] text-emerald-950 px-4 py-2.5 font-bold text-sm border-b border-emerald-300">
              Customer Profile
            </div>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs w-48 bg-emerald-50/50 border-r text-[var(--color-graphite)]">Customer ID</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">{customer.customerCode}</TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Customer Name</TableCell>
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.fullName}</TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Installation Address:</TableCell>
                    <TableCell className="text-xs text-[var(--color-ink)]">{customer.address}{customer.block ? `, ${customer.block}` : ''}, {customer.city}, Pakistan</TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Contact #</TableCell>
                    <TableCell className="text-xs text-[var(--color-ink)] font-medium">{customer.contactNumber}</TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Customer Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Residential', 'Corporate', 'Industrial'].map(type => (
                          <Badge key={type} variant="outline" className={customer.customerType?.toUpperCase() === type.toUpperCase() ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold" : "bg-gray-50 text-gray-400"}>
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Customer Status</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Active', 'Temporary Blocked', 'Terminated'].map(st => (
                          <Badge key={st} variant="outline" className={
                            customer.status === 'CONNECTION_ACTIVE' && st === 'Active' ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold" :
                            customer.status === 'TEMPORARY_BLOCKED' && st === 'Temporary Blocked' ? "bg-orange-100 text-orange-900 border-orange-300 font-bold" :
                            customer.status === 'PERMANENT_DISCONNECTION' && st === 'Terminated' ? "bg-rose-100 text-rose-900 border-rose-300 font-bold" :
                            "bg-gray-50 text-gray-400"
                          }>
                            {st}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Email:</TableCell>
                    <TableCell className="text-xs text-[var(--color-ink)]">{customer.email || '—'}</TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">CRF Number:</TableCell>
                    <TableCell className="font-mono text-xs text-[var(--color-ink)]">{customer.crfNumber || '—'}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Activation Date:</TableCell>
                    <TableCell className="text-xs text-[var(--color-ink)]">
                      {customer.activationDate ? new Date(customer.activationDate).toLocaleDateString() : (customer.signupDate ? new Date(customer.signupDate).toLocaleDateString() : 'Pending Activation')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 2. Package Details Tab (Image 3 & 4 Layout) */}
        {activeTab === 'package' && (
          <Card className="shadow-sm border-line overflow-hidden bg-white">
            <div className="bg-[#C6E0B4] text-emerald-950 px-4 py-2.5 font-bold text-sm text-center border-b border-emerald-300">
              Package Details
            </div>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs w-48 bg-emerald-50/50 border-r text-[var(--color-graphite)]">System Type:</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2 flex-wrap">
                        {['1 – 10 kW', '10 – 20 kW', '20 – 30 kW', '30 kW & Above'].map(st => (
                          <Badge key={st} variant="outline" className={customer.packagePlan?.systemSizeKw === st || (customer.solarSystem?.inverterSize && customer.solarSystem.inverterSize.includes(st.slice(0, 2))) ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {st}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Package:</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Basic', 'Moderate', 'Comprehensive'].map(pkg => (
                          <Badge key={pkg} variant="outline" className={customer.packagePlan?.packageTier === pkg ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Billing Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2 flex-wrap">
                        {['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'].map(bt => (
                          <Badge key={bt} variant="outline" className={customer.packagePlan?.billingType === bt ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {bt}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Monitoring Time</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['12 hours', '24 hours'].map(mt => (
                          <Badge key={mt} variant="outline" className={customer.packagePlan?.monitoringTime === mt ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {mt}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Next Billing date</TableCell>
                    <TableCell className="text-xs text-gray-600 font-medium">
                      Next billing date will appear as per billing type ({customer.packagePlan?.nextBillingDate ? new Date(customer.packagePlan.nextBillingDate).toLocaleDateString() : 'Calculated automatically'})
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Meter Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Green Meter', 'Non Green'].map(m => (
                          <Badge key={m} variant="outline" className={customer.solarSystem?.meterType === m ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Zero Export Device</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Installed', 'Not Installed'].map(z => (
                          <Badge key={z} variant="outline" className={(customer.solarSystem?.zeroExportDevice && z === 'Installed') || (!customer.solarSystem?.zeroExportDevice && z === 'Not Installed') ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {z}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Inverter Brand</TableCell>
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.solarSystem?.inverterBrand || 'Solis / Huawei'}</TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Inverter Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Hybrid', 'Ongrid', 'Hybrid+Ongrid'].map(it => (
                          <Badge key={it} variant="outline" className={customer.solarSystem?.inverterType === it ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {it}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">No Of Inverter</TableCell>
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.solarSystem?.noOfInverters || 1}</TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Inverter Serial #</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">{customer.solarSystem?.inverterSerial || 'INV-99382'}</TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Panel Type</TableCell>
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.solarSystem?.panelBrand} ({customer.solarSystem?.panelType || 'Monofacial TopCon'})</TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Battery Type</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex gap-2">
                        {['Lithium High Voltage', 'Lithium Voltage Voltage', 'Leadacid'].map(bt => (
                          <Badge key={bt} variant="outline" className={customer.solarSystem?.batteryType?.toLowerCase()?.includes(bt.toLowerCase().slice(0,6)) ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold" : "bg-gray-50 text-gray-500"}>
                            {bt}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">Battery Brand</TableCell>
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.solarSystem?.batteryBrand || 'Pylontech / Narada'}</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-emerald-50/50 border-r text-[var(--color-graphite)]">No Of Battery</TableCell>
                    <TableCell className="text-xs font-semibold text-[var(--color-ink)]">{customer.solarSystem?.noOfBatteries || 2}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 3. Customer Ledger Tab (Image 5 Layout) */}
        {activeTab === 'ledger' && (
          <Card className="shadow-sm border-line overflow-hidden bg-white">
            <div className="bg-[#C6E0B4] text-emerald-950 px-4 py-2.5 font-bold text-sm text-center border-b border-emerald-300">
              Customer Ledger
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-emerald-50/80 border-b border-emerald-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Payment Date</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Ref # ( Receipt and Invoice#)</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Narration</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r text-right">Debit</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r text-right">Credit</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sample rows matching Image 5 mockup format */}
                  <TableRow className="bg-[#DDEBF7] hover:bg-[#DDEBF7]/90 border-b border-blue-200 text-xs">
                    <TableCell className="font-medium border-r border-blue-200">10-Aug-26</TableCell>
                    <TableCell className="font-mono font-semibold border-r border-blue-200">LHR-146062</TableCell>
                    <TableCell className="border-r border-blue-200">Sales Invoice</TableCell>
                    <TableCell className="text-right border-r border-blue-200 font-semibold">1,000</TableCell>
                    <TableCell className="text-right border-r border-blue-200">0</TableCell>
                    <TableCell className="text-right font-bold">1,000</TableCell>
                  </TableRow>

                  <TableRow className="bg-[#DDEBF7] hover:bg-[#DDEBF7]/90 border-b border-blue-200 text-xs">
                    <TableCell className="font-medium border-r border-blue-200">12-Aug-26</TableCell>
                    <TableCell className="font-mono font-semibold border-r border-blue-200">PAY-KuickPay-303798</TableCell>
                    <TableCell className="border-r border-blue-200">PAYMENT / COLLECTION AGAINST BILLING BY KUICKPAY</TableCell>
                    <TableCell className="text-right border-r border-blue-200">0</TableCell>
                    <TableCell className="text-right border-r border-blue-200 font-semibold">1000</TableCell>
                    <TableCell className="text-right font-bold">-</TableCell>
                  </TableRow>

                  <TableRow className="bg-[#DDEBF7] hover:bg-[#DDEBF7]/90 border-b border-blue-200 text-xs">
                    <TableCell className="font-medium border-r border-blue-200">1-Sep-26</TableCell>
                    <TableCell className="font-mono font-semibold border-r border-blue-200">LHR-175946</TableCell>
                    <TableCell className="border-r border-blue-200">RECURRING INVOICE PERIOD Sep-2026</TableCell>
                    <TableCell className="text-right border-r border-blue-200 font-semibold">1000</TableCell>
                    <TableCell className="text-right border-r border-blue-200">0</TableCell>
                    <TableCell className="text-right font-bold">1,000</TableCell>
                  </TableRow>

                  {/* Render additional database ledger entries if any */}
                  {(customer.ledgerEntries || []).map((le: any) => (
                    <TableRow key={le.id} className="border-b hover:bg-gray-50 text-xs">
                      <TableCell className="font-medium border-r">{new Date(le.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono font-semibold border-r">{le.refNumber}</TableCell>
                      <TableCell className="border-r">{le.narration}</TableCell>
                      <TableCell className="text-right border-r font-medium text-rose-700">{Number(le.debit) > 0 ? Number(le.debit).toLocaleString() : '0'}</TableCell>
                      <TableCell className="text-right border-r font-medium text-emerald-700">{Number(le.credit) > 0 ? Number(le.credit).toLocaleString() : '0'}</TableCell>
                      <TableCell className="text-right font-bold">PKR {Number(le.balance).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
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
          <Card className="shadow-sm border-line overflow-hidden bg-white">
            <div className="bg-[#C6E0B4] text-emerald-950 px-4 py-2.5 font-bold text-sm text-center border-b border-emerald-300">
              Complaint History
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-emerald-50/80 border-b border-emerald-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Department</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Ticket Number</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">DateTime</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Service/Category</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Complain</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Escalation</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Priorty</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] border-r">Status</TableHead>
                    <TableHead className="text-right font-bold text-xs text-[var(--color-graphite)]">Action</TableHead>
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
                      <TableRow key={t.id} className="hover:bg-gray-50 border-b text-xs">
                        <TableCell className="font-medium border-r">{t.assignedTo || 'Operation & Maintenance'}</TableCell>
                        <TableCell className="font-mono font-semibold border-r text-[var(--color-graphite)]">{t.ticketNumber}</TableCell>
                        <TableCell className="font-mono text-gray-600 border-r">{new Date(t.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="border-r">
                          <Badge variant="outline" className="bg-white text-xs font-semibold">{t.category}</Badge>
                          {t.fault && <span className="block text-[11px] text-gray-500">{t.fault}</span>}
                        </TableCell>
                        <TableCell className="border-r text-gray-700">{t.source || 'UAN, Email, Whatsapp'}</TableCell>
                        <TableCell className="border-r text-gray-700">{t.escalation || 'Level-1'}</TableCell>
                        <TableCell className="border-r font-medium">{t.actionPriority || 'High'}</TableCell>
                        <TableCell className="border-r">
                          <Badge 
                            variant="outline"
                            className={
                              t.status === 'PENDING' || t.status === 'Pending'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                                : t.status === 'RESOLVED' || t.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                                : t.status === 'CLOSED' || t.status === 'Closed'
                                ? 'bg-gray-100 text-gray-900 border-gray-300 font-semibold'
                                : 'bg-blue-100 text-blue-900 border-blue-300 font-semibold'
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
          <Card className="shadow-sm border-line bg-white max-w-2xl mx-auto">
            <CardHeader className="border-b border-line">
              <CardTitle className="text-lg font-bold text-[var(--color-graphite)]">Create / Update Solar Plan & Package</CardTitle>
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


