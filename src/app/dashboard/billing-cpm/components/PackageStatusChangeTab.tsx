'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, CheckCircle2, AlertTriangle, ArrowRight, User, Phone, MapPin, DollarSign, Zap } from 'lucide-react'
import { searchCustomerForBilling, updateCustomerPackageAndStatus } from '../actions'

const SYSTEM_SIZES = ['1-10 kW', '10-20 kW', '20-30 kW', '30+ kW']
const PACKAGES = ['Basic', 'Moderate', 'Comprehensive']
const BILLING_TYPES = ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly']
const MONITORING_TIMES = ['12 Hours', '24 Hours']

// Standard pricing matrix helper
function estimatePlanPrice(size: string, tier: string, billing: string): number {
  let baseMonthly = 8000
  if (size === '10-20 kW') baseMonthly = 15000
  else if (size === '20-30 kW') baseMonthly = 25000
  else if (size === '30+ kW' || size === '30 kW & Above') baseMonthly = 35000

  let tierMultiplier = 1.0
  if (tier === 'Moderate') tierMultiplier = 1.25
  else if (tier === 'Comprehensive') tierMultiplier = 1.5

  let periodMultiplier = 1
  let discount = 1.0
  if (billing === 'Quarterly') {
    periodMultiplier = 3
    discount = 0.95 // 5% off
  } else if (billing === 'Half Yearly') {
    periodMultiplier = 6
    discount = 0.90 // 10% off
  } else if (billing === 'Yearly') {
    periodMultiplier = 12
    discount = 0.80 // 20% off
  }

  return Math.round(baseMonthly * tierMultiplier * periodMultiplier * discount * 1.16)
}

export function PackageStatusChangeTab() {
  const [searchId, setSearchId] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [customer, setCustomer] = React.useState<any | null>(null)
  const [searchError, setSearchError] = React.useState<string | null>(null)

  // Form State
  const [systemSize, setSystemSize] = React.useState('10-20 kW')
  const [packageTier, setPackageTier] = React.useState('Basic')
  const [billingType, setBillingType] = React.useState('Monthly')
  const [monitoringTime, setMonitoringTime] = React.useState('12 Hours')
  const [status, setStatus] = React.useState('CONNECTION_ACTIVE')
  const [customAmount, setCustomAmount] = React.useState<number>(0)
  const [notes, setNotes] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchId.trim()) return

    setIsSearching(true)
    setSearchError(null)
    setFeedback(null)

    try {
      const res = await searchCustomerForBilling(searchId)
      if (res.error) {
        setSearchError(res.error)
        setCustomer(null)
      } else if (res.customer) {
        setCustomer(res.customer)
        setStatus(res.customer.status || 'CONNECTION_ACTIVE')
        if (res.customer.packagePlan) {
          setSystemSize(res.customer.packagePlan.systemSizeKw || '10-20 kW')
          setPackageTier(res.customer.packagePlan.packageTier || 'Basic')
          setBillingType(res.customer.packagePlan.billingType || 'Monthly')
          setMonitoringTime(res.customer.packagePlan.monitoringTime || '12 Hours')
          setCustomAmount(res.customer.packagePlan.totalAmount || 0)
        } else {
          setCustomAmount(estimatePlanPrice('10-20 kW', 'Basic', 'Monthly'))
        }
      }
    } finally {
      setIsSearching(false)
    }
  }

  // Recalculate estimated amount on dropdown change if user hasn't typed custom
  const handleDropdownChange = (size: string, tier: string, billing: string) => {
    const est = estimatePlanPrice(size, tier, billing)
    setCustomAmount(est)
  }

  const oldTotal = customer?.packagePlan?.totalAmount || 0
  const diff = customAmount - oldTotal

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setIsSaving(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('status', status)
      formData.append('systemSizeKw', systemSize)
      formData.append('packageTier', packageTier)
      formData.append('billingType', billingType)
      formData.append('monitoringTime', monitoringTime)
      formData.append('totalAmount', customAmount.toString())
      formData.append('notes', notes)

      const res = await updateCustomerPackageAndStatus(formData)
      if (res.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setFeedback({ type: 'success', message: res.message || 'Updated successfully!' })
        // Refresh customer details
        handleSearch()
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Search Box */}
      <Card className="border-line shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--color-amber)]" />
            1. Select Customer for Package or Status Modification
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the Customer ID (e.g. 9484, 1001) to load their active subscription & connection status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Input
                placeholder="Enter Customer ID (e.g. 9484)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="h-10 text-sm font-mono pl-3"
                required
              />
            </div>
            <Button type="submit" disabled={isSearching} className="h-10 px-5 bg-[var(--color-amber)] text-white font-semibold">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search Customer'}
            </Button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              {searchError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Customer Summary Card (Auto Shown Above Form as in Client Mockup) */}
      {customer && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 transition-all animate-in fade-in-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--color-amber)] text-white flex items-center justify-center font-bold text-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[var(--color-graphite)]">{customer.fullName}</h4>
                  <Badge variant="outline" className="font-mono text-[10px] bg-white text-slate-800">
                    ID: {customer.customerCode}
                  </Badge>
                  {customer.crfNumber && (
                    <Badge variant="outline" className="font-mono text-[10px] bg-white text-slate-700">
                      {customer.crfNumber}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-slate-custom)] mt-0.5">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.contactNumber}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer.address}, {customer.city}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-line shadow-2xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Status</p>
                <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] text-xs font-semibold mt-0.5">
                  {customer.status?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="border-l border-line pl-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Balance</p>
                <p className={`text-sm font-mono font-bold ${customer.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  Rs. {Math.abs(customer.currentBalance).toLocaleString()} {customer.currentBalance > 0 ? 'Dr' : 'Cr'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Package & Status Configuration Matrix Form */}
      {customer && (
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--color-amber)]" />
              2. Status & Package Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Change customer package tier, billing cycle, or connection status. Automated financial debit/credit adjustments will be posted to the ledger accordingly.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Dropdowns Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* System Type */}
                {/* System Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">System Type (kW)</Label>
                  <Select 
                    value={systemSize} 
                    onValueChange={(val) => {
                      if (val) {
                        setSystemSize(val)
                        handleDropdownChange(val, packageTier, billingType)
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 text-xs bg-slate-50/50">
                      <SelectValue placeholder="System Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEM_SIZES.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Package Tier */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Package Tier</Label>
                  <Select 
                    value={packageTier} 
                    onValueChange={(val) => {
                      if (val) {
                        setPackageTier(val)
                        handleDropdownChange(systemSize, val, billingType)
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 text-xs bg-slate-50/50">
                      <SelectValue placeholder="Package Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGES.map(p => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Billing Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Billing Type</Label>
                  <Select 
                    value={billingType} 
                    onValueChange={(val) => {
                      if (val) {
                        setBillingType(val)
                        handleDropdownChange(systemSize, packageTier, val)
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 text-xs bg-slate-50/50">
                      <SelectValue placeholder="Billing Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_TYPES.map(b => (
                        <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Monitoring Time */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Monitoring Time</Label>
                  <Select value={monitoringTime} onValueChange={(val) => val && setMonitoringTime(val)}>
                    <SelectTrigger className="h-10 text-xs bg-slate-50/50">
                      <SelectValue placeholder="Monitoring Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONITORING_TIMES.map(m => (
                        <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Status Change & Billing Total Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-line">
                
                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Connection Status Change</span>
                    <span className="text-[10px] text-slate-400 font-normal">Active / Blocked / Disconnected</span>
                  </Label>
                  <Select value={status} onValueChange={(val) => val && setStatus(val)}>
                    <SelectTrigger className="h-10 text-xs font-bold bg-slate-50/50 border-line">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONNECTION_ACTIVE" className="text-xs font-medium text-emerald-700">Active</SelectItem>
                      <SelectItem value="TEMPORARY_BLOCKED" className="text-xs font-medium text-amber-700">Temporary Blocked</SelectItem>
                      <SelectItem value="PERMANENT_DISCONNECTION" className="text-xs font-medium text-rose-700">Permanent Disconnection</SelectItem>
                      <SelectItem value="NON_PAYMENT_BLOCKED" className="text-xs font-medium text-purple-700">Non-Payment Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Billing Rate / Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Billing Amount (Rs. incl. Tax)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-calculated</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                      className="pl-9 h-10 text-sm font-mono font-bold bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Adjustment Note & Automatic Debit/Credit Warning */}
              <div className="p-4 bg-slate-50 rounded-xl border border-line space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Previous Plan Rate: <strong className="text-slate-900 font-mono">Rs. {oldTotal.toLocaleString()}</strong></span>
                  <span className="text-slate-600 font-medium">New Plan Rate: <strong className="text-slate-900 font-mono">Rs. {customAmount.toLocaleString()}</strong></span>
                  <span className="font-bold flex items-center gap-1">
                    Difference: 
                    <span className={`font-mono ${diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {diff > 0 ? `+Rs. ${diff.toLocaleString()} (Debit Adjustment)` : diff < 0 ? `-Rs. ${Math.abs(diff).toLocaleString()} (Credit Adjustment)` : 'No Price Change'}
                    </span>
                  </span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600">Reason / Change Notes</Label>
                  <Input 
                    placeholder="e.g. Upgraded from Basic to Comprehensive package" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              {feedback && (
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />}
                  {feedback.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" disabled={isSaving} className="h-10 px-6 bg-[var(--color-ink)] hover:bg-black text-white font-semibold text-xs shadow-sm">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Package & Status Changes'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
