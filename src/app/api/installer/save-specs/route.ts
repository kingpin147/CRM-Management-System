import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

    // Utility & Meter Connection
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
        batteryImages: finalBatteryImages,
        inverterUsername,
        inverterPassword,
        inverterInvoiceUrl,
      }
    })

    revalidatePath('/dashboard/installer/jobs')
    revalidatePath('/dashboard/sales/pending')
    revalidatePath(`/dashboard/customers/${customerId}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API save specs error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save hardware specs' }, { status: 500 })
  }
}
