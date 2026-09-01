'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createTicket } from './actions'
import { uploadFile } from '@/utils/supabase/storage'
import { CustomerSearchAutoSuggest } from '@/app/dashboard/billing-cpm/components/CustomerSearchAutoSuggest'
import { Check } from 'lucide-react'
import { TICKET_SUBTYPES, TECHNICAL_CATEGORIES, CATEGORIZED_FAULTS, ESCALATION_MATRIX } from '@/lib/ticket-constants'

const TicketType = {
  TECHNICAL_COMPLAINT: 'TECHNICAL_COMPLAINT',
  BILLING_COMPLAINT: 'BILLING_COMPLAINT',
  SERVICE_REQUEST: 'SERVICE_REQUEST',
} as const;

const ticketSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  ticketType: z.nativeEnum(TicketType),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  faultCode: z.string().optional(),
  escalation: z.string().min(1, 'Escalation is required'),
  assignedTo: z.string().min(1, 'Department is required'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
})

export function TicketForm({ customers }: { customers: { id: string, fullName: string, customerCode: string }[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      customerId: '',
      ticketType: '' as any,
      category: '',
      subCategory: 'N/A',
      faultCode: '',
      escalation: '',
      assignedTo: '',
      description: '',
    },
  })

  // Watch for changes to trigger dependent logic
  const selectedTicketType = form.watch('ticketType')
  const selectedCategory = form.watch('category')

  const isTechnical = selectedTicketType === 'TECHNICAL_COMPLAINT'
  const categoryOptions = isTechnical ? TECHNICAL_CATEGORIES : (selectedTicketType ? ['Billing', 'General Inquiry'] : [])
  
  let availableFaults: string[] = []
  if (isTechnical && selectedCategory) {
    availableFaults = CATEGORIZED_FAULTS[selectedCategory] || []
  } else if (!isTechnical && selectedTicketType) {
    availableFaults = TICKET_SUBTYPES[selectedTicketType as keyof typeof TICKET_SUBTYPES] || []
  }

  async function onSubmit(values: z.infer<typeof ticketSchema>) {
    setError(null)
    setUploading(true)

    let attachmentUrl = null
    if (attachment) {
      const ext = attachment.name.split('.').pop()
      const fileName = `tkt-${Date.now()}.${ext}`
      attachmentUrl = await uploadFile(attachment, 'crm-uploads', `tickets/${fileName}`)
      
      if (!attachmentUrl) {
        setError("Failed to upload attachment. Check Supabase storage bucket.")
        setUploading(false)
        return
      }
    }

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })
    
    formData.append('source', 'Portal')
    if (attachmentUrl) formData.append('attachmentUrl', attachmentUrl)

    const result = await createTicket(formData)
    setUploading(false)
    
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      router.push('/dashboard/tickets')
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-semibold text-slate-800">Select Customer</FormLabel>
                <FormControl>
                  <CustomerSearchAutoSuggest
                    onSelectCustomer={(selectedId) => {
                      field.onChange(selectedId)
                    }}
                    placeholder="Search and select customer by Name, ID (9484), Phone, CRF #, CNIC..."
                  />
                </FormControl>
                {field.value && (
                  <div className="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Customer Selected Successfully
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ticketType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Type</FormLabel>
                <Select onValueChange={(val) => {
                  field.onChange(val)
                  form.setValue('category', '')
                  form.setValue('faultCode', '')
                  form.setValue('escalation', '')
                  // Auto-assign department and escalation based on ticket type
                  if (val === 'TECHNICAL_COMPLAINT') {
                    form.setValue('assignedTo', 'O&M')
                  }
                  if (val === 'BILLING_COMPLAINT' || val === 'SERVICE_REQUEST') {
                    form.setValue('assignedTo', 'Billing')
                    form.setValue('escalation', 'Low')
                  }
                }} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TECHNICAL_COMPLAINT">Technical Complaint</SelectItem>
                    <SelectItem value="BILLING_COMPLAINT">Billing Complaint</SelectItem>
                    <SelectItem value="SERVICE_REQUEST">Service Request</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={(val) => {
                  field.onChange(val)
                  // Reset dependent fields when category changes
                  form.setValue('faultCode', '')
                  if (selectedTicketType !== 'BILLING_COMPLAINT' && selectedTicketType !== 'SERVICE_REQUEST') {
                    form.setValue('escalation', '')
                  }
                }} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {availableFaults.length > 0 && (
            <FormField
              control={form.control}
              name="faultCode"
              render={({ field }) => (
                <FormItem className="animate-reveal">
                  <FormLabel>Fault / Subtype</FormLabel>
                  <Select onValueChange={(val) => {
                    field.onChange(val)
                    if (isTechnical && val && ESCALATION_MATRIX[val]) {
                      form.setValue('escalation', ESCALATION_MATRIX[val])
                    } else if (selectedTicketType !== 'BILLING_COMPLAINT' && selectedTicketType !== 'SERVICE_REQUEST') {
                      form.setValue('escalation', '')
                    }
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select fault/subtype" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableFaults.map(fault => (
                        <SelectItem key={fault} value={fault}>{fault}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="escalation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escalation</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select escalation" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Assign to" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="O&M">Operation & Maintenance</SelectItem>
                    <SelectItem value="Billing">Billing Department</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Issue Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Please describe the customer's issue in detail..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2 md:col-span-2">
            <FormLabel>Attach Photo / Proof (Optional)</FormLabel>
            <Input 
              type="file" 
              accept="image/*,.pdf"
              className="file:bg-transparent file:text-sm file:font-medium border-[var(--color-line)]"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-line">
          <Button type="submit" disabled={uploading || form.formState.isSubmitting} className="w-full md:w-auto px-8 shadow-md">
            {uploading || form.formState.isSubmitting ? 'Logging Ticket...' : 'Log Ticket'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
