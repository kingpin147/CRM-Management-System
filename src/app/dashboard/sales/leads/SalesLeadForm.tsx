'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/section-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createSalesLead } from './actions'
import { PAKISTAN_CITIES_AREAS } from '@/lib/pakistan-cities-areas'
import { ShoppingBag, ArrowRight, CheckCircle2, User, Phone, MapPin, Sun, Globe, AlertCircle, Eye } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const SOURCE_OPTIONS = [
  { value: 'Email', label: 'Email' },
  { value: 'Whatsapp', label: 'Whatsapp' },
  { value: 'Website', label: 'Website' },
  { value: 'Customer Support', label: 'Customer Support' },
]

const SYSTEM_SIZES = [
  '3 kW',
  '5 kW',
  '6 kW',
  '10 kW',
  '12 kW',
  '15 kW',
  '20 kW',
  '25 kW',
  '30 kW',
  '30+ kW',
  '1-10 kW',
  '10-20 kW',
  '20-30 kW',
]

export function SalesLeadForm({ recentLeads = [] }: { recentLeads?: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successInfo, setSuccessInfo] = React.useState<{
    customerId: string
    customerCode: string
    ticketId: string
    ticketNumber: string
    customerName: string
  } | null>(null)

  // Form State
  const [fullName, setFullName] = React.useState('')
  const [contactNumber, setContactNumber] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [solarSystemSize, setSolarSystemSize] = React.useState('10 kW')
  const [city, setCity] = React.useState('Lahore')
  const [sourceOfLead, setSourceOfLead] = React.useState('Website')

  const citiesList = React.useMemo(() => {
    return Object.keys(PAKISTAN_CITIES_AREAS).sort()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessInfo(null)

    if (!fullName.trim() || !contactNumber.trim() || !address.trim()) {
      setError('Please fill in all required fields (Customer Name, Contact #, and Address).')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('contactNumber', contactNumber)
    formData.append('address', address)
    formData.append('solarSystemSize', solarSystemSize)
    formData.append('city', city)
    formData.append('sourceOfLead', sourceOfLead)

    const res = await createSalesLead(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccessInfo({
        customerId: res.customerId!,
        customerCode: res.customerCode!,
        ticketId: res.ticketId!,
        ticketNumber: res.ticketNumber!,
        customerName: fullName,
      })
      setFullName('')
      setContactNumber('')
      setAddress('')
      setSolarSystemSize('10 kW')
      setCity('Lahore')
      setSourceOfLead('Website')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002868] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            Sales Lead Create
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new inquiries &amp; sales leads. After submission, a ticket is automated assigned to <strong>Sales</strong> and recorded in <strong>Complaints</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/tickets">
            <Button variant="outline" size="sm" className="text-xs font-semibold border-slate-300">
              <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
              View Complaints &amp; Support
            </Button>
          </Link>
          <Link href="/dashboard/customers">
            <Button variant="outline" size="sm" className="text-xs font-semibold border-slate-300">
              <User className="w-3.5 h-3.5 mr-1 text-[#002868]" />
              Customer Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Banner */}
      {successInfo && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Sales Lead Successfully Created!</span>
            </div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-400 font-bold">
              Automated Assigned to Sales
            </Badge>
          </div>
          <p className="text-xs text-emerald-800">
            Customer <strong>{successInfo.customerName}</strong> (ID: <strong>{successInfo.customerCode}</strong>) has been registered. Ticket <strong>{successInfo.ticketNumber}</strong> was automatically logged and assigned to the Sales Department.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link href={`/dashboard/customers/${successInfo.customerId}?tab=complaints`}>
              <Button size="sm" className="bg-[#002868] hover:bg-[#001d4a] text-white text-xs font-semibold h-8">
                View in Complaints Tab
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link href={`/dashboard/customers/${successInfo.customerId}`}>
              <Button size="sm" variant="outline" className="text-xs font-semibold h-8 border-emerald-400 text-emerald-900 hover:bg-emerald-100">
                Open Customer Profile
              </Button>
            </Link>
            <Link href="/dashboard/tickets?status=PENDING">
              <Button size="sm" variant="outline" className="text-xs font-semibold h-8 border-emerald-400 text-emerald-900 hover:bg-emerald-100">
                All Pending Complaints Queue
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="shadow-sm border-line overflow-hidden bg-white">
        <SectionHeader>
          Sales Lead Information Entry
        </SectionHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Form Table Layout matching prompt screenshot */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-100/90 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-[#002868] w-1/6 border-r">Customer Name *</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] w-1/6 border-r">Contact # *</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] w-2/6 border-r">Address *</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] w-1/6 border-r">Solar System Size</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] w-1/6 border-r">City</TableHead>
                    <TableHead className="font-bold text-xs text-[#002868] w-1/6">Source Of Lead</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-transparent">
                    {/* Customer Name */}
                    <TableCell className="p-2.5 border-r border-slate-200 align-top">
                      <Input
                        type="text"
                        placeholder="e.g. Tariq Mehmood"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="text-xs font-medium h-9 border-slate-300 focus-visible:ring-[#002868]"
                        required
                      />
                    </TableCell>

                    {/* Contact # */}
                    <TableCell className="p-2.5 border-r border-slate-200 align-top">
                      <Input
                        type="text"
                        placeholder="e.g. 03211234567"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="text-xs font-mono font-medium h-9 border-slate-300 focus-visible:ring-[#002868]"
                        required
                      />
                    </TableCell>

                    {/* Address */}
                    <TableCell className="p-2.5 border-r border-slate-200 align-top">
                      <Input
                        type="text"
                        placeholder="e.g. House 45, Street 12, Phase 5 DHA"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="text-xs font-medium h-9 border-slate-300 focus-visible:ring-[#002868]"
                        required
                      />
                    </TableCell>

                    {/* Solar System Size */}
                    <TableCell className="p-2.5 border-r border-slate-200 align-top">
                      <select
                        value={solarSystemSize}
                        onChange={(e) => setSolarSystemSize(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002868]"
                      >
                        {SYSTEM_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    {/* City */}
                    <TableCell className="p-2.5 border-r border-slate-200 align-top">
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002868]"
                      >
                        {citiesList.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    {/* Source Of Lead */}
                    <TableCell className="p-2.5 align-top">
                      <select
                        value={sourceOfLead}
                        onChange={(e) => setSourceOfLead(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-[#002868]"
                      >
                        {SOURCE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Lead will generate a customer account &amp; assign a high-priority ticket directly to Sales.</span>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs px-8 h-10 shadow-xs w-full sm:w-auto"
              >
                {loading ? 'Creating Sales Lead...' : 'Submit & Create Lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Leads / Sales Inquiries Table */}
      {recentLeads && recentLeads.length > 0 && (
        <Card className="shadow-sm border-line overflow-hidden bg-white">
          <SectionHeader>
            Recently Created Sales Leads
          </SectionHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-xs text-[#002868]">Customer Code</TableHead>
                  <TableHead className="font-bold text-xs text-[#002868]">Customer Name</TableHead>
                  <TableHead className="font-bold text-xs text-[#002868]">Contact #</TableHead>
                  <TableHead className="font-bold text-xs text-[#002868]">City</TableHead>
                  <TableHead className="font-bold text-xs text-[#002868]">System Size</TableHead>
                  <TableHead className="font-bold text-xs text-[#002868]">Lead Source</TableHead>
                  <TableHead className="font-bold text-xs text-[#002868]">Created Date</TableHead>
                  <TableHead className="font-bold text-xs text-[#002868] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 border-b text-xs">
                    <TableCell className="font-mono font-bold text-slate-800">{item.customerCode}</TableCell>
                    <TableCell className="font-bold text-slate-900">{item.fullName}</TableCell>
                    <TableCell className="font-mono text-slate-700">{item.contactNumber}</TableCell>
                    <TableCell className="text-slate-700">{item.city}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-sky-50 text-sky-900 border-sky-300 font-semibold">
                        {item.packagePlan?.systemSizeKw || item.solarSystem?.inverterSize || '10 kW'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-semibold">
                        {item.tickets?.[0]?.source || 'Website'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-slate-600">{formatDateTime(item.createdAt || item.signupDate)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/customers/${item.id}?tab=complaints`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs font-semibold hover:bg-slate-100">
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-600" />
                          View Complaints
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
