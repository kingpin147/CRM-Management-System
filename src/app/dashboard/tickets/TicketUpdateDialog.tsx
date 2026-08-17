'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { TicketStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { updateTicket } from './actions'
import type { TicketWithCustomer } from './columns'

export function TicketUpdateDialog({ ticket }: { ticket: TicketWithCustomer }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [status, setStatus] = React.useState<string>(ticket.status)
  const [assignedTo, setAssignedTo] = React.useState<string>(ticket.assignedTo)
  const [escalation, setEscalation] = React.useState<string>(ticket.escalation || 'Level-1')
  const [actionPriority, setActionPriority] = React.useState<string>(ticket.actionPriority || 'Medium')
  const [remarks, setRemarks] = React.useState<string>('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('ticketId', ticket.id)
    formData.append('status', status)
    formData.append('assignedTo', assignedTo)
    formData.append('escalation', escalation)
    formData.append('actionPriority', actionPriority)
    formData.append('remarks', remarks)

    const res = await updateTicket(formData)
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
      <DialogTrigger render={<Button variant="outline" size="sm" className="hover:bg-[var(--color-paper)]" />}>
        Update
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
              Update Ticket {ticket.ticketNumber}
            </DialogTitle>
            <Badge variant="outline" className="text-xs bg-[var(--color-paper)]">
              {ticket.ticketType}
            </Badge>
          </div>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Customer: <strong className="text-[var(--color-graphite)]">{ticket.customer?.fullName}</strong> ({ticket.customer?.customerCode})
          </DialogDescription>
        </DialogHeader>

        {/* Ticket Summary Box */}
        <div className="bg-[var(--color-paper)] p-3.5 rounded-xl border border-[var(--color-line)] space-y-1 text-xs text-[var(--color-slate-custom)]">
          <div className="flex justify-between">
            <span>Category: <strong className="text-[var(--color-ink)]">{ticket.category} {ticket.subCategory ? `• ${ticket.subCategory}` : ''}</strong></span>
            {ticket.fault && <span>Fault: <strong className="text-[var(--color-amber)]">{ticket.fault}</strong></span>}
          </div>
          <p className="text-[var(--color-ink)] pt-1 italic">&quot;{ticket.description}&quot;</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              >
                <option value={TicketStatus.PENDING}>Pending</option>
                <option value={TicketStatus.RESOLVED}>Resolved</option>
                <option value={TicketStatus.ON_HOLD}>On Hold</option>
                <option value={TicketStatus.CLOSED}>Closed</option>
                <option value={TicketStatus.CANCELED}>Canceled</option>
              </select>
            </div>

            {/* Assigned Department */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Assigned To</Label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              >
                <option value="O&M">O&M</option>
                <option value="Billing">Billing</option>
                <option value="Sales">Sales</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>

            {/* Escalation */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Escalation Level</Label>
              <select
                value={escalation}
                onChange={(e) => setEscalation(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              >
                <option value="Level-1">Level-1</option>
                <option value="Level-2">Level-2</option>
                <option value="Level-3">Level-3</option>
              </select>
            </div>

            {/* Action Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Priority</Label>
              <select
                value={actionPriority}
                onChange={(e) => setActionPriority(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Remarks / Resolution Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-ink)]">Resolution Remarks / Notes</Label>
            <Textarea
              placeholder="Enter remarks or resolution details for audit history..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="border-[var(--color-line)] text-sm focus-visible:ring-[var(--color-amber)] min-h-[75px] rounded-lg"
            />
          </div>

          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs shadow-xs">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
