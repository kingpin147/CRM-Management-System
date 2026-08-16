'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportCsvButton({ data }: { data: any[] }) {
  function handleExport() {
    if (!data || data.length === 0) {
      alert('No data available to export.')
      return
    }

    const headers = [
      'Customer ID',
      'Customer Name',
      'Contact #',
      'Address',
      'Block/Sector',
      'City',
      'Customer Package',
      'Status',
    ]

    const rows = data.map((c) => [
      c.customerCode || c.id,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${c.contactNumber || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.block || ''}"`,
      `"${c.city || ''}"`,
      `"${c.packagePlan?.packageTier || 'N/A'}"`,
      `"${c.status || ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `EnergyGurus_Customer_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={handleExport} variant="outline" className="shadow-sm border-[var(--color-line)] bg-white">
      <Download className="mr-2 h-4 w-4 text-[var(--color-amber)]" /> Export to CSV/Excel
    </Button>
  )
}
