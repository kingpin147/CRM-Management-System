import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

const prisma = new PrismaClient()

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Complaints & Tickets</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Track and manage customer service requests and system faults.</p>
        </div>
        <Link href="/dashboard/tickets/new">
          <Button className="shadow-md">Log New Ticket</Button>
        </Link>
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader>
          <CardTitle>Active Tickets</CardTitle>
          <CardDescription>All pending and resolved service tickets across departments.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={tickets} 
            searchKey="ticketNumber" 
            searchPlaceholder="Search by Ticket ID..." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
