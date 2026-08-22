'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/section-header'
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
  activationDate?: string | null
  signupDate: string | null
  address: string
  houseNumber?: string | null
  houseNo?: string | null
  streetNumber?: string | null
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
  assignedInstaller?: { fullName: string } | null
  accountExecutiveName?: string
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

function formatCustomerId(code?: string | null): string {
  if (!code) return ''
  const digits = code.replace(/\D/g, '')
  return digits || code.replace(/^[A-Za-z]+-/, '')
}

function formatCrf(crf?: string | null, code?: string | null): string {
  if (crf && crf.trim()) {
    return crf.startsWith('CRF-') ? crf : `CRF-${crf.replace(/^CRF/i, '').replace(/^-+/, '')}`
  }
  if (code) {
    const digits = code.replace(/\D/g, '')
    if (digits) return `CRF-${digits}`
  }
  return ''
}

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

  const [hasSearched, setHasSearched] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL')
  const [selectedCustomerType, setSelectedCustomerType] = React.useState<string>('ALL')
  const [selectedAccountExecutive, setSelectedAccountExecutive] = React.useState<string>('ALL')
  const [selectedCity, setSelectedCity] = React.useState<string>('ALL')
  const [selectedArea, setSelectedArea] = React.useState<string>('ALL')
  const [selectedSubArea, setSelectedSubArea] = React.useState<string>('ALL')
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  const [appliedFilters, setAppliedFilters] = React.useState<{
    status: string
    customerType: string
    accountExecutive: string
    city: string
    area: string
    subArea: string
    dateFrom: string
    dateTo: string
    searchQuery: string
  }>({
    status: 'ALL',
    customerType: 'ALL',
    accountExecutive: 'ALL',
    city: 'ALL',
    area: 'ALL',
    subArea: 'ALL',
    dateFrom: '',
    dateTo: '',
    searchQuery: '',
  })

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

  const customerTypes = React.useMemo(() => {
    return Array.from(new Set(customers.map((c) => c.customerType).filter(Boolean))).sort()
  }, [customers])

  const aeOptions = React.useMemo(() => {
    return Array.from(
      new Set(
        customers
          .map((c) => c.accountExecutive?.fullName || c.accountExecutiveName)
          .filter((name): name is string => Boolean(name && name.trim()))
      )
    ).sort()
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

  // Filtered dataset - only computed after user clicks search
  const filteredCustomers = React.useMemo(() => {
    if (!hasSearched) return []

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

      // Status Dropdown Filter
      if (appliedFilters.status !== 'ALL' && c.status !== appliedFilters.status) return false

      // Customer Type Dropdown Filter
      if (appliedFilters.customerType !== 'ALL' && c.customerType?.toUpperCase() !== appliedFilters.customerType.toUpperCase()) return false

      // Account Executive Filter
      if (appliedFilters.accountExecutive !== 'ALL') {
        const name = (c.accountExecutive?.fullName || c.accountExecutiveName || 'Unassigned').toLowerCase()
        if (name !== appliedFilters.accountExecutive.toLowerCase()) return false
      }

      // Location filters
      if (appliedFilters.city !== 'ALL' && c.city?.toLowerCase() !== appliedFilters.city.toLowerCase()) return false
      if (appliedFilters.area !== 'ALL' && c.area?.toLowerCase() !== appliedFilters.area.toLowerCase()) return false
      if (appliedFilters.subArea !== 'ALL' && c.subArea?.toLowerCase() !== appliedFilters.subArea.toLowerCase()) return false

      // Date filter
      if (appliedFilters.dateFrom && c.signupDate) {
        if (new Date(c.signupDate) < new Date(appliedFilters.dateFrom)) return false
      }
      if (appliedFilters.dateTo && c.signupDate) {
        const to = new Date(appliedFilters.dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(c.signupDate) > to) return false
      }

      // Search query
      if (appliedFilters.searchQuery.trim()) {
        const q = appliedFilters.searchQuery.toLowerCase().trim()
        const match =
          c.fullName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q) ||
          c.crfNumber?.toLowerCase().includes(q) ||
          c.contactNumber?.toLowerCase().includes(q) ||
          c.cnic?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.area?.toLowerCase().includes(q) ||
          c.customerType?.toLowerCase().includes(q) ||
          c.packagePlan?.packageTier?.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [customers, activeCategory, hasSearched, appliedFilters])

  // Account Executive Performance Summary Computation for Sales Report
  const aeSummaryList = React.useMemo(() => {
    if (!hasSearched) return []

    const map = new Map<string, {
      name: string
      newSaleActive: number
      tempBlocked: number
      permBlocked: number
      nonPaymentBlocked: number
      totalBlocked: number
      salesTarget: number
      balanceTarget: number
      achievedPct: number
      amountPayable: number
      paidAmount: number
    }>()

    filteredCustomers.forEach((c) => {
      const aeName = c.accountExecutive?.fullName || c.accountExecutiveName || 'Unassigned'
      if (!map.has(aeName)) {
        map.set(aeName, {
          name: aeName,
          newSaleActive: 0,
          tempBlocked: 0,
          permBlocked: 0,
          nonPaymentBlocked: 0,
          totalBlocked: 0,
          salesTarget: 24,
          balanceTarget: 24,
          achievedPct: 0,
          amountPayable: 0,
          paidAmount: 0,
        })
      }

      const item = map.get(aeName)!
      const statusUpper = (c.status || '').toUpperCase()

      if (statusUpper === 'CONNECTION_ACTIVE' || statusUpper === 'SIGNUP_GENERATED' || statusUpper === 'PENDING_ACTIVATION') {
        item.newSaleActive += 1
      } else if (statusUpper === 'TEMPORARY_BLOCKED') {
        item.tempBlocked += 1
      } else if (statusUpper === 'PERMANENT_DISCONNECTION') {
        item.permBlocked += 1
      } else if (statusUpper === 'NON_PAYMENT_BLOCKED') {
        item.nonPaymentBlocked += 1
      }

      item.totalBlocked = item.tempBlocked + item.permBlocked + item.nonPaymentBlocked
      item.amountPayable += Number(c.packagePlan?.totalAmount || 0)
      item.paidAmount += Number(c.packagePlan?.paidAmount || 0)
    })

    return Array.from(map.values()).map((ae) => {
      let target = 24
      if (ae.newSaleActive > 48) target = 96
      else if (ae.newSaleActive > 36) target = 48
      else if (ae.newSaleActive > 24) target = 36

      const balanceTarget = Math.max(0, target - ae.newSaleActive)
      const achievedPct = target > 0 ? (ae.newSaleActive / target) * 100 : 0

      return {
        ...ae,
        salesTarget: target,
        balanceTarget,
        achievedPct,
      }
    })
  }, [filteredCustomers, hasSearched])

  const aeTotals = React.useMemo(() => {
    return aeSummaryList.reduce(
      (acc, curr) => ({
        salesTarget: acc.salesTarget + curr.salesTarget,
        newSaleActive: acc.newSaleActive + curr.newSaleActive,
        tempBlocked: acc.tempBlocked + curr.tempBlocked,
        permBlocked: acc.permBlocked + curr.permBlocked,
        nonPaymentBlocked: acc.nonPaymentBlocked + curr.nonPaymentBlocked,
        totalBlocked: acc.totalBlocked + curr.totalBlocked,
        balanceTarget: acc.balanceTarget + curr.balanceTarget,
        amountPayable: acc.amountPayable + curr.amountPayable,
        paidAmount: acc.paidAmount + curr.paidAmount,
      }),
      {
        salesTarget: 0,
        newSaleActive: 0,
        tempBlocked: 0,
        permBlocked: 0,
        nonPaymentBlocked: 0,
        totalBlocked: 0,
        balanceTarget: 0,
        amountPayable: 0,
        paidAmount: 0,
      }
    )
  }, [aeSummaryList])

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setAppliedFilters({
      status: selectedStatus,
      customerType: selectedCustomerType,
      accountExecutive: selectedAccountExecutive,
      city: selectedCity,
      area: selectedArea,
      subArea: selectedSubArea,
      dateFrom,
      dateTo,
      searchQuery,
    })
    setHasSearched(true)
  }

  function handleReset() {
    setSelectedStatus('ALL')
    setSelectedCustomerType('ALL')
    setSelectedAccountExecutive('ALL')
    setSelectedCity('ALL')
    setSelectedArea('ALL')
    setSelectedSubArea('ALL')
    setDateFrom('')
    setDateTo('')
    setSearchQuery('')
    setAppliedFilters({
      status: 'ALL',
      customerType: 'ALL',
      accountExecutive: 'ALL',
      city: 'ALL',
      area: 'ALL',
      subArea: 'ALL',
      dateFrom: '',
      dateTo: '',
      searchQuery: '',
    })
    setHasSearched(false)
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
    setHasSearched(false)
    router.push(`/dashboard/reports?view=${categoryId.toLowerCase()}`, { scroll: false })
  }

  // Export to Excel / CSV matching the active category columns
  function handleExportExcel() {
    if (!hasSearched) {
      alert('Please select your filters and click "Search / Apply Filters" before exporting.')
      return
    }
    if (filteredCustomers.length === 0) {
      alert('No records found matching the selected filters to export.')
      return
    }

    let headers: string[] = []
    let rows: string[][] = []

    if (activeCategory === 'STATUS') {
      headers = [
        'Customer ID', 'Customer Name', 'Customer Type', 'Customer Address', 'Contact #',
        'House #', 'Block', 'Street #', 'Sub Area', 'Area', 'City',
        'Account Executive Name', 'Installer Name', 'System Type:', 'Monitoring Time',
        'Customer Package', 'Activation', 'New Status', 'Status'
      ]
      rows = filteredCustomers.map((c) => [
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${c.fullName}"`,
        `"${c.customerType ? (c.customerType.charAt(0).toUpperCase() + c.customerType.slice(1).toLowerCase()) : 'Residential'}"`,
        `"${c.address}"`,
        `"${c.contactNumber}"`,
        `"${c.houseNumber || c.houseNo || ''}"`,
        `"${c.block || ''}"`,
        `"${c.streetNumber || c.streetNo || ''}"`,
        `"${c.subArea || ''}"`,
        `"${c.area || ''}"`,
        `"${c.city}"`,
        `"${c.accountExecutive?.fullName || c.accountExecutiveName || ''}"`,
        `"${c.assignedInstaller?.fullName || c.solarSystem?.installerName || ''}"`,
        `"${c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || ''}"`,
        `"${c.packagePlan?.monitoringTime || ''}"`,
        `"${c.packagePlan?.packageTier || ''}"`,
        `"${c.activationDate ? formatDate(c.activationDate) : (c.solarSystem?.systemInstallationDate ? formatDate(c.solarSystem.systemInstallationDate) : '')}"`,
        `"${c.status ? c.status.replace(/_/g, ' ') : ''}"`,
        `"${c.status ? c.status.replace(/_/g, ' ') : ''}"`,
      ])
    } else if (activeCategory === 'SALES') {
      headers = [
        'Customer ID', 'CRF #', 'Customer Name', 'Address', 'Contact Number',
        'System Type', 'Package', 'Billing Type', 'Customer Type',
        'Amount Payable (PKR)', 'Paid Amount (PKR)', 'Sign up Created Date', 'Activation Date'
      ]
      rows = filteredCustomers.map((c) => [
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${formatCrf(c.crfNumber, c.customerCode)}"`,
        `"${c.fullName}"`,
        `"${c.address}"`,
        `"${c.contactNumber}"`,
        `"${c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}"`,
        `"${c.packagePlan?.packageTier || 'Basic'}"`,
        `"${c.packagePlan?.billingType || 'Monthly'}"`,
        `"${c.customerType ? (c.customerType.charAt(0).toUpperCase() + c.customerType.slice(1).toLowerCase()) : 'Residential'}"`,
        `"${Math.round(Number(c.packagePlan?.totalAmount || 0))}"`,
        `"${Math.round(Number(c.packagePlan?.paidAmount || 0))}"`,
        `"${formatDate(c.signupDate)}"`,
        `"${c.activationDate ? formatDate(c.activationDate) : (c.solarSystem?.systemInstallationDate ? formatDate(c.solarSystem.systemInstallationDate) : 'Pending')}"`,
      ])
    } else if (activeCategory === 'RECEIVABLE') {
      headers = [
        'Customer ID', 'CRF #', 'Customer Name', 'Contact #', 'City', 'Package Tier',
        'Total Amount (PKR)', 'Paid Amount (PKR)', 'Receivable Balance (PKR)', 'Status'
      ]
      rows = filteredCustomers.map((c) => {
        const total = Math.round(Number(c.packagePlan?.totalAmount || 0))
        const paid = Math.round(Number(c.packagePlan?.paidAmount || 0))
        const receivable = Math.max(0, total - paid)
        return [
          `"${formatCustomerId(c.customerCode || c.id)}"`,
          `"${formatCrf(c.crfNumber, c.customerCode)}"`,
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
        'Customer ID', 'CRF #', 'Customer Name', 'City', 'Package Tier', 'Billing Type',
        'Discount (%)', 'On-Boarding Fee (PKR)', 'Total Amount (PKR)', 'Sign Up Date'
      ]
      rows = filteredCustomers.map((c) => [
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${formatCrf(c.crfNumber, c.customerCode)}"`,
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
        'Customer ID', 'CRF #', 'Customer Name', 'Contact #', 'City', 'Package',
        'Paid Amount (PKR)', 'Total Package Amount (PKR)', 'Sign Up Date', 'Status'
      ]
      rows = filteredCustomers.map((c) => [
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${formatCrf(c.crfNumber, c.customerCode)}"`,
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
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${formatCrf(c.crfNumber, c.customerCode)}"`,
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
      <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
        <SectionHeader
          action={
            <Button onClick={handleExportExcel} className="h-8 text-xs bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold shadow-xs gap-1.5 px-3 cursor-pointer">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export to Excel
            </Button>
          }
        >
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#F58220]" />
            {currentTabObj.label}
          </span>
        </SectionHeader>
      </Card>

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
          {/* Top Filter Bar: Country, City, Area, Sub Area, Customer Type, Select Status, Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Account Executive</Label>
              <select
                value={selectedAccountExecutive}
                onChange={(e) => setSelectedAccountExecutive(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Account Executives</option>
                {aeOptions.map((ae) => (
                  <option key={ae} value={ae}>{ae}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Customer Type</Label>
              <select
                value={selectedCustomerType}
                onChange={(e) => setSelectedCustomerType(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
              >
                <option value="ALL">All Customer Types</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="CORPORATE">Corporate</option>
                <option value="INDUSTRIAL">Industrial</option>
                {customerTypes.map((ct) => {
                  const upper = ct.toUpperCase()
                  if (['RESIDENTIAL', 'CORPORATE', 'INDUSTRIAL'].includes(upper)) return null
                  return <option key={ct} value={ct}>{ct}</option>
                })}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Select Status Filter</Label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-amber-300 bg-amber-50/40 text-xs font-bold text-slate-900 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="ALL">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.key} value={st.key}>{st.label}</option>
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

          {/* Search bar & Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 pt-4 border-t border-gray-100">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-slate-custom)]" />
              <Input
                placeholder="Search Customer ID, Name, Contact, CNIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                className="pl-9 text-xs h-10 border-[var(--color-line)] bg-slate-50/60 focus:bg-white"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="h-10 text-xs font-semibold text-slate-700 hover:text-slate-950 border-slate-300 gap-1.5 cursor-pointer px-4"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Button
                type="button"
                onClick={() => handleSearch()}
                className="h-10 text-xs font-bold bg-[#002868] hover:bg-[#001d4a] text-white shadow-md gap-2 cursor-pointer px-6"
              >
                <Search className="h-4 w-4 text-amber-400" /> Search / Apply Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="text-slate-500 font-medium">
              {hasSearched ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Filter criteria applied
                </span>
              ) : (
                <span className="text-amber-700 font-medium flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" /> Select filters above and click Search to load data
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 px-3.5 py-1.5 rounded-lg border border-gray-200 font-medium">
              {hasSearched ? (
                <>Showing <strong className="text-[var(--color-ink)]">{filteredCustomers.length}</strong> matching records in {currentTabObj.label}</>
              ) : (
                <span className="text-slate-500">No data loaded (click &quot;Search / Apply Filters&quot;)</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Report Table */}
      <Card className="shadow-sm border-line overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              {/* 1. CUSTOMER STATUS REPORT TABLE */}
              {activeCategory === 'STATUS' && (
                <>
                  <TableHeader className="bg-[var(--color-paper)]">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer ID</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Name</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Address</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Contact #</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">House #</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Block</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Street #</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Sub Area</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Area</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">City</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Account Executive Name</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Installer Name</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">System Type:</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Monitoring Time</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Package</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Activation</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">New Status</TableHead>
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!hasSearched ? (
                      <TableRow>
                        <TableCell colSpan={18} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                          Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={18} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                          No customers found matching the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((c) => (
                        <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50 text-xs">
                          <TableCell className="font-mono font-bold text-[var(--color-ink)] whitespace-nowrap">
                            <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                              {formatCustomerId(c.customerCode || c.id)}
                            </Link>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{c.fullName}</TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">{c.address}</TableCell>
                          <TableCell className="font-mono whitespace-nowrap">{c.contactNumber}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.houseNumber || c.houseNo || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.block || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.streetNumber || c.streetNo || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.subArea || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.area || '-'}</TableCell>
                          <TableCell className="font-semibold whitespace-nowrap">{c.city}</TableCell>
                          <TableCell className="whitespace-nowrap text-gray-700">{c.accountExecutive?.fullName || c.accountExecutiveName || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap text-gray-700">{c.assignedInstaller?.fullName || c.solarSystem?.installerName || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap font-medium">{c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap text-gray-700">{c.packagePlan?.monitoringTime || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="bg-amber-50 text-amber-950 border-amber-200 font-semibold">
                              {c.packagePlan?.packageTier || 'Basic'}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-gray-600">
                            {c.activationDate ? formatDate(c.activationDate) : (c.solarSystem?.systemInstallationDate ? formatDate(c.solarSystem.systemInstallationDate) : 'Pending')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-semibold text-gray-800">
                            {c.status ? c.status.replace(/_/g, ' ') : '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold">
                              {c.status ? c.status.replace(/_/g, ' ') : '-'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </>
              )}

            {/* 2. SALES REPORT TABLES */}
            {activeCategory === 'SALES' && (
              <>
                {/* Top Section: Account Executive Performance & Target Summary */}
                <TableHeader className="bg-yellow-400/90 text-slate-900 border-b border-amber-300">
                  <TableRow className="border-b border-amber-300 font-bold text-xs">
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Account Executive Sales</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Sales Target</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">New Sale (Active)</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Number Of Temp blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Number Of Perm Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Non Payment Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Total Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Balance Target</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap">Achieved in % Age</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap text-right">Amount Payable</TableHead>
                    <TableHead className="font-extrabold text-xs text-slate-950 whitespace-nowrap text-right">Paid Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-yellow-50/40 divide-y divide-amber-200/60">
                  {/* Total Highlight Row */}
                  <TableRow className="bg-yellow-300/80 font-bold text-xs text-slate-950">
                    <TableCell className="font-extrabold uppercase tracking-wider">Total Summary</TableCell>
                    <TableCell className="font-bold">{aeTotals.salesTarget}</TableCell>
                    <TableCell className="font-bold text-emerald-800">{aeTotals.newSaleActive}</TableCell>
                    <TableCell>{aeTotals.tempBlocked}</TableCell>
                    <TableCell>{aeTotals.permBlocked}</TableCell>
                    <TableCell>{aeTotals.nonPaymentBlocked}</TableCell>
                    <TableCell className="font-bold text-rose-800">{aeTotals.totalBlocked}</TableCell>
                    <TableCell className="font-bold text-amber-900">{aeTotals.balanceTarget}</TableCell>
                    <TableCell className="font-bold text-blue-900">{aeTotals.salesTarget > 0 ? ((aeTotals.newSaleActive / aeTotals.salesTarget) * 100).toFixed(1) : 0}%</TableCell>
                    <TableCell className="font-mono text-right font-bold">PKR {Math.round(aeTotals.amountPayable).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-right font-bold text-emerald-900">PKR {Math.round(aeTotals.paidAmount).toLocaleString()}</TableCell>
                  </TableRow>

                  {/* Account Executive Rows */}
                  {aeSummaryList.map((ae) => (
                    <TableRow key={ae.name} className="hover:bg-yellow-100/60 text-xs font-semibold text-slate-800">
                      <TableCell className="font-bold text-slate-950 whitespace-nowrap">{ae.name}</TableCell>
                      <TableCell className="font-semibold">{ae.salesTarget}</TableCell>
                      <TableCell className="font-semibold text-emerald-700">{ae.newSaleActive}</TableCell>
                      <TableCell>{ae.tempBlocked}</TableCell>
                      <TableCell>{ae.permBlocked}</TableCell>
                      <TableCell>{ae.nonPaymentBlocked}</TableCell>
                      <TableCell className="font-semibold text-rose-700">{ae.totalBlocked}</TableCell>
                      <TableCell className="font-semibold text-amber-800">{ae.balanceTarget}</TableCell>
                      <TableCell className="font-semibold text-blue-800">{ae.achievedPct.toFixed(1)}%</TableCell>
                      <TableCell className="font-mono text-right">PKR {Math.round(ae.amountPayable).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-right text-emerald-800">PKR {Math.round(ae.paidAmount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                {/* Section Separator & Customer Details Header */}
                <TableHeader className="bg-[var(--color-paper)] border-t-2 border-slate-300">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">CRF #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Address</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Contact Number</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">System Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Package</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Billing Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right whitespace-nowrap">Amount Payable</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right whitespace-nowrap">Paid Amount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Sign up Created Date</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Activation Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No sales records found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => (
                      <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50 text-xs">
                        <TableCell className="font-mono font-bold text-[var(--color-ink)] whitespace-nowrap">
                          <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                            {formatCustomerId(c.customerCode || c.id)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-gray-700 whitespace-nowrap">
                          {formatCrf(c.crfNumber, c.customerCode)}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{c.fullName}</TableCell>
                        <TableCell className="text-gray-600 max-w-xs truncate">{c.address}</TableCell>
                        <TableCell className="font-mono whitespace-nowrap">{c.contactNumber}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium">{c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
                            {c.packagePlan?.packageTier || 'Basic'}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{c.packagePlan?.billingType || 'Monthly'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold text-[10px]">
                            {c.customerType ? (c.customerType.charAt(0).toUpperCase() + c.customerType.slice(1).toLowerCase()) : 'Residential'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[var(--color-ink)] whitespace-nowrap">
                          PKR {Math.round(Number(c.packagePlan?.totalAmount || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                          PKR {Math.round(Number(c.packagePlan?.paidAmount || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-600 font-mono whitespace-nowrap">{formatDate(c.signupDate)}</TableCell>
                        <TableCell className="text-gray-600 font-mono whitespace-nowrap">
                          {c.activationDate ? formatDate(c.activationDate) : (c.solarSystem?.systemInstallationDate ? formatDate(c.solarSystem.systemInstallationDate) : 'Pending')}
                        </TableCell>
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
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">CRF #</TableHead>
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
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
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
                              {formatCustomerId(c.customerCode || c.id)}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-gray-700">
                            {formatCrf(c.crfNumber, c.customerCode)}
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
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">CRF #</TableHead>
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
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No adjustment / discounted records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => (
                      <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50 text-xs">
                        <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                          <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                            {formatCustomerId(c.customerCode || c.id)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-gray-700">
                          {formatCrf(c.crfNumber, c.customerCode)}
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
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">CRF #</TableHead>
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
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No payment records found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => (
                      <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/50 text-xs">
                        <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                          <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                            {formatCustomerId(c.customerCode || c.id)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-gray-700">
                          {formatCrf(c.crfNumber, c.customerCode)}
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
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
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
                            {formatCustomerId(c.customerCode || c.id)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-gray-700">{formatCrf(c.crfNumber, c.customerCode) || '—'}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

