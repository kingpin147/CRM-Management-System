'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/section-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RotateCcw, Zap, Receipt, Users, CheckCircle2, Clock, AlertTriangle, FileSpreadsheet, ChevronDown } from 'lucide-react'
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
  customerHistory?: any[]
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

/**
 * Compute Customer Receivable financials for a billing month (YYYY-MM string).
 *
 * Logic (as per business rules):
 *  - billingMonth defaults to the current month if not provided.
 *  - CURRENT   = the invoice whose billingPeriod falls in billingMonth (1st of that month).
 *  - ARREARS   = sum of unpaid balances on ALL invoices from months BEFORE billingMonth.
 *  - ADJUSTMENT = net of debit-note/credit-note LedgerEntries whose date falls within billingMonth.
 *                 Debit notes increase the amount owed; credit notes reduce it.
 *  - PAYMENT COLLECTION = sum of payment LedgerEntry credits (invoiceId-linked) whose date falls
 *                         within billingMonth (Sep 1 – Sep 30 for a Sep billing run).
 *  - BALANCE = ARREARS + CURRENT + netAdjustment − PAYMENT COLLECTION
 */
function computeCustomerFinancials(c: CustomerRecord, billingMonth?: string) {
  // Determine the billing month window: default to current month
  const now = new Date()
  const targetMonth = billingMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [ymYear, ymMonth] = targetMonth.split('-').map(Number)

  // Start/end of billing month (inclusive)
  const monthStart = new Date(ymYear, ymMonth - 1, 1, 0, 0, 0, 0)
  const monthEnd   = new Date(ymYear, ymMonth, 0, 23, 59, 59, 999) // last day of month

  const invoices = Array.isArray(c.invoices)
    ? [...c.invoices].sort((a: any, b: any) =>
        new Date(a.createdAt || a.dueDate || a.billingPeriod || 0).getTime() -
        new Date(b.createdAt || b.dueDate || b.billingPeriod || 0).getTime()
      )
    : []

  // CURRENT: invoice whose billingPeriod (or dueDate/createdAt) is within billingMonth
  const currentInvoice = invoices.find((inv: any) => {
    const d = new Date(inv.billingPeriod || inv.dueDate || inv.createdAt || 0)
    return d >= monthStart && d <= monthEnd
  }) ?? null
  const current = currentInvoice ? Number(currentInvoice.totalAmount || currentInvoice.amount || 0) : 0

  // ARREARS: unpaid balances on invoices from BEFORE billingMonth, grouped by age.
  const arrearsByAge = invoices.reduce((totals: { arrears30: number; arrears60: number; arrears90: number }, inv: any) => {
    const d = new Date(inv.billingPeriod || inv.dueDate || inv.createdAt || 0)
    if (d >= monthStart) return totals // skip current month and future
    if (inv.status === 'PAID') return totals
    const invTotal = Number(inv.totalAmount || inv.amount || 0)
    const invPaid  = Number(inv.paidAmount || 0)
    const outstanding = Math.max(0, invTotal - invPaid)
    const ageInDays = Math.floor((monthStart.getTime() - d.getTime()) / 86400000)
    if (ageInDays >= 90) totals.arrears90 += outstanding
    else if (ageInDays >= 60) totals.arrears60 += outstanding
    else if (ageInDays >= 30) totals.arrears30 += outstanding
    return totals
  }, { arrears30: 0, arrears60: 0, arrears90: 0 })
  const arrears = arrearsByAge.arrears30 + arrearsByAge.arrears60 + arrearsByAge.arrears90

  // ADJUSTMENT: net of debit/credit notes posted within billingMonth
  let adjDebit = 0
  let adjCredit = 0
  ;(c.ledgerEntries || []).forEach((le: any) => {
    const narr = (le.narration || '').toLowerCase()
    const isAdj = narr.includes('debit note') || narr.includes('credit note') ||
                  narr.includes('adjustment') || narr.includes('adj') ||
                  narr.includes('discount') || narr.includes('reversal')
    if (!isAdj) return
    const leDate = new Date(le.date || le.createdAt || 0)
    if (leDate >= monthStart && leDate <= monthEnd) {
      adjDebit  += Number(le.debit  || 0)
      adjCredit += Number(le.credit || 0)
    }
  })

  let adjustmentText = '0'
  let netAdjustment = 0
  if (adjDebit > adjCredit) {
    netAdjustment = adjDebit - adjCredit
    adjustmentText = `+${Math.round(netAdjustment)} Debit`
  } else if (adjCredit > adjDebit) {
    netAdjustment = -(adjCredit - adjDebit)
    adjustmentText = `-${Math.round(adjCredit - adjDebit)} Credit`
  }

  // PAYMENT COLLECTION: all payment credits (invoiceId-linked) posted within billingMonth
  const paymentCollection = (c.ledgerEntries || []).reduce((sum: number, le: any) => {
    if (!le.invoiceId) return sum
    const leDate = new Date(le.date || le.createdAt || 0)
    if (leDate >= monthStart && leDate <= monthEnd) {
      return sum + Number(le.credit || 0)
    }
    return sum
  }, 0)

  // BALANCE = Arrears + Current + netAdjustment (signed) − Payments
  const balanceAmount = arrears + current + netAdjustment - paymentCollection

  return {
    arrears30:         Math.round(arrearsByAge.arrears30),
    arrears60:         Math.round(arrearsByAge.arrears60),
    arrears90:         Math.round(arrearsByAge.arrears90),
    totalArrears:      Math.round(arrears),
    current:           Math.round(current),
    paymentCollection: Math.round(paymentCollection),
    adjustmentText,
    netAdjustment:     Math.round(netAdjustment),
    balanceAmount:     Math.round(balanceAmount),
  }
}

type AdjustmentRow = {
  customer: CustomerRecord
  ledgerEntry: {
    id: string
    narration: string
    debit: number
    credit: number
    date: string | null
    invoiceId: string | null
  }
}

type PaymentRow = {
  customer: CustomerRecord
  transaction: {
    id: string
    amount: number
    paymentMethod: string
    status: string
    createdAt: string | null
    refNumber?: string | null
    description?: string | null
    updatedBy?: string | null
  }
}

type BillingMetric = { houses: number; amount: number }
type BillingGroup = {
  arrears90: BillingMetric
  arrears60: BillingMetric
  arrears30: BillingMetric
  totalArrears: BillingMetric
  current: BillingMetric
  total: BillingMetric
}
type BillingSummary = {
  name: string
  target: BillingGroup
  adjustment: BillingGroup
  revisedTarget: BillingGroup
  paymentCollection: BillingGroup
  balance: BillingGroup
}

type IncentiveRow = {
  name: string
  numberOfSales: number
  incentiveAmount: number
  secondLastMonth: number
  lastMonth: number
  selectedMonth: number
  totalIncentive: number
}

const emptyBillingMetric = (): BillingMetric => ({ houses: 0, amount: 0 })
const emptyBillingGroup = (): BillingGroup => ({
  arrears90: emptyBillingMetric(),
  arrears60: emptyBillingMetric(),
  arrears30: emptyBillingMetric(),
  totalArrears: emptyBillingMetric(),
  current: emptyBillingMetric(),
  total: emptyBillingMetric(),
})

const billingColumns = ['House', 'Arrears 90 Days', 'Arrears 60 Days', 'Arrears 30 Days', 'Total Arrears', 'Current', 'Total'] as const
type BillingColumn = typeof billingColumns[number]
function billingMetric(group: BillingGroup, column: BillingColumn): BillingMetric {
  if (column === 'House') return group.total
  if (column === 'Arrears 90 Days') return group.arrears90
  if (column === 'Arrears 60 Days') return group.arrears60
  if (column === 'Arrears 30 Days') return group.arrears30
  if (column === 'Total Arrears') return group.totalArrears
  if (column === 'Current') return group.current
  return group.total
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
      case 'billing': return 'BILLING'
      case 'sales-incentive': return 'SALES_INCENTIVE'
      case 'om-incentive': return 'OM_INCENTIVE'
      case 'register': return 'REGISTER'
      case 'connectivity': return 'CONNECTIVITY'
      default: return 'STATUS'
    }
  }, [viewParam])

  const [hasSearched, setHasSearched] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL')
  const [selectedAdjustmentType, setSelectedAdjustmentType] = React.useState<string>('ALL')
  const [selectedCustomerType, setSelectedCustomerType] = React.useState<string>('ALL')
  const [selectedAccountExecutive, setSelectedAccountExecutive] = React.useState<string>('ALL')
  const [selectedCity, setSelectedCity] = React.useState<string>('ALL')
  const [selectedArea, setSelectedArea] = React.useState<string>('ALL')
  const [selectedSubArea, setSelectedSubArea] = React.useState<string>('ALL')
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  // RECEIVABLE: false = hide zero balance (show only due), true = show all including zero
  const [includeZeroNegative, setIncludeZeroNegative] = React.useState<boolean>(false)
  // RECEIVABLE: Invoice month filter (YYYY-MM format)
  const [invoiceMonth, setInvoiceMonth] = React.useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  // SALES: expanded AE name for drill-down
  const [expandedAE, setExpandedAE] = React.useState<string | null>(null)

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
    includeZeroNegative: boolean
    invoiceMonth: string
    adjustmentType: string
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
    includeZeroNegative: false,
    invoiceMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    adjustmentType: 'ALL',
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
      CONNECTIVITY: customers.length,
      RECEIVABLE: customers.filter((c) => {
        const { balanceAmount } = computeCustomerFinancials(c)
        return (c.status || '').toUpperCase() === 'CONNECTION_ACTIVE' && c.packagePlan && balanceAmount > 0
      }).length,
      ADJUSTMENT: customers.filter((c) =>
        c.ledgerEntries && c.ledgerEntries.some((l: any) => {
          const narr = (l.narration || '').toLowerCase()
          return narr.includes('debit note') || narr.includes('credit note')
        })
      ).length,
      PAYMENTS: customers.reduce((sum, c) => sum + (c.transactions?.length || 0), 0),
      BILLING: customers.filter((c) => Boolean(c.packagePlan)).length,
      SALES_INCENTIVE: customers.filter((c) => Boolean(c.packagePlan)).length,
      OM_INCENTIVE: customers.filter((c) => Boolean(c.solarSystem?.lastAuditDate)).length,
      REGISTER: customers.length,
    }
  }, [customers])

// CONNECTIVITY REPORT COMPUTATION
  const connectivityData = React.useMemo(() => {
    let openingBalance = 0
    let newSale = 0
    let tempBlocked = 0
    let permBlocked = 0
    let nonPaymentBlocked = 0

    const selectedDate = new Date(appliedFilters.invoiceMonth + '-01')
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999)

    customers.forEach(c => {
      if (appliedFilters.city !== 'ALL' && c.city?.toLowerCase() !== appliedFilters.city.toLowerCase()) return
      if (appliedFilters.area !== 'ALL' && c.area?.toLowerCase() !== appliedFilters.area.toLowerCase()) return
      if (appliedFilters.subArea !== 'ALL' && c.subArea?.toLowerCase() !== appliedFilters.subArea.toLowerCase()) return

      let statusAtMonthStart = ''
      const isActivatedBeforeMonth = c.activationDate && new Date(c.activationDate) < monthStart
      const isActivatedDuringMonth = c.activationDate && new Date(c.activationDate) >= monthStart && new Date(c.activationDate) <= monthEnd

      if (isActivatedBeforeMonth) {
        statusAtMonthStart = 'CONNECTION_ACTIVE'
        const pastHistories = (c.customerHistory || []).filter((h: any) => h.actionType === 'STATUS_CHANGE' && new Date(h.createdAt) < monthStart)
        if (pastHistories.length > 0) {
          const lastHistory = pastHistories[pastHistories.length - 1]
          statusAtMonthStart = lastHistory.newStatus
        }
        if (['CONNECTION_ACTIVE', 'FOC_CONNECTION', 'IN_HOUSE_CONNECTION'].includes(statusAtMonthStart)) {
          openingBalance++
        }
      }

      if (isActivatedDuringMonth) {
        newSale++
      }

      let statusAtMonthEnd = statusAtMonthStart
      const monthHistories = (c.customerHistory || []).filter((h: any) => h.actionType === 'STATUS_CHANGE' && new Date(h.createdAt) >= monthStart && new Date(h.createdAt) <= monthEnd)
      
      if (monthHistories.length > 0) {
        statusAtMonthEnd = monthHistories[monthHistories.length - 1].newStatus
      } else if (isActivatedDuringMonth) {
        statusAtMonthEnd = c.status || 'CONNECTION_ACTIVE' 
      }

      const isActiveStart = ['CONNECTION_ACTIVE', 'FOC_CONNECTION', 'IN_HOUSE_CONNECTION'].includes(statusAtMonthStart)
      const isActiveEnd = ['CONNECTION_ACTIVE', 'FOC_CONNECTION', 'IN_HOUSE_CONNECTION'].includes(statusAtMonthEnd)
      const wasActiveAtAnyPoint = isActiveStart || isActivatedDuringMonth

      if (wasActiveAtAnyPoint && !isActiveEnd) {
        if (statusAtMonthEnd === 'TEMPORARY_BLOCKED') tempBlocked++
        else if (statusAtMonthEnd === 'PERMANENT_DISCONNECTION') permBlocked++
        else if (statusAtMonthEnd === 'NON_PAYMENT_BLOCKED') nonPaymentBlocked++
      }
      
      if (!isActiveStart && !isActivatedDuringMonth && isActiveEnd) {
        tempBlocked--
      }
    })

    const totalBlocked = tempBlocked + permBlocked + nonPaymentBlocked
    const netActive = openingBalance + newSale - totalBlocked

    return { openingBalance, newSale, tempBlocked, permBlocked, nonPaymentBlocked, totalBlocked, netActive }
  }, [customers, appliedFilters])

  // Filtered dataset - only computed after user clicks search
  const filteredCustomers = React.useMemo(() => {
    if (!hasSearched) return []

    return customers.filter((c) => {
      // Category-specific base conditions
      if (activeCategory === 'SALES' && !c.packagePlan) return false
      
      if (activeCategory === 'RECEIVABLE') {
        // RECEIVABLE: only CONNECTION_ACTIVE customers
        const statusUpper = (c.status || '').toUpperCase()
        if (statusUpper !== 'CONNECTION_ACTIVE') return false

        // Must have a package plan to have a bill
        if (!c.packagePlan) return false

        const { balanceAmount } = computeCustomerFinancials(c, appliedFilters.invoiceMonth)
        // Default (unchecked): show ALL active customers including zero balance
        // Checked: hide zero/negative balance — show only those with outstanding due
        if (appliedFilters.includeZeroNegative && balanceAmount <= 0) return false
      }

      if (activeCategory === 'ADJUSTMENT') {
        // ADJUSTMENT uses filteredAdjustmentRows (per-LedgerEntry expansion), not filteredCustomers.
        // Skip this customer from filteredCustomers when ADJUSTMENT is active.
        return false
      }

      if (activeCategory === 'PAYMENTS') {
        // PAYMENTS uses filteredPaymentRows (per-transaction expansion), not filteredCustomers.
        return false
      }

      if (activeCategory === 'BILLING') return false

      // Status Dropdown Filter
      if ((activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && appliedFilters.status !== 'ALL' && c.status !== appliedFilters.status) return false

      // Customer Type Dropdown Filter
      if ((activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && appliedFilters.customerType !== 'ALL' && c.customerType?.toUpperCase() !== appliedFilters.customerType.toUpperCase()) return false

      // Account Executive Filter
      if ((activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && appliedFilters.accountExecutive !== 'ALL') {
        const name = (c.accountExecutive?.fullName || c.accountExecutiveName || 'Unassigned').toLowerCase()
        if (name !== appliedFilters.accountExecutive.toLowerCase()) return false
      }

      // Location filters
      if (appliedFilters.city !== 'ALL' && c.city?.toLowerCase() !== appliedFilters.city.toLowerCase()) return false
      if (appliedFilters.area !== 'ALL' && c.area?.toLowerCase() !== appliedFilters.area.toLowerCase()) return false
      if (appliedFilters.subArea !== 'ALL' && c.subArea?.toLowerCase() !== appliedFilters.subArea.toLowerCase()) return false

      // Date filter (only for non-RECEIVABLE categories)
      if (activeCategory !== 'RECEIVABLE') {
        // For SALES, filter by signupDate or activationDate
        const refDate = c.signupDate || c.activationDate
        if (appliedFilters.dateFrom && refDate) {
          if (new Date(refDate) < new Date(appliedFilters.dateFrom)) return false
        }
        if (appliedFilters.dateTo && refDate) {
          const to = new Date(appliedFilters.dateTo)
          to.setHours(23, 59, 59, 999)
          if (new Date(refDate) > to) return false
        }
      }

      // Search query
      if ((activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && appliedFilters.searchQuery.trim()) {
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

  const filteredAdjustmentRows = React.useMemo((): AdjustmentRow[] => {
    if (!hasSearched || activeCategory !== 'ADJUSTMENT') return []

    const rows: AdjustmentRow[] = []

    for (const c of customers) {
      if (appliedFilters.city !== 'ALL' && c.city?.toLowerCase() !== appliedFilters.city.toLowerCase()) continue
      if (appliedFilters.area !== 'ALL' && c.area?.toLowerCase() !== appliedFilters.area.toLowerCase()) continue
      if (appliedFilters.subArea !== 'ALL' && c.subArea?.toLowerCase() !== appliedFilters.subArea.toLowerCase()) continue

      if (appliedFilters.dateFrom && c.signupDate) {
        if (new Date(c.signupDate) < new Date(appliedFilters.dateFrom)) continue
      }
      if (appliedFilters.dateTo && c.signupDate) {
        const to = new Date(appliedFilters.dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(c.signupDate) > to) continue
      }

      if (appliedFilters.searchQuery.trim()) {
        const q = appliedFilters.searchQuery.toLowerCase().trim()
        const match =
          c.fullName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q) ||
          c.crfNumber?.toLowerCase().includes(q) ||
          c.contactNumber?.toLowerCase().includes(q) ||
          c.cnic?.toLowerCase().includes(q)
        if (!match) continue
      }

      for (const le of c.ledgerEntries || []) {
        const narr = (le.narration || '').toLowerCase()
        const isDebitNote = narr.includes('debit note')
        const isCreditNote = narr.includes('credit note')
        if (!isDebitNote && !isCreditNote) continue

        const type = appliedFilters.adjustmentType
        if (type === 'DEBIT_NOTE' && !isDebitNote) continue
        if (type === 'CREDIT_NOTE' && !isCreditNote) continue

        rows.push({
          customer: c,
          ledgerEntry: {
            id: le.id,
            narration: le.narration,
            debit: Number(le.debit || 0),
            credit: Number(le.credit || 0),
            date: le.date || le.createdAt || null,
            invoiceId: le.invoiceId || null,
          },
        })
      }
    }

    return rows
  }, [customers, activeCategory, hasSearched, appliedFilters])

  // Per-transaction rows for Payments Report
  const filteredPaymentRows = React.useMemo((): PaymentRow[] => {
    if (!hasSearched || activeCategory !== 'PAYMENTS') return []

    const rows: PaymentRow[] = []

    for (const c of customers) {
      // Location filters
      if (appliedFilters.city !== 'ALL' && c.city?.toLowerCase() !== appliedFilters.city.toLowerCase()) continue
      if (appliedFilters.area !== 'ALL' && c.area?.toLowerCase() !== appliedFilters.area.toLowerCase()) continue
      if (appliedFilters.subArea !== 'ALL' && c.subArea?.toLowerCase() !== appliedFilters.subArea.toLowerCase()) continue

      // Search filter
      if (appliedFilters.searchQuery.trim()) {
        const q = appliedFilters.searchQuery.toLowerCase().trim()
        const match =
          c.fullName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q) ||
          c.crfNumber?.toLowerCase().includes(q) ||
          c.contactNumber?.toLowerCase().includes(q) ||
          c.cnic?.toLowerCase().includes(q)
        if (!match) continue
      }

      // Expand one row per transaction, filtered by payment date range
      for (const t of c.transactions || []) {
        const txDate = new Date(t.createdAt || t.date || 0)

        if (appliedFilters.dateFrom) {
          if (txDate < new Date(appliedFilters.dateFrom)) continue
        }
        if (appliedFilters.dateTo) {
          const to = new Date(appliedFilters.dateTo)
          to.setHours(23, 59, 59, 999)
          if (txDate > to) continue
        }

        rows.push({
          customer: c,
          transaction: {
            id: t.id,
            amount: Number(t.amount || 0),
            paymentMethod: t.paymentMethod || t.method || '-',
            status: t.status || 'Posted',
            createdAt: t.createdAt || t.date || null,
            refNumber: t.refNumber || t.receiptNumber || null,
            description: t.description || t.narration || null,
            updatedBy: t.updatedBy || t.createdBy || c.accountExecutive?.fullName || c.accountExecutiveName || null,
          },
        })
      }
    }

    return rows
  }, [customers, activeCategory, hasSearched, appliedFilters])

  const billingSummaryRows = React.useMemo((): BillingSummary[] => {
    if (!hasSearched || activeCategory !== 'BILLING') return []

    const summaries = new Map<string, BillingSummary>()
    for (const c of customers) {
      if (!c.packagePlan) continue
      if (appliedFilters.city !== 'ALL' && c.city?.toLowerCase() !== appliedFilters.city.toLowerCase()) continue
      if (appliedFilters.area !== 'ALL' && c.area?.toLowerCase() !== appliedFilters.area.toLowerCase()) continue
      if (appliedFilters.subArea !== 'ALL' && c.subArea?.toLowerCase() !== appliedFilters.subArea.toLowerCase()) continue
      if (appliedFilters.dateFrom && c.signupDate && new Date(c.signupDate) < new Date(appliedFilters.dateFrom)) continue
      if (appliedFilters.dateTo && c.signupDate) {
        const dateTo = new Date(appliedFilters.dateTo)
        dateTo.setHours(23, 59, 59, 999)
        if (new Date(c.signupDate) > dateTo) continue
      }
      if (appliedFilters.searchQuery.trim()) {
        const query = appliedFilters.searchQuery.toLowerCase().trim()
        const searchable = [c.fullName, c.customerCode, c.crfNumber, c.contactNumber, c.cnic, c.address, c.city, c.area]
        if (!searchable.some((value) => value?.toLowerCase().includes(query))) continue
      }

      const name = c.accountExecutive?.fullName || c.accountExecutiveName || 'Unassigned'
      if (!summaries.has(name)) {
        summaries.set(name, {
          name,
          target: emptyBillingGroup(),
          adjustment: emptyBillingGroup(),
          revisedTarget: emptyBillingGroup(),
          paymentCollection: emptyBillingGroup(),
          balance: emptyBillingGroup(),
        })
      }
      const summary = summaries.get(name)!
      const financials = computeCustomerFinancials(c, appliedFilters.invoiceMonth)
      const add = (metric: BillingMetric, amount: number) => {
        metric.houses += amount > 0 ? 1 : 0
        metric.amount += amount
      }
      const target = summary.target
      add(target.arrears90, financials.arrears90)
      add(target.arrears60, financials.arrears60)
      add(target.arrears30, financials.arrears30)
      add(target.totalArrears, financials.totalArrears)
      add(target.current, financials.current)
      add(target.total, financials.totalArrears + financials.current)

      const adjustment = financials.netAdjustment
      add(summary.adjustment.current, adjustment)
      add(summary.adjustment.total, adjustment)
      add(summary.revisedTarget.arrears90, financials.arrears90)
      add(summary.revisedTarget.arrears60, financials.arrears60)
      add(summary.revisedTarget.arrears30, financials.arrears30)
      add(summary.revisedTarget.totalArrears, financials.totalArrears)
      add(summary.revisedTarget.current, financials.current + adjustment)
      add(summary.revisedTarget.total, financials.totalArrears + financials.current + adjustment)
      add(summary.paymentCollection.current, financials.paymentCollection)
      add(summary.paymentCollection.total, financials.paymentCollection)
      add(summary.balance.current, financials.balanceAmount)
      add(summary.balance.total, financials.balanceAmount)
    }
    return Array.from(summaries.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [customers, activeCategory, hasSearched, appliedFilters])

  const incentiveRows = React.useMemo((): IncentiveRow[] => {
    if (!hasSearched || !['SALES_INCENTIVE', 'OM_INCENTIVE'].includes(activeCategory)) return []
    const selected = new Date(`${invoiceMonth}-01T00:00:00`)
    const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const selectedKey = monthKey(selected)
    const last = new Date(selected.getFullYear(), selected.getMonth() - 1, 1)
    const secondLast = new Date(selected.getFullYear(), selected.getMonth() - 2, 1)
    const lastKey = monthKey(last)
    const secondLastKey = monthKey(secondLast)
    const rows = new Map<string, { current: number; last: number; secondLast: number }>()

    for (const customer of customers) {
      const dateValue = activeCategory === 'OM_INCENTIVE'
        ? customer.solarSystem?.lastAuditDate
        : customer.signupDate || customer.activationDate
      if (!dateValue) continue
      if (appliedFilters.city !== 'ALL' && customer.city?.toLowerCase() !== appliedFilters.city.toLowerCase()) continue
      if (appliedFilters.area !== 'ALL' && customer.area?.toLowerCase() !== appliedFilters.area.toLowerCase()) continue
      if (appliedFilters.subArea !== 'ALL' && customer.subArea?.toLowerCase() !== appliedFilters.subArea.toLowerCase()) continue
      const name = activeCategory === 'OM_INCENTIVE'
        ? customer.assignedInstaller?.fullName || 'Unassigned O&M'
        : customer.accountExecutive?.fullName || customer.accountExecutiveName || 'Unassigned'
      const key = monthKey(new Date(dateValue))
      if (![selectedKey, lastKey, secondLastKey].includes(key)) continue
      const item = rows.get(name) || { current: 0, last: 0, secondLast: 0 }
      if (key === selectedKey) item.current += 1
      if (key === lastKey) item.last += 1
      if (key === secondLastKey) item.secondLast += 1
      rows.set(name, item)
    }

    return Array.from(rows.entries()).map(([name, counts]) => {
      const rate = activeCategory === 'OM_INCENTIVE'
        ? counts.current >= 192 ? 225 : counts.current >= 144 ? 200 : counts.current >= 96 ? 150 : 100
        : counts.current >= 96 ? 1600 : counts.current >= 48 ? 1200 : counts.current >= 36 ? 1000 : 800
      const incentiveAmount = counts.current * rate
      const selectedMonth = incentiveAmount * 0.5
      return {
        name,
        numberOfSales: counts.current,
        incentiveAmount,
        secondLastMonth: counts.secondLast * rate * 0.25,
        lastMonth: counts.last * rate * 0.25,
        selectedMonth,
        totalIncentive: incentiveAmount,
      }
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [customers, activeCategory, hasSearched, appliedFilters, invoiceMonth])

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
      includeZeroNegative,
      invoiceMonth,
      adjustmentType: selectedAdjustmentType,
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
    setIncludeZeroNegative(false)
    setSelectedAdjustmentType('ALL')
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
      includeZeroNegative: false,
      invoiceMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      adjustmentType: 'ALL',
    })
    setHasSearched(false)
  }

  const categoryTabs = [
    { id: 'STATUS', label: 'Customer Status Report', icon: CheckCircle2, count: categoryCounts.STATUS },
    { id: 'SALES', label: 'Sales Report', icon: Receipt, count: categoryCounts.SALES },
    { id: 'RECEIVABLE', label: 'Customer Receivable', icon: AlertTriangle, count: categoryCounts.RECEIVABLE },
    { id: 'ADJUSTMENT', label: 'Adjustment Report', icon: Clock, count: categoryCounts.ADJUSTMENT },
    { id: 'PAYMENTS', label: 'Payments Report', icon: Zap, count: categoryCounts.PAYMENTS },
    { id: 'BILLING', label: 'Billing Report', icon: FileSpreadsheet, count: categoryCounts.BILLING },
    { id: 'SALES_INCENTIVE', label: 'Incentive Disbursement Report (Sales)', icon: Receipt, count: categoryCounts.SALES_INCENTIVE },
    { id: 'OM_INCENTIVE', label: 'Incentive Disbursement Report (O & M)', icon: CheckCircle2, count: categoryCounts.OM_INCENTIVE },
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
    const exportRowCount = activeCategory === 'ADJUSTMENT'
      ? filteredAdjustmentRows.length
      : activeCategory === 'PAYMENTS'
        ? filteredPaymentRows.length
        : activeCategory === 'BILLING'
          ? billingSummaryRows.length
          : ['SALES_INCENTIVE', 'OM_INCENTIVE'].includes(activeCategory)
            ? incentiveRows.length
        : filteredCustomers.length
    if (exportRowCount === 0) {
      alert('No records found matching the selected filters to export.')
      return
    }

    let headers: string[] = []
    let rows: string[][] = []

    if (['SALES_INCENTIVE', 'OM_INCENTIVE'].includes(activeCategory)) {
      headers = ['Account Executive Sales', 'Number of Sales', 'Incentive Amount', '25% of 2nd Last month', '25% of Last month', '50% Incentive Of Selected Month', 'Total Incentive']
      rows = incentiveRows.map((row) => [
        `"${row.name}"`, `"${row.numberOfSales}"`, `"${row.incentiveAmount}"`,
        `"${row.secondLastMonth}"`, `"${row.lastMonth}"`, `"${row.selectedMonth}"`, `"${row.totalIncentive}"`,
      ])
    } else if (activeCategory === 'BILLING') {
      const columns = ['House', 'Arrears 90 Days', 'Arrears 60 Days', 'Arrears 30 Days', 'Total Arrears', 'Current', 'Total']
      headers = ['Account Executive Name', ...['Target', 'Adjustment', 'Revised Target', 'Payment Collection', 'Balance', '%age'].flatMap((group) => columns.map((column) => `${group} ${column}`))]
      rows = billingSummaryRows.map((row) => {
        const values = [row.target, row.adjustment, row.revisedTarget, row.paymentCollection, row.balance]
        const cells = values.flatMap((group) => columns.map((column) => {
          const metric = column === 'House' ? { houses: group.total.houses, amount: 0 } : group[column === 'Arrears 90 Days' ? 'arrears90' : column === 'Arrears 60 Days' ? 'arrears60' : column === 'Arrears 30 Days' ? 'arrears30' : column === 'Total Arrears' ? 'totalArrears' : column.toLowerCase() as 'current' | 'total']
          return `"${column === 'House' ? metric.houses : Math.round(metric.amount)}"`
        }))
        return [`"${row.name}"`, ...cells, ...columns.map(() => '"0"')]
      })
    } else if (activeCategory === 'STATUS') {
      headers = [
        'Customer ID', 'Customer Name', 'Customer Type', 'Customer Address', 'Contact #',
        'House #', 'Block', 'Street #', 'Sub Area', 'Area', 'City',
        'Account Executive Sales Name', 'Installer Name', 'System Type:', 'Monitoring Time',
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
    } else if (activeCategory === 'CONNECTIVITY') {
      headers = [
        'Month', 'Opening Balance (Active Customers)', 'New Sale (Active)', 
        'Number Of Temp blocked', 'Number Of Perm Blocked', 'Non Payment Blocked', 
        'Total Blocked', 'Net Active Customers'
      ]
      rows = [[
        `"${appliedFilters.invoiceMonth}"`,
        `"${connectivityData.openingBalance}"`,
        `"${connectivityData.newSale}"`,
        `"${connectivityData.tempBlocked}"`,
        `"${connectivityData.permBlocked}"`,
        `"${connectivityData.nonPaymentBlocked}"`,
        `"${connectivityData.totalBlocked}"`,
        `"${connectivityData.netActive}"`
      ]]
    } else if (activeCategory === 'SALES') {
      headers = [
        'Customer ID', 'CRF #', 'Customer Name', 'Address', 'Contact Number',
        'City', 'System Type', 'Package', 'Billing Type', 'Customer Type',
        'Amount Payable', 'Paid Amount', 'Sign up Created Date', 'Activation Date'
      ]
      rows = filteredCustomers.map((c) => [
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${c.crfNumber || '-'}"`,
        `"${c.fullName}"`,
        `"${c.address}"`,
        `"${c.contactNumber}"`,
        `"${c.city}"`,
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
        'Customer ID', 'Customer Name', 'Customer Address', 'Contact #',
        'House #', 'Block', 'Street #', 'Sub Area', 'Area',
        'Account Executive', 'City', 'Package', 'Customer Type',
        'System Type:', 'Billing Type', 'Monitoring Time', 'Customer Status',
        'Adjustment / Credit-Debit', 'Arrears 90 Days (PKR)', 'Arrears 60 Days (PKR)',
        'Arrears 30 Days (PKR)', 'Total Arrears (PKR)', 'Current (PKR)',
        'Payment Collection (PKR)', 'Balance Amount (PKR)'
      ]
      rows = filteredCustomers.map((c) => {
        const fin = computeCustomerFinancials(c, appliedFilters.invoiceMonth)
        return [
          `"${formatCustomerId(c.customerCode || c.id)}"`,
          `"${c.fullName}"`,
          `"${c.address}"`,
          `"${c.contactNumber}"`,
          `"${c.houseNumber || c.houseNo || '-'}"`,
          `"${c.block || '-'}"`,
          `"${c.streetNumber || c.streetNo || '-'}"`,
          `"${c.subArea || '-'}"`,
          `"${c.area || '-'}"`,
          `"${c.accountExecutive?.fullName || c.accountExecutiveName || '-'}"`,
          `"${c.city}"`,
          `"${c.packagePlan?.packageTier || '-'}"`,
          `"${c.customerType ? (c.customerType.charAt(0).toUpperCase() + c.customerType.slice(1).toLowerCase()) : 'Residential'}"`,
          `"${c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}"`,
          `"${c.packagePlan?.billingType || 'Monthly'}"`,
          `"${c.packagePlan?.monitoringTime || '12 Hours'}"`,
          `"${c.status ? c.status.replace(/_/g, ' ') : 'Active'}"`,
          `"${fin.adjustmentText}"`,
          `"${fin.arrears90}"`,
          `"${fin.arrears60}"`,
          `"${fin.arrears30}"`,
          `"${fin.totalArrears}"`,
          `"${fin.current}"`,
          `"${fin.paymentCollection}"`,
          `"${fin.balanceAmount}"`,
        ]
      })
    } else if (activeCategory === 'ADJUSTMENT') {
      headers = [
        'Customer ID', 'CRF #', 'Customer Name', 'City',
        'Account Executive Name', 'Package Type', 'Billing Type',
        'Adjustment Debit/Credit', 'Description', 'Activation Date'
      ]
      rows = filteredAdjustmentRows.map(({ customer: c, ledgerEntry: le }) => {
        const isDebit = le.debit > 0
        const adjustmentDisplay = isDebit
          ? `PKR ${Math.round(le.debit)} Debit`
          : `PKR ${Math.round(le.credit)} Credit`
        return [
          `"${formatCustomerId(c.customerCode || c.id)}"`,
          `"${formatCrf(c.crfNumber, c.customerCode)}"`,
          `"${c.fullName}"`,
          `"${c.city}"`,
          `"${c.accountExecutive?.fullName || c.accountExecutiveName || '-'}"`,
          `"${c.packagePlan?.packageTier || '-'}"`,
          `"${c.packagePlan?.billingType || '-'}"`,
          `"${adjustmentDisplay}"`,
          `"${le.narration}"`,
          `"${c.activationDate
              ? formatDate(c.activationDate)
              : c.solarSystem?.systemInstallationDate
                ? formatDate(c.solarSystem.systemInstallationDate)
                : '-'}"`,
        ]
      })
    } else if (activeCategory === 'PAYMENTS') {
      headers = [
        'Customer ID', 'CRF #', 'Customer Name', 'Customer Address', 'Area', 'City',
        'Payment Receipt #', 'Payment Amount (PKR)', 'Payment Description',
        'Payment Mode', 'Payment Status', 'Payment Date', 'Payment Updated By'
      ]
      rows = filteredPaymentRows.map(({ customer: c, transaction: t }) => [
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${formatCrf(c.crfNumber, c.customerCode)}"`,
        `"${c.fullName}"`,
        `"${c.address}"`,
        `"${c.area || '-'}"`,
        `"${c.city}"`,
        `"${t.refNumber || '-'}"`,
        `"${Math.round(t.amount)}"`,
        `"${t.description || '-'}"`,
        `"${t.paymentMethod}"`,
        `"${t.status}"`,
        `"${t.createdAt ? formatDate(t.createdAt) : '-'}"`,
        `"${t.updatedBy || '-'}"`,
      ])
    } else {
      // REGISTER
      headers = [
        'Customer ID', 'CRF #', 'Customer Name', 'Customer Address', 'Contact #',
        'Email Address', 'Sub Area', 'Area', 'City', 'Sign Up Date', 'Activation Date',
        'Package', 'Customer Type', 'System Type', 'Billing Type', 'Monitoring Time',
        'Current Status', 'Sign Up Created by'
      ]
      rows = filteredCustomers.map((c) => [
        `"${formatCustomerId(c.customerCode || c.id)}"`,
        `"${formatCrf(c.crfNumber, c.customerCode)}"`,
        `"${c.fullName}"`,
        `"${c.address}"`,
        `"${c.contactNumber}"`,
        `"${c.email || '-'}"`,
        `"${c.subArea || '-'}"`,
        `"${c.area || '-'}"`,
        `"${c.city}"`,
        `"${formatDate(c.signupDate)}"`,
        `"${c.activationDate ? formatDate(c.activationDate) : (c.solarSystem?.systemInstallationDate ? formatDate(c.solarSystem.systemInstallationDate) : 'Pending')}"`,
        `"${c.packagePlan?.packageTier || '-'}"`,
        `"${c.customerType || '-'}"`,
        `"${c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}"`,
        `"${c.packagePlan?.billingType || '-'}"`,
        `"${c.packagePlan?.monitoringTime || '-'}"`,
        `"${c.status ? c.status.replace(/_/g, ' ') : '-'}"`,
        `"${c.accountExecutive?.fullName || c.accountExecutiveName || '-'}"`,
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
      {/* Dynamic Filter Card with Header */}
      <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
        <SectionHeader
          action={
            <div className="flex items-center gap-2">
              <Button onClick={handleReset} variant="ghost" size="sm" className="h-7 text-xs text-white hover:bg-white/20 font-semibold gap-1 px-2 cursor-pointer">
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
              </Button>
              <Button onClick={handleExportExcel} className="h-8 text-xs bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold shadow-xs gap-1.5 px-3 cursor-pointer">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Export to Excel
              </Button>
            </div>
          }
        >
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#F58220]" />
            {currentTabObj.label}
          </span>
        </SectionHeader>

        <CardContent className="p-6 space-y-6">
          {/* Top Filter Bar: Country, City, Area, Sub Area, Customer Type, Select Status, Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {activeCategory !== 'REGISTER' && <div className="space-y-1">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Country</Label>
              <Input readOnly value="Pakistan" className="h-9 text-xs bg-gray-50 font-semibold" />
            </div>}

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

            {activeCategory !== 'REGISTER' && <div className="space-y-1">
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
            </div>}

            {activeCategory !== 'REGISTER' && <div className="space-y-1">
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
            </div>}

            {activeCategory === 'ADJUSTMENT' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Adjustment Type</Label>
                <select
                  value={selectedAdjustmentType}
                  onChange={(e) => setSelectedAdjustmentType(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                >
                  <option value="ALL">All</option>
                  <option value="DEBIT_NOTE">Debit Note</option>
                  <option value="CREDIT_NOTE">Credit Note</option>
                </select>
              </div>
            )}

            {activeCategory !== 'REGISTER' && (activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && activeCategory !== 'ADJUSTMENT' && activeCategory !== 'PAYMENTS' && activeCategory !== 'BILLING' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Account Executive Sales</Label>                <select
                  value={selectedAccountExecutive}
                  onChange={(e) => setSelectedAccountExecutive(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                >
                  <option value="ALL">All Account Executive Sales</option>
                  {aeOptions.map((ae) => (
                    <option key={ae} value={ae}>{ae}</option>
                  ))}
                </select>
              </div>
            )}

            {activeCategory !== 'REGISTER' && (activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && activeCategory !== 'ADJUSTMENT' && activeCategory !== 'PAYMENTS' && activeCategory !== 'BILLING' && (
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
            )}

            {activeCategory !== 'REGISTER' && (activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && activeCategory !== 'ADJUSTMENT' && activeCategory !== 'PAYMENTS' && activeCategory !== 'BILLING' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Select Status Filter</Label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st.key} value={st.key}>{st.label}</option>
                  ))}
                </select>
              </div>
            )}

            {activeCategory !== 'RECEIVABLE' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Calendar Date From</Label>
                <DateInput
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-xs h-9 border-[var(--color-line)]"
                />
              </div>
            )}

            {activeCategory !== 'RECEIVABLE' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Calendar Date To</Label>
                <DateInput
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-xs h-9 border-[var(--color-line)]"
                />
              </div>
            )}

            {activeCategory === 'RECEIVABLE' && (
              <div className="sm:col-span-2 md:col-span-4 pt-1 flex flex-wrap items-center gap-4">
                {/* Billing month selector */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-[var(--color-ink)] whitespace-nowrap">Billing Month</Label>
                  <Input
                    type="month"
                    value={invoiceMonth}
                    onChange={(e) => setInvoiceMonth(e.target.value)}
                    className="text-xs h-9 border-[var(--color-line)] w-40"
                  />
                </div>
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-[#002868] bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded-lg px-3.5 py-2 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeZeroNegative}
                    onChange={(e) => setIncludeZeroNegative(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-400 text-[#002868] focus:ring-[#002868] cursor-pointer"
                  />
                  <span>Zero and Negative Balances (hide/ Unhide)</span>
                </label>
              </div>
            )}

            {['SALES_INCENTIVE', 'OM_INCENTIVE'].includes(activeCategory) && (
              <div className="sm:col-span-2 md:col-span-4 pt-1 flex items-center gap-2">
                <Label className="text-xs font-semibold text-[var(--color-ink)] whitespace-nowrap">Select Month</Label>
                <Input type="month" value={invoiceMonth} onChange={(e) => setInvoiceMonth(e.target.value)} className="text-xs h-9 border-[var(--color-line)] w-40" />
              </div>
            )}

          </div>

          {/* Search bar & Action Buttons */}
          <div className={`flex flex-col md:flex-row ${(activeCategory === 'SALES' || activeCategory === 'RECEIVABLE' || activeCategory === 'ADJUSTMENT' || activeCategory === 'STATUS' || activeCategory === 'REGISTER' || activeCategory === 'SALES_INCENTIVE' || activeCategory === 'OM_INCENTIVE') ? 'justify-end' : 'justify-between'} items-stretch md:items-center gap-3 pt-4 border-t border-gray-100`}>
            {activeCategory !== 'REGISTER' && (activeCategory !== 'SALES' && activeCategory !== 'CONNECTIVITY') && activeCategory !== 'RECEIVABLE' && activeCategory !== 'STATUS' && activeCategory !== 'ADJUSTMENT' && activeCategory !== 'SALES_INCENTIVE' && activeCategory !== 'OM_INCENTIVE' && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-slate-custom)]" />
                <Input
                  placeholder={activeCategory === 'PAYMENTS' ? 'Search by Customer ID...' : 'Search Customer ID, Name, Contact, CNIC...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                  className="pl-9 text-xs h-10 border-[var(--color-line)] bg-slate-50/60 focus:bg-white"
                />
              </div>
            )}
            
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

          <div className="flex items-center justify-end pt-1 text-xs">
            <div className="text-xs text-gray-600 bg-gray-50 px-3.5 py-1.5 rounded-lg border border-gray-200 font-medium">
              {hasSearched ? (
                <>Showing <strong className="text-[var(--color-ink)]">
                  {activeCategory === 'ADJUSTMENT'
                    ? filteredAdjustmentRows.length
                          : activeCategory === 'PAYMENTS'
                            ? filteredPaymentRows.length
                            : activeCategory === 'BILLING'
                        ? billingSummaryRows.length
                                    : ['SALES_INCENTIVE', 'OM_INCENTIVE'].includes(activeCategory)
                                      ? incentiveRows.length
                      : filteredCustomers.length}
                </strong> matching records in {currentTabObj.label}</>
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
              {/* INCENTIVE DISBURSEMENT REPORTS */}
              {['SALES_INCENTIVE', 'OM_INCENTIVE'].includes(activeCategory) && (
                <React.Fragment key={activeCategory}>
                  <TableHeader className="bg-[var(--color-paper)]">
                    <TableRow>
                      <TableHead className="font-bold text-xs">{activeCategory === 'SALES_INCENTIVE' ? 'Account Executive Sales' : 'Installer / O & M Executive'}</TableHead>
                      <TableHead className="font-bold text-xs text-right">Number of {activeCategory === 'SALES_INCENTIVE' ? 'Sales' : 'Audits'}</TableHead>
                      <TableHead className="font-bold text-xs text-right">Incentive Amount</TableHead>
                      <TableHead className="font-bold text-xs text-right">25% of 2nd Last month</TableHead>
                      <TableHead className="font-bold text-xs text-right">25% of Last month</TableHead>
                      <TableHead className="font-bold text-xs text-right">50% Incentive Of Selected Month</TableHead>
                      <TableHead className="font-bold text-xs text-right">Total Incentive</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!hasSearched ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs">Select filters and click &quot;Search / Apply Filters&quot; to load report data.</TableCell></TableRow>
                    ) : incentiveRows.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs">No incentive records found matching the selected filters.</TableCell></TableRow>
                    ) : (
                      <>
                        {incentiveRows.map((row) => (
                          <TableRow key={row.name} className="text-xs hover:bg-slate-50">
                            <TableCell className="font-semibold text-slate-800">{row.name}</TableCell>
                            <TableCell className="text-right font-medium">{row.numberOfSales}</TableCell>
                            <TableCell className="text-right font-mono">PKR {Math.round(row.incentiveAmount).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">PKR {Math.round(row.secondLastMonth).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">PKR {Math.round(row.lastMonth).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">PKR {Math.round(row.selectedMonth).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono font-bold text-[#002868]">PKR {Math.round(row.totalIncentive).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}

                        {/* Manager Summary Row */}
                        {(() => {
                          const totalSales = incentiveRows.reduce((acc, r) => acc + r.numberOfSales, 0)
                          const totalBaseIncentive = incentiveRows.reduce((acc, r) => acc + r.incentiveAmount, 0)
                          const total2ndLast = incentiveRows.reduce((acc, r) => acc + r.secondLastMonth, 0)
                          const totalLast = incentiveRows.reduce((acc, r) => acc + r.lastMonth, 0)
                          const totalSelected = incentiveRows.reduce((acc, r) => acc + r.selectedMonth, 0)
                          const totalOverall = incentiveRows.reduce((acc, r) => acc + r.totalIncentive, 0)

                          const managerMultiplier = activeCategory === 'SALES_INCENTIVE' ? 0.25 : 0.50
                          const managerLabel = activeCategory === 'SALES_INCENTIVE'
                            ? 'Account Manager Sales : 25% of total Team Incentive:'
                            : 'O & M Manager 50% of Team Incentive:'

                          return (
                            <TableRow className="border-t-2 border-[#002868] bg-slate-50 font-bold text-xs">
                              <TableCell className="font-extrabold text-[#002868] whitespace-nowrap">
                                {managerLabel}
                              </TableCell>
                              <TableCell className="text-right font-bold text-slate-900">
                                {totalSales}
                              </TableCell>
                              <TableCell className="text-right font-mono font-extrabold text-[#002868]">
                                PKR {Math.round(totalBaseIncentive * managerMultiplier).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-mono font-extrabold text-[#002868]">
                                PKR {Math.round(total2ndLast * managerMultiplier).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-mono font-extrabold text-[#002868]">
                                PKR {Math.round(totalLast * managerMultiplier).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-mono font-extrabold text-[#002868]">
                                PKR {Math.round(totalSelected * managerMultiplier).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-mono font-extrabold text-emerald-800 text-sm">
                                PKR {Math.round(totalOverall * managerMultiplier).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        })()}
                      </>
                    )}
                  </TableBody>
                </React.Fragment>
              )}

              {/* BILLING REPORT TABLE */}
              {activeCategory === 'BILLING' && (
                <>
                  <TableHeader className="bg-[var(--color-paper)]">
                    <TableRow className="border-b border-gray-200">
                      <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Account Executive Name</TableHead>
                      {['Target', 'Adjustment', 'Revised Target', 'Payment Collection', 'Balance', '%age'].map((group) => (
                        <TableHead key={group} colSpan={7} className="font-bold text-xs text-[var(--color-graphite)] text-center whitespace-nowrap border-l border-gray-300">{group}</TableHead>
                      ))}
                    </TableRow>
                    <TableRow className="border-b border-gray-200">
                      {['Target', 'Adjustment', 'Revised Target', 'Payment Collection', 'Balance', '%age'].flatMap((group) => billingColumns.map((column) => (
                        <TableHead key={`${group}-${column}`} className="font-bold text-[10px] text-[var(--color-graphite)] text-center whitespace-nowrap border-l border-gray-200">{column}</TableHead>
                      )))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!hasSearched ? (
                      <TableRow><TableCell colSpan={43} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">Select filters and click &quot;Search / Apply Filters&quot; to load report data.</TableCell></TableRow>
                    ) : billingSummaryRows.length === 0 ? (
                      <TableRow><TableCell colSpan={43} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">No billing records found matching the selected filters.</TableCell></TableRow>
                    ) : billingSummaryRows.map((row) => {
                      const groups: Array<[string, BillingGroup]> = [
                        ['Target', row.target],
                        ['Adjustment', row.adjustment],
                        ['Revised Target', row.revisedTarget],
                        ['Payment Collection', row.paymentCollection],
                        ['Balance', row.balance],
                      ]
                      return (
                        <TableRow key={row.name} className="hover:bg-[var(--color-paper)]/50 text-xs">
                          <TableCell className="font-semibold text-[var(--color-graphite)] whitespace-nowrap">{row.name}</TableCell>
                          {groups.flatMap(([groupName, group]) => billingColumns.map((column) => {
                            const metric = billingMetric(group, column)
                            return <TableCell key={`${groupName}-${column}`} className="text-right font-mono whitespace-nowrap">{column === 'House' ? metric.houses : Math.round(metric.amount).toLocaleString()}</TableCell>
                          }))}
                          {billingColumns.map((column) => {
                            const total = row.target.total.amount
                            const balance = row.balance.total.amount
                            const percentage = total > 0 ? (balance / total) * 100 : 0
                            return <TableCell key={`percentage-${column}`} className="text-right font-mono whitespace-nowrap">{column === 'House' ? row.target.total.houses : `${percentage.toFixed(2)}%`}</TableCell>
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </>
              )}

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
                      <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Account Executive Sales Name</TableHead>
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

            {/* 1.5 CONNECTIVITY REPORT SUMMARY */}
            {activeCategory === 'CONNECTIVITY' && (
              <>
                <TableHeader className="bg-[#002868] text-white">
                  <TableRow className="border-b border-[#001d4a] font-bold text-xs">
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Opening Balance (Active Customers)</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">New Sale (Active)</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Number Of Temp blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Number Of Perm Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Non Payment Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Total Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap text-emerald-300">Net Active Customers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click "Search / Apply Filters" to load report data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow className="hover:bg-slate-50 text-sm font-bold text-slate-800">
                      <TableCell className="font-mono">{connectivityData.openingBalance}</TableCell>
                      <TableCell className="font-mono text-emerald-700">{connectivityData.newSale}</TableCell>
                      <TableCell className="font-mono">{connectivityData.tempBlocked}</TableCell>
                      <TableCell className="font-mono">{connectivityData.permBlocked}</TableCell>
                      <TableCell className="font-mono">{connectivityData.nonPaymentBlocked}</TableCell>
                      <TableCell className="font-mono text-rose-700">{connectivityData.totalBlocked}</TableCell>
                      <TableCell className="font-mono text-lg text-emerald-700">{connectivityData.netActive}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}

            {/* 2. SALES REPORT TABLES */}
            {activeCategory === 'SALES' && (
              <>
                {/* Target totals and account executive performance */}
                <TableHeader className="bg-[#002868] text-white border-b-2 border-[#f26522]">
                  <TableRow className="bg-slate-50 border-b border-slate-200 text-xs">
                    <TableCell className="font-extrabold text-[#002868] whitespace-nowrap">Target Summary</TableCell>
                    <TableCell className="font-extrabold text-slate-900">{aeTotals.salesTarget}</TableCell>
                    <TableCell className="font-extrabold text-emerald-700">{aeTotals.newSaleActive}</TableCell>
                    <TableCell>{aeTotals.tempBlocked}</TableCell>
                    <TableCell>{aeTotals.permBlocked}</TableCell>
                    <TableCell>{aeTotals.nonPaymentBlocked}</TableCell>
                    <TableCell className="font-extrabold text-rose-700">{aeTotals.totalBlocked}</TableCell>
                    <TableCell className="font-extrabold text-amber-800">{aeTotals.balanceTarget}</TableCell>
                    <TableCell className="font-extrabold text-blue-800">{aeTotals.salesTarget > 0 ? ((aeTotals.newSaleActive / aeTotals.salesTarget) * 100).toFixed(1) : '0.0'}%</TableCell>
                    <TableCell className="font-extrabold text-right text-slate-900">PKR {Math.round(aeTotals.amountPayable).toLocaleString()}</TableCell>
                    <TableCell className="font-extrabold text-right text-emerald-800">PKR {Math.round(aeTotals.paidAmount).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-[#001d4a] font-bold text-xs">
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Account Executive Sales</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Sales Target</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">New Sale (Active)</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Number Of Temp blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Number Of Perm Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Non Payment Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Total Blocked</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Balance Target</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap">Achieved in % Age</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap text-right">Amount Payable</TableHead>
                    <TableHead className="font-extrabold text-xs text-white whitespace-nowrap text-right">Paid Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-slate-200">
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : aeSummaryList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-20 text-center text-sm text-[var(--color-slate-custom)]">
                        No sales records found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : aeSummaryList.map((ae) => {
                    const aeCustomers = filteredCustomers.filter((customer) =>
                      (customer.accountExecutive?.fullName || customer.accountExecutiveName || 'Unassigned') === ae.name
                    )
                    const isExpanded = expandedAE === ae.name

                    return (
                      <React.Fragment key={ae.name}>
                        <TableRow
                          className="hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                          onClick={() => setExpandedAE(isExpanded ? null : ae.name)}
                        >
                          <TableCell className="font-bold text-[#002868] whitespace-nowrap">
                            <span className="inline-flex items-center gap-2">
                              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              {ae.name}
                            </span>
                          </TableCell>
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
                        {isExpanded && (
                          <TableRow className="bg-slate-50/70">
                            <TableCell colSpan={11} className="p-0">
                              <Table className="min-w-[1100px]">
                                <TableHeader className="bg-[var(--color-paper)]">
                                  <TableRow>
                                    {['Customer ID', 'CRF #', 'Customer Name', 'Address', 'Contact Number', 'City', 'System Type', 'Package', 'Billing Type', 'Customer Type', 'Amount Payable', 'Paid Amount', 'Sign up Created Date', 'Activation Date'].map((heading) => (
                                      <TableHead key={heading} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">{heading}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {aeCustomers.map((c) => (
                                    <TableRow key={c.id} className="hover:bg-white text-xs">
                          <TableCell className="font-mono font-bold text-[var(--color-ink)] whitespace-nowrap">
                            <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                              {formatCustomerId(c.customerCode || c.id)}
                            </Link>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono">{formatCrf(c.crfNumber, c.customerCode) || '—'}</TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{c.fullName}</TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">{c.address}</TableCell>
                          <TableCell className="font-mono whitespace-nowrap">{c.contactNumber}</TableCell>
                          <TableCell className="font-semibold whitespace-nowrap">{c.city}</TableCell>
                          <TableCell className="whitespace-nowrap font-medium">{c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="bg-amber-50 text-amber-950 border-amber-200 font-semibold">
                              {c.packagePlan?.packageTier || 'Basic'}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{c.packagePlan?.billingType || 'Monthly'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold text-[10px]">
                              {c.customerType ? (c.customerType.charAt(0).toUpperCase() + c.customerType.slice(1).toLowerCase()) : 'Residential'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            PKR {Math.round(Number(c.packagePlan?.totalAmount || 0)).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-emerald-900 whitespace-nowrap">
                            PKR {Math.round(Number(c.packagePlan?.paidAmount || 0)).toLocaleString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-gray-600">{formatDate(c.signupDate)}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-gray-600">
                            {c.activationDate ? formatDate(c.activationDate) : (c.solarSystem?.systemInstallationDate ? formatDate(c.solarSystem.systemInstallationDate) : 'Pending')}
                          </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </>
            )}

            {/* 3. CUSTOMER RECEIVABLE TABLE */}
            {activeCategory === 'RECEIVABLE' && (
              <>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-gray-200">
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer ID</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Name</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Address</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Contact #</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">House #</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Block</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Street #</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Sub Area</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Area</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Account Executive</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">City</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Package</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Type</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">System Type:</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Billing Type</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Monitoring Time</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Status</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-emerald-950 bg-[#86efac]/35 whitespace-nowrap border-l border-emerald-200">Adjustment / Credit-Debit</TableHead>
                    <TableHead colSpan={4} className="font-bold text-xs text-emerald-950 bg-[#86efac]/35 text-center whitespace-nowrap border-x border-emerald-200">Arrears Breakdown</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] text-right whitespace-nowrap">Current</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-emerald-950 bg-[#86efac]/35 text-right whitespace-nowrap border-x border-emerald-200">Payment</TableHead>
                    <TableHead rowSpan={2} className="font-bold text-xs text-[var(--color-graphite)] text-right whitespace-nowrap">Balance Amount</TableHead>
                  </TableRow>
                  <TableRow className="border-b border-gray-200 bg-[var(--color-paper)]">
                    <TableHead className="font-bold text-xs text-emerald-950 bg-[#86efac]/35 text-right whitespace-nowrap border-l border-emerald-200">Arrears 90 Days</TableHead>
                    <TableHead className="font-bold text-xs text-emerald-950 bg-[#86efac]/35 text-right whitespace-nowrap">Arrears 60 Days</TableHead>
                    <TableHead className="font-bold text-xs text-emerald-950 bg-[#86efac]/35 text-right whitespace-nowrap">Arrears 30 Days</TableHead>
                    <TableHead className="font-bold text-xs text-emerald-950 bg-[#86efac]/35 text-right whitespace-nowrap border-r border-emerald-200">Total Arrears</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={22} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={22} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No outstanding receivables found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => {
                      const fin = computeCustomerFinancials(c, appliedFilters.invoiceMonth)
                      return (
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
                          <TableCell className="whitespace-nowrap text-gray-700">{c.accountExecutive?.fullName || c.accountExecutiveName || '-'}</TableCell>
                          <TableCell className="font-semibold whitespace-nowrap">{c.city}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="bg-amber-50 text-amber-950 border-amber-200 font-semibold">
                              {c.packagePlan?.packageTier || 'Basic'}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold text-[10px]">
                              {c.customerType ? (c.customerType.charAt(0).toUpperCase() + c.customerType.slice(1).toLowerCase()) : 'Residential'}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium">{c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.packagePlan?.billingType || 'Monthly'}</TableCell>
                          <TableCell className="whitespace-nowrap text-gray-700">{c.packagePlan?.monitoringTime || '12 Hours'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold text-[10px]">
                              {c.status ? c.status.replace(/_/g, ' ') : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold whitespace-nowrap bg-emerald-50/70 border-l border-emerald-100 text-slate-800">
                            {fin.adjustmentText}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-slate-700 whitespace-nowrap bg-emerald-50/70 border-l border-emerald-100">
                            PKR {fin.arrears90.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-slate-700 whitespace-nowrap bg-emerald-50/70">
                            PKR {fin.arrears60.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-slate-700 whitespace-nowrap bg-emerald-50/70">
                            PKR {fin.arrears30.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-slate-700 whitespace-nowrap bg-emerald-50/70 border-r border-emerald-100">
                            PKR {fin.totalArrears.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                            PKR {fin.current.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-emerald-900 bg-emerald-50/80 whitespace-nowrap border-x border-emerald-100">
                            PKR {fin.paymentCollection.toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-right font-mono font-bold whitespace-nowrap ${fin.balanceAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            PKR {fin.balanceAmount.toLocaleString()}
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
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">CRF #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">City</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Account Executive Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Package Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Billing Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Adjustment Debit/Credit</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Description</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Activation Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredAdjustmentRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No debit note or credit note entries found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdjustmentRows.map((row) => {
                      const { customer: c, ledgerEntry: le } = row
                      const isDebit = le.debit > 0
                      const adjustmentDisplay = isDebit
                        ? `PKR ${Math.round(le.debit).toLocaleString()} Debit`
                        : `PKR ${Math.round(le.credit).toLocaleString()} Credit`
                      return (
                        <TableRow key={`${c.id}-${le.id}`} className="hover:bg-[var(--color-paper)]/50 text-xs">
                          <TableCell className="font-mono font-bold text-[var(--color-ink)] whitespace-nowrap">
                            <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-amber-900">
                              {formatCustomerId(c.customerCode || c.id)}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-gray-700 whitespace-nowrap">
                            {formatCrf(c.crfNumber, c.customerCode)}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{c.fullName}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.city}</TableCell>
                          <TableCell className="whitespace-nowrap text-gray-700">
                            {c.accountExecutive?.fullName || c.accountExecutiveName || '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{c.packagePlan?.packageTier || '-'}</TableCell>
                          <TableCell className="whitespace-nowrap">{c.packagePlan?.billingType || '-'}</TableCell>
                          <TableCell className={`font-mono font-bold whitespace-nowrap ${isDebit ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {adjustmentDisplay}
                          </TableCell>
                          <TableCell className="text-gray-700 max-w-xs truncate">{le.narration}</TableCell>
                          <TableCell className="font-mono text-gray-600 whitespace-nowrap">
                            {c.activationDate
                              ? formatDate(c.activationDate)
                              : c.solarSystem?.systemInstallationDate
                                ? formatDate(c.solarSystem.systemInstallationDate)
                                : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </>
            )}

            {/* 5. PAYMENTS REPORT TABLE */}
            {activeCategory === 'PAYMENTS' && (
              <>
                <TableHeader className="bg-[var(--color-paper)]">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer ID</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">CRF #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Name</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Customer Address</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Area</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">City</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Payment Receipt #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] text-right whitespace-nowrap">Payment Amount</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Payment Description</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Payment Mode</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Payment Status</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Payment Date</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)] whitespace-nowrap">Payment Updated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-32 text-center text-xs text-[var(--color-slate-custom)] font-medium">
                        Select filters and click &quot;Search / Apply Filters&quot; to load report data.
                      </TableCell>
                    </TableRow>
                  ) : filteredPaymentRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-32 text-center text-sm text-[var(--color-slate-custom)]">
                        No payment records found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPaymentRows.map(({ customer: c, transaction: t }) => (
                      <TableRow key={`${c.id}-${t.id}`} className="hover:bg-[var(--color-paper)]/50 text-xs">
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
                        <TableCell className="whitespace-nowrap">{c.area || '-'}</TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">{c.city}</TableCell>
                        <TableCell className="font-mono text-gray-700 whitespace-nowrap">{t.refNumber || '-'}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                          PKR {Math.round(t.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-xs truncate">{t.description || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-300 font-semibold text-[10px]">
                            {t.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`font-semibold text-[10px] ${
                              (t.status || '').toLowerCase() === 'posted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {t.status || 'Posted'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-gray-600 whitespace-nowrap">
                          {t.createdAt ? formatDate(t.createdAt) : '-'}
                        </TableCell>
                        <TableCell className="text-gray-700 whitespace-nowrap">{t.updatedBy || '-'}</TableCell>
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
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Address</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Contact #</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Email Address</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sub Area</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Area</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">City</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sign up date</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Activation Date</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Package</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Customer Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">System Type:</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Billing Type</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Monitoring Time</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Current Status</TableHead>
                    <TableHead className="font-bold text-xs text-[var(--color-graphite)]">Sign Up Created by</TableHead>
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
                        <TableCell className="text-gray-600 max-w-xs truncate">{c.address}</TableCell>
                        <TableCell className="font-mono">{c.contactNumber}</TableCell>
                        <TableCell className="text-gray-600">{c.email || '-'}</TableCell>
                        <TableCell>{c.subArea || '-'}</TableCell>
                        <TableCell>{c.area || '-'}</TableCell>
                        <TableCell className="font-semibold">{c.city}</TableCell>
                        <TableCell className="text-gray-600 font-mono">{formatDate(c.signupDate)}</TableCell>
                        <TableCell className="text-gray-600 font-mono">
                          {c.activationDate ? formatDate(c.activationDate) : (c.solarSystem?.systemInstallationDate ? formatDate(c.solarSystem.systemInstallationDate) : 'Pending')}
                        </TableCell>
                        <TableCell>{c.packagePlan?.packageTier || 'Basic'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-100 text-slate-800 text-[10px]">
                            {c.customerType}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.packagePlan?.systemSizeKw || c.solarSystem?.inverterSize || '-'}</TableCell>
                        <TableCell>{c.packagePlan?.billingType || '-'}</TableCell>
                        <TableCell>{c.packagePlan?.monitoringTime || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-semibold">
                            {c.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.accountExecutive?.fullName || c.accountExecutiveName || '-'}</TableCell>
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

