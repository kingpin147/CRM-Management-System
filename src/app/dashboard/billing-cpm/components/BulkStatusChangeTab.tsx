'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, CheckCircle2, AlertTriangle, Download, RefreshCw, CheckSquare, Square, Layers } from 'lucide-react'
import { searchBulkCustomers, processBulkStatusChange } from '../actions'
import { CustomerStatus } from '@prisma/client'

type BulkCustomerRow = {
  id: string
  customerCode: string
  crfNumber: string | null
  fullName: string
  contactNumber: string
  subArea: string
  area: string
  city: string
  status: string
  packageTier: string
  totalAmount: number
}

export function BulkStatusChangeTab() {
  const [pastedIds, setPastedIds] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [customers, setCustomers] = React.useState<BulkCustomerRow[]>([])
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [searchFeedback, setSearchFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Status Action State
  const [targetStatus, setTargetStatus] = React.useState<CustomerStatus>(CustomerStatus.NON_PAYMENT_BLOCKED)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [processFeedback, setProcessFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSearch = async () => {
    if (!pastedIds.trim()) {
      setSearchFeedback({ type: 'error', message: 'Please paste at least one Customer ID.' })
      return
    }

    setIsSearching(true)
    setSearchFeedback(null)
    setProcessFeedback(null)

    try {
      const res = await searchBulkCustomers(pastedIds)
      if (res.error) {
        setSearchFeedback({ type: 'error', message: res.error })
        setCustomers([])
        setSelectedIds(new Set())
      } else if (res.customers) {
        setCustomers(res.customers)
        // Select all by default
        setSelectedIds(new Set(res.customers.map(c => c.id)))
        setSearchFeedback({ 
          type: 'success', 
          message: `Found ${res.count} customer record(s) out of ${res.searchedCount} unique IDs searched.` 
        })
      }
    } finally {
      setIsSearching(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === customers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(customers.map(c => c.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleProcess = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one customer from the table.')
      return
    }

    const confirmMsg = `Are you sure you want to change the status of ${selectedIds.size} customer(s) to "${targetStatus.replace(/_/g, ' ')}"?`
    if (!confirm(confirmMsg)) return

    setIsProcessing(true)
    setProcessFeedback(null)

    try {
      const idsArray = Array.from(selectedIds)
      const res = await processBulkStatusChange(idsArray, targetStatus)
      if (res.error) {
        setProcessFeedback({ type: 'error', message: res.error })
      } else {
        setProcessFeedback({ type: 'success', message: res.message || 'Status updated successfully!' })
        // Refresh local table status
        setCustomers(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, status: targetStatus } : c))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportCsv = () => {
    if (customers.length === 0) return

    const headers = ['Customer ID', 'CRF #', 'Customer Name', 'Contact #', 'Sub Area', 'Area', 'City', 'Current Status', 'Package', 'Amount (Rs.)']
    const rows = customers.map(c => [
      `"${c.customerCode}"`,
      `"${c.crfNumber || ''}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.contactNumber}"`,
      `"${c.subArea}"`,
      `"${c.area}"`,
      `"${c.city}"`,
      `"${c.status}"`,
      `"${c.packageTier}"`,
      c.totalAmount
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Bulk_Customers_Status_List_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Paste Customer IDs Box */}
      <Card className="border-line shadow-xs">
        <CardHeader className="pb-3 border-b border-line">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--color-amber)]" />
                Bulk Customer Status Change (Multi-ID Search)
              </CardTitle>
              <CardDescription className="text-xs">
                Paste up to 100 Customer IDs (separated by new line, space, or comma) and click Search to load their current profiles.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 text-xs font-semibold">
              Max 100 Customer IDs
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Paste Customer IDs:</Label>
            <Textarea
              placeholder="e.g.&#10;9484&#10;1001&#10;1002&#10;1003"
              rows={4}
              value={pastedIds}
              onChange={(e) => setPastedIds(e.target.value)}
              className="font-mono text-xs bg-slate-50/50 border-line"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-9 px-5 bg-[var(--color-amber)] text-white font-semibold text-xs gap-1.5"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search Customers
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => { setPastedIds(''); setCustomers([]); setSelectedIds(new Set()); setSearchFeedback(null); }}
                className="h-9 text-xs"
              >
                Clear
              </Button>
            </div>

            {customers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-9 text-xs font-semibold gap-1.5 text-slate-700 border-line"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                Export on Excel / CSV
              </Button>
            )}
          </div>

          {searchFeedback && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${searchFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {searchFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />}
              {searchFeedback.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Customer Results Table with Checkbox */}
      {customers.length > 0 && (
        <Card className="border-line shadow-xs animate-in fade-in-50">
          <CardHeader className="pb-3 border-b border-line">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-[var(--color-graphite)]">
                  Search Results ({customers.length} Found, {selectedIds.size} Selected)
                </CardTitle>
                <CardDescription className="text-xs">
                  Check or uncheck individual customer rows to apply the status change.
                </CardDescription>
              </div>

              {/* Select Status & Process Button Controls (Exact Layout as Client Mockup) */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-line">
                <div className="w-48">
                  <Select value={targetStatus} onValueChange={(val) => val && setTargetStatus(val as CustomerStatus)}>
                    <SelectTrigger className="h-9 text-xs font-bold bg-white border-line">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONNECTION_ACTIVE" className="text-xs font-semibold text-emerald-700">Active</SelectItem>
                      <SelectItem value="TEMPORARY_BLOCKED" className="text-xs font-semibold text-amber-700">Temporary Blocked</SelectItem>
                      <SelectItem value="PERMANENT_DISCONNECTION" className="text-xs font-semibold text-rose-700">Permanent Disconnection</SelectItem>
                      <SelectItem value="NON_PAYMENT_BLOCKED" className="text-xs font-semibold text-purple-700">Non-Payment Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || selectedIds.size === 0}
                  className="h-9 px-5 bg-[var(--color-ink)] hover:bg-black text-white font-bold text-xs gap-1.5 shadow-xs"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Process Status Change ({selectedIds.size})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            
            {processFeedback && (
              <div className={`m-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${processFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {processFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />}
                {processFeedback.message}
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-line text-xs">
                    <TableHead className="w-12 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="cursor-pointer text-slate-700 hover:text-black inline-flex items-center justify-center"
                        title="Select All"
                      >
                        {selectedIds.size === customers.length && customers.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-[var(--color-amber)]" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-bold">Customer ID</TableHead>
                    <TableHead className="font-bold">CRF #</TableHead>
                    <TableHead className="font-bold">Customer Name</TableHead>
                    <TableHead className="font-bold">Contact #</TableHead>
                    <TableHead className="font-bold">Sub Area</TableHead>
                    <TableHead className="font-bold">Area</TableHead>
                    <TableHead className="font-bold">City</TableHead>
                    <TableHead className="font-bold">Package</TableHead>
                    <TableHead className="font-bold text-right">Amount</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => {
                    const isSelected = selectedIds.has(c.id)
                    return (
                      <TableRow 
                        key={c.id} 
                        className={`text-xs cursor-pointer hover:bg-slate-50/50 ${isSelected ? 'bg-amber-500/5' : ''}`}
                        onClick={() => toggleSelect(c.id)}
                      >
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleSelect(c.id)}
                            className="cursor-pointer inline-flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-[var(--color-amber)]" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                          {c.customerCode}
                        </TableCell>
                        <TableCell className="font-mono font-medium text-slate-600">
                          {c.crfNumber || '—'}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">{c.fullName}</TableCell>
                        <TableCell className="font-mono text-slate-600">{c.contactNumber}</TableCell>
                        <TableCell className="text-slate-600">{c.subArea}</TableCell>
                        <TableCell className="text-slate-600">{c.area}</TableCell>
                        <TableCell className="font-medium text-slate-800">{c.city}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-100 text-slate-800 text-[10px]">
                            {c.packageTier}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-right text-slate-900">
                          Rs. {c.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-semibold ${
                              c.status === 'CONNECTION_ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              c.status === 'TEMPORARY_BLOCKED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              c.status === 'NON_PAYMENT_BLOCKED' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                              'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {c.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
