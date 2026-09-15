'use server'

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

export async function submitInstallerAudit(formData: FormData) {
  const customerId = formData.get('customerId') as string
  if (!customerId) throw new Error('Customer ID is required')

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
  if (!disco.trim()) throw new Error('DISCO Utility Company is required in Section 1.')
  if (!discoRefNo.trim()) throw new Error('Consumer Reference # is required in Section 1.')
  if (!meterType.trim()) throw new Error('Meter Type is required in Section 1.')
  if (!meterPhase.trim()) throw new Error('Meter Phase is required in Section 1.')
  if (!inverterBrand.trim()) throw new Error('Inverter Brand is required in Section 2.')
  if (!inverterSize.trim()) throw new Error('Inverter Size/Capacity is required in Section 2.')
  if (!inverterType.trim()) throw new Error('Inverter Type is required in Section 2.')
  if (!inverterPhase.trim()) throw new Error('Inverter Phase is required in Section 2.')
  if (!inverterCategory.trim()) throw new Error('Inverter Category is required in Section 2.')
  if (inverterSerials.length === 0 || inverterSerials.slice(0, noOfInverters).some((s: string) => !s || !s.trim())) {
    throw new Error('All Inverter Unit Serial numbers must be provided in Section 2.')
  }
  if (inverterWarrantyEnds.length === 0 || inverterWarrantyEnds.length < noOfInverters) {
    throw new Error('All Inverter Unit Warranty Expiry Dates must be provided in Section 2.')
  }
  if (!panelBrand.trim()) throw new Error('Solar PV Panel Brand is required in Section 3.')
  if (!panelTechnology.trim()) throw new Error('Solar PV Panel Technology is required in Section 3.')
  if (!panelType.trim()) throw new Error('Solar PV Panel Type is required in Section 3.')
  if (panelWattage <= 0) throw new Error('Valid Solar Panel Wattage is required in Section 3.')
  if (noOfPanels <= 0) throw new Error('Valid Number of Solar Panels is required in Section 3.')
  if (!panelWarrantyEnd) {
    throw new Error('Valid Solar Panel Warranty Expiry Date is required in Section 3.')
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
      throw new Error('Battery Brand is required in Section 4 when number of batteries is greater than 0.')
    }
    if (batterySerials.length === 0 || batterySerials.slice(0, noOfBatteries).some((s: string) => !s || !s.trim())) {
      throw new Error('All Battery Unit Serial numbers must be provided in Section 4.')
    }
    if (batteryWarrantyEnds.length === 0 || batteryWarrantyEnds.length < noOfBatteries) {
      throw new Error('All Battery Unit Warranty Expiry Dates must be provided in Section 4.')
    }
  }

  // Mounting Structure, Protection & Installation Details
  const structureType = (formData.get('structureType') as string) || 'Elevated GI Structure'
  const structureMaterial = (formData.get('structureMaterial') as string) || 'Hot Dip Galvanized (HDG)'
  const ingressProtection = (formData.get('ingressProtection') as string) || 'IP65'
  const breakerName = (formData.get('breakerName') as string) || 'Standard DC/AC Breakers'
  const earthing = (formData.get('earthing') as string) || 'Both'
  const systemInstallationDate = parseDateSafe(formData.get('systemInstallationDate') as string)

  if (!structureType.trim()) throw new Error('Structure Type is required in Section 5.')
  if (!structureMaterial.trim()) throw new Error('Structure Material is required in Section 5.')
  if (!ingressProtection.trim()) throw new Error('Ingress Protection rating is required in Section 5.')
  if (!breakerName.trim()) throw new Error('Breaker & Switchgear Specification is required in Section 5.')
  if (!earthing.trim()) throw new Error('Earthing Protection Type is required in Section 5.')
  if (!systemInstallationDate) {
    throw new Error('Valid System Installation Date is required in Section 5.')
  }

  // Part 3: 7-Point Audit Checklist Validations
  const inverterStatus = (formData.get('inverterStatus') as string) || 'Good'
  const panelStatus = (formData.get('panelStatus') as string) || 'Good'
  const batteryStatus = (formData.get('batteryStatus') as string) || 'Good'
  const structureStatus = (formData.get('structureStatus') as string) || 'Good'
  const cableStatus = (formData.get('cableStatus') as string) || 'Good'
  const earthingStatus = (formData.get('earthingStatus') as string) || 'Good'
  const breakerStatus = (formData.get('breakerStatus') as string) || 'Good'

  if (!inverterStatus.trim()) throw new Error('Inverter Operating Condition is required in Part 3 Checklist.')
  if (!panelStatus.trim()) throw new Error('Solar PV Panels Status is required in Part 3 Checklist.')
  if (!batteryStatus.trim()) throw new Error('Battery Storage Health Status is required in Part 3 Checklist.')
  if (!structureStatus.trim()) throw new Error('Mounting Structure Status is required in Part 3 Checklist.')
  if (!cableStatus.trim()) throw new Error('Cabling & Conduits Status is required in Part 3 Checklist.')
  if (!earthingStatus.trim()) throw new Error('Earthing & Protection Status is required in Part 3 Checklist.')
  if (!breakerStatus.trim()) throw new Error('Breakers & Switchgear Status is required in Part 3 Checklist.')

  // Safety Parameters
  const earthingAcOhmsRaw = formData.get('earthingAcOhms') as string
  const earthingDcOhmsRaw = formData.get('earthingDcOhms') as string
  if (earthingAcOhmsRaw === null || earthingAcOhmsRaw === undefined || earthingAcOhmsRaw.trim() === '' || isNaN(Number(earthingAcOhmsRaw)) || Number(earthingAcOhmsRaw) < 0) {
    throw new Error('Valid AC Earthing Resistance (Ω) is required in Part 3.')
  }
  if (earthingDcOhmsRaw === null || earthingDcOhmsRaw === undefined || earthingDcOhmsRaw.trim() === '' || isNaN(Number(earthingDcOhmsRaw)) || Number(earthingDcOhmsRaw) < 0) {
    throw new Error('Valid DC Earthing Resistance (Ω) is required in Part 3.')
  }
  const earthingAcOhms = Number(earthingAcOhmsRaw)
  const earthingDcOhms = Number(earthingDcOhmsRaw)

  const earthingLastCheck = parseDateSafe(formData.get('earthingLastCheck') as string)
  if (!earthingLastCheck) throw new Error('Valid Earthing Inspection Date is required in Part 3.')

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

  const rawPanelImageUrls = parseJsonArraySafe<string>(formData.get('panelImageUrls') as string, [])
  const singlePanelUrl = (formData.get('panelImageUrl') as string) || (formData.get('panelPhoto') as string) || ''
  const finalPanelImages = rawPanelImageUrls.length > 0 
    ? rawPanelImageUrls 
    : (singlePanelUrl ? [singlePanelUrl] : (currentSystem?.panelImages || []))

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
      inverterSerial: inverterSerials[0] || '', // Fallback for legacy
      inverterSerials,
      inverterWarrantyEnd: inverterWarrantyEnds[0] || null, // Legacy
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
      batterySerial: batterySerials[0] || '', // Legacy
      batterySerials,
      batteryWarrantyEnd: batteryWarrantyEnds[0] || null, // Legacy
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
      panelImages: finalPanelImages,
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
      panelImages: finalPanelImages,
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

  return { success: true, nextAuditDate }
}

export async function saveSolarSpecsOnly(formData: FormData) {
  const customerId = formData.get('customerId') as string
  if (!customerId) throw new Error('Customer ID is required')

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

  // Mounting Structure, Protection & Installation Details
  const structureType = (formData.get('structureType') as string) || 'Elevated GI Structure'
  const structureMaterial = (formData.get('structureMaterial') as string) || 'Hot Dip Galvanized (HDG)'
  const ingressProtection = (formData.get('ingressProtection') as string) || 'IP65'
  const breakerName = (formData.get('breakerName') as string) || 'Standard DC/AC Breakers'
  const earthing = (formData.get('earthing') as string) || 'Both'
  const lightningProtection = formData.get('lightningProtection') === 'true' || formData.get('lightningProtection') === 'Yes' || formData.get('lightningProtection') === 'Installed'
  const systemInstallationDate = parseDateSafe(formData.get('systemInstallationDate') as string)

  const customerRecord = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { solarSystem: true }
  })
  const currentSystem = customerRecord?.solarSystem

  const rawInverterImageUrls = parseJsonArraySafe<string>(formData.get('inverterImageUrls') as string, [])
  const finalInverterImages = rawInverterImageUrls.length > 0 ? rawInverterImageUrls : (currentSystem?.inverterImages || [])

  const rawBatteryImageUrls = parseJsonArraySafe<string>(formData.get('batteryImageUrls') as string, [])
  const finalBatteryImages = rawBatteryImageUrls.length > 0 ? rawBatteryImageUrls : (currentSystem?.batteryImages || [])

  const rawPanelImageUrls = parseJsonArraySafe<string>(formData.get('panelImageUrls') as string, [])
  const singlePanelUrl = (formData.get('panelImageUrl') as string) || (formData.get('panelPhoto') as string) || ''
  const finalPanelImages = rawPanelImageUrls.length > 0 
    ? rawPanelImageUrls 
    : (singlePanelUrl ? [singlePanelUrl] : (currentSystem?.panelImages || []))

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
      lightningProtection,
      breakerName,
      ingressProtection,
      structureType,
      structureMaterial,
      systemInstallationDate,
      inverterImages: finalInverterImages,
      panelImages: finalPanelImages,
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
      lightningProtection,
      breakerName,
      ingressProtection,
      structureType,
      structureMaterial,
      systemInstallationDate,
      inverterImages: finalInverterImages,
      panelImages: finalPanelImages,
      batteryImages: finalBatteryImages,
      inverterUsername,
      inverterPassword,
      inverterInvoiceUrl,
    }
  })

  revalidatePath('/dashboard/installer/jobs')
  revalidatePath('/dashboard/sales/pending')
  revalidatePath(`/dashboard/customers/${customerId}`)
  revalidatePath('/dashboard/customers')

  return { success: true }
}

export async function activateIpNocConnection(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const ipNocNotes = (formData.get('ipNocNotes') as string) || ''
  const ipNocUser = (formData.get('ipNocUser') as string) || 'IP NOC Executive'

  if (!customerId) throw new Error('Customer ID is required')

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { packagePlan: true }
  })

  if (!customer) throw new Error('Customer not found')

  const activationDate = new Date()
  const bType = customer.packagePlan?.billingType || 'Monthly'
  const nextBillingDate = new Date(activationDate)
  if (bType === 'Quarterly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
  else if (bType === 'Half Yearly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 6)
  else if (bType === 'Yearly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 12)
  else nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      status: 'CONNECTION_ACTIVE',
      activationDate,
      ...(customer.packagePlan ? {
        packagePlan: {
          update: {
            nextBillingDate
          }
        }
      } : {})
    }
  })

  await prisma.customerHistory.create({
    data: {
      customerId,
      customerCode: customer.customerCode || customerId,
      customerName: customer.fullName,
      actionType: 'CONNECTION_ACTIVE',
      oldStatus: customer.status,
      newStatus: 'CONNECTION_ACTIVE',
      notes: `IP NOC Connection Configured & Activated by ${ipNocUser}.${ipNocNotes ? ' Notes: ' + ipNocNotes : ''}`,
      performedBy: ipNocUser
    }
  })

  revalidatePath('/dashboard/installer/jobs')
  revalidatePath('/dashboard/sales/pending')
  revalidatePath(`/dashboard/customers/${customerId}`)
  revalidatePath('/dashboard/customers')
  revalidatePath('/dashboard/reports')

  return { success: true }
}
