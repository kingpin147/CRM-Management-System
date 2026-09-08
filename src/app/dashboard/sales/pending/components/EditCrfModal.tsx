'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AutoSuggestInput } from '@/components/ui/auto-suggest-input'
import {
  SYSTEM_SIZES,
  INVERTER_SIZES,
  INVERTER_BRANDS,
  PANEL_BRANDS,
  BATTERY_BRANDS,
  DISCO_LIST,
  STRUCTURE_TYPES,
  STRUCTURE_MATERIALS,
  IP_LIST,
} from '@/lib/solar-constants'
import { CheckCircle2, Edit3, Loader2, Save, FileText, User, Zap, Wrench, ShieldCheck, Sun, Battery, HardHat } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { calculatePackageBreakdown } from '@/lib/pricing'

const PACKAGES = ['Basic', 'Moderate', 'Comprehensive']
const BILLING_TYPES = ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly']
const MONITORING_TIMES = ['Hybrid', 'Grid Tied']
const AUDIT_STATUSES = ['Excellent', 'Good', 'Fair', 'Service Required', 'Replacement Required']

interface EditCrfModalProps {
  customer: any | null
  installers?: Array<{ id: string; fullName: string; role: string; email?: string }>
  isOpen: boolean
  onClose: () => void
  onSaveCrf: (formData: FormData) => Promise<void>
}

export function EditCrfModal({
  customer,
  installers = [],
  isOpen,
  onClose,
  onSaveCrf,
}: EditCrfModalProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveMode, setSaveMode] = React.useState<'SAVE' | 'SAVE_AND_APPROVE'>('SAVE')

  // Form State - Customer
  const [fullName, setFullName] = React.useState('')
  const [cnic, setCnic] = React.useState('')
  const [contactNumber, setContactNumber] = React.useState('')
  const [pocNumber, setPocNumber] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [block, setBlock] = React.useState('')
  const [area, setArea] = React.useState('')
  const [city, setCity] = React.useState('')
  const [coordinates, setCoordinates] = React.useState('')
  const [assignedInstallerId, setAssignedInstallerId] = React.useState('')

  // Package State
  const [systemSizeKw, setSystemSizeKw] = React.useState('1 - 5 kW')
  const [packageTier, setPackageTier] = React.useState('Basic')
  const [billingType, setBillingType] = React.useState('Monthly')
  const [monitoringTime, setMonitoringTime] = React.useState('Hybrid')
  
  // Payment State
  const [paymentMode, setPaymentMode] = React.useState('')
  const [paymentAmount, setPaymentAmount] = React.useState('')
  const [paymentDescription, setPaymentDescription] = React.useState('')

  // Solar System Specifications
  const [disco, setDisco] = React.useState('')
  const [discoRefNo, setDiscoRefNo] = React.useState('')
  const [meterType, setMeterType] = React.useState('Green Meter')
  const [meterPhase, setMeterPhase] = React.useState('Three Phase')
  const [zeroExportDevice, setZeroExportDevice] = React.useState('No')

  const [inverterBrand, setInverterBrand] = React.useState('')
  const [inverterSize, setInverterSize] = React.useState('')
  const [inverterType, setInverterType] = React.useState('Hybrid')
  const [inverterPhase, setInverterPhase] = React.useState('Three Phase')
  const [inverterCategory, setInverterCategory] = React.useState('Low Voltage')
  const [noOfInverters, setNoOfInverters] = React.useState('1')
  const [inverterSerial, setInverterSerial] = React.useState('')
  const [inverterWarrantyEnd, setInverterWarrantyEnd] = React.useState('')

  const [panelBrand, setPanelBrand] = React.useState('')
  const [panelType, setPanelType] = React.useState('Tier-1 Monofacial')
  const [panelTechnology, setPanelTechnology] = React.useState('Topcon')
  const [panelWattage, setPanelWattage] = React.useState('550')
  const [panelQuantity, setPanelQuantity] = React.useState('')
  const [panelWarrantyEnd, setPanelWarrantyEnd] = React.useState('')

  const [batteryBrand, setBatteryBrand] = React.useState('')
  const [batteryType, setBatteryType] = React.useState('Lithium-ion')
  const [batteryCategory, setBatteryCategory] = React.useState('Low Voltage (LV)')
  const [batteryQty, setBatteryQty] = React.useState('0')
  const [batterySerial, setBatterySerial] = React.useState('')
  const [batteryWarrantyEnd, setBatteryWarrantyEnd] = React.useState('')

  const [structureType, setStructureType] = React.useState('Elevated GI Structure')
  const [structureMaterial, setStructureMaterial] = React.useState('Hot Dip Galvanized (HDG)')
  const [ingressProtection, setIngressProtection] = React.useState('IP65')
  const [breakerName, setBreakerName] = React.useState('Schneider / ABB')
  const [earthingType, setEarthingType] = React.useState('Both')
  const [lightningProtection, setLightningProtection] = React.useState('No')
  const [systemInstallationDate, setSystemInstallationDate] = React.useState('')

  // 7-Point Audit Checklist & Safety
  const [inverterStatus, setInverterStatus] = React.useState('Good')
  const [panelStatus, setPanelStatus] = React.useState('Good')
  const [batteryStatus, setBatteryStatus] = React.useState('Good')
  const [structureStatus, setStructureStatus] = React.useState('Good')
  const [cableStatus, setCableStatus] = React.useState('Good')
  const [earthingStatus, setEarthingStatus] = React.useState('Good')
  const [breakerStatus, setBreakerStatus] = React.useState('Good')

  const [earthingAcOhms, setEarthingAcOhms] = React.useState('')
  const [earthingDcOhms, setEarthingDcOhms] = React.useState('')
  const [earthingLastCheck, setEarthingLastCheck] = React.useState('')
  const [installerName, setInstallerName] = React.useState('')
  const [installerCompany, setInstallerCompany] = React.useState('')

  // Dynamic pricing breakdown
  const breakdown = React.useMemo(() => {
    return calculatePackageBreakdown(systemSizeKw, packageTier, billingType, monitoringTime)
  }, [systemSizeKw, packageTier, billingType, monitoringTime])

  // Sync payment amount with calculated total whenever breakdown changes
  React.useEffect(() => {
    setPaymentAmount(String(breakdown.grandTotal))
  }, [breakdown.grandTotal])

  // Populate form state whenever selected customer changes
  React.useEffect(() => {
    if (customer) {
      setFullName(customer.fullName || '')
      setCnic(customer.cnic || '')
      setContactNumber(customer.contactNumber || '')
      setPocNumber((customer as any).pocNumber || '')
      setEmail(customer.email || '')
      setAddress(customer.address || '')
      setBlock(customer.block || '')
      setArea(customer.area || '')
      setCity(customer.city || '')
      setCoordinates(customer.coordinates || '')
      setAssignedInstallerId(customer.assignedInstallerId || '')

      if (customer.packagePlan) {
        setSystemSizeKw(customer.packagePlan.systemSizeKw || '1 - 5 kW')
        setPackageTier(customer.packagePlan.packageTier || 'Basic')
        setBillingType(customer.packagePlan.billingType || 'Monthly')
        setMonitoringTime(customer.packagePlan.monitoringTime || 'Hybrid')
      }

      if (customer.solarSystem) {
        const s = customer.solarSystem
        setDisco(s.disco || '')
        setDiscoRefNo(s.discoRefNo || '')
        setMeterType(s.meterType || 'Green Meter')
        setMeterPhase(s.meterPhase || 'Three Phase')
        setZeroExportDevice(s.zeroExportDevice ? 'Yes' : 'No')

        setInverterBrand(s.inverterBrand || '')
        setInverterSize(s.inverterSize || '')
        setInverterType(s.inverterType || 'Hybrid')
        setInverterPhase(s.inverterPhase || 'Three Phase')
        setInverterCategory(s.inverterCategory || 'Low Voltage')
        setNoOfInverters(s.noOfInverters != null ? String(s.noOfInverters) : '1')
        setInverterSerial(s.inverterSerials?.[0] || s.inverterSerial || '')
        if (s.inverterWarrantyEnds?.[0]) {
          setInverterWarrantyEnd(new Date(s.inverterWarrantyEnds[0]).toISOString().split('T')[0])
        } else if (s.inverterWarrantyEnd) {
          setInverterWarrantyEnd(new Date(s.inverterWarrantyEnd).toISOString().split('T')[0])
        } else {
          setInverterWarrantyEnd('')
        }

        setPanelBrand(s.panelBrand || '')
        setPanelType(s.panelType || 'Tier-1 Monofacial')
        setPanelTechnology(s.panelTechnology || 'Topcon')
        setPanelWattage(s.panelWattage != null ? String(s.panelWattage) : '550')
        const pQty = s.noOfPanels !== undefined ? s.noOfPanels : s.panelQuantity
        setPanelQuantity(pQty !== undefined && pQty !== null ? String(pQty) : '')
        setPanelWarrantyEnd(s.panelWarrantyEnd ? new Date(s.panelWarrantyEnd).toISOString().split('T')[0] : '')

        setBatteryBrand(s.batteryBrand || '')
        setBatteryType(s.batteryType || 'Lithium-ion')
        setBatteryCategory(s.batteryCategory || 'Low Voltage (LV)')
        const bQty = s.noOfBatteries !== undefined ? s.noOfBatteries : s.batteryQty
        setBatteryQty(bQty !== undefined && bQty !== null ? String(bQty) : '0')
        setBatterySerial(s.batterySerials?.[0] || s.batterySerial || '')
        if (s.batteryWarrantyEnds?.[0]) {
          setBatteryWarrantyEnd(new Date(s.batteryWarrantyEnds[0]).toISOString().split('T')[0])
        } else if (s.batteryWarrantyEnd) {
          setBatteryWarrantyEnd(new Date(s.batteryWarrantyEnd).toISOString().split('T')[0])
        } else {
          setBatteryWarrantyEnd('')
        }

        setStructureType(s.structureType || 'Elevated GI Structure')
        setStructureMaterial(s.structureMaterial || 'Hot Dip Galvanized (HDG)')
        setIngressProtection(s.ingressProtection || 'IP65')
        setBreakerName(s.breakerName || 'Schneider / ABB')
        setEarthingType(s.earthing || 'Both')
        setLightningProtection(s.lightningProtection ? 'Yes' : 'No')
        setSystemInstallationDate(s.systemInstallationDate ? new Date(s.systemInstallationDate).toISOString().split('T')[0] : '')

        setInverterStatus(s.inverterStatus || 'Good')
        setPanelStatus(s.panelStatus || 'Good')
        setBatteryStatus(s.batteryStatus || 'Good')
        setStructureStatus(s.structureStatus || 'Good')
        setCableStatus(s.cableStatus || 'Good')
        setEarthingStatus(s.earthingStatus || 'Good')
        setBreakerStatus(s.breakerStatus || 'Good')

        setEarthingAcOhms(s.earthingAcOhms !== undefined && s.earthingAcOhms !== null ? String(s.earthingAcOhms) : '')
        setEarthingDcOhms(s.earthingDcOhms !== undefined && s.earthingDcOhms !== null ? String(s.earthingDcOhms) : '')
        setEarthingLastCheck(s.earthingLastCheck ? new Date(s.earthingLastCheck).toISOString().split('T')[0] : '')
        setInstallerName(s.installerName || '')
        setInstallerCompany(s.installerCompany || 'EnergyGurus Technical Operations')
      }

      if ((customer as any).transactions && (customer as any).transactions.length > 0) {
        const tx = (customer as any).transactions[0]
        setPaymentAmount(tx.amount ? String(tx.amount) : '')
        if (tx.paymentMethod) {
          const parts = tx.paymentMethod.split(' | ')
          setPaymentMode(parts[0] || 'Cash')
          setPaymentDescription(parts.slice(1).join(' | ') || '')
        }
      } else {
        setPaymentAmount('')
        setPaymentMode('Cash')
        setPaymentDescription('')
      }
    }
  }, [customer])

  if (!customer) return null

  const isStage1 = customer.status === 'SIGNUP_GENERATED'
  const isStage2 = customer.status === 'PENDING_PAYMENT_VERIFICATION'
  const isStage3 = customer.status === 'PENDING_ACTIVATION'

  const approvalButtonLabel = isStage1 
    ? 'Save & Approve (Sales Manager)' 
    : isStage2 
    ? 'Save & Verify Payment' 
    : 'Save & Approve (O&M Manager)'

  // Resolved display name for the assigned installer
  const matchedInstaller = installers.find(i => i.id === assignedInstallerId)
  const resolvedInstallerName = matchedInstaller?.fullName 
    || customer.assignedInstaller?.fullName 
    || customer.solarSystem?.installerName 
    || installerName 
    || ''

  const handleSubmit = async (shouldAdvance: boolean) => {
    // Only in Stage 1 / Stage 2 do we mandate selecting a technician if advancing
    if (shouldAdvance && (isStage1 || isStage2) && !assignedInstallerId && !resolvedInstallerName) {
      alert('Please assign an Installer / Field Specialist before approving the job so it will appear in their account.')
      return
    }

    setIsSaving(true)
    setSaveMode(shouldAdvance ? 'SAVE_AND_APPROVE' : 'SAVE')
    try {
      const selectedInstallerName = resolvedInstallerName || (matchedInstaller ? matchedInstaller.fullName : '')

      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('currentStatus', customer.status)
      formData.append('shouldAdvance', shouldAdvance ? 'true' : 'false')

      formData.append('fullName', fullName)
      formData.append('cnic', cnic)
      formData.append('contactNumber', contactNumber)
      formData.append('pocNumber', pocNumber)
      formData.append('email', email)
      formData.append('address', address)
      formData.append('block', block)
      formData.append('area', area)
      formData.append('city', city)
      formData.append('coordinates', coordinates)
      formData.append('assignedInstallerId', assignedInstallerId)
      formData.append('installerName', selectedInstallerName)

      formData.append('systemSizeKw', systemSizeKw)
      formData.append('packageTier', packageTier)
      formData.append('billingType', billingType)
      formData.append('monitoringTime', monitoringTime)

      // Calculated pricing fields
      formData.append('monthlyBasePrice', String(breakdown.priceAfterDiscount))
      formData.append('appliedDiscount', String(breakdown.discountPct))
      formData.append('salesTaxAmount', String(breakdown.salesTax))
      formData.append('totalAmount', String(breakdown.grandTotal))

      formData.append('paymentMode', paymentMode)
      formData.append('paymentAmount', paymentAmount)
      formData.append('paymentDescription', paymentDescription)

      // Utility & DISCO specs
      formData.append('disco', disco)
      formData.append('discoRefNo', discoRefNo)
      formData.append('meterType', meterType)
      formData.append('meterPhase', meterPhase)
      formData.append('zeroExportDevice', zeroExportDevice)

      // Inverter specs
      formData.append('inverterBrand', inverterBrand)
      formData.append('inverterSize', inverterSize)
      formData.append('inverterType', inverterType)
      formData.append('inverterPhase', inverterPhase)
      formData.append('inverterCategory', inverterCategory)
      formData.append('noOfInverters', noOfInverters)
      formData.append('inverterSerial', inverterSerial)
      formData.append('inverterWarrantyEnd', inverterWarrantyEnd)

      // Panel specs
      formData.append('panelBrand', panelBrand)
      formData.append('panelType', panelType)
      formData.append('panelTechnology', panelTechnology)
      formData.append('panelWattage', panelWattage)
      formData.append('panelQuantity', panelQuantity)
      formData.append('panelWarrantyEnd', panelWarrantyEnd)

      // Battery specs
      formData.append('batteryBrand', batteryBrand)
      formData.append('batteryType', batteryType)
      formData.append('batteryCategory', batteryCategory)
      formData.append('batteryQty', batteryQty)
      formData.append('batterySerial', batterySerial)
      formData.append('batteryWarrantyEnd', batteryWarrantyEnd)

      // Structure & Protection specs
      formData.append('structureType', structureType)
      formData.append('structureMaterial', structureMaterial)
      formData.append('ingressProtection', ingressProtection)
      formData.append('breakerName', breakerName)
      formData.append('earthingType', earthingType)
      formData.append('lightningProtection', lightningProtection)
      formData.append('systemInstallationDate', systemInstallationDate)

      // 7-Point Audit Checklist
      formData.append('inverterStatus', inverterStatus)
      formData.append('panelStatus', panelStatus)
      formData.append('batteryStatus', batteryStatus)
      formData.append('structureStatus', structureStatus)
      formData.append('cableStatus', cableStatus)
      formData.append('earthingStatus', earthingStatus)
      formData.append('breakerStatus', breakerStatus)

      formData.append('earthingAcOhms', earthingAcOhms)
      formData.append('earthingDcOhms', earthingDcOhms)
      formData.append('earthingLastCheck', earthingLastCheck)
      formData.append('installerCompany', installerCompany)

      await onSaveCrf(formData)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto p-6 bg-white border-line shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-line pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold font-display text-[#002868] flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                Check &amp; Edit CRF Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Review and verify customer profile, package billing, solar system hardware, and audit specifications.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-slate-100 text-slate-800 border-slate-300">
                CRF #: {customer.crfNumber || customer.customerCode}
              </Badge>
              <Badge className={
                isStage1 ? 'bg-amber-600 text-white font-bold' : isStage2 ? 'bg-blue-600 text-white font-bold' : 'bg-[#002868] text-white font-bold'
              }>
                {isStage1 ? 'Stage 1: Pending Sales' : isStage2 ? 'Stage 2: Pending Payment' : 'Stage 3: Pending O&M'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section 1: Customer Personal & Contact Details */}
          <div className="space-y-3">
            <SectionHeader leftAction={<User className="h-4 w-4 text-amber-600" />}>
              1. Customer Personal &amp; Address Details
            </SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Full Name *</Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="h-9 text-xs font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">CNIC # *</Label>
                <Input 
                  value={cnic} 
                  onChange={(e) => setCnic(e.target.value)} 
                  className="h-9 text-xs font-mono"
                  placeholder="35202-1234567-1"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Primary Contact *</Label>
                <Input 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)} 
                  className="h-9 text-xs font-mono"
                  placeholder="03001234567"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">POC / Alternate Contact</Label>
                <Input 
                  value={pocNumber} 
                  onChange={(e) => setPocNumber(e.target.value)} 
                  className="h-9 text-xs font-mono"
                  placeholder="Optional alternate"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Email Address</Label>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-9 text-xs"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">City *</Label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Block / Sector</Label>
                <Input 
                  value={block} 
                  onChange={(e) => setBlock(e.target.value)} 
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Area / Town</Label>
                <Input 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)} 
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Full Installation Address</Label>
                <Input 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Package Pricing & Payment Setup */}
          <div className="space-y-3">
            <SectionHeader leftAction={<Zap className="h-4 w-4 text-amber-600" />}>
              2. Package Selection &amp; Billing Calculation
            </SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">System Capacity</Label>
                <Select value={systemSizeKw} onValueChange={(val) => setSystemSizeKw(val || '1 - 5 kW')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_SIZES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Package Tier</Label>
                <Select value={packageTier} onValueChange={(val) => setPackageTier(val || 'Basic')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGES.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Billing Cycle</Label>
                <Select value={billingType} onValueChange={(val) => setBillingType(val || 'Monthly')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_TYPES.map((b) => (
                      <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Monitoring Window</Label>
                <Select value={monitoringTime} onValueChange={(val) => setMonitoringTime(val || 'Hybrid')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONITORING_TIMES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing Summary Breakdown Card */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#002868] uppercase tracking-wider">Package Pricing Breakdown</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {systemSizeKw} • {packageTier} ({monitoringTime}) • {billingType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Payable Status:</span>
                  <Badge 
                    variant="outline" 
                    className={
                      customer.status === 'SIGNUP_GENERATED' 
                        ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold text-[11px]'
                        : customer.status === 'PENDING_PAYMENT_VERIFICATION'
                        ? 'bg-blue-100 text-blue-950 border-blue-300 font-bold text-[11px]'
                        : 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold text-[11px]'
                    }
                  >
                    {customer.status === 'SIGNUP_GENERATED' ? 'Pending Sales Review' : customer.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-0.5">
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Base Monthly</span>
                  <span className="text-xs font-bold text-slate-900">PKR {breakdown.baseMonthlyRate.toLocaleString()}</span>
                </div>
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Cycle &amp; Discount</span>
                  <span className="text-xs font-bold text-indigo-700">
                    {breakdown.months} Mo {breakdown.discountPct > 0 ? `(-${breakdown.discountPct}%)` : '(0%)'}
                  </span>
                </div>
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">After Discount</span>
                  <span className="text-xs font-bold text-slate-900">PKR {breakdown.priceAfterDiscount.toLocaleString()}</span>
                </div>
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Sales Tax (5%)</span>
                  <span className="text-xs font-bold text-slate-700">PKR {breakdown.salesTax.toLocaleString()}</span>
                </div>
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">On-Boarding Fee</span>
                  <span className={`text-xs font-bold ${breakdown.isOnboardingWaived ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {breakdown.isOnboardingWaived ? 'Waived (0)' : `PKR ${breakdown.onboardingFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="bg-[#002868] text-white p-2 rounded-lg border border-[#002868] shadow-xs">
                  <span className="text-[10px] text-sky-200 font-medium block">Total Payable</span>
                  <span className="text-xs font-extrabold text-white">PKR {breakdown.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Payment Entry Tab */}
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Record Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Amount (PKR)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="h-9 text-xs font-mono font-semibold"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={(val) => setPaymentMode(val || '')}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Payment Mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Payment Description / Ref #</Label>
                  <Input 
                    value={paymentDescription} 
                    onChange={(e) => setPaymentDescription(e.target.value)} 
                    className="h-9 text-xs"
                    placeholder="Enter transaction ID, cheque number, or details"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Full Solar Hardware & Technical Specifications */}
          <div className="space-y-4">
            <SectionHeader leftAction={<Wrench className="h-4 w-4 text-amber-600" />}>
              3. Solar Hardware &amp; Technical Specifications
            </SectionHeader>

            {/* 3.1 Utility Connection */}
            <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#002868] uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                Utility Grid &amp; Meter Connection
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">DISCO Utility</Label>
                  <AutoSuggestInput 
                    value={disco} 
                    onChange={setDisco} 
                    options={DISCO_LIST} 
                    placeholder="e.g. LESCO, FESCO"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Consumer Reference # / Consumer ID</Label>
                  <Input 
                    value={discoRefNo} 
                    onChange={(e) => setDiscoRefNo(e.target.value)} 
                    className="h-9 text-xs font-mono" 
                    placeholder="e.g. 04 11223 3445500 U"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Meter Type</Label>
                  <Select value={meterType} onValueChange={(v) => setMeterType(v || 'Green Meter')}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Green Meter" className="text-xs">Green Meter (Bi-directional)</SelectItem>
                      <SelectItem value="Non Green" className="text-xs">Standard (Non Green)</SelectItem>
                      <SelectItem value="Digital" className="text-xs">Digital Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Meter Phase</Label>
                  <Select value={meterPhase} onValueChange={(v) => setMeterPhase(v || 'Three Phase')}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Three Phase" className="text-xs">Three Phase</SelectItem>
                      <SelectItem value="Single Phase" className="text-xs">Single Phase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 3.2 Inverter Specifications */}
            <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#002868] uppercase tracking-wider">
                <Sun className="h-3.5 w-3.5 text-amber-600" />
                Inverter Unit Specifications
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Inverter Brand</Label>
                  <AutoSuggestInput 
                    value={inverterBrand}
                    onChange={setInverterBrand}
                    options={INVERTER_BRANDS}
                    placeholder="e.g. Knox, Fronius, Growatt"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Inverter Size / Capacity</Label>
                  <AutoSuggestInput 
                    value={inverterSize}
                    onChange={setInverterSize}
                    options={INVERTER_SIZES}
                    placeholder="e.g. 10kW, 15kW"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Inverter Type</Label>
                  <Select value={inverterType} onValueChange={(v) => setInverterType(v || 'Hybrid')}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hybrid" className="text-xs">Hybrid</SelectItem>
                      <SelectItem value="OnGrid" className="text-xs">On-Grid</SelectItem>
                      <SelectItem value="OffGrid" className="text-xs">Off-Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">No. of Inverters</Label>
                  <Input 
                    type="number" 
                    value={noOfInverters} 
                    onChange={(e) => setNoOfInverters(e.target.value)} 
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Inverter Serial #</Label>
                  <Input 
                    value={inverterSerial} 
                    onChange={(e) => setInverterSerial(e.target.value)} 
                    className="h-9 text-xs font-mono" 
                    placeholder="e.g. KNX202409871"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Inverter Warranty Expiry Date</Label>
                  <Input 
                    type="date" 
                    value={inverterWarrantyEnd} 
                    onChange={(e) => setInverterWarrantyEnd(e.target.value)} 
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3.3 Solar PV Panels */}
            <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#002868] uppercase tracking-wider">
                <Sun className="h-3.5 w-3.5 text-amber-600" />
                Solar PV Panels Specifications
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Panel Brand</Label>
                  <AutoSuggestInput 
                    value={panelBrand}
                    onChange={setPanelBrand}
                    options={PANEL_BRANDS}
                    placeholder="e.g. LONGi, JA Solar, Jinko"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Panel Technology</Label>
                  <Input 
                    value={panelTechnology} 
                    onChange={(e) => setPanelTechnology(e.target.value)} 
                    className="h-9 text-xs" 
                    placeholder="e.g. Topcon, Mono Perc, HJT"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Wattage per Panel (W)</Label>
                  <Input 
                    type="number" 
                    value={panelWattage} 
                    onChange={(e) => setPanelWattage(e.target.value)} 
                    className="h-9 text-xs font-mono" 
                    placeholder="550"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Panel Quantity</Label>
                  <Input 
                    type="number" 
                    value={panelQuantity} 
                    onChange={(e) => setPanelQuantity(e.target.value)} 
                    className="h-9 text-xs font-mono" 
                    placeholder="e.g. 18"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Panel Type</Label>
                  <Select value={panelType} onValueChange={(v) => setPanelType(v || 'Tier-1 Monofacial')}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tier-1 Monofacial" className="text-xs">Tier-1 Monofacial</SelectItem>
                      <SelectItem value="Tier-1 Bifacial" className="text-xs">Tier-1 Bifacial Dual Glass</SelectItem>
                      <SelectItem value="Standard Monofacial" className="text-xs">Standard Monofacial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Panel Warranty Expiry Date</Label>
                  <Input 
                    type="date" 
                    value={panelWarrantyEnd} 
                    onChange={(e) => setPanelWarrantyEnd(e.target.value)} 
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3.4 Battery Storage & Structure */}
            <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#002868] uppercase tracking-wider">
                <Battery className="h-3.5 w-3.5 text-amber-600" />
                Battery Storage &amp; Mounting Structure
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Battery Brand</Label>
                  <AutoSuggestInput 
                    value={batteryBrand}
                    onChange={setBatteryBrand}
                    options={BATTERY_BRANDS}
                    placeholder="e.g. Narada, Pylontech, N/A"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Battery Quantity</Label>
                  <Input 
                    type="number" 
                    value={batteryQty} 
                    onChange={(e) => setBatteryQty(e.target.value)} 
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Battery Type</Label>
                  <Select value={batteryType} onValueChange={(v) => setBatteryType(v || 'Lithium-ion')}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lithium-ion" className="text-xs">Lithium-ion (LiFePO4)</SelectItem>
                      <SelectItem value="Tubular Lead Acid" className="text-xs">Tubular Deep Cycle</SelectItem>
                      <SelectItem value="Dry Gel / AGM" className="text-xs">Dry Gel / AGM</SelectItem>
                      <SelectItem value="None / N/A" className="text-xs">None / N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Structure Type</Label>
                  <AutoSuggestInput 
                    value={structureType}
                    onChange={setStructureType}
                    options={STRUCTURE_TYPES}
                    placeholder="e.g. Elevated GI Structure"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Structure Material</Label>
                  <AutoSuggestInput 
                    value={structureMaterial}
                    onChange={setStructureMaterial}
                    options={STRUCTURE_MATERIALS}
                    placeholder="e.g. Hot Dip Galvanized"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Breakers / Switchgear</Label>
                  <Input 
                    value={breakerName} 
                    onChange={(e) => setBreakerName(e.target.value)} 
                    className="h-9 text-xs" 
                    placeholder="e.g. Schneider / ABB"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Earthing AC (Ohms)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={earthingAcOhms} 
                    onChange={(e) => setEarthingAcOhms(e.target.value)} 
                    className="h-9 text-xs font-mono" 
                    placeholder="e.g. 0.6"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Earthing DC (Ohms)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={earthingDcOhms} 
                    onChange={(e) => setEarthingDcOhms(e.target.value)} 
                    className="h-9 text-xs font-mono" 
                    placeholder="e.g. 0.8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: 7-Point Audit Checklist (Available for Verification) */}
          <div className="space-y-3 bg-sky-50/40 p-3.5 rounded-xl border border-sky-200/70">
            <div className="flex items-center gap-2 text-xs font-bold text-[#002868] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-sky-700" />
              4. 7-Point System Audit Checklist &amp; Operating Status
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
              {[
                { label: 'Inverter', value: inverterStatus, setter: setInverterStatus },
                { label: 'PV Panels', value: panelStatus, setter: setPanelStatus },
                { label: 'Battery', value: batteryStatus, setter: setBatteryStatus },
                { label: 'Structure', value: structureStatus, setter: setStructureStatus },
                { label: 'Cabling', value: cableStatus, setter: setCableStatus },
                { label: 'Earthing', value: earthingStatus, setter: setEarthingStatus },
                { label: 'Breakers', value: breakerStatus, setter: setBreakerStatus },
              ].map((item) => (
                <div key={item.label} className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 block">{item.label}</span>
                  <Select value={item.value} onValueChange={(val) => item.setter(val || 'Good')}>
                    <SelectTrigger className="h-7 text-[11px] font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIT_STATUSES.map((st) => (
                        <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Field Technician Allocation / Status */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#002868] uppercase tracking-wider">
              <HardHat className="h-4 w-4 text-amber-700" />
              5. Field Specialist &amp; Technical Allocation
            </div>

            {/* Stage 3 (O&M Review): Technician is systematically assigned and has completed the audit */}
            {isStage3 ? (
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">Assigned Field Specialist</span>
                    <span className="text-sm font-bold text-slate-900">
                      {resolvedInstallerName || 'Assigned Technical Specialist'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs">
                    Audit Completed &amp; Submitted
                  </Badge>
                </div>
              </div>
            ) : (
              /* Stage 1 & 2: Selection dropdown for Sales Manager / Payment Verifier */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    Assign Installer / Field Specialist {isStage1 || isStage2 ? <span className="text-red-500 font-bold">*</span> : ''}
                  </Label>
                  <Select 
                    value={assignedInstallerId} 
                    onValueChange={(val) => setAssignedInstallerId(val || '')}
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-300 font-semibold">
                      <SelectValue placeholder="Select Technician...">
                        {resolvedInstallerName || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {installers && installers.length > 0 ? (
                        installers.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id} className="text-xs font-medium">
                            {inst.fullName} ({inst.role === 'OM_MANAGER' ? 'O&M Manager' : inst.role === 'INSTALLATION' ? 'Installer' : inst.role})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled className="text-xs">No active Installers found</SelectItem>
                      )}
                      {/* Fallback if current assigned ID is not in active installers list */}
                      {assignedInstallerId && !installers.some(i => i.id === assignedInstallerId) && (
                        <SelectItem value={assignedInstallerId} className="text-xs font-medium">
                          {resolvedInstallerName || 'Assigned Specialist'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-500 font-medium">
                    * The selected technician will receive this job in their field queue once payment is verified.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-line pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
            className="w-full sm:w-auto text-xs cursor-pointer"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isSaving}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto text-xs border-slate-300 font-semibold text-slate-700 gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              {isSaving && saveMode === 'SAVE' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 text-slate-600" />
              )}
              Save Edits Only
            </Button>

            <Button 
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit(true)}
              className={
                isStage1 
                  ? 'w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs' 
                  : isStage2 
                  ? 'w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs' 
                  : 'w-full sm:w-auto bg-[#135d86] hover:bg-[#f16232] text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs'
              }
            >
              {isSaving && saveMode === 'SAVE_AND_APPROVE' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {approvalButtonLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
