'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateNextAuditDate, getAuditFrequencyLabel, formatDate } from '@/lib/utils'

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
  const noOfInverters = Number(formData.get('noOfInverters') || 1)
  const inverterSerial = (formData.get('inverterSerial') as string) || ''
  const inverterWarrantyEnd = formData.get('inverterWarrantyEnd') ? new Date(formData.get('inverterWarrantyEnd') as string) : null

  // Solar PV Panels Specifications
  const panelBrand = (formData.get('panelBrand') as string) || ''
  const panelType = (formData.get('panelType') as string) || 'Tier-1 Monofacial'
  const panelTechnology = (formData.get('panelTechnology') as string) || 'Topcon'
  const panelWattage = Number(formData.get('panelWattage') || 0)
  const noOfPanels = Number(formData.get('noOfPanels') || 0)
  const totalWattage = panelWattage * noOfPanels
  const panelWarrantyEnd = formData.get('panelWarrantyEnd') ? new Date(formData.get('panelWarrantyEnd') as string) : null

  // Battery Energy Storage System (BESS)
  const batteryBrand = (formData.get('batteryBrand') as string) || ''
  const batteryType = (formData.get('batteryType') as string) || 'Lithium-ion'
  const batteryCategory = (formData.get('batteryCategory') as string) || 'Low Voltage'
  const noOfBatteries = Number(formData.get('noOfBatteries') || 0)
  const batterySerial = (formData.get('batterySerial') as string) || ''
  const batteryWarrantyEnd = formData.get('batteryWarrantyEnd') ? new Date(formData.get('batteryWarrantyEnd') as string) : null

  // Mounting Structure, Protection & Installation Details
  const structureType = (formData.get('structureType') as string) || 'Elevated GI Structure'
  const structureMaterial = (formData.get('structureMaterial') as string) || 'Hot Dip Galvanized (HDG)'
  const ingressProtection = (formData.get('ingressProtection') as string) || 'IP65'
  const breakerName = (formData.get('breakerName') as string) || 'Standard DC/AC Breakers'
  const earthing = (formData.get('earthing') as string) || 'Both'
  const systemInstallationDate = formData.get('systemInstallationDate') ? new Date(formData.get('systemInstallationDate') as string) : null

  // Part 3: 7-Point Audit Checklist
  const inverterStatus = (formData.get('inverterStatus') as string) || 'Good'
  const panelStatus = (formData.get('panelStatus') as string) || 'Good'
  const batteryStatus = (formData.get('batteryStatus') as string) || 'Good'
  const structureStatus = (formData.get('structureStatus') as string) || 'Good'
  const cableStatus = (formData.get('cableStatus') as string) || 'Good'
  const earthingStatus = (formData.get('earthingStatus') as string) || 'Good'
  const breakerStatus = (formData.get('breakerStatus') as string) || 'Good'

  // Safety Parameters
  const earthingAcOhms = formData.get('earthingAcOhms') ? Number(formData.get('earthingAcOhms')) : null
  const earthingDcOhms = formData.get('earthingDcOhms') ? Number(formData.get('earthingDcOhms')) : null
  const earthingLastCheck = formData.get('earthingLastCheck') ? new Date(formData.get('earthingLastCheck') as string) : new Date()
  const lightningProtection = formData.get('lightningProtection') === 'true' || formData.get('lightningProtection') === 'Installed'

  const installerName = (formData.get('installerName') as string) || undefined
  const installerCompany = (formData.get('installerCompany') as string) || 'EnergyGurus Technical Operations'
  
  // Date calculation: First Audit Date & Next Scheduled Audit Date
  const lastAuditDate = new Date()
  const firstAuditDate = (customerRecord?.solarSystem as any)?.firstAuditDate || lastAuditDate
  const packageTier = customerRecord?.packagePlan?.packageTier || 'Moderate'
  const nextAuditDate = calculateNextAuditDate(firstAuditDate, packageTier)

  // Equipment photos
  const inverterImageUrl = (formData.get('inverterImageUrl') as string) || ''
  const batteryImageUrl = (formData.get('batteryImageUrl') as string) || ''
  const panelImageUrl = (formData.get('panelImageUrl') as string) || ''

  const currentSystem = customerRecord?.solarSystem

  const finalInverterImages = inverterImageUrl 
    ? [inverterImageUrl] 
    : (currentSystem?.inverterImages || [])
  const finalBatteryImages = batteryImageUrl 
    ? [batteryImageUrl] 
    : (currentSystem?.batteryImages || [])
  const finalPanelImages = panelImageUrl 
    ? [panelImageUrl] 
    : (currentSystem as any)?.panelImages || []

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
      inverterSerial,
      inverterWarrantyEnd,
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
      batterySerial,
      batteryWarrantyEnd,
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
      inverterSerial,
      inverterWarrantyEnd,
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
      batterySerial,
      batteryWarrantyEnd,
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
      actionType: 'PENDING_ACTIVATION',
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
