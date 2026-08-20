import { CustomerForm } from './CustomerForm'
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
  if (!dbUser?.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER', 'SALES'].includes(dbUser.role)) {
    redirect('/dashboard/customers')
  }
  const userRole = dbUser.role

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: 'asc' }
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-reveal">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/customers">
          <Button variant="ghost" size="sm" className="text-[var(--color-slate-custom)]">
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Create Sale</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Enter the personal and location details for the new client.</p>
        </div>
      </div>

      <CustomerForm users={users} />
    </div>
  )
}
