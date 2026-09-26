'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SectionHeader } from '@/components/ui/section-header'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { updateTicket } from '@/app/dashboard/tickets/actions'
import { formatDateTime } from '@/lib/utils'
import { Eye, Lock } from 'lucide-react'

export function TicketClosedSetupDialog({ ticket }: { ticket: any }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'Closed'
  const customer = ticket.customer || {}
  const [actionPriority, setActionPriority] = React.useState(ticket.actionPriority || 'High')
  const [department, setDepartment] = React.useState(ticket.assignedTo || 'Operation & Maintenance')
  const [status, setStatus] = React.useState(ticket.status || 'Pending')
  const [remarks, setRemarks] = React.useState('')
  const [histories, setHistories] = React.useState<any[]>(ticket.histories || [])

  React.useEffect(() => {
    setHistories(ticket.histories || [])
  }, [ticket.histories])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isClosed) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('ticketId', ticket.id)
    formData.append('status', status)
    formData.append('assignedTo', department)
    formData.append('actionPriority', actionPriority)
    formData.append('remarks', remarks)

    const res = await updateTicket(formData)

    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      if (res.history) {
        setHistories(prev => [res.history, ...prev.filter(h => h.id !== res.history.id)])
      }
      setRemarks('')
      router.refresh()
    }
  }

  const customerIdDigits = customer.customerCode ? customer.customerCode.replace(/^[A-Za-z]+-/, '') : (customer.id || '—')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isClosed ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300 shadow-2xs inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              View Ticket
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs font-bold text-white bg-[#135d86] hover:bg-[#f16232] shadow-xs">
              Update / Close Ticket
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 border-line max-h-[90vh] overflow-y-auto bg-white">
        <SectionHeader
          action={
            isClosed ? (
              <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300 font-bold text-xs inline-flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-600" />
                CLOSED • READ ONLY
              </Badge>
            ) : null
          }
        >
          {isClosed ? `Ticket View (${ticket.ticketNumber})` : `Ticket Closed Set up (${ticket.ticketNumber})`}
        </SectionHeader>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {isClosed && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-4 h-4 text-slate-500" />
                This ticket has been marked as <strong>CLOSED</strong>. It is retained in permanent read-only mode and cannot be edited.
              </span>
              <Badge variant="outline" className="bg-slate-200 text-slate-900 border-slate-300 font-bold">
                CLOSED
              </Badge>
            </div>
          )}

          {/* Customer Code & Name Header */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border-b border-gray-200 pb-3">
            <div>
              <span className="font-bold text-gray-700">Customer ID: </span>
              <span className="font-mono font-semibold text-gray-900">{customerIdDigits}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700">Customer Name: </span>
              <span className="font-semibold text-gray-900">{customer.fullName || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold text-gray-700">Customer Address: </span>
              <span className="text-gray-800">{customer.address || '—'}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700">Contact #: </span>
              <span className="text-gray-900">{customer.contactNumber || '—'}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700">Complaint / Fault: </span>
              <span className="text-gray-900 font-medium">{ticket.category || 'General'} {ticket.fault ? `(${ticket.fault})` : ''}</span>
            </div>
          </div>

          {/* Form Action, Department, Complain Status & Remarks */}
          {isClosed ? (
            <Table className="border border-slate-200 rounded-lg overflow-hidden">
              <TableBody>
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableCell className="font-bold text-xs bg-slate-50 w-32 border-r border-slate-200 text-[#002868]">Action Priority</TableCell>
                  <TableCell className="border-r border-slate-200 text-xs font-semibold text-gray-800">
                    {ticket.actionPriority || 'High'}
                  </TableCell>
                  <TableCell className="font-bold text-xs bg-slate-50 w-28 border-r border-slate-200 text-[#002868]">Department</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-800">
                    {ticket.assignedTo || 'Operation & Maintenance'}
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868] p-3 w-40">Complaint Status</TableCell>
                  <TableCell colSpan={3}>
                    <Badge variant="outline" className="bg-slate-100 text-slate-900 border-slate-300 font-bold text-xs">
                      CLOSED
                    </Badge>
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-transparent">
                  <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Description / Notes</TableCell>
                  <TableCell colSpan={3} className="text-xs text-gray-800 whitespace-pre-wrap">
                    {ticket.description || 'No description recorded.'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Table className="border border-slate-200 rounded-lg overflow-hidden">
                <TableBody>
                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableCell className="font-bold text-xs bg-slate-50 w-32 border-r border-slate-200 text-[#002868]">Action</TableCell>
                    <TableCell className="border-r border-slate-200">
                      <select
                        value={actionPriority}
                        onChange={(e) => setActionPriority(e.target.value)}
                        className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                      >
                        {['High', 'Medium', 'Low'].map(act => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </TableCell>

                    <TableCell className="font-bold text-xs bg-slate-50 w-28 border-r border-slate-200 text-[#002868]">Department</TableCell>
                    <TableCell>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                      >
                        {['Operation & Maintenance', 'Billing', 'Sales', 'Customer Service', 'Support'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868] p-3 w-40">Complaint Status</TableCell>
                    <TableCell colSpan={3}>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="CANCELED">Canceled</option>
                      </select>
                    </TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Remarks</TableCell>
                    <TableCell colSpan={3}>
                      <Textarea
                        rows={3}
                        placeholder="Enter update remarks or status resolution notes..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="border-gray-300 text-xs focus-visible:ring-[#002868] bg-white"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs px-6 shadow-xs">
                  {loading ? 'Submitting...' : 'Submit Resolution'}
                </Button>
              </div>
            </form>
          )}

          {/* Department History Audit Table */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Department Transition History</p>
            <Table className="border border-gray-200 rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold text-xs">Status</TableHead>
                  <TableHead className="font-bold text-xs">Department</TableHead>
                  <TableHead className="font-bold text-xs">Remarks</TableHead>
                  <TableHead className="font-bold text-xs">CreatedBy</TableHead>
                  <TableHead className="font-bold text-xs">CreatedAt</TableHead>
                  <TableHead className="font-bold text-xs text-right">Time in Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!histories || histories.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-xs text-gray-500">
                      No status transitions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  histories.map((h: any) => (
                    <TableRow key={h.id} className="text-xs">
                      <TableCell>
                        <Badge variant="outline" className={
                          h.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                          h.status === 'RESOLVED' ? 'bg-[#002868] text-white' :
                          'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                        }>
                          {h.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">{h.department}</TableCell>
                      <TableCell className="text-gray-700 font-medium">{h.remarks || '—'}</TableCell>
                      <TableCell className="text-gray-700">{h.createdBy || 'System'}</TableCell>
                      <TableCell className="font-mono text-gray-600">{formatDateTime(h.createdAt)}</TableCell>
                      <TableCell className="text-right font-mono text-gray-600">{h.timeInDept || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

