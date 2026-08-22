'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Ticket, Customer, User } from '@prisma/client'
import { TicketUpdateDialog } from './TicketUpdateDialog'
import { formatDateTime } from '@/lib/utils'

export type TicketWithCustomer = Ticket & {
  customer: Customer & { accountExecutive?: User | null }
}

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
    header: 'Ticket #',
    cell: ({ row }) => {
      const ticketIdFormatted = formatTicketId(row.getValue('ticketNumber'))
      return (
        <span className="font-mono text-xs font-bold text-red-600 bg-red-50/80 border border-red-200/80 px-2 py-0.5 rounded tracking-wide whitespace-nowrap">
          {ticketIdFormatted}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date & Time',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-700 font-medium whitespace-nowrap">
        {formatDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: 'customer.customerCode',
    header: 'Customer ID',
    cell: ({ row }) => {
      const code = row.original.customer?.customerCode || 'N/A'
      return <span className="font-mono text-xs font-bold text-slate-800 whitespace-nowrap">{code}</span>
    },
  },
  {
    accessorKey: 'customer.fullName',
    header: 'Customer Name',
    cell: ({ row }) => {
      const name = row.original.customer?.fullName || 'N/A'
      return <span className="text-xs font-bold text-slate-900 whitespace-nowrap">{name}</span>
    },
  },
  {
    accessorKey: 'customer.address',
    header: 'Address',
    cell: ({ row }) => {
      const addr = row.original.customer?.address || 'N/A'
      return (
        <span className="text-xs text-slate-700 max-w-[180px] truncate block" title={addr}>
          {addr}
        </span>
      )
    },
  },
  {
    accessorKey: 'customer.contactNumber',
    header: 'Contact #',
    cell: ({ row }) => {
      const phone = row.original.customer?.contactNumber || 'N/A'
      return <span className="font-mono text-xs text-slate-700 whitespace-nowrap">{phone}</span>
    },
  },
  {
    accessorKey: 'customer.houseNumber',
    header: 'House',
    cell: ({ row }) => {
      const house = row.original.customer?.houseNumber || '-'
      return <span className="text-xs text-slate-700 whitespace-nowrap">{house}</span>
    },
  },
  {
    accessorKey: 'customer.block',
    header: 'Block',
    cell: ({ row }) => {
      const block = row.original.customer?.block || '-'
      return <span className="text-xs text-slate-700 whitespace-nowrap">{block}</span>
    },
  },
  {
    accessorKey: 'customer.subArea',
    header: 'Sub Area',
    cell: ({ row }) => {
      const subArea = row.original.customer?.subArea || '-'
      return <span className="text-xs text-slate-700 whitespace-nowrap">{subArea}</span>
    },
  },
  {
    accessorKey: 'customer.area',
    header: 'Area',
    cell: ({ row }) => {
      const area = row.original.customer?.area || '-'
      return <span className="text-xs text-slate-700 whitespace-nowrap">{area}</span>
    },
  },
  {
    accessorKey: 'description',
    header: 'Complain Description',
    cell: ({ row }) => {
      const desc = row.original.description || 'N/A'
      return (
        <div className="flex flex-col gap-0.5 max-w-[220px]">
          <span className="text-xs text-slate-800 line-clamp-2" title={desc}>
            {desc}
          </span>
          {row.original.category && (
            <span className="text-[10px] text-amber-700 font-semibold">{row.original.category}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'customer.accountExecutive.fullName',
    header: 'Account Executive Sales',
    cell: ({ row }) => {
      const execName = row.original.customer?.accountExecutive?.fullName || row.original.assignedTo || 'Unassigned'
      return <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{execName}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
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
