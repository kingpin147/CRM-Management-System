import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateNextAuditDate, getAuditFrequencyLabel, formatDate } from '@/lib/utils'

function parseDateSafe(val: any): Date | null {
  if (!val || typeof val !== 'string' || val.trim() === '') return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function parseJsonArraySafe<T>(val: any, fallback: T[] = []): T[] {
  if (!val || typeof val !== 'string' || val.trim() === '') return fallback
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const customerId = formData.get('customerId') as string
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Query existing customer and package plan to accurately compute next audit schedule
    const customerRecord = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { packagePlan: true, solarSystem: true }
    })

    // Part 2: Utility & Meter Connection
    const disco = (formData.get('disco') as string) || ''
    const discoRefNo = (formData.get('discoRefNo') as string) || ''
    const meterType = (formData.get('meterType') as string) || 'Green Meter'
    const meterPhase = (formData.get('meterPhase') as string) || 'Three Phase'
    const zeroExportDevice = formData.get('zeroExportDevice') === 'Installed' || formData.get('zeroExportDevice') === 'true'

    // Inverter Unit Specifications
    const inverterBrand = (formData.get('inverterBrand') as string) || ''
    const inverterType = (formData.get('inverterType') as string) || 'Hybrid'
    const inverterPhase = (formData.get('inverterPhase') as string) || 'Three Phase'
    const inverterCategory = (formData.get('inverterCategory') as string) || 'Low Voltage'
    const inverterSize = (formData.get('inverterSize') as string) || ''
    const noOfInverters = Math.max(1, Number(formData.get('noOfInverters')) || 1)
    
    const inverterSerials = parseJsonArraySafe<string>(formData.get('inverterSerials') as string, [])
    const rawInverterWarrantyEnds = parseJsonArraySafe<string>(formData.get('inverterWarrantyEnds') as string, [])
    const inverterWarrantyEnds: Date[] = rawInverterWarrantyEnds
      .map(d => parseDateSafe(d))
      .filter((d): d is Date => d !== null)

    const inverterUsername = (formData.get('inverterUsername') as string) || null
    const inverterPassword = (formData.get('inverterPassword') as string) || null
    const inverterInvoiceUrl = (formData.get('inverterInvoiceUrl') as string) || null

    // Solar PV Panels Specifications
    const panelBrand = (formData.get('panelBrand') as string) || ''
    const panelType = (formData.get('panelType') as string) || 'Tier-1 Monofacial'
    const panelTechnology = (formData.get('panelTechnology') as string) || 'Topcon'
    const panelWattage = Number(formData.get('panelWattage') || 0)
    const noOfPanels = Number(formData.get('noOfPanels') || 0)
    const totalWattage = panelWattage * noOfPanels
    const panelWarrantyEnd = parseDateSafe(formData.get('panelWarrantyEnd') as string)

    // Server-side validations for Part 2 (Solar Hardware Specs)
    if (!disco.trim()) return NextResponse.json({ error: 'DISCO Utility Company is required in Section 1.' }, { status: 400 })
    if (!discoRefNo.trim()) return NextResponse.json({ error: 'Consumer Reference # is required in Section 1.' }, { status: 400 })
    if (!meterType.trim()) return NextResponse.json({ error: 'Meter Type is required in Section 1.' }, { status: 400 })
    if (!meterPhase.trim()) return NextResponse.json({ error: 'Meter Phase is required in Section 1.' }, { status: 400 })
    if (!inverterBrand.trim()) return NextResponse.json({ error: 'Inverter Brand is required in Section 2.' }, { status: 400 })
    if (!inverterSize.trim()) return NextResponse.json({ error: 'Inverter Size/Capacity is required in Section 2.' }, { status: 400 })
    if (!inverterType.trim()) return NextResponse.json({ error: 'Inverter Type is required in Section 2.' }, { status: 400 })
    if (!inverterPhase.trim()) return NextResponse.json({ error: 'Inverter Phase is required in Section 2.' }, { status: 400 })
    if (!inverterCategory.trim()) return NextResponse.json({ error: 'Inverter Category is required in Section 2.' }, { status: 400 })
    if (inverterSerials.length === 0 || inverterSerials.slice(0, noOfInverters).some((s: string) => !s || !s.trim())) {
      return NextResponse.json({ error: 'All Inverter Unit Serial numbers must be provided in Section 2.' }, { status: 400 })
    }
    if (inverterWarrantyEnds.length === 0 || inverterWarrantyEnds.length < noOfInverters) {
      return NextResponse.json({ error: 'All Inverter Unit Warranty Expiry Dates must be provided in Section 2.' }, { status: 400 })
    }
    if (!panelBrand.trim()) return NextResponse.json({ error: 'Solar PV Panel Brand is required in Section 3.' }, { status: 400 })
    if (!panelTechnology.trim()) return NextResponse.json({ error: 'Solar PV Panel Technology is required in Section 3.' }, { status: 400 })
    if (!panelType.trim()) return NextResponse.json({ error: 'Solar PV Panel Type is required in Section 3.' }, { status: 400 })
    if (panelWattage <= 0) return NextResponse.json({ error: 'Valid Solar Panel Wattage is required in Section 3.' }, { status: 400 })
    if (noOfPanels <= 0) return NextResponse.json({ error: 'Valid Number of Solar Panels is required in Section 3.' }, { status: 400 })
    if (!panelWarrantyEnd) {
      return NextResponse.json({ error: 'Valid Solar Panel Warranty Expiry Date is required in Section 3.' }, { status: 400 })
    }

    // Battery Energy Storage System (BESS)
    const batteryBrand = (formData.get('batteryBrand') as string) || ''
    const batteryType = (formData.get('batteryType') as string) || 'Lithium-ion'
    const batteryCategory = (formData.get('batteryCategory') as string) || 'Low Voltage'
    const noOfBatteries = Number(formData.get('noOfBatteries') || 0)
    
    const batterySerials = parseJsonArraySafe<string>(formData.get('batterySerials') as string, [])
    const rawBatteryWarrantyEnds = parseJsonArraySafe<string>(formData.get('batteryWarrantyEnds') as string, [])
    const batteryWarrantyEnds: Date[] = rawBatteryWarrantyEnds
      .map(d => parseDateSafe(d))
      .filter((d): d is Date => d !== null)

    if (noOfBatteries > 0) {
      if (!batteryBrand.trim() || batteryBrand.trim().toUpperCase() === 'N/A') {
        return NextResponse.json({ error: 'Battery Brand is required in Section 4 when number of batteries is greater than 0.' }, { status: 400 })
      }
      if (batterySerials.length === 0 || batterySerials.slice(0, noOfBatteries).some((s: string) => !s || !s.trim())) {
        return NextResponse.json({ error: 'All Battery Unit Serial numbers must be provided in Section 4.' }, { status: 400 })
      }
      if (batteryWarrantyEnds.length === 0 || batteryWarrantyEnds.length < noOfBatteries) {
        return NextResponse.json({ error: 'All Battery Unit Warranty Expiry Dates must be provided in Section 4.' }, { status: 400 })
      }
    }

    // Mounting Structure, Protection & Installation Details
    const structureType = (formData.get('structureType') as string) || 'Elevated GI Structure'
    const structureMaterial = (formData.get('structureMaterial') as string) || 'Hot Dip Galvanized (HDG)'
    const ingressProtection = (formData.get('ingressProtection') as string) || 'IP65'
    const breakerName = (formData.get('breakerName') as string) || 'Standard DC/AC Breakers'
    const earthing = (formData.get('earthing') as string) || 'Both'
    const systemInstallationDate = parseDateSafe(formData.get('systemInstallationDate') as string)

    if (!structureType.trim()) return NextResponse.json({ error: 'Structure Type is required in Section 5.' }, { status: 400 })
    if (!structureMaterial.trim()) return NextResponse.json({ error: 'Structure Material is required in Section 5.' }, { status: 400 })
    if (!ingressProtection.trim()) return NextResponse.json({ error: 'Ingress Protection rating is required in Section 5.' }, { status: 400 })
    if (!breakerName.trim()) return NextResponse.json({ error: 'Breaker & Switchgear Specification is required in Section 5.' }, { status: 400 })
    if (!earthing.trim()) return NextResponse.json({ error: 'Earthing Protection Type is required in Section 5.' }, { status: 400 })
    if (!systemInstallationDate) {
      return NextResponse.json({ error: 'Valid System Installation Date is required in Section 5.' }, { status: 400 })
    }

    // Part 3: 7-Point Audit Checklist Validations
    const inverterStatus = (formData.get('inverterStatus') as string) || 'Good'
    const panelStatus = (formData.get('panelStatus') as string) || 'Good'
    const batteryStatus = (formData.get('batteryStatus') as string) || 'Good'
    const structureStatus = (formData.get('structureStatus') as string) || 'Good'
    const cableStatus = (formData.get('cableStatus') as string) || 'Good'
    const earthingStatus = (formData.get('earthingStatus') as string) || 'Good'
    const breakerStatus = (formData.get('breakerStatus') as string) || 'Good'

    if (!inverterStatus.trim()) return NextResponse.json({ error: 'Inverter Operating Condition is required in Part 3 Checklist.' }, { status: 400 })
    if (!panelStatus.trim()) return NextResponse.json({ error: 'Solar PV Panels Status is required in Part 3 Checklist.' }, { status: 400 })
    if (!batteryStatus.trim()) return NextResponse.json({ error: 'Battery Storage Health Status is required in Part 3 Checklist.' }, { status: 400 })
    if (!structureStatus.trim()) return NextResponse.json({ error: 'Mounting Structure Status is required in Part 3 Checklist.' }, { status: 400 })
    if (!cableStatus.trim()) return NextResponse.json({ error: 'Cabling & Conduits Status is required in Part 3 Checklist.' }, { status: 400 })
    if (!earthingStatus.trim()) return NextResponse.json({ error: 'Earthing & Protection Status is required in Part 3 Checklist.' }, { status: 400 })
    if (!breakerStatus.trim()) return NextResponse.json({ error: 'Breakers & Switchgear Status is required in Part 3 Checklist.' }, { status: 400 })

    // Safety Parameters
    const earthingAcOhmsRaw = formData.get('earthingAcOhms') as string
    const earthingDcOhmsRaw = formData.get('earthingDcOhms') as string
    if (earthingAcOhmsRaw === null || earthingAcOhmsRaw === undefined || earthingAcOhmsRaw.trim() === '' || isNaN(Number(earthingAcOhmsRaw)) || Number(earthingAcOhmsRaw) < 0) {
      return NextResponse.json({ error: 'Valid AC Earthing Resistance (Ω) is required in Part 3.' }, { status: 400 })
    }
    if (earthingDcOhmsRaw === null || earthingDcOhmsRaw === undefined || earthingDcOhmsRaw.trim() === '' || isNaN(Number(earthingDcOhmsRaw)) || Number(earthingDcOhmsRaw) < 0) {
      return NextResponse.json({ error: 'Valid DC Earthing Resistance (Ω) is required in Part 3.' }, { status: 400 })
    }
    const earthingAcOhms = Number(earthingAcOhmsRaw)
    const earthingDcOhms = Number(earthingDcOhmsRaw)

    const earthingLastCheck = parseDateSafe(formData.get('earthingLastCheck') as string)
    if (!earthingLastCheck) return NextResponse.json({ error: 'Valid Earthing Inspection Date is required in Part 3.' }, { status: 400 })

    const lightningProtection = formData.get('lightningProtection') === 'true' || formData.get('lightningProtection') === 'Installed' || formData.get('lightningProtection') === 'Yes'

    const installerName = (formData.get('installerName') as string) || undefined
    const installerCompany = (formData.get('installerCompany') as string) || 'EnergyGurus Technical Operations'
    
    // Date calculation: First Audit Date & Next Scheduled Audit Date
    const lastAuditDate = new Date()
    const firstAuditDate = (customerRecord?.solarSystem as any)?.firstAuditDate || lastAuditDate
    const packageTier = customerRecord?.packagePlan?.packageTier || 'Moderate'
    const nextAuditDate = calculateNextAuditDate(firstAuditDate, packageTier)

    // Equipment photos
    const currentSystem = customerRecord?.solarSystem

    const rawInverterImageUrls = parseJsonArraySafe<string>(formData.get('inverterImageUrls') as string, [])
    const finalInverterImages = rawInverterImageUrls.length > 0 ? rawInverterImageUrls : (currentSystem?.inverterImages || [])

    const rawBatteryImageUrls = parseJsonArraySafe<string>(formData.get('batteryImageUrls') as string, [])
    const finalBatteryImages = rawBatteryImageUrls.length > 0 ? rawBatteryImageUrls : (currentSystem?.batteryImages || [])

    await prisma.solarSystem.upsert({
      where: { customerId },
      create: {
        customerId,
        meterType,
        meterPhase,
        zeroExportDevice,
        disco,
        discoRefNo,
        inverterBrand,
        inverterType,
        inverterPhase,
        inverterCategory,
        inverterSize,
        noOfInverters,
        inverterSerial: inverterSerials[0] || '',
        inverterSerials,
        inverterWarrantyEnd: inverterWarrantyEnds[0] || null,
        inverterWarrantyEnds,
        panelBrand,
        panelType,
        panelTechnology,
        panelWattage,
        noOfPanels,
        totalWattage,
        panelWarrantyEnd,
        batteryBrand,
        batteryType,
        batteryCategory,
        noOfBatteries,
        batterySerial: batterySerials[0] || '',
        batterySerials,
        batteryWarrantyEnd: batteryWarrantyEnds[0] || null,
        batteryWarrantyEnds,
        earthing,
        earthingLastCheck,
        earthingAcOhms,
        earthingDcOhms,
        lightningProtection,
        breakerName,
        ingressProtection,
        structureType,
        structureMaterial,
        systemInstallationDate,
        inverterStatus,
        panelStatus,
        batteryStatus,
        structureStatus,
        cableStatus,
        earthingStatus,
        breakerStatus,
        installerName,
        installerCompany,
        lastAuditDate,
        inverterImages: finalInverterImages,
        batteryImages: finalBatteryImages,
        inverterUsername,
        inverterPassword,
        inverterInvoiceUrl,
      },
      update: {
        meterType,
        meterPhase,
        zeroExportDevice,
        disco,
        discoRefNo,
        inverterBrand,
        inverterType,
        inverterPhase,
        inverterCategory,
        inverterSize,
        noOfInverters,
        inverterSerial: inverterSerials[0] || '',
        inverterSerials,
        inverterWarrantyEnd: inverterWarrantyEnds[0] || null,
        inverterWarrantyEnds,
        panelBrand,
        panelType,
        panelTechnology,
        panelWattage,
        noOfPanels,
        totalWattage,
        panelWarrantyEnd,
        batteryBrand,
        batteryType,
        batteryCategory,
        noOfBatteries,
        batterySerial: batterySerials[0] || '',
        batterySerials,
        batteryWarrantyEnd: batteryWarrantyEnds[0] || null,
        batteryWarrantyEnds,
        earthing,
        earthingLastCheck,
        earthingAcOhms,
        earthingDcOhms,
        lightningProtection,
        breakerName,
        ingressProtection,
        structureType,
        structureMaterial,
        systemInstallationDate,
        inverterStatus,
        panelStatus,
        batteryStatus,
        structureStatus,
        cableStatus,
        earthingStatus,
        breakerStatus,
        installerName,
        installerCompany,
        lastAuditDate,
        inverterImages: finalInverterImages,
        batteryImages: finalBatteryImages,
        inverterUsername,
        inverterPassword,
        inverterInvoiceUrl,
      }
    })

    // Ensure customer workflow is updated to PENDING_ACTIVATION for O&M Manager final review
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        status: 'PENDING_ACTIVATION'
      }
    })

    // Log in Customer History with Next Audit Date
    await prisma.customerHistory.create({
      data: {
        customerId,
        customerCode: updatedCustomer.customerCode || customerId,
        customerName: updatedCustomer.fullName || 'Customer',
        actionType: 'STATUS_CHANGE',
        oldStatus: (customerRecord?.status as any) || null,
        newStatus: 'PENDING_ACTIVATION',
        notes: `Installer (${installerName || 'Technical Specialist'}) completed Solar Specs (Part 2) & System Audit (Part 3). Next Scheduled Audit: ${nextAuditDate ? formatDate(nextAuditDate) : 'N/A'} (${getAuditFrequencyLabel(packageTier)}). Routed to O&M Manager for activation.`,
        performedBy: installerName || 'Installer Team'
      }
    })

    revalidatePath('/dashboard/installer/jobs')
    revalidatePath('/dashboard/sales/pending')
    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/customers')

    return NextResponse.json({ success: true, nextAuditDate })
  } catch (error: any) {
    console.error('API submit audit error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit technical audit' }, { status: 500 })
  }
}
