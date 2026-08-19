'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, CheckCircle2, AlertTriangle, User, Phone, MapPin, DollarSign, CreditCard, Check, Trash2, ShieldCheck } from 'lucide-react'
import { searchCustomerForBilling, createPaymentEntry, postTransaction, deleteTransaction } from '../actions'

type UnpostedPayment = {
  id: string
  customerId: string
  customerName: string
  customerCode: string
  amount: number
  mode: string
  accountExecutive: string
  description: string
  createdAt: string | Date
}

export function PaymentEntryTab({
  unpostedPayments = [],
  users = []
}: {
  unpostedPayments?: UnpostedPayment[]
  users?: { id: string; fullName: string }[]
}) {
  const [searchId, setSearchId] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [customer, setCustomer] = React.useState<any | null>(null)
  const [searchError, setSearchError] = React.useState<string | null>(null)

  // Payment Form
  const [amount, setAmount] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [paymentMode, setPaymentMode] = React.useState('Bank Transfer')
  const [accountExecutive, setAccountExecutive] = React.useState(users[0]?.fullName || 'Billing & Sales')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Action states for Approval Table
  const [actionId, setActionId] = React.useState<string | null>(null)

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
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('amount', amount)
      formData.append('description', description)
      formData.append('paymentMode', paymentMode)
      formData.append('accountExecutive', accountExecutive)

      const res = await createPaymentEntry(formData)
      if (res.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setFeedback({ type: 'success', message: res.message || 'Payment entry logged as Unposted.' })
        setAmount('')
        setDescription('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePost = async (txId: string) => {
    setActionId(txId)
    try {
      const res = await postTransaction(txId)
      if (res.error) alert(res.error)
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (txId: string) => {
    if (!confirm('Are you sure you want to delete this unposted payment entry?')) return
    setActionId(txId)
    try {
      const res = await deleteTransaction(txId)
      if (res.error) alert(res.error)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Customer Search */}
      <Card className="border-line shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--color-amber)]" />
            1. Select Customer for Payment Entry
          </CardTitle>
          <CardDescription className="text-xs">
            Enter Customer ID to automatically display customer details and outstanding ledger balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <Input
              placeholder="Enter Customer ID (e.g. 9484, 1001)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="h-10 text-sm font-mono pl-3"
              required
            />
            <Button type="submit" disabled={isSearching} className="h-10 px-5 bg-[var(--color-amber)] text-white font-semibold">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
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

      {/* Customer Info Card (Shown Above Section as specified in Excel) */}
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Balance Due</p>
                <p className={`text-sm font-mono font-bold ${customer.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  Rs. {Math.abs(customer.currentBalance).toLocaleString()} {customer.currentBalance > 0 ? 'Dr' : 'Cr'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Payment Entry Form */}
      {customer && (
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[var(--color-amber)]" />
              2. Payment Entry
            </CardTitle>
            <CardDescription className="text-xs">
              After entry the transaction will be unposted, and will appear in Payment Approval queue with status Unposted.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Payment Mode */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={(val) => val && setPaymentMode(val)}>
                    <SelectTrigger className="h-10 text-xs font-medium bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer / Online</SelectItem>
                      <SelectItem value="Cash Deposit" className="text-xs">Cash Deposit</SelectItem>
                      <SelectItem value="Cheque" className="text-xs">Cheque / Pay Order</SelectItem>
                      <SelectItem value="Direct Debit" className="text-xs">Direct Debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Amount Received (Rs.)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9 h-10 text-sm font-mono font-bold bg-slate-50/50 text-emerald-700"
                      required
                      min={1}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Description / Receipt / Bank Ref</Label>
                  <Input
                    placeholder="e.g. Bank Alfalah Tx Ref #98214"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-10 text-xs bg-slate-50/50"
                    required
                  />
                </div>

                {/* Account Executive Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Account Executive Name</Label>
                  <Input
                    placeholder="Executive Name"
                    value={accountExecutive}
                    onChange={(e) => setAccountExecutive(e.target.value)}
                    className="h-10 text-xs bg-slate-50/50"
                    required
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
                <Button type="submit" disabled={isSubmitting} className="h-10 px-6 bg-[var(--color-ink)] hover:bg-black text-white font-semibold text-xs shadow-sm">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Payment (Submit as Unposted)'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 3. Payment Approval Queue */}
      <Card className="border-line shadow-xs">
        <CardHeader className="pb-3 border-b border-line">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                3. Payment Approval Queue (Unposted Payments)
              </CardTitle>
              <CardDescription className="text-xs">
                The action required for any Unposted Payment is &quot;Posted&quot; or &quot;Delete&quot;. After Posted it will be credited to the customer ledger.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-100 text-slate-800 font-mono text-xs">
              {unpostedPayments.length} Unposted Payment{unpostedPayments.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[var(--color-paper)]">
                <TableRow className="border-b border-line text-xs">
                  <TableHead className="font-bold">Customer ID</TableHead>
                  <TableHead className="font-bold">Customer Name</TableHead>
                  <TableHead className="font-bold">Payment Mode</TableHead>
                  <TableHead className="font-bold">Reference / Narration</TableHead>
                  <TableHead className="font-bold text-right">Amount</TableHead>
                  <TableHead className="font-bold">Account Executive</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpostedPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-28 text-center text-xs text-[var(--color-slate-custom)]">
                      No unposted payments pending approval.
                    </TableCell>
                  </TableRow>
                ) : (
                  unpostedPayments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/50 text-xs">
                      <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                        {p.customerCode}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">{p.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200">
                          {p.mode}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-700">{p.description}</TableCell>
                      <TableCell className="font-mono font-bold text-right text-emerald-600">
                        Rs. {p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-600">{p.accountExecutive}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-semibold text-[10px]">
                          Unposted
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handlePost(p.id)}
                            disabled={actionId === p.id}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-md gap-1"
                          >
                            {actionId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Post
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(p.id)}
                            disabled={actionId === p.id}
                            className="h-7 px-2.5 text-[11px] rounded-md gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
