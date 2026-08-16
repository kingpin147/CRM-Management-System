'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { TicketType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createCustomerTicket } from './actions'

const FAULT_OPTIONS: Record<string, string[]> = {
  Inverter: ['(01) BatVolLow', '(02) BatOverCurrSw', '(03) GridVolHigh', '(04) GridFreqOut', '(09) IPV Isolation Fault', 'Other Inverter Fault'],
  Panel: ['Low DC Voltage', 'Physical Panel Crack', 'Hotspot Detected', 'Soiling/Cleaning Required', 'MC4 Connector Burn'],
  Battery: ['Battery Under Voltage', 'BMS Communication Failure', 'Low Backup Runtime', 'Cell Imbalance'],
  'Grid / Meter': ['Net Metering Feed Loss', 'DISCO Grid Outage', 'Phase Failure', 'Reverse Polarity'],
  Billing: ['Invoice Discrepancy', 'Payment Unallocated', 'O&M Rate Query', 'Tax Exemption Request'],
}

export function CustomerTicketForm({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const [ticketType, setTicketType] = React.useState<string>(TicketType.TECHNICAL_COMPLAINT)
  const [category, setCategory] = React.useState('Inverter')
  const [faultCode, setFaultCode] = React.useState('(03) GridVolHigh')
  const [assignedTo, setAssignedTo] = React.useState('O&M')
  const [actionPriority, setActionPriority] = React.useState('Medium')
  const [description, setDescription] = React.useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('customerId', customerId)
    formData.append('ticketType', ticketType)
    formData.append('category', category)
    formData.append('faultCode', faultCode)
    formData.append('assignedTo', assignedTo)
    formData.append('actionPriority', actionPriority)
    formData.append('description', description)

    const res = await createCustomerTicket(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess('✅ Ticket successfully logged and assigned!')
      setDescription('')
      router.refresh()
    }
  }

  return (
    <Card className="shadow-sm border-line">
      <CardHeader>
        <CardTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
          Log New Service Complaint / Ticket
        </CardTitle>
        <CardDescription className="text-sm text-[var(--color-slate-custom)]">
          Submit technical faults, maintenance dispatch requests, or billing queries directly for this customer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Ticket Type</Label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)]"
              >
                <option value={TicketType.TECHNICAL_COMPLAINT}>Technical Complaint</option>
                <option value={TicketType.BILLING_COMPLAINT}>Billing Complaint</option>
                <option value={TicketType.SERVICE_REQUEST}>Service Request</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Equipment / Category</Label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  const faults = FAULT_OPTIONS[e.target.value] || []
                  setFaultCode(faults[0] || 'General Query')
                }}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)]"
              >
                <option value="Inverter">Inverter</option>
                <option value="Panel">PV Solar Panels</option>
                <option value="Battery">Battery System</option>
                <option value="Grid / Meter">Grid & Net Metering</option>
                <option value="Billing">Billing & Accounting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Fault / Issue Code</Label>
              <select
                value={faultCode}
                onChange={(e) => setFaultCode(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-xs font-medium text-[var(--color-ink)]"
              >
                {(FAULT_OPTIONS[category] || ['General Issue']).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Assign Department</Label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)]"
              >
                <option value="O&M">O&M Operations</option>
                <option value="Billing">Billing Team</option>
                <option value="Sales">Sales Account Executive</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-ink)]">Action Priority</Label>
              <select
                value={actionPriority}
                onChange={(e) => setActionPriority(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-ink)]">Complaint / Issue Description *</Label>
            <Textarea
              required
              rows={4}
              placeholder="Detail the customer complaint, symptoms, inverter alarm indicators, or dispatch notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-[var(--color-line)] text-sm focus-visible:ring-[var(--color-amber)]"
            />
          </div>

          <Button type="submit" disabled={loading} className="shadow-md">
            {loading ? 'Submitting Ticket...' : 'Log Service Ticket'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
