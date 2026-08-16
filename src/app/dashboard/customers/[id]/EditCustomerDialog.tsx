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

export function EditCustomerDialog({ customer }: { customer: Customer }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [fullName, setFullName] = React.useState(customer.fullName || '')
  const [contactNumber, setContactNumber] = React.useState(customer.contactNumber || '')
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('customerId', customer.id)
    formData.append('fullName', fullName)
    formData.append('contactNumber', contactNumber)
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

    const res = await updateCustomer(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="border-[var(--color-line)] bg-white shadow-sm hover:bg-[var(--color-paper)]" />}>
        Edit Profile
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px] bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
            Edit Customer Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Update personal details, contact info, and subscription status for <strong className="text-[var(--color-graphite)]">{customer.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Personal & Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Full Name *</Label>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Contact Number *</Label>
              <Input
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">CNIC *</Label>
              <Input
                required
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)]"
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
                <option value={CustomerStatus.SIGNUP_GENERATED}>Signup Generated</option>
                <option value={CustomerStatus.PENDING_PAYMENT_VERIFICATION}>Pending Payment Verification</option>
                <option value={CustomerStatus.PENDING_ACTIVATION}>Pending Activation</option>
                <option value={CustomerStatus.CONNECTION_ACTIVE}>Connection Active</option>
                <option value={CustomerStatus.NON_PAYMENT_BLOCKED}>Non-Payment Blocked</option>
                <option value={CustomerStatus.TEMPORARY_BLOCKED}>Temporary Blocked</option>
                <option value={CustomerStatus.PERMANENT_DISCONNECTION}>Permanent Disconnection</option>
                <option value={CustomerStatus.FOC_CONNECTION}>FOC Connection</option>
                <option value={CustomerStatus.IN_HOUSE_CONNECTION}>In-House Connection</option>
              </select>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-3 pt-1 border-t border-[var(--color-line)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate-custom)] pt-2">Address Details</h4>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Full Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border-[var(--color-line)] focus-visible:ring-[var(--color-amber)]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[var(--color-ink)]">House #</Label>
                <Input
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[var(--color-ink)]">Street #</Label>
                <Input
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[var(--color-ink)]">Block/Sector</Label>
                <Input
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[var(--color-ink)]">City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 flex justify-end gap-2 border-t border-[var(--color-line)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-[var(--color-line)] text-[var(--color-ink)]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="shadow-md">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
