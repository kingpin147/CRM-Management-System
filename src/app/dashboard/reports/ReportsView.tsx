'use client'

import * as React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Search, Filter, RotateCcw, Zap, Receipt, Users, CheckCircle2, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react'

type CustomerRecord = {
  id: string
  customerCode: string
  fullName: string
  customerType: string
  contactNumber: string
  email: string | null
  cnic: string
  crfNumber: string | null
  status: string
  signupDate: string | null
  address: string
  houseNo?: string | null
  streetNo?: string | null
  block?: string | null
  subArea?: string | null
  area?: string | null
  city: string
  solarSystem: any | null
  packagePlan: any | null
  invoices: any[]
  ledgerEntries: any[]
  transactions: any[]
}

const STATUS_OPTIONS = [
  { key: 'SIGNUP_GENERATED', label: 'Sign up Generated' },
  { key: 'PENDING_PAYMENT_VERIFICATION', label: 'Pending For Payment Verification' },
  { key: 'PENDING_ACTIVATION', label: 'Pending For Activation' },
  { key: 'CONNECTION_ACTIVE', label: 'Connection Active' },
  { key: 'NON_PAYMENT_BLOCKED', label: 'Non Payment Blocked' },
  { key: 'TEMPORARY_BLOCKED', label: 'Temporary Blocked' },
  { key: 'PERMANENT_DISCONNECTION', label: 'Permanent Disconnection' },
  { key: 'FOC_CONNECTION', label: 'FOC Connection' },
  { key: 'IN_HOUSE_CONNECTION', label: 'In House Connection' },
]

export function ReportsView({ 
  customers, 
  initialView = 'status' 
}: { 
  customers: CustomerRecord[]
  initialView?: string 
}) {
  const mapInitialView = (view: string) => {
    switch (view) {
      case 'status': return 'STATUS'
      case 'sales': return 'SALES'
      case 'receivable': return 'RECEIVABLE'
      case 'adjustment': return 'ADJUSTMENT'
      case 'payments': return 'PAYMENTS'
      case 'register': return 'REGISTER'
      default: return 'STATUS'
    }
  }

  const [activeCategory, setActiveCategory] = React.useState<string>(mapInitialView(initialView))
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([])
  const [selectedCity, setSelectedCity] = React.useState<string>('ALL')
  const [selectedArea, setSelectedArea] = React.useState<string>('ALL')
  const [selectedSubArea, setSelectedSubArea] = React.useState<string>('ALL')
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  // Unique Lists for Dropdowns
  const cities = React.useMemo(() => {
    return Array.from(new Set(customers.map((c) => c.city).filter(Boolean))).sort()
  }, [customers])

  const areas = React.useMemo(() => {
    return Array.from(new Set(customers.map((c) => c.area).filter(Boolean))).sort()
  }, [customers])

  const subAreas = React.useMemo(() => {
    return Array.from(new Set(customers.map((c) => c.subArea).filter(Boolean))).sort()
  }, [customers])

  // Category counts
  const categoryCounts = React.useMemo(() => {
    return {
      STATUS: customers.length,
      SALES: customers.filter((c) => c.packagePlan !== null).length,
      RECEIVABLE: customers.filter((c) => (c.invoices && c.invoices.some((i: any) => i.status === 'UNPAID')) || (c.ledgerEntries && c.ledgerEntries.some((l: any) => Number(l.balance) > 0))).length,
      ADJUSTMENT: customers.filter((c) => c.ledgerEntries && c.ledgerEntries.some((l: any) => l.narration?.toLowerCase().includes('adjustment') || l.narration?.toLowerCase().includes('discount'))).length,
      PAYMENTS: customers.filter((c) => c.transactions && c.transactions.length > 0).length,
      REGISTER: customers.length,
    }
  }, [customers])

  // Filtered dataset
  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      // 1. Status Checkboxes (Multi-select)
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(c.status)) return false

      // 2. City filter
      if (selectedCity !== 'ALL' && c.city?.toLowerCase() !== selectedCity.toLowerCase()) return false

      // 3. Area filter
      if (selectedArea !== 'ALL' && c.area?.toLowerCase() !== selectedArea.toLowerCase()) return false

      // 4. Sub Area filter
      if (selectedSubArea !== 'ALL' && c.subArea?.toLowerCase() !== selectedSubArea.toLowerCase()) return false

      // 5. Date filter
      if (dateFrom && c.signupDate) {
        if (new Date(c.signupDate) < new Date(dateFrom)) return false
      }
      if (dateTo && c.signupDate) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(c.signupDate) > to) return false
      }

      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          c.fullName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q) ||
          c.crfNumber?.toLowerCase().includes(q) ||
          c.contactNumber?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.area?.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [customers, selectedStatuses, selectedCity, selectedArea, selectedSubArea, dateFrom, dateTo, searchQuery])

  function toggleStatus(key: string) {
    setSelectedStatuses((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  function handleReset() {
    setSelectedStatuses([])
    setSelectedCity('ALL')
    setSelectedArea('ALL')
    setSelectedSubArea('ALL')
    setDateFrom('')
    setDateTo('')
    setSearchQuery('')
  }

  // Export to Excel / CSV matching Image 5 layout
  function handleExportExcel() {
    if (filteredCustomers.length === 0) {
      alert('No records available to export.')
      return
    }

    const headers = [
      'Customer ID',
      'Customer Name',
      'Customer Address',
      'Contact #',
      'House #',
      'Block',
      'Street #',
      'Sub Area',
      'Area',
      'City',
      'Customer Package',
      'Status',
    ]

    const rows = filteredCustomers.map((c) => [
      `"${c.customerCode || c.crfNumber || ''}"`,
      `"${c.fullName}"`,
      `"${c.address}"`,
      `"${c.contactNumber}"`,
      `"${c.houseNo || ''}"`,
      `"${c.block || ''}"`,
      `"${c.streetNo || ''}"`,
      `"${c.subArea || ''}"`,
      `"${c.area || ''}"`,
      `"${c.city}"`,
      `"${c.packagePlan?.packageTier || 'Basic'}"`,
      `"${c.status.replace(/_/g, ' ')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Customer_Status_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const categoryTabs = [
    { id: 'STATUS', label: 'Customer Status Report', icon: CheckCircle2, count: categoryCounts.STATUS },
    { id: 'SALES', label: 'Sales Report', icon: Receipt, count: categoryCounts.SALES },
    { id: 'RECEIVABLE', label: 'Customer Receivable', icon: AlertTriangle, count: categoryCounts.RECEIVABLE },
    { id: 'ADJUSTMENT', label: 'Adjustment Report', icon: Clock, count: categoryCounts.ADJUSTMENT },
    { id: 'PAYMENTS', label: 'Payments Report', icon: Zap, count: categoryCounts.PAYMENTS },
    { id: 'REGISTER', label: 'Customer Register', icon: Users, count: categoryCounts.REGISTER },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Export to Excel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Reports</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Real-time status reports, sales summaries, and export capabilities.</p>
        </div>
        <Button onClick={handleExportExcel} className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold shadow-md gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Export to Excel
        </Button>
      </div>

      {/* Report Tabs Navigation */}
      <div className="flex space-x-2 border-b border-line overflow-x-auto pb-px">
        {categoryTabs.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[var(--color-amber)] text-[var(--color-graphite)] bg-white shadow-xs font-bold'
                  : 'border-transparent text-[var(--color-slate-custom)] hover:text-[var(--color-ink)] hover:bg-black/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--color-amber)]' : 'text-[var(--color-slate-custom)]'}`} />
              <span>{cat.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                isActive ? 'bg-amber-100 text-amber-900' : 'bg-black/5 text-[var(--color-slate-custom)]'
              }`}>
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Customer Status Report Filter Grid (Image 5 Layout) */}
      <Card className="shadow-sm border-line bg-white">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--color-amber)]" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--color-graphite)]">
              Customer Status Report Filters
            </CardTitle>
          </div>
          <Button onClick={handleReset} variant="ghost" size="sm" className="h-8 text-xs text-[var(--color-slate-custom)] hover:text-[var(--color-ink)]">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Filters
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Top Filter Bar: Country, City, Area, Sub Area, Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Country</Label>
              <Input readOnly value="Pakistan (Always Selected)" className="h-9 text-xs bg-gray-50 font-semibold" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">City</Label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Area</Label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Areas</option>
                {areas.map((area) => (
                  <option key={area} value={area || ''}>{area}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Sub Area</Label>
              <select
                value={selectedSubArea}
                onChange={(e) => setSelectedSubArea(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Sub Areas</option>
                {subAreas.map((sa) => (
                  <option key={sa} value={sa || ''}>{sa}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Calendar Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs h-9 border-[var(--color-line)]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Calendar Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs h-9 border-[var(--color-line)]"
              />
            </div>
          </div>

          {/* Status Checkbox Group (Image 5 Layout) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <Label className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider block">
              Select Status Filters
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-amber-50/20 p-4 rounded-xl border border-amber-200/60">
              {STATUS_OPTIONS.map((st) => {
                const isChecked = selectedStatuses.includes(st.key)
                return (
                  <label key={st.key} className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStatus(st.key)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>{st.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Search bar & Record counter */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-slate-custom)]" />
              <Input
                placeholder="Search Customer ID, Name, Contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 border-[var(--color-line)]"
              />
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 font-medium">
              Showing <strong className="text-[var(--color-ink)]">{filteredCustomers.length}</strong> matching records out of {customers.length} total customers
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Status Report Table (Image 5 Exact Format) */}
      <Card className="shadow-sm border-line overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[var(--color-paper)]">
              <TableRow className="border-b border-gray-200">
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer ID</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Name</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Address</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Contact #</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">House #</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Block</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Street #</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sub Area</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Area</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">City</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Package</TableHead>
                <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                    No customers found matching the selected status and location filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50 text-xs">
                    <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                      <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                        {c.customerCode || c.crfNumber || c.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">{c.fullName}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">{c.address}</TableCell>
                    <TableCell className="font-mono">{c.contactNumber}</TableCell>
                    <TableCell>{c.houseNo || '-'}</TableCell>
                    <TableCell>{c.block || '-'}</TableCell>
                    <TableCell>{c.streetNo || '-'}</TableCell>
                    <TableCell>{c.subArea || '-'}</TableCell>
                    <TableCell>{c.area || '-'}</TableCell>
                    <TableCell className="font-semibold">{c.city}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-950 border-amber-200">
                        {c.packagePlan?.packageTier || 'Basic'} ({c.packagePlan?.systemSizeKw || '10kW'})
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold">
                        {c.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
