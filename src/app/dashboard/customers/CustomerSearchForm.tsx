'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RotateCcw, Eye, SearchX, Loader2 } from 'lucide-react'

type CustomerRecord = {
  id: string
  customerCode: string
  crfNumber: string | null
  fullName: string
  contactNumber: string
  cnic: string
  email: string | null
  customerType: string
  status: string
  address: string
  city: string
  signupDate?: Date | string | null
}

type SearchState = 'idle' | 'loading' | 'done' | 'error'

export function CustomerSearchForm({
  canRegisterCustomer
}: {
  canRegisterCustomer: boolean
}) {
  const [customerCode, setCustomerCode]     = React.useState('')
  const [crfNumber, setCrfNumber]           = React.useState('')
  const [fullName, setFullName]             = React.useState('')
  const [contactNumber, setContactNumber]   = React.useState('')
  const [cnic, setCnic]                     = React.useState('')
  const [email, setEmail]                   = React.useState('')

  const [results, setResults]     = React.useState<CustomerRecord[]>([])
  const [searchState, setSearchState] = React.useState<SearchState>('idle')
  const [errorMsg, setErrorMsg]   = React.useState('')

  const handleReset = () => {
    setCustomerCode('')
    setCrfNumber('')
    setFullName('')
    setContactNumber('')
    setCnic('')
    setEmail('')
    setResults([])
    setSearchState('idle')
    setErrorMsg('')
  }

  const handleSearch = async () => {
    const params = new URLSearchParams()
    if (customerCode.trim())  params.set('customerCode',  customerCode.trim())
    if (crfNumber.trim())     params.set('crfNumber',     crfNumber.trim())
    if (fullName.trim())      params.set('fullName',      fullName.trim())
    if (contactNumber.trim()) params.set('contactNumber', contactNumber.trim())
    if (cnic.trim())          params.set('cnic',          cnic.trim())
    if (email.trim())         params.set('email',         email.trim())

    if (params.toString() === '') {
      setErrorMsg('Please enter at least one search criterion.')
      setSearchState('error')
      return
    }

    setSearchState('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/customers/search?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Search failed.')
      }
      const data: CustomerRecord[] = await res.json()
      setResults(data)
      setSearchState('done')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setSearchState('error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="space-y-6">
      {/* 6-Field Search Card */}
      <Card className="shadow-sm border-line bg-white">
        <CardHeader className="pb-4 border-b border-line">
          <div>
            <CardTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
              Customer Search Page
            </CardTitle>
            <CardDescription className="text-xs text-[var(--color-slate-custom)] mt-0.5">
              Filter registered customers by customer ID, CRF #, full name, contact, CNIC, or email.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              {/* Row 1: Customer ID & CRF # */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--color-graphite)] flex items-center gap-1">
                  Customer ID:
                </label>
                <Input
                  type="text"
                  placeholder="Enter Customer ID"
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your customer id</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--color-graphite)] flex items-center gap-1">
                  CRF #:
                </label>
                <Input
                  type="text"
                  placeholder="Enter your CRF #"
                  value={crfNumber}
                  onChange={(e) => setCrfNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your CRF #</p>
              </div>

              {/* Row 2: Full Name & Contact Number */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--color-graphite)] flex items-center gap-1">
                  Full Name:
                </label>
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your full name</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--color-graphite)] flex items-center gap-1">
                  Contact Number:
                </label>
                <Input
                  type="text"
                  placeholder="Enter contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your contact number</p>
              </div>

              {/* Row 3: CNIC & Email */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--color-graphite)] flex items-center gap-1">
                  CNIC:
                </label>
                <Input
                  type="text"
                  placeholder="cnic"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your cnic</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--color-graphite)] flex items-center gap-1">
                  Email:
                </label>
                <Input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your email</p>
              </div>

            </div>

            {/* Error message */}
            {searchState === 'error' && errorMsg && (
              <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2 text-xs cursor-pointer">
                <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
              </Button>
              <Button
                type="submit"
                className="gap-2 text-xs shadow-sm cursor-pointer"
                disabled={searchState === 'loading'}
              >
                {searchState === 'loading' ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…</>
                ) : (
                  <><Search className="h-3.5 w-3.5" /> Search Customer</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customer Results Table — only shown after a search */}
      {searchState !== 'idle' && (
        <Card className="shadow-sm border-line overflow-hidden">
          <CardHeader className="py-4 bg-[var(--color-paper)]/50 border-b border-line flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-[var(--color-graphite)]">
              {searchState === 'loading'
                ? 'Searching…'
                : `Search Results (${results.length})`}
            </CardTitle>
            <span className="text-xs text-[var(--color-slate-custom)] font-medium">
              Click &quot;View Profile&quot; to inspect customer details
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="font-bold text-xs">Customer ID</TableHead>
                  <TableHead className="font-bold text-xs">CRF #</TableHead>
                  <TableHead className="font-bold text-xs">Full Name</TableHead>
                  <TableHead className="font-bold text-xs">Contact Number</TableHead>
                  <TableHead className="font-bold text-xs">CNIC</TableHead>
                  <TableHead className="font-bold text-xs">Customer Type</TableHead>
                  <TableHead className="font-bold text-xs">Status</TableHead>
                  <TableHead className="text-right font-bold text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchState === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-xs text-[var(--color-slate-custom)]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching customers…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-xs text-[var(--color-slate-custom)]">
                      <div className="flex flex-col items-center gap-2">
                        <SearchX className="h-6 w-6 text-gray-300" />
                        No matching customers found. Adjust your search criteria above.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((c) => (
                    <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                        {c.customerCode?.replace(/\D/g, '') || c.customerCode}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-[var(--color-graphite)]">
                        {c.crfNumber || (c.customerCode ? `CRF-${c.customerCode.replace(/\D/g, '')}` : '—')}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-[var(--color-ink)]">
                        {c.fullName}
                        {c.email && <span className="block text-[11px] text-gray-400">{c.email}</span>}
                      </TableCell>
                      <TableCell className="text-xs">{c.contactNumber}</TableCell>
                      <TableCell className="font-mono text-xs text-[var(--color-slate-custom)]">{c.cnic}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="bg-white text-xs font-medium border-line">
                          {c.customerType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {(() => {
                          const st = c.status
                          let label = st?.replace(/_/g, ' ')
                          let style = 'bg-slate-100 text-slate-800 border-slate-200 text-xs font-semibold'
                          if (st === 'SIGNUP_GENERATED') {
                            label = 'Pending on Sales'
                            style = 'bg-amber-100 text-amber-950 border-amber-300 text-xs font-semibold'
                          } else if (st === 'PENDING_PAYMENT_VERIFICATION') {
                            label = 'Pending for Payment Verification'
                            style = 'bg-blue-100 text-blue-950 border-blue-300 text-xs font-semibold'
                          } else if (st === 'PENDING_ACTIVATION') {
                            label = 'Pending for O&M'
                            style = 'bg-sky-100 text-sky-950 border-sky-300 text-xs font-semibold'
                          } else if (st === 'CONNECTION_ACTIVE') {
                            label = 'Active'
                            style = 'bg-[#002868] text-white border-[#002868] text-xs font-semibold'
                          } else if (st === 'TEMPORARY_BLOCKED') {
                            label = 'Temporary Blocked'
                            style = 'bg-amber-100 text-amber-900 border-amber-300 text-xs font-semibold'
                          } else if (st === 'PERMANENT_DISCONNECTION') {
                            label = 'Terminated'
                            style = 'bg-rose-100 text-rose-800 border-rose-200 text-xs font-semibold'
                          }
                          return (
                            <Badge variant="outline" className={style}>
                              {label}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/customers/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-[var(--color-amber)] hover:text-[var(--color-ink)]">
                            <Eye className="h-3.5 w-3.5" /> View Profile
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
