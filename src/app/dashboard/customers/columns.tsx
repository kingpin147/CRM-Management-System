'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Customer } from '@prisma/client'

export const columns: ColumnDef<any, Customer, any>[] = [
  {
    accessorKey: 'customerCode',
    header: 'Customer ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-[var(--color-ink)]">
        {(row.getValue('customerCode') as string)?.replace(/\D/g, '') || row.getValue('customerCode')}
      </span>
    ),
  },
  {
    accessorKey: 'crfNumber',
    header: 'CRF #',
    cell: ({ row }) => {
      const crf = row.original.crfNumber
      const code = row.original.customerCode
      const formatted = crf?.startsWith('CRF-')
        ? crf
        : `CRF-${crf?.replace(/^CRF/i, '').replace(/^-+/, '') || code?.replace(/\D/g, '') || '000000'}`
      return (
        <span className="font-mono text-xs font-semibold text-[var(--color-graphite)]">
          {formatted}
        </span>
      )
    },
  },
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-semibold text-xs text-[var(--color-ink)]">
        {row.getValue('fullName')}
      </span>
    ),
  },
  {
    accessorKey: 'cnic',
    header: 'CNIC',
    cell: ({ row }) => <span className="font-mono text-xs text-[var(--color-slate-custom)]">{row.getValue('cnic')}</span>,
  },
  {
    accessorKey: 'customerType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('customerType') as string
      let badgeStyle = "bg-slate-100 text-slate-800 border-slate-200 text-xs font-semibold"
      if (type === 'RESIDENTIAL') badgeStyle = "bg-blue-50 text-blue-800 border-blue-200/80 text-xs font-semibold"
      if (type === 'CORPORATE') badgeStyle = "bg-amber-50 text-amber-800 border-amber-200/80 text-xs font-semibold"
      if (type === 'INDUSTRIAL') badgeStyle = "bg-[#002868] text-white border-[#002868] text-xs font-semibold"
      
      return (
        <Badge variant="outline" className={badgeStyle}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => <span className="text-xs font-medium">{row.getValue('city')}</span>,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const customer = row.original
      return (
        <div className="text-right">
          <Link href={`/dashboard/customers/${customer.id}`}>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-[var(--color-amber)] hover:text-[var(--color-ink)] hover:bg-[var(--color-amber)]/10">
              View Profile
            </Button>
          </Link>
        </div>
      )
    },
  },
]
