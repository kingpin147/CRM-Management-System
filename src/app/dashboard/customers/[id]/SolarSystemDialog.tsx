'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  // Inverter
  const [inverterBrand, setInverterBrand] = React.useState(solarSystem?.inverterBrand || '')
  const [inverterType, setInverterType] = React.useState(solarSystem?.inverterType || '')
  const [inverterPhase, setInverterPhase] = React.useState(solarSystem?.inverterPhase || '')
  const [inverterSize, setInverterSize] = React.useState(solarSystem?.inverterSize || '')
  const [inverterSerial, setInverterSerial] = React.useState(solarSystem?.inverterSerial || '')
  const [noOfInverters, setNoOfInverters] = React.useState<number>(solarSystem?.noOfInverters ?? 0)
  const [inverterWarrantyEnd, setInverterWarrantyEnd] = React.useState(
    solarSystem?.inverterWarrantyEnd ? new Date(solarSystem.inverterWarrantyEnd).toISOString().split('T')[0] : ''
  )

  // Panels
  const [panelBrand, setPanelBrand] = React.useState(solarSystem?.panelBrand || '')
  const [panelType, setPanelType] = React.useState(solarSystem?.panelType || '')
  const [panelWattage, setPanelWattage] = React.useState<number>(solarSystem?.panelWattage ?? 0)
  const [noOfPanels, setNoOfPanels] = React.useState<number>(solarSystem?.noOfPanels ?? 0)
  const [panelWarrantyEnd, setPanelWarrantyEnd] = React.useState(
    solarSystem?.panelWarrantyEnd ? new Date(solarSystem.panelWarrantyEnd).toISOString().split('T')[0] : ''
  )

  // Battery & Grid
  const [batteryBrand, setBatteryBrand] = React.useState(solarSystem?.batteryBrand || '')
  const [batteryType, setBatteryType] = React.useState(solarSystem?.batteryType || '')
  const [noOfBatteries, setNoOfBatteries] = React.useState<number>(solarSystem?.noOfBatteries ?? 0)
  const [batterySerial, setBatterySerial] = React.useState(solarSystem?.batterySerial || '')
  const [batteryWarrantyEnd, setBatteryWarrantyEnd] = React.useState(
    solarSystem?.batteryWarrantyEnd ? new Date(solarSystem.batteryWarrantyEnd).toISOString().split('T')[0] : ''
  )
  const [disco, setDisco] = React.useState(solarSystem?.disco || '')
  const [discoRefNo, setDiscoRefNo] = React.useState(solarSystem?.discoRefNo || '')
  const [meterType, setMeterType] = React.useState(solarSystem?.meterType || '')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('customerId', customerId)
    formData.append('inverterBrand', inverterBrand)
    formData.append('inverterType', inverterType)
    formData.append('inverterPhase', inverterPhase)
    formData.append('inverterSize', inverterSize)
    formData.append('inverterSerial', inverterSerial)
    formData.append('noOfInverters', String(noOfInverters))
    if (inverterWarrantyEnd) formData.append('inverterWarrantyEnd', inverterWarrantyEnd)

    formData.append('panelBrand', panelBrand)
    formData.append('panelType', panelType)
    formData.append('panelWattage', String(panelWattage))
    formData.append('noOfPanels', String(noOfPanels))
    if (panelWarrantyEnd) formData.append('panelWarrantyEnd', panelWarrantyEnd)

    formData.append('batteryBrand', batteryBrand)
    formData.append('batteryType', batteryType)
    formData.append('noOfBatteries', String(noOfBatteries))
    formData.append('batterySerial', batterySerial)
    if (batteryWarrantyEnd) formData.append('batteryWarrantyEnd', batteryWarrantyEnd)

    formData.append('disco', disco)
    formData.append('discoRefNo', discoRefNo)
    formData.append('meterType', meterType)

    const res = await saveSolarSystem(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="bg-[#F58220] hover:bg-[#d96e14] text-white font-bold text-xs shadow-xs" />}>
        {solarSystem ? 'Edit System Specs' : '+ Add Solar System Specs'}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-[var(--color-line)]">
          <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
            {solarSystem ? 'Edit Solar System Specifications' : 'Configure Solar System Specs'}
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Setup inverter, photovoltaic panels, battery storage, and net metering hardware.
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
              {/* Inverter Section */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">1. Inverter Specifications</h4>
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
                      <option value="Hybrid">Hybrid</option>
                      <option value="OnGrid">On-Grid</option>
                      <option value="OffGrid">Off-Grid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Size</Label>
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
                      <option value="Single Phase">Single Phase</option>
                      <option value="Three Phase">Three Phase</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">No. of Inverters</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      placeholder="0"
                      value={noOfInverters}
                      onChange={(e) => setNoOfInverters(Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Serial Number(s)</Label>
                    <Input
                      value={inverterSerial}
                      onChange={(e) => setInverterSerial(e.target.value)}
                      placeholder="e.g. INV-01, INV-02"
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-semibold text-amber-900">Inverter Warranty End Date</Label>
                  <Input
                    type="date"
                    value={inverterWarrantyEnd}
                    onChange={(e) => setInverterWarrantyEnd(e.target.value)}
                    className="h-9 text-xs border-amber-300 bg-white"
                  />
                </div>
              </div>

              {/* PV Panels Section */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-teal)]">2. PV Panels Array</h4>
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
                      value={panelType}
                      onChange={(e) => setPanelType(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="Bifacial">Bifacial</option>
                      <option value="Monofacial">Monofacial</option>
                      <option value="Topcon">Topcon</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Wattage (W)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
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
                      placeholder="0"
                      value={noOfPanels}
                      onChange={(e) => setNoOfPanels(Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-semibold text-amber-900">Panel Warranty End Date</Label>
                  <Input
                    type="date"
                    value={panelWarrantyEnd}
                    onChange={(e) => setPanelWarrantyEnd(e.target.value)}
                    className="h-9 text-xs border-amber-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Battery & Grid Section */}
            <div className="space-y-5">
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-graphite)]">3. Battery Storage & Net Metering</h4>
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
                      <option value="Lithium">Lithium LiFePO4</option>
                      <option value="Tubular">Tubular</option>
                      <option value="Lead Acid">Lead Acid</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">No. of Batteries</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      placeholder="0"
                      value={noOfBatteries}
                      onChange={(e) => setNoOfBatteries(Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Battery Serial(s)</Label>
                    <Input
                      value={batterySerial}
                      onChange={(e) => setBatterySerial(e.target.value)}
                      placeholder="e.g. BAT-01, BAT-02"
                      className="h-9 text-xs border-[var(--color-line)] bg-white font-mono"
                    />
                  </div>
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
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[var(--color-ink)]">Meter Type</Label>
                    <select
                      value={meterType}
                      onChange={(e) => setMeterType(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                    >
                      <option value="Green Meter">Green Meter (Bi-Directional)</option>
                      <option value="Non Green">Standard Meter</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-semibold text-amber-900">Battery Warranty End Date</Label>
                  <Input
                    type="date"
                    value={batteryWarrantyEnd}
                    onChange={(e) => setBatteryWarrantyEnd(e.target.value)}
                    className="h-9 text-xs border-amber-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 flex justify-end gap-2 border-t border-[var(--color-line)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs shadow-xs">
              {loading ? 'Saving...' : 'Save Solar Specs'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
