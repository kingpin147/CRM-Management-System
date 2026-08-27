'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitInstallerAudit(formData: FormData) {
  const customerId = formData.get('customerId') as string
  if (!customerId) throw new Error('Customer ID is required')

  const meterType = (formData.get('meterType') as string) || ''
  const zeroExportDevice = formData.get('zeroExportDevice') === 'Installed' || formData.get('zeroExportDevice') === 'true'
  const disco = (formData.get('disco') as string) || ''
  const discoRefNo = (formData.get('discoRefNo') as string) || ''

  const inverterBrand = (formData.get('inverterBrand') as string) || ''
  const inverterType = (formData.get('inverterType') as string) || ''
  const inverterPhase = (formData.get('inverterPhase') as string) || ''
  const inverterSize = (formData.get('inverterSize') as string) || ''
  const noOfInverters = Number(formData.get('noOfInverters') || 1)
  const inverterSerial = (formData.get('inverterSerial') as string) || ''
  const inverterWarrantyEnd = formData.get('inverterWarrantyEnd') ? new Date(formData.get('inverterWarrantyEnd') as string) : null

  const panelBrand = (formData.get('panelBrand') as string) || ''
  const panelType = (formData.get('panelType') as string) || ''
  const panelTechnology = (formData.get('panelTechnology') as string) || ''
  const panelWattage = Number(formData.get('panelWattage') || 0)
  const noOfPanels = Number(formData.get('noOfPanels') || 0)
  const totalWattage = panelWattage * noOfPanels
  const panelWarrantyEnd = formData.get('panelWarrantyEnd') ? new Date(formData.get('panelWarrantyEnd') as string) : null

  const batteryBrand = (formData.get('batteryBrand') as string) || ''
  const batteryType = (formData.get('batteryType') as string) || ''
  const batteryCategory = (formData.get('batteryCategory') as string) || ''
  const noOfBatteries = Number(formData.get('noOfBatteries') || 0)
  const batterySerial = (formData.get('batterySerial') as string) || ''
  const batteryWarrantyEnd = formData.get('batteryWarrantyEnd') ? new Date(formData.get('batteryWarrantyEnd') as string) : null

  // 7-Point Audit Checklist
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
  const lightningProtection = formData.get('lightningProtection') === 'true' || formData.get('lightningProtection') === 'Installed'

  const installerName = (formData.get('installerName') as string) || undefined
  const installerCompany = (formData.get('installerCompany') as string) || 'EnergyGurus Technical Operations'
  const lastAuditDate = new Date()

  // Equipment photos
  const inverterImageUrl = (formData.get('inverterImageUrl') as string) || undefined
  const batteryImageUrl = (formData.get('batteryImageUrl') as string) || undefined
  const panelImageUrl = (formData.get('panelImageUrl') as string) || undefined

  await prisma.solarSystem.upsert({
    where: { customerId },
    create: {
      customerId,
      meterType,
      zeroExportDevice,
      disco,
      discoRefNo,
      inverterBrand,
      inverterType,
      inverterPhase,
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
      inverterCategory: (formData.get('inverterCategory') as string) || 'On-Grid',
      earthing: (formData.get('earthing') as string) || 'Both',
      breakerName: (formData.get('breakerName') as string) || 'Standard DC/AC Breakers',
      inverterStatus,
      panelStatus,
      batteryStatus,
      structureStatus,
      cableStatus,
      earthingStatus,
      breakerStatus,
      earthingAcOhms,
      earthingDcOhms,
      lightningProtection,
      installerName,
      installerCompany,
      lastAuditDate,
      inverterImages: inverterImageUrl ? [inverterImageUrl] : [],
      batteryImages: batteryImageUrl ? [batteryImageUrl] : [],
    },
    update: {
      meterType,
      zeroExportDevice,
      disco,
      discoRefNo,
      inverterBrand,
      inverterType,
      inverterPhase,
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
      inverterStatus,
      panelStatus,
      batteryStatus,
      structureStatus,
      cableStatus,
      earthingStatus,
      breakerStatus,
      earthingAcOhms,
      earthingDcOhms,
      lightningProtection,
      installerName,
      installerCompany,
      lastAuditDate,
      ...(inverterImageUrl ? { inverterImages: [inverterImageUrl] } : {}),
      ...(batteryImageUrl ? { batteryImages: [batteryImageUrl] } : {}),
    }
  })

  // Ensure customer workflow is in PENDING_ACTIVATION for O&M Manager final review
  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      status: 'PENDING_ACTIVATION'
    }
  })

  // Log in Customer History
  await prisma.customerHistory.create({
    data: {
      customerId,
      customerCode: updatedCustomer.customerCode || customerId,
      customerName: updatedCustomer.fullName || 'Customer',
      actionType: 'PENDING_ACTIVATION',
      notes: `Installer (${installerName || 'Technical Specialist'}) completed Solar Specs (Part 2) & System Audit Checklist (Part 3). Job routed to O&M Manager for activation.`,
      performedBy: installerName || 'Installer Team'
    }
  })

  revalidatePath('/dashboard/installer/jobs')
  revalidatePath('/dashboard/sales/pending')
  revalidatePath(`/dashboard/customers/${customerId}`)
  revalidatePath('/dashboard/customers')

  return { success: true }
}
