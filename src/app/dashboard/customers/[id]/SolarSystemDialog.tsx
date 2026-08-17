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
  const [inverterBrand, setInverterBrand] = React.useState(solarSystem?.inverterBrand || 'Huawei')
  const [inverterType, setInverterType] = React.useState(solarSystem?.inverterType || 'Hybrid')
  const [inverterPhase, setInverterPhase] = React.useState(solarSystem?.inverterPhase || 'Three Phase')
  const [inverterSize, setInverterSize] = React.useState(solarSystem?.inverterSize || '10 kW')
  const [inverterSerial, setInverterSerial] = React.useState(solarSystem?.inverterSerial || '')

  // Panels
  const [panelBrand, setPanelBrand] = React.useState(solarSystem?.panelBrand || 'Longi')
  const [panelType, setPanelType] = React.useState(solarSystem?.panelType || 'Bifacial')
  const [panelWattage, setPanelWattage] = React.useState(solarSystem?.panelWattage || 585)
  const [noOfPanels, setNoOfPanels] = React.useState(solarSystem?.noOfPanels || 18)

  // Battery & Grid
  const [batteryBrand, setBatteryBrand] = React.useState(solarSystem?.batteryBrand || 'Narada')
  const [batteryType, setBatteryType] = React.useState(solarSystem?.batteryType || 'Lithium')
  const [noOfBatteries, setNoOfBatteries] = React.useState(solarSystem?.noOfBatteries || 1)
  const [disco, setDisco] = React.useState(solarSystem?.disco || 'LESCO')
  const [meterType, setMeterType] = React.useState(solarSystem?.meterType || 'Green Meter')

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
    formData.append('panelBrand', panelBrand)
    formData.append('panelType', panelType)
    formData.append('panelWattage', String(panelWattage))
    formData.append('noOfPanels', String(noOfPanels))
    formData.append('batteryBrand', batteryBrand)
    formData.append('batteryType', batteryType)
    formData.append('noOfBatteries', String(noOfBatteries))
    formData.append('disco', disco)
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
      <DialogContent className="sm:max-w-[620px] bg-white border border-[var(--color-line)] shadow-premium rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
            {solarSystem ? 'Edit Solar System Specifications' : 'Configure Solar System Specs'}
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-slate-custom)]">
            Setup inverter, photovoltaic panels, battery storage, and net metering hardware.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Inverter Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">Inverter Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Inverter Brand</Label>
                <select
                  value={inverterBrand}
                  onChange={(e) => setInverterBrand(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white focus:ring-2 focus:ring-[var(--color-amber)]"
                >
                  <option value="Huawei">Huawei</option>
                  <option value="Solis">Solis</option>
                  <option value="Sungrow">Sungrow</option>
                  <option value="Fronius">Fronius</option>
                  <option value="Growatt">Growatt</option>
                  <option value="GoodWe">GoodWe</option>
                  <option value="Inverex">Inverex</option>
                  <option value="Knox">Knox</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Inverter Type</Label>
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
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Capacity / Size</Label>
                <Input
                  value={inverterSize}
                  onChange={(e) => setInverterSize(e.target.value)}
                  placeholder="e.g. 10 kW"
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Serial Number</Label>
                <Input
                  value={inverterSerial}
                  onChange={(e) => setInverterSerial(e.target.value)}
                  placeholder="e.g. SN-INV-992384"
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
            </div>
          </div>

          {/* PV Panels Section */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--color-line)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-teal)]">PV Panels Array</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Panel Brand</Label>
                <select
                  value={panelBrand}
                  onChange={(e) => setPanelBrand(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                >
                  <option value="Longi">Longi</option>
                  <option value="Jinko">Jinko</option>
                  <option value="Canadian Solar">Canadian Solar</option>
                  <option value="Trina">Trina Solar</option>
                  <option value="JA Solar">JA Solar</option>
                </select>
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
                  value={panelWattage}
                  onChange={(e) => setPanelWattage(Number(e.target.value))}
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Qty Panels</Label>
                <Input
                  type="number"
                  value={noOfPanels}
                  onChange={(e) => setNoOfPanels(Number(e.target.value))}
                  className="h-9 text-xs border-[var(--color-line)]"
                />
              </div>
            </div>
          </div>

          {/* Battery & Grid Section */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--color-line)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-graphite)]">Battery Storage & DISCO Net Metering</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--color-ink)]">Battery Brand</Label>
                <select
                  value={batteryBrand}
                  onChange={(e) => setBatteryBrand(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] bg-white"
                >
                  <option value="Narada">Narada</option>
                  <option value="Pylontech">Pylontech</option>
                  <option value="BYD">BYD</option>
                  <option value="Dyness">Dyness</option>
                  <option value="None">None</option>
                </select>
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
                <Label className="text-xs font-semibold text-[var(--color-ink)]">DISCO</Label>
                <Input
                  value={disco}
                  onChange={(e) => setDisco(e.target.value)}
                  placeholder="LESCO / IESCO / K-Electric"
                  className="h-9 text-xs border-[var(--color-line)]"
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
