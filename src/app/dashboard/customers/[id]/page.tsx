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
import { toggleInvoiceStatus } from './actions'
import { CustomerTicketForm } from './CustomerTicketForm'
import { TicketUpdateDialog } from '@/app/dashboard/tickets/TicketUpdateDialog'
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
    { id: 'solar', label: 'Solar System Details', allowed: true },
    { id: 'ledger', label: 'Customer Ledger & Invoices', allowed: canViewLedger },
    { id: 'ticket', label: 'Create Ticket', allowed: true },
    { id: 'complaints', label: `Complaints (${customer.tickets?.length || 0})`, allowed: true },
    { id: 'history', label: 'Customer History', allowed: true },
    { id: 'message', label: 'Message & Email Logs', allowed: true },
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
            ← Back to Customers
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

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-line overflow-x-auto pb-px">
        {tabs.map(t => (
          <Link key={t.id} href={`/dashboard/customers/${id}?tab=${t.id}`}>
            <button
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'border-[var(--color-amber)] text-[var(--color-graphite)] font-bold bg-white/50'
                  : 'border-transparent text-[var(--color-slate-custom)] hover:text-[var(--color-ink)] hover:border-line'
              }`}
            >
              {t.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">

        {/* 1. Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-line col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Personal & Contact Details</CardTitle>
                <CardDescription>Primary profile information registered for EnergyGurus O&M services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Contact Number</p>
                    <p className="text-[var(--color-ink)] font-medium mt-0.5">{customer.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Email</p>
                    <p className="text-[var(--color-ink)] font-medium mt-0.5">{customer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">CNIC</p>
                    <p className="text-[var(--color-ink)] font-mono font-medium mt-0.5">{customer.cnic}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Signup Date</p>
                    <p className="text-[var(--color-ink)] font-medium mt-0.5">{customer.signupDate ? new Date(customer.signupDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Address</p>
                    <p className="text-[var(--color-ink)] font-medium mt-0.5">
                      {customer.address}{customer.block ? `, ${customer.block}` : ''}, {customer.city}, Pakistan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 col-span-1">
              <Card className="shadow-sm border-line bg-gradient-to-br from-[var(--color-amber)]/5 to-[var(--color-teal)]/5">
                <CardHeader>
                  <CardTitle>Package & Quotation</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.packagePlan ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-slate-custom)] text-sm">Tier</span>
                        <Badge variant="outline" className="font-semibold bg-white">{customer.packagePlan.packageTier}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-slate-custom)] text-sm">System Size</span>
                        <span className="font-medium text-[var(--color-ink)]">{customer.packagePlan.systemSizeKw}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-slate-custom)] text-sm">Billing Type</span>
                        <span className="font-medium text-[var(--color-ink)]">{customer.packagePlan.billingType}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[var(--color-line)]">
                        <span className="text-[var(--color-slate-custom)] text-sm font-semibold">Total Fee</span>
                        <span className="font-bold text-base text-[var(--color-amber)]">
                          PKR {Number(customer.packagePlan.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[var(--color-slate-custom)] text-sm mb-3">No package assigned yet.</p>
                      <PackageFormDialog customerId={customer.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 2. Solar System Specs Tab */}
        {activeTab === 'solar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-graphite)]">Solar Equipment & Infrastructure</h3>
                <p className="text-xs text-[var(--color-slate-custom)]">Detailed technical asset inventory for this installation.</p>
              </div>
              {canEditSolarSpecs && (
                <SolarSystemDialog customerId={customer.id} solarSystem={customer.solarSystem} />
              )}
            </div>

            {customer.solarSystem ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inverter Card */}
                <Card className="shadow-sm border-line">
                  <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                    <Sun className="h-5 w-5 text-[var(--color-amber)]" />
                    <CardTitle className="text-base font-bold">Inverter Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Brand & Capacity</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.inverterBrand} ({customer.solarSystem.inverterSize || 'N/A'})</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Type & Phase</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.inverterType} • {customer.solarSystem.inverterPhase}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Serial Number</p>
                      <p className="font-mono text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.inverterSerial || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Inverters Qty</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.noOfInverters || 1} Unit(s)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Panels Array Card */}
                <Card className="shadow-sm border-line">
                  <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                    <Zap className="h-5 w-5 text-[var(--color-teal)]" />
                    <CardTitle className="text-base font-bold">Photovoltaic Array</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Panel Brand & Type</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.panelBrand} ({customer.solarSystem.panelType})</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Cell Technology</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.panelTechnology || 'Topcon'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Total Array Capacity</p>
                      <p className="text-[var(--color-ink)] font-bold text-sm mt-0.5">{customer.solarSystem.noOfPanels} Panels ({(customer.solarSystem.totalWattage / 1000).toFixed(2)} kW)</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Per-Panel Wattage</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.panelWattage} Watts</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Battery Bank Card */}
                <Card className="shadow-sm border-line">
                  <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                    <Battery className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-base font-bold">Energy Storage Battery</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Battery Brand</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.batteryBrand || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Chemistry</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.batteryType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Battery Units</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.noOfBatteries || 0} Unit(s)</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Serial #</p>
                      <p className="font-mono text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.batterySerial || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Grid & Electrical Protection Card */}
                <Card className="shadow-sm border-line">
                  <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base font-bold">Grid, Meter & Grounding</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">DISCO & Meter</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.disco || 'LESCO'} ({customer.solarSystem.meterType})</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Ground Resistance</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">AC: {customer.solarSystem.earthingAcOhms || 1.2}Ω • DC: {customer.solarSystem.earthingDcOhms || 0.8}Ω</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Lightning Protection</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.lightningProtection ? 'Protected (Class II SPD)' : 'Not Installed'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-slate-custom)] font-medium">Structure Type</p>
                      <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.solarSystem.structureType || 'Elevated GI'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-sm border-line p-8 text-center">
                <p className="text-sm text-[var(--color-slate-custom)] mb-4">No equipment specs configured for this client yet.</p>
                {canEditSolarSpecs && (
                  <div className="flex justify-center">
                    <SolarSystemDialog customerId={customer.id} />
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* 3. Customer Ledger & Invoices Tab */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="glass-card hover-lift">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase tracking-wider">Total Invoiced</p>
                  <p className="text-2xl font-bold text-[var(--color-graphite)] mt-1">PKR {totalInvoiced.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover-lift border-emerald-200/60 bg-emerald-50/40">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Paid / Received</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">PKR {totalPaid.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover-lift border-amber-200/60 bg-amber-50/40">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Current Balance</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">PKR {currentBalance.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Invoices List */}
            <Card className="shadow-sm border-line">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-bold">Invoices & Billing History</CardTitle>
                  <CardDescription>O&M service invoices and payment statuses.</CardDescription>
                </div>
                {canRecordPayment && (
                  <div className="flex gap-2 items-center">
                    <GenerateInvoiceDialog customerId={customer.id} />
                    <RecordPaymentDialog customerId={customer.id} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Sales Tax</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!customer.invoices || customer.invoices.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-xs text-[var(--color-slate-custom)]">
                          No invoices generated yet for this customer.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customer.invoices.map((inv: any) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono font-semibold text-xs">{inv.invoiceNumber}</TableCell>
                          <TableCell className="text-xs">{inv.billingPeriod}</TableCell>
                          <TableCell className="text-xs">PKR {Number(inv.amount).toLocaleString()}</TableCell>
                          <TableCell className="text-xs">PKR {Number(inv.salesTax || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-xs font-bold text-[var(--color-ink)]">PKR {Number(inv.totalAmount).toLocaleString()}</TableCell>
                          <TableCell className="text-xs">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <form action={async () => {
                              "use server"
                              await toggleInvoiceStatus(inv.id, inv.status)
                            }}>
                              <button type="submit" className="focus:outline-none" title="Click to toggle status">
                                <Badge 
                                  variant="outline"
                                  className={
                                    inv.status === 'PAID'
                                      ? 'bg-green-100 text-green-800 border-green-200 text-xs cursor-pointer hover:bg-green-200'
                                      : 'bg-amber-100 text-amber-800 border-amber-200 text-xs cursor-pointer hover:bg-amber-200'
                                  }
                                >
                                  {inv.status}
                                </Badge>
                              </button>
                            </form>
                          </TableCell>
                          <TableCell className="text-right">
                            <a href={`/api/invoice/${inv.id}`} target="_blank" rel="noopener noreferrer" title="Download PDF">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-slate-custom)] hover:text-[var(--color-amber)]">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Ledger Audit Entries */}
            <Card className="shadow-sm border-line">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">Ledger Journal Entries</CardTitle>
                <CardDescription>Debit, credit, and running balance audit transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Ref #</TableHead>
                      <TableHead>Narration</TableHead>
                      <TableHead>Debit (PKR)</TableHead>
                      <TableHead>Credit (PKR)</TableHead>
                      <TableHead className="text-right">Balance (PKR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!customer.ledgerEntries || customer.ledgerEntries.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-[var(--color-slate-custom)]">
                          No ledger entries found. Record a payment above to post the first transaction.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customer.ledgerEntries.map((le: any) => (
                        <TableRow key={le.id}>
                          <TableCell className="font-mono text-xs">{new Date(le.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono text-xs font-semibold">{le.refNumber}</TableCell>
                          <TableCell className="text-xs">{le.narration}</TableCell>
                          <TableCell className="text-xs text-rose-700 font-medium">
                            {Number(le.debit) > 0 ? Number(le.debit).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-xs text-emerald-700 font-medium">
                            {Number(le.credit) > 0 ? Number(le.credit).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs">
                            PKR {Number(le.balance).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
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

        {/* 5. Complaints / Tickets Tab */}
        {activeTab === 'complaints' && (
          <Card className="shadow-sm border-line">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">Registered Complaints & Service Tickets</CardTitle>
                <CardDescription>All historical and active maintenance tickets for this installation.</CardDescription>
              </div>
              <Link href={`/dashboard/customers/${id}?tab=ticket`}>
                <Button size="sm" className="shadow-sm">+ Log New Ticket</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fault Code</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!customer.tickets || customer.tickets.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-xs text-[var(--color-slate-custom)]">
                        No service tickets found for this customer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customer.tickets.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono font-semibold text-xs">{t.ticketNumber}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] text-xs">
                            {t.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[var(--color-slate-custom)]">{t.fault || 'General'}</TableCell>
                        <TableCell className="text-xs font-medium">{t.assignedTo}</TableCell>
                        <TableCell className="text-xs">{t.actionPriority}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              t.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 border-amber-200 text-xs'
                                : t.status === 'RESOLVED'
                                ? 'bg-green-100 text-green-800 border-green-200 text-xs'
                                : t.status === 'ON_HOLD'
                                ? 'bg-blue-100 text-blue-800 border-blue-200 text-xs'
                                : 'bg-gray-100 text-gray-800 border-gray-200 text-xs'
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <TicketUpdateDialog ticket={{ ...t, customer }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 6. Customer History / Timeline Tab */}
        {activeTab === 'history' && (
          <Card className="shadow-sm border-line">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <HistoryIcon className="h-5 w-5 text-[var(--color-amber)]" />
                Customer Lifecycle Timeline
              </CardTitle>
              <CardDescription>Chronological events, status transitions, and audit records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-[var(--color-line)] space-y-6 my-2 text-xs">
                {/* Event 1: Account Created */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-[var(--color-amber)] border-2 border-white shadow-sm" />
                  <p className="font-bold text-sm text-[var(--color-graphite)]">Account Created & Signup Generated</p>
                  <p className="text-[var(--color-slate-custom)] mt-0.5">
                    {customer.signupDate ? new Date(customer.signupDate).toLocaleDateString() : 'N/A'} • CRF #{customer.crfNumber || customer.customerCode}
                  </p>
                </div>

                {/* Event 2: Package Assignment */}
                {customer.packagePlan && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-[var(--color-teal)] border-2 border-white shadow-sm" />
                    <p className="font-bold text-sm text-[var(--color-graphite)]">O&M Package Assigned</p>
                    <p className="text-[var(--color-slate-custom)] mt-0.5">
                      Assigned Tier: <strong>{customer.packagePlan.packageTier}</strong> ({customer.packagePlan.systemSizeKw}) at PKR {Number(customer.packagePlan.totalAmount).toLocaleString()}/{customer.packagePlan.billingType}
                    </p>
                  </div>
                )}

                {/* Event 3: Solar Installation */}
                {customer.solarSystem && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    <p className="font-bold text-sm text-[var(--color-graphite)]">Solar Equipment Commissioned</p>
                    <p className="text-[var(--color-slate-custom)] mt-0.5">
                      Installed {customer.solarSystem.inverterBrand} {customer.solarSystem.inverterSize} Inverter and {customer.solarSystem.noOfPanels}x {customer.solarSystem.panelBrand} Panels.
                    </p>
                  </div>
                )}

                {/* Event 4: Tickets Logged */}
                {(customer.tickets || []).map((t: any) => (
                  <div key={t.id} className="relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    <p className="font-bold text-sm text-[var(--color-graphite)]">Ticket Logged: {t.ticketNumber}</p>
                    <p className="text-[var(--color-slate-custom)] mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString()} • {t.category} ({t.status}) • Assigned to {t.assignedTo}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7. Message & Email History Tab */}
        {activeTab === 'message' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-line col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[var(--color-teal)]" />
                  Communication Logs
                </CardTitle>
                <CardDescription>Automated transaction receipts, ticket notifications, and alerts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[var(--color-paper)] rounded-xl border border-[var(--color-line)] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[var(--color-ink)]">System Welcome & Credentials Dispatch</span>
                      <span className="text-[var(--color-slate-custom)]">{customer.signupDate ? new Date(customer.signupDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <p className="text-[var(--color-slate-custom)]">Delivered to: <strong>{customer.email || customer.contactNumber}</strong> via Brevo Email Dispatch Service.</p>
                  </div>

                  {(customer.invoices || []).map((inv: any) => (
                    <div key={inv.id} className="p-3 bg-white rounded-xl border border-[var(--color-line)] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--color-ink)]">Invoice Notification #{inv.invoiceNumber}</span>
                        <span className="text-[var(--color-slate-custom)]">{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[var(--color-slate-custom)]">Monthly invoice PKR {Number(inv.totalAmount).toLocaleString()} dispatched.</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-line col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-bold">Quick Contact</CardTitle>
                <CardDescription>Direct channels to reach customer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <p className="text-[var(--color-slate-custom)] font-medium">Customer Email</p>
                  <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.email || 'No email registered'}</p>
                </div>
                <div>
                  <p className="text-[var(--color-slate-custom)] font-medium">Customer Mobile</p>
                  <p className="text-[var(--color-ink)] font-semibold mt-0.5">{customer.contactNumber}</p>
                </div>
                <div className="pt-2">
                  <a href={`mailto:${customer.email || ''}`}>
                    <Button variant="outline" size="sm" className="w-full justify-center gap-2 mb-2">
                      <Mail className="h-4 w-4" /> Send Email
                    </Button>
                  </a>
                  <a href={`https://wa.me/${customer.contactNumber?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full justify-center gap-2 text-emerald-700 hover:text-emerald-800">
                      <MessageSquare className="h-4 w-4" /> WhatsApp Message
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
