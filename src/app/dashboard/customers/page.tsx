import prisma from '@/lib/prisma'
import { CustomerSearchForm } from './CustomerSearchForm'
import { createClient } from '@/utils/supabase/server'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dbUser = user ? await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } }) : null
  const userRole = dbUser?.role || 'SALES'

  const canRegisterCustomer = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)

  // No customer data is pre-fetched here.
  // The CustomerSearchForm will query the API only when the user performs a search.
  return (
    <div className="space-y-6 animate-reveal">
      <CustomerSearchForm canRegisterCustomer={canRegisterCustomer} />
    </div>
  )
}
