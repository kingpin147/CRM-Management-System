'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { columns, formatTicketId, type TicketWithCustomer } from './columns'
import { PAKISTAN_CITIES_AREAS } from '@/lib/pakistan-cities-areas'
import { FileSpreadsheet } from 'lucide-react'

interface TicketsViewProps {
  tickets: TicketWithCustomer[]
  userRole: string
  initialStatusParam?: string
}

export function TicketsView({ tickets, userRole, initialStatusParam }: TicketsViewProps) {
  // Determine default department based on user role
  const roleUpper = (userRole || '').toUpperCase()
  let defaultDept = 'ALL'
  if (roleUpper === 'BILLING_MANAGER') {
    defaultDept = 'Billing'
  } else if (roleUpper === 'SALES_MANAGER' || roleUpper === 'SALES') {
    defaultDept = 'Sales'
  } else if (roleUpper === 'OM_MANAGER' || roleUpper === 'INSTALLATION') {
    defaultDept = 'O&M'
  }

  // Determine initial status tab: default to PENDING unless initialStatusParam is explicit
  const resolvedInitialStatus = React.useMemo(() => {
    if (!initialStatusParam) return 'PENDING'
    const s = initialStatusParam.toUpperCase()
    if (['PENDING', 'RESOLVED', 'CLOSED', 'ON_HOLD', 'ONHOLD', 'ALL'].includes(s)) {
      return s === 'ONHOLD' ? 'ON_HOLD' : s
    }
    return 'PENDING'
  }, [initialStatusParam])

  // Filter States
  const [statusTab, setStatusTab] = React.useState<string>(resolvedInitialStatus)
  const [selectedDept, setSelectedDept] = React.useState<string>(defaultDept)
  const [selectedCountry, setSelectedCountry] = React.useState<string>('Pakistan')
  const [selectedCity, setSelectedCity] = React.useState<string>('ALL')
  const [selectedArea, setSelectedArea] = React.useState<string>('ALL')
  const [selectedSubArea, setSelectedSubArea] = React.useState<string>('ALL')
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [searchCustomerId, setSearchCustomerId] = React.useState<string>('')
  const [searchTicketNo, setSearchTicketNo] = React.useState<string>('')

  // Derive unique cities & areas from dataset
  const citiesList = React.useMemo(() => {
    const knownCities = Object.keys(PAKISTAN_CITIES_AREAS)
    const datasetCities = tickets
      .map((t) => t.customer?.city)
      .filter(Boolean) as string[]
    return Array.from(new Set([...knownCities, ...datasetCities])).sort()
  }, [tickets])

  const areasList = React.useMemo(() => {
    if (selectedCity !== 'ALL' && PAKISTAN_CITIES_AREAS[selectedCity]) {
      return PAKISTAN_CITIES_AREAS[selectedCity].areas
    }
    const datasetAreas = tickets
      .map((t) => t.customer?.area)
      .filter(Boolean) as string[]
    return Array.from(new Set(datasetAreas)).sort()
  }, [tickets, selectedCity])

  const subAreasList = React.useMemo(() => {
    const datasetSubAreas = tickets
      .map((t) => t.customer?.subArea)
      .filter(Boolean) as string[]
    return Array.from(new Set(datasetSubAreas)).sort()
  }, [tickets])

  // Reset area when city changes
  React.useEffect(() => {
    setSelectedArea('ALL')
    setSelectedSubArea('ALL')
  }, [selectedCity])

  // Filter Logic
  const filteredTickets = React.useMemo(() => {
    return tickets.filter((ticket) => {
      const cust = ticket.customer

      // 1. Status Filter
      if (statusTab !== 'ALL') {
        const ticketStatus = (ticket.status || '').toUpperCase()
        if (statusTab === 'ON_HOLD' || statusTab === 'ONHOLD') {
          if (ticketStatus !== 'ON_HOLD' && ticketStatus !== 'ONHOLD') return false
        } else if (ticketStatus !== statusTab) {
          return false
        }
      }

      // 2. Department Filter
      if (selectedDept !== 'ALL') {
        const ticketDept = (ticket.assignedTo || '').toLowerCase()
        const targetDept = selectedDept.toLowerCase()
        if (targetDept === 'o&m' || targetDept === 'operations & maintenance') {
          if (!ticketDept.includes('o&m') && !ticketDept.includes('operation')) return false
        } else if (!ticketDept.includes(targetDept)) {
          return false
        }
      }

      // 3. Location Filters
      if (selectedCountry !== 'ALL') {
        const cCountry = (cust?.country || 'Pakistan').toLowerCase()
        if (cCountry !== selectedCountry.toLowerCase()) return false
      }
      if (selectedCity !== 'ALL') {
        if (!cust?.city || cust.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false
        }
      }
      if (selectedArea !== 'ALL') {
        if (!cust?.area || cust.area.toLowerCase() !== selectedArea.toLowerCase()) {
          return false
        }
      }
      if (selectedSubArea !== 'ALL') {
        if (!cust?.subArea || cust.subArea.toLowerCase() !== selectedSubArea.toLowerCase()) {
          return false
        }
      }

      // 4. Date Range Filters
      if (dateFrom) {
        const tDate = new Date(ticket.createdAt).toISOString().split('T')[0]
        if (tDate < dateFrom) return false
      }
      if (dateTo) {
        const tDate = new Date(ticket.createdAt).toISOString().split('T')[0]
        if (tDate > dateTo) return false
      }

      // 5. Search by Customer ID / Code / Name / CNIC
      if (searchCustomerId.trim()) {
        const query = searchCustomerId.toLowerCase().trim()
        const matchCode = cust?.customerCode?.toLowerCase().includes(query)
        const matchName = cust?.fullName?.toLowerCase().includes(query)
        const matchId = cust?.id?.toLowerCase().includes(query)
        const matchCnic = cust?.cnic?.toLowerCase().includes(query)
        if (!matchCode && !matchName && !matchId && !matchCnic) return false
      }

      // 6. Search by Ticket No.
      if (searchTicketNo.trim()) {
        const query = searchTicketNo.toLowerCase().trim()
        const rawNo = ticket.ticketNumber.toLowerCase()
        const formattedNo = formatTicketId(ticket.ticketNumber).toLowerCase()
        if (!rawNo.includes(query) && !formattedNo.includes(query)) return false
      }

      return true
    })
  }, [
    tickets,
    statusTab,
    selectedDept,
    selectedCountry,
    selectedCity,
    selectedArea,
    selectedSubArea,
    dateFrom,
    dateTo,
    searchCustomerId,
    searchTicketNo,
  ])

  // Counts for status tabs
  const pendingCount = React.useMemo(() => tickets.filter(t => t.status === 'PENDING').length, [tickets])
  const resolvedCount = React.useMemo(() => tickets.filter(t => t.status === 'RESOLVED').length, [tickets])
  const onHoldCount = React.useMemo(() => tickets.filter(t => (t.status as string) === 'ON_HOLD' || (t.status as string) === 'ONHOLD').length, [tickets])
  const closedCount = React.useMemo(() => tickets.filter(t => t.status === 'CLOSED').length, [tickets])
  const allCount = tickets.length

  // Export to Excel / CSV
  const handleExportToExcel = () => {
    if (filteredTickets.length === 0) {
      alert('No complaint records found matching current filters to export.')
      return
    }

    const headers = [
      'Ticket #',
      'Date & Time',
      'Customer ID',
      'Customer Name',
      'Address',
      'Contact #',
      'House',
      'Block',
      'Sub Area',
      'Area',
      'Complain Description',
      'Account Executive Sales',
      'Status',
    ]

    const rows = filteredTickets.map((t) => [
      `"${formatTicketId(t.ticketNumber)}"`,
      `"${new Date(t.createdAt).toLocaleString()}"`,
      `"${t.customer?.customerCode || ''}"`,
      `"${t.customer?.fullName || ''}"`,
      `"${(t.customer?.address || '').replace(/"/g, '""')}"`,
      `"${t.customer?.contactNumber || ''}"`,
      `"${t.customer?.houseNumber || ''}"`,
      `"${t.customer?.block || ''}"`,
      `"${t.customer?.subArea || ''}"`,
      `"${t.customer?.area || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.customer?.accountExecutive?.fullName || t.assignedTo || ''}"`,
      `"${t.status}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Complaints_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 animate-reveal">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight flex items-center gap-3">
            {statusTab === 'PENDING' ? 'Pending Complaints' : 'Complaint Management'}
            {statusTab === 'PENDING' && (
              <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-[var(--color-slate-custom)] mt-1 text-sm">
            {statusTab === 'PENDING' 
              ? 'Reviewing pending customer complaints requiring departmental action.' 
              : 'Track and manage customer complaints across department workflows.'}
          </p>
        </div>
        {/* Note: + Log New Ticket button removed as requested */}
      </div>

      {/* Primary Filter Toolbar - Country, City, Area, Sub Area, Dates */}
      <div className="bg-white p-4 rounded-xl border border-[var(--color-line)] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Country */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
            >
              <option value="ALL">All Countries</option>
              <option value="Pakistan">Pakistan</option>
            </select>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
            >
              <option value="ALL">All Cities</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
            >
              <option value="ALL">All Areas</option>
              {areasList.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Sub Area */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Sub Area</label>
            <select
              value={selectedSubArea}
              onChange={(e) => setSelectedSubArea(e.target.value)}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
            >
              <option value="ALL">All Sub Areas</option>
              {subAreasList.map((sa) => (
                <option key={sa} value={sa}>{sa}</option>
              ))}
            </select>
          </div>

          {/* Calendar Date From */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Calendar Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full h-9 px-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
            />
          </div>

          {/* Calendar Date To */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Calendar Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full h-9 px-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
            />
          </div>
        </div>

        {/* Secondary Filter Toolbar - Status & Department Filter, Searches, Export */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Status:</span>
              <select
                value={statusTab}
                onChange={(e) => setStatusTab(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              >
                <option value="PENDING">Pending ({pendingCount})</option>
                <option value="RESOLVED">Resolved ({resolvedCount})</option>
                <option value="ON_HOLD">Onhold ({onHoldCount})</option>
                <option value="CLOSED">Closed ({closedCount})</option>
                <option value="ALL">All Tickets ({allCount})</option>
              </select>
            </div>

            {/* Department Filter Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              >
                <option value="ALL">All Departments</option>
                <option value="Billing">Billing</option>
                <option value="Sales">Sales</option>
                <option value="O&M">Operations & Maintenance (O&M)</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Inputs & Export Button Row */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-100 items-center">
          {/* Search by Customer ID */}
          <div className="relative">
            <Input
              placeholder="Search by Customer ID..."
              value={searchCustomerId}
              onChange={(e) => setSearchCustomerId(e.target.value)}
              className="h-9 text-xs pl-3 border-slate-300 focus-visible:ring-[var(--color-amber)] bg-white"
            />
          </div>

          {/* Search by Ticket No. */}
          <div className="relative">
            <Input
              placeholder="Search by Ticket No..."
              value={searchTicketNo}
              onChange={(e) => setSearchTicketNo(e.target.value)}
              className="h-9 text-xs pl-3 border-slate-300 focus-visible:ring-[var(--color-amber)] bg-white"
            />
          </div>

          {/* Export to Excel Button */}
          <div className="flex justify-start md:justify-end">
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              className="h-9 px-4 text-xs font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50 gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Export to Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Complaints Table */}
      <Card className="shadow-sm border-line">
        <CardContent className="p-0 sm:p-4">
          <DataTable 
            columns={columns} 
            data={filteredTickets} 
            searchKey="ticketNumber" 
            searchPlaceholder="Filter table results..." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
