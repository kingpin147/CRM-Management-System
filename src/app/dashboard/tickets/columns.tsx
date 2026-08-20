'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Ticket, Customer } from '@prisma/client'
import { TicketUpdateDialog } from './TicketUpdateDialog'
import { formatDateTime } from '@/lib/utils'

export type TicketWithCustomer = Ticket & { customer: Customer }

export function formatTicketId(raw?: string | null): string {
  if (!raw) return 'T-0000000'
  const str = String(raw).trim()
  if (str.startsWith('T-')) return str
  if (str.startsWith('TCK-300')) return str.replace(/^TCK-300/, 'T-')
  if (str.startsWith('TCK-')) return str.replace(/^TCK-/, 'T-')
  const numOnly = str.replace(/\D/g, '')
  if (numOnly) {
    return `T-${numOnly.padStart(7, '0')}`
  }
  return `T-${str}`
}

export const columns: ColumnDef<any, TicketWithCustomer, any>[] = [
  {
    accessorKey: 'ticketNumber',
    header: 'TICKET ID',
    cell: ({ row }) => {
      const ticketIdFormatted = formatTicketId(row.getValue('ticketNumber'))
      return (
        <span className="font-mono text-xs font-bold text-red-600 bg-red-50/80 border border-red-200/80 px-2 py-0.5 rounded tracking-wide">
          {ticketIdFormatted}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'DATE & TIME',
    cell: ({ row }) => <span className="font-mono text-xs text-slate-700 font-medium">{formatDateTime(row.original.createdAt)}</span>,
  },
  {
    accessorKey: 'customer.fullName',
    header: 'CUSTOMER',
    cell: ({ row }) => {
      const cust = row.original.customer
      return (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800">{cust?.fullName || 'N/A'}</span>
          {cust?.customerCode && (
            <span className="text-[10px] text-slate-500 font-mono">{cust.customerCode}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: 'CATEGORY',
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-line)] text-[11px] px-2 py-0.5">
          {row.getValue('category')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'ASSIGNED TO',
    cell: ({ row }) => {
      return (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.getValue('assignedTo')}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const status = (row.getValue('status') as string) || ''
      const upper = status.toUpperCase()
      return (
        <Badge 
          variant="outline" 
          className={
            upper === 'PENDING' 
              ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold text-[11px]'
              : upper === 'RESOLVED'
              ? 'bg-[#002868] text-white border-[#002868] font-bold text-[11px]'
              : upper === 'ON_HOLD' || upper === 'ONHOLD'
              ? 'bg-sky-100 text-sky-900 border-sky-300 font-bold text-[11px]'
              : 'bg-gray-100 text-gray-800 border-gray-300 font-bold text-[11px]'
          }
        >
          {upper === 'ON_HOLD' ? 'ONHOLD' : upper}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">ACTION</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <TicketUpdateDialog ticket={row.original} />
        </div>
      )
    },
  },
]

