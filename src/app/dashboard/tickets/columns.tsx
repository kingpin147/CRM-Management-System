'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ticket, Customer } from '@prisma/client'

export type TicketWithCustomer = Ticket & { customer: Customer }

export const columns: ColumnDef<any, TicketWithCustomer, any>[] = [
  {
    accessorKey: 'ticketNumber',
    header: 'Ticket ID',
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('ticketNumber')}</span>,
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
              ? 'bg-green-100 text-green-800 border-green-200'
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
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm">Update</Button>
        </div>
      )
    },
  },
]
