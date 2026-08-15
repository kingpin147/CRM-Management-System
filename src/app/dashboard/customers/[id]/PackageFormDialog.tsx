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
      <DialogTrigger asChild>
        <Button className="w-full shadow-md">Create Quotation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-line max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-graphite)] font-display text-xl">Assign Service Package</DialogTitle>
          <DialogDescription className="text-[var(--color-slate-custom)]">
            Configure the O&M package and billing details.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="systemSizeKw" className="text-right text-[var(--color-ink)]">System Size</Label>
              <div className="col-span-3">
                <Select name="systemSizeKw" defaultValue="1-10 kW">
                  <SelectTrigger className="border-[var(--color-line)]">
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
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="packageTier" className="text-right text-[var(--color-ink)]">Tier</Label>
              <div className="col-span-3">
                <Select name="packageTier" defaultValue="Basic">
                  <SelectTrigger className="border-[var(--color-line)]">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billingType" className="text-right text-[var(--color-ink)]">Billing Cycle</Label>
              <div className="col-span-3">
                <Select name="billingType" defaultValue="Monthly">
                  <SelectTrigger className="border-[var(--color-line)]">
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
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monitoringTime" className="text-right text-[var(--color-ink)]">Monitoring</Label>
              <div className="col-span-3">
                <Select name="monitoringTime" defaultValue="12 Hours">
                  <SelectTrigger className="border-[var(--color-line)]">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12 Hours">12 Hours (Daytime)</SelectItem>
                    <SelectItem value="24 Hours">24 Hours (Round-the-clock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t border-line">
              <Label htmlFor="monthlyBasePrice" className="text-right text-[var(--color-ink)]">Base Price (PKR)</Label>
              <Input 
                id="monthlyBasePrice" 
                name="monthlyBasePrice" 
                type="number"
                required 
                className="col-span-3 border-[var(--color-line)]" 
                onChange={(e) => setBasePrice(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appliedDiscount" className="text-right text-[var(--color-ink)]">Discount (%)</Label>
              <div className="col-span-3">
                <Select name="appliedDiscount" defaultValue="0" onValueChange={(val) => setDiscount(Number(val))}>
                  <SelectTrigger className="border-[var(--color-line)]">
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

            <div className="bg-paper p-4 rounded-lg mt-2 border border-line flex justify-between items-center">
              <span className="font-medium text-[var(--color-slate-custom)]">Calculated Total:</span>
              <span className="text-xl font-bold text-[var(--color-graphite)]">
                PKR {(basePrice * (1 - discount / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Package'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
