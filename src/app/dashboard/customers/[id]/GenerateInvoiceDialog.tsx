'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
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
import { generateManualInvoice } from './actions'

export function GenerateInvoiceDialog({ customerId, packagePlan }: { customerId: string; packagePlan?: any }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [amount, setAmount] = React.useState<number | ''>('')
  const [description, setDescription] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [salesTax, setSalesTax] = React.useState<number>(0)
  const [billingPeriod, setBillingPeriod] = React.useState<string>('')
  const [newNextBillingDate, setNewNextBillingDate] = React.useState<string>('')
  const [isProratedMode, setIsProratedMode] = React.useState(false)

  // Calculate mid-month proration if nextBillingDate exists and does not start on the 1st
  const nextBilling = packagePlan?.nextBillingDate ? new Date(packagePlan.nextBillingDate) : null
  const isMidMonthNextBilling = Boolean(nextBilling && !isNaN(nextBilling.getTime()) && nextBilling.getDate() !== 1)

  let proratedDays = 0
  let proratedAmount = 0
  let proratedTax = 0
  let proratedTotal = 0
  let proratedStartDateStr = ''
  let proratedEndDateStr = ''
  let nextCycleDateStr = ''

  if (isMidMonthNextBilling && nextBilling) {
    const endOfMonth = new Date(nextBilling.getFullYear(), nextBilling.getMonth() + 1, 0)
    proratedDays = (endOfMonth.getDate() - nextBilling.getDate()) + 1
    const daysInMonth = endOfMonth.getDate()
    const monthlyBase = Number(packagePlan?.monthlyBasePrice) || 0
    const monthlyTax = Number(packagePlan?.salesTaxAmount) || 0

    proratedAmount = Math.round((monthlyBase / daysInMonth) * proratedDays)
    proratedTax = Math.round((monthlyTax / daysInMonth) * proratedDays) || Math.round(proratedAmount * 0.05)
    proratedTotal = proratedAmount + proratedTax

    const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    proratedStartDateStr = `${nextBilling.getDate()} ${monthShorts[nextBilling.getMonth()]} ${nextBilling.getFullYear()}`
    proratedEndDateStr = `${endOfMonth.getDate()} ${monthShorts[endOfMonth.getMonth()]} ${endOfMonth.getFullYear()}`

    const nextCycle = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth() + 1, 1)
    nextCycleDateStr = nextCycle.toISOString().slice(0, 10)
  }

  function applyProratedFill() {
    if (!nextBilling) return
    setAmount(proratedTotal)
    setSalesTax(proratedTax)
    setDescription(`Prorated O&M Invoice (${proratedDays} days: ${proratedStartDateStr} to ${proratedEndDateStr})`)
    setDueDate(nextBilling.toISOString().slice(0, 10))
    setBillingPeriod(nextBilling.toISOString().slice(0, 10))
    setNewNextBillingDate(nextCycleDateStr)
    setIsProratedMode(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('customerId', customerId)
    formData.append('amount', String(amount))
    formData.append('description', description || 'Manual Charge')
    if (dueDate) {
      formData.append('dueDate', dueDate)
    }
    if (salesTax > 0) {
      formData.append('salesTax', String(salesTax))
    }
    if (billingPeriod) {
      formData.append('billingPeriod', billingPeriod)
    }
    if (newNextBillingDate) {
      formData.append('newNextBillingDate', newNextBillingDate)
    }

    const res = await generateManualInvoice(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      setAmount('')
      setDescription('')
      setDueDate('')
      setSalesTax(0)
      setBillingPeriod('')
      setNewNextBillingDate('')
      setIsProratedMode(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs shadow-xs" />}>
        + Generate Invoice
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6">
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-[var(--color-line)]">
          <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
            Generate Manual Invoice
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Create an invoice to charge the customer. This will increase their pending balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {isMidMonthNextBilling && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span>⚡ Mid-Month Billing Proration</span>
                  <span className="bg-amber-200/90 text-amber-900 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    {proratedDays} Days ({proratedStartDateStr} to {proratedEndDateStr})
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1">
                  Charges {proratedDays} days (PKR {proratedTotal.toLocaleString()}) from Next Billing Date to align cycle to 1st of the month.
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={applyProratedFill}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
              >
                Auto-Fill ({proratedDays} Days)
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Invoice Amount (PKR) *</Label>
              <Input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="e.g. 5000"
                className="border-[var(--color-line)] text-base font-semibold focus-visible:ring-[var(--color-amber)] bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Due Date (Optional)</Label>
              <DateInput
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-[var(--color-line)] text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-ink)]">Description / Reason *</Label>
            <Input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Equipment Repair Fee / Additional Solar Panel Service"
              className="border-[var(--color-line)] text-xs focus-visible:ring-[var(--color-amber)] bg-white"
            />
          </div>

          <DialogFooter className="pt-3 flex justify-end gap-2 border-t border-[var(--color-line)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs shadow-xs cursor-pointer">
              {loading ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
