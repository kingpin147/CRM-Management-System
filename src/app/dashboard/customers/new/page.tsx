import { CustomerForm } from './CustomerForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SectionHeader } from '@/components/ui/section-header'
import { ShoppingBag } from 'lucide-react'

export default async function NewCustomerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true }
  })
  if (dbUser?.role === 'INSTALLATION') {
    redirect('/dashboard/installer/jobs')
  }

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
      <SectionHeader
        leftAction={
          <Link href="/dashboard/customers">
            <Button variant="ghost" size="sm" className="text-[var(--color-slate-custom)] hover:text-[#002868] h-7 text-xs font-semibold">
              ← Back
            </Button>
          </Link>
        }
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[#F58220]" />
          Create Sale
        </span>
      </SectionHeader>

      <CustomerForm users={users} />
    </div>
  )
}
