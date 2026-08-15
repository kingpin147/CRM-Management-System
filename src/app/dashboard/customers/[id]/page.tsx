import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PackageFormDialog } from './PackageFormDialog'

const prisma = new PrismaClient()

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      solarSystem: true,
      packagePlan: true,
      tickets: true,
    }
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl animate-reveal">
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
              <span className="text-[var(--color-slate-custom)] font-mono text-sm">Code: {customer.customerCode}</span>
              <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-line)]">
                {customer.customerType}
              </Badge>
              <Badge 
                variant="outline" 
                className={
                  customer.status === 'ACTIVE' 
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-line col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-y-4">
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
                  <a href={`/api/invoice/${customer.id}`} target="_blank">
                    <Button className="w-full mt-2" variant="outline">Download Invoice PDF</Button>
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[var(--color-slate-custom)] text-sm mb-3">No package assigned yet.</p>
                  <PackageFormDialog customerId={customer.id} />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-line">
            <CardHeader>
              <CardTitle>Solar System</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.solarSystem ? (
                <div>
                  {/* To be implemented */}
                  <p className="font-medium">{customer.solarSystem.inverterSize} {customer.solarSystem.inverterBrand}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[var(--color-slate-custom)] text-sm mb-3">System details missing.</p>
                  <Button variant="outline" size="sm" className="w-full">Add System Details</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
