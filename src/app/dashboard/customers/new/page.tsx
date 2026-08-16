import { CustomerForm } from './CustomerForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewCustomerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true }
  })
  const userRole = dbUser?.role || 'SALES'

  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)) {
    redirect('/dashboard/customers')
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: 'asc' }
  })

  return (
    <div className="space-y-6 max-w-3xl animate-reveal">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/customers">
          <Button variant="ghost" size="sm" className="text-[var(--color-slate-custom)]">
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Onboard Customer</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Register a new client in the EnergyGurus CRM.</p>
        </div>
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>Enter the personal and location details for the new client.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
