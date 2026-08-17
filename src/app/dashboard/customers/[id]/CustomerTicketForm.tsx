'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { createCustomerTicket } from './actions'

const CATEGORY_MAP: Record<string, string[]> = {
  TECHNICAL_COMPLAINT: ['Inverter', 'Panel', 'Battery', 'Breaker'],
  BILLING_COMPLAINT: ['Wrong arrears', 'Invoice Not Received', 'Billing is not Updated', 'Billing Plan Change', 'Wrong Invoice Charged'],
  SERVICE_REQUEST: ['Internal Shifting', 'Package Change', 'Temp. Blocked', 'Termination', 'Restoration', 'Profile Change Request'],
}

const FAULT_MAP: Record<string, string[]> = {
  Inverter: ['(01) BatVolLow', '(02) BatOverCurrSw', 'Over Tem', 'OverLoad', 'Short Circ', 'Grid Over', 'Grid Unde', 'Phase'],
  Panel: ['Low DC Voltage', 'Physical Crack', 'Hotspot Detected', 'Soiling Fault', 'MC4 Burn'],
  Battery: ['Low Voltage', 'BMS Comm Error', 'Low Runtime', 'Cell Imbalance'],
  Breaker: ['Tripped', 'Overcurrent Alarm', 'SPD Blown', 'Thermal Trip'],
}

export function CustomerTicketForm({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const [ticketType, setTicketType] = React.useState<string>('TECHNICAL_COMPLAINT')
  const [category, setCategory] = React.useState('Inverter')
  const [subCategory, setSubCategory] = React.useState('Inverter Brands')
  const [faultCode, setFaultCode] = React.useState('(01) BatVolLow')
  const [sourceOfComplain, setSourceOfComplain] = React.useState('UAN')
  const [escalation, setEscalation] = React.useState('Level-1')
  const [assignedTo, setAssignedTo] = React.useState('Operation & Maintenance')
  const [complainStatus, setComplainStatus] = React.useState('Pending')
  const [firstCallResolution, setFirstCallResolution] = React.useState('No')
  const [description, setDescription] = React.useState('')

  // When ticketType changes, reset category
  const handleTicketTypeChange = (type: string) => {
    setTicketType(type)
    const cats = CATEGORY_MAP[type] || []
    const defaultCat = cats[0] || 'Inverter'
    setCategory(defaultCat)
    if (type === 'TECHNICAL_COMPLAINT') {
      setSubCategory(`${defaultCat} Brands`)
      setFaultCode(FAULT_MAP[defaultCat]?.[0] || '(01) BatVolLow')
    } else {
      setSubCategory('N/A')
      setFaultCode('General')
    }
  }

  // When category changes, reset subCategory & fault
  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    if (ticketType === 'TECHNICAL_COMPLAINT') {
      setSubCategory(`${cat} Brands`)
      setFaultCode(FAULT_MAP[cat]?.[0] || 'General')
    } else {
      setSubCategory('N/A')
      setFaultCode('General')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('customerId', customerId)
    formData.append('ticketType', ticketType)
    formData.append('category', category)
    formData.append('subCategory', subCategory)
    formData.append('faultCode', faultCode)
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

  return (
    <Card className="shadow-sm border-line overflow-hidden bg-white">
      {/* Green Top Banner matching Excel Mockup */}
      <div className="bg-[#C6E0B4] text-emerald-950 px-4 py-2.5 font-bold text-sm text-center border-b border-emerald-300">
        Create Ticket
      </div>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Table className="border border-emerald-200 rounded-lg overflow-hidden">
            <TableBody>
              {/* Row 1: Ticket Type, Category, Sub Category, Fault */}
              <TableRow className="hover:bg-transparent border-b border-emerald-100">
                <TableCell className="font-bold text-xs bg-emerald-50/60 w-36 border-r border-emerald-200">Ticket Type:</TableCell>
                <TableCell className="border-r border-emerald-100">
                  <select
                    value={ticketType}
                    onChange={(e) => handleTicketTypeChange(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    <option value="TECHNICAL_COMPLAINT">Technical Compaint</option>
                    <option value="BILLING_COMPLAINT">Billing Complaint</option>
                    <option value="SERVICE_REQUEST">Service Request</option>
                  </select>
                </TableCell>

                <TableCell className="font-bold text-xs bg-emerald-50/60 w-28 border-r border-emerald-200">Category</TableCell>
                <TableCell className="border-r border-emerald-100">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    {(CATEGORY_MAP[ticketType] || []).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </TableCell>

                <TableCell className="font-bold text-xs bg-emerald-50/60 w-32 border-r border-emerald-200">Sub Category</TableCell>
                <TableCell className="border-r border-emerald-100">
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    {ticketType === 'TECHNICAL_COMPLAINT' ? (
                      ['Inverter Brands', 'Panel Brands', 'Battery Brands', 'Breaker Brands'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))
                    ) : (
                      <option value="N/A">N/A</option>
                    )}
                  </select>
                </TableCell>

                <TableCell className="font-bold text-xs bg-emerald-50/60 w-24 border-r border-emerald-200">Fault</TableCell>
                <TableCell>
                  <select
                    value={faultCode}
                    onChange={(e) => setFaultCode(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    {ticketType === 'TECHNICAL_COMPLAINT' ? (
                      (FAULT_MAP[category] || ['(01) BatVolLow', '(02) BatOverCurrSw']).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))
                    ) : (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </TableCell>
              </TableRow>

              {/* Row 2: Source Of Complain, Escalation */}
              <TableRow className="hover:bg-transparent border-b border-emerald-100">
                <TableCell className="font-bold text-xs bg-emerald-50/60 border-r border-emerald-200">Source Of Complain</TableCell>
                <TableCell className="border-r border-emerald-100">
                  <select
                    value={sourceOfComplain}
                    onChange={(e) => setSourceOfComplain(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    {['UAN', 'Email', 'Whatsapp', 'Sales', 'Billing'].map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </TableCell>

                <TableCell className="font-bold text-xs bg-emerald-50/60 border-r border-emerald-200">Escalation</TableCell>
                <TableCell colSpan={5}>
                  <select
                    value={escalation}
                    onChange={(e) => setEscalation(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    {['Level-1', 'Level-2', 'Level-3'].map(esc => (
                      <option key={esc} value={esc}>{esc}</option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>

              {/* Row 3: Assigned To, Complain Status, First Call Resolution */}
              <TableRow className="hover:bg-transparent border-b border-emerald-100">
                <TableCell className="font-bold text-xs bg-emerald-50/60 border-r border-emerald-200">Assigned To</TableCell>
                <TableCell className="border-r border-emerald-100">
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    {['Operation & Maintenance', 'Billing', 'Sales', 'Customer Service', 'Support'].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </TableCell>

                <TableCell className="font-bold text-xs bg-emerald-50/60 border-r border-emerald-200">Complain Status</TableCell>
                <TableCell className="border-r border-emerald-100">
                  <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
                    Pending
                  </Badge>
                </TableCell>

                <TableCell className="font-bold text-xs bg-emerald-50/60 border-r border-emerald-200">First Call Resolution</TableCell>
                <TableCell colSpan={3}>
                  <select
                    value={firstCallResolution}
                    onChange={(e) => setFirstCallResolution(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-gray-300 text-xs font-medium bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </TableCell>
              </TableRow>

              {/* Row 4: Complain Description */}
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-bold text-xs bg-emerald-50/60 border-r border-emerald-200">Complain Description</TableCell>
                <TableCell colSpan={7}>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Enter detailed complain description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-gray-300 text-xs focus-visible:ring-emerald-500 bg-white"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm px-6">
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

