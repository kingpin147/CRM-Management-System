'use client'

import * as React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Search, Filter, RotateCcw, Zap, Sun, Receipt, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

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
  city: string
  block: string | null
  solarSystem: any | null
  packagePlan: any | null
  invoices: any[]
  ledgerEntries: any[]
  transactions: any[]
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CONNECTION_ACTIVE: { label: 'Connection Active', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  PENDING_ACTIVATION: { label: 'Pending Activation', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  PENDING_PAYMENT_VERIFICATION: { label: 'Payment Verification', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  SIGNUP_GENERATED: { label: 'Signup Generated', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  NON_PAYMENT_BLOCKED: { label: 'Non-Payment Blocked', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  TEMPORARY_BLOCKED: { label: 'Temporary Blocked', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  PERMANENT_DISCONNECTION: { label: 'Permanently Disconnected', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  FOC_CONNECTION: { label: 'FOC Connection', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  IN_HOUSE_CONNECTION: { label: 'In-House Connection', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
}

export function ReportsView({ customers }: { customers: CustomerRecord[] }) {
  const [activeCategory, setActiveCategory] = React.useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL')
  const [selectedCity, setSelectedCity] = React.useState<string>('ALL')
  const [selectedType, setSelectedType] = React.useState<string>('ALL')
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  // Extract unique cities
  const cities = React.useMemo(() => {
    const list = Array.from(new Set(customers.map((c) => c.city).filter(Boolean)))
    return list.sort()
  }, [customers])

  // Category counts
  const categoryCounts = React.useMemo(() => {
    return {
      ALL: customers.length,
      ACTIVE: customers.filter((c) => c.status === 'CONNECTION_ACTIVE').length,
      PENDING: customers.filter((c) => ['SIGNUP_GENERATED', 'PENDING_PAYMENT_VERIFICATION', 'PENDING_ACTIVATION'].includes(c.status)).length,
      BLOCKED: customers.filter((c) => ['NON_PAYMENT_BLOCKED', 'TEMPORARY_BLOCKED', 'PERMANENT_DISCONNECTION'].includes(c.status)).length,
      FOC: customers.filter((c) => ['FOC_CONNECTION', 'IN_HOUSE_CONNECTION'].includes(c.status)).length,
      EQUIPMENT: customers.filter((c) => c.solarSystem !== null).length,
      BILLING: customers.filter((c) => c.packagePlan !== null).length,
    }
  }, [customers])

  // Filtered dataset
  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      // 1. Report Category filter
      if (activeCategory === 'ACTIVE' && c.status !== 'CONNECTION_ACTIVE') return false
      if (activeCategory === 'PENDING' && !['SIGNUP_GENERATED', 'PENDING_PAYMENT_VERIFICATION', 'PENDING_ACTIVATION'].includes(c.status)) return false
      if (activeCategory === 'BLOCKED' && !['NON_PAYMENT_BLOCKED', 'TEMPORARY_BLOCKED', 'PERMANENT_DISCONNECTION'].includes(c.status)) return false
      if (activeCategory === 'FOC' && !['FOC_CONNECTION', 'IN_HOUSE_CONNECTION'].includes(c.status)) return false
      if (activeCategory === 'EQUIPMENT' && !c.solarSystem) return false
      if (activeCategory === 'BILLING' && !c.packagePlan) return false

      // 2. Status dropdown/pill
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false

      // 3. City filter
      if (selectedCity !== 'ALL' && c.city.toLowerCase() !== selectedCity.toLowerCase()) return false

      // 4. Type filter
      if (selectedType !== 'ALL' && c.customerType !== selectedType) return false

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
          c.cnic?.toLowerCase().includes(q) ||
          c.contactNumber?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.solarSystem?.inverterBrand?.toLowerCase().includes(q) ||
          c.packagePlan?.packageTier?.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [customers, activeCategory, selectedStatus, selectedCity, selectedType, dateFrom, dateTo, searchQuery])

  // Reset all filters
  function handleReset() {
    setSelectedStatus('ALL')
    setSelectedCity('ALL')
    setSelectedType('ALL')
    setDateFrom('')
    setDateTo('')
    setSearchQuery('')
  }

  // Export to CSV
  function handleExportCsv() {
    if (filteredCustomers.length === 0) {
      alert('No records to export in the current view.')
      return
    }

    let headers: string[] = []
    let rows: string[][] = []

    if (activeCategory === 'EQUIPMENT') {
      headers = ['Customer Code', 'Name', 'City', 'Inverter Brand', 'Inverter Capacity', 'Inverter Phase', 'Panel Brand', 'Total Panels', 'Array kW', 'Battery Brand', 'DISCO', 'Status']
      rows = filteredCustomers.map((c) => [
        c.customerCode,
        `"${c.fullName}"`,
        `"${c.city}"`,
        `"${c.solarSystem?.inverterBrand || 'N/A'}"`,
        `"${c.solarSystem?.inverterSize || 'N/A'}"`,
        `"${c.solarSystem?.inverterPhase || 'N/A'}"`,
        `"${c.solarSystem?.panelBrand || 'N/A'}"`,
        `"${c.solarSystem?.noOfPanels || 0}"`,
        `"${c.solarSystem?.totalWattage ? (c.solarSystem.totalWattage / 1000).toFixed(2) : '0'} kW"`,
        `"${c.solarSystem?.batteryBrand || 'None'}"`,
        `"${c.solarSystem?.disco || 'N/A'}"`,
        `"${c.status}"`,
      ])
    } else if (activeCategory === 'BILLING') {
      headers = ['Customer Code', 'Name', 'Contact', 'Package Tier', 'System Size', 'Billing Type', 'Monthly Fee (PKR)', 'Discount %', 'Status']
      rows = filteredCustomers.map((c) => [
        c.customerCode,
        `"${c.fullName}"`,
        `"${c.contactNumber}"`,
        `"${c.packagePlan?.packageTier || 'N/A'}"`,
        `"${c.packagePlan?.systemSizeKw || 'N/A'}"`,
        `"${c.packagePlan?.billingType || 'N/A'}"`,
        `"${c.packagePlan?.totalAmount || 0}"`,
        `"${c.packagePlan?.appliedDiscount || 0}%"`,
        `"${c.status}"`,
      ])
    } else {
      headers = ['Customer Code', 'CRF #', 'Full Name', 'Type', 'CNIC', 'Contact #', 'Address', 'City', 'Package Tier', 'Status', 'Signup Date']
      rows = filteredCustomers.map((c) => [
        c.customerCode,
        `"${c.crfNumber || ''}"`,
        `"${c.fullName}"`,
        `"${c.customerType}"`,
        `"${c.cnic}"`,
        `"${c.contactNumber}"`,
        `"${c.address}"`,
        `"${c.city}"`,
        `"${c.packagePlan?.packageTier || 'N/A'}"`,
        `"${c.status}"`,
        `"${c.signupDate ? new Date(c.signupDate).toLocaleDateString() : ''}"`,
      ])
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `EnergyGurus_Report_${activeCategory}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const categoryTabs = [
    { id: 'ALL', label: 'All Customers', icon: Users, count: categoryCounts.ALL },
    { id: 'ACTIVE', label: 'Active Connections', icon: CheckCircle2, count: categoryCounts.ACTIVE },
    { id: 'PENDING', label: 'Pending Activations', icon: Clock, count: categoryCounts.PENDING },
    { id: 'BLOCKED', label: 'Blocked & Disconnected', icon: AlertTriangle, count: categoryCounts.BLOCKED },
    { id: 'FOC', label: 'FOC & In-House', icon: Zap, count: categoryCounts.FOC },
    { id: 'EQUIPMENT', label: 'O&M Solar Hardware', icon: Sun, count: categoryCounts.EQUIPMENT },
    { id: 'BILLING', label: 'Financial & Billing', icon: Receipt, count: categoryCounts.BILLING },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Reports Center</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">
            Real-time analytics, installation status audits, and customer breakdowns.
          </p>
        </div>
        <Button onClick={handleExportCsv} variant="outline" className="shadow-sm border-[var(--color-line)] bg-white">
          <Download className="mr-2 h-4 w-4 text-[var(--color-amber)]" /> Export View to Excel/CSV
        </Button>
      </div>

      {/* Top Report Categories Navigation */}
      <div className="flex space-x-2 border-b border-line overflow-x-auto pb-px">
        {categoryTabs.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                setSelectedStatus('ALL')
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[var(--color-amber)] text-[var(--color-graphite)] bg-white shadow-xs'
                  : 'border-transparent text-[var(--color-slate-custom)] hover:text-[var(--color-ink)] hover:bg-black/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--color-amber)]' : 'text-[var(--color-slate-custom)]'}`} />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${
                isActive ? 'bg-[var(--color-amber)]/20 text-[var(--color-graphite)]' : 'bg-black/5 text-[var(--color-slate-custom)]'
              }`}>
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Live Interactive Filters Panel */}
      <Card className="shadow-sm border-line bg-white">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--color-amber)]" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--color-graphite)]">
              Interactive Filter Toolbar
            </CardTitle>
          </div>
          <Button onClick={handleReset} variant="ghost" size="sm" className="h-8 text-xs text-[var(--color-slate-custom)] hover:text-[var(--color-ink)]">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Filters
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Live Search */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Search Keyword</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-slate-custom)]" />
                <Input
                  placeholder="Name, CRF, CNIC, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 border-[var(--color-line)]"
                />
              </div>
            </div>

            {/* City Dropdown */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">City</Label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Cities ({cities.length})</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Type Dropdown */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Client Type</Label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Types</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="CORPORATE">Corporate</option>
                <option value="INDUSTRIAL">Industrial</option>
              </select>
            </div>

            {/* Specific Status Filter */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Specific Status</Label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--color-line)]">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Signup Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs h-9 border-[var(--color-line)]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Signup Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs h-9 border-[var(--color-line)]"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <div className="text-xs text-[var(--color-slate-custom)] bg-[var(--color-paper)] p-2 rounded-lg border border-[var(--color-line)] w-full flex justify-between items-center">
                <span>Showing <strong>{filteredCustomers.length}</strong> matching records</span>
                <span className="font-semibold text-[var(--color-graphite)]">Active View: {activeCategory}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Report Table */}
      <Card className="shadow-sm border-line overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[var(--color-paper)]">
              {/* Category-Specific Table Headers */}
              {activeCategory === 'EQUIPMENT' ? (
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Inverter Specs</TableHead>
                  <TableHead>PV Panels Array</TableHead>
                  <TableHead>Battery Storage</TableHead>
                  <TableHead>DISCO & Grid</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              ) : activeCategory === 'BILLING' ? (
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Package Tier</TableHead>
                  <TableHead>System Size</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Fee Amount (PKR)</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              ) : (
                <TableRow>
                  <TableHead>Customer ID / CRF</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact #</TableHead>
                  <TableHead>Address / City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              )}
            </TableHeader>

            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                    No customers found matching the selected filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => {
                  const statusConf = STATUS_CONFIG[c.status] || {
                    label: c.status,
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    border: 'border-gray-200',
                  }

                  if (activeCategory === 'EQUIPMENT') {
                    return (
                      <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50">
                        <TableCell className="font-semibold text-xs text-[var(--color-ink)]">
                          {c.fullName}
                          <span className="block font-mono text-[11px] text-[var(--color-slate-custom)]">{c.customerCode}</span>
                        </TableCell>
                        <TableCell className="text-xs">{c.city}</TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold text-[var(--color-ink)]">{c.solarSystem?.inverterBrand} {c.solarSystem?.inverterSize}</span>
                          <span className="block text-[11px] text-[var(--color-slate-custom)]">{c.solarSystem?.inverterType} • {c.solarSystem?.inverterPhase}</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold text-[var(--color-ink)]">{c.solarSystem?.noOfPanels}x {c.solarSystem?.panelBrand}</span>
                          <span className="block text-[11px] text-[var(--color-teal)] font-medium">
                            {c.solarSystem?.totalWattage ? (c.solarSystem.totalWattage / 1000).toFixed(2) : 0} kW Array
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {c.solarSystem?.batteryBrand ? (
                            <span>{c.solarSystem.noOfBatteries}x {c.solarSystem.batteryBrand} ({c.solarSystem.batteryType})</span>
                          ) : (
                            <span className="text-[var(--color-slate-custom)] italic">No Battery</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span>{c.solarSystem?.disco || 'LESCO'} ({c.solarSystem?.meterType || 'Green Meter'})</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/customers/${c.id}?tab=solar`}>
                            <Button variant="ghost" size="sm" className="text-xs text-[var(--color-amber)] hover:text-[var(--color-ink)]">
                              View Specs
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  }

                  if (activeCategory === 'BILLING') {
                    return (
                      <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50">
                        <TableCell className="font-semibold text-xs text-[var(--color-ink)]">
                          {c.fullName}
                          <span className="block font-mono text-[11px] text-[var(--color-slate-custom)]">{c.customerCode}</span>
                        </TableCell>
                        <TableCell className="text-xs">{c.contactNumber}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="font-semibold">{c.packagePlan?.packageTier || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{c.packagePlan?.systemSizeKw || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{c.packagePlan?.billingType || 'N/A'}</TableCell>
                        <TableCell className="text-xs font-bold text-[var(--color-graphite)]">
                          PKR {Number(c.packagePlan?.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/customers/${c.id}?tab=ledger`}>
                            <Button variant="ghost" size="sm" className="text-xs text-[var(--color-amber)] hover:text-[var(--color-ink)]">
                              View Ledger
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  }

                  return (
                    <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50">
                      <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                        {c.crfNumber || c.customerCode}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-[var(--color-ink)]">
                        {c.fullName}
                        <span className="block text-[11px] text-[var(--color-slate-custom)]">{c.email || c.cnic}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] text-[11px]">
                          {c.customerType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{c.contactNumber}</TableCell>
                      <TableCell className="text-xs">
                        {c.address}, <strong className="text-[var(--color-ink)]">{c.city}</strong>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-semibold ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                          {statusConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/customers/${c.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-[var(--color-amber)] hover:text-[var(--color-ink)]">
                            View Profile
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
