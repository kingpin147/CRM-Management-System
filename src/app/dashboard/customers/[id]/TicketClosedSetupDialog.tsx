'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { updateTicket } from '@/app/dashboard/tickets/actions'
import { formatDateTime } from '@/lib/utils'


export function TicketClosedSetupDialog({ ticket }: { ticket: any }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const customer = ticket.customer || {}
  const [actionPriority, setActionPriority] = React.useState(ticket.actionPriority || 'High')
  const [department, setDepartment] = React.useState(ticket.assignedTo || 'Operation & Maintenance')
  const [status, setStatus] = React.useState(ticket.status || 'Pending')
  const [remarks, setRemarks] = React.useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      setOpen(false)
      setRemarks('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="h-8 text-xs font-bold text-white bg-[#002868] hover:bg-[#001d4a] shadow-xs">Update / Close Ticket</Button>} />

      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 border-line max-h-[90vh] overflow-y-auto bg-white">
        {/* Navy Top Banner matching Invoice theme */}
        <DialogHeader className="bg-[#002868] px-6 py-3 border-b border-[#001d4a]">
          <DialogTitle className="text-white font-bold text-base text-center tracking-wide">
            Ticket Closed Set up ({ticket.ticketNumber})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Customer Code & Name Header */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border-b border-gray-200 pb-3">
            <div>
              <span className="font-bold text-gray-700">Customer ID: </span>
              <span className="font-mono font-semibold text-gray-900">{customer.customerCode || '—'}</span>
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
          </div>

          {/* Form Action, Department, Complain Status & Remarks */}
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
                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Complain Status</TableCell>
                <TableCell colSpan={3}>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    <option value="CLOSED">Closed</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="PENDING">Pending</option>
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
                    placeholder="Enter closing remarks or status update notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="border-gray-300 text-xs focus-visible:ring-[#002868] bg-white"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs px-6 shadow-xs">
              {loading ? 'Submitting...' : 'Submit Resolution'}
            </Button>
          </div>

          {/* Department History Audit Table matching bottom of Image 1 */}
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
                {(!ticket.histories || ticket.histories.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-xs text-gray-500">
                      No status transitions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  ticket.histories.map((h: any) => (
                    <TableRow key={h.id} className="text-xs">
                      <TableCell>
                        <Badge variant="outline" className={
                          h.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                          h.status === 'RESOLVED' ? 'bg-[#002868] text-white' :
                          'bg-amber-100 text-amber-900'
                        }>
                          {h.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">{h.department}</TableCell>
                      <TableCell className="text-gray-600">{h.remarks || '—'}</TableCell>
                      <TableCell className="text-gray-700">{h.createdBy || 'System'}</TableCell>
                      <TableCell className="font-mono text-gray-600">{formatDateTime(h.createdAt)}</TableCell>
                      <TableCell className="text-right font-mono text-gray-600">{h.timeInDept || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
