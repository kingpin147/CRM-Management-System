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
import { submitInstallerAudit } from './actions'
import { formatDiscoRefNo } from '@/lib/utils'
import { SYSTEM_SIZES, INVERTER_SIZES, INVERTER_BRANDS, PANEL_BRANDS, BATTERY_BRANDS } from '@/lib/solar-constants'
import { Wrench, CheckCircle2, Loader2, Save, Sun, Battery, ShieldCheck, Zap } from 'lucide-react'

const DISCO_LIST = ['LESCO', 'IESCO', 'K-Electric', 'FESCO', 'MEPCO', 'PESCO', 'GEPCO', 'QESCO', 'HESCO', 'SEPCO', 'TESCO', 'Other']
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

  // Part 2: Solar Specifications
  const [meterType, setMeterType] = React.useState(solar.meterType || 'Green Meter')
  const [zeroExportDevice, setZeroExportDevice] = React.useState(solar.zeroExportDevice ? 'Installed' : 'Not Installed')
  const [disco, setDisco] = React.useState(solar.disco || customer.city ? 'LESCO' : 'LESCO')
  const [discoRefNo, setDiscoRefNo] = React.useState(solar.discoRefNo || '')

  const [inverterBrand, setInverterBrand] = React.useState(solar.inverterBrand || '')
  const [inverterType, setInverterType] = React.useState(solar.inverterType || 'Hybrid')
  const [inverterPhase, setInverterPhase] = React.useState(solar.inverterPhase || 'Three Phase')
  const [inverterSize, setInverterSize] = React.useState(solar.inverterSize || plan.systemSizeKw || '10 kW')
  const [noOfInverters, setNoOfInverters] = React.useState<number>(solar.noOfInverters || 1)
  const [inverterSerial, setInverterSerial] = React.useState(solar.inverterSerial || '')
  const [inverterWarrantyEnd, setInverterWarrantyEnd] = React.useState(
    solar.inverterWarrantyEnd ? new Date(solar.inverterWarrantyEnd).toISOString().split('T')[0] : ''
  )

  const [panelBrand, setPanelBrand] = React.useState(solar.panelBrand || '')
  const [panelType, setPanelType] = React.useState(solar.panelType || 'Tier-1 Monofacial')
  const [panelTechnology, setPanelTechnology] = React.useState(solar.panelTechnology || 'Monocrystalline')
  const [panelWattage, setPanelWattage] = React.useState<number>(solar.panelWattage || 585)
  const [noOfPanels, setNoOfPanels] = React.useState<number>(solar.noOfPanels || 16)
  const [panelWarrantyEnd, setPanelWarrantyEnd] = React.useState(
    solar.panelWarrantyEnd ? new Date(solar.panelWarrantyEnd).toISOString().split('T')[0] : ''
  )

  const [batteryBrand, setBatteryBrand] = React.useState(solar.batteryBrand || '')
  const [batteryType, setBatteryType] = React.useState(solar.batteryType || 'Lithium-ion')
  const [batteryCategory, setBatteryCategory] = React.useState(solar.batteryCategory || 'Low Voltage (LV)')
  const [noOfBatteries, setNoOfBatteries] = React.useState<number>(solar.noOfBatteries || 0)
  const [batterySerial, setBatterySerial] = React.useState(solar.batterySerial || '')
  const [batteryWarrantyEnd, setBatteryWarrantyEnd] = React.useState(
    solar.batteryWarrantyEnd ? new Date(solar.batteryWarrantyEnd).toISOString().split('T')[0] : ''
  )

  // Part 3: 7-Point Audit Checklist
  const [inverterStatus, setInverterStatus] = React.useState(solar.inverterStatus || 'Excellent')
  const [panelStatus, setPanelStatus] = React.useState(solar.panelStatus || 'Excellent')
  const [batteryStatus, setBatteryStatus] = React.useState(solar.batteryStatus || 'Excellent')
  const [structureStatus, setStructureStatus] = React.useState(solar.structureStatus || 'Excellent')
  const [cableStatus, setCableStatus] = React.useState(solar.cableStatus || 'Excellent')
  const [earthingStatus, setEarthingStatus] = React.useState(solar.earthingStatus || 'Excellent')
  const [breakerStatus, setBreakerStatus] = React.useState(solar.breakerStatus || 'Excellent')

  const [earthingAcOhms, setEarthingAcOhms] = React.useState<string>(solar.earthingAcOhms != null ? String(solar.earthingAcOhms) : '0.6')
  const [earthingDcOhms, setEarthingDcOhms] = React.useState<string>(solar.earthingDcOhms != null ? String(solar.earthingDcOhms) : '0.8')
  const [lightningProtection, setLightningProtection] = React.useState(solar.lightningProtection !== false ? 'Installed' : 'Not Installed')

  React.useEffect(() => {
    if (customer?.solarSystem) {
      const s = customer.solarSystem
      if (s.disco) setDisco(s.disco)
      if (s.discoRefNo) setDiscoRefNo(s.discoRefNo)
      if (s.inverterBrand) setInverterBrand(s.inverterBrand)
      if (s.inverterSerial) setInverterSerial(s.inverterSerial)
      if (s.panelBrand) setPanelBrand(s.panelBrand)
      if (s.batteryBrand) setBatteryBrand(s.batteryBrand)
    }
  }, [customer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customer.id)
      formData.append('meterType', meterType)
      formData.append('zeroExportDevice', zeroExportDevice)
      formData.append('disco', disco)
      formData.append('discoRefNo', discoRefNo)

      formData.append('inverterBrand', inverterBrand)
      formData.append('inverterType', inverterType)
      formData.append('inverterPhase', inverterPhase)
      formData.append('inverterSize', inverterSize)
      formData.append('noOfInverters', String(noOfInverters))
      formData.append('inverterSerial', inverterSerial)
      formData.append('inverterWarrantyEnd', inverterWarrantyEnd)

      formData.append('panelBrand', panelBrand)
      formData.append('panelType', panelType)
      formData.append('panelTechnology', panelTechnology)
      formData.append('panelWattage', String(panelWattage))
      formData.append('noOfPanels', String(noOfPanels))
      formData.append('panelWarrantyEnd', panelWarrantyEnd)

      formData.append('batteryBrand', batteryBrand)
      formData.append('batteryType', batteryType)
      formData.append('batteryCategory', batteryCategory)
      formData.append('noOfBatteries', String(noOfBatteries))
      formData.append('batterySerial', batterySerial)
      formData.append('batteryWarrantyEnd', batteryWarrantyEnd)

      formData.append('inverterStatus', inverterStatus)
      formData.append('panelStatus', panelStatus)
      formData.append('batteryStatus', batteryStatus)
      formData.append('structureStatus', structureStatus)
      formData.append('cableStatus', cableStatus)
      formData.append('earthingStatus', earthingStatus)
      formData.append('breakerStatus', breakerStatus)

      formData.append('earthingAcOhms', earthingAcOhms)
      formData.append('earthingDcOhms', earthingDcOhms)
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-line pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-display text-[#002868] flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600" />
                Technical Specs & System Audit Entry
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Customer: <strong className="text-slate-800">{customer.fullName}</strong> | ID: <strong className="font-mono text-amber-700">{customer.customerCode?.replace(/\D/g, '') || customer.id}</strong> | CRF: <strong className="font-mono">{customer.crfNumber || '—'}</strong>
              </DialogDescription>
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
              {/* Meter & Utility Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868]">1. DISCO Utility & Meter Connection</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">DISCO Utility Company</Label>
                    <AutoSuggestInput
                      value={disco}
                      onChange={setDisco}
                      options={DISCO_LIST}
                      placeholder="e.g. LESCO, K-Electric"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Consumer Reference #</Label>
                    <Input
                      value={discoRefNo}
                      onChange={(e) => setDiscoRefNo(formatDiscoRefNo(e.target.value))}
                      placeholder="e.g. 04-11515-0469701 U"
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
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
                </div>
              </div>

              {/* Inverter Specs */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868]">2. Inverter Unit Specifications</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Brand *</Label>
                    <AutoSuggestInput
                      value={inverterBrand}
                      onChange={setInverterBrand}
                      options={INVERTER_BRANDS}
                      placeholder="e.g. Solis, Growatt, Huawei"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Capacity / Size</Label>
                    <AutoSuggestInput
                      value={inverterSize}
                      onChange={setInverterSize}
                      options={INVERTER_SIZES}
                      placeholder="e.g. 10 kW"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Serial # *</Label>
                    <Input
                      value={inverterSerial}
                      onChange={(e) => setInverterSerial(e.target.value)}
                      placeholder="Serial Number"
                      className="h-9 text-xs font-mono bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Solar Panels Specs */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868]">3. Solar PV Panels Specifications</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                    <Label className="text-xs font-semibold">Panel Wattage (W)</Label>
                    <Input
                      type="number"
                      value={panelWattage}
                      onChange={(e) => setPanelWattage(Number(e.target.value))}
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">No. of Panels</Label>
                    <Input
                      type="number"
                      value={noOfPanels}
                      onChange={(e) => setNoOfPanels(Number(e.target.value))}
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Total PV Capacity</Label>
                    <div className="h-9 flex items-center px-3 bg-amber-50 rounded-md border border-amber-200 font-bold font-mono text-xs text-amber-900">
                      {((panelWattage * noOfPanels) / 1000).toFixed(2)} kW
                    </div>
                  </div>
                </div>
              </div>

              {/* Battery Storage Specs */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868]">4. Battery Energy Storage System (BESS)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Brand (if applicable)</Label>
                    <AutoSuggestInput
                      value={batteryBrand}
                      onChange={setBatteryBrand}
                      options={BATTERY_BRANDS}
                      placeholder="e.g. Narada, Pylontech"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">No. of Batteries</Label>
                    <Input
                      type="number"
                      value={noOfBatteries}
                      onChange={(e) => setNoOfBatteries(Number(e.target.value))}
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Serial #</Label>
                    <Input
                      value={batterySerial}
                      onChange={(e) => setBatterySerial(e.target.value)}
                      placeholder="Battery Serial (Optional)"
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868]">7-Point System Technical Inspection Checklist</p>
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
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868]">Earthing Resistance & Safety Parameters</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">AC Earthing (Ω)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={earthingAcOhms}
                      onChange={(e) => setEarthingAcOhms(e.target.value)}
                      placeholder="e.g. 0.6"
                      className="h-9 text-xs font-mono bg-white"
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
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Lightning Protection</Label>
                    <Select value={lightningProtection} onValueChange={(val) => setLightningProtection(val || 'Installed')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Installed">Installed & Tested</SelectItem>
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting to O&M Manager...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Submit Audit to O&M Manager
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
