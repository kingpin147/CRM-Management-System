import prisma from '@/lib/prisma'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExportCsvButton } from './ExportCsvButton'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // We'll fetch all customers for now. Real implementations would filter based on searchParams
  const customers = await prisma.customer.findMany({
    include: {
      packagePlan: true
    },
    orderBy: {
      signupDate: 'desc'
    }
  })

  // Format the data for the data table (plain JSON serializable for Client Components)
  const formattedData = customers.map(c => ({
    id: c.id,
    customerCode: c.customerCode,
    fullName: c.fullName,
    address: c.address,
    contactNumber: c.contactNumber,
    houseNumber: c.houseNumber,
    block: c.block,
    streetNumber: c.streetNumber,
    subArea: c.subArea,
    area: c.area,
    city: c.city,
    packagePlan: c.packagePlan ? { packageTier: c.packagePlan.packageTier } : null,
    status: c.status
  }))

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Reports</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Customer Status Report</p>
        </div>
        <ExportCsvButton data={formattedData} />
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
             {/* Stubbed out filters as per the image layout */}
             <div>
               <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Country (Pakistan)</label>
               <label className="flex items-center gap-2 mt-2"><input type="checkbox" /> Sub Area</label>
             </div>
             <div>
               <label className="flex items-center gap-2"><input type="checkbox" /> City</label>
               <label className="flex items-center gap-2 mt-2"><input type="checkbox" /> Calendar Date From</label>
             </div>
             <div>
               <label className="flex items-center gap-2"><input type="checkbox" /> Area</label>
               <label className="flex items-center gap-2 mt-2"><input type="checkbox" /> Calendar Date to</label>
             </div>
          </div>
          
          <div className="mt-6">
            <p className="font-semibold mb-2 text-sm text-[var(--color-graphite)]">Select Status</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-[var(--color-slate-custom)]">
              <label className="flex items-center gap-2"><input type="checkbox" /> Sign up Generated</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Pending For Payment Verification</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Pending For Activation</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Connection Active</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Non Payment Blocked</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Temporary Blocked</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Permanent Disconnection</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> FOC Connection</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> In House Connection</label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-line">
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={formattedData} 
            searchKey="fullName" 
            searchPlaceholder="Search customers..." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
