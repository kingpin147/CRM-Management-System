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
import { TicketType } from '@prisma/client'

const ticketSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  ticketType: z.nativeEnum(TicketType),
  category: z.string().min(1, 'Category is required'),
  actionPriority: z.string().min(1, 'Priority is required'),
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
      ticketType: 'TECHNICAL_COMPLAINT',
      category: 'Inverter',
      actionPriority: 'Medium',
      assignedTo: 'O&M',
      description: '',
    },
  })

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
      formData.append(key, value)
    })
    
    formData.append('source', 'Portal')
    formData.append('escalation', 'Level-1')
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
                <FormLabel>Select Customer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Search and select a customer..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.customerCode} - {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TECHNICAL_COMPLAINT">Technical Issue</SelectItem>
                    <SelectItem value="BILLING_COMPLAINT">Billing Query</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Inverter">Inverter</SelectItem>
                    <SelectItem value="Panel">Solar Panel</SelectItem>
                    <SelectItem value="Battery">Battery</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="General">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actionPriority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="High">High Priority</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Assign to" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="O&M">O&M Team</SelectItem>
                    <SelectItem value="Billing">Billing Department</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Support">Customer Support</SelectItem>
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
