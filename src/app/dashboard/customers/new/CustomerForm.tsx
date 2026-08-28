'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createCustomer } from './actions'
import { uploadFile } from '@/utils/supabase/storage'
import { CustomerType } from '@prisma/client'
import { ChevronRight, ChevronLeft, CheckCircle2, Check, Sparkles, Loader2, AlertCircle, Download, FileText, Camera, UploadCloud, Image as ImageIcon, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AutoSuggestInput } from '@/components/ui/auto-suggest-input'
import { CITIES_LIST, getAreasForCity, getDefaultDiscoForCity } from '@/lib/pakistan-cities-areas'
import { formatDiscoRefNo } from '@/lib/utils'
import { SYSTEM_SIZES, INVERTER_SIZES, INVERTER_BRANDS, PANEL_BRANDS, BATTERY_BRANDS, IP_LIST, DISCO_LIST, STRUCTURE_TYPES, STRUCTURE_MATERIALS } from '@/lib/solar-constants'
import { calculatePackageBreakdown } from '@/lib/pricing'


const customerSchema = z.object({
  // TAB 1: Customer Details + Package Details
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  customerType: z.string().min(1, 'Please select Customer Type'),
  contactNumber: z.string().min(10, 'Contact number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  cnic: z.string().min(13, 'CNIC number is required'),
  cnicExpiry: z.string().optional(),
  houseNo: z.string().optional(),
  streetNo: z.string().optional(),
  block: z.string().optional(),
  subArea: z.string().optional(),
  area: z.string().optional(),
  city: z.string().min(1, 'Please select or type a City'),
  country: z.string().default('Pakistan'),
  coordinates: z.string().optional(),
  address: z.string().min(3, 'Address is required'),
  signUpDate: z.string().optional(),
  customerStatus: z.string().default('SIGNUP_GENERATED'),
  accountExecutiveId: z.string().optional(),
  accountExecutiveName: z.string().optional(),

  // Package Details (Section 2 in Tab 1)
  systemSizeKw: z.string().min(1, 'Please select System Capacity'),
  packageTier: z.string().min(1, 'Please select Package Tier'),
  billingType: z.string().min(1, 'Please select Billing Type'),
  monitoringTime: z.string().min(1, 'Please select Monitoring Time'),
  monthlyBasePrice: z.coerce.number().default(0),
  salesTaxAmount: z.coerce.number().default(0),
  onboardingFee: z.coerce.number().default(0),
  totalAmount: z.coerce.number().default(0),
  paidAmount: z.coerce.number().default(0),

  // TAB 2: Solar System Details (Optional defaults for technical specs)
  meterType: z.string().optional(),
  zeroExportDevice: z.string().optional(),
  disco: z.string().optional(),
  discoRefNo: z.string().optional(),
  inverterBrand: z.string().optional(),
  inverterType: z.string().optional(),
  inverterPhase: z.string().optional(),
  noOfInverters: z.coerce.number().default(0),
  inverterSerial: z.string().optional(),
  inverterCategory: z.string().optional(),
  inverterSize: z.string().optional(),
  inverterWarrantyExpiry: z.string().optional(),
  meterPhase: z.string().optional(),
  panelTechnology: z.string().optional(),
  panelBrand: z.string().optional(),
  panelWattage: z.coerce.number().default(0),
  noOfPanels: z.coerce.number().default(0),
  panelType: z.string().optional(),
  panelWarrantyExpiry: z.string().optional(),
  batteryCategory: z.string().optional(),
  batteryType: z.string().optional(),
  batteryBrand: z.string().optional(),
  noOfBatteries: z.coerce.number().default(0),
  batteryWarrantyExpiry: z.string().optional(),
  earthingType: z.string().optional(),
  earthingOhms: z.string().default('0'),
  lastCheckDate: z.string().optional(),
  ingressProtection: z.string().optional(),
  structureType: z.string().optional(),
  structureMaterial: z.string().optional(),
  installationDate: z.string().optional(),

  // TAB 3: Installer Details & System Audit (Optional at initial sale intake)
  installerName: z.string().optional(),
  installerCompany: z.string().optional(),
  installerAddress: z.string().optional(),
  installerContact: z.string().optional(),
  installerEmail: z.string().optional(),
  lastAuditDate: z.string().optional(),
  inverterAuditStatus: z.string().optional(),
  panelAuditStatus: z.string().optional(),
  batteryAuditStatus: z.string().optional(),
  structureAuditStatus: z.string().optional(),
  cableAuditStatus: z.string().optional(),
  earthingAuditStatus: z.string().optional(),
  breakersAuditStatus: z.string().optional(),
})

export function CustomerForm({ users }: { users?: { id: string, fullName: string, role: string }[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cnicFrontFile, setCnicFrontFile] = useState<File | null>(null)
  const [cnicBackFile, setCnicBackFile] = useState<File | null>(null)
  const [successModalData, setSuccessModalData] = useState<{
    customerId: string
    fullName: string
    crfNumber: string
    totalAmount: number
  } | null>(null)

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      fullName: '',
      customerType: '',
      contactNumber: '',
      email: '',
      cnic: '',
      cnicExpiry: '',
      houseNo: '',
      streetNo: '',
      block: '',
      subArea: '',
      area: '',
      city: '',
      country: 'Pakistan',
      coordinates: '',
      address: '',
      signUpDate: '',
      customerStatus: 'SIGNUP_GENERATED',
      accountExecutiveId: 'none',
      accountExecutiveName: '',

      systemSizeKw: '',
      packageTier: '',
      billingType: '',
      monitoringTime: '',
      monthlyBasePrice: 0,
      salesTaxAmount: 0,
      onboardingFee: 0,
      totalAmount: 0,
      paidAmount: 0,

      meterType: '',
      zeroExportDevice: '',
      disco: '',
      discoRefNo: '',
      inverterBrand: '',
      inverterType: '',
      inverterPhase: '',
      noOfInverters: 0,
      inverterSerial: '',
      inverterCategory: '',
      inverterSize: '',
      inverterWarrantyExpiry: '',
      meterPhase: '',
      panelTechnology: '',
      panelBrand: '',
      panelWattage: 0,
      noOfPanels: 0,
      panelType: '',
      panelWarrantyExpiry: '',
      batteryCategory: '',
      batteryType: '',
      batteryBrand: '',
      noOfBatteries: 0,
      batteryWarrantyExpiry: '',
      earthingType: '',
      earthingOhms: '0',
      lastCheckDate: '',
      ingressProtection: '',
      structureType: '',
      structureMaterial: '',
      installationDate: '',

      installerName: '',
      installerCompany: '',
      installerAddress: '',
      installerContact: '',
      installerEmail: '',
      lastAuditDate: '',
      inverterAuditStatus: '',
      panelAuditStatus: '',
      batteryAuditStatus: '',
      structureAuditStatus: '',
      cableAuditStatus: '',
      earthingAuditStatus: '',
      breakersAuditStatus: '',
    },
  })

  // Dynamic Pricing Calculation from Centralized Pricing Engine
  const systemSizeKw   = form.watch('systemSizeKw')
  const packageTier    = form.watch('packageTier')
  const billingType    = form.watch('billingType')
  const monitoringTime = form.watch('monitoringTime')
  const panelWattage   = form.watch('panelWattage') || 0
  const noOfPanels     = form.watch('noOfPanels')   || 0
  const totalPanelWattage = panelWattage * noOfPanels

  const breakdown = calculatePackageBreakdown(systemSizeKw, packageTier, billingType, monitoringTime)
  const {
    baseMonthlyRate,
    months,
    discountPct,
    discountAmount,
    priceAfterDiscount,
    salesTax,
    onboardingFee,
    isOnboardingWaived,
    grandTotal,
  } = breakdown

  const noOfInvertersValue = form.watch('noOfInverters') ?? 1
  const [inverterList, setInverterList] = useState<Array<{ brand: string; serial: string; warrantyExpiry: string }>>([
    { brand: '', serial: '', warrantyExpiry: '' }
  ])

  // Sync inverter list with noOfInverters count
  useEffect(() => {
    const count = Math.max(1, Number(noOfInvertersValue) || 1)
    setInverterList(prev => {
      if (prev.length === count) return prev
      if (prev.length < count) {
        const primaryBrand = prev[0]?.brand || form.getValues('inverterBrand') || ''
        const added = Array.from({ length: count - prev.length }, () => ({
          brand: primaryBrand,
          serial: '',
          warrantyExpiry: ''
        }))
        return [...prev, ...added]
      }
      return prev.slice(0, count)
    })
  }, [noOfInvertersValue, form])

  const handleInverterChange = (index: number, key: 'brand' | 'serial' | 'warrantyExpiry', value: string) => {
    const updated = [...inverterList]
    if (!updated[index]) return
    updated[index] = { ...updated[index], [key]: value }
    setInverterList(updated)

    // Sync back to form
    const allBrands = Array.from(new Set(updated.map(i => i.brand).filter(Boolean))).join(', ')
    const allSerials = updated.map(i => i.serial).filter(Boolean).join(', ')
    form.setValue('inverterBrand', allBrands || updated[0]?.brand || '')
    form.setValue('inverterSerial', allSerials || updated[0]?.serial || '')
    form.setValue('inverterWarrantyExpiry', updated[0]?.warrantyExpiry || '')
  }

  // Multi-battery dynamic warranty state
  const noOfBatteriesValue = form.watch('noOfBatteries') ?? 0
  const [batteryWarrantyList, setBatteryWarrantyList] = useState<string[]>([])

  // Sync battery warranty list with noOfBatteries count
  useEffect(() => {
    const count = Math.max(0, Number(noOfBatteriesValue) || 0)
    setBatteryWarrantyList(prev => {
      if (prev.length === count) return prev
      if (prev.length < count) {
        return [...prev, ...Array(count - prev.length).fill('')]
      }
      return prev.slice(0, count)
    })
  }, [noOfBatteriesValue])

  const handleBatteryWarrantyChange = (index: number, value: string) => {
    const updated = [...batteryWarrantyList]
    updated[index] = value
    setBatteryWarrantyList(updated)
    form.setValue('batteryWarrantyExpiry', updated[0] || '')
  }

  // Photos per inverter and battery unit
  const [inverterPhotos, setInverterPhotos] = useState<Array<File | null>>([null])
  const [batteryPhotos, setBatteryPhotos] = useState<Array<File | null>>([])

  // Keep inverterPhotos aligned with inverter count
  useEffect(() => {
    const count = Math.max(1, Number(noOfInvertersValue) || 1)
    setInverterPhotos(prev => {
      if (prev.length === count) return prev
      if (prev.length < count) {
        return [...prev, ...Array(count - prev.length).fill(null)]
      }
      return prev.slice(0, count)
    })
  }, [noOfInvertersValue])

  // Keep batteryPhotos aligned with battery count
  useEffect(() => {
    const count = Math.max(0, Number(noOfBatteriesValue) || 0)
    setBatteryPhotos(prev => {
      if (prev.length === count) return prev
      if (prev.length < count) {
        return [...prev, ...Array(count - prev.length).fill(null)]
      }
      return prev.slice(0, count)
    })
  }, [noOfBatteriesValue])

  // Auto-sync DISCO based on selected City
  const selectedCity = form.watch('city')
  useEffect(() => {
    const disco = getDefaultDiscoForCity(selectedCity)
    if (disco) {
      form.setValue('disco', disco)
    }
  }, [selectedCity, form])

  // Auto-sync formatted address string
  const houseNoVal = form.watch('houseNo')
  const streetNoVal = form.watch('streetNo')
  const blockVal = form.watch('block')
  const subAreaVal = form.watch('subArea')
  const areaVal = form.watch('area')
  const cityVal = form.watch('city')

  useEffect(() => {
    const parts = [
      houseNoVal ? `House ${houseNoVal}` : '',
      streetNoVal ? `Street ${streetNoVal}` : '',
      blockVal ? `Block ${blockVal}` : '',
      subAreaVal,
      areaVal,
      cityVal
    ].filter(Boolean)
    const formattedAddress = parts.join(', ')
    form.setValue('address', formattedAddress || cityVal || 'N/A')
  }, [houseNoVal, streetNoVal, blockVal, subAreaVal, areaVal, cityVal, form])

  useEffect(() => {
    form.setValue('monthlyBasePrice', Math.round(priceAfterDiscount))
    form.setValue('salesTaxAmount',   Math.round(salesTax))
    form.setValue('onboardingFee',    Math.round(onboardingFee))
    form.setValue('totalAmount',      Math.round(grandTotal))
  }, [systemSizeKw, packageTier, billingType, monitoringTime, form, priceAfterDiscount, salesTax, onboardingFee, grandTotal])

  function onInvalid(errors: any) {
    const errorKeys = Object.keys(errors)
    const tab1Fields = [
      'fullName', 'customerType', 'contactNumber', 'email', 'cnic', 'cnicExpiry',
      'houseNo', 'streetNo', 'block', 'subArea', 'area', 'city', 'address', 'signUpDate', 'accountExecutiveId',
      'systemSizeKw', 'packageTier', 'billingType', 'monitoringTime'
    ]
    const tab2Fields = [
      'meterType', 'zeroExportDevice', 'disco', 'discoRefNo', 'inverterBrand', 'inverterType',
      'inverterPhase', 'noOfInverters', 'inverterSerial', 'inverterCategory', 'inverterSize',
      'meterPhase', 'panelTechnology', 'panelBrand', 'panelWattage', 'noOfPanels', 'panelType',
      'batteryCategory', 'batteryType', 'batteryBrand', 'noOfBatteries', 'earthingType',
      'earthingOhms', 'ingressProtection', 'structureType', 'structureMaterial', 'installationDate'
    ]

    const hasTab1Error = errorKeys.some(k => tab1Fields.includes(k))
    const hasTab2Error = errorKeys.some(k => tab2Fields.includes(k))

    let tabTarget = 3
    if (hasTab1Error) {
      tabTarget = 1
    } else if (hasTab2Error) {
      tabTarget = 2
    }

    setActiveTab(tabTarget)

    const messages = errorKeys.map(k => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      return `${label}: ${errors[k]?.message || 'Required field'}`
    })

    setError(`Form Error(s) on Tab ${tabTarget}: Please complete required fields (${messages.join(' | ')})`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleNextTab(targetTab: number) {
    if (targetTab === 2) {
      const isTab1Valid = await form.trigger([
        'fullName', 'customerType', 'contactNumber', 'cnic', 'city', 'address',
        'systemSizeKw', 'packageTier', 'billingType', 'monitoringTime'
      ])
      if (isTab1Valid) {
        setError(null)
        setActiveTab(2)
      } else {
        const fieldErrors = form.formState.errors
        const errList = Object.keys(fieldErrors)
          .map(k => (fieldErrors as any)[k]?.message)
          .filter(Boolean)
        setError(`Please fill required fields in Customer Details (Tab 1): ${errList.join(' | ') || 'Required fields missing'}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (targetTab === 3) {
      setError(null)
      setActiveTab(3)
    }
  }

  async function onSubmit(values: z.infer<typeof customerSchema>) {
    setError(null)
    setUploading(true)

    try {
      async function uploadFileToR2(file: File, folder: string): Promise<string | null> {
        try {
          const data = new FormData()
          data.append('file', file)
          data.append('folder', folder)
          const res = await fetch('/api/upload/r2', { method: 'POST', body: data })
          if (!res.ok) return null
          const result = await res.json()
          return result.url || null
        } catch (err) {
          console.error('R2 Upload error:', err)
          return null
        }
      }

      let cnicFrontUrl = null
      if (cnicFrontFile) {
        cnicFrontUrl = await uploadFileToR2(cnicFrontFile, 'cnics')
      }

      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'none') formData.append(key, value.toString())
      })

      // Multi-inverter joined data
      const allInverterBrands = inverterList.map(i => i.brand).filter(Boolean).join(', ')
      const allInverterSerials = inverterList.map(i => i.serial).filter(Boolean).join(', ')
      const primaryInverterWarranty = inverterList[0]?.warrantyExpiry || values.inverterWarrantyExpiry
      if (allInverterBrands) formData.set('inverterBrand', allInverterBrands)
      if (allInverterSerials) formData.set('inverterSerial', allInverterSerials)
      if (primaryInverterWarranty) formData.set('inverterWarrantyExpiry', primaryInverterWarranty)

      // Multi-battery warranty data
      const primaryBatteryWarranty = batteryWarrantyList[0] || values.batteryWarrantyExpiry
      if (primaryBatteryWarranty) formData.set('batteryWarrantyExpiry', primaryBatteryWarranty)

      // Upload inverter photos to Cloudflare R2 Cloud
      const inverterImageUrls: string[] = []
      for (let i = 0; i < inverterPhotos.length; i++) {
        const file = inverterPhotos[i]
        if (file) {
          const url = await uploadFileToR2(file, 'equipment/inverters')
          if (url) inverterImageUrls.push(url)
        }
      }

      // Upload battery photos to Cloudflare R2 Cloud
      const batteryImageUrls: string[] = []
      for (let i = 0; i < batteryPhotos.length; i++) {
        const file = batteryPhotos[i]
        if (file) {
          const url = await uploadFileToR2(file, 'equipment/batteries')
          if (url) batteryImageUrls.push(url)
        }
      }

      if (inverterImageUrls.length > 0) {
        formData.append('inverterImages', JSON.stringify(inverterImageUrls))
      }
      if (batteryImageUrls.length > 0) {
        formData.append('batteryImages', JSON.stringify(batteryImageUrls))
      }

      formData.append('appliedDiscount', Math.round(discountAmount).toString())
      formData.append('salesTaxAmount',  Math.round(salesTax).toString())
      formData.append('onboardingFee',   Math.round(onboardingFee).toString())
      formData.append('totalAmount',     Math.round(grandTotal).toString())
      if (cnicFrontUrl) formData.append('cnicImageUrl', cnicFrontUrl)

      const result = await createCustomer(formData)

      if (result?.error) {
        const isServerError = result.error.toLowerCase().includes('server') || result.error.toLowerCase().includes('database') || result.error.toLowerCase().includes('administrator')
        setError(isServerError ? result.error : `Server Error: ${result.error}. Please contact site administrator.`)
        setUploading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (result?.success) {
        const custName = form.getValues('fullName') || 'New Customer'
        const generatedCrf = `CRF-${result.customerId.slice(0, 6)}`
        setSuccessModalData({
          customerId: result.customerId,
          fullName: custName,
          crfNumber: generatedCrf,
          totalAmount: grandTotal,
        })
        setUploading(false)
      } else {
        setUploading(false)
      }
    } catch (err: any) {
      console.error('Error creating customer:', err)
      setError(`Server Error: ${err?.message || 'Unexpected failure occurred'}. Please contact site administrator.`)
      setUploading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // 3-step tabs
  const tabs = [
    { id: 1, label: 'Customer Details' },
    { id: 2, label: 'Solar System Details' },
    { id: 3, label: 'System Audit Details' },
  ]


  const DISCO_LIST = ['LESCO', 'IESCO', 'K-Electric', 'FESCO', 'MEPCO', 'PESCO', 'GEPCO', 'QESCO', 'HESCO', 'SEPCO', 'TESCO', 'Other']

  const DISCO_PLACEHOLDERS: Record<string, string> = {
    'LESCO': 'e.g. 04-11524-1234567',
    'IESCO': 'e.g. 01-14321-1234567',
    'K-Electric': 'e.g. 0400012345678 (13 Digits)',
    'FESCO': 'e.g. 03-12345-1234567',
    'MEPCO': 'e.g. 05-15432-1234567',
    'PESCO': 'e.g. 06-16543-1234567',
    'GEPCO': 'e.g. 02-13210-1234567',
    'QESCO': 'e.g. 07-17654-1234567',
    'HESCO': 'e.g. 08-18765-1234567',
    'SEPCO': 'e.g. 09-19876-1234567',
    'TESCO': 'e.g. 10-10987-1234567',
  }

  const AUDIT_STATUSES = ['Excellent', 'Good', 'Fair', 'Service Required', 'Replacement Required']

  return (
    <div className="space-y-6 relative">
      {/* Full-Screen Loading & Processing Overlay Modal */}
      {(uploading || form.formState.isSubmitting) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-100 border-t-[var(--color-amber)] animate-spin" />
              <Loader2 className="w-8 h-8 text-[var(--color-amber)] animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">Creating Customer Sale...</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Please wait while we process documents, register the customer profile, and setup initial financial ledgers.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 py-2.5 px-3 rounded-xl border border-amber-200/60">
              <Sparkles className="w-4 h-4 animate-pulse text-amber-600" />
              Processing sale securely, please do not close...
            </div>
          </div>
        </div>
      )}



      {/* Sales Intake Form */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          {error && (
            <div className="p-4 text-xs bg-red-50 border-2 border-red-200 text-red-800 rounded-xl font-semibold flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-red-900">Form Action Required</p>
                <p>{error}</p>
              </div>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Customer Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Customer Name *</FormLabel>
                          <FormControl><Input placeholder="e.g. Yousaf Zaman" {...field} className="h-10 text-xs" /></FormControl>
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
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Customer Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                                <SelectValue placeholder="Select Customer Type..." />
                              </SelectTrigger>
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
                          <FormControl>
                            <AutoSuggestInput
                              value={field.value || ''}
                              onChange={field.onChange}
                              options={getAreasForCity(form.watch('city'))}
                              placeholder="Type or select society (e.g. DHA, Bahria Town...)"
                              className="h-10 text-xs bg-white"
                            />
                          </FormControl>
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
                          <FormControl>
                            <AutoSuggestInput
                              value={field.value || ''}
                              onChange={(val) => {
                                field.onChange(val)
                                const disco = getDefaultDiscoForCity(val)
                                if (disco) form.setValue('disco', disco)
                              }}
                              options={CITIES_LIST}
                              placeholder="Type or select city..."
                              className="h-10 text-xs bg-white font-semibold"
                            />
                          </FormControl>
                          <FormMessage />
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

                    {/* GPS Coordinates */}
                    <FormField
                      control={form.control}
                      name="coordinates"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-semibold text-amber-950">GPS Coordinates / Map Link</FormLabel>
                            {field.value && (
                              <a
                                href={
                                  field.value.startsWith('http')
                                    ? field.value
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(field.value)}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline inline-flex items-center gap-0.5"
                              >
                                Test Pin ↗
                              </a>
                            )}
                          </div>
                          <FormControl>
                            <Input
                              placeholder="e.g. 31.4707, 74.4101 or Maps Link"
                              {...field}
                              className="h-10 text-xs font-mono bg-white border-amber-300 focus-visible:ring-amber-500"
                            />
                          </FormControl>
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

                    {/* Sign Up Date */}
                    <FormField
                      control={form.control}
                      name="signUpDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Sign Up Date</FormLabel>
                          <FormControl><DateInput value={field.value || ''} onChange={field.onChange} className="h-10" /></FormControl>
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
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs font-semibold">CNIC Expiry Date</FormLabel>
                          <FormControl><DateInput value={field.value || ''} onChange={field.onChange} className="h-10" /></FormControl>
                        </FormItem>
                      )}
                    />

                    {/* CNIC Snapshots (One Line) */}
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    </div>
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
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Type (Capacity) */}
                    <FormField
                      control={form.control}
                      name="systemSizeKw"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">System Type (Capacity) *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                                <SelectValue placeholder="Select System Capacity..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SYSTEM_SIZES.map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Package */}
                    <FormField
                      control={form.control}
                      name="packageTier"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Package *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                                <SelectValue placeholder="Select Package Tier..." />
                              </SelectTrigger>
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

                    {/* Billing Type (Revised Discounts: 10% Quarterly, 20% Half Yearly, 40% Yearly) */}
                    <FormField
                      control={form.control}
                      name="billingType"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Billing Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                                <SelectValue placeholder="Select Billing Type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Quarterly">Quarterly (10% Off)</SelectItem>
                              <SelectItem value="Half Yearly">Half Yearly (20% Off)</SelectItem>
                              <SelectItem value="Yearly">Yearly (40% Off)</SelectItem>
                              <SelectItem value="FOC">FOC (Free of Cost)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Monitoring Time */}
                    <FormField
                      control={form.control}
                      name="monitoringTime"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Monitoring Time *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                                <SelectValue placeholder="Select Monitoring Coverage..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12 Hours">12 Hours Daytime</SelectItem>
                              <SelectItem value="24 Hours">24 Hours Continuous</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
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

                    {/* Account Executive Sales */}
                    <FormField
                      control={form.control}
                      name="accountExecutiveId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Account Executive Sales Name</FormLabel>
                          <Select onValueChange={(val) => {
                            field.onChange(val)
                            const sel = users?.find(u => u.id === val)
                            if (sel) form.setValue('accountExecutiveName', sel.fullName)
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Select Account Executive Sales" /></SelectTrigger>
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

                  {/* Activation note */}
                  <div className="pt-1">
                    <p className="text-[11px] text-gray-400">
                      Activation Date will be set automatically when the O&amp;M Manager activates the customer.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Option */}
              <div className="flex items-center justify-end pt-2">
                <Button
                  type="submit"
                  disabled={uploading || form.formState.isSubmitting}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 px-8 py-3 h-11 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Sale for Sales Manager Approval
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: Solar System Details
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 2 && (
            <Card className="shadow-sm border-line bg-white animate-reveal">
              <CardContent className="p-6 space-y-7">
                <div className="border-b border-line pb-3">
                  <h2 className="text-lg font-bold text-[var(--color-graphite)]">2. Solar System Details</h2>
                </div>

                {/* 1. Meter & Utility Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Meter Type */}
                  <FormField control={form.control} name="meterType" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Meter Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Meter Type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Green Meter">Green Meter</SelectItem>
                          <SelectItem value="Non Green">Non Green</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Zero Export Device */}
                  <FormField control={form.control} name="zeroExportDevice" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Zero Export Device *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Device Status..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Installed">Installed</SelectItem>
                          <SelectItem value="Not Installed">Not Installed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* DISCO Utility Company */}
                  <FormField control={form.control} name="disco" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">DISCO Utility Company *</FormLabel>
                      <FormControl>
                        <AutoSuggestInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          options={DISCO_LIST}
                          placeholder="Type or select DISCO company..."
                          className={`h-10 text-xs bg-white ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* DISCO Customer ID # */}
                  <FormField control={form.control} name="discoRefNo" render={({ field }) => {
                    const currentDisco = form.watch('disco') || 'LESCO'
                    return (
                      <FormItem className="md:col-span-3">
                        <FormLabel className="text-xs font-bold text-[#002868]">{currentDisco} Customer ID #</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 04-11515-0469701 U"
                            value={field.value || ''}
                            onChange={(e) => {
                              const formatted = formatDiscoRefNo(e.target.value)
                              field.onChange(formatted)
                            }}
                            className="h-10 text-xs font-mono font-bold tracking-wider max-w-md"
                          />
                        </FormControl>
                      </FormItem>
                    )
                  }} />
                </div>

                {/* 2. Inverter Configuration Section */}
                <div className="space-y-4 pt-2 border-t border-line/60">
                  <h3 className="text-xs font-bold text-[#002868] uppercase tracking-wider">Inverter Configuration &amp; Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {/* Inverter Type */}
                    <FormField control={form.control} name="inverterType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Inverter Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Inverter Type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="OnGrid">On-Grid</SelectItem>
                            <SelectItem value="OffGrid">Off-Grid</SelectItem>
                            <SelectItem value="Hybrid+OnGrid">Hybrid + On-Grid</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Inverter Phase Type */}
                    <FormField control={form.control} name="inverterPhase" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Inverter Phase Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Phase..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single Phase">Single Phase</SelectItem>
                            <SelectItem value="Three Phase">Three Phase</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Inverter Category */}
                    <FormField control={form.control} name="inverterCategory" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Inverter Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Category..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low Voltage">Low Voltage</SelectItem>
                            <SelectItem value="High Voltage">High Voltage</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Inverter Size */}
                    <FormField control={form.control} name="inverterSize" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Inverter Size *</FormLabel>
                        <FormControl>
                          <AutoSuggestInput
                            value={field.value || ''}
                            onChange={field.onChange}
                            options={INVERTER_SIZES}
                            placeholder="Type or select size (e.g. 6kW)..."
                            className="h-10 text-xs bg-white"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* Meter Phase */}
                    <FormField control={form.control} name="meterPhase" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Meter Phase</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Meter Phase..." />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormLabel className="text-xs font-bold text-[#002868]">No. of Inverters *</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const current = Math.max(1, (Number(field.value) || 1) - 1)
                                field.onChange(current)
                              }}
                              className="h-10 w-10 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              value={field.value || 1}
                              onChange={(e) => {
                                const val = Math.max(1, Number(e.target.value) || 1)
                                field.onChange(val)
                              }}
                              className="h-10 text-xs font-bold text-center font-mono bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const current = Math.min(20, (Number(field.value) || 1) + 1)
                                field.onChange(current)
                              }}
                              className="h-10 w-10 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                            >
                              +
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Dynamic Multi-Inverter Brand, Serial, Warranty & Photo Upload List */}
                  <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">
                        Inverter Unit Details ({inverterList.length || 1} {inverterList.length === 1 ? 'Unit' : 'Units'})
                      </p>
                      
                    </div>

                    <div className="space-y-3">
                      {(inverterList.length > 0 ? inverterList : [{ brand: form.watch('inverterBrand') || '', serial: form.watch('inverterSerial') || '', warrantyExpiry: form.watch('inverterWarrantyExpiry') || '' }]).map((inv, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-800">Inverter #{idx + 1} Configuration &amp; Photo</span>
                            {inverterPhotos[idx] && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Selected
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Inverter #{idx + 1} Brand *
                              </label>
                              <AutoSuggestInput
                                value={inv.brand || ''}
                                onChange={(val) => handleInverterChange(idx, 'brand', val)}
                                options={INVERTER_BRANDS}
                                placeholder="Type or select brand..."
                                className="h-9 text-xs bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Inverter #{idx + 1} Serial # *
                              </label>
                              <Input
                                placeholder="Serial number..."
                                value={inv.serial || ''}
                                onChange={(e) => handleInverterChange(idx, 'serial', e.target.value)}
                                className="h-9 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Inverter #{idx + 1} Warranty End Date
                              </label>
                              <DateInput
                                value={inv.warrantyExpiry || ''}
                                onChange={(e) => handleInverterChange(idx, 'warrantyExpiry', e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-amber-900 block mb-1">
                                📷 Upload Inverter #{idx + 1} Photo
                              </label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  setInverterPhotos(prev => {
                                    const updated = [...prev]
                                    updated[idx] = file
                                    return updated
                                  })
                                }}
                                className="h-9 text-xs border-amber-300 bg-amber-50/20 file:bg-amber-100 file:text-amber-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Solar Panels Section */}
                <div className="space-y-4 pt-2 border-t border-line/60">
                  <h3 className="text-xs font-bold text-[#002868] uppercase tracking-wider">Solar Panel Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {/* Panel Technology */}
                    <FormField control={form.control} name="panelTechnology" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Panel Technology *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Technology..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['TOPCON', 'ABC', 'HJT', 'HIBC', 'TBC', 'PERC', 'Monocrystalline', 'Polycrystalline', 'Other'].map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Panel Brand */}
                    <FormField control={form.control} name="panelBrand" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Panel Brand *</FormLabel>
                        <FormControl>
                          <AutoSuggestInput
                            value={field.value || ''}
                            onChange={field.onChange}
                            options={PANEL_BRANDS}
                            placeholder="Type or select panel brand..."
                            className="h-10 text-xs bg-white"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* Panel Wattage (W) */}
                    <FormField control={form.control} name="panelWattage" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Panel Wattage (W) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 585"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            className="h-10 text-xs font-bold"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* No of Panels */}
                    <FormField control={form.control} name="noOfPanels" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">No of Panels *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 10"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            className="h-10 text-xs font-bold"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* Total Wattage (Calculated) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Total Wattage (Calculated)</label>
                      <div className="h-10 px-3 bg-amber-50/70 border border-amber-300/80 rounded-md flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-950">
                          {((form.watch('panelWattage') || 0) * (form.watch('noOfPanels') || 0)).toLocaleString()} W
                        </span>
                        <span className="text-[11px] font-semibold text-amber-700">
                          ({(((form.watch('panelWattage') || 0) * (form.watch('noOfPanels') || 0)) / 1000).toFixed(2)} kW)
                        </span>
                      </div>
                    </div>

                    {/* Panel Type */}
                    <FormField control={form.control} name="panelType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Panel Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Panel Type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Monofacial">Monofacial</SelectItem>
                            <SelectItem value="Bifacial">Bifacial</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Panel Warranty End Date */}
                    <FormField control={form.control} name="panelWarrantyExpiry" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Panel Warranty End Date</FormLabel>
                        <FormControl>
                          <DateInput value={field.value || ''} onChange={field.onChange} className="h-10" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* 4. Battery Storage Section */}
                <div className="space-y-4 pt-2 border-t border-line/60">
                  <h3 className="text-xs font-bold text-[#002868] uppercase tracking-wider">Battery Storage Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {/* Battery Category */}
                    <FormField control={form.control} name="batteryCategory" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Battery Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Category..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="High Voltage">High Voltage</SelectItem>
                            <SelectItem value="Low Voltage">Low Voltage</SelectItem>
                            <SelectItem value="Not Installed">Not Installed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Battery Type */}
                    <FormField control={form.control} name="batteryType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Battery Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Battery Type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Lithium">Lithium</SelectItem>
                            <SelectItem value="Tubular">Tubular</SelectItem>
                            <SelectItem value="Lead Acid">Lead Acid</SelectItem>
                            <SelectItem value="Gel">Gel</SelectItem>
                            <SelectItem value="Not Installed">Not Installed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Battery Brand */}
                    <FormField control={form.control} name="batteryBrand" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Battery Brand</FormLabel>
                        <FormControl>
                          <AutoSuggestInput
                            value={field.value || ''}
                            onChange={field.onChange}
                            options={BATTERY_BRANDS}
                            placeholder="Type or select battery brand..."
                            className="h-10 text-xs bg-white"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* No. of Batteries */}
                    <FormField control={form.control} name="noOfBatteries" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-[#002868]">No. of Batteries</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const current = Math.max(0, (Number(field.value) || 0) - 1)
                                field.onChange(current)
                              }}
                              className="h-10 w-10 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              value={field.value ?? 0}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0)
                                field.onChange(val)
                              }}
                              className="h-10 text-xs font-bold text-center font-mono bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const current = Math.min(20, (Number(field.value) || 0) + 1)
                                field.onChange(current)
                              }}
                              className="h-10 w-10 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                            >
                              +
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Dynamic Multi-Battery Details & Photo Upload */}
                  {Number(form.watch('noOfBatteries') || 0) > 0 && (
                    <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800">
                          Battery Unit Details ({batteryWarrantyList.length || 1} {batteryWarrantyList.length === 1 ? 'Unit' : 'Units'})
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {batteryWarrantyList.map((expiry, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-800">Battery #{idx + 1} Warranty &amp; Photo</span>
                              {batteryPhotos[idx] && (
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Selected
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  Battery #{idx + 1} Warranty End Date
                                </label>
                                <DateInput
                                  value={expiry || ''}
                                  onChange={(e) => handleBatteryWarrantyChange(idx, e.target.value)}
                                  className="h-9"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                                  📷 Upload Battery #{idx + 1} Photo
                                </label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null
                                    setBatteryPhotos(prev => {
                                      const updated = [...prev]
                                      updated[idx] = file
                                      return updated
                                    })
                                  }}
                                  className="h-9 text-xs border-amber-300 bg-amber-50/20 file:bg-amber-100 file:text-amber-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Earthing, Protection & Structure */}
                <div className="space-y-4 pt-2 border-t border-line/60">
                  <h3 className="text-xs font-bold text-[#002868] uppercase tracking-wider">Earthing, Protection &amp; Structure</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {/* Earthing Type */}
                    <FormField control={form.control} name="earthingType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Earthing</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Earthing..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AC">AC</SelectItem>
                            <SelectItem value="DC">DC</SelectItem>
                            <SelectItem value="Dual">AC &amp; DC / Dual</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* OHMs */}
                    <FormField control={form.control} name="earthingOhms" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">OHMs</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 0.5"
                            value={field.value || ''}
                            onChange={field.onChange}
                            className="h-10 text-xs font-mono font-bold"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* Earthing Last Check Date */}
                    <FormField control={form.control} name="lastCheckDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-[#002868]">Last Check Date</FormLabel>
                        <FormControl>
                          <DateInput
                            value={field.value || ''}
                            onChange={field.onChange}
                            className="h-10"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* Ingress Protection (IP) */}
                    <FormField control={form.control} name="ingressProtection" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Ingress Protection (IP)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select IP Rating..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {IP_LIST.map((ip) => (
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
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Structure..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STRUCTURE_TYPES.map((st) => (
                              <SelectItem key={st} value={st}>{st}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Structure Coating / Material */}
                    <FormField control={form.control} name="structureMaterial" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Structure Coating / Material</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue placeholder="Select Material..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STRUCTURE_MATERIALS.map((sm) => (
                              <SelectItem key={sm} value={sm}>{sm}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* System Installation Date */}
                    <FormField control={form.control} name="installationDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">System Installation Date</FormLabel>
                        <FormControl>
                          <DateInput
                            value={field.value || ''}
                            onChange={field.onChange}
                            className="h-10"
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-line">
                  <Button type="button" variant="outline" onClick={() => setActiveTab(1)} className="text-xs gap-2 cursor-pointer">
                    <ChevronLeft className="w-4 h-4" /> Previous: Customer Details
                  </Button>
                  <Button type="button" onClick={() => handleNextTab(3)} className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold text-xs gap-2 px-6 shadow-sm cursor-pointer">
                    Next: Installer Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 3: Installer Details & System Audit (Updated)
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 3 && (
            <Card className="shadow-sm border-line bg-white animate-reveal">
              <CardContent className="p-6 space-y-6">
                <div className="border-b border-line pb-3">
                  <h2 className="text-lg font-bold text-[var(--color-graphite)]">3. System Audit Details</h2>
                  <p className="text-xs text-[var(--color-slate-custom)]">Enter audit date, installer contact info, and component audit statuses.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Date of Audit (Renamed from Date of Installation) */}
                  <FormField control={form.control} name="lastAuditDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-[#002868]">Date of Audit *</FormLabel>
                      <FormControl><DateInput value={field.value || ''} onChange={field.onChange} className="h-10" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Installer Name Dropdown */}
                  <FormField control={form.control} name="installerName" render={({ field }) => {
                    const installerUsers = (users || []).filter(u => u.role === 'INSTALLATION' || u.role === 'OM_MANAGER' || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')
                    const installerList = installerUsers.length > 0 
                      ? installerUsers.map(u => u.fullName) 
                      : (users || []).map(u => u.fullName)

                    return (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Installer Name</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={(val) => {
                            field.onChange(val)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs bg-white">
                              <SelectValue placeholder="Select Installer..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {installerList.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )
                  }} />

                  {/* Contact No */}
                  <FormField control={form.control} name="installerContact" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Contact No</FormLabel>
                      <FormControl><Input placeholder="03000000000..." {...field} className="h-10 text-xs font-mono" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Email Address */}
                  <FormField control={form.control} name="installerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="installer@example.com" {...field} className="h-10 text-xs" /></FormControl>
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
                          render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between gap-4">
                                <FormLabel className="text-xs font-bold text-gray-800 m-0">{item.label} *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger className={`h-8 text-xs w-48 ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                                      <SelectValue placeholder="Select Status..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {AUDIT_STATUSES.map(st => (
                                      <SelectItem key={st} value={st}>{st}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-line">
                  <Button type="button" variant="outline" onClick={() => setActiveTab(2)} className="text-xs gap-2 cursor-pointer">
                    <ChevronLeft className="w-4 h-4" /> Previous: Solar System Details
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || form.formState.isSubmitting}
                    className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold text-sm px-8 h-11 shadow-md gap-2.5 cursor-pointer disabled:opacity-75"
                  >
                    {uploading || form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Creating Sale...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Create Sale
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>

      {/* Signup Success Modal Popup */}
      {successModalData && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
            <div className="bg-[#002868] text-white p-6 text-center relative overflow-hidden">
              <div className="mx-auto w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-3 shadow-lg ring-4 ring-white/20">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold font-display">Signup Submitted Successfully!</h2>
              <p className="text-slate-200 text-xs mt-1">Customer Registration Form (CRF) has been generated.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Customer Name:</span>
                  <span className="font-bold text-[#002868]">{successModalData.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">CRF Number:</span>
                  <span className="font-mono font-bold text-amber-600">{successModalData.crfNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Total Subscription Payable:</span>
                  <span className="font-bold text-emerald-700 font-mono">PKR {successModalData.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={`/api/signup/${successModalData.customerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs py-3 flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer">
                    <Download className="h-4 w-4 text-amber-400" />
                    Download / Print Signup Form (CRF PDF)
                  </Button>
                </a>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/customers/${successModalData.customerId}`)}
                  className="w-full border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Go to Customer Profile →
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
