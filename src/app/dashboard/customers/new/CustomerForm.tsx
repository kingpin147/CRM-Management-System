'use client'

import { useState, useEffect } from 'react'
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
  accountExecutiveId: z.string().optional(),
  
  // Package Details
  systemSizeKw: z.string().min(1, 'System size is required'),
  packageTier: z.string().min(1, 'Package tier is required'),
  billingType: z.string().min(1, 'Billing type is required'),
  monitoringTime: z.string().min(1, 'Monitoring time is required'),
  monthlyBasePrice: z.coerce.number().min(0, 'Must be a positive number'),
})

export function CustomerForm({ users }: { users?: { id: string, fullName: string, role: string }[] }) {
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
      accountExecutiveId: '',
      
      systemSizeKw: '1-10 kW',
      packageTier: 'Basic',
      billingType: 'Monthly',
      monitoringTime: '12 Hours',
      monthlyBasePrice: 0,
    },
  })

  // Watch for Pricing Logic
  const billingType = form.watch('billingType')
  const monthlyBasePrice = form.watch('monthlyBasePrice') || 0

  let discountPercentage = 0
  if (billingType === 'Quarterly') discountPercentage = 10
  if (billingType === 'Half Yearly') discountPercentage = 20
  if (billingType === 'Yearly') discountPercentage = 40
  if (billingType === 'FOC') discountPercentage = 100

  // Calculation (assuming simple logic: months * monthlyPrice - discount)
  let months = 1;
  if (billingType === 'Quarterly') months = 3;
  if (billingType === 'Half Yearly') months = 6;
  if (billingType === 'Yearly') months = 12;

  const baseTotal = monthlyBasePrice * months;
  const appliedDiscount = (baseTotal * discountPercentage) / 100;
  const salesTaxAmount = 0; // Assuming 0 for now unless specified
  const totalAmount = baseTotal - appliedDiscount + salesTaxAmount;

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
      if (value !== undefined && value !== '') formData.append(key, value.toString())
    })
    
    // Append auto-calculated fields
    formData.append('appliedDiscount', appliedDiscount.toString())
    formData.append('salesTaxAmount', salesTaxAmount.toString())
    formData.append('totalAmount', totalAmount.toString())
    
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-[var(--color-graphite)] border-b pb-2">Customer Details</h2>
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
                <FormItem>
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

            <FormField
              control={form.control}
              name="accountExecutiveId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Executive (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Account Executive" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {users?.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName} ({user.role.replace('_', ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-display font-semibold text-[var(--color-graphite)] border-b pb-2">Package Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="systemSizeKw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-10 kW">1 - 10 kW</SelectItem>
                      <SelectItem value="10-20 kW">10 - 20 kW</SelectItem>
                      <SelectItem value="20-30 kW">20 - 30 kW</SelectItem>
                      <SelectItem value="30+ kW">30 kW & Above</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packageTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Tier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="monitoringTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monitoring Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select monitoring time" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="12 Hours">12 Hours</SelectItem>
                      <SelectItem value="24 Hours">24 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Cycle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly (0% off)</SelectItem>
                      <SelectItem value="Quarterly">Quarterly (10% off)</SelectItem>
                      <SelectItem value="Half Yearly">Half Yearly (20% off)</SelectItem>
                      <SelectItem value="Yearly">Yearly (40% off)</SelectItem>
                      <SelectItem value="FOC">FOC (100% off)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="monthlyBasePrice"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Monthly Base Price (PKR)</FormLabel>
                  <FormControl><Input type="number" placeholder="Enter base price" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-[var(--color-bg-secondary)] p-6 rounded-xl border border-line mt-4">
            <h3 className="text-sm font-semibold text-[var(--color-slate-custom)] uppercase tracking-wider mb-4">Pricing Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Base Total ({months} month{months > 1 ? 's' : ''})</span>
                <span className="font-mono font-medium">PKR {baseTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--color-teal)]">
                <span>Discount ({discountPercentage}%)</span>
                <span className="font-mono font-medium">- PKR {appliedDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                <span>Total Amount</span>
                <span className="font-mono text-[var(--color-amber)]">PKR {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-line">
          <Button type="submit" disabled={uploading || form.formState.isSubmitting} className="w-full md:w-auto px-10 shadow-md h-12 text-lg">
            {uploading || form.formState.isSubmitting ? 'Registering Customer...' : 'Complete Registration'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
