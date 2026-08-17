'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Customer } from '@prisma/client'

export const columns: ColumnDef<any, Customer, any>[] = [
  {
    accessorKey: 'customerCode',
    header: 'Code',
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('customerCode')}</span>,
  },
  {
    accessorKey: 'fullName',
    header: 'Name',
  },
  {
    accessorKey: 'cnic',
    header: 'CNIC',
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('cnic')}</span>,
  },
  {
    accessorKey: 'customerType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('customerType') as string
      let badgeStyle = "bg-slate-100 text-slate-800 border-slate-200"
      if (type === 'RESIDENTIAL') badgeStyle = "bg-blue-50 text-blue-800 border-blue-200/80 font-medium"
      if (type === 'CORPORATE') badgeStyle = "bg-amber-50 text-amber-800 border-amber-200/80 font-medium"
      if (type === 'INDUSTRIAL') badgeStyle = "bg-[#002868] text-white border-[#002868] font-medium"
      
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
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const customer = row.original
      return (
        <div className="text-right">
          <Link href={`/dashboard/customers/${customer.id}`}>
            <Button variant="ghost" size="sm" className="text-[var(--color-amber)] hover:text-[var(--color-ink)] hover:bg-[var(--color-amber)]/10">
              View Profile
            </Button>
          </Link>
        </div>
      )
    },
  },
]
