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
import { createCustomer } from './actions'
import { uploadFile } from '@/utils/supabase/storage'
import { CustomerType } from '@prisma/client'

const customerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  customerType: z.nativeEnum(CustomerType),
  contactNumber: z.string().regex(/^(\+92|0)?\d{10}$/, 'Invalid Pakistani phone number format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must follow format 00000-0000000-0'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(5, 'Address must be complete'),
  block: z.string().optional(),
})

export function CustomerForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cnicFile, setCnicFile] = useState<File | null>(null)

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      customerType: 'RESIDENTIAL',
      contactNumber: '',
      email: '',
      cnic: '',
      city: 'Lahore',
      address: '',
      block: '',
    },
  })

  async function onSubmit(values: z.infer<typeof customerSchema>) {
    setError(null)
    setUploading(true)

    let cnicImageUrl = null
    if (cnicFile) {
      const ext = cnicFile.name.split('.').pop()
      const fileName = `${values.cnic}-${Date.now()}.${ext}`
      cnicImageUrl = await uploadFile(cnicFile, 'crm-uploads', `cnics/${fileName}`)
      
      if (!cnicImageUrl) {
        setError("Failed to upload CNIC image. Check Supabase storage bucket.")
        setUploading(false)
        return
      }
    }

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })
    if (cnicImageUrl) formData.append('cnicImageUrl', cnicImageUrl)

    const result = await createCustomer(formData)
    setUploading(false)
    
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      router.push(`/dashboard/customers/${result.customerId}`)
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
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                    <SelectItem value="CORPORATE">Corporate</SelectItem>
                    <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl><Input placeholder="03001234567" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNIC</FormLabel>
                <FormControl><Input placeholder="35202-1234567-1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>CNIC Photo Copy (Optional)</FormLabel>
            <Input 
              type="file" 
              accept="image/*"
              className="file:bg-transparent file:text-sm file:font-medium border-[var(--color-line)]"
              onChange={(e) => setCnicFile(e.target.files?.[0] || null)}
            />
          </div>

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Lahore">Lahore</SelectItem>
                    <SelectItem value="Islamabad">Islamabad</SelectItem>
                    <SelectItem value="Karachi">Karachi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Complete Address</FormLabel>
                <FormControl><Input placeholder="House 123, Street 4" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="block"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Block / Phase (Optional)</FormLabel>
                <FormControl><Input placeholder="Phase 6, DHA" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-line">
          <Button type="submit" disabled={uploading || form.formState.isSubmitting} className="w-full md:w-auto px-8 shadow-md">
            {uploading || form.formState.isSubmitting ? 'Registering...' : 'Register Customer'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
