import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { createClient } from '@/utils/supabase/server'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dbUser = user ? await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } }) : null
  const userRole = dbUser?.role || 'SALES'

  const canRegisterCustomer = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)

  const customers = await prisma.customer.findMany({
    orderBy: { signupDate: 'desc' }
  })

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Customers Directory</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Manage all residential, corporate, and industrial clients.</p>
        </div>
        {canRegisterCustomer && (
          <Link href="/dashboard/customers/new">
            <Button className="shadow-md">Register Customer</Button>
          </Link>
        )}
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader>
          <CardTitle>Active Clients</CardTitle>
          <CardDescription>A complete list of registered customers in the EnergyGurus CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={customers} 
            searchKey="fullName" 
            searchPlaceholder="Search by name..." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
