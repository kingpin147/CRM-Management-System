'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'

export type ReportCustomer = {
  id: string
  customerCode: string
  crfNumber: string | null
  fullName: string
  address: string
  contactNumber: string
  houseNumber: string | null
  block: string | null
  streetNumber: string | null
  subArea: string | null
  area: string | null
  city: string
  packagePlan: { packageTier: string } | null
  status: string
}

export const columns: ColumnDef<any, ReportCustomer, any>[] = [
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
    header: 'Customer Name',
    cell: ({ row }) => <span className="font-semibold text-xs">{row.getValue('fullName')}</span>,
  },
  {
    accessorKey: 'address',
    header: 'Customer Address',
    cell: ({ row }) => <span className="text-xs text-gray-600 truncate max-w-xs">{row.getValue('address')}</span>,
  },
  {
    accessorKey: 'contactNumber',
    header: 'Contact #',
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('contactNumber')}</span>,
  },
  {
    accessorKey: 'houseNumber',
    header: 'House #',
    cell: ({ row }) => <span className="text-xs">{row.getValue('houseNumber') || '-'}</span>,
  },
  {
    accessorKey: 'block',
    header: 'Block',
    cell: ({ row }) => <span className="text-xs">{row.getValue('block') || '-'}</span>,
  },
  {
    accessorKey: 'streetNumber',
    header: 'Street #',
    cell: ({ row }) => <span className="text-xs">{row.getValue('streetNumber') || '-'}</span>,
  },
  {
    accessorKey: 'subArea',
    header: 'Sub Area',
    cell: ({ row }) => <span className="text-xs">{row.getValue('subArea') || '-'}</span>,
  },
  {
    accessorKey: 'area',
    header: 'Area',
    cell: ({ row }) => <span className="text-xs">{row.getValue('area') || '-'}</span>,
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => <span className="text-xs font-semibold">{row.getValue('city')}</span>,
  },
  {
    id: 'customerPackage',
    header: 'Customer Package',
    cell: ({ row }) => <span className="text-xs font-medium">{row.original.packagePlan?.packageTier || 'N/A'}</span>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant="outline" className="whitespace-nowrap text-xs font-semibold bg-[#002868] text-white border-[#002868]">
          {status.replace(/_/g, ' ')}
        </Badge>
      )
    },
  },
]
