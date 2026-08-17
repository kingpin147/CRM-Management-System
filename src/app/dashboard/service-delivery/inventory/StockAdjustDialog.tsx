'use client'

import React, { useState } from 'react'
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
import { adjustStockQuantity } from './actions'
import { ArrowUpDown, PlusCircle, MinusCircle, BookmarkPlus, AlertCircle } from 'lucide-react'

export function StockAdjustDialog({ item }: { item: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [changeType, setChangeType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ALLOCATE' | 'DEALLOCATE'>('STOCK_IN')
  const [quantity, setQuantity] = useState('1')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('itemId', item.id)
    formData.append('changeType', changeType)
    formData.append('quantity', quantity)
    formData.append('reference', reference)
    formData.append('notes', notes)

    const res = await adjustStockQuantity(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      setQuantity('1')
      setReference('')
      setNotes('')
      router.refresh()
    }
  }

  const getTitle = () => {
    switch (changeType) {
      case 'STOCK_IN': return 'Stock In (Receive Shipment / Purchase)'
      case 'STOCK_OUT': return 'Stock Out (Dispatch / Damage / Sale)'
      case 'ALLOCATE': return 'Allocate to Customer Project'
      case 'DEALLOCATE': return 'Release Project Allocation'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-600 hover:text-[#002868] hover:bg-slate-100 rounded-md" />}>
        <ArrowUpDown className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 border-line max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-[#002868] px-6 py-4 border-b border-[#001d4a]">
          <DialogTitle className="text-white font-bold text-base flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-[#F58220]" /> Stock Adjustment: {item.sku}
          </DialogTitle>
          <DialogDescription className="text-slate-200 text-xs mt-0.5">
            {item.name} ({item.brand})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Horizontal 2-Column Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Stock Indicators & Action Selection */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
                1. Inventory Status & Action
              </h3>

              {/* Current Stock Indicators */}
              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Available In Stock</p>
                  <p className="text-xl font-black text-[#002868] mt-0.5">{item.quantityInStock} <span className="text-xs font-medium text-slate-500">{item.unit}</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Allocated / Reserved</p>
                  <p className="text-xl font-black text-[#F58220] mt-0.5">{item.quantityAllocated} <span className="text-xs font-medium text-slate-500">{item.unit}</span></p>
                </div>
              </div>

              {/* Operation Type Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#002868]">Adjustment Action *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChangeType('STOCK_IN')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      changeType === 'STOCK_IN'
                        ? 'bg-[#002868] text-white border-[#002868] shadow-xs ring-2 ring-[#002868]/20'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Stock In (+ Intake)
                  </button>

                  <button
                    type="button"
                    onClick={() => setChangeType('STOCK_OUT')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      changeType === 'STOCK_OUT'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-600/20'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <MinusCircle className="h-3.5 w-3.5" /> Stock Out (- Dispatch)
                  </button>

                  <button
                    type="button"
                    onClick={() => setChangeType('ALLOCATE')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      changeType === 'ALLOCATE'
                        ? 'bg-[#F58220] text-white border-[#F58220] shadow-xs ring-2 ring-[#F58220]/20'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" /> Reserve / Allocate
                  </button>

                  <button
                    type="button"
                    onClick={() => setChangeType('DEALLOCATE')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      changeType === 'DEALLOCATE'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-xs ring-2 ring-slate-700/20'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Release Allocation
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Quantity, Reference & Remarks */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
                2. Transaction Details
              </h3>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#002868]">Quantity ({item.unit}) *</Label>
                <Input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-10 text-sm font-bold border-slate-300 bg-white"
                  placeholder="Enter adjustment count"
                />
              </div>

              {/* Reference */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#002868]">Reference / Tracking # (PO, Invoice, CRF)</Label>
                <Input
                  placeholder="e.g. PO-2026-889 or CRF-449"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="h-10 text-xs border-slate-300 bg-white"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#002868]">Adjustment Reason / Notes</Label>
                <Input
                  placeholder="e.g. New container arrival from port or dispatched for site installation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 text-xs border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 flex justify-end gap-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs px-6 shadow-sm cursor-pointer"
            >
              {loading ? 'Processing...' : 'Confirm Stock Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
