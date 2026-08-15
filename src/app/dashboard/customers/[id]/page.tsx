import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PackageFormDialog } from './PackageFormDialog'

export default async function CustomerDetailPage({ 
  params,
  searchParams
}: { 
  params: { id: string }
  searchParams: { tab?: string }
}) {
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = tab || 'profile'
  
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      solarSystem: true,
      packagePlan: true,
      tickets: true,
      ledgerEntries: true,
      invoices: true,
    }
  })

  if (!customer) {
    notFound()
  }

  const tabs = [
    { id: 'profile', label: 'Customer Profile' },
    { id: 'solar', label: 'Solar System Details' },
    { id: 'ledger', label: 'Customer Ledger' },
    { id: 'ticket', label: 'Create Ticket' },
    { id: 'complaints', label: 'Complaints Details' },
    { id: 'history', label: 'Customer History' },
    { id: 'message', label: 'Message History' },
    { id: 'email', label: 'Email History' },
  ]

  return (
    <div className="space-y-6 max-w-6xl animate-reveal">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/customers">
          <Button variant="ghost" size="sm" className="text-[var(--color-slate-custom)]">
            ← Back to Customers
          </Button>
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
              {customer.fullName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[var(--color-slate-custom)] font-mono text-sm">CRF: {customer.crfNumber || customer.customerCode}</span>
              <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-line)]">
                {customer.customerType}
              </Badge>
              <Badge 
                variant="outline" 
                className={
                  customer.status === 'CONNECTION_ACTIVE' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }
              >
                {customer.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[var(--color-line)] bg-white">Edit Profile</Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-line overflow-x-auto pb-px">
        {tabs.map(t => (
          <Link key={t.id} href={`/dashboard/customers/${id}?tab=${t.id}`}>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'border-[var(--color-teal)] text-[var(--color-teal)]'
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
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-line col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Contact Number</p>
                    <p className="text-[var(--color-ink)] font-medium">{customer.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Email</p>
                    <p className="text-[var(--color-ink)] font-medium">{customer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">CNIC</p>
                    <p className="text-[var(--color-ink)] font-medium">{customer.cnic}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Signup Date</p>
                    <p className="text-[var(--color-ink)] font-medium">{customer.signupDate ? new Date(customer.signupDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Address</p>
                    <p className="text-[var(--color-ink)] font-medium">
                      {customer.address}, {customer.block ? `${customer.block}, ` : ''}{customer.city}
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
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-slate-custom)] text-sm">Tier</span>
                        <Badge variant="outline">{customer.packagePlan.packageTier}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-slate-custom)] text-sm">System Size</span>
                        <span className="font-medium">{customer.packagePlan.systemSizeKw}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3">
                        <span className="text-[var(--color-slate-custom)] text-sm">Total</span>
                        <span className="font-bold text-[var(--color-ink)]">PKR {Number(customer.packagePlan.totalAmount).toLocaleString()} / {customer.packagePlan.billingType}</span>
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

        {activeTab === 'solar' && (
          <Card className="shadow-sm border-line">
            <CardHeader>
              <CardTitle>Solar System Details</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.solarSystem ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Inverter</p>
                    <p className="text-[var(--color-ink)] font-medium">{customer.solarSystem.inverterSize} {customer.solarSystem.inverterBrand}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-slate-custom)] uppercase">Panels</p>
                    <p className="text-[var(--color-ink)] font-medium">{customer.solarSystem.noOfPanels}x {customer.solarSystem.panelWattage}W {customer.solarSystem.panelBrand}</p>
                  </div>
                  {/* Additional details */}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-slate-custom)] text-sm mb-3">System details have not been provided.</p>
                  <Button variant="outline" size="sm">Add System Details</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'ledger' && (
          <Card className="shadow-sm border-line">
            <CardHeader>
              <CardTitle>Customer Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[var(--color-slate-custom)] italic">Ledger entries will appear here</div>
            </CardContent>
          </Card>
        )}

        {/* Placeholders for remaining tabs */}
        {['ticket', 'complaints', 'history', 'message', 'email'].includes(activeTab) && (
          <Card className="shadow-sm border-line">
            <CardHeader>
              <CardTitle>{tabs.find(t => t.id === activeTab)?.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[var(--color-slate-custom)] italic">Module in development</div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
