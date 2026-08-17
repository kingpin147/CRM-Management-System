'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RotateCcw, Eye, Plus } from 'lucide-react'

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

export function CustomerSearchForm({ 
  customers, 
  canRegisterCustomer 
}: { 
  customers: CustomerRecord[]
  canRegisterCustomer: boolean 
}) {
  const [customerCode, setCustomerCode] = React.useState('')
  const [crfNumber, setCrfNumber] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [contactNumber, setContactNumber] = React.useState('')
  const [cnic, setCnic] = React.useState('')
  const [email, setEmail] = React.useState('')

  const handleReset = () => {
    setCustomerCode('')
    setCrfNumber('')
    setFullName('')
    setContactNumber('')
    setCnic('')
    setEmail('')
  }

  const filteredCustomers = React.useMemo(() => {
    return customers.filter(c => {
      if (customerCode.trim() && !c.customerCode.toLowerCase().includes(customerCode.trim().toLowerCase())) {
        return false
      }
      if (crfNumber.trim() && (!c.crfNumber || !c.crfNumber.toLowerCase().includes(crfNumber.trim().toLowerCase()))) {
        return false
      }
      if (fullName.trim() && !c.fullName.toLowerCase().includes(fullName.trim().toLowerCase())) {
        return false
      }
      if (contactNumber.trim() && !c.contactNumber.includes(contactNumber.trim())) {
        return false
      }
      if (cnic.trim() && !c.cnic.toLowerCase().includes(cnic.trim().toLowerCase())) {
        return false
      }
      if (email.trim() && (!c.email || !c.email.toLowerCase().includes(email.trim().toLowerCase()))) {
        return false
      }
      return true
    })
  }, [customers, customerCode, crfNumber, fullName, contactNumber, cnic, email])

  return (
    <div className="space-y-6">
      {/* 6-Field Search Card matching Image 1 layout */}
      <Card className="shadow-sm border-line bg-white">
        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-line">
          <div>
            <CardTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
              Customer Search Page
            </CardTitle>
            <CardDescription className="text-xs text-[var(--color-slate-custom)] mt-0.5">
              Filter registered customers by code, CRF #, full name, contact, CNIC, or email.
            </CardDescription>
          </div>
          {canRegisterCustomer && (
            <Link href="/dashboard/customers/new">
              <Button size="sm" className="gap-2 shadow-xs">
                <Plus className="h-4 w-4" /> Create Sale / Customer
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Row 1: Customer Code & CRF # */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[var(--color-graphite)] flex items-center gap-1">
                  Customer Code:
                </label>
                <Input
                  type="text"
                  placeholder="Enter Customer Code"
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value)}
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your customer code</p>
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
                  className="bg-white border-line text-sm focus-visible:ring-[var(--color-amber)] placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-400">Please enter your email</p>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2 text-xs cursor-pointer">
                <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
              </Button>
              <Button type="button" className="gap-2 text-xs shadow-sm cursor-pointer">
                <Search className="h-3.5 w-3.5" /> Search Customer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customer Results Table */}
      <Card className="shadow-sm border-line overflow-hidden">
        <CardHeader className="py-4 bg-[var(--color-paper)]/50 border-b border-line flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-[var(--color-graphite)]">
            Search Results ({filteredCustomers.length})
          </CardTitle>
          <span className="text-xs text-[var(--color-slate-custom)] font-medium">
            Click &quot;View Profile&quot; to inspect customer details
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs">Customer Code</TableHead>
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
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-[var(--color-slate-custom)]">
                    No matching customers found. Adjust your search criteria above.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow key={c.id} className="hover:bg-[var(--color-paper)]/40 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                      {c.customerCode}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-[var(--color-graphite)]">
                      {c.crfNumber || '—'}
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
                      <Badge 
                        variant="outline"
                        className={
                          c.status === 'CONNECTION_ACTIVE'
                            ? 'bg-[#002868] text-white border-[#002868] text-xs font-medium'
                            : c.status === 'TEMPORARY_BLOCKED'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 text-xs font-medium'
                            : c.status === 'PERMANENT_DISCONNECTION'
                            ? 'bg-rose-100 text-rose-800 border-rose-200 text-xs font-medium'
                            : 'bg-slate-100 text-slate-800 border-slate-200 text-xs font-medium'
                        }
                      >
                        {c.status?.replace(/_/g, ' ')}
                      </Badge>
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
    </div>
  )
}
