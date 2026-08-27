'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { saveSolarSystem } from './actions'
import { AutoSuggestInput } from '@/components/ui/auto-suggest-input'
import { formatDiscoRefNo } from '@/lib/utils'
import { INVERTER_SIZES, INVERTER_BRANDS, PANEL_BRANDS, BATTERY_BRANDS } from '@/lib/solar-constants'
import { Camera, UploadCloud, Loader2, Image as ImageIcon, CheckCircle2, Trash2 } from 'lucide-react'

const DISCO_LIST = ['LESCO', 'IESCO', 'K-Electric', 'FESCO', 'MEPCO', 'PESCO', 'GEPCO', 'QESCO', 'HESCO', 'SEPCO', 'TESCO', 'Other']

export function SolarSystemDialog({
  customerId,
  solarSystem,
}: {
  customerId: string
  solarSystem?: any
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Inverter Specs
  const [inverterBrand, setInverterBrand] = React.useState(solarSystem?.inverterBrand || '')
  const [inverterType, setInverterType] = React.useState(solarSystem?.inverterType || '')
  const [inverterPhase, setInverterPhase] = React.useState(solarSystem?.inverterPhase || '')
  const [inverterCategory, setInverterCategory] = React.useState(solarSystem?.inverterCategory || '')
  const [inverterSize, setInverterSize] = React.useState(solarSystem?.inverterSize || '')
  const [inverterSerial, setInverterSerial] = React.useState(solarSystem?.inverterSerial || '')
  const [noOfInverters, setNoOfInverters] = React.useState<number>(solarSystem?.noOfInverters ?? 1)
  const [inverterWarrantyEnd, setInverterWarrantyEnd] = React.useState(
    solarSystem?.inverterWarrantyEnd ? new Date(solarSystem.inverterWarrantyEnd).toISOString().split('T')[0] : ''
  )

  // Panels Specs
  const [panelBrand, setPanelBrand] = React.useState(solarSystem?.panelBrand || '')
  const [panelType, setPanelType] = React.useState(solarSystem?.panelType || '')
  const [panelTechnology, setPanelTechnology] = React.useState(solarSystem?.panelTechnology || '')
  const [panelWattage, setPanelWattage] = React.useState<number>(solarSystem?.panelWattage ?? 0)
  const [noOfPanels, setNoOfPanels] = React.useState<number>(solarSystem?.noOfPanels ?? 0)
  const [panelWarrantyEnd, setPanelWarrantyEnd] = React.useState(
    solarSystem?.panelWarrantyEnd ? new Date(solarSystem.panelWarrantyEnd).toISOString().split('T')[0] : ''
  )

  // Battery Specs & Grid
  const [batteryBrand, setBatteryBrand] = React.useState(solarSystem?.batteryBrand || '')
  const [batteryType, setBatteryType] = React.useState(solarSystem?.batteryType || '')
  const [batteryCategory, setBatteryCategory] = React.useState(solarSystem?.batteryCategory || '')
  const [noOfBatteries, setNoOfBatteries] = React.useState<number>(solarSystem?.noOfBatteries ?? 0)
  const [batterySerial, setBatterySerial] = React.useState(solarSystem?.batterySerial || '')
  const [batteryWarrantyEnd, setBatteryWarrantyEnd] = React.useState(
    solarSystem?.batteryWarrantyEnd ? new Date(solarSystem.batteryWarrantyEnd).toISOString().split('T')[0] : ''
  )
  const [disco, setDisco] = React.useState(solarSystem?.disco || '')
  const [discoRefNo, setDiscoRefNo] = React.useState(solarSystem?.discoRefNo || '')
  const [meterType, setMeterType] = React.useState(solarSystem?.meterType || '')

  React.useEffect(() => {
    if (solarSystem) {
      setInverterBrand(solarSystem.inverterBrand || '')
      setInverterType(solarSystem.inverterType || '')
      setInverterPhase(solarSystem.inverterPhase || '')
      setInverterCategory(solarSystem.inverterCategory || '')
      setInverterSize(solarSystem.inverterSize || '')
      setInverterSerial(solarSystem.inverterSerial || '')
      setNoOfInverters(solarSystem.noOfInverters ?? 1)
      setInverterWarrantyEnd(solarSystem.inverterWarrantyEnd ? new Date(solarSystem.inverterWarrantyEnd).toISOString().split('T')[0] : '')

      setPanelBrand(solarSystem.panelBrand || '')
      setPanelType(solarSystem.panelType || '')
      setPanelTechnology(solarSystem.panelTechnology || '')
      setPanelWattage(solarSystem.panelWattage ?? 0)
      setNoOfPanels(solarSystem.noOfPanels ?? 0)
      setPanelWarrantyEnd(solarSystem.panelWarrantyEnd ? new Date(solarSystem.panelWarrantyEnd).toISOString().split('T')[0] : '')

      setBatteryBrand(solarSystem.batteryBrand || '')
      setBatteryType(solarSystem.batteryType || '')
      setBatteryCategory(solarSystem.batteryCategory || '')
      setNoOfBatteries(solarSystem.noOfBatteries ?? 0)
      setBatterySerial(solarSystem.batterySerial || '')
      setBatteryWarrantyEnd(solarSystem.batteryWarrantyEnd ? new Date(solarSystem.batteryWarrantyEnd).toISOString().split('T')[0] : '')

      setDisco(solarSystem.disco || '')
      setDiscoRefNo(solarSystem.discoRefNo || '')
      setMeterType(solarSystem.meterType || '')

      setInverterImageUrl(solarSystem.inverterImages?.[0] || '')
      setBatteryImageUrl(solarSystem.batteryImages?.[0] || '')
      setPanelImageUrl(solarSystem.panelImages?.[0] || '')
    }
  }, [solarSystem])

  // Equipment Photos (Uploaded to Cloudflare R2 Cloud)
  const [inverterImageFile, setInverterImageFile] = React.useState<File | null>(null)
  const [batteryImageFile, setBatteryImageFile] = React.useState<File | null>(null)
  const [panelImageFile, setPanelImageFile] = React.useState<File | null>(null)
  
  const [inverterImageUrl, setInverterImageUrl] = React.useState<string>(
    solarSystem?.inverterImages?.[0] || ''
  )
  const [batteryImageUrl, setBatteryImageUrl] = React.useState<string>(
    solarSystem?.batteryImages?.[0] || ''
  )
  const [panelImageUrl, setPanelImageUrl] = React.useState<string>(
    solarSystem?.panelImages?.[0] || ''
  )

  const [uploadingInverter, setUploadingInverter] = React.useState(false)
  const [uploadingBattery, setUploadingBattery] = React.useState(false)
  const [uploadingPanel, setUploadingPanel] = React.useState(false)

  // Upload file helper using R2 Cloud storage endpoint
  async function uploadToR2Cloud(file: File, folder: string): Promise<string | null> {
    const data = new FormData()
    data.append('file', file)
    data.append('folder', folder)

    const res = await fetch('/api/upload/r2', {
      method: 'POST',
      body: data,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to upload image to Cloudflare R2 Cloud.')
    }

    const result = await res.json()
    return result.url
  }

  async function handleInverterFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setInverterImageFile(file)
    setUploadingInverter(true)
    setError(null)

    try {
      const url = await uploadToR2Cloud(file, 'equipment/inverters')
      if (url) {
        setInverterImageUrl(url)
      }
    } catch (err: any) {
      setError(`Inverter Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingInverter(false)
    }
  }

  async function handleBatteryFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBatteryImageFile(file)
    setUploadingBattery(true)
    setError(null)

    try {
      const url = await uploadToR2Cloud(file, 'equipment/batteries')
      if (url) {
        setBatteryImageUrl(url)
      }
    } catch (err: any) {
      setError(`Battery Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingBattery(false)
    }
  }

  async function handlePanelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPanelImageFile(file)
    setUploadingPanel(true)
    setError(null)

    try {
      const url = await uploadToR2Cloud(file, 'equipment/panels')
      if (url) {
        setPanelImageUrl(url)
      }
    } catch (err: any) {
      setError(`Panel Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingPanel(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Direct R2 Cloud uploads if files were picked but not yet processed
      let finalInvUrl = inverterImageUrl
      if (inverterImageFile && !finalInvUrl) {
        finalInvUrl = await uploadToR2Cloud(inverterImageFile, 'equipment/inverters') || ''
      }

      let finalBatUrl = batteryImageUrl
      if (batteryImageFile && !finalBatUrl) {
        finalBatUrl = await uploadToR2Cloud(batteryImageFile, 'equipment/batteries') || ''
      }

      let finalPanelUrl = panelImageUrl
      if (panelImageFile && !finalPanelUrl) {
        finalPanelUrl = await uploadToR2Cloud(panelImageFile, 'equipment/panels') || ''
      }

      const formData = new FormData()
      formData.append('customerId', customerId)
      formData.append('inverterBrand', inverterBrand)
      formData.append('inverterType', inverterType)
      formData.append('inverterPhase', inverterPhase)
      formData.append('inverterCategory', inverterCategory)
      formData.append('inverterSize', inverterSize)
      formData.append('inverterSerial', inverterSerial)
      formData.append('noOfInverters', String(noOfInverters))
      if (inverterWarrantyEnd) formData.append('inverterWarrantyEnd', inverterWarrantyEnd)

      formData.append('panelBrand', panelBrand)
      formData.append('panelType', panelType)
      formData.append('panelTechnology', panelTechnology)
      formData.append('panelWattage', String(panelWattage))
      formData.append('noOfPanels', String(noOfPanels))
      if (panelWarrantyEnd) formData.append('panelWarrantyEnd', panelWarrantyEnd)

      formData.append('batteryBrand', batteryBrand)
      formData.append('batteryType', batteryType)
      formData.append('batteryCategory', batteryCategory)
      formData.append('noOfBatteries', String(noOfBatteries))
      formData.append('batterySerial', batterySerial)
      if (batteryWarrantyEnd) formData.append('batteryWarrantyEnd', batteryWarrantyEnd)

      formData.append('disco', disco)
      formData.append('discoRefNo', discoRefNo)
      formData.append('meterType', meterType)

      if (finalInvUrl) {
        formData.append('inverterImages', JSON.stringify([finalInvUrl]))
      }
      if (finalBatUrl) {
        formData.append('batteryImages', JSON.stringify([finalBatUrl]))
      }
      if (finalPanelUrl) {
        formData.append('panelImages', JSON.stringify([finalPanelUrl]))
      }

      const res = await saveSolarSystem(formData)
      setLoading(false)

      if (res?.error) {
        setError(res.error)
      } else {
        setOpen(false)
        router.refresh()
      }
    } catch (err: any) {
      console.error('Save Solar Specs Error:', err)
      setError(err?.message || 'Failed to save solar system specifications.')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="bg-[#F58220] hover:bg-[#d96e14] text-white font-bold text-xs shadow-xs cursor-pointer" />}>
        {solarSystem ? 'Edit System Specs' : '+ Add Solar System Specs'}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-[var(--color-line)]">
          <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
            {solarSystem ? 'Edit Solar System Specifications' : 'Configure Solar System Specs'}
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Configure inverter hardware, solar panels array, battery energy storage, net metering specs, and upload R2 equipment photos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-3">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* 2-Column Horizontal Desktop Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Inverters & Solar Panels */}
            <div className="space-y-5">
              {/* 1. Inverter Section */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">1. Inverter Specifications & R2 Photo</h4>
                  {inverterImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded to R2
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Brand</Label>
                    <AutoSuggestInput
                      value={inverterBrand}
                      onChange={setInverterBrand}
                      options={INVERTER_BRANDS}
                      placeholder="Type or select brand..."
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Type</Label>
                    <select
                      value={inverterType}
                      onChange={(e) => setInverterType(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white focus:ring-2 focus:ring-[var(--color-amber)]"
                    >
                      <option value="">Select Type...</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="OnGrid">On-Grid</option>
                      <option value="OffGrid">Off-Grid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Size / Capacity</Label>
                    <AutoSuggestInput
                      value={inverterSize}
                      onChange={setInverterSize}
                      options={INVERTER_SIZES}
                      placeholder="Type or select size..."
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Phase</Label>
                    <select
                      value={inverterPhase}
                      onChange={(e) => setInverterPhase(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="">Select Phase...</option>
                      <option value="Single Phase">Single Phase</option>
                      <option value="Three Phase">Three Phase</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Category</Label>
                    <select
                      value={inverterCategory}
                      onChange={(e) => setInverterCategory(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="">Select Category...</option>
                      <option value="Low Voltage">Low Voltage</option>
                      <option value="High Voltage">High Voltage</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#002868]">No. of Inverters *</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNoOfInverters(prev => Math.max(1, prev - 1))}
                        className="h-9 w-9 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        placeholder="1"
                        value={noOfInverters}
                        onChange={(e) => setNoOfInverters(Math.max(1, Number(e.target.value) || 1))}
                        className="h-9 text-xs border-[var(--color-line)] bg-white font-mono text-center font-bold"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNoOfInverters(prev => Math.min(20, prev + 1))}
                        className="h-9 w-9 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Serial Number(s)</Label>
                    <Input
                      value={inverterSerial}
                      onChange={(e) => setInverterSerial(e.target.value)}
                      placeholder="e.g. INV-01, INV-02"
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-2 border-t border-slate-200/80">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Warranty End Date</Label>
                    <DateInput
                      value={inverterWarrantyEnd}
                      onChange={(e) => setInverterWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">📷 Upload Inverter Photo</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleInverterFileChange}
                        disabled={uploadingInverter}
                        className="h-9 text-xs border-amber-200 bg-white file:bg-amber-100 file:text-amber-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingInverter && (
                        <div className="absolute right-2 top-2 flex items-center gap-1 text-xs text-amber-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                  {inverterImageUrl && (
                    <div className="relative w-full h-36 rounded-lg border border-amber-200 overflow-hidden bg-slate-900 flex items-center justify-center group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={inverterImageUrl} alt="Inverter Photo" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3 text-white text-xs font-medium backdrop-blur-xs">
                        <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4 text-amber-400" /> Inverter Photo</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setInverterImageUrl('')}
                          className="h-7 text-xs px-2 shadow-xs cursor-pointer gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PV Panels Section */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-teal)]">2. PV Panels Array</h4>
                  {panelImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Panel Brand</Label>
                    <AutoSuggestInput
                      value={panelBrand}
                      onChange={setPanelBrand}
                      options={PANEL_BRANDS}
                      placeholder="Type or select brand..."
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Technology</Label>
                    <select
                      value={panelTechnology}
                      onChange={(e) => setPanelTechnology(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="">Select Technology...</option>
                      <option value="Topcon">Topcon</option>
                      <option value="Mono Perc">Mono Perc</option>
                      <option value="HJT">HJT</option>
                      <option value="ABC">ABC</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Wattage (W)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="585"
                      value={panelWattage}
                      onChange={(e) => setPanelWattage(Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Qty Panels</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="10"
                      value={noOfPanels}
                      onChange={(e) => setNoOfPanels(Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-2 border-t border-slate-200/80 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Panel Warranty End Date</Label>
                    <DateInput
                      value={panelWarrantyEnd}
                      onChange={(e) => setPanelWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">📷 Upload Panel Picture</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePanelFileChange}
                        disabled={uploadingPanel}
                        className="h-9 text-xs border-teal-200 bg-white file:bg-teal-100 file:text-teal-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingPanel && (
                        <div className="absolute right-2 top-2 flex items-center gap-1 text-xs text-teal-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {panelImageUrl && (
                  <div className="relative w-full h-36 rounded-lg border border-teal-200 overflow-hidden bg-slate-900 flex items-center justify-center group mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={panelImageUrl} alt="Panel Photo" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3 text-white text-xs font-medium backdrop-blur-xs">
                      <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4 text-teal-400" /> Panel Photo</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setPanelImageUrl('')}
                        className="h-7 text-xs px-2 shadow-xs cursor-pointer gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Battery & Grid Section */}
            <div className="space-y-5">
              {/* 3. Battery Storage Section */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-graphite)]">3. Battery Storage</h4>
                  {batteryImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Battery Brand</Label>
                    <AutoSuggestInput
                      value={batteryBrand}
                      onChange={setBatteryBrand}
                      options={BATTERY_BRANDS}
                      placeholder="Type or select brand..."
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Battery Chemistry</Label>
                    <select
                      value={batteryType}
                      onChange={(e) => setBatteryType(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="">Select Chemistry...</option>
                      <option value="Lithium">Lithium LiFePO4</option>
                      <option value="Tubular">Tubular</option>
                      <option value="Lead Acid">Lead Acid</option>
                      <option value="Dry">Dry Cell</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Category</Label>
                    <select
                      value={batteryCategory}
                      onChange={(e) => setBatteryCategory(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="">Select Category...</option>
                      <option value="Low Voltage">Low Voltage (48V)</option>
                      <option value="High Voltage">High Voltage</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#002868]">No. of Batteries</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNoOfBatteries(prev => Math.max(0, prev - 1))}
                        className="h-9 w-9 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        placeholder="0"
                        value={noOfBatteries}
                        onChange={(e) => setNoOfBatteries(Math.max(0, Number(e.target.value) || 0))}
                        className="h-9 text-xs border-[var(--color-line)] bg-white font-mono text-center font-bold"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNoOfBatteries(prev => Math.min(20, prev + 1))}
                        className="h-9 w-9 text-base font-bold bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Battery Serial Number(s)</Label>
                    <Input
                      value={batterySerial}
                      onChange={(e) => setBatterySerial(e.target.value)}
                      placeholder="e.g. BAT-01, BAT-02"
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-2 border-t border-slate-200/80">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Battery Warranty End Date</Label>
                    <DateInput
                      value={batteryWarrantyEnd}
                      onChange={(e) => setBatteryWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">📷 Upload Battery Photo</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleBatteryFileChange}
                        disabled={uploadingBattery}
                        className="h-9 text-xs border-slate-300 bg-white file:bg-slate-100 file:text-slate-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingBattery && (
                        <div className="absolute right-2 top-2 flex items-center gap-1 text-xs text-slate-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                  {batteryImageUrl && (
                    <div className="relative w-full h-36 rounded-lg border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={batteryImageUrl} alt="Battery Photo" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3 text-white text-xs font-medium backdrop-blur-xs">
                        <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4 text-sky-400" /> Battery Photo</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setBatteryImageUrl('')}
                          className="h-7 text-xs px-2 shadow-xs cursor-pointer gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Net Metering & Utility Section */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-graphite)]">4. DISCO Utility & Net Metering</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">DISCO Utility Company</Label>
                    <AutoSuggestInput
                      value={disco}
                      onChange={setDisco}
                      options={DISCO_LIST}
                      placeholder="Type or select DISCO..."
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">{disco || 'DISCO'} Ref / Consumer ID #</Label>
                    <Input
                      value={discoRefNo}
                      onChange={(e) => setDiscoRefNo(formatDiscoRefNo(e.target.value))}
                      placeholder="e.g. 04-11515-0469701 U"
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono font-bold tracking-wider"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Meter Type</Label>
                    <select
                      value={meterType}
                      onChange={(e) => setMeterType(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="">Select Meter Type...</option>
                      <option value="Green Meter">Green Meter (Bi-Directional)</option>
                      <option value="Non Green">Standard Meter</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 flex justify-end gap-2 border-t border-[var(--color-line)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || uploadingInverter || uploadingBattery || uploadingPanel}
              className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingInverter || uploadingBattery || uploadingPanel}
              className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Solar Specs...
                </>
              ) : (
                'Save Solar Specs & R2 Photos'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
