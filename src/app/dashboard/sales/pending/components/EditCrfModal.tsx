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
import { SYSTEM_SIZES, INVERTER_SIZES, INVERTER_BRANDS, PANEL_BRANDS, BATTERY_BRANDS } from '@/lib/solar-constants'
import { CheckCircle2, Edit3, Loader2, Save, FileText, User, Zap, Wrench } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { calculatePackageBreakdown } from '@/lib/pricing'

const PACKAGES = ['Basic', 'Moderate', 'Comprehensive']
const BILLING_TYPES = ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly']
const MONITORING_TIMES = ['12 Hours', '24 Hours']

interface EditCrfModalProps {
  customer: any | null
  installers?: Array<{ id: string; fullName: string; role: string; email: string }>
  isOpen: boolean
  onClose: () => void
  onSaveCrf: (formData: FormData) => Promise<void>
}

export function EditCrfModal({
  customer,
  installers,
  isOpen,
  onClose,
  onSaveCrf,
}: EditCrfModalProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveMode, setSaveMode] = React.useState<'SAVE' | 'SAVE_AND_APPROVE'>('SAVE')

  // Form State
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
  const [systemSizeKw, setSystemSizeKw] = React.useState('1-10 kW')
  const [packageTier, setPackageTier] = React.useState('Basic')
  const [billingType, setBillingType] = React.useState('Monthly')
  const [monitoringTime, setMonitoringTime] = React.useState('12 Hours')

  // Solar System State
  const [inverterBrand, setInverterBrand] = React.useState('')
  const [inverterSize, setInverterSize] = React.useState('')
  const [panelBrand, setPanelBrand] = React.useState('')
  const [panelQuantity, setPanelQuantity] = React.useState('')
  const [batteryBrand, setBatteryBrand] = React.useState('')
  const [batteryQty, setBatteryQty] = React.useState('')
  const [earthingAcOhms, setEarthingAcOhms] = React.useState('')
  const [earthingDcOhms, setEarthingDcOhms] = React.useState('')

  // Dynamic pricing breakdown
  const breakdown = React.useMemo(() => {
    return calculatePackageBreakdown(systemSizeKw, packageTier, billingType, monitoringTime)
  }, [systemSizeKw, packageTier, billingType, monitoringTime])

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
        setSystemSizeKw(customer.packagePlan.systemSizeKw || '1-10 kW')
        setPackageTier(customer.packagePlan.packageTier || 'Basic')
        setBillingType(customer.packagePlan.billingType || 'Monthly')
        setMonitoringTime(customer.packagePlan.monitoringTime || '12 Hours')
      }

      if (customer.solarSystem) {
        setInverterBrand(customer.solarSystem.inverterBrand || '')
        setInverterSize(customer.solarSystem.inverterSize || '')
        setPanelBrand(customer.solarSystem.panelBrand || '')
        const pQty = customer.solarSystem.noOfPanels !== undefined ? customer.solarSystem.noOfPanels : customer.solarSystem.panelQuantity
        setPanelQuantity(pQty !== undefined && pQty !== null ? String(pQty) : '')
        setBatteryBrand(customer.solarSystem.batteryBrand || '')
        const bQty = customer.solarSystem.noOfBatteries !== undefined ? customer.solarSystem.noOfBatteries : customer.solarSystem.batteryQty
        setBatteryQty(bQty !== undefined && bQty !== null ? String(bQty) : '')
        setEarthingAcOhms(customer.solarSystem.earthingAcOhms !== undefined && customer.solarSystem.earthingAcOhms !== null ? String(customer.solarSystem.earthingAcOhms) : '')
        setEarthingDcOhms(customer.solarSystem.earthingDcOhms !== undefined && customer.solarSystem.earthingDcOhms !== null ? String(customer.solarSystem.earthingDcOhms) : '')
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

  const handleSubmit = async (shouldAdvance: boolean) => {
    setIsSaving(true)
    setSaveMode(shouldAdvance ? 'SAVE_AND_APPROVE' : 'SAVE')
    try {
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

      formData.append('systemSizeKw', systemSizeKw)
      formData.append('packageTier', packageTier)
      formData.append('billingType', billingType)
      formData.append('monitoringTime', monitoringTime)

      // Calculated pricing fields
      formData.append('monthlyBasePrice', String(breakdown.priceAfterDiscount))
      formData.append('appliedDiscount', String(breakdown.discountPct))
      formData.append('salesTaxAmount', String(breakdown.salesTax))
      formData.append('totalAmount', String(breakdown.grandTotal))

      formData.append('inverterBrand', inverterBrand)
      formData.append('inverterSize', inverterSize)
      formData.append('panelBrand', panelBrand)
      formData.append('panelQuantity', panelQuantity)
      formData.append('batteryBrand', batteryBrand)
      formData.append('batteryQty', batteryQty)
      formData.append('earthingAcOhms', earthingAcOhms)
      formData.append('earthingDcOhms', earthingDcOhms)

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
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold font-display text-[#002868] flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                Check & Edit CRF Form Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Review and correct customer details, spelling, package tier, or technical specs before manager approval.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-slate-100 text-slate-800 border-slate-300">
                CRF #: {customer.crfNumber || customer.customerCode}
              </Badge>
              <Badge className={
                isStage1 ? 'bg-amber-600 text-white' : isStage2 ? 'bg-blue-600 text-white' : 'bg-[#002868] text-white'
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
              1. Customer Personal & Address Details
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
                <Label className="text-xs font-semibold text-slate-700">Contact # *</Label>
                <Input 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)} 
                  className="h-9 text-xs font-mono"
                  placeholder="+92 300 1234567"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">POC #</Label>
                <Input 
                  value={pocNumber} 
                  onChange={(e) => setPocNumber(e.target.value)} 
                  className="h-9 text-xs font-mono"
                  placeholder="+92 300 1234567"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Email Address</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-9 text-xs"
                  placeholder="customer@email.com"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Street Address</Label>
                <Input 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Block / Phase</Label>
                <Input 
                  value={block} 
                  onChange={(e) => setBlock(e.target.value)} 
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">City</Label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="h-9 text-xs"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-amber-950">GPS Coordinates / Google Maps Link</Label>
                  {coordinates && (
                    <a
                      href={
                        coordinates.startsWith('http')
                          ? coordinates
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline"
                    >
                      Test Pin ↗
                    </a>
                  )}
                </div>
                <Input 
                  value={coordinates} 
                  onChange={(e) => setCoordinates(e.target.value)} 
                  placeholder="e.g. 31.4707, 74.4101 or Google Maps URL"
                  className="h-9 text-xs font-mono border-amber-300 bg-white focus-visible:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Package & Subscription Configuration */}
          <div className="space-y-3">
            <SectionHeader leftAction={<Zap className="h-4 w-4 text-amber-600" />}>
              2. Subscription Package & Billing Configuration
            </SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">System Size (kW)</Label>
                <Select value={systemSizeKw} onValueChange={(val) => val && setSystemSizeKw(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_SIZES.map(s => (
                      <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Package Tier</Label>
                <Select value={packageTier} onValueChange={(val) => val && setPackageTier(val)}>
                  <SelectTrigger className="h-9 text-xs font-bold">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGES.map(p => (
                      <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Billing Type</Label>
                <Select value={billingType} onValueChange={(val) => val && setBillingType(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_TYPES.map(b => (
                      <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Monitoring Time</Label>
                <Select value={monitoringTime} onValueChange={(val) => val && setMonitoringTime(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONITORING_TIMES.map(m => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Live Pricing Breakdown & Sales Manager Review Box */}
            <div className="mt-2 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-slate-50 p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] font-bold text-[11px] shadow-2xs">
                    Package Pricing Breakdown
                  </Badge>
                  <span className="text-xs text-slate-600 font-medium">
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
                {/* 1. Base Monthly Rate */}
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Base Monthly Rate</span>
                  <span className="text-xs font-bold text-slate-900">PKR {breakdown.baseMonthlyRate.toLocaleString()}</span>
                </div>

                {/* 2. Billing Cycle & Discount */}
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Cycle & Discount</span>
                  <span className="text-xs font-bold text-indigo-700">
                    {breakdown.months} Mo {breakdown.discountPct > 0 ? `(-${breakdown.discountPct}%)` : '(0%)'}
                  </span>
                </div>

                {/* 3. Subtotal (After Discount) */}
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Price after Discount</span>
                  <span className="text-xs font-bold text-slate-900">PKR {breakdown.priceAfterDiscount.toLocaleString()}</span>
                </div>

                {/* 4. Sales Tax (5%) */}
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Sales Tax (5%)</span>
                  <span className="text-xs font-bold text-slate-700">PKR {breakdown.salesTax.toLocaleString()}</span>
                </div>

                {/* 5. Onboarding Fee */}
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">On-Boarding Fee</span>
                  <span className={`text-xs font-bold ${breakdown.isOnboardingWaived ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {breakdown.isOnboardingWaived ? 'Waived (0)' : `PKR ${breakdown.onboardingFee.toLocaleString()}`}
                  </span>
                </div>

                {/* 6. Total Amount */}
                <div className="bg-[#002868] text-white p-2 rounded-lg border border-[#002868] shadow-xs">
                  <span className="text-[10px] text-sky-200 font-medium block">Total Amount</span>
                  <span className="text-xs font-extrabold text-white">PKR {breakdown.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Sales Manager Review Banner */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">💳</span>
                  <div>
                    <span className="font-bold text-amber-950">Current Payable to Review:</span>{' '}
                    <span className="font-mono font-bold text-[#002868] text-sm">
                      PKR {breakdown.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="text-slate-600 text-[11px]">
                  <span>Amount automatically calculates as per selected package and cycle.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Solar Equipment & Technical Specifications */}
          {!isStage1 && (
          <div className="space-y-3">
            <SectionHeader leftAction={<Wrench className="h-4 w-4 text-amber-600" />}>
              3. Solar Hardware & Technical Specifications
            </SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Inverter Brand</Label>
                <AutoSuggestInput 
                  value={inverterBrand}
                  onChange={setInverterBrand}
                  options={INVERTER_BRANDS}
                  placeholder="e.g. Knox, Fronius"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Inverter Size</Label>
                <AutoSuggestInput 
                  value={inverterSize}
                  onChange={setInverterSize}
                  options={INVERTER_SIZES}
                  placeholder="e.g. 10kW, 15kW"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Panel Brand</Label>
                <AutoSuggestInput 
                  value={panelBrand}
                  onChange={setPanelBrand}
                  options={PANEL_BRANDS}
                  placeholder="e.g. LONGi, Jinko"
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

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Battery Brand</Label>
                <AutoSuggestInput 
                  value={batteryBrand}
                  onChange={setBatteryBrand}
                  options={BATTERY_BRANDS}
                  placeholder="e.g. Pylontech, BYD"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Battery Qty</Label>
                <Input 
                  type="number"
                  value={batteryQty} 
                  onChange={(e) => setBatteryQty(e.target.value)} 
                  className="h-9 text-xs font-mono"
                  placeholder="e.g. 2"
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
                  placeholder="e.g. 1.2"
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
          )}

          {/* Section 4: O&M Field Installer Allocation */}
          {!isStage1 && (
          <div className="space-y-3 bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/70">
            <div className="flex items-center gap-2 text-sm font-bold text-[#002868]">
              <User className="h-4 w-4 text-amber-700" />
              4. O&M Field Allocation &amp; System Audit
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-amber-950">Assign Installer / Field Specialist</Label>
                <Select value={assignedInstallerId} onValueChange={(val) => setAssignedInstallerId(val || '')}>
                  <SelectTrigger className="h-9 text-xs bg-white border-amber-300 font-semibold">
                    <SelectValue placeholder="Select Technician..." />
                  </SelectTrigger>
                  <SelectContent>
                    {installers && installers.length > 0 ? (
                      installers.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id} className="text-xs font-medium">
                          {inst.fullName} ({inst.role === 'OM_MANAGER' ? 'O & M Manager' : 'Installer'})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-xs">No active O&M Manager or Installers found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          )}
        </div>

        <DialogFooter className="border-t border-line pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
            className="w-full sm:w-auto text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isSaving}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto text-xs border-slate-300 font-semibold text-slate-700 gap-1.5"
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
                  ? 'w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5' 
                  : isStage2 
                  ? 'w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5' 
                  : 'w-full sm:w-auto bg-[#135d86] hover:bg-[#f16232] text-white text-xs font-bold gap-1.5'
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
