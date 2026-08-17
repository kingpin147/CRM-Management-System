'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
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
import { recordPayment } from './actions'

export function RecordPaymentDialog({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [amount, setAmount] = React.useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = React.useState('Bank Transfer')
  const [reference, setReference] = React.useState('')
  const [narration, setNarration] = React.useState('Monthly O&M Subscription Payment')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('customerId', customerId)
    formData.append('amount', String(amount))
    formData.append('paymentMethod', paymentMethod)
    formData.append('reference', reference || 'TX-' + Math.floor(100000 + Math.random() * 900000))
    formData.append('narration', narration)

    const res = await recordPayment(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      setAmount('')
      setReference('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs shadow-xs" />}>
        + Record Payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6">
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-[var(--color-line)]">
          <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
            Record Customer Payment
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Credit a received payment to the customer ledger and generate a receipt transaction.
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
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Amount (PKR) *</Label>
              <Input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="e.g. 15000"
                className="border-[var(--color-line)] text-base font-semibold focus-visible:ring-[var(--color-amber)] bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)]"
              >
                <option value="Bank Transfer">Bank Transfer (IBFT)</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Transaction Ref #</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. FT260816991"
                className="border-[var(--color-line)] text-xs bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Narration / Remarks</Label>
              <Input
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="e.g. O&M invoice settlement for August 2026"
                className="border-[var(--color-line)] text-xs bg-white"
              />
            </div>
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
            <Button type="submit" disabled={loading} className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs shadow-xs cursor-pointer">
              {loading ? 'Recording...' : 'Credit Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
