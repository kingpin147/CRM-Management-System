'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Customer, CustomerStatus, CustomerType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateCustomer } from './actions'
import { AutoSuggestInput } from '@/components/ui/auto-suggest-input'
import { CITIES_LIST, getAreasForCity } from '@/lib/pakistan-cities-areas'

export function EditCustomerDialog({ customer }: { customer: Customer }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [fullName, setFullName] = React.useState(customer.fullName || '')
  const [contactNumber, setContactNumber] = React.useState(customer.contactNumber || '')
  const [pocNumber, setPocNumber] = React.useState((customer as any).pocNumber || '')
  const [email, setEmail] = React.useState(customer.email || '')
  const [cnic, setCnic] = React.useState(customer.cnic || '')
  const [customerType, setCustomerType] = React.useState<string>(customer.customerType)
  const [status, setStatus] = React.useState<string>(customer.status)
  const [address, setAddress] = React.useState(customer.address || '')
  const [city, setCity] = React.useState(customer.city || '')
  const [houseNumber, setHouseNumber] = React.useState(customer.houseNumber || '')
  const [streetNumber, setStreetNumber] = React.useState(customer.streetNumber || '')
  const [block, setBlock] = React.useState(customer.block || '')
  const [area, setArea] = React.useState(customer.area || '')
  const [coordinates, setCoordinates] = React.useState(customer.coordinates || '')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('customerId', customer.id)
    formData.append('fullName', fullName)
    formData.append('contactNumber', contactNumber)
    formData.append('pocNumber', pocNumber)
    formData.append('email', email)
    formData.append('cnic', cnic)
    formData.append('customerType', customerType)
    formData.append('status', status)
    formData.append('address', address)
    formData.append('city', city)
    formData.append('houseNumber', houseNumber)
    formData.append('streetNumber', streetNumber)
    formData.append('block', block)
    formData.append('area', area)
    formData.append('coordinates', coordinates)

    const res = await updateCustomer(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to permanently delete customer ${customer.fullName}? This cannot be undone.`)) {
      return
    }

    setLoading(true)
    const { deleteCustomer } = await import('./actions')
    const res = await deleteCustomer(customer.id)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      router.push('/dashboard/customers')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs shadow-xs" size="sm" />}>
        Edit Profile
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-[var(--color-line)]">
          <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
            Edit Customer Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Update personal details, contact info, and subscription status for <strong className="text-[var(--color-graphite)]">{customer.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-3">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* 2-Column Horizontal Desktop Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Personal Details & Status */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
                1. Personal & Account Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--color-ink)]">Full Name *</Label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--color-ink)]">Contact Number *</Label>
                  <Input
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--color-ink)]">POC Number</Label>
                  <Input
                    value={pocNumber}
                    onChange={(e) => setPocNumber(e.target.value)}
                    className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--color-ink)]">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--color-ink)]">CNIC *</Label>
                  <Input
                    required
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)] bg-white"
                  />
                </div>
              </div>

              {/* Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--color-ink)]">Customer Type</Label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                  >
                    <option value={CustomerType.RESIDENTIAL}>Residential</option>
                    <option value={CustomerType.CORPORATE}>Corporate</option>
                    <option value={CustomerType.INDUSTRIAL}>Industrial</option>
                    <option value={CustomerType.TEMPORARY_BLOCKED}>Temporary Blocked</option>
                    <option value={CustomerType.TERMINATED}>Terminated</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--color-ink)]">Customer Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                  >
                    <option value={CustomerStatus.SIGNUP_GENERATED}>Pending on Sales</option>
                    <option value={CustomerStatus.PENDING_PAYMENT_VERIFICATION}>Pending for Payment Verification</option>
                    <option value={CustomerStatus.PENDING_ACTIVATION}>Pending for O&M</option>
                    <option value={CustomerStatus.CONNECTION_ACTIVE}>Active</option>
                    <option value={CustomerStatus.NON_PAYMENT_BLOCKED}>Non-Payment Blocked</option>
                    <option value={CustomerStatus.TEMPORARY_BLOCKED}>Temporary Blocked</option>
                    <option value={CustomerStatus.PERMANENT_DISCONNECTION}>Terminated</option>
                    <option value={CustomerStatus.FOC_CONNECTION}>FOC Connection</option>
                    <option value={CustomerStatus.IN_HOUSE_CONNECTION}>In-House Connection</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Address Details */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
                2. Address & Location
              </h4>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Full Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[var(--color-ink)]">House #</Label>
                  <Input
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="h-9 text-xs border-[var(--color-line)] bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[var(--color-ink)]">Street #</Label>
                  <Input
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    className="h-9 text-xs border-[var(--color-line)] bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[var(--color-ink)]">Block/Sector</Label>
                  <Input
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="h-9 text-xs border-[var(--color-line)] bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[var(--color-ink)]">City *</Label>
                  <AutoSuggestInput
                    value={city}
                    onChange={setCity}
                    options={CITIES_LIST}
                    placeholder="Select city..."
                    className="h-9 text-xs border-[var(--color-line)] bg-white font-semibold"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-[11px] font-semibold text-[var(--color-ink)]">Area / Society</Label>
                  <AutoSuggestInput
                    value={area}
                    onChange={setArea}
                    options={getAreasForCity(city)}
                    placeholder="Select or type area/society..."
                    className="h-9 text-xs border-[var(--color-line)] bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-amber-950">GPS Coordinates / Google Maps Link</Label>
                    {coordinates && (
                      <a
                        href={
                          coordinates.startsWith('http')
                            ? coordinates
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline"
                      >
                        Test Map ↗
                      </a>
                    )}
                  </div>
                  <Input
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="e.g. 31.4707, 74.4101 or Google Maps URL"
                    className="h-9 text-xs border-amber-300 font-mono bg-white focus-visible:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 flex justify-between items-center border-t border-[var(--color-line)]">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="text-xs font-bold cursor-pointer"
            >
              Delete Customer
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#002868] hover:bg-[#001d4a] text-white shadow-md text-xs font-bold cursor-pointer">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
