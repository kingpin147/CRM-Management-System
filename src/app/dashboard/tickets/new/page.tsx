import prisma from '@/lib/prisma'
import { TicketForm } from './TicketForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { SectionHeader } from '@/components/ui/section-header'

export default async function NewTicketPage() {
  const customers = await prisma.customer.findMany({
    select: { id: true, fullName: true, customerCode: true },
    orderBy: { fullName: 'asc' }
  })

  return (
    <div className="space-y-6 max-w-3xl animate-reveal">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/tickets">
          <Button variant="ghost" size="sm" className="text-[var(--color-slate-custom)]">
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Log New Ticket</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Register a complaint or service request for a customer.</p>
        </div>
      </div>

      <Card className="shadow-sm border-line overflow-hidden">
        <SectionHeader>Ticket Details</SectionHeader>
        <CardContent className="pt-6">
          <TicketForm customers={customers} />
        </CardContent>
      </Card>
    </div>
  )
}
