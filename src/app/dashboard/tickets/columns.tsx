'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Ticket, Customer } from '@prisma/client'
import { TicketUpdateDialog } from './TicketUpdateDialog'
import { formatDateTime } from '@/lib/utils'

export type TicketWithCustomer = Ticket & { customer: Customer }

export const columns: ColumnDef<any, TicketWithCustomer, any>[] = [
  {
    accessorKey: 'ticketNumber',
    header: 'Ticket ID',
    cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.getValue('ticketNumber')}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date & Time',
    cell: ({ row }) => <span className="font-mono text-xs text-slate-700">{formatDateTime(row.original.createdAt)}</span>,
  },
  {
    accessorKey: 'customer.fullName',
    header: 'Customer',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-line)]">
          {row.getValue('category')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge 
          variant="outline" 
          className={
            status === 'PENDING' 
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : status === 'RESOLVED'
              ? 'bg-[#002868] text-white border-[#002868]'
              : status === 'ON_HOLD'
              ? 'bg-sky-100 text-sky-900 border-sky-300'
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Action</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <TicketUpdateDialog ticket={row.original} />
        </div>
      )
    },
  },
]
