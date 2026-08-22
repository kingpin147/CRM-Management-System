'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, CheckCircle2, AlertTriangle, User, Phone, MapPin, CreditCard, Check, Trash2, ShieldCheck, Calendar } from 'lucide-react'
import { searchCustomerForBilling, createPaymentEntry, postTransaction, deleteTransaction } from '../actions'
import { CustomerBillingProfileCard } from './CustomerBillingProfileCard'
import { CustomerSearchAutoSuggest } from './CustomerSearchAutoSuggest'

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
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [paymentMode, setPaymentMode] = React.useState('')
  const [accountExecutive, setAccountExecutive] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Action states for Approval Table
  const [actionId, setActionId] = React.useState<string | null>(null)

  const handleSearch = async (queryToSearch?: string) => {
    const targetQuery = typeof queryToSearch === 'string' ? queryToSearch : searchId
    if (!targetQuery || !targetQuery.trim()) return

    setIsSearching(true)
    setSearchError(null)
    setFeedback(null)

    try {
      const res = await searchCustomerForBilling(targetQuery)
      if (res.error) {
        setSearchError(res.error)
        setCustomer(null)
      } else if (res.customer) {
        setCustomer(res.customer)
        setSearchId(targetQuery)
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    if (!paymentMode) {
      setFeedback({ type: 'error', message: 'Please select a Payment Mode.' })
      return
    }
    if (!accountExecutive) {
      setFeedback({ type: 'error', message: 'Please select an Account Executive Sales Name.' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('date', paymentDate)
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
        setPaymentMode('')
        setAccountExecutive('')
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
      <Card className="border-line shadow-xs overflow-visible relative z-30">
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
          <CustomerSearchAutoSuggest
            onSelectCustomer={(id) => handleSearch(id)}
            isSearchingCustomer={isSearching}
            placeholder="Search and select customer by Name, ID (9484), Phone, CRF #, CNIC..."
          />

          {searchError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              {searchError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Profile & Ledger Card */}
      {customer && <CustomerBillingProfileCard customer={customer} />}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Payment Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Payment Date
                  </Label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-10 text-xs font-medium bg-slate-50/50"
                    required
                  />
                </div>

                {/* Payment Mode */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={(val) => { if (val) setPaymentMode(val) }}>
                    <SelectTrigger className="h-10 text-xs font-medium bg-slate-50/50">
                      <SelectValue placeholder="Select Payment Mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IBFT" className="text-xs font-medium">IBFT (Interbank Funds Transfer)</SelectItem>
                      <SelectItem value="Cash" className="text-xs font-medium">Cash / Cash Deposit</SelectItem>
                      <SelectItem value="Cheque" className="text-xs font-medium">Cheque / Pay Order</SelectItem>
                      <SelectItem value="Credit Card" className="text-xs font-medium">Credit Card</SelectItem>
                      <SelectItem value="Debit Card" className="text-xs font-medium">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Amount Received (Rs.)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">Rs.</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 h-10 text-sm font-mono font-bold bg-slate-50/50 text-emerald-700"
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

                {/* Account Executive Sales Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Account Executive Sales Name</Label>
                  <Select value={accountExecutive} onValueChange={(val) => { if (val) setAccountExecutive(val) }}>
                    <SelectTrigger className="h-10 text-xs font-semibold bg-slate-50/50">
                      <SelectValue placeholder="Select Account Executive Sales..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users && users.length > 0 ? (
                        users.map((u) => (
                          <SelectItem key={u.id} value={u.fullName} className="text-xs font-medium">
                            {u.fullName}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Muhammad Nouman (Admin)" className="text-xs font-medium">Muhammad Nouman (Admin)</SelectItem>
                          <SelectItem value="Hamza Tariq (Sales Lead)" className="text-xs font-medium">Hamza Tariq (Sales Lead)</SelectItem>
                          <SelectItem value="Engr. Bilal Ahmed (O&M Manager)" className="text-xs font-medium">Engr. Bilal Ahmed (O&M Manager)</SelectItem>
                          <SelectItem value="EnergyGurus Finance" className="text-xs font-medium">EnergyGurus Finance</SelectItem>
                          <SelectItem value="Operations Team" className="text-xs font-medium">Operations Team</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
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
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Customer ID</TableHead>
                  <TableHead className="font-bold">Customer Name</TableHead>
                  <TableHead className="font-bold">Payment Mode</TableHead>
                  <TableHead className="font-bold">Reference / Description</TableHead>
                  <TableHead className="font-bold text-right">Amount</TableHead>
                  <TableHead className="font-bold">Account Executive Sales</TableHead>
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
                      <TableCell className="font-mono text-slate-600">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
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
