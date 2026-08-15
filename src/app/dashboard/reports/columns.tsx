'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'

export type ReportCustomer = {
  id: string
  customerCode: string
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
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('customerCode')}</span>,
  },
  {
    accessorKey: 'fullName',
    header: 'Customer Name',
  },
  {
    accessorKey: 'address',
    header: 'Customer Address',
  },
  {
    accessorKey: 'contactNumber',
    header: 'Contact #',
  },
  {
    accessorKey: 'houseNumber',
    header: 'House #',
  },
  {
    accessorKey: 'block',
    header: 'Block',
  },
  {
    accessorKey: 'streetNumber',
    header: 'Street #',
  },
  {
    accessorKey: 'subArea',
    header: 'Sub Area',
  },
  {
    accessorKey: 'area',
    header: 'Area',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    id: 'customerPackage',
    header: 'Customer Package',
    cell: ({ row }) => row.original.packagePlan?.packageTier || 'N/A'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant="outline" className="whitespace-nowrap text-xs">
          {status.replace(/_/g, ' ')}
        </Badge>
      )
    },
  },
]
