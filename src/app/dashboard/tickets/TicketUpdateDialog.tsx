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
import { SectionHeader } from '@/components/ui/section-header'
import { Badge } from '@/components/ui/badge'
import { updateTicket } from './actions'
import type { TicketWithCustomer } from './columns'
import { Eye, Lock } from 'lucide-react'

export function TicketUpdateDialog({ ticket }: { ticket: TicketWithCustomer }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isClosed = ticket.status === 'CLOSED' || (ticket.status as string) === 'Closed'
  const [status, setStatus] = React.useState<string>(ticket.status)
  const [assignedTo, setAssignedTo] = React.useState<string>(ticket.assignedTo)
  const [escalation, setEscalation] = React.useState<string>(ticket.escalation || 'Level-1')
  const [actionPriority, setActionPriority] = React.useState<string>(ticket.actionPriority || 'Medium')
  const [remarks, setRemarks] = React.useState<string>('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (isClosed) return
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
      <DialogTrigger
        render={
          isClosed ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300 shadow-2xs inline-flex items-center gap-1"
            >
              <Eye className="w-3 h-3 text-slate-600" />
              View
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs font-semibold hover:bg-[var(--color-paper)]">
              Update
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-0 overflow-hidden">
        <SectionHeader
          action={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                {ticket.ticketType}
              </Badge>
              {isClosed && (
                <Badge variant="outline" className="text-xs bg-slate-200 text-slate-900 border-slate-300 font-bold inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-600" />
                  CLOSED
                </Badge>
              )}
            </div>
          }
        >
          {isClosed ? `View Ticket ${ticket.ticketNumber}` : `Update Ticket ${ticket.ticketNumber}`}
        </SectionHeader>

        <div className="p-6 space-y-4">
          {/* Closed Ticket Notice */}
          {isClosed && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-4 h-4 text-slate-500" />
                This ticket is marked as <strong>CLOSED</strong> and is in permanent read-only mode.
              </span>
              <Badge variant="outline" className="bg-slate-200 text-slate-900 border-slate-300 font-bold">
                CLOSED
              </Badge>
            </div>
          )}

          {/* Ticket Summary Box */}
          <div className="bg-[var(--color-paper)] p-3.5 rounded-xl border border-[var(--color-line)] space-y-1 text-xs text-[var(--color-slate-custom)]">
            <div className="flex justify-between">
              <span>Category: <strong className="text-[var(--color-ink)]">{ticket.category} {ticket.subCategory ? `• ${ticket.subCategory}` : ''}</strong></span>
              {ticket.fault && <span>Fault: <strong className="text-[var(--color-amber)]">{ticket.fault}</strong></span>}
            </div>
            <p className="text-[var(--color-ink)] pt-1 italic">&quot;{ticket.description}&quot;</p>
          </div>

          {isClosed ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Status:</span>
                  <span className="font-bold text-slate-900">CLOSED</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Assigned To:</span>
                  <span className="font-bold text-slate-900">{ticket.assignedTo}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Escalation:</span>
                  <span className="font-bold text-slate-900">{ticket.escalation || 'Level-1'}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Priority:</span>
                  <span className="font-bold text-slate-900">{ticket.actionPriority || 'High'}</span>
                </div>
              </div>
            </div>
          ) : (
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
                <Button type="submit" disabled={loading} className="text-xs">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

