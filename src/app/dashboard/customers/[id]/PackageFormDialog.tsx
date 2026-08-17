'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPackagePlan } from './actions'

export function PackageFormDialog({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quick calculator state for UI preview
  const [basePrice, setBasePrice] = useState(0)
  const [discount, setDiscount] = useState(0)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.append('customerId', customerId)

    const result = await createPackagePlan(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      router.refresh()
    }
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
        <form action={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Package Configuration */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
                1. Plan Specifications
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="systemSizeKw" className="text-xs font-semibold text-[var(--color-ink)]">System Size</Label>
                <Select name="systemSizeKw" defaultValue="1-10 kW">
                  <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10 kW">1-10 kW</SelectItem>
                    <SelectItem value="10-20 kW">10-20 kW</SelectItem>
                    <SelectItem value="20-30 kW">20-30 kW</SelectItem>
                    <SelectItem value="30+ kW">30+ kW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="packageTier" className="text-xs font-semibold text-[var(--color-ink)]">Tier</Label>
                <Select name="packageTier" defaultValue="Basic">
                  <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                    <SelectValue placeholder="Select tier" />
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
                <Select name="monitoringTime" defaultValue="12 Hours">
                  <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                    <SelectValue placeholder="Select time" />
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
                  2. Pricing & Cycle
                </h4>

                <div className="space-y-1.5">
                  <Label htmlFor="billingType" className="text-xs font-semibold text-[var(--color-ink)]">Billing Cycle</Label>
                  <Select name="billingType" defaultValue="Monthly">
                    <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                      <SelectValue placeholder="Select billing" />
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
                  <Label htmlFor="monthlyBasePrice" className="text-xs font-semibold text-[var(--color-ink)]">Base Price (PKR)</Label>
                  <Input 
                    id="monthlyBasePrice" 
                    name="monthlyBasePrice" 
                    type="number"
                    required 
                    className="border-[var(--color-line)] bg-white" 
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="appliedDiscount" className="text-xs font-semibold text-[var(--color-ink)]">Discount (%)</Label>
                  <Select name="appliedDiscount" defaultValue="0" onValueChange={(val) => setDiscount(Number(val))}>
                    <SelectTrigger className="border-[var(--color-line)] bg-white w-full">
                      <SelectValue placeholder="Select discount" />
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
                <span className="font-semibold text-xs text-[var(--color-slate-custom)]">Calculated Total:</span>
                <span className="text-lg font-black text-[#002868]">
                  PKR {(basePrice * (1 - discount / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 flex justify-end gap-2 border-t border-[var(--color-line)]">
            <Button type="button" variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs cursor-pointer">{loading ? 'Saving...' : 'Save Package'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
