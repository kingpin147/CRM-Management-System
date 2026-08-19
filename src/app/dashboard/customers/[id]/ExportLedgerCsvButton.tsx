'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function ExportLedgerCsvButton({
  customerName,
  customerCode,
  ledgerEntries,
}: {
  customerName: string
  customerCode: string
  ledgerEntries: any[]
}) {
  const exportToCsv = () => {
    if (!ledgerEntries || ledgerEntries.length === 0) return

    const headers = ['Date', 'Reference #', 'Narration / Description', 'Debit (PKR)', 'Credit (PKR)', 'Running Balance (PKR)']
    const rows = ledgerEntries.map((e) => [
      `"${formatDate(e.createdAt || e.date)}"`,
      `"${e.refNumber || '-'}"`,
      `"${(e.narration || '').replace(/"/g, '""')}"`,
      Number(e.debit || 0).toFixed(2),
      Number(e.credit || 0).toFixed(2),
      Number(e.balance || 0).toFixed(2),
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Statement_Of_Account_${customerCode}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToCsv}
      disabled={!ledgerEntries || ledgerEntries.length === 0}
      className="border-[var(--color-line)] text-[var(--color-slate-custom)] hover:text-[var(--color-ink)]"
    >
      <Download className="h-4 w-4 mr-1.5" />
      Export Statement CSV
    </Button>
  )
}
