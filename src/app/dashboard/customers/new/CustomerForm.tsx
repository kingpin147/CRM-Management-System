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
import { ChevronRight, ChevronLeft, CheckCircle2, Check, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { AutoSuggestInput } from '@/components/ui/auto-suggest-input'
import { CITIES_LIST, getAreasForCity, getDefaultDiscoForCity } from '@/lib/pakistan-cities-areas'
import { formatDiscoRefNo } from '@/lib/utils'

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

  const noOfInvertersValue = form.watch('noOfInverters') ?? 0
  const [inverterList, setInverterList] = useState<Array<{ brand: string; serial: string; warrantyExpiry: string }>>([])

  // Sync inverter list with noOfInverters count
  useEffect(() => {
    const count = Math.max(0, Number(noOfInvertersValue) || 0)
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
      let cnicFrontUrl = null
      if (cnicFrontFile) {
        const ext = cnicFrontFile.name.split('.').pop()
        cnicFrontUrl = await uploadFile(cnicFrontFile, 'crm-uploads', `cnics/${values.cnic}-front-${Date.now()}.${ext}`)
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
        router.push(`/dashboard/customers/${result.customerId}`)
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
    { id: 3, label: 'Installer Details' },
  ]

  const INVERTER_BRANDS = [
    'Knox', 'Fronius', 'Livoltek', 'GoodWe', 'Galaxy', 'Solis', 'CoreTech', 'Inverex',
    'Ziewnic', 'Itel', 'Sunviour', 'Yinergy', 'Huawei', 'SAJ', 'Fox ESS', 'Solplanet',
    'Solax Power', 'Tesla', 'Crown', 'Growatt', 'Deye', 'Sungrow', 'Sofar', 'SMA',
    'SolarEdge', 'KSTAR', 'SolarMax', 'SRNE', 'Voltronic / Axpert', 'Kodak', 'Sineng',
    'FIMER', 'Canadian Solar', 'Apex', 'Gripsun', 'Anicsun', 'Maxpower', 'Auxsol',
    'Onyx', 'Powerage', 'Sunlife', 'Other'
  ]

  const PANEL_BRANDS = [
    'AIKO', 'LONGi', 'Risen', 'Trina Solar', 'Jinko', 'Astronergy', 'GCL', 'Huasun',
    'DMEGC', 'JA Solar', 'Jolywood', 'DASolar', 'DAH Solar', 'TW Solar', 'Jetion Solar',
    'Grand Sunergy', 'SPIC', 'Solargiga', 'Canadian Solar', 'REC Group', 'Eging PV',
    'RUNERGY', 'URECO', 'Yingli', 'Suntech', 'Kalyon PV', 'Qcells', 'CECEP',
    'Jinergy', 'Meyer Burger', 'Qn-SOLAR', 'Seraphim', 'ZNSHINE', 'OSDA', 'Other'
  ]

  const BATTERY_BRANDS = [
    'Dyness', 'Narada', 'Pylontech', 'Sunwoda', 'Dongjin', 'BYD', 'Knox', 'GoodWe',
    'Sacred Sun', 'Genix Green', 'Inverex', 'Growatt', 'Deye', 'Huawei', 'Fox ESS',
    'Sungrow', 'Sofar', 'SolaX', 'SRNE', 'Osaka', 'Phoenix', 'Apex Solar', 'MaxPower', 'Other'
  ]

  const IP_LIST = ['IP20', 'IP21', 'IP34', 'IP40', 'IP54', 'IP65', 'IP66', 'IP67']
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
                          <FormControl><Input type="date" {...field} className="h-10 text-xs" /></FormControl>
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
                          <FormControl><Input type="date" {...field} className="h-10 text-xs" /></FormControl>
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
                        <p className="text-xs text-[var(--color-slate-custom)]">Choose system capacity size, package tier, billing cycle, and monitoring coverage.</p>
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
                              <SelectItem value="1-10 kW">1–10 kW</SelectItem>
                              <SelectItem value="10-20 kW">10–20 kW</SelectItem>
                              <SelectItem value="20-30 kW">20–30 kW</SelectItem>
                              <SelectItem value="30+ kW">30 kW &amp; Above</SelectItem>
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

                    {/* Account Executive */}
                    <FormField
                      control={form.control}
                      name="accountExecutiveId"
                      render={({ field }) => (
                        <FormItem>
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

                  {/* Activation note */}
                  <div className="pt-1">
                    <p className="text-[11px] text-gray-400">
                      Activation Date will be set automatically when the O&amp;M Manager activates the customer.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => handleNextTab(2)} className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold text-xs gap-2 px-6 shadow-sm">
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

                  {/* DISCO */}
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
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">{currentDisco} Customer ID #</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 04-11515-0469701 U"
                            value={field.value || ''}
                            onChange={(e) => {
                              const formatted = formatDiscoRefNo(e.target.value)
                              field.onChange(formatted)
                            }}
                            className="h-10 text-xs font-mono font-bold tracking-wider"
                          />
                        </FormControl>
                      </FormItem>
                    )
                  }} />

                  {/* Inverter Category */}
                  <FormField control={form.control} name="inverterCategory" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High Voltage">High Voltage</SelectItem>
                          <SelectItem value="Low Voltage">Low Voltage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Inverter Size */}
                  <FormField control={form.control} name="inverterSize" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Size *</FormLabel>
                      <FormControl>
                        <AutoSuggestInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          options={['3kW', '5kW', '6kW', '8kW', '10kW', '12kW', '15kW', '20kW', '25kW', '30kW', '50kW', '100kW']}
                          placeholder="Type or select size..."
                          className={`h-10 text-xs bg-white ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Meter Phase */}
                  <FormField control={form.control} name="meterPhase" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Meter Phase *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Meter Phase..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single Phase">Single Phase</SelectItem>
                          <SelectItem value="Three Phase">Three Phase</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Inverter Type */}
                  <FormField control={form.control} name="inverterType" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Inverter Type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="On-grid">On-grid</SelectItem>
                          <SelectItem value="Hybrid + On-grid">Hybrid + On-grid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Inverter Phase Type */}
                  <FormField control={form.control} name="inverterPhase" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Inverter Phase Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Phase Type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single Phase">Single Phase</SelectItem>
                          <SelectItem value="Three Phase">Three Phase</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* No. of Inverters */}
                  <FormField control={form.control} name="noOfInverters" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">No. of Inverters</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          placeholder="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0)
                            field.onChange(val)
                          }}
                          className="h-10 text-xs font-mono font-bold"
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Dynamic Inverter Units (Brand, Serial #, Warranty End Date per Inverter) */}
                  <div className="md:col-span-3 space-y-3 bg-amber-50/40 p-4 rounded-xl border border-amber-200/70">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Inverter Units Configuration ({inverterList.length})
                      </h4>
                      <span className="text-[11px] text-amber-800">
                        Brand, Serial #, and Warranty End Date for each inverter unit
                      </span>
                    </div>

                    {inverterList.length > 0 ? (
                      <div className="space-y-3">
                        {inverterList.map((inv, idx) => (
                          <div key={idx} className="p-3.5 bg-white rounded-lg border border-amber-200/80 shadow-2xs space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                                Inverter #{idx + 1}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Brand */}
                              <div className="space-y-1">
                                <FormLabel className="text-xs font-semibold">Inverter Brand *</FormLabel>
                                <AutoSuggestInput
                                  value={inv.brand || ''}
                                  onChange={(val) => {
                                    const updated = [...inverterList]
                                    updated[idx].brand = val
                                    setInverterList(updated)
                                    if (idx === 0) form.setValue('inverterBrand', val)
                                  }}
                                  options={INVERTER_BRANDS}
                                  placeholder="Type or select brand..."
                                  className="h-10 text-xs bg-white"
                                />
                              </div>

                              {/* Serial */}
                              <div className="space-y-1">
                                <FormLabel className="text-xs font-semibold">Inverter Serial #</FormLabel>
                                <Input
                                  value={inv.serial}
                                  onChange={(e) => {
                                    const updated = [...inverterList]
                                    updated[idx].serial = e.target.value
                                    setInverterList(updated)
                                    if (idx === 0) form.setValue('inverterSerial', e.target.value)
                                  }}
                                  placeholder={`Serial number for Inverter #${idx + 1}...`}
                                  className="h-10 text-xs bg-white font-mono"
                                />
                              </div>

                              {/* Warranty Expiry */}
                              <div className="space-y-1">
                                <FormLabel className="text-xs font-semibold text-amber-900">Inverter Warranty End Date</FormLabel>
                                <Input
                                  type="date"
                                  value={inv.warrantyExpiry}
                                  onChange={(e) => {
                                    const updated = [...inverterList]
                                    updated[idx].warrantyExpiry = e.target.value
                                    setInverterList(updated)
                                    if (idx === 0) form.setValue('inverterWarrantyExpiry', e.target.value)
                                  }}
                                  className="h-10 text-xs bg-white border-amber-300"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-amber-900 bg-white rounded-lg border border-amber-200/80 italic">
                        Enter No. of Inverters above (e.g. 1 or 2) to configure inverter units.
                      </div>
                    )}
                  </div>

                  {/* Panel Technology */}
                  <FormField control={form.control} name="panelTechnology" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Technology *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Panel Technology..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['TOPCON', 'ABC', 'HJT', 'HIBC', 'TBC', 'PERC', 'Other'].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Panel Brand */}
                  <FormField control={form.control} name="panelBrand" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Brand *</FormLabel>
                      <FormControl>
                        <AutoSuggestInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          options={PANEL_BRANDS}
                          placeholder="Type or select panel brand..."
                          className={`h-10 text-xs bg-white ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Panel Wattage */}
                  <FormField control={form.control} name="panelWattage" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Wattage (W)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0)
                            field.onChange(val)
                          }}
                          className="h-10 text-xs font-mono font-bold"
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* No. of Panels */}
                  <FormField control={form.control} name="noOfPanels" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">No of Panels</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0)
                            field.onChange(val)
                          }}
                          className="h-10 text-xs font-mono font-bold"
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Total Wattage (calculated) */}
                  <div className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-gray-700">Total Wattage (Calculated)</FormLabel>
                    <Input readOnly value={`${totalPanelWattage} W`} className="h-10 text-xs font-mono font-bold bg-amber-50/50 text-[var(--color-ink)] border-amber-200" />
                  </div>

                  {/* Panel Type */}
                  <FormField control={form.control} name="panelType" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Panel Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Panel Type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Monofacial">Monofacial</SelectItem>
                          <SelectItem value="Bifacial">Bifacial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                  <FormField control={form.control} name="batteryCategory" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Battery Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Battery Category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High Voltage">High Voltage</SelectItem>
                          <SelectItem value="Low Voltage">Low Voltage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Battery Type */}
                  <FormField control={form.control} name="batteryType" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Battery Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Battery Type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Lithium">Lithium</SelectItem>
                          <SelectItem value="Lead Acid">Lead Acid</SelectItem>
                          <SelectItem value="Dry">Dry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Battery Brand */}
                  <FormField control={form.control} name="batteryBrand" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Battery Brand *</FormLabel>
                      <FormControl>
                        <AutoSuggestInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          options={BATTERY_BRANDS}
                          placeholder="Type or select battery brand..."
                          className={`h-10 text-xs bg-white ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* No. of Batteries */}
                  <FormField control={form.control} name="noOfBatteries" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">No. of Batteries</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          placeholder="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0)
                            field.onChange(val)
                          }}
                          className="h-10 text-xs font-mono font-bold"
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Dynamic Battery Warranty End Date Boxes */}
                  <div className="md:col-span-3 space-y-3 bg-amber-50/30 p-4 rounded-xl border border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Battery Warranty End Dates ({batteryWarrantyList.length})
                      </h4>
                      <span className="text-[11px] text-amber-800">
                        Set warranty end date per battery unit
                      </span>
                    </div>

                    {batteryWarrantyList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {batteryWarrantyList.map((bwDate, idx) => (
                          <div key={idx} className="space-y-1 bg-white p-3 rounded-lg border border-amber-200/70 shadow-2xs">
                            <FormLabel className="text-xs font-semibold text-amber-900">
                              Battery #{idx + 1} Warranty End Date
                            </FormLabel>
                            <Input
                              type="date"
                              value={bwDate}
                              onChange={(e) => {
                                const updated = [...batteryWarrantyList]
                                updated[idx] = e.target.value
                                setBatteryWarrantyList(updated)
                                if (idx === 0) form.setValue('batteryWarrantyExpiry', e.target.value)
                              }}
                              className="h-10 text-xs bg-white border-amber-300"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-amber-900 bg-white rounded-lg border border-amber-200/80 italic">
                        Enter No. of Batteries above (e.g. 1 or 2) to configure battery unit warranty end dates.
                      </div>
                    )}
                  </div>

                  {/* Earthing */}
                  <FormField control={form.control} name="earthingType" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Earthing *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Earthing..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="DC">DC</SelectItem>
                          <SelectItem value="Both">Both (AC &amp; DC)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* OHMs */}
                  <FormField control={form.control} name="earthingOhms" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">OHMs</FormLabel>
                      <FormControl><Input placeholder="0" {...field} className="h-10 text-xs font-mono" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Last Check Date */}
                  <FormField control={form.control} name="lastCheckDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Earthing Last Check Date</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10 text-xs" /></FormControl>
                    </FormItem>
                  )} />

                  {/* Ingress Protection */}
                  <FormField control={form.control} name="ingressProtection" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Ingress Protection (IP) *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select IP Rating..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {IP_LIST.map(ip => (
                            <SelectItem key={ip} value={ip}>{ip}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Structure Type */}
                  <FormField control={form.control} name="structureType" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Structure Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Structure Type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Elevated">Elevated</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Structure Material */}
                  <FormField control={form.control} name="structureMaterial" render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Structure Coating / Material *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className={`h-10 text-xs ${fieldState.error ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20' : ''}`}>
                            <SelectValue placeholder="Select Material..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['Painted', 'Aluminium', 'Hot Dip Galvanized', 'Pre Galvanized', 'L1', 'L2', 'L3', 'L4'].map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                  <Button type="button" onClick={() => handleNextTab(3)} className="bg-[var(--color-amber)] hover:bg-[#d69333] text-white font-bold text-xs gap-2 px-6 shadow-sm">
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
                  <Button type="button" variant="outline" onClick={() => setActiveTab(2)} className="text-xs gap-2">
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
    </div>
  )
}
