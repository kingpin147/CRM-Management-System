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
import { submitInstallerAudit, saveSolarSpecsOnly } from './actions'
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
  ArrowRight,
  ArrowLeft,
  Save,
} from 'lucide-react'
import { CameraPhotoCapture } from '@/components/ui/CameraPhotoCapture'

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

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = React.useState<'specs' | 'audit'>('specs')
  const lastTabChangeTime = React.useRef<number>(0)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSavingDraft, setIsSavingDraft] = React.useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // 1. DISCO Utility & Meter Connection
  const [disco, setDisco] = React.useState(solar.disco || '')
  const [discoRefNo, setDiscoRefNo] = React.useState(solar.discoRefNo || '')
  const [meterType, setMeterType] = React.useState(solar.meterType || 'Green Meter')
  const [meterPhase, setMeterPhase] = React.useState(solar.meterPhase || 'Three Phase')
  const [zeroExportDevice, setZeroExportDevice] = React.useState(solar.zeroExportDevice ? 'Installed' : 'Not Installed')

  // 2. Inverter Unit Specifications
  const initialInvCount = Math.max(1, Number(solar.noOfInverters) || 1)
  const [inverterBrand, setInverterBrand] = React.useState(solar.inverterBrand || '')
  const [inverterSize, setInverterSize] = React.useState(solar.inverterSize || plan.systemSizeKw || '')
  const [inverterType, setInverterType] = React.useState(solar.inverterType || 'Hybrid')
  const [inverterPhase, setInverterPhase] = React.useState(solar.inverterPhase || 'Three Phase')
  const [inverterCategory, setInverterCategory] = React.useState(solar.inverterCategory || 'Low Voltage')
  const [noOfInverters, setNoOfInverters] = React.useState<number>(initialInvCount)
  const [inverterSerials, setInverterSerials] = React.useState<string[]>(() => {
    const list = solar.inverterSerials?.length ? [...solar.inverterSerials] : [solar.inverterSerial || '']
    while (list.length < initialInvCount) list.push('')
    return list
  })
  const [inverterWarrantyEnds, setInverterWarrantyEnds] = React.useState<string[]>(() => {
    const list = solar.inverterWarrantyEnds?.length
      ? solar.inverterWarrantyEnds.map((d: any) => d ? new Date(d).toISOString().split('T')[0] : '')
      : [solar.inverterWarrantyEnd ? new Date(solar.inverterWarrantyEnd).toISOString().split('T')[0] : '']
    while (list.length < initialInvCount) list.push('')
    return list
  })
  const [inverterImageUrls, setInverterImageUrls] = React.useState<string[]>(solar.inverterImages?.length ? solar.inverterImages : [])
  const [uploadingInverterIndex, setUploadingInverterIndex] = React.useState<number | null>(null)
  const [inverterUsername, setInverterUsername] = React.useState(solar.inverterUsername || '')
  const [inverterPassword, setInverterPassword] = React.useState(solar.inverterPassword || '')
  const [inverterInvoiceUrl, setInverterInvoiceUrl] = React.useState(solar.inverterInvoiceUrl || '')
  const [uploadingInverterInvoice, setUploadingInverterInvoice] = React.useState(false)

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
  const initialBatCount = Math.max(0, Number(solar.noOfBatteries) || (solar.batteryBrand && solar.batteryBrand !== 'None' ? 1 : 0))
  const [batteryBrand, setBatteryBrand] = React.useState(solar.batteryBrand || '')
  const [batteryType, setBatteryType] = React.useState(solar.batteryType || 'Lithium-ion')
  const [batteryCategory, setBatteryCategory] = React.useState(solar.batteryCategory || 'Low Voltage (LV)')
  const [noOfBatteries, setNoOfBatteries] = React.useState<number>(initialBatCount)
  const [batterySerials, setBatterySerials] = React.useState<string[]>(() => {
    const list = solar.batterySerials?.length ? [...solar.batterySerials] : [solar.batterySerial || '']
    while (list.length < Math.max(1, initialBatCount)) list.push('')
    return list
  })
  const [batteryWarrantyEnds, setBatteryWarrantyEnds] = React.useState<string[]>(() => {
    const list = solar.batteryWarrantyEnds?.length
      ? solar.batteryWarrantyEnds.map((d: any) => d ? new Date(d).toISOString().split('T')[0] : '')
      : [solar.batteryWarrantyEnd ? new Date(solar.batteryWarrantyEnd).toISOString().split('T')[0] : '']
    while (list.length < Math.max(1, initialBatCount)) list.push('')
    return list
  })
  const [batteryImageUrls, setBatteryImageUrls] = React.useState<string[]>(solar.batteryImages?.length ? solar.batteryImages : [])
  const [uploadingBatteryIndex, setUploadingBatteryIndex] = React.useState<number | null>(null)

  // Helper function to dynamically scale inverter units
  const updateNoOfInverters = (count: number) => {
    const validCount = Math.max(1, count || 1)
    setNoOfInverters(validCount)
    setInverterSerials(prev => {
      const next = [...prev]
      while (next.length < validCount) next.push('')
      return next
    })
    setInverterWarrantyEnds(prev => {
      const next = [...prev]
      while (next.length < validCount) next.push('')
      return next
    })
  }

  // Helper function to dynamically scale battery units
  const updateNoOfBatteries = (count: number) => {
    const validCount = Math.max(0, count || 0)
    setNoOfBatteries(validCount)
    setBatterySerials(prev => {
      const next = [...prev]
      while (next.length < Math.max(1, validCount)) next.push('')
      return next
    })
    setBatteryWarrantyEnds(prev => {
      const next = [...prev]
      while (next.length < Math.max(1, validCount)) next.push('')
      return next
    })
  }

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

  // Re-sync all state whenever customer changes, merging with any local draft
  React.useEffect(() => {
    if (customer) {
      const s = customer.solarSystem || {}
      const p = customer.packagePlan || {}

      let draft: any = null
      try {
        const rawDraft = typeof window !== 'undefined' ? localStorage.getItem(`installer_audit_draft_${customer.id}`) : null
        if (rawDraft) draft = JSON.parse(rawDraft)
      } catch (e) {
        console.error('Failed to parse local audit draft', e)
      }

      // Section 1
      setDisco(s.disco || draft?.disco || '')
      setDiscoRefNo(s.discoRefNo || draft?.discoRefNo || '')
      setMeterType(s.meterType || draft?.meterType || 'Green Meter')
      setMeterPhase(s.meterPhase || draft?.meterPhase || 'Three Phase')
      setZeroExportDevice(s.zeroExportDevice != null ? (s.zeroExportDevice ? 'Installed' : 'Not Installed') : (draft?.zeroExportDevice || 'Not Installed'))

      // Section 2
      setInverterBrand(s.inverterBrand || draft?.inverterBrand || '')
      setInverterSize(s.inverterSize || draft?.inverterSize || p.systemSizeKw || '')
      setInverterType(s.inverterType || draft?.inverterType || 'Hybrid')
      setInverterPhase(s.inverterPhase || draft?.inverterPhase || 'Three Phase')
      setInverterCategory(s.inverterCategory || draft?.inverterCategory || 'Low Voltage')
      const invCnt = Math.max(1, Number(s.noOfInverters) || Number(draft?.noOfInverters) || 1)
      setNoOfInverters(invCnt)
      const invSers = s.inverterSerials?.length ? [...s.inverterSerials] : (draft?.inverterSerials?.length ? [...draft.inverterSerials] : [s.inverterSerial || ''])
      while (invSers.length < invCnt) invSers.push('')
      setInverterSerials(invSers)

      const invWarrs = s.inverterWarrantyEnds?.length
        ? s.inverterWarrantyEnds.map((d: any) => d ? new Date(d).toISOString().split('T')[0] : '')
        : (draft?.inverterWarrantyEnds?.length ? [...draft.inverterWarrantyEnds] : [s.inverterWarrantyEnd ? new Date(s.inverterWarrantyEnd).toISOString().split('T')[0] : ''])
      while (invWarrs.length < invCnt) invWarrs.push('')
      setInverterWarrantyEnds(invWarrs)

      setInverterImageUrls(s.inverterImages?.length ? s.inverterImages : (draft?.inverterImageUrls || []))
      setInverterUsername(s.inverterUsername || draft?.inverterUsername || '')
      setInverterPassword(s.inverterPassword || draft?.inverterPassword || '')
      setInverterInvoiceUrl(s.inverterInvoiceUrl || draft?.inverterInvoiceUrl || '')

      // Section 3
      setPanelBrand(s.panelBrand || draft?.panelBrand || '')
      setPanelTechnology(s.panelTechnology || draft?.panelTechnology || 'Topcon')
      setPanelType(s.panelType || draft?.panelType || 'Tier-1 Monofacial')
      setPanelWattage(s.panelWattage != null ? Number(s.panelWattage) : (draft?.panelWattage != null ? Number(draft.panelWattage) : 0))
      setNoOfPanels(s.noOfPanels != null ? Number(s.noOfPanels) : (draft?.noOfPanels != null ? Number(draft.noOfPanels) : 0))
      setPanelWarrantyEnd(s.panelWarrantyEnd ? new Date(s.panelWarrantyEnd).toISOString().split('T')[0] : (draft?.panelWarrantyEnd || ''))
      setPanelImageUrl(s.panelImages?.[0] || draft?.panelImageUrl || '')

      // Section 4
      setBatteryBrand(s.batteryBrand || draft?.batteryBrand || '')
      setBatteryType(s.batteryType || draft?.batteryType || 'Lithium-ion')
      setBatteryCategory(s.batteryCategory || draft?.batteryCategory || 'Low Voltage (LV)')
      const batCnt = Math.max(0, Number(s.noOfBatteries) || Number(draft?.noOfBatteries) || (s.batteryBrand && s.batteryBrand !== 'None' ? 1 : 0))
      setNoOfBatteries(batCnt)
      const batSers = s.batterySerials?.length ? [...s.batterySerials] : (draft?.batterySerials?.length ? [...draft.batterySerials] : [s.batterySerial || ''])
      while (batSers.length < Math.max(1, batCnt)) batSers.push('')
      setBatterySerials(batSers)

      const batWarrs = s.batteryWarrantyEnds?.length
        ? s.batteryWarrantyEnds.map((d: any) => d ? new Date(d).toISOString().split('T')[0] : '')
        : (draft?.batteryWarrantyEnds?.length ? [...draft.batteryWarrantyEnds] : [s.batteryWarrantyEnd ? new Date(s.batteryWarrantyEnd).toISOString().split('T')[0] : ''])
      while (batWarrs.length < Math.max(1, batCnt)) batWarrs.push('')
      setBatteryWarrantyEnds(batWarrs)

      setBatteryImageUrls(s.batteryImages?.length ? s.batteryImages : (draft?.batteryImageUrls || []))

      // Section 5
      setStructureType(s.structureType || draft?.structureType || 'Elevated')
      setStructureMaterial(s.structureMaterial || draft?.structureMaterial || 'Hot Dip Galvanized')
      setIngressProtection(s.ingressProtection || draft?.ingressProtection || 'IP65')
      setBreakerName(s.breakerName || draft?.breakerName || 'Standard DC/AC Breakers')
      setEarthing(s.earthing || draft?.earthing || 'Both')
      setSystemInstallationDate(s.systemInstallationDate ? new Date(s.systemInstallationDate).toISOString().split('T')[0] : (draft?.systemInstallationDate || ''))

      // Part 3
      setInverterStatus(s.inverterStatus || draft?.inverterStatus || 'Good')
      setPanelStatus(s.panelStatus || draft?.panelStatus || 'Good')
      setBatteryStatus(s.batteryStatus || draft?.batteryStatus || 'Good')
      setStructureStatus(s.structureStatus || draft?.structureStatus || 'Good')
      setCableStatus(s.cableStatus || draft?.cableStatus || 'Good')
      setEarthingStatus(s.earthingStatus || draft?.earthingStatus || 'Good')
      setBreakerStatus(s.breakerStatus || draft?.breakerStatus || 'Good')

      setEarthingAcOhms(s.earthingAcOhms != null ? String(s.earthingAcOhms) : (draft?.earthingAcOhms || '0.6'))
      setEarthingDcOhms(s.earthingDcOhms != null ? String(s.earthingDcOhms) : (draft?.earthingDcOhms || '0.8'))
      setEarthingLastCheck(s.earthingLastCheck ? new Date(s.earthingLastCheck).toISOString().split('T')[0] : (draft?.earthingLastCheck || ''))
      setLightningProtection(s.lightningProtection !== false ? (draft?.lightningProtection || 'Installed') : 'Not Installed')
    }
  }, [customer])

  // Save draft state to localStorage whenever values change
  const saveLocalDraft = React.useCallback(() => {
    if (!customer?.id || typeof window === 'undefined') return
    const draftData = {
      disco,
      discoRefNo,
      meterType,
      meterPhase,
      zeroExportDevice,
      inverterBrand,
      inverterSize,
      inverterType,
      inverterPhase,
      inverterCategory,
      noOfInverters,
      inverterSerials,
      inverterWarrantyEnds,
      inverterImageUrls,
      inverterUsername,
      inverterPassword,
      inverterInvoiceUrl,
      panelBrand,
      panelTechnology,
      panelType,
      panelWattage,
      noOfPanels,
      panelWarrantyEnd,
      panelImageUrl,
      batteryBrand,
      batteryType,
      batteryCategory,
      noOfBatteries,
      batterySerials,
      batteryWarrantyEnds,
      batteryImageUrls,
      structureType,
      structureMaterial,
      ingressProtection,
      breakerName,
      earthing,
      systemInstallationDate,
      inverterStatus,
      panelStatus,
      batteryStatus,
      structureStatus,
      cableStatus,
      earthingStatus,
      breakerStatus,
      earthingAcOhms,
      earthingDcOhms,
      earthingLastCheck,
      lightningProtection,
    }
    try {
      localStorage.setItem(`installer_audit_draft_${customer.id}`, JSON.stringify(draftData))
    } catch (e) {
      // Ignore quota exceeded or storage unavailable
    }
  }, [
    customer?.id,
    disco,
    discoRefNo,
    meterType,
    meterPhase,
    zeroExportDevice,
    inverterBrand,
    inverterSize,
    inverterType,
    inverterPhase,
    inverterCategory,
    noOfInverters,
    inverterSerials,
    inverterWarrantyEnds,
    inverterImageUrls,
    inverterUsername,
    inverterPassword,
    inverterInvoiceUrl,
    panelBrand,
    panelTechnology,
    panelType,
    panelWattage,
    noOfPanels,
    panelWarrantyEnd,
    panelImageUrl,
    batteryBrand,
    batteryType,
    batteryCategory,
    noOfBatteries,
    batterySerials,
    batteryWarrantyEnds,
    batteryImageUrls,
    structureType,
    structureMaterial,
    ingressProtection,
    breakerName,
    earthing,
    systemInstallationDate,
    inverterStatus,
    panelStatus,
    batteryStatus,
    structureStatus,
    cableStatus,
    earthingStatus,
    breakerStatus,
    earthingAcOhms,
    earthingDcOhms,
    earthingLastCheck,
    lightningProtection,
  ])

  React.useEffect(() => {
    saveLocalDraft()
  }, [saveLocalDraft])

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

  async function handleInverterPhoto(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingInverterIndex(index)
    setError(null)
    try {
      const url = await uploadEquipmentPhoto(file, 'equipment/inverters')
      if (url) {
        setInverterImageUrls(prev => {
          const newUrls = [...prev]
          newUrls[index] = url
          return newUrls
        })
      }
    } catch (err: any) {
      setError(`Inverter Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingInverterIndex(null)
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

  async function handleBatteryPhoto(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBatteryIndex(index)
    setError(null)
    try {
      const url = await uploadEquipmentPhoto(file, 'equipment/batteries')
      if (url) {
        setBatteryImageUrls(prev => {
          const newUrls = [...prev]
          newUrls[index] = url
          return newUrls
        })
      }
    } catch (err: any) {
      setError(`Battery Photo Upload Error: ${err.message}`)
    } finally {
      setUploadingBatteryIndex(null)
    }
  }

  const validateSpecs = (): string | null => {
    // Section 1: DISCO Utility & Meter Connection
    if (!disco?.trim()) {
      return 'Please specify the DISCO Utility Company in Section 1.'
    }
    if (!discoRefNo?.trim()) {
      return 'Please enter the Consumer Reference # in Section 1.'
    }
    if (!meterType?.trim()) {
      return 'Please select the Meter Type in Section 1.'
    }
    if (!meterPhase?.trim()) {
      return 'Please select the Meter Phase in Section 1.'
    }
    if (!zeroExportDevice?.trim()) {
      return 'Please select the Zero Export Device status in Section 1.'
    }

    // Section 2: Inverter Unit Specifications
    if (!inverterBrand?.trim()) {
      return 'Please enter or select the Inverter Brand in Section 2.'
    }
    if (!inverterSize?.trim()) {
      return 'Please enter the Inverter Capacity / Size in Section 2.'
    }
    if (!inverterType?.trim()) {
      return 'Please select the Inverter Type in Section 2.'
    }
    if (!inverterPhase?.trim()) {
      return 'Please select the Inverter Phase in Section 2.'
    }
    if (!inverterCategory?.trim()) {
      return 'Please select the Inverter Category in Section 2.'
    }
    if (!noOfInverters || Number(noOfInverters) <= 0) {
      return 'Please enter a valid Number of Inverters (at least 1) in Section 2.'
    }
    for (let i = 0; i < noOfInverters; i++) {
      if (!inverterSerials[i]?.trim()) {
        return `Please provide the Serial Number for Inverter Unit ${i + 1} in Section 2.`
      }
      if (!inverterWarrantyEnds[i]?.trim()) {
        return `Please select the Warranty Expiry Date for Inverter Unit ${i + 1} in Section 2.`
      }
    }

    // Section 3: Battery Energy Storage System (BESS)
    if (noOfBatteries > 0) {
      if (!batteryBrand?.trim()) {
        return 'Please specify the Battery Brand in Section 3 since number of batteries is greater than 0.'
      }
      if (!batteryType?.trim() || batteryType === 'None') {
        return 'Please select the Battery Chemistry / Type in Section 3.'
      }
      if (!batteryCategory?.trim() || batteryCategory === 'N/A') {
        return 'Please select the Battery Category in Section 3.'
      }
      for (let i = 0; i < noOfBatteries; i++) {
        if (!batterySerials[i]?.trim()) {
          return `Please provide the Serial Number for Battery Unit ${i + 1} in Section 3.`
        }
        if (!batteryWarrantyEnds[i]?.trim()) {
          return `Please select the Warranty Expiry Date for Battery Unit ${i + 1} in Section 3.`
        }
      }
    }

    // Section 4: Solar PV Panels Specifications
    if (!panelBrand?.trim()) {
      return 'Please enter or select the Solar Panel Brand in Section 4.'
    }
    if (!panelTechnology?.trim()) {
      return 'Please select the Panel Technology in Section 4.'
    }
    if (!panelType?.trim()) {
      return 'Please select the Panel Type in Section 4.'
    }
    if (!panelWattage || Number(panelWattage) <= 0) {
      return 'Please enter a valid Panel Wattage (W) in Section 4.'
    }
    if (!noOfPanels || Number(noOfPanels) <= 0) {
      return 'Please enter the Number of Solar Panels in Section 4.'
    }
    if (!panelWarrantyEnd?.trim()) {
      return 'Please select the Panel Warranty Expiry Date in Section 4.'
    }

    // Section 5: Mounting Structure, Earthing & Protection Specs
    if (!structureType?.trim()) {
      return 'Please select the Structure Type in Section 5.'
    }
    if (!structureMaterial?.trim()) {
      return 'Please select the Structure Material in Section 5.'
    }
    if (!ingressProtection?.trim()) {
      return 'Please select the Ingress Protection (IP) rating in Section 5.'
    }
    if (!breakerName?.trim()) {
      return 'Please enter the Breaker & Switchgear specification in Section 5.'
    }
    if (!earthing?.trim()) {
      return 'Please select the Earthing Protection Type in Section 5.'
    }
    if (!systemInstallationDate?.trim()) {
      return 'Please select the System Installation Date in Section 5.'
    }

    return null
  }

  const validateAudit = (): string | null => {
    if (!inverterStatus?.trim()) return 'Please select Inverter Operating Condition in Part 3.'
    if (!panelStatus?.trim()) return 'Please select Solar PV Panels Status in Part 3.'
    if (!batteryStatus?.trim()) return 'Please select Battery Storage Health Status in Part 3.'
    if (!structureStatus?.trim()) return 'Please select Mounting Structure & GI Material Status in Part 3.'
    if (!cableStatus?.trim()) return 'Please select Cabling & Conduits Status in Part 3.'
    if (!earthingStatus?.trim()) return 'Please select Earthing & Protection Status in Part 3.'
    if (!breakerStatus?.trim()) return 'Please select Breakers & Switchgear Status in Part 3.'

    if (earthingAcOhms === '' || earthingAcOhms === null || isNaN(Number(earthingAcOhms)) || Number(earthingAcOhms) < 0) {
      return 'Please enter a valid AC Earthing resistance (Ω) in Part 3.'
    }
    if (earthingDcOhms === '' || earthingDcOhms === null || isNaN(Number(earthingDcOhms)) || Number(earthingDcOhms) < 0) {
      return 'Please enter a valid DC Earthing resistance (Ω) in Part 3.'
    }
    if (!earthingLastCheck?.trim()) {
      return 'Please select the Earthing Inspection Date in Part 3.'
    }
    if (!lightningProtection?.trim()) {
      return 'Please select the Lightning Protection status in Part 3.'
    }

    return null
  }

  const buildSpecsFormData = () => {
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
    formData.append('noOfInverters', String(Math.max(1, Number(noOfInverters) || 1)))
    formData.append('inverterSerials', JSON.stringify(inverterSerials.slice(0, Math.max(1, noOfInverters))))
    formData.append('inverterWarrantyEnds', JSON.stringify(inverterWarrantyEnds.slice(0, Math.max(1, noOfInverters))))
    formData.append('inverterImageUrls', JSON.stringify(inverterImageUrls.slice(0, Math.max(1, noOfInverters))))
    formData.append('inverterUsername', inverterUsername)
    formData.append('inverterPassword', inverterPassword)
    formData.append('inverterInvoiceUrl', inverterInvoiceUrl)

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
    formData.append('batterySerials', JSON.stringify(batterySerials.slice(0, noOfBatteries)))
    formData.append('batteryWarrantyEnds', JSON.stringify(batteryWarrantyEnds.slice(0, noOfBatteries)))
    formData.append('batteryImageUrls', JSON.stringify(batteryImageUrls.slice(0, noOfBatteries)))

    formData.append('structureType', structureType)
    formData.append('structureMaterial', structureMaterial)
    formData.append('ingressProtection', ingressProtection)
    formData.append('breakerName', breakerName)
    formData.append('earthing', earthing)
    formData.append('lightningProtection', lightningProtection)
    formData.append('systemInstallationDate', systemInstallationDate)

    return formData
  }

  const handleSaveSpecsDraft = async () => {
    setIsSavingDraft(true)
    setError(null)
    setSaveSuccessMsg(null)
    try {
      const fd = buildSpecsFormData()
      const res = await fetch('/api/installer/save-specs', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save hardware specs')
      }
      setSaveSuccessMsg('Hardware Specs successfully saved to database!')
      setTimeout(() => setSaveSuccessMsg(null), 3000)
      return true
    } catch (err: any) {
      setError(`Failed to save specs: ${err.message}`)
      return false
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleGoNext = async () => {
    const valErr = validateSpecs()
    if (valErr) {
      setError(valErr)
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    setError(null)
    // Persist specs directly to database so data is never lost
    const saved = await handleSaveSpecsDraft()
    if (!saved) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    setActiveTab('audit')
    lastTabChangeTime.current = Date.now()
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToSpecs = () => {
    setError(null)
    setActiveTab('specs')
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // If Enter key was pressed while on Specs step, advance to next step instead of submitting
    if (activeTab === 'specs') {
      await handleGoNext()
      return
    }

    // Prevent accidental double-click / key-bounce submissions
    if (Date.now() - lastTabChangeTime.current < 500) {
      return
    }

    const valSpecsErr = validateSpecs()
    if (valSpecsErr) {
      setError(valSpecsErr)
      setActiveTab('specs')
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    const valAuditErr = validateAudit()
    if (valAuditErr) {
      setError(valAuditErr)
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = buildSpecsFormData()

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

      const res = await fetch('/api/installer/audit', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit technical audit')
      }

      // Clear local draft upon successful completion
      if (typeof window !== 'undefined' && customer?.id) {
        try {
          localStorage.removeItem(`installer_audit_draft_${customer.id}`)
        } catch {}
      }

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
      <DialogContent ref={scrollContainerRef} className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl">
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

          {/* Step Progression Indicators (Non-clickable forward jump) */}
          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={handleBackToSpecs}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'bg-[#002868] text-white shadow-xs cursor-default'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Step 1: Solar Hardware Specs</span>
            </button>
            <div
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                activeTab === 'audit'
                  ? 'bg-[#002868] text-white shadow-xs cursor-default'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-80'
              }`}
              title={activeTab === 'specs' ? 'Complete Step 1 and click "Save & Go Next" to unlock Step 2' : 'Step 2: 7-Point Technical Audit Checklist'}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Step 2: 7-Point Audit Checklist</span>
            </div>
          </div>
        </DialogHeader>

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

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
                    <Label className="text-xs font-semibold">DISCO Utility Company <span className="text-red-500">*</span></Label>
                    <AutoSuggestInput
                      value={disco}
                      onChange={setDisco}
                      options={DISCO_LIST}
                      placeholder="e.g. LESCO, K-Electric"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">Consumer Reference # <span className="text-red-500">*</span></Label>
                    <Input
                      value={discoRefNo}
                      onChange={(e) => setDiscoRefNo(formatDiscoRefNo(e.target.value))}
                      placeholder="e.g. 04-11515-0469701 U"
                      className="h-9 text-xs font-mono bg-white uppercase font-bold"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">Meter Type <span className="text-red-500">*</span></Label>
                    <Select value={meterType} onValueChange={(val) => setMeterType(val || 'Green Meter')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Green Meter">Green Meter</SelectItem>
                        <SelectItem value="Bidirectional">Bidirectional Meter</SelectItem>
                        <SelectItem value="Standard">Standard Grid Meter</SelectItem>
                        <SelectItem value="Check Meter">Check Meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <Label className="text-xs font-semibold">Meter Phase <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Zero Export Device <span className="text-red-500">*</span></Label>
                    <Select value={zeroExportDevice} onValueChange={(val) => setZeroExportDevice(val || 'Not Installed')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Installed">Not Installed</SelectItem>
                        <SelectItem value="Installed">Installed &amp; Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 2. Inverter Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">2. Inverter Unit Specifications</p>
                  {inverterImageUrls.some(Boolean) && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Brand <span className="text-red-500">*</span></Label>
                    <AutoSuggestInput
                      value={inverterBrand}
                      onChange={setInverterBrand}
                      options={INVERTER_BRANDS}
                      placeholder="e.g. Solis, Huawei, Growatt"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Capacity / Size <span className="text-red-500">*</span></Label>
                    <AutoSuggestInput
                      value={inverterSize}
                      onChange={setInverterSize}
                      options={INVERTER_SIZES}
                      placeholder="e.g. 6kW, 10kW"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Type <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Inverter Phase <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Inverter Category <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">No. of Inverters <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min={1}
                      value={noOfInverters || 1}
                      onChange={(e) => updateNoOfInverters(Math.max(1, Number(e.target.value) || 1))}
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                </div>

                {/* Inverter Credentials & Invoice Snapshot (For centralized monitoring migration) */}
                <div className="mt-4 p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-sky-200">
                    <div>
                      <h4 className="text-xs font-bold text-[#002868] uppercase tracking-wide flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-sky-600" />
                        Inverter Credentials &amp; Invoice Snapshot
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Required to remove existing manufacturer setup and register on Centralized Monitoring.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-[#002868]">Inverter User Name</Label>
                      <Input
                        value={inverterUsername}
                        onChange={(e) => setInverterUsername(e.target.value)}
                        placeholder="e.g. customer@gmail.com or GoodWe username"
                        className="h-9 text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-[#002868]">Inverter Password</Label>
                      <Input
                        value={inverterPassword}
                        onChange={(e) => setInverterPassword(e.target.value)}
                        placeholder="e.g. Inverter portal password"
                        className="h-9 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-sky-200/60">
                    <CameraPhotoCapture
                      label="Inverter Invoice Snapshot"
                      badge="Invoice Proof"
                      guideType="general"
                      compact
                      value={inverterInvoiceUrl || null}
                      onValueChange={(url) => setInverterInvoiceUrl(url || '')}
                      onUpload={async (file) => {
                        setUploadingInverterInvoice(true)
                        try {
                          const url = await uploadEquipmentPhoto(file, 'equipment/inverter-invoices')
                          if (url) {
                            setInverterInvoiceUrl(url)
                            return url
                          }
                        } catch (err: any) {
                          setError(`Inverter Invoice Upload Error: ${err.message}`)
                        } finally {
                          setUploadingInverterInvoice(false)
                        }
                      }}
                      disabled={uploadingInverterInvoice}
                      fileNamePrefix="inverter_invoice"
                      subtext="Take a photo of the Inverter Purchase Invoice or upload document from gallery."
                    />
                  </div>
                </div>

                {Array.from({ length: noOfInverters }).map((_, index) => (
                  <div key={`inverter-${index}`} className="mt-4 p-4 rounded-xl border border-amber-200/60 bg-amber-50/30 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                      <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Inverter Unit {index + 1}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Inverter {index + 1} Serial # <span className="text-red-500">*</span></Label>
                        <Input
                          value={inverterSerials[index] || ''}
                          onChange={(e) => {
                            const newSerials = [...inverterSerials];
                            newSerials[index] = e.target.value;
                            setInverterSerials(newSerials);
                          }}
                          placeholder="e.g. SN-INV-049812"
                          className="h-9 text-xs font-mono bg-white"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-amber-900">Warranty Expiry Date <span className="text-red-500">*</span></Label>
                        <DateInput
                          value={inverterWarrantyEnds[index] || ''}
                          onChange={(e) => {
                            const newWarranties = [...inverterWarrantyEnds];
                            newWarranties[index] = e.target.value;
                            setInverterWarrantyEnds(newWarranties);
                          }}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <CameraPhotoCapture
                        label={`Inverter #${index + 1} Hardware Photo`}
                        badge={`INV #${index + 1}`}
                        guideType="equipment"
                        compact
                        value={inverterImageUrls[index] || null}
                        onValueChange={(url) => {
                          setInverterImageUrls(prev => {
                            const newUrls = [...prev]
                            newUrls[index] = url || ''
                            return newUrls
                          })
                        }}
                        onUpload={async (file) => {
                          setUploadingInverterIndex(index)
                          try {
                            const url = await uploadEquipmentPhoto(file, 'equipment/inverters')
                            if (url) {
                              setInverterImageUrls(prev => {
                                const newUrls = [...prev]
                                newUrls[index] = url
                                return newUrls
                              })
                              return url
                            }
                          } catch (err: any) {
                            setError(`Inverter Photo Upload Error: ${err.message}`)
                          } finally {
                            setUploadingInverterIndex(null)
                          }
                        }}
                        disabled={uploadingInverterIndex === index}
                        fileNamePrefix={`inverter_${index + 1}`}
                        subtext={`Take photo of Inverter #${index + 1} or upload from gallery.`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Battery Energy Storage System (BESS) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">3. Battery Energy Storage System (BESS)</p>
                  {batteryImageUrls.some(Boolean) && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Brand {noOfBatteries > 0 && <span className="text-red-500">*</span>}</Label>
                    <AutoSuggestInput
                      value={batteryBrand}
                      onChange={(brand) => {
                        setBatteryBrand(brand)
                        if (brand && brand.trim() !== '' && brand !== 'None' && noOfBatteries === 0) {
                          updateNoOfBatteries(1)
                        }
                      }}
                      options={BATTERY_BRANDS}
                      placeholder="e.g. Narada, Pylontech"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Chemistry / Type {noOfBatteries > 0 && <span className="text-red-500">*</span>}</Label>
                    <Select value={batteryType} onValueChange={(val) => {
                      const newType = val || 'Lithium-ion'
                      setBatteryType(newType)
                      if (newType !== 'None' && noOfBatteries === 0) {
                        updateNoOfBatteries(1)
                      }
                    }}>
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
                    <Label className="text-xs font-semibold">Battery Category {noOfBatteries > 0 && <span className="text-red-500">*</span>}</Label>
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
                      onChange={(e) => updateNoOfBatteries(Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-xs font-mono bg-white font-bold"
                    />
                  </div>
                </div>

                {Array.from({ length: noOfBatteries }).map((_, index) => (
                  <div key={`battery-${index}`} className="mt-4 p-4 rounded-xl border border-slate-300 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <h4 className="text-sm font-bold text-[#002868] flex items-center gap-2">
                        <Battery className="h-4 w-4 text-sky-600" />
                        Battery Unit {index + 1}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Battery {index + 1} Serial # <span className="text-red-500">*</span></Label>
                        <Input
                          value={batterySerials[index] || ''}
                          onChange={(e) => {
                            const newSerials = [...batterySerials];
                            newSerials[index] = e.target.value;
                            setBatterySerials(newSerials);
                          }}
                          placeholder="e.g. SN-BAT-092819"
                          className="h-9 text-xs font-mono bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-amber-900">Warranty Expiry Date <span className="text-red-500">*</span></Label>
                        <DateInput
                          value={batteryWarrantyEnds[index] || ''}
                          onChange={(e) => {
                            const newWarranties = [...batteryWarrantyEnds];
                            newWarranties[index] = e.target.value;
                            setBatteryWarrantyEnds(newWarranties);
                          }}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <CameraPhotoCapture
                        label={`Battery #${index + 1} Hardware Photo`}
                        badge={`BATTERY #${index + 1}`}
                        guideType="equipment"
                        compact
                        value={batteryImageUrls[index] || null}
                        onValueChange={(url) => {
                          setBatteryImageUrls(prev => {
                            const newUrls = [...prev]
                            newUrls[index] = url || ''
                            return newUrls
                          })
                        }}
                        onUpload={async (file) => {
                          setUploadingBatteryIndex(index)
                          try {
                            const url = await uploadEquipmentPhoto(file, 'equipment/batteries')
                            if (url) {
                              setBatteryImageUrls(prev => {
                                const newUrls = [...prev]
                                newUrls[index] = url
                                return newUrls
                              })
                              return url
                            }
                          } catch (err: any) {
                            setError(`Battery Photo Upload Error: ${err.message}`)
                          } finally {
                            setUploadingBatteryIndex(null)
                          }
                        }}
                        disabled={uploadingBatteryIndex === index}
                        fileNamePrefix={`battery_${index + 1}`}
                        subtext={`Take photo of Battery #${index + 1} or upload from gallery.`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 4. Solar Panels Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">4. Solar PV Panels Specifications</p>
                  {panelImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panel Brand <span className="text-red-500">*</span></Label>
                    <AutoSuggestInput
                      value={panelBrand}
                      onChange={setPanelBrand}
                      options={PANEL_BRANDS}
                      placeholder="e.g. LONGi, Jinko, Canadian"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panel Technology <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Panel Type <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Panel Wattage (W) <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">No. of Panels <span className="text-red-500">*</span></Label>
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

                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Panel Warranty Expiry Date <span className="text-red-500">*</span></Label>
                    <DateInput
                      value={panelWarrantyEnd}
                      onChange={(e) => setPanelWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <CameraPhotoCapture
                    label="Solar PV Panels Array Photo"
                    badge="PV PANELS"
                    guideType="equipment"
                    compact
                    value={panelImageUrl || null}
                    onValueChange={(url) => setPanelImageUrl(url || '')}
                    onUpload={async (file) => {
                      setUploadingPanel(true)
                      try {
                        const url = await uploadEquipmentPhoto(file, 'equipment/panels')
                        if (url) {
                          setPanelImageUrl(url)
                          return url
                        }
                      } catch (err: any) {
                        setError(`Panel Photo Upload Error: ${err.message}`)
                      } finally {
                        setUploadingPanel(false)
                      }
                    }}
                    disabled={uploadingPanel}
                    fileNamePrefix="solar_panels"
                    subtext="Take photo of installed solar PV panels array or upload from gallery."
                  />
                </div>
              </div>

              {/* 5. Mounting Structure, Earthing & Protection Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">5. Mounting Structure, Protection &amp; Installation Specs</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Structure Type <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Structure Material <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Ingress Protection (IP) <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Breaker &amp; Switchgear Spec <span className="text-red-500">*</span></Label>
                    <Input
                      value={breakerName}
                      onChange={(e) => setBreakerName(e.target.value)}
                      placeholder="e.g. Schneider / ABB AC/DC Breakers"
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Earthing Protection <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold text-amber-900">System Installation Date <span className="text-red-500">*</span></Label>
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
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-950">Technical Inspection Checklist (Part 3)</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Inspect the physical equipment health &amp; safety earthing values before submitting to the O&amp;M Manager.
                </p>
              </div>

              {/* 7-Point Audit Checklist Table */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">7-Point Physical Audit</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">1. Inverter Condition <span className="text-red-500">*</span></Label>
                    <Select value={inverterStatus} onValueChange={(val) => setInverterStatus(val || 'Good')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">2. PV Panels Status <span className="text-red-500">*</span></Label>
                    <Select value={panelStatus} onValueChange={(val) => setPanelStatus(val || 'Good')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">3. Battery Storage Status <span className="text-red-500">*</span></Label>
                    <Select value={batteryStatus} onValueChange={(val) => setBatteryStatus(val || 'Good')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">4. Structure &amp; GI Material <span className="text-red-500">*</span></Label>
                    <Select value={structureStatus} onValueChange={(val) => setStructureStatus(val || 'Good')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">5. Cabling &amp; Conduits <span className="text-red-500">*</span></Label>
                    <Select value={cableStatus} onValueChange={(val) => setCableStatus(val || 'Good')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">6. Earthing &amp; Protection <span className="text-red-500">*</span></Label>
                    <Select value={earthingStatus} onValueChange={(val) => setEarthingStatus(val || 'Good')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">7. Breakers &amp; Switchgear <span className="text-red-500">*</span></Label>
                    <Select value={breakerStatus} onValueChange={(val) => setBreakerStatus(val || 'Good')}>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Safety Earthing Readings */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">Safety Earthing Parameters</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">AC Earthing (Ω) <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">DC Earthing (Ω) <span className="text-red-500">*</span></Label>
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
                    <Label className="text-xs font-semibold">Earthing Inspection Date <span className="text-red-500">*</span></Label>
                    <DateInput
                      value={earthingLastCheck}
                      onChange={(e) => setEarthingLastCheck(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Lightning Protection <span className="text-red-500">*</span></Label>
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
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isSavingDraft} className="text-xs">
                Cancel
              </Button>
              {activeTab === 'audit' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToSpecs}
                  disabled={isSubmitting || isSavingDraft}
                  className="text-xs font-semibold text-slate-700 hover:bg-slate-100 border-slate-300 gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Specs
                </Button>
              )}
            </div>

            {activeTab === 'specs' ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSavingDraft || isSubmitting}
                  onClick={handleSaveSpecsDraft}
                  className="text-xs border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold gap-1.5 cursor-pointer shadow-2xs"
                >
                  {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-amber-600" />}
                  Save Specs Draft
                </Button>
                <Button
                  key="next-btn"
                  type="button"
                  disabled={isSavingDraft || isSubmitting}
                  onClick={handleGoNext}
                  className="bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs gap-2 px-6 shadow-md cursor-pointer transition-colors"
                >
                  {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save &amp; Go Next <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                key="submit-btn"
                type="submit"
                disabled={isSubmitting || isSavingDraft}
                className="bg-[#135d86] hover:bg-[#f16232] text-white font-bold text-xs gap-2 px-6 shadow-md cursor-pointer transition-colors"
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
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
