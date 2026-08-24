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

export function GenerateInvoiceDialog({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [amount, setAmount] = React.useState<number | ''>('')
  const [description, setDescription] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')

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

    const res = await generateManualInvoice(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      setAmount('')
      setDescription('')
      setDueDate('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="bg-[#F58220] hover:bg-[#d96e14] text-white font-bold text-xs shadow-xs" />}>
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
            <Button type="submit" disabled={loading} className="bg-[#F58220] hover:bg-[#d96e14] text-white font-bold text-xs shadow-xs cursor-pointer">
              {loading ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
