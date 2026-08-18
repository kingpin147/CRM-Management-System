'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, RotateCcw, Zap, Receipt, Users, CheckCircle2, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
  accountExecutive?: { fullName: string } | null
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const viewParam = searchParams.get('view') || initialView || 'status'

  // Map URL parameter to active category ID
  const activeCategory = React.useMemo(() => {
    switch (viewParam.toLowerCase()) {
      case 'status': return 'STATUS'
      case 'sales': return 'SALES'
      case 'receivable': return 'RECEIVABLE'
      case 'adjustment': return 'ADJUSTMENT'
      case 'payments': return 'PAYMENTS'
      case 'register': return 'REGISTER'
      default: return 'STATUS'
    }
  }, [viewParam])

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
      RECEIVABLE: customers.filter((c) => {
        const total = Number(c.packagePlan?.totalAmount) || 0
        const paid = Number(c.packagePlan?.paidAmount) || 0
        const hasUnpaidInvoice = c.invoices && c.invoices.some((i: any) => i.status === 'UNPAID')
        return hasUnpaidInvoice || (total > paid)
      }).length,
      ADJUSTMENT: customers.filter((c) => {
        const hasDiscount = Number(c.packagePlan?.appliedDiscount) > 0
        const hasLedgerAdj = c.ledgerEntries && c.ledgerEntries.some((l: any) => 
          l.narration?.toLowerCase().includes('adjustment') || l.narration?.toLowerCase().includes('discount')
        )
        return hasDiscount || hasLedgerAdj
      }).length,
      PAYMENTS: customers.filter((c) => (c.transactions && c.transactions.length > 0) || (Number(c.packagePlan?.paidAmount) > 0)).length,
      REGISTER: customers.length,
    }
  }, [customers])

  // Filtered dataset
  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      // Category-specific base conditions
      if (activeCategory === 'SALES' && !c.packagePlan) return false
      
      if (activeCategory === 'RECEIVABLE') {
        const total = Number(c.packagePlan?.totalAmount) || 0
        const paid = Number(c.packagePlan?.paidAmount) || 0
        const hasUnpaidInvoice = c.invoices && c.invoices.some((i: any) => i.status === 'UNPAID')
        if (!hasUnpaidInvoice && total <= paid) return false
      }

      if (activeCategory === 'ADJUSTMENT') {
        const hasDiscount = Number(c.packagePlan?.appliedDiscount) > 0
        const hasLedgerAdj = c.ledgerEntries && c.ledgerEntries.some((l: any) => 
          l.narration?.toLowerCase().includes('adjustment') || l.narration?.toLowerCase().includes('discount')
        )
        if (!hasDiscount && !hasLedgerAdj) return false
      }

      if (activeCategory === 'PAYMENTS') {
        const hasTransactions = c.transactions && c.transactions.length > 0
        const hasPaidAmount = Number(c.packagePlan?.paidAmount) > 0
        if (!hasTransactions && !hasPaidAmount) return false
      }

      // Status Checkboxes (Multi-select)
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(c.status)) return false

      // Location filters
      if (selectedCity !== 'ALL' && c.city?.toLowerCase() !== selectedCity.toLowerCase()) return false
      if (selectedArea !== 'ALL' && c.area?.toLowerCase() !== selectedArea.toLowerCase()) return false
      if (selectedSubArea !== 'ALL' && c.subArea?.toLowerCase() !== selectedSubArea.toLowerCase()) return false

      // Date filter
      if (dateFrom && c.signupDate) {
        if (new Date(c.signupDate) < new Date(dateFrom)) return false
      }
      if (dateTo && c.signupDate) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(c.signupDate) > to) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          c.fullName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q) ||
          c.crfNumber?.toLowerCase().includes(q) ||
          c.contactNumber?.toLowerCase().includes(q) ||
          c.cnic?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.area?.toLowerCase().includes(q) ||
          c.packagePlan?.packageTier?.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [customers, activeCategory, selectedStatuses, selectedCity, selectedArea, selectedSubArea, dateFrom, dateTo, searchQuery])

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

  const categoryTabs = [
    { id: 'STATUS', label: 'Customer Status Report', icon: CheckCircle2, count: categoryCounts.STATUS },
    { id: 'SALES', label: 'Sales Report', icon: Receipt, count: categoryCounts.SALES },
    { id: 'RECEIVABLE', label: 'Customer Receivable', icon: AlertTriangle, count: categoryCounts.RECEIVABLE },
    { id: 'ADJUSTMENT', label: 'Adjustment Report', icon: Clock, count: categoryCounts.ADJUSTMENT },
    { id: 'PAYMENTS', label: 'Payments Report', icon: Zap, count: categoryCounts.PAYMENTS },
    { id: 'REGISTER', label: 'Customer Register', icon: Users, count: categoryCounts.REGISTER },
  ]

  const currentTabObj = categoryTabs.find(t => t.id === activeCategory) || categoryTabs[0]

  const handleTabChange = (categoryId: string) => {
    router.push(`/dashboard/reports?view=${categoryId.toLowerCase()}`, { scroll: false })
  }

  // Export to Excel / CSV matching the active category columns
  function handleExportExcel() {
    if (filteredCustomers.length === 0) {
      alert('No records available to export.')
      return
    }

    let headers: string[] = []
    let rows: string[][] = []

    if (activeCategory === 'STATUS') {
      headers = [
        'Customer ID', 'Customer Name', 'Customer Address', 'Contact #',
        'House #', 'Block', 'Street #', 'Sub Area', 'Area', 'City',
        'Customer Package', 'Status'
      ]
      rows = filteredCustomers.map((c) => [
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
    } else if (activeCategory === 'SALES') {
      headers = [
        'Customer ID', 'Customer Name', 'Contact #', 'Package Tier',
        'System Size', 'Billing Type', 'Monthly Base Price (PKR)', 'Applied Discount (%)',
        'Sales Tax (PKR)', 'Total Amount (PKR)', 'Paid Amount (PKR)', 'Sign Up Date'
      ]
      rows = filteredCustomers.map((c) => [
        `"${c.customerCode || c.crfNumber || ''}"`,
        `"${c.fullName}"`,
        `"${c.contactNumber}"`,
        `"${c.packagePlan?.packageTier || '-'}"`,
        `"${c.packagePlan?.systemSizeKw || '-'}"`,
        `"${c.packagePlan?.billingType || '-'}"`,
        `"${Math.round(Number(c.packagePlan?.monthlyBasePrice || 0))}"`,
        `"${Number(c.packagePlan?.appliedDiscount || 0)}%"`,
        `"${Math.round(Number(c.packagePlan?.salesTaxAmount || 0))}"`,
        `"${Math.round(Number(c.packagePlan?.totalAmount || 0))}"`,
        `"${Math.round(Number(c.packagePlan?.paidAmount || 0))}"`,
        `"${formatDate(c.signupDate)}"`,
      ])
    } else if (activeCategory === 'RECEIVABLE') {
      headers = [
        'Customer ID', 'Customer Name', 'Contact #', 'City', 'Package Tier',
        'Total Amount (PKR)', 'Paid Amount (PKR)', 'Receivable Balance (PKR)', 'Status'
      ]
      rows = filteredCustomers.map((c) => {
        const total = Math.round(Number(c.packagePlan?.totalAmount || 0))
        const paid = Math.round(Number(c.packagePlan?.paidAmount || 0))
        const receivable = Math.max(0, total - paid)
        return [
          `"${c.customerCode || c.crfNumber || ''}"`,
          `"${c.fullName}"`,
          `"${c.contactNumber}"`,
          `"${c.city}"`,
          `"${c.packagePlan?.packageTier || '-'}"`,
          `"${total}"`,
          `"${paid}"`,
          `"${receivable}"`,
          `"${c.status.replace(/_/g, ' ')}"`,
        ]
      })
    } else if (activeCategory === 'ADJUSTMENT') {
      headers = [
        'Customer ID', 'Customer Name', 'City', 'Package Tier', 'Billing Type',
        'Discount (%)', 'On-Boarding Fee (PKR)', 'Total Amount (PKR)', 'Sign Up Date'
      ]
      rows = filteredCustomers.map((c) => [
        `"${c.customerCode || c.crfNumber || ''}"`,
        `"${c.fullName}"`,
        `"${c.city}"`,
        `"${c.packagePlan?.packageTier || '-'}"`,
        `"${c.packagePlan?.billingType || '-'}"`,
        `"${Number(c.packagePlan?.appliedDiscount || 0)}%"`,
        `"${Number(c.packagePlan?.onboardingFee || 0)}"`,
        `"${Math.round(Number(c.packagePlan?.totalAmount || 0))}"`,
        `"${formatDate(c.signupDate)}"`,
      ])
    } else if (activeCategory === 'PAYMENTS') {
      headers = [
        'Customer ID', 'Customer Name', 'Contact #', 'City', 'Package',
        'Paid Amount (PKR)', 'Total Package Amount (PKR)', 'Sign Up Date', 'Status'
      ]
      rows = filteredCustomers.map((c) => [
        `"${c.customerCode || c.crfNumber || ''}"`,
        `"${c.fullName}"`,
        `"${c.contactNumber}"`,
        `"${c.city}"`,
        `"${c.packagePlan?.packageTier || '-'}"`,
        `"${Math.round(Number(c.packagePlan?.paidAmount || 0))}"`,
        `"${Math.round(Number(c.packagePlan?.totalAmount || 0))}"`,
        `"${formatDate(c.signupDate)}"`,
        `"${c.status.replace(/_/g, ' ')}"`,
      ])
    } else {
      // REGISTER
      headers = [
        'Customer ID', 'CRF #', 'Customer Name', 'Customer Type', 'Contact #',
        'CNIC', 'City', 'Package', 'Sign Up Date', 'Status'
      ]
      rows = filteredCustomers.map((c) => [
        `"${c.customerCode || ''}"`,
        `"${c.crfNumber || ''}"`,
        `"${c.fullName}"`,
        `"${c.customerType}"`,
        `"${c.contactNumber}"`,
        `"${c.cnic}"`,
        `"${c.city}"`,
        `"${c.packagePlan?.packageTier || '-'}"`,
        `"${formatDate(c.signupDate)}"`,
        `"${c.status.replace(/_/g, ' ')}"`,
      ])
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${currentTabObj.label.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header & Export to Excel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Reports</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Real-time status reports, sales summaries, and export capabilities.</p>
        </div>
        <Button onClick={handleExportExcel} className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold shadow-md gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" /> Export to Excel
        </Button>
      </div>

      {/* Report Tabs Navigation (Synchronized with URL query) */}
      <div className="flex space-x-2 border-b border-line overflow-x-auto pb-px">
        {categoryTabs.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleTabChange(cat.id)}
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

      {/* Dynamic Filter Card */}
      <Card className="shadow-sm border-line bg-white">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--color-amber)]" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--color-graphite)]">
              {currentTabObj.label} Filters
            </CardTitle>
          </div>
          <Button onClick={handleReset} variant="ghost" size="sm" className="h-8 text-xs text-[var(--color-slate-custom)] hover:text-[var(--color-ink)] cursor-pointer">
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

          {/* Status Checkbox Group */}
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
                placeholder="Search Customer ID, Name, Contact, CNIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 border-[var(--color-line)]"
              />
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 font-medium">
              Showing <strong className="text-[var(--color-ink)]">{filteredCustomers.length}</strong> matching records in {currentTabObj.label}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Report Table */}
      <Card className="shadow-sm border-line overflow-hidden">
        <CardContent className="p-0">
          <Table>
            {/* 1. CUSTOMER STATUS REPORT TABLE */}
            {activeCategory === 'STATUS' && (
              <>
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
                        No customers found matching the selected filters.
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
                          <Badge variant="outline" className="bg-amber-50 text-amber-950 border-amber-200 font-semibold">
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
              </>
            )}

            {/* 2. SALES REPORT TABLE */}
            {activeCategory === 'SALES' && (
              <>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Contact #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Package Tier</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">System Size</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Billing Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Base Rate</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Discount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Sales Tax</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Total Amount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Paid Amount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sign Up Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No sales records found matching the selected filters.
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
                        <TableCell className="font-mono">{c.contactNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
                            {c.packagePlan?.packageTier || 'Basic'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{c.packagePlan?.systemSizeKw || '-'}</TableCell>
                        <TableCell>{c.packagePlan?.billingType || '-'}</TableCell>
                        <TableCell className="text-right font-mono">PKR {Math.round(Number(c.packagePlan?.monthlyBasePrice || 0)).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-amber-800">{Number(c.packagePlan?.appliedDiscount || 0)}%</TableCell>
                        <TableCell className="text-right font-mono">PKR {Math.round(Number(c.packagePlan?.salesTaxAmount || 0)).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-[var(--color-ink)]">PKR {Math.round(Number(c.packagePlan?.totalAmount || 0)).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-700">PKR {Math.round(Number(c.packagePlan?.paidAmount || 0)).toLocaleString()}</TableCell>
                        <TableCell className="text-gray-600 font-mono">{formatDate(c.signupDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}

            {/* 3. CUSTOMER RECEIVABLE TABLE */}
            {activeCategory === 'RECEIVABLE' && (
              <>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Contact #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">City</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Package</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Total Package</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Paid Amount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Receivable Balance</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No outstanding receivables found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => {
                      const total = Math.round(Number(c.packagePlan?.totalAmount || 0))
                      const paid = Math.round(Number(c.packagePlan?.paidAmount || 0))
                      const balance = Math.max(0, total - paid)
                      return (
                        <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50 text-xs">
                          <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                            <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                              {c.customerCode || c.crfNumber || c.id.slice(0, 8)}
                            </Link>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">{c.fullName}</TableCell>
                          <TableCell className="font-mono">{c.contactNumber}</TableCell>
                          <TableCell>{c.city}</TableCell>
                          <TableCell>{c.packagePlan?.packageTier || 'Basic'}</TableCell>
                          <TableCell className="text-right font-mono font-medium">PKR {total.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-emerald-700 font-semibold">PKR {paid.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-rose-700">PKR {balance.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={balance > 0 ? "bg-rose-50 text-rose-800 border-rose-200 font-bold" : "bg-emerald-50 text-emerald-800 border-emerald-200"}>
                              {balance > 0 ? 'Payment Pending' : 'Clear'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </>
            )}

            {/* 4. ADJUSTMENT REPORT TABLE */}
            {activeCategory === 'ADJUSTMENT' && (
              <>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">City</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Package Tier</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Billing Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Discount (%)</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">On-Boarding Fee</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Total Package</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sign Up Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No adjustment / discounted records found.
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
                        <TableCell>{c.city}</TableCell>
                        <TableCell>{c.packagePlan?.packageTier || '-'}</TableCell>
                        <TableCell>{c.packagePlan?.billingType || '-'}</TableCell>
                        <TableCell className="text-right font-bold text-amber-800">{Number(c.packagePlan?.appliedDiscount || 0)}%</TableCell>
                        <TableCell className="text-right">
                          {Number(c.packagePlan?.onboardingFee || 0) === 0 ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                              Waived (PKR 0)
                            </Badge>
                          ) : (
                            <span className="font-mono">PKR {Number(c.packagePlan?.onboardingFee || 0).toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[var(--color-ink)]">
                          PKR {Math.round(Number(c.packagePlan?.totalAmount || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-600 font-mono">{formatDate(c.signupDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}

            {/* 5. PAYMENTS REPORT TABLE */}
            {activeCategory === 'PAYMENTS' && (
              <>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Contact #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">City</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Package</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Paid Amount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right">Total Amount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sign Up Date</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No payment records found matching the selected filters.
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
                        <TableCell className="font-mono">{c.contactNumber}</TableCell>
                        <TableCell>{c.city}</TableCell>
                        <TableCell>{c.packagePlan?.packageTier || '-'}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-700">
                          PKR {Math.round(Number(c.packagePlan?.paidAmount || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          PKR {Math.round(Number(c.packagePlan?.totalAmount || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-600 font-mono">{formatDate(c.signupDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold">
                            {c.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}

            {/* 6. CUSTOMER REGISTER TABLE */}
            {activeCategory === 'REGISTER' && (
              <>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">CRF #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Contact #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">CNIC</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">City</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Package</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sign Up Date</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No customer records found in the register.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => (
                      <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50 text-xs">
                        <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                          <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                            {c.customerCode || c.id.slice(0, 8)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-gray-700">{c.crfNumber || '-'}</TableCell>
                        <TableCell className="font-semibold text-gray-900">{c.fullName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-100 text-slate-800 text-[10px]">
                            {c.customerType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{c.contactNumber}</TableCell>
                        <TableCell className="font-mono text-gray-600">{c.cnic}</TableCell>
                        <TableCell className="font-semibold">{c.city}</TableCell>
                        <TableCell>{c.packagePlan?.packageTier || 'Basic'}</TableCell>
                        <TableCell className="text-gray-600 font-mono">{formatDate(c.signupDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold">
                            {c.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
