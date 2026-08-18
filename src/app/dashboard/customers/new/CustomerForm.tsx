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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createCustomer } from './actions'
import { uploadFile } from '@/utils/supabase/storage'
import { CustomerType } from '@prisma/client'
import { ChevronRight, ChevronLeft, CheckCircle2, Check, Sparkles } from 'lucide-react'

const customerSchema = z.object({
  // TAB 1: Customer Details + Package Details
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  customerType: z.nativeEnum(CustomerType),
  contactNumber: z.string().min(10, 'Contact number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  cnic: z.string().min(13, 'CNIC number is required'),
  cnicExpiry: z.string().optional(),
  houseNo: z.string().optional(),
  streetNo: z.string().optional(),
  block: z.string().optional(),
  subArea: z.string().optional(),
  area: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  country: z.string().default('Pakistan'),
  address: z.string().min(3, 'Address is required'),
  signUpDate: z.string().optional(),
  customerStatus: z.string().default('SIGNUP_GENERATED'),
  accountExecutiveId: z.string().optional(),
  accountExecutiveName: z.string().optional(),

  // Package Details (Section 2 in Tab 1)
  systemSizeKw: z.string().default('10-20 kW'),
  packageTier: z.string().default('Comprehensive'),
  billingType: z.string().default('Yearly'),
  monitoringTime: z.string().default('24 Hours'),
  monthlyBasePrice: z.coerce.number().default(0),
  salesTaxAmount: z.coerce.number().default(0),
  onboardingFee: z.coerce.number().default(0),
  totalAmount: z.coerce.number().default(0),
  paidAmount: z.coerce.number().default(0),

  // TAB 2: Solar System Details
  meterType: z.string().default('Green Meter'),
  zeroExportDevice: z.string().default('Not Installed'),
  disco: z.string().default('LESCO'),
  discoRefNo: z.string().optional(),
  inverterBrand: z.string().default('Solis'),
  inverterType: z.string().default('Hybrid'),
  inverterPhase: z.string().default('Three Phase'),
  noOfInverters: z.coerce.number().default(1),
  inverterSerial: z.string().optional(),
  inverterCategory: z.string().default('Low Voltage'),
  inverterSize: z.string().default('6kW'),
  inverterWarrantyExpiry: z.string().optional(),
  meterPhase: z.string().default('Three Phase'),
  panelTechnology: z.string().default('TOPCON'),
  panelBrand: z.string().default('LONGi'),
  panelWattage: z.coerce.number().default(585),
  noOfPanels: z.coerce.number().default(10),
  panelType: z.string().default('Monofacial'),
  panelWarrantyExpiry: z.string().optional(),
  batteryCategory: z.string().default('High Voltage'),
  batteryType: z.string().default('Lithium'),
  batteryBrand: z.string().default('Pylontech'),
  noOfBatteries: z.coerce.number().default(1),
  batteryWarrantyExpiry: z.string().optional(),
  earthingType: z.string().default('AC'),
  earthingOhms: z.string().default('0.5'),
  lastCheckDate: z.string().optional(),
  ingressProtection: z.string().default('IP54'),
  structureType: z.string().default('Standard'),
  structureMaterial: z.string().default('Pre Galvanized'),
  installationDate: z.string().optional(),

  // TAB 3: Installer Details & System Audit
  installerName: z.string().optional(),
  installerCompany: z.string().optional(),
  installerAddress: z.string().optional(),
  installerContact: z.string().optional(),
  installerEmail: z.string().optional(),
  lastAuditDate: z.string().optional(),
  inverterAuditStatus: z.string().default('Excellent'),
  panelAuditStatus: z.string().default('Excellent'),
  batteryAuditStatus: z.string().default('Excellent'),
  structureAuditStatus: z.string().default('Excellent'),
  cableAuditStatus: z.string().default('Excellent'),
  earthingAuditStatus: z.string().default('Excellent'),
  breakersAuditStatus: z.string().default('Excellent'),
})

export function CustomerForm({ users }: { users?: { id: string, fullName: string, role: string }[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cnicFrontFile, setCnicFrontFile] = useState<File | null>(null)
  const [cnicBackFile, setCnicBackFile] = useState<File | null>(null)

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      fullName: '',
      customerType: 'RESIDENTIAL',
      contactNumber: '',
      email: '',
      cnic: '',
      cnicExpiry: '',
      houseNo: '',
      streetNo: '',
      block: '',
      subArea: '',
      area: '',
      city: 'Lahore',
      country: 'Pakistan',
      address: '',
      signUpDate: '',
      customerStatus: 'SIGNUP_GENERATED',
      accountExecutiveId: 'none',
      accountExecutiveName: '',

      systemSizeKw: '10-20 kW',
      packageTier: 'Comprehensive',
      billingType: 'Yearly',
      monitoringTime: '12 Hours',
      monthlyBasePrice: 0,
      salesTaxAmount: 0,
      onboardingFee: 0,
      totalAmount: 0,
      paidAmount: 0,

      meterType: 'Green Meter',
      zeroExportDevice: 'Not Installed',
      disco: 'LESCO',
      discoRefNo: '',
      inverterBrand: 'Solis',
      inverterType: 'Hybrid',
      inverterPhase: 'Three Phase',
      noOfInverters: 1,
      inverterSerial: '',
      inverterCategory: 'Low Voltage',
      inverterSize: '6kW',
      inverterWarrantyExpiry: '',
      meterPhase: 'Three Phase',
      panelTechnology: 'TOPCON',
      panelBrand: 'LONGi',
      panelWattage: 585,
      noOfPanels: 10,
      panelType: 'Monofacial',
      panelWarrantyExpiry: '',
      batteryCategory: 'High Voltage',
      batteryType: 'Lithium',
      batteryBrand: 'Pylontech',
      noOfBatteries: 1,
      batteryWarrantyExpiry: '',
      earthingType: 'AC',
      earthingOhms: '0.5',
      lastCheckDate: '',
      ingressProtection: 'IP54',
      structureType: 'Standard',
      structureMaterial: 'Pre Galvanized',
      installationDate: '',

      installerName: '',
      installerCompany: '',
      installerAddress: '',
      installerContact: '',
      installerEmail: '',
      lastAuditDate: '',
      inverterAuditStatus: 'Excellent',
      panelAuditStatus: 'Excellent',
      batteryAuditStatus: 'Excellent',
      structureAuditStatus: 'Excellent',
      cableAuditStatus: 'Excellent',
      earthingAuditStatus: 'Excellent',
      breakersAuditStatus: 'Excellent',
    },
  })

  // Dynamic Pricing Calculation Lookup Matrix (Revised 10% Quarterly, 20% Half Yearly, 40% Yearly)
  const systemSizeKw   = form.watch('systemSizeKw')
  const packageTier    = form.watch('packageTier')
  const billingType    = form.watch('billingType')
  const monitoringTime = form.watch('monitoringTime')
  const panelWattage   = form.watch('panelWattage') || 0
  const noOfPanels     = form.watch('noOfPanels')   || 0
  const totalPanelWattage = panelWattage * noOfPanels

  // Compute Base Monthly Rates according to Monitoring 12h vs 24h official rate tables
  let baseMonthlyRate = 0
  if (monitoringTime === '12 Hours') {
    if (systemSizeKw === '1-10 kW') {
      if (packageTier === 'Basic') baseMonthlyRate = 1000
      if (packageTier === 'Moderate') baseMonthlyRate = 1800
      if (packageTier === 'Comprehensive') baseMonthlyRate = 3000
    } else if (systemSizeKw === '10-20 kW') {
      if (packageTier === 'Basic') baseMonthlyRate = 1250
      if (packageTier === 'Moderate') baseMonthlyRate = 2250
      if (packageTier === 'Comprehensive') baseMonthlyRate = 3750
    } else if (systemSizeKw === '20-30 kW') {
      if (packageTier === 'Basic') baseMonthlyRate = 1500
      if (packageTier === 'Moderate') baseMonthlyRate = 2700
      if (packageTier === 'Comprehensive') baseMonthlyRate = 4500
    }
  } else {
    // 24 Hours
    if (systemSizeKw === '1-10 kW') {
      if (packageTier === 'Basic') baseMonthlyRate = 2000
      if (packageTier === 'Moderate') baseMonthlyRate = 3600
      if (packageTier === 'Comprehensive') baseMonthlyRate = 6000
    } else if (systemSizeKw === '10-20 kW') {
      if (packageTier === 'Basic') baseMonthlyRate = 2500
      if (packageTier === 'Moderate') baseMonthlyRate = 4500
      if (packageTier === 'Comprehensive') baseMonthlyRate = 7500
    } else if (systemSizeKw === '20-30 kW') {
      if (packageTier === 'Basic') baseMonthlyRate = 3000
      if (packageTier === 'Moderate') baseMonthlyRate = 5400
      if (packageTier === 'Comprehensive') baseMonthlyRate = 9000
    }
  }

  // Revised Billing Cycles & Discounts: Quarterly 10%, Half Yearly 20%, Yearly 40%
  let months = 1
  let discountPct = 0
  if (billingType === 'Quarterly')        { months = 3;  discountPct = 10 }
  else if (billingType === 'Half Yearly') { months = 6;  discountPct = 20 }
  else if (billingType === 'Yearly')      { months = 12; discountPct = 40 }
  else if (billingType === 'FOC')         { months = 12; discountPct = 100 }

  const subtotalBeforeDiscount = baseMonthlyRate * months
  const discountAmount         = subtotalBeforeDiscount * (discountPct / 100)
  const priceAfterDiscount     = subtotalBeforeDiscount - discountAmount
  const salesTax               = Math.round(priceAfterDiscount * 0.05)

  // On-Boarding Charges Rules:
  // @ 3,000/- at time of Sign up
  // - Basic: Charged on Monthly, Quarterly, Half Yearly (3,000). Waived on Yearly (0).
  // - Moderate & Comprehensive: Charged on Monthly, Quarterly (3,000). Waived on Half Yearly & Yearly (0).
  // - FOC: 0 (Waived)
  let onboardingFee = 0
  let isOnboardingWaived = false

  if (billingType === 'FOC') {
    onboardingFee = 0
    isOnboardingWaived = true
  } else if (packageTier === 'Basic') {
    if (billingType === 'Yearly') {
      onboardingFee = 0
      isOnboardingWaived = true
    } else {
      onboardingFee = 3000
      isOnboardingWaived = false
    }
  } else if (packageTier === 'Moderate' || packageTier === 'Comprehensive') {
    if (billingType === 'Half Yearly' || billingType === 'Yearly') {
      onboardingFee = 0
      isOnboardingWaived = true
    } else {
      onboardingFee = 3000
      isOnboardingWaived = false
    }
  }

  const grandTotal = billingType === 'FOC' ? 0 : (priceAfterDiscount + salesTax + onboardingFee)

  useEffect(() => {
    form.setValue('monthlyBasePrice', Math.round(priceAfterDiscount))
    form.setValue('salesTaxAmount',   Math.round(salesTax))
    form.setValue('onboardingFee',    Math.round(onboardingFee))
    form.setValue('totalAmount',      Math.round(grandTotal))
  }, [systemSizeKw, packageTier, billingType, monitoringTime, form, priceAfterDiscount, salesTax, onboardingFee, grandTotal])

  async function onSubmit(values: z.infer<typeof customerSchema>) {
    setError(null)
    setUploading(true)

    let cnicFrontUrl = null
    if (cnicFrontFile) {
      const ext = cnicFrontFile.name.split('.').pop()
      cnicFrontUrl = await uploadFile(cnicFrontFile, 'crm-uploads', `cnics/${values.cnic}-front-${Date.now()}.${ext}`)
    }

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'none') formData.append(key, value.toString())
    })

    formData.append('appliedDiscount', Math.round(discountAmount).toString())
    formData.append('salesTaxAmount',  Math.round(salesTax).toString())
    formData.append('onboardingFee',   Math.round(onboardingFee).toString())
    formData.append('totalAmount',     Math.round(grandTotal).toString())
    if (cnicFrontUrl) formData.append('cnicImageUrl', cnicFrontUrl)

    const result = await createCustomer(formData)
    setUploading(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      router.push(`/dashboard/customers/${result.customerId}`)
    }
  }

  // 3-step tabs
  const tabs = [
    { id: 1, label: 'Customer Details' },
    { id: 2, label: 'Solar System Details' },
    { id: 3, label: 'Installer Details' },
  ]

  const INVERTER_BRANDS = [
    'Solis', 'Growatt', 'Huawei', 'Knox', 'Deye', 'Fronius', 'Inverex', 'Ziewnic', 'Sungrow',
    'Voltronic', 'Kodak', 'Nitram', 'PEARL', 'Canadian Solar', 'Crown', 'Onya', 'Kehua',
    'SMA', 'Sunward', 'Voltz', 'MaxPower', 'Onyx', 'Powering Systems', 'GoodWe', 'Other'
  ]

  const PANEL_BRANDS = [
    'LONGi', 'AIKO', 'Risen', 'Trina Solar', 'Jinko', 'Astronergy', 'GCL', 'Huawei',
    'DMSGC', 'JA Solar', 'Jolywood', 'Qcells', 'Canadian Solar', 'Seraphim', 'Other'
  ]

  const BATTERY_BRANDS = [
    'Pylontech', 'Dyness', 'Narada', 'Sunwoda', 'Dongjin', 'BYD', 'Knox', 'GoodWe',
    'Sacred Sun', 'Genix', 'Gree', 'Inverex', 'Growatt', 'Deye', 'Huawei', 'Fox ESS',
    'Sangrow', 'SolarX', 'Osaka', 'Phoenix', 'Apex Solar', 'MaxPower', 'Other'
  ]

  const DISCO_LIST     = ['LESCO', 'IESCO', 'FESCO', 'MEPCO', 'PESCO', 'GEPCO', 'QESCO', 'K-Electric']
  const AUDIT_STATUSES = ['Excellent', 'Good', 'Fair', 'Service Required', 'Replacement Required']

  return (
    <div className="space-y-6">
      {/* 3-Step Tab Navigation */}
      <div className="grid grid-cols-3 gap-3 bg-amber-50/50 p-2 rounded-2xl border border-amber-200/60 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const isDone   = activeTab > tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white shadow-md border border-amber-300 font-bold text-[var(--color-ink)]'
                  : 'bg-transparent hover:bg-white/60 text-[var(--color-slate-custom)] font-semibold'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isActive
                    ? 'bg-[var(--color-amber)] text-white'
                    : isDone
                    ? 'bg-[var(--color-ink)] text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : tab.id}
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 1: Customer Details + Package Details (combined)
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 1 && (
            <div className="space-y-6 animate-reveal">

              {/* ── Section 1: Customer Details ── */}
              <Card className="shadow-sm border-line bg-white">
                <CardContent className="p-6 space-y-6">
                  <div className="border-b border-line pb-3">
                    <h2 className="text-lg font-bold text-[var(--color-graphite)]">1. Customer Details</h2>
                    <p className="text-xs text-[var(--color-slate-custom)]">Enter customer contact details, address, and CNIC credentials.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Customer Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Customer Name *</FormLabel>
                          <FormControl><Input placeholder="e.g. Aafaaq Ali Khan" {...field} className="h-10 text-xs" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact # */}
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Contact # *</FormLabel>
                          <FormControl><Input placeholder="03001234567" {...field} className="h-10 text-xs" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Customer Type */}
                    <FormField
                      control={form.control}
                      name="customerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Customer Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                              <SelectItem value="CORPORATE">Corporate</SelectItem>
                              <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* House # */}
                    <FormField
                      control={form.control}
                      name="houseNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">House #</FormLabel>
                          <FormControl><Input placeholder="401" {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Street # */}
                    <FormField
                      control={form.control}
                      name="streetNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Street #</FormLabel>
                          <FormControl><Input placeholder="9" {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Block */}
                    <FormField
                      control={form.control}
                      name="block"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Block</FormLabel>
                          <FormControl><Input placeholder="G" {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Sub Area */}
                    <FormField
                      control={form.control}
                      name="subArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Sub Area</FormLabel>
                          <FormControl><Input placeholder="Phase I" {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Area / Society */}
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs font-semibold">Area / Society</FormLabel>
                          <FormControl><Input placeholder="DHA, Bahria Town..." {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* City */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">City *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {['Lahore', 'Islamabad', 'Karachi', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Peshawar', 'Quetta', 'Other'].map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Country</FormLabel>
                          <FormControl><Input readOnly {...field} className="h-10 text-xs bg-gray-50" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="customer@example.com" {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* CNIC # */}
                    <FormField
                      control={form.control}
                      name="cnic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">CNIC # *</FormLabel>
                          <FormControl><Input placeholder="35201-0000000-0" {...field} className="h-10 text-xs" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* CNIC Expiry */}
                    <FormField
                      control={form.control}
                      name="cnicExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">CNIC Expiry Date</FormLabel>
                          <FormControl><Input type="date" {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Upload CNIC Front */}
                    <div className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">Upload CNIC Front</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        className="h-10 text-xs file:bg-transparent file:text-xs file:font-semibold border-[var(--color-line)]"
                        onChange={(e) => setCnicFrontFile(e.target.files?.[0] || null)}
                      />
                    </div>

                    {/* Upload CNIC Back */}
                    <div className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">Upload CNIC Back</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        className="h-10 text-xs file:bg-transparent file:text-xs file:font-semibold border-[var(--color-line)]"
                        onChange={(e) => setCnicBackFile(e.target.files?.[0] || null)}
                      />
                    </div>

                    {/* Sign Up Date */}
                    <FormField
                      control={form.control}
                      name="signUpDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Sign Up Date</FormLabel>
                          <FormControl><Input type="date" {...field} className="h-10 text-xs" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Account Executive */}
                    <FormField
                      control={form.control}
                      name="accountExecutiveId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs font-semibold">Account Executive Name</FormLabel>
                          <Select onValueChange={(val) => {
                            field.onChange(val)
                            const sel = users?.find(u => u.id === val)
                            if (sel) form.setValue('accountExecutiveName', sel.fullName)
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Select Account Executive" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Unassigned / Direct</SelectItem>
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
                </CardContent>
              </Card>

              {/* ── Section 2: Package Details ── */}
              <Card className="shadow-sm border-line bg-white">
                <CardContent className="p-6 space-y-6">
                  <div className="border-b border-line pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-amber-100 text-amber-900">2</div>
                      <div>
                        <h2 className="text-lg font-bold text-[var(--color-graphite)]">Package Details</h2>
                        <p className="text-xs text-[var(--color-slate-custom)]">Choose system capacity size, package tier, billing cycle, and monitoring coverage.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Type (Capacity) */}
                    <FormField
                      control={form.control}
                      name="systemSizeKw"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">System Type (Capacity) *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="1-10 kW">1–10 kW</SelectItem>
                              <SelectItem value="10-20 kW">10–20 kW</SelectItem>
                              <SelectItem value="20-30 kW">20–30 kW</SelectItem>
                              <SelectItem value="30+ kW">30 kW &amp; Above</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* Package */}
                    <FormField
                      control={form.control}
                      name="packageTier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Package *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Basic">Basic</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* Billing Type (Revised Discounts: 10% Quarterly, 20% Half Yearly, 40% Yearly) */}
                    <FormField
                      control={form.control}
                      name="billingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Billing Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Quarterly">Quarterly (10% Off)</SelectItem>
                              <SelectItem value="Half Yearly">Half Yearly (20% Off)</SelectItem>
                              <SelectItem value="Yearly">Yearly (40% Off)</SelectItem>
                              <SelectItem value="FOC">FOC (Free of Cost)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* Monitoring Time */}
                    <FormField
                      control={form.control}
                      name="monitoringTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Monitoring Time *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="12 Hours">12 Hours Daytime</SelectItem>
                              <SelectItem value="24 Hours">24 Hours Continuous</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Package Calculation Breakdown with On-Boarding Charges Breakdown */}
                  <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Package Calculation Breakdown</h3>
                      <span className="text-[11px] font-medium text-amber-900">5% Sales Tax Included</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-gray-500 block">Base Subscription</span>
                        <span className="font-mono font-bold text-gray-800">PKR {Math.round(priceAfterDiscount).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Applied Discount</span>
                        <span className="font-bold text-amber-800">{discountPct}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Sales Tax (5%)</span>
                        <span className="font-mono font-bold text-gray-800">PKR {Math.round(salesTax).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">On-Boarding Fee</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isOnboardingWaived ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold px-1.5 py-0">
                              <Check className="w-3 h-3 mr-0.5" /> Waived (PKR 0)
                            </Badge>
                          ) : (
                            <span className="font-mono font-bold text-gray-900">PKR {onboardingFee.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block font-semibold text-gray-700">Total Package Amount</span>
                        <span className="font-mono font-extrabold text-[var(--color-ink)] text-sm">
                          PKR {Math.round(grandTotal).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Informational On-Boarding policy reminder banner */}
                    <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        <strong>On-Boarding Policy:</strong> PKR 3,000/- on sign up. Basic package: waived on Yearly. Moderate &amp; Comprehensive: waived on Half Yearly &amp; Yearly.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Paid Amount */}
                    <FormField
                      control={form.control}
                      name="paidAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Paid Amount (PKR)</FormLabel>
                          <FormControl><Input type="number" placeholder="0" {...field} className="h-10 text-xs font-mono font-bold text-amber-800" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Activation note */}
                    <div className="flex items-end">
                      <p className="text-[11px] text-gray-400 pb-1">
                        Activation Date will be set automatically when the O&amp;M Manager activates the customer.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setActiveTab(2)} className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold text-xs gap-2 px-6 shadow-sm">
                  Next: Solar System Details <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: Solar System Details
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 2 && (
            <Card className="shadow-sm border-line bg-white animate-reveal">
              <CardContent className="p-6 space-y-6">
                <div className="border-b border-line pb-3">
                  <h2 className="text-lg font-bold text-[var(--color-graphite)]">2. Solar System Details</h2>
                  <p className="text-xs text-[var(--color-slate-custom)]">Comprehensive hardware specs, warranties, and protection parameters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Meter Type */}
                  <FormField control={form.control} name="meterType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Meter Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Green Meter">Green Meter</SelectItem>
                          <SelectItem value="Non Green">Non Green</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Zero Export Device */}
                  <FormField control={form.control} name="zeroExportDevice" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Zero Export Device</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Installed">Installed</SelectItem>
                          <SelectItem value="Not Installed">Not Installed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* DISCO */}
                  <FormField control={form.control} name="disco" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">DISCO Utility Company</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {DISCO_LIST.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Inverter Brand */}
                  <FormField control={form.control} name="inverterBrand" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {INVERTER_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Inverter Type */}
                  <FormField control={form.control} name="inverterType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="On-grid">On-grid</SelectItem>
                          <SelectItem value="Hybrid + On-grid">Hybrid + On-grid</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Inverter Phase */}
                  <FormField control={form.control} name="inverterPhase" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Phase Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Single Phase">Single Phase</SelectItem>
                          <SelectItem value="Three Phase">Three Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* No. of Inverters */}
                  <FormField control={form.control} name="noOfInverters" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">No. of Inverters</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Inverter Serial */}
                  <FormField control={form.control} name="inverterSerial" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Serial #</FormLabel>
                      <FormControl><Input placeholder="Serial number..." {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Inverter Warranty */}
                  <FormField control={form.control} name="inverterWarrantyExpiry" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-amber-900">Inverter Warranty End Date</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10 text-xs border-amber-300" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Inverter Category */}
                  <FormField control={form.control} name="inverterCategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="High Voltage">High Voltage</SelectItem>
                          <SelectItem value="Low Voltage">Low Voltage</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Inverter Size */}
                  <FormField control={form.control} name="inverterSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['3kW', '5kW', '6kW', '8kW', '10kW', '12kW', '15kW', '20kW', '30kW+'].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Meter Phase */}
                  <FormField control={form.control} name="meterPhase" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Meter Phase</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Single Phase">Single Phase</SelectItem>
                          <SelectItem value="Three Phase">Three Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Panel Technology */}
                  <FormField control={form.control} name="panelTechnology" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Technology</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['TOPCON', 'ABC', 'HJT', 'HIBC', 'TBC', 'PERC', 'Other'].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Panel Brand */}
                  <FormField control={form.control} name="panelBrand" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PANEL_BRANDS.map(pb => <SelectItem key={pb} value={pb}>{pb}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Panel Wattage */}
                  <FormField control={form.control} name="panelWattage" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Wattage (W)</FormLabel>
                      <FormControl><Input type="number" placeholder="585" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* No. of Panels */}
                  <FormField control={form.control} name="noOfPanels" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">No of Panels</FormLabel>
                      <FormControl><Input type="number" placeholder="10" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Total Wattage (calculated) */}
                  <div className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-gray-700">Total Wattage (Calculated)</FormLabel>
                    <Input readOnly value={`${totalPanelWattage} W`} className="h-10 text-xs font-mono font-bold bg-amber-50/50 text-[var(--color-ink)] border-amber-200" />
                  </div>

                  {/* Panel Type */}
                  <FormField control={form.control} name="panelType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Monofacial">Monofacial</SelectItem>
                          <SelectItem value="Bifacial">Bifacial</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Panel Warranty */}
                  <FormField control={form.control} name="panelWarrantyExpiry" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-amber-900">Panel Warranty End Date</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10 text-xs border-amber-300" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Battery Category */}
                  <FormField control={form.control} name="batteryCategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Battery Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="High Voltage">High Voltage</SelectItem>
                          <SelectItem value="Low Voltage">Low Voltage</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Battery Type */}
                  <FormField control={form.control} name="batteryType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Battery Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Lithium">Lithium</SelectItem>
                          <SelectItem value="Lead Acid">Lead Acid</SelectItem>
                          <SelectItem value="Dry">Dry</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Battery Brand */}
                  <FormField control={form.control} name="batteryBrand" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Battery Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {BATTERY_BRANDS.map(bb => <SelectItem key={bb} value={bb}>{bb}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* No. of Batteries */}
                  <FormField control={form.control} name="noOfBatteries" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">No. of Batteries</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Battery Warranty */}
                  <FormField control={form.control} name="batteryWarrantyExpiry" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-amber-900">Battery Warranty End Date</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10 text-xs border-amber-300" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Earthing */}
                  <FormField control={form.control} name="earthingType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Earthing</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="DC">DC</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* OHMs */}
                  <FormField control={form.control} name="earthingOhms" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">OHMs</FormLabel>
                      <FormControl><Input placeholder="0.5" {...field} className="h-10 text-xs font-mono" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Ingress Protection */}
                  <FormField control={form.control} name="ingressProtection" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Ingress Protection (IP)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['IP20', 'IP21', 'IP34', 'IP40', 'IP54', 'IP65'].map(ip => (
                            <SelectItem key={ip} value={ip}>{ip}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Structure Type */}
                  <FormField control={form.control} name="structureType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Structure Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Elevated">Elevated</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Structure Material */}
                  <FormField control={form.control} name="structureMaterial" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Structure Coating / Material</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['Painted', 'Aluminium', 'Hot Dip Galvanized', 'Pre Galvanized', 'L1', 'L2', 'L3', 'L4'].map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Installation Date */}
                  <FormField control={form.control} name="installationDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">System Installation Date</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="flex justify-between pt-4 border-t border-line">
                  <Button type="button" variant="outline" onClick={() => setActiveTab(1)} className="text-xs gap-2">
                    <ChevronLeft className="w-4 h-4" /> Previous: Customer Details
                  </Button>
                  <Button type="button" onClick={() => setActiveTab(3)} className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold text-xs gap-2 px-6 shadow-sm">
                    Next: Installer Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 3: Installer Details & Audit Checklist
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 3 && (
            <Card className="shadow-sm border-line bg-white animate-reveal">
              <CardContent className="p-6 space-y-6">
                <div className="border-b border-line pb-3">
                  <h2 className="text-lg font-bold text-[var(--color-graphite)]">3. Installer Details &amp; System Audit</h2>
                  <p className="text-xs text-[var(--color-slate-custom)]">Enter installer contact info, last audit date, and component audit statuses.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Installation Date */}
                  <FormField control={form.control} name="installationDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Date of Installation</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Installer Name */}
                  <FormField control={form.control} name="installerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Installer Name</FormLabel>
                      <FormControl><Input placeholder="Usman Waheed..." {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Company */}
                  <FormField control={form.control} name="installerCompany" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Company</FormLabel>
                      <FormControl><Input placeholder="EY Enterprise..." {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Installer Address */}
                  <FormField control={form.control} name="installerAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Address</FormLabel>
                      <FormControl><Input placeholder="Lahore..." {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Installer Contact */}
                  <FormField control={form.control} name="installerContact" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Contact No</FormLabel>
                      <FormControl><Input placeholder="03000000000..." {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Installer Email */}
                  <FormField control={form.control} name="installerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="installer@example.com" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Last Audit Date */}
                  <FormField control={form.control} name="lastAuditDate" render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel className="text-xs font-semibold">Last Audit of System Date</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10 text-xs max-w-xs" /></FormControl>
                    </FormItem>
                  )} />
                </div>

                {/* 7-Point Audit Checklist */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">System Components Audit Checklist</h3>
                  <div className="border border-amber-200/80 rounded-xl overflow-hidden bg-amber-50/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {[
                        { name: 'inverterAuditStatus',   label: 'Inverter Status' },
                        { name: 'panelAuditStatus',      label: 'Panel Status' },
                        { name: 'batteryAuditStatus',    label: 'Battery Status' },
                        { name: 'structureAuditStatus',  label: 'Structure Status' },
                        { name: 'cableAuditStatus',      label: 'Cable Status' },
                        { name: 'earthingAuditStatus',   label: 'AC/DC Earthing Status' },
                        { name: 'breakersAuditStatus',   label: 'Breakers Status' },
                      ].map((item) => (
                        <FormField
                          key={item.name}
                          control={form.control}
                          name={item.name as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border border-gray-200">
                              <FormLabel className="text-xs font-bold text-gray-800 m-0">{item.label}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="h-8 text-xs w-48"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {AUDIT_STATUSES.map(st => (
                                    <SelectItem key={st} value={st}>{st}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-line">
                  <Button type="button" variant="outline" onClick={() => setActiveTab(2)} className="text-xs gap-2">
                    <ChevronLeft className="w-4 h-4" /> Previous: Solar System Details
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || form.formState.isSubmitting}
                    className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold text-sm px-8 h-11 shadow-md gap-2"
                  >
                    {uploading || form.formState.isSubmitting ? 'Creating Sale...' : 'Create Sale'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  )
}
