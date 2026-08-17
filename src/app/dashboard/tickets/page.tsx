import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { status } = await searchParams
  const statusFilter = typeof status === 'string' ? status : undefined

  // Map statusFilter string to TicketStatus enum
  let mappedStatus: any = undefined
  if (statusFilter) {
    const s = statusFilter.toUpperCase()
    if (s === 'PENDING') mappedStatus = 'PENDING'
    else if (s === 'RESOLVED') mappedStatus = 'RESOLVED'
    else if (s === 'CLOSED') mappedStatus = 'CLOSED'
    else if (s === 'CANCELED' || s === 'CANCELLED') mappedStatus = 'CANCELLED'
  }

  const whereCondition = mappedStatus ? { status: mappedStatus } : {}

  const tickets = await prisma.ticket.findMany({
    where: whereCondition,
    include: { customer: true, histories: true },
    orderBy: { createdAt: 'desc' },
  })

  // Get total count of pending for summary badge
  const pendingCount = await prisma.ticket.count({
    where: { status: 'PENDING' },
  })


  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight flex items-center gap-3">
            {statusFilter?.toUpperCase() === 'PENDING' ? 'Pending Complaints' : 'Complaints & Tickets'}
            {statusFilter?.toUpperCase() === 'PENDING' && (
              <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-[var(--color-slate-custom)] mt-1">
            {statusFilter?.toUpperCase() === 'PENDING' 
              ? 'Reviewing pending customer complaints requiring departmental action.' 
              : 'Track and manage customer service requests and system faults.'}
          </p>
        </div>
        <Link href="/dashboard/tickets/new">
          <Button className="shadow-md">+ Log New Ticket</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-line pb-2">
        <Link
          href="/dashboard/tickets"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            !statusFilter ? 'bg-[var(--color-graphite)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Tickets
        </Link>
        <Link
          href="/dashboard/tickets?status=PENDING"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            statusFilter?.toUpperCase() === 'PENDING'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          Pending Complaints ({pendingCount})
        </Link>
        <Link
          href="/dashboard/tickets?status=RESOLVED"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            statusFilter?.toUpperCase() === 'RESOLVED'
              ? 'bg-[#002868] text-white'
              : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
          }`}
        >
          Resolved
        </Link>
        <Link
          href="/dashboard/tickets?status=CLOSED"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            statusFilter?.toUpperCase() === 'CLOSED'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Closed
        </Link>
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader className="py-4 border-b border-line">
          <CardTitle className="text-lg font-bold text-[var(--color-graphite)]">
            {statusFilter?.toUpperCase() === 'PENDING' ? 'Pending Service Complaints' : 'Active Tickets'} ({tickets.length})
          </CardTitle>
          <CardDescription className="text-xs">
            {statusFilter?.toUpperCase() === 'PENDING'
              ? 'Displaying only service tickets currently pending resolution.'
              : 'All pending, resolved, and closed service tickets across departments.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
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

