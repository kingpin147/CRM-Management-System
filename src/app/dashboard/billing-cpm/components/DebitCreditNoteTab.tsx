'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, CheckCircle2, AlertTriangle, User, Phone, MapPin, DollarSign, FileText, Check, Trash2, ShieldCheck } from 'lucide-react'
import { searchCustomerForBilling, createDebitCreditNote, postTransaction, deleteTransaction } from '../actions'

type UnpostedTransaction = {
  id: string
  customerId: string
  customerName: string
  customerCode: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  accountExecutive: string
  description: string
  createdAt: string | Date
}

export function DebitCreditNoteTab({
  unpostedNotes = [],
  users = []
}: {
  unpostedNotes?: UnpostedTransaction[]
  users?: { id: string; fullName: string }[]
}) {
  const [searchId, setSearchId] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [customer, setCustomer] = React.useState<any | null>(null)
  const [searchError, setSearchError] = React.useState<string | null>(null)

  // Note Form
  const [noteType, setNoteType] = React.useState<'DEBIT' | 'CREDIT'>('DEBIT')
  const [amount, setAmount] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [accountExecutive, setAccountExecutive] = React.useState(users[0]?.fullName || 'Operations Team')
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

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('noteType', noteType)
      formData.append('amount', amount)
      formData.append('description', description)
      formData.append('accountExecutive', accountExecutive)

      const res = await createDebitCreditNote(formData)
      if (res.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setFeedback({ type: 'success', message: res.message || 'Note created as Unposted.' })
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
    if (!confirm('Are you sure you want to delete this unposted transaction?')) return
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
            1. Select Customer for Debit / Credit Note Entry
          </CardTitle>
          <CardDescription className="text-xs">
            Enter Customer ID to automatically populate customer name, contact details, and current ledger balance.
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Balance</p>
                <p className={`text-sm font-mono font-bold ${customer.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  Rs. {Math.abs(customer.currentBalance).toLocaleString()} {customer.currentBalance > 0 ? 'Dr' : 'Cr'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Debit / Credit Note Entry Form */}
      {customer && (
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--color-amber)]" />
              2. Debit / Credit Note Entry
            </CardTitle>
            <CardDescription className="text-xs">
              After entry the transaction will be unposted, and will appear in Transaction Approval queue with status Unposted.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Note Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Debit / Credit Note</Label>
                  <Select value={noteType} onValueChange={(val) => val && setNoteType(val as any)}>
                    <SelectTrigger className="h-10 text-xs font-bold bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEBIT" className="text-xs font-semibold text-rose-700">Debit Note (Charge / Fee)</SelectItem>
                      <SelectItem value="CREDIT" className="text-xs font-semibold text-emerald-700">Credit Note (Discount / Waiver)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Amount (Rs.)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9 h-10 text-sm font-mono font-bold bg-slate-50/50"
                      required
                      min={1}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Description / Reason</Label>
                  <Input
                    placeholder="e.g. Installer visit charge / Billing adjustment"
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
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Note (Submit as Unposted)'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 3. Transaction Approval Queue (Unposted Debit/Credit Notes) */}
      <Card className="border-line shadow-xs">
        <CardHeader className="pb-3 border-b border-line">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[var(--color-graphite)] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                3. Transaction Approval (Unposted Notes Queue)
              </CardTitle>
              <CardDescription className="text-xs">
                The action required for any Unposted Transaction is &quot;Posted&quot; or &quot;Delete&quot;. After Posted it will be recorded into the customer ledger.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-100 text-slate-800 font-mono text-xs">
              {unpostedNotes.length} Unposted Note{unpostedNotes.length !== 1 ? 's' : ''}
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
                  <TableHead className="font-bold">Note Type</TableHead>
                  <TableHead className="font-bold">Description</TableHead>
                  <TableHead className="font-bold text-right">Amount</TableHead>
                  <TableHead className="font-bold">Account Executive</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpostedNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-28 text-center text-xs text-[var(--color-slate-custom)]">
                      No unposted debit/credit notes pending approval.
                    </TableCell>
                  </TableRow>
                ) : (
                  unpostedNotes.map((note) => (
                    <TableRow key={note.id} className="hover:bg-slate-50/50 text-xs">
                      <TableCell className="font-mono font-bold text-[var(--color-ink)]">
                        {note.customerCode}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">{note.customerName}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={note.type === 'DEBIT' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                        >
                          {note.type === 'DEBIT' ? 'Debit Note' : 'Credit Note'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-700">{note.description}</TableCell>
                      <TableCell className={`font-mono font-bold text-right ${note.type === 'DEBIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Rs. {note.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-600">{note.accountExecutive}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-semibold text-[10px]">
                          Unposted
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handlePost(note.id)}
                            disabled={actionId === note.id}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-md gap-1"
                          >
                            {actionId === note.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Post
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(note.id)}
                            disabled={actionId === note.id}
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
