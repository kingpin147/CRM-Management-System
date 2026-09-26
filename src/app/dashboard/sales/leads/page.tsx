import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SalesLeadForm } from './SalesLeadForm'

export const dynamic = 'force-dynamic'

export default async function SalesLeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch recent leads (customers created via sales lead or tickets in Sales category)
  const recentLeads = await prisma.customer.findMany({
    where: {
      tickets: {
        some: {
          category: 'Sales Lead'
        }
      }
    },
    include: {
      solarSystem: true,
      packagePlan: true,
      tickets: {
        where: { category: 'Sales Lead' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { signupDate: 'desc' },
    take: 10
  })

  return (
    <div className="animate-reveal py-2">
      <SalesLeadForm recentLeads={JSON.parse(JSON.stringify(recentLeads))} />
    </div>
  )
}
