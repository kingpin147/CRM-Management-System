'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SYSTEM_SIZES } from '@/lib/solar-constants'
import { calculatePackageBreakdown } from '@/lib/pricing'
import { createPackagePlan } from './actions'

export function PackageFormDialog({ customerId, initialData, inline = false }: { customerId: string; initialData?: any; inline?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // State for form fields - starting empty with placeholder text unless initialData is provided
  const [systemSizeKw, setSystemSizeKw] = useState(initialData?.systemSizeKw || '')
  const [packageTier, setPackageTier] = useState(initialData?.packageTier || '')
  const [monitoringTime, setMonitoringTime] = useState(initialData?.monitoringTime || '')
  const [billingType, setBillingType] = useState(initialData?.billingType || '')
  const [basePrice, setBasePrice] = useState<number | ''>(initialData?.monthlyBasePrice ?? '')
  const [discount, setDiscount] = useState<number | ''>(initialData?.appliedDiscount ?? '')

  useEffect(() => {
    if (systemSizeKw && packageTier && monitoringTime && billingType && !initialData) {
      const b = calculatePackageBreakdown(systemSizeKw, packageTier, billingType, monitoringTime)
      setBasePrice(b.baseMonthlyRate)
      setDiscount(b.discountPct)
    }
  }, [systemSizeKw, packageTier, monitoringTime, billingType, initialData])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    formData.append('customerId', customerId)
    if (systemSizeKw) formData.set('systemSizeKw', systemSizeKw)
    if (packageTier) formData.set('packageTier', packageTier)
    if (monitoringTime) formData.set('monitoringTime', monitoringTime)
    if (billingType) formData.set('billingType', billingType)
    if (basePrice !== '') formData.set('monthlyBasePrice', String(basePrice))
    if (discount !== '') formData.set('appliedDiscount', String(discount))

    const result = await createPackagePlan(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setOpen(false)
      router.refresh()
    }
  }

  const calcPrice = typeof basePrice === 'number' ? basePrice : 0
  const calcDisc = typeof discount === 'number' ? discount : 0
  const calculatedAmount = calcPrice * (1 - calcDisc / 100)

  const formContent = (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium">
          ✓ Solar Package Plan saved and activated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Package Configuration */}
        <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
            1. PLAN SPECIFICATIONS
          </h4>

          <div className="space-y-1.5">
            <Label htmlFor="systemSizeKw" className="text-xs font-semibold text-[var(--color-ink)]">System Size</Label>
            <Select name="systemSizeKw" value={systemSizeKw} onValueChange={setSystemSizeKw}>
              <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                <SelectValue placeholder="Select System Size" />
              </SelectTrigger>
              <SelectContent>
                {SYSTEM_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="packageTier" className="text-xs font-semibold text-[var(--color-ink)]">Package Tier</Label>
            <Select name="packageTier" value={packageTier} onValueChange={setPackageTier}>
              <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                <SelectValue placeholder="Select Package Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monitoringTime" className="text-xs font-semibold text-[var(--color-ink)]">Monitoring Window</Label>
            <Select name="monitoringTime" value={monitoringTime} onValueChange={setMonitoringTime}>
              <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                <SelectValue placeholder="Select Monitoring Window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12 Hours">12 Hours (Daytime)</SelectItem>
                <SelectItem value="24 Hours">24 Hours (Round-the-clock)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column: Pricing & Discount */}
        <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
              2. PRICING & BILLING CYCLE
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="billingType" className="text-xs font-semibold text-[var(--color-ink)]">Billing Cycle</Label>
              <Select name="billingType" value={billingType} onValueChange={setBillingType}>
                <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                  <SelectValue placeholder="Select Billing Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Half Yearly">Half Yearly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                  <SelectItem value="FOC">FOC (Free of Cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="monthlyBasePrice" className="text-xs font-semibold text-[var(--color-ink)]">Subscription Price (PKR)</Label>
              <Input 
                id="monthlyBasePrice" 
                name="monthlyBasePrice" 
                type="number"
                value={basePrice}
                placeholder="Enter subscription price (e.g. 50000)"
                required 
                className="border-[var(--color-line)] bg-white" 
                onChange={(e) => setBasePrice(e.target.value !== '' ? Number(e.target.value) : '')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appliedDiscount" className="text-xs font-semibold text-[var(--color-ink)]">Discount (%)</Label>
              <Select name="appliedDiscount" value={discount !== '' ? String(discount) : ''} onValueChange={(val) => setDiscount(val !== '' ? Number(val) : '')}>
                <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                  <SelectValue placeholder="Select Discount (%)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="100">100% (FOC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs mt-2">
            <span className="font-semibold text-xs text-[var(--color-slate-custom)]">Calculated Amount:</span>
            <span className="text-lg font-black text-[#002868]">
              PKR {calculatedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-line)]">
        <Button type="submit" disabled={loading} className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs px-6 shadow-xs cursor-pointer">
          {loading ? 'Saving...' : 'Save & Activate Plan'}
        </Button>
      </div>
    </form>
  )

  if (inline) {
    return formContent
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full shadow-md bg-[#002868] hover:bg-[#001d4a] text-white font-bold">Create Quotation</Button>} />
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl border-line max-h-[90vh] overflow-y-auto bg-white p-6">
        <DialogHeader className="pb-2 border-b border-[var(--color-line)]">
          <DialogTitle className="text-[var(--color-graphite)] font-display text-xl">Assign Service Package</DialogTitle>
          <DialogDescription className="text-[var(--color-slate-custom)]">
            Configure the O&M package and billing details.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-3">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  )
}
