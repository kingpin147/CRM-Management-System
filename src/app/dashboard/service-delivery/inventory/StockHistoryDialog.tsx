'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getItemStockLogs } from './actions'
import { formatDate } from '@/lib/utils'
import { History, ArrowDownLeft, ArrowUpRight, ShieldAlert, FileText, Clock } from 'lucide-react'

export function StockHistoryDialog({ item }: { item: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<any[]>([])

  async function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setLoading(true)
      const res = await getItemStockLogs(item.id)
      setLoading(false)
      if (res?.logs) {
        setLogs(res.logs)
      }
    }
  }

  const getBadge = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
      case 'INITIAL_STOCK':
        return <Badge className="bg-[#002868] text-white text-[10px] font-bold">Stock In</Badge>
      case 'STOCK_OUT':
        return <Badge className="bg-red-600 text-white text-[10px] font-bold">Stock Out</Badge>
      case 'ALLOCATE':
        return <Badge className="bg-[#F58220] text-white text-[10px] font-bold">Allocated</Badge>
      case 'DEALLOCATE':
        return <Badge className="bg-slate-700 text-white text-[10px] font-bold">Deallocated</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">{type}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-600 hover:text-[#002868] hover:bg-slate-100 rounded-md" />}>
        <History className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 border-line max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-[#002868] px-6 py-4 border-b border-[#001d4a]">
          <DialogTitle className="text-white font-bold text-base flex items-center gap-2">
            <History className="h-4 w-4 text-[#F58220]" /> Stock Movement Logs ({item.sku})
          </DialogTitle>
          <DialogDescription className="text-slate-200 text-xs mt-0.5">
            Audit history of all stock receipts, project dispatches, and warehouse allocations for {item.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Clock className="h-6 w-6 animate-spin text-[#002868]" />
              Loading stock logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No stock logs recorded for this item yet.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-[#002868]">Date & Time</TableHead>
                    <TableHead className="text-xs font-bold text-[#002868]">Action</TableHead>
                    <TableHead className="text-xs font-bold text-[#002868] text-center">Change</TableHead>
                    <TableHead className="text-xs font-bold text-[#002868] text-center">Balance</TableHead>
                    <TableHead className="text-xs font-bold text-[#002868]">Ref / Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const d = new Date(log.createdAt)
                    const dateStr = formatDate(log.createdAt)
                    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    const isPositive = log.changeType === 'STOCK_IN' || log.changeType === 'INITIAL_STOCK'

                    return (
                      <TableRow key={log.id} className="hover:bg-slate-50/80">
                        <TableCell className="text-xs font-mono text-slate-600">
                          <div>{dateStr}</div>
                          <div className="text-[10px] text-slate-400">{timeStr}</div>
                        </TableCell>
                        <TableCell>{getBadge(log.changeType)}</TableCell>
                        <TableCell className="text-xs font-bold text-center">
                          <span className={isPositive ? "text-blue-800" : "text-rose-700"}>
                            {isPositive ? `+${log.quantity}` : `-${log.quantity}`} {item.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-center text-[#002868]">
                          {log.newQty} {item.unit}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-[180px] truncate">
                          {log.reference && (
                            <span className="font-semibold text-slate-800 block text-[11px]">
                              {log.reference}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            {log.notes || 'No remarks'}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
