'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/section-header'

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { createCustomerTicket } from './actions'
import { AutoSuggestInput } from '@/components/ui/auto-suggest-input'
import { TICKET_SUBTYPES, TECHNICAL_CATEGORIES, CATEGORIZED_FAULTS, ESCALATION_MATRIX } from '@/lib/ticket-constants'

export function CustomerTicketForm({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const [ticketType, setTicketType] = React.useState<string>('')
  const [category, setCategory] = React.useState('')
  const [faultCode, setFaultCode] = React.useState('')
  const [sourceOfComplain, setSourceOfComplain] = React.useState('')
  const [escalation, setEscalation] = React.useState('')
  const [assignedTo, setAssignedTo] = React.useState('')
  const [complainStatus, setComplainStatus] = React.useState('Pending')
  const [firstCallResolution, setFirstCallResolution] = React.useState('')
  const [description, setDescription] = React.useState('')

  const isTechnical = ticketType === 'TECHNICAL_COMPLAINT'

  // When ticketType changes, reset category & dependents
  const handleTicketTypeChange = (type: string) => {
    setTicketType(type)
    setCategory('')
    setFaultCode('')
    if (type === 'TECHNICAL_COMPLAINT') {
      setEscalation('')
      setAssignedTo('Operation & Maintenance')
    } else if (type === 'BILLING_COMPLAINT') {
      setAssignedTo('Billing')
      setEscalation('Low')
    } else if (type === 'SERVICE_REQUEST') {
      setAssignedTo('Customer Service')
      setEscalation('Low')
    } else {
      setEscalation('')
    }
  }

  // When category changes, reset fault
  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    setFaultCode('')
    if (ticketType !== 'BILLING_COMPLAINT' && ticketType !== 'SERVICE_REQUEST') {
      setEscalation('')
    }
  }

  const handleFaultChange = (fault: string) => {
    setFaultCode(fault)
    if (isTechnical && ESCALATION_MATRIX[fault]) {
      setEscalation(ESCALATION_MATRIX[fault])
    } else if (ticketType !== 'BILLING_COMPLAINT' && ticketType !== 'SERVICE_REQUEST') {
      setEscalation('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!ticketType || !category || !sourceOfComplain || !escalation || !assignedTo || !firstCallResolution) {
      setError('Please select all required ticket options before submitting.')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('customerId', customerId)
    formData.append('ticketType', ticketType)
    formData.append('category', category)
    formData.append('subCategory', 'N/A')
    formData.append('faultCode', faultCode || 'General')
    formData.append('sourceOfComplain', sourceOfComplain)
    formData.append('escalation', escalation)
    formData.append('assignedTo', assignedTo)
    formData.append('status', complainStatus)
    formData.append('firstCallResolution', firstCallResolution)
    formData.append('description', description)

    const res = await createCustomerTicket(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess('✅ Ticket successfully logged!')
      setDescription('')
      router.refresh()
    }
  }

  const categoryOptions = isTechnical ? TECHNICAL_CATEGORIES : (ticketType ? ['Billing', 'General Inquiry'] : [])
  let faultOptions: string[] = []
  if (isTechnical && category) {
    faultOptions = CATEGORIZED_FAULTS[category] || []
  } else if (!isTechnical && ticketType) {
    faultOptions = TICKET_SUBTYPES[ticketType as keyof typeof TICKET_SUBTYPES] || []
  }

  return (
    <Card className="shadow-sm border-line overflow-hidden bg-white">
      <SectionHeader>Create Ticket</SectionHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs bg-sky-50 border border-sky-200 text-sky-900 rounded-lg font-medium">
              {success}
            </div>
          )}

          <Table className="border border-slate-200 rounded-lg overflow-hidden">
            <TableBody>
              {/* Row 1: Ticket Type, Category, Fault */}
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableCell className="font-bold text-xs bg-slate-50 w-36 border-r border-slate-200 text-[#002868]">Ticket Type *:</TableCell>
                <TableCell className="border-r border-slate-200">
                  <select
                    value={ticketType}
                    onChange={(e) => handleTicketTypeChange(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    <option value="">Select Ticket Type...</option>
                    <option value="TECHNICAL_COMPLAINT">Technical Complaint</option>
                    <option value="BILLING_COMPLAINT">Billing Complaint</option>
                    <option value="SERVICE_REQUEST">Service Request</option>
                  </select>
                </TableCell>

                <TableCell className="font-bold text-xs bg-slate-50 w-28 border-r border-slate-200 text-[#002868]">Category *</TableCell>
                <TableCell className="border-r border-slate-200">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    <option value="">Select Category...</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </TableCell>

                <TableCell className="font-bold text-xs bg-slate-50 w-24 border-r border-slate-200 text-[#002868]">Fault / Subtype *</TableCell>
                <TableCell colSpan={3}>
                  <AutoSuggestInput
                    value={faultCode}
                    onChange={handleFaultChange}
                    options={faultOptions}
                    placeholder="Type or select fault..."
                    className="h-9 text-xs bg-white"
                  />
                </TableCell>
              </TableRow>

              {/* Row 2: Source Of Complain, Escalation */}
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Source Of Complaint *</TableCell>
                <TableCell className="border-r border-slate-200">
                  <AutoSuggestInput
                    value={sourceOfComplain}
                    onChange={setSourceOfComplain}
                    options={['UAN', 'Email', 'Whatsapp', 'Sales', 'Billing']}
                    placeholder="Type or select source..."
                    className="h-9 text-xs bg-white"
                  />
                </TableCell>

                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Escalation *</TableCell>
                <TableCell colSpan={5}>
                  <select
                    value={escalation}
                    onChange={(e) => setEscalation(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    <option value="">Select Escalation Level...</option>
                    {['Low', 'Medium', 'High', 'Critical'].map(esc => (
                      <option key={esc} value={esc}>{esc}</option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>

              {/* Row 3: Assigned To, Complain Status, First Call Resolution */}
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Assigned To *</TableCell>
                <TableCell className="border-r border-slate-200">
                  <AutoSuggestInput
                    value={assignedTo}
                    onChange={setAssignedTo}
                    options={['Operation & Maintenance', 'Billing', 'Sales', 'Customer Service', 'Support']}
                    placeholder="Type or select department..."
                    className="h-9 text-xs bg-white"
                  />
                </TableCell>

                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Complaint Status</TableCell>
                <TableCell className="border-r border-slate-200">
                  <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
                    Pending
                  </Badge>
                </TableCell>

                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">First Call Resolution *</TableCell>
                <TableCell colSpan={3}>
                  <select
                    value={firstCallResolution}
                    onChange={(e) => setFirstCallResolution(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    <option value="">Select Option...</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </TableCell>
              </TableRow>

              {/* Row 4: Complain Description */}
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-bold text-xs bg-slate-50 border-r border-slate-200 text-[#002868]">Complaint Description</TableCell>
                <TableCell colSpan={7}>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Enter detailed complaint description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-gray-300 text-xs focus-visible:ring-[#002868] bg-white"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs shadow-sm px-6">
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
