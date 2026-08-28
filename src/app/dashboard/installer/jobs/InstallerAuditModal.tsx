'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AutoSuggestInput } from '@/components/ui/auto-suggest-input'
import { DateInput } from '@/components/ui/date-input'
import { submitInstallerAudit } from './actions'
import { formatDiscoRefNo } from '@/lib/utils'
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
import {
  Wrench,
  CheckCircle2,
  Loader2,
  Sun,
  Battery,
  ShieldCheck,
  Zap,
  ExternalLink,
  Camera,
  Trash2,
  ImageIcon,
  MapPin,
} from 'lucide-react'

const AUDIT_STATUSES = ['Excellent', 'Good', 'Fair', 'Service Required', 'Replacement Required']

interface InstallerAuditModalProps {
  customer: any
  installerName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InstallerAuditModal({
  customer,
  installerName,
  isOpen,
  onClose,
  onSuccess,
}: InstallerAuditModalProps) {
  const solar = customer?.solarSystem || {}
  const plan = customer?.packagePlan || {}

  const [activeTab, setActiveTab] = React.useState<'specs' | 'audit'>('specs')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // 1. DISCO Utility & Meter Connection
  const [disco, setDisco] = React.useState(solar.disco || '')
  const [discoRefNo, setDiscoRefNo] = React.useState(solar.discoRefNo || '')
  const [meterType, setMeterType] = React.useState(solar.meterType || 'Green Meter')
  const [meterPhase, setMeterPhase] = React.useState(solar.meterPhase || 'Three Phase')
  const [zeroExportDevice, setZeroExportDevice] = React.useState(solar.zeroExportDevice ? 'Installed' : 'Not Installed')

  // 2. Inverter Unit Specifications
  const [inverterBrand, setInverterBrand] = React.useState(solar.inverterBrand || '')
  const [inverterSize, setInverterSize] = React.useState(solar.inverterSize || plan.systemSizeKw || '')
  const [inverterType, setInverterType] = React.useState(solar.inverterType || 'Hybrid')
  const [inverterPhase, setInverterPhase] = React.useState(solar.inverterPhase || 'Three Phase')
  const [inverterCategory, setInverterCategory] = React.useState(solar.inverterCategory || 'Low Voltage')
  const [noOfInverters, setNoOfInverters] = React.useState<number>(solar.noOfInverters != null ? Number(solar.noOfInverters) : 1)
  const [inverterSerial, setInverterSerial] = React.useState(solar.inverterSerial || '')
  const [inverterWarrantyEnd, setInverterWarrantyEnd] = React.useState(
    solar.inverterWarrantyEnd ? new Date(solar.inverterWarrantyEnd).toISOString().split('T')[0] : ''
  )
  const [inverterImageUrl, setInverterImageUrl] = React.useState(solar.inverterImages?.[0] || '')
  const [uploadingInverter, setUploadingInverter] = React.useState(false)

  // 3. Solar PV Panels Specifications
  const [panelBrand, setPanelBrand] = React.useState(solar.panelBrand || '')
  const [panelTechnology, setPanelTechnology] = React.useState(solar.panelTechnology || 'Topcon')
  const [panelType, setPanelType] = React.useState(solar.panelType || 'Tier-1 Monofacial')
  const [panelWattage, setPanelWattage] = React.useState<number>(solar.panelWattage != null ? Number(solar.panelWattage) : 0)
  const [noOfPanels, setNoOfPanels] = React.useState<number>(solar.noOfPanels != null ? Number(solar.noOfPanels) : 0)
  const [panelWarrantyEnd, setPanelWarrantyEnd] = React.useState(
    solar.panelWarrantyEnd ? new Date(solar.panelWarrantyEnd).toISOString().split('T')[0] : ''
  )
  const [panelImageUrl, setPanelImageUrl] = React.useState(solar.panelImages?.[0] || '')
  const [uploadingPanel, setUploadingPanel] = React.useState(false)

  // 4. Battery Energy Storage System (BESS)
  const [batteryBrand, setBatteryBrand] = React.useState(solar.batteryBrand || (solar.noOfBatteries ? '' : 'N/A'))
  const [batteryType, setBatteryType] = React.useState(solar.batteryType || 'Lithium-ion')
  const [batteryCategory, setBatteryCategory] = React.useState(solar.batteryCategory || 'Low Voltage (LV)')
  const [noOfBatteries, setNoOfBatteries] = React.useState<number>(solar.noOfBatteries != null ? Number(solar.noOfBatteries) : 0)
  const [batterySerial, setBatterySerial] = React.useState(solar.batterySerial || '')
  const [batteryWarrantyEnd, setBatteryWarrantyEnd] = React.useState(
    solar.batteryWarrantyEnd ? new Date(solar.batteryWarrantyEnd).toISOString().split('T')[0] : ''
  )
  const [batteryImageUrl, setBatteryImageUrl] = React.useState(solar.batteryImages?.[0] || '')
  const [uploadingBattery, setUploadingBattery] = React.useState(false)

  // 5. Mounting Structure, Earthing & Protection Specs
  const [structureType, setStructureType] = React.useState(solar.structureType || 'Elevated')
  const [structureMaterial, setStructureMaterial] = React.useState(solar.structureMaterial || 'Hot Dip Galvanized')
  const [ingressProtection, setIngressProtection] = React.useState(solar.ingressProtection || 'IP65')
  const [breakerName, setBreakerName] = React.useState(solar.breakerName || 'Standard DC/AC Breakers')
  const [earthing, setEarthing] = React.useState(solar.earthing || 'Both')
  const [systemInstallationDate, setSystemInstallationDate] = React.useState(
    solar.systemInstallationDate ? new Date(solar.systemInstallationDate).toISOString().split('T')[0] : ''
  )

  // Part 3: 7-Point Audit Checklist
  const [inverterStatus, setInverterStatus] = React.useState(solar.inverterStatus || 'Good')
  const [panelStatus, setPanelStatus] = React.useState(solar.panelStatus || 'Good')
  const [batteryStatus, setBatteryStatus] = React.useState(solar.batteryStatus || 'Good')
  const [structureStatus, setStructureStatus] = React.useState(solar.structureStatus || 'Good')
  const [cableStatus, setCableStatus] = React.useState(solar.cableStatus || 'Good')
  const [earthingStatus, setEarthingStatus] = React.useState(solar.earthingStatus || 'Good')
  const [breakerStatus, setBreakerStatus] = React.useState(solar.breakerStatus || 'Good')

  const [earthingAcOhms, setEarthingAcOhms] = React.useState<string>(solar.earthingAcOhms != null ? String(solar.earthingAcOhms) : '0.6')
  const [earthingDcOhms, setEarthingDcOhms] = React.useState<string>(solar.earthingDcOhms != null ? String(solar.earthingDcOhms) : '0.8')
  const [earthingLastCheck, setEarthingLastCheck] = React.useState(
    solar.earthingLastCheck ? new Date(solar.earthingLastCheck).toISOString().split('T')[0] : ''
  )
  const [lightningProtection, setLightningProtection] = React.useState(solar.lightningProtection !== false ? 'Installed' : 'Not Installed')

  // Re-sync all state whenever customer changes
  React.useEffect(() => {
    if (customer) {
      const s = customer.solarSystem || {}
      const p = customer.packagePlan || {}

      // Section 1
      setDisco(s.disco || '')
      setDiscoRefNo(s.discoRefNo || '')
      setMeterType(s.meterType || 'Green Meter')
      setMeterPhase(s.meterPhase || 'Three Phase')
      setZeroExportDevice(s.zeroExportDevice ? 'Installed' : 'Not Installed')

      // Section 2
      setInverterBrand(s.inverterBrand || '')
      setInverterSize(s.inverterSize || p.systemSizeKw || '')
      setInverterType(s.inverterType || 'Hybrid')
      setInverterPhase(s.inverterPhase || 'Three Phase')
      setInverterCategory(s.inverterCategory || 'Low Voltage')
      setNoOfInverters(s.noOfInverters != null ? Number(s.noOfInverters) : 1)
      setInverterSerial(s.inverterSerial || '')
      setInverterWarrantyEnd(s.inverterWarrantyEnd ? new Date(s.inverterWarrantyEnd).toISOString().split('T')[0] : '')
      setInverterImageUrl(s.inverterImages?.[0] || '')

      // Section 3
      setPanelBrand(s.panelBrand || '')
      setPanelTechnology(s.panelTechnology || 'Topcon')
      setPanelType(s.panelType || 'Tier-1 Monofacial')
      setPanelWattage(s.panelWattage != null ? Number(s.panelWattage) : 0)
      setNoOfPanels(s.noOfPanels != null ? Number(s.noOfPanels) : 0)
      setPanelWarrantyEnd(s.panelWarrantyEnd ? new Date(s.panelWarrantyEnd).toISOString().split('T')[0] : '')
      setPanelImageUrl(s.panelImages?.[0] || '')

      // Section 4
      setBatteryBrand(s.batteryBrand || (s.noOfBatteries ? '' : 'N/A'))
      setBatteryType(s.batteryType || 'Lithium-ion')
      setBatteryCategory(s.batteryCategory || 'Low Voltage (LV)')
      setNoOfBatteries(s.noOfBatteries != null ? Number(s.noOfBatteries) : 0)
      setBatterySerial(s.batterySerial || '')
      setBatteryWarrantyEnd(s.batteryWarrantyEnd ? new Date(s.batteryWarrantyEnd).toISOString().split('T')[0] : '')
      setBatteryImageUrl(s.batteryImages?.[0] || '')

      // Section 5
      setStructureType(s.structureType || 'Elevated')
      setStructureMaterial(s.structureMaterial || 'Hot Dip Galvanized')
      setIngressProtection(s.ingressProtection || 'IP65')
      setBreakerName(s.breakerName || 'Standard DC/AC Breakers')
      setEarthing(s.earthing || 'Both')
      setSystemInstallationDate(s.systemInstallationDate ? new Date(s.systemInstallationDate).toISOString().split('T')[0] : '')

      // Part 3
      setInverterStatus(s.inverterStatus || 'Good')
      setPanelStatus(s.panelStatus || 'Good')
      setBatteryStatus(s.batteryStatus || 'Good')
      setStructureStatus(s.structureStatus || 'Good')
      setCableStatus(s.cableStatus || 'Good')
      setEarthingStatus(s.earthingStatus || 'Good')
      setBreakerStatus(s.breakerStatus || 'Good')

      setEarthingAcOhms(s.earthingAcOhms != null ? String(s.earthingAcOhms) : '0.6')
      setEarthingDcOhms(s.earthingDcOhms != null ? String(s.earthingDcOhms) : '0.8')
      setEarthingLastCheck(s.earthingLastCheck ? new Date(s.earthingLastCheck).toISOString().split('T')[0] : '')
      setLightningProtection(s.lightningProtection !== false ? 'Installed' : 'Not Installed')
    }
  }, [customer])

  // Helper for uploading equipment photos
  async function uploadEquipmentPhoto(file: File, folder: string): Promise<string | null> {
    const data = new FormData()
    data.append('file', file)
    data.append('folder', folder)

    const res = await fetch('/api/upload/r2', {
      method: 'POST',
      body: data,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to upload photo.')
    }

    const result = await res.json()
    return result.url
  }

  async function handleInverterPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingInverter(true)
    setError(null)
    try {
      const url = await uploadEquipmentPhoto(file, 'equipment/inverters')
      if (url) setInverterImageUrl(url)
    } catch (err: any) {
      setError(`Inverter Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingInverter(false)
    }
  }

  async function handlePanelPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPanel(true)
    setError(null)
    try {
      const url = await uploadEquipmentPhoto(file, 'equipment/panels')
      if (url) setPanelImageUrl(url)
    } catch (err: any) {
      setError(`Panel Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingPanel(false)
    }
  }

  async function handleBatteryPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBattery(true)
    setError(null)
    try {
      const url = await uploadEquipmentPhoto(file, 'equipment/batteries')
      if (url) setBatteryImageUrl(url)
    } catch (err: any) {
      setError(`Battery Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingBattery(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('disco', disco)
      formData.append('discoRefNo', discoRefNo)
      formData.append('meterType', meterType)
      formData.append('meterPhase', meterPhase)
      formData.append('zeroExportDevice', zeroExportDevice)

      formData.append('inverterBrand', inverterBrand)
      formData.append('inverterSize', inverterSize)
      formData.append('inverterType', inverterType)
      formData.append('inverterPhase', inverterPhase)
      formData.append('inverterCategory', inverterCategory)
      formData.append('noOfInverters', String(noOfInverters))
      formData.append('inverterSerial', inverterSerial)
      formData.append('inverterWarrantyEnd', inverterWarrantyEnd)
      formData.append('inverterImageUrl', inverterImageUrl)

      formData.append('panelBrand', panelBrand)
      formData.append('panelTechnology', panelTechnology)
      formData.append('panelType', panelType)
      formData.append('panelWattage', String(panelWattage))
      formData.append('noOfPanels', String(noOfPanels))
      formData.append('panelWarrantyEnd', panelWarrantyEnd)
      formData.append('panelImageUrl', panelImageUrl)

      formData.append('batteryBrand', batteryBrand)
      formData.append('batteryType', batteryType)
      formData.append('batteryCategory', batteryCategory)
      formData.append('noOfBatteries', String(noOfBatteries))
      formData.append('batterySerial', batterySerial)
      formData.append('batteryWarrantyEnd', batteryWarrantyEnd)
      formData.append('batteryImageUrl', batteryImageUrl)

      formData.append('structureType', structureType)
      formData.append('structureMaterial', structureMaterial)
      formData.append('ingressProtection', ingressProtection)
      formData.append('breakerName', breakerName)
      formData.append('earthing', earthing)
      formData.append('systemInstallationDate', systemInstallationDate)

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
      formData.append('lightningProtection', lightningProtection)

      formData.append('installerName', installerName || 'Installer Team')

      await submitInstallerAudit(formData)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to submit technical audit.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!customer) return null

  const totalPvKw = ((Number(panelWattage) || 0) * (Number(noOfPanels) || 0)) / 1000
  const customerIdDisplay = customer.customerCode?.replace(/\D/g, '') || customer.customerCode || customer.id
  const crfDisplay = customer.crfNumber || (customer.customerCode ? `CRF-${customer.customerCode.replace(/\D/g, '')}` : '—')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-line pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold font-display text-[#002868] flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600" />
                Technical Specs &amp; System Audit Entry
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Customer: <strong className="text-slate-800">{customer.fullName}</strong> | ID:{' '}
                <strong className="font-mono text-amber-700">{customerIdDisplay}</strong> | CRF:{' '}
                <strong className="font-mono">{crfDisplay}</strong>
              </DialogDescription>
            </div>

            {/* Quick Actions: Open Map & Contract PDF Link */}
            <div className="flex items-center gap-2">
              <a
                href={
                  customer.coordinates?.trim()
                    ? (customer.coordinates.startsWith('http')
                        ? customer.coordinates
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.coordinates)}`)
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customer.address || ''}, ${customer.city || ''}, Pakistan`)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Open location pinpoint on Google Maps"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                Open Map
              </a>

              <a
                href={`/api/signup/${customer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="View original Customer Signup Agreement & Contract"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-600" />
                Contract
              </a>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'bg-[#002868] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Part 2: Solar Hardware Specs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-[#002868] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Part 3: 7-Point Audit Checklist
            </button>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 1. Meter & Utility Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">1. DISCO Utility &amp; Meter Connection</p>
                  <span className="text-[11px] font-mono text-slate-500">{disco || 'DISCO Unset'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">DISCO Utility Company</Label>
                    <AutoSuggestInput
                      value={disco}
                      onChange={setDisco}
                      options={DISCO_LIST}
                      placeholder="e.g. LESCO, K-Electric"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">Consumer Reference #</Label>
                    <Input
                      value={discoRefNo}
                      onChange={(e) => setDiscoRefNo(formatDiscoRefNo(e.target.value))}
                      placeholder="e.g. 04-11515-0469701 U"
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">Meter Type</Label>
                    <Select value={meterType} onValueChange={(val) => setMeterType(val || 'Green Meter')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Green Meter">Green Meter</SelectItem>
                        <SelectItem value="Non Green">Non Green</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">Meter Phase</Label>
                    <Select value={meterPhase} onValueChange={(val) => setMeterPhase(val || 'Three Phase')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Three Phase">Three Phase</SelectItem>
                        <SelectItem value="Single Phase">Single Phase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">Zero Export Device</Label>
                    <Select value={zeroExportDevice} onValueChange={(val) => setZeroExportDevice(val || 'Not Installed')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Installed">Installed</SelectItem>
                        <SelectItem value="Not Installed">Not Installed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 2. Inverter Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">2. Inverter Unit Specifications</p>
                  {inverterImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Brand *</Label>
                    <AutoSuggestInput
                      value={inverterBrand}
                      onChange={setInverterBrand}
                      options={INVERTER_BRANDS}
                      placeholder="e.g. Solis, Huawei, Growatt"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Capacity / Size</Label>
                    <AutoSuggestInput
                      value={inverterSize}
                      onChange={setInverterSize}
                      options={INVERTER_SIZES}
                      placeholder="e.g. 6kW, 10kW"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Type</Label>
                    <Select value={inverterType} onValueChange={(val) => setInverterType(val || 'Hybrid')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="OnGrid">On-Grid</SelectItem>
                        <SelectItem value="OffGrid">Off-Grid</SelectItem>
                        <SelectItem value="Hybrid+OnGrid">Hybrid + OnGrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Phase</Label>
                    <Select value={inverterPhase} onValueChange={(val) => setInverterPhase(val || 'Three Phase')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Three Phase">Three Phase</SelectItem>
                        <SelectItem value="Single Phase">Single Phase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Category</Label>
                    <Select value={inverterCategory} onValueChange={(val) => setInverterCategory(val || 'Low Voltage')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low Voltage">Low Voltage (LV)</SelectItem>
                        <SelectItem value="High Voltage">High Voltage (HV)</SelectItem>
                        <SelectItem value="On-Grid">On-Grid Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">No. of Inverters</Label>
                    <Input
                      type="number"
                      min={1}
                      value={noOfInverters}
                      onChange={(e) => setNoOfInverters(Math.max(1, Number(e.target.value) || 1))}
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-semibold">Inverter Serial # *</Label>
                    <Input
                      value={inverterSerial}
                      onChange={(e) => setInverterSerial(e.target.value)}
                      placeholder="e.g. SN-INV-049812"
                      className="h-9 text-xs font-mono bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Inverter Warranty Expiry Date</Label>
                    <DateInput
                      value={inverterWarrantyEnd}
                      onChange={(e) => setInverterWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-amber-600" />
                      Inverter Hardware Photo
                    </Label>
                    <div className="relative flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleInverterPhoto}
                        disabled={uploadingInverter}
                        className="h-9 text-xs bg-white border-amber-200 file:bg-amber-100 file:text-amber-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingInverter && (
                        <div className="absolute right-3 flex items-center gap-1 text-xs text-amber-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                      {inverterImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setInverterImageUrl('')}
                          className="h-9 px-2 text-red-600 hover:bg-red-50 text-xs shrink-0"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Solar Panels Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">3. Solar PV Panels Specifications</p>
                  {panelImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panel Brand *</Label>
                    <AutoSuggestInput
                      value={panelBrand}
                      onChange={setPanelBrand}
                      options={PANEL_BRANDS}
                      placeholder="e.g. LONGi, Jinko, Canadian"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panel Technology</Label>
                    <Select value={panelTechnology} onValueChange={(val) => setPanelTechnology(val || 'Topcon')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Topcon">Topcon (N-Type)</SelectItem>
                        <SelectItem value="Mono Perc">Mono Perc</SelectItem>
                        <SelectItem value="Monocrystalline">Monocrystalline</SelectItem>
                        <SelectItem value="HJT">HJT (Heterojunction)</SelectItem>
                        <SelectItem value="ABC">ABC</SelectItem>
                        <SelectItem value="Polycrystalline">Polycrystalline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panel Type</Label>
                    <Select value={panelType} onValueChange={(val) => setPanelType(val || 'Tier-1 Monofacial')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tier-1 Monofacial">Tier-1 Monofacial</SelectItem>
                        <SelectItem value="Tier-1 Bifacial">Tier-1 Bifacial</SelectItem>
                        <SelectItem value="Standard Monofacial">Standard Monofacial</SelectItem>
                        <SelectItem value="Standard Bifacial">Standard Bifacial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panel Wattage (W)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={panelWattage || ''}
                      onChange={(e) => setPanelWattage(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="e.g. 585"
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">No. of Panels</Label>
                    <Input
                      type="number"
                      min={0}
                      value={noOfPanels || ''}
                      onChange={(e) => setNoOfPanels(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="e.g. 16"
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Total PV Capacity</Label>
                    <div className="h-9 flex items-center justify-between px-3 bg-amber-50 rounded-md border border-amber-200 font-bold font-mono text-xs text-amber-950">
                      <span>{totalPvKw.toFixed(2)} kW</span>
                      <span className="text-[10px] text-amber-700 font-normal">({panelWattage * noOfPanels} W)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Panel Warranty Expiry Date</Label>
                    <DateInput
                      value={panelWarrantyEnd}
                      onChange={(e) => setPanelWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-teal-600" />
                      Solar Array Picture
                    </Label>
                    <div className="relative flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePanelPhoto}
                        disabled={uploadingPanel}
                        className="h-9 text-xs bg-white border-teal-200 file:bg-teal-100 file:text-teal-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingPanel && (
                        <div className="absolute right-3 flex items-center gap-1 text-xs text-teal-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                      {panelImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPanelImageUrl('')}
                          className="h-9 px-2 text-red-600 hover:bg-red-50 text-xs shrink-0"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Battery Storage Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">4. Battery Energy Storage System (BESS)</p>
                  {batteryImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Brand</Label>
                    <AutoSuggestInput
                      value={batteryBrand}
                      onChange={setBatteryBrand}
                      options={['N/A', ...BATTERY_BRANDS]}
                      placeholder="e.g. Narada, Pylontech, N/A"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Chemistry / Type</Label>
                    <Select value={batteryType} onValueChange={(val) => setBatteryType(val || 'Lithium-ion')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lithium-ion">Lithium LiFePO4</SelectItem>
                        <SelectItem value="Tubular">Tubular</SelectItem>
                        <SelectItem value="Lead Acid">Lead Acid</SelectItem>
                        <SelectItem value="Dry">Dry Cell</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Category</Label>
                    <Select value={batteryCategory} onValueChange={(val) => setBatteryCategory(val || 'Low Voltage (LV)')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low Voltage (LV)">Low Voltage (LV) 48V</SelectItem>
                        <SelectItem value="High Voltage (HV)">High Voltage (HV)</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">No. of Batteries</Label>
                    <Input
                      type="number"
                      min={0}
                      value={noOfBatteries}
                      onChange={(e) => setNoOfBatteries(Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Serial #</Label>
                    <Input
                      value={batterySerial}
                      onChange={(e) => setBatterySerial(e.target.value)}
                      placeholder="e.g. SN-BAT-092819 (Optional)"
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Battery Warranty Expiry Date</Label>
                    <DateInput
                      value={batteryWarrantyEnd}
                      onChange={(e) => setBatteryWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-sky-600" />
                      Battery Bank Photo
                    </Label>
                    <div className="relative flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleBatteryPhoto}
                        disabled={uploadingBattery}
                        className="h-9 text-xs bg-white border-slate-300 file:bg-slate-100 file:text-slate-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingBattery && (
                        <div className="absolute right-3 flex items-center gap-1 text-xs text-sky-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                      {batteryImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setBatteryImageUrl('')}
                          className="h-9 px-2 text-red-600 hover:bg-red-50 text-xs shrink-0"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Mounting Structure, Earthing & Protection Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">5. Mounting Structure, Protection &amp; Installation Specs</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Structure Type</Label>
                    <Select value={structureType} onValueChange={(val) => setStructureType(val || 'Elevated')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STRUCTURE_TYPES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Structure Material</Label>
                    <Select value={structureMaterial} onValueChange={(val) => setStructureMaterial(val || 'Hot Dip Galvanized')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STRUCTURE_MATERIALS.map((sm) => (
                          <SelectItem key={sm} value={sm}>{sm}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Ingress Protection (IP)</Label>
                    <Select value={ingressProtection} onValueChange={(val) => setIngressProtection(val || 'IP65')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IP_LIST.map((ip) => (
                          <SelectItem key={ip} value={ip}>{ip}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Breaker &amp; Switchgear Spec</Label>
                    <Input
                      value={breakerName}
                      onChange={(e) => setBreakerName(e.target.value)}
                      placeholder="e.g. Schneider 32A MCB, CNC"
                      className="h-9 text-xs bg-white font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Earthing Protection Type</Label>
                    <Select value={earthing} onValueChange={(val) => setEarthing(val || 'Both')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Both">Both AC &amp; DC Earthing</SelectItem>
                        <SelectItem value="AC">AC Earthing Only</SelectItem>
                        <SelectItem value="DC">DC Earthing Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">System Installation Date</Label>
                    <DateInput
                      value={systemInstallationDate}
                      onChange={(e) => setSystemInstallationDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">7-Point System Technical Inspection Checklist</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: '1. Inverter Operating Condition', val: inverterStatus, set: setInverterStatus },
                    { label: '2. Solar PV Panels & Soiling Status', val: panelStatus, set: setPanelStatus },
                    { label: '3. Battery Storage & Health Status', val: batteryStatus, set: setBatteryStatus },
                    { label: '4. Mounting Structure & GI Material', val: structureStatus, set: setStructureStatus },
                    { label: '5. DC & AC Cabling & Conduits', val: cableStatus, set: setCableStatus },
                    { label: '6. AC & DC Earthing & Protection', val: earthingStatus, set: setEarthingStatus },
                    { label: '7. Breakers, Isolators & Switchgear', val: breakerStatus, set: setBreakerStatus },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">{item.label}</Label>
                      <Select value={item.val} onValueChange={(val) => item.set(val || 'Good')}>
                        <SelectTrigger className="h-9 text-xs bg-white font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIT_STATUSES.map(st => (
                            <SelectItem key={st} value={st}>{st}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Parameters */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">Earthing Resistance &amp; Safety Parameters</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">AC Earthing (Ω)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={earthingAcOhms}
                      onChange={(e) => setEarthingAcOhms(e.target.value)}
                      placeholder="e.g. 0.6"
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">DC Earthing (Ω)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={earthingDcOhms}
                      onChange={(e) => setEarthingDcOhms(e.target.value)}
                      placeholder="e.g. 0.8"
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Earthing Inspection Date</Label>
                    <DateInput
                      value={earthingLastCheck}
                      onChange={(e) => setEarthingLastCheck(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Lightning Protection</Label>
                    <Select value={lightningProtection} onValueChange={(val) => setLightningProtection(val || 'Installed')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Installed">Installed &amp; Tested</SelectItem>
                        <SelectItem value="Not Installed">Not Installed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-line pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs gap-2 px-6 shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting to O&amp;M Manager...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Submit Audit to O&amp;M Manager
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
