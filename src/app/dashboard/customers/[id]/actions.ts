'use server'

import { revalidatePath } from 'next/cache'
import { CustomerStatus, CustomerType, TicketStatus, TicketType } from '@prisma/client'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { sendInvoiceNotifications } from '@/utils/communication'
import { calculateNextBillingDate, calculatePackageBreakdown, isCustomCapacityTier } from '@/lib/pricing'
import { triggerRegistrationSMS } from '@/lib/integration-helpers'
import { canUserEditCustomerProfile, canUserEditSolarSpecs } from '@/lib/permissions'

export async function updateCustomer(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const fullName = formData.get('fullName') as string
  const contactNumber = formData.get('contactNumber') as string
  const pocNumber = formData.get('pocNumber') as string || null
  const email = formData.get('email') as string || null
  const cnic = formData.get('cnic') as string
  const passportNumber = formData.get('passportNumber') as string || null
  const ntnNumber = formData.get('ntnNumber') as string || null
  const customerType = formData.get('customerType') as CustomerType
  const status = formData.get('status') as CustomerStatus
  const address = formData.get('address') as string
  const city = formData.get('city') as string || 'Islamabad'
  const houseNumber = formData.get('houseNumber') as string || null
  const streetNumber = formData.get('streetNumber') as string || null
  const block = formData.get('block') as string || null
  const area = formData.get('area') as string || null
  const subArea = formData.get('subArea') as string || null
  const coordinates = formData.get('coordinates') as string || null
  const inverterUsername = formData.has('inverterUsername') ? (formData.get('inverterUsername') as string) : null
  const inverterPassword = formData.has('inverterPassword') ? (formData.get('inverterPassword') as string) : null

  if (!customerId || !fullName || !contactNumber || !cnic) {
    return { error: 'Full Name, Contact Number, and CNIC are required.' }
  }

  // Permission check: strictly SUPER_ADMIN, ADMIN, and Muhammad Ajmal (m.ajmal@energygurus.online)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required to update customer profile.' }
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { fullName: true, role: true, email: true, designation: true }
  })
  const userEmail = (dbUser?.email || user.email || '').toLowerCase()
  const userRole = dbUser?.role

  if (!canUserEditCustomerProfile({ role: userRole, email: userEmail, fullName: dbUser?.fullName, designation: dbUser?.designation })) {
    return { error: 'Access denied: You do not have permission to edit customer profile.' }
  }

  let performedBy = 'Authorized Manager'
  if (dbUser) {
    performedBy = `${dbUser.fullName} (${dbUser.designation || dbUser.role.replace(/_/g, ' ')})`
  } else if (user?.email) {
    performedBy = user.email
  }

  try {
    const currentCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { packagePlan: true, solarSystem: true }
    })

    if (!currentCustomer) {
      return { error: 'Customer not found.' }
    }

    // Collect field differences for history tracking
    const diffs: string[] = []
    const addDiff = (label: string, oldVal: any, newVal: any) => {
      const v1 = (oldVal ?? '').toString().trim()
      const v2 = (newVal ?? '').toString().trim()
      if (v1 !== v2) {
        const from = v1 || '(Not Specified)'
        const to = v2 || '(Cleared)'
        diffs.push(`• ${label}: "${from}" → "${to}"`)
      }
    }

    addDiff('Customer Name', currentCustomer.fullName, fullName)
    addDiff('Contact Number', currentCustomer.contactNumber, contactNumber)
    addDiff('POC Number', currentCustomer.pocNumber, pocNumber)
    addDiff('Email', currentCustomer.email, email)
    addDiff('CNIC', currentCustomer.cnic, cnic)
    addDiff('Passport #', currentCustomer.passportNumber, passportNumber)
    addDiff('NTN Number', currentCustomer.ntnNumber, ntnNumber)
    addDiff('Customer Type', currentCustomer.customerType, customerType)
    addDiff(
      'Customer Status',
      currentCustomer.status ? currentCustomer.status.replace(/_/g, ' ') : '',
      status ? status.replace(/_/g, ' ') : ''
    )
    addDiff('Full Address', currentCustomer.address, address)
    addDiff('City', currentCustomer.city, city)
    addDiff('House #', currentCustomer.houseNumber, houseNumber)
    addDiff('Street #', currentCustomer.streetNumber, streetNumber)
    addDiff('Block / Sector', currentCustomer.block, block)
    addDiff('Area / Society', currentCustomer.area, area)
    addDiff('Sub Area / Phase', currentCustomer.subArea, subArea)
    addDiff('GPS Coordinates', currentCustomer.coordinates, coordinates)

    if (inverterUsername !== null && currentCustomer.solarSystem) {
      addDiff('Inverter User Name', currentCustomer.solarSystem.inverterUsername, inverterUsername)
    }
    if (inverterPassword !== null && currentCustomer.solarSystem) {
      const oldPwd = (currentCustomer.solarSystem.inverterPassword || '').trim()
      const newPwd = inverterPassword.trim()
      if (oldPwd !== newPwd) {
        diffs.push(`• Inverter Password: "(Updated)"`)
      }
    }

    const isNowActive = status === CustomerStatus.CONNECTION_ACTIVE && currentCustomer?.status !== CustomerStatus.CONNECTION_ACTIVE
    const activationDate = isNowActive ? (currentCustomer?.activationDate || new Date()) : undefined

    let calculatedNextBillingDate: Date | undefined
    if (isNowActive && currentCustomer?.packagePlan) {
      const bType = currentCustomer.packagePlan.billingType || 'Monthly'
      const freeM = currentCustomer.packagePlan.freeMonths || 0
      calculatedNextBillingDate = calculateNextBillingDate(activationDate, bType, freeM)
    }

    const statusChanged = currentCustomer.status !== status

    if (diffs.length > 0) {
      const notes = [
        `Customer profile updated (${diffs.length} field${diffs.length > 1 ? 's' : ''} modified):`,
        ...diffs
      ].join('\n')

      await prisma.customerHistory.create({
        data: {
          customerId,
          customerCode: currentCustomer.customerCode,
          customerName: fullName || currentCustomer.fullName,
          actionType: statusChanged ? 'STATUS_CHANGE' : 'PROFILE_UPDATE',
          oldStatus: statusChanged ? currentCustomer.status : null,
          newStatus: statusChanged ? status : null,
          notes,
          performedBy,
        }
      })
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName,
        contactNumber,
        pocNumber,
        email,
        cnic,
        passportNumber,
        ntnNumber,
        customerType,
        status,
        ...(isNowActive ? { activationDate } : {}),
        address,
        city,
        houseNumber,
        streetNumber,
        block,
        area,
        subArea,
        coordinates,
        ...(calculatedNextBillingDate ? {
          packagePlan: {
            update: {
              nextBillingDate: calculatedNextBillingDate
            }
          }
        } : {})
      },
    })

    if (currentCustomer.solarSystem && (inverterUsername !== null || inverterPassword !== null)) {
      await prisma.solarSystem.update({
        where: { customerId },
        data: {
          ...(inverterUsername !== null ? { inverterUsername: inverterUsername.trim() || null } : {}),
          ...(inverterPassword !== null ? { inverterPassword: inverterPassword.trim() || null } : {}),
        }
      })
    }

    // Automatic Client Requirement: Welcome & CRF sent when customer is activated in CRM
    if (isNowActive) {
      triggerRegistrationSMS(customerId).catch((e) => console.error('Error triggering welcome CRF on activation:', e))
    }

    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/customers')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating customer:', error)
    return { error: error.message || 'Failed to update customer profile.' }
  }
}

export async function createPackagePlan(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const rawSystemSizeKw = formData.get('systemSizeKw') as string
  const customSystemSize = (formData.get('customSystemSize') as string)?.trim()
  const isCustom = isCustomCapacityTier(rawSystemSizeKw) || Boolean(customSystemSize)
  const systemSizeKw = (isCustom && customSystemSize)
    ? (customSystemSize.toLowerCase().includes('kw') ? customSystemSize : `${customSystemSize} kW`)
    : rawSystemSizeKw

  const packageTier = formData.get('packageTier') as string
  const billingType = formData.get('billingType') as string
  const monitoringTime = formData.get('monitoringTime') as string
  const freeMonths = Math.max(0, Number(formData.get('freeMonths') || 0))
  const monthlyBasePrice = Number(formData.get('monthlyBasePrice')) || 0
  const appliedDiscount = Number(formData.get('appliedDiscount')) || 0
  
  const breakdown = calculatePackageBreakdown(systemSizeKw, packageTier, billingType, monitoringTime, monthlyBasePrice)
  const salesTaxAmount = breakdown.salesTax
  const onboardingFee = breakdown.onboardingFee
  const totalAmount = breakdown.grandTotal

  try {
    await prisma.packagePlan.upsert({
      where: { customerId },
      update: {
        systemSizeKw,
        packageTier,
        billingType,
        monitoringTime,
        freeMonths,
        monthlyBasePrice,
        appliedDiscount,
        salesTaxAmount,
        onboardingFee,
        totalAmount
      },
      create: {
        customerId,
        systemSizeKw,
        packageTier,
        billingType,
        monitoringTime,
        freeMonths,
        monthlyBasePrice,
        appliedDiscount,
        salesTaxAmount,
        onboardingFee,
        totalAmount
      }
    })

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to create package plan.' }
  }
}

export async function saveSolarSystem(formData: FormData) {
  const customerId = formData.get('customerId') as string
  if (!customerId) return { error: 'Customer ID is required' }

  // Permission check: strictly SUPER_ADMIN, ADMIN, OM_MANAGER, and Muhammad Ajmal (m.ajmal@energygurus.online)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required to save solar system specifications.' }
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { fullName: true, role: true, email: true, designation: true }
  })
  const userEmail = (dbUser?.email || user.email || '').toLowerCase()
  const userRole = dbUser?.role

  if (!canUserEditSolarSpecs({ role: userRole, email: userEmail, fullName: dbUser?.fullName, designation: dbUser?.designation })) {
    return { error: 'Access denied: You do not have permission to edit solar system specifications.' }
  }

  // Fetch current system first so any fields omitted from the editing modal are preserved
  const currentSystem = await prisma.solarSystem.findUnique({ where: { customerId } })
  const currentCustomer = await prisma.customer.findUnique({ where: { id: customerId } })

  const disco = formData.has('disco')
    ? ((formData.get('disco') as string)?.trim() || null)
    : (currentSystem?.disco || null)

  const discoRefNo = formData.has('discoRefNo')
    ? ((formData.get('discoRefNo') as string)?.trim() || null)
    : (currentSystem?.discoRefNo || null)

  const meterType = formData.has('meterType')
    ? ((formData.get('meterType') as string)?.trim() || 'Green Meter')
    : (currentSystem?.meterType || 'Green Meter')

  const meterPhase = formData.has('meterPhase')
    ? ((formData.get('meterPhase') as string)?.trim() || 'Three Phase')
    : (currentSystem?.meterPhase || 'Three Phase')

  const zeroExportDevice = formData.has('zeroExportDevice')
    ? (formData.get('zeroExportDevice') === 'true' || formData.get('zeroExportDevice') === 'Installed')
    : (currentSystem?.zeroExportDevice ?? false)

  const netMetering = formData.has('netMetering')
    ? ((formData.get('netMetering') as string)?.trim() || 'Yes')
    : (currentSystem?.netMetering || 'Yes')
  
  // Inverter
  const inverterBrand = formData.has('inverterBrand') && formData.get('inverterBrand')
    ? (formData.get('inverterBrand') as string).trim()
    : (currentSystem?.inverterBrand || 'Huawei')

  const inverterType = formData.has('inverterType') && formData.get('inverterType')
    ? (formData.get('inverterType') as string).trim()
    : (currentSystem?.inverterType || 'Hybrid')

  const inverterPhase = formData.has('inverterPhase') && formData.get('inverterPhase')
    ? (formData.get('inverterPhase') as string).trim()
    : (currentSystem?.inverterPhase || 'Three Phase')

  const inverterCategory = formData.has('inverterCategory') && formData.get('inverterCategory')
    ? (formData.get('inverterCategory') as string).trim()
    : (currentSystem?.inverterCategory || 'Low Voltage')

  const inverterSize = formData.has('inverterSize') && formData.get('inverterSize')
    ? (formData.get('inverterSize') as string).trim()
    : (currentSystem?.inverterSize || '10 kW')

  const noOfInverters = formData.has('noOfInverters')
    ? (Number(formData.get('noOfInverters')) || 1)
    : (currentSystem?.noOfInverters ?? 1)

  const pvDgController = formData.has('pvDgController')
    ? ((formData.get('pvDgController') as string)?.trim() || 'Not Installed')
    : (currentSystem?.pvDgController || 'Not Installed')

  const pvDgControllerBrand = formData.has('pvDgControllerBrand')
    ? ((formData.get('pvDgControllerBrand') as string)?.trim() || null)
    : (currentSystem?.pvDgControllerBrand || null)

  const datalogger = formData.has('datalogger')
    ? ((formData.get('datalogger') as string)?.trim() || 'Not Installed')
    : (currentSystem?.datalogger || 'Not Installed')

  const dataloggerBrand = formData.has('dataloggerBrand')
    ? ((formData.get('dataloggerBrand') as string)?.trim() || null)
    : (currentSystem?.dataloggerBrand || null)

  const monitoringEcosystem = formData.has('monitoringEcosystem')
    ? ((formData.get('monitoringEcosystem') as string)?.trim() || null)
    : (currentSystem?.monitoringEcosystem || null)

  const rawInverterUsername = formData.get('inverterUsername')
  const rawInverterPassword = formData.get('inverterPassword')
  const inverterInvoiceUrl = formData.has('inverterInvoiceUrl')
    ? ((formData.get('inverterInvoiceUrl') as string)?.trim() || null)
    : (currentSystem?.inverterInvoiceUrl || null)
  
  let inverterSerial = currentSystem?.inverterSerial || ('SN-INV-' + Date.now().toString().slice(-6))
  let inverterWarrantyEnd = currentSystem?.inverterWarrantyEnd || undefined
  let inverterSerials: string[] = currentSystem?.inverterSerials || []
  let inverterWarrantyEnds: Date[] = currentSystem?.inverterWarrantyEnds || []

  if (formData.has('inverterSerials') || formData.has('inverterSerial')) {
    const rawSerials = formData.get('inverterSerials') as string
    if (rawSerials) {
      try {
        inverterSerials = JSON.parse(rawSerials)
      } catch (e) {
        console.error('Failed to parse inverterSerials', e)
      }
    } else if (formData.get('inverterSerial')) {
      inverterSerial = (formData.get('inverterSerial') as string).trim()
    }
    if (inverterSerials.length > 0) {
      inverterSerial = inverterSerials[0]
    }
  }

  if (formData.has('inverterWarrantyEnds') || formData.get('inverterWarrantyEnd')) {
    const rawWarranties = formData.get('inverterWarrantyEnds') as string
    if (rawWarranties) {
      try {
        const parsed = JSON.parse(rawWarranties) as string[]
        inverterWarrantyEnds = parsed.map(w => w ? new Date(w) : new Date())
      } catch (e) {
        console.error('Failed to parse inverterWarrantyEnds', e)
      }
    } else if (formData.get('inverterWarrantyEnd')) {
      inverterWarrantyEnd = new Date(formData.get('inverterWarrantyEnd') as string)
    }
    if (inverterWarrantyEnds.length > 0) {
      inverterWarrantyEnd = inverterWarrantyEnds[0]
    }
  }

  // Panel
  const panelBrand = formData.has('panelBrand') && formData.get('panelBrand')
    ? (formData.get('panelBrand') as string).trim()
    : (currentSystem?.panelBrand || 'Longi')

  const panelType = formData.has('panelType') && formData.get('panelType')
    ? (formData.get('panelType') as string).trim()
    : (currentSystem?.panelType || 'Bifacial')

  const panelTechnology = formData.has('panelTechnology') && formData.get('panelTechnology')
    ? (formData.get('panelTechnology') as string).trim()
    : (currentSystem?.panelTechnology || 'Topcon')

  const panelWattage = formData.has('panelWattage')
    ? (Number(formData.get('panelWattage')) || 585)
    : (currentSystem?.panelWattage ?? 585)

  const noOfPanels = formData.has('noOfPanels')
    ? (Number(formData.get('noOfPanels')) || 18)
    : (currentSystem?.noOfPanels ?? 18)

  const totalWattage = panelWattage * noOfPanels

  let panelWarrantyEnd = currentSystem?.panelWarrantyEnd || undefined
  if (formData.has('panelWarrantyEnd')) {
    const panelWarrantyRaw = formData.get('panelWarrantyEnd') as string
    panelWarrantyEnd = panelWarrantyRaw ? new Date(panelWarrantyRaw) : undefined
  }
  
  // Monitoring Time & Grid-Tied Mode
  const monitoringTime = formData.has('monitoringTime')
    ? ((formData.get('monitoringTime') as string) || '').trim()
    : ''
  const isGridTied = monitoringTime
    ? (monitoringTime.toLowerCase() === 'grid tied' || monitoringTime === '24 hours' || inverterType === 'OnGrid')
    : (inverterType === 'OnGrid')

  // Battery
  const batteryBrand = isGridTied
    ? ''
    : (formData.has('batteryBrand')
        ? ((formData.get('batteryBrand') as string) || '')
        : (currentSystem?.batteryBrand || ''))

  const batteryType = isGridTied
    ? 'None'
    : (formData.has('batteryType')
        ? ((formData.get('batteryType') as string) || 'Lithium')
        : (currentSystem?.batteryType || 'Lithium'))

  const batteryCategory = isGridTied
    ? 'N/A'
    : (formData.has('batteryCategory')
        ? ((formData.get('batteryCategory') as string) || 'Low Voltage')
        : (currentSystem?.batteryCategory || 'Low Voltage'))

  const noOfBatteries = isGridTied
    ? 0
    : (formData.has('noOfBatteries')
        ? (Number(formData.get('noOfBatteries')) || 0)
        : (currentSystem?.noOfBatteries ?? 0))
  
  let batterySerial = isGridTied ? '' : (currentSystem?.batterySerial || '')
  let batteryWarrantyEnd = (!isGridTied && currentSystem?.batteryWarrantyEnd) ? currentSystem.batteryWarrantyEnd : undefined
  let batterySerials: string[] = isGridTied ? [] : (currentSystem?.batterySerials || [])
  let batteryWarrantyEnds: Date[] = isGridTied ? [] : (currentSystem?.batteryWarrantyEnds || [])
  
  if (!isGridTied) {
    if (formData.has('batterySerials') || formData.has('batterySerial')) {
      const rawSerials = formData.get('batterySerials') as string
      if (rawSerials) {
        try {
          batterySerials = JSON.parse(rawSerials)
        } catch (e) {
          console.error('Failed to parse batterySerials', e)
        }
      } else if (formData.get('batterySerial')) {
        batterySerial = (formData.get('batterySerial') as string).trim()
      }
      if (batterySerials.length > 0) batterySerial = batterySerials[0]
    }

    if (formData.has('batteryWarrantyEnds') || formData.get('batteryWarrantyEnd')) {
      const rawWarranties = formData.get('batteryWarrantyEnds') as string
      if (rawWarranties) {
        try {
          const parsed = JSON.parse(rawWarranties) as string[]
          batteryWarrantyEnds = parsed.map(w => w ? new Date(w) : new Date())
        } catch (e) {
          console.error('Failed to parse batteryWarrantyEnds', e)
        }
      } else if (formData.get('batteryWarrantyEnd')) {
        batteryWarrantyEnd = new Date(formData.get('batteryWarrantyEnd') as string)
      }
      if (batteryWarrantyEnds.length > 0) batteryWarrantyEnd = batteryWarrantyEnds[0]
    }
  }

  // Earthing & Specs (CRITICAL: preserve existing values if not submitted in formData)
  const earthing = (formData.has('earthing') && formData.get('earthing'))
    ? (formData.get('earthing') as string).trim()
    : (currentSystem?.earthing || 'AC & DC Grounding')

  const earthingAcOhms = (formData.has('earthingAcOhms') && formData.get('earthingAcOhms') !== '' && formData.get('earthingAcOhms') !== null)
    ? Number(formData.get('earthingAcOhms'))
    : (currentSystem?.earthingAcOhms != null ? Number(currentSystem.earthingAcOhms) : 1.2)

  const earthingDcOhms = (formData.has('earthingDcOhms') && formData.get('earthingDcOhms') !== '' && formData.get('earthingDcOhms') !== null)
    ? Number(formData.get('earthingDcOhms'))
    : (currentSystem?.earthingDcOhms != null ? Number(currentSystem.earthingDcOhms) : 0.8)

  const lightningProtection = formData.has('lightningProtection')
    ? (formData.get('lightningProtection') === 'true' || formData.get('lightningProtection') === 'Installed')
    : (currentSystem?.lightningProtection ?? true)

  const lightningArrestor = formData.has('lightningArrestor')
    ? ((formData.get('lightningArrestor') as string) || 'Not Installed')
    : (currentSystem?.lightningArrestor || 'Not Installed')

  const energyAnalyzer = formData.has('energyAnalyzer')
    ? ((formData.get('energyAnalyzer') as string) || 'Not Installed')
    : (currentSystem?.energyAnalyzer || 'Not Installed')

  const inputBreakerName = formData.has('breakerName') ? (formData.get('breakerName') as string)?.trim() : undefined
  const breakerName = inputBreakerName || currentSystem?.breakerName || 'Schneider 32A MCB'

  const structureType = (formData.has('structureType') && formData.get('structureType'))
    ? (formData.get('structureType') as string).trim()
    : (currentSystem?.structureType || null)

  const structureMaterial = (formData.has('structureMaterial') && formData.get('structureMaterial'))
    ? (formData.get('structureMaterial') as string).trim()
    : (currentSystem?.structureMaterial || null)

  const installerName = (formData.has('installerName') && formData.get('installerName'))
    ? (formData.get('installerName') as string).trim()
    : (currentSystem?.installerName || null)

  const installerCompany = (formData.has('installerCompany') && formData.get('installerCompany'))
    ? (formData.get('installerCompany') as string).trim()
    : (currentSystem?.installerCompany || null)

  // Images (R2 / Storage text URLs)
  const inverterImagesRaw = formData.get('inverterImages') as string || formData.get('inverterImageUrls') as string || formData.get('inverterImageUrl') as string
  const batteryImagesRaw = formData.get('batteryImages') as string || formData.get('batteryImageUrls') as string || formData.get('batteryImageUrl') as string
  const panelImagesRaw = formData.get('panelImages') as string || formData.get('panelImageUrls') as string || formData.get('panelImageUrl') as string

  let inverterImages: string[] | undefined
  if (inverterImagesRaw) {
    try {
      const parsed = JSON.parse(inverterImagesRaw)
      inverterImages = Array.isArray(parsed) ? parsed.filter(Boolean) : [inverterImagesRaw]
    } catch {
      inverterImages = [inverterImagesRaw]
    }
  }

  let batteryImages: string[] | undefined
  if (batteryImagesRaw) {
    try {
      const parsed = JSON.parse(batteryImagesRaw)
      batteryImages = Array.isArray(parsed) ? parsed.filter(Boolean) : [batteryImagesRaw]
    } catch {
      batteryImages = [batteryImagesRaw]
    }
  }

  let panelImages: string[] | undefined
  if (panelImagesRaw) {
    try {
      const parsed = JSON.parse(panelImagesRaw)
      panelImages = Array.isArray(parsed) ? parsed.filter(Boolean) : [panelImagesRaw]
    } catch {
      panelImages = [panelImagesRaw]
    }
  }

  try {
    const inverterUsername = rawInverterUsername !== null
      ? ((rawInverterUsername as string).trim() || null)
      : (currentSystem?.inverterUsername || null)
    const inverterPassword = rawInverterPassword !== null
      ? ((rawInverterPassword as string).trim() || null)
      : (currentSystem?.inverterPassword || null)
    
    const finalInverterImages = inverterImages !== undefined
      ? (inverterImages.length > 0 ? inverterImages : (currentSystem?.inverterImages || []))
      : (currentSystem?.inverterImages || [])

    const finalBatteryImages = isGridTied
      ? []
      : (batteryImages !== undefined
          ? (batteryImages.length > 0 ? batteryImages : (currentSystem?.batteryImages || []))
          : (currentSystem?.batteryImages || []))

    const finalPanelImages = panelImages !== undefined
      ? (panelImages.length > 0 ? panelImages : (currentSystem?.panelImages || []))
      : (currentSystem?.panelImages || [])

    // Track comprehensive changes for equipment & specs history audit with old and new values
    const changes: string[] = []

    const addSolarDiff = (label: string, oldVal: any, newVal: any) => {
      const v1 = (oldVal ?? '').toString().trim()
      const v2 = (newVal ?? '').toString().trim()
      if (v1 !== v2) {
        const from = v1 || '(Not Specified)'
        const to = v2 || '(Cleared)'
        changes.push(`• ${label}: "${from}" → "${to}"`)
      }
    }

    const addDateDiff = (label: string, oldDate?: Date | null, newDate?: Date | null) => {
      const d1 = oldDate ? new Date(oldDate).toISOString().split('T')[0] : ''
      const d2 = newDate ? new Date(newDate).toISOString().split('T')[0] : ''
      if (d1 !== d2) {
        const from = d1 || '(Not Set)'
        const to = d2 || '(Cleared)'
        changes.push(`• ${label}: "${from}" → "${to}"`)
      }
    }

    const addArrayDiff = (label: string, oldArr: string[] = [], newArr: string[] = []) => {
      const a1 = (oldArr || []).filter(Boolean).join(', ')
      const a2 = (newArr || []).filter(Boolean).join(', ')
      if (a1 !== a2) {
        const from = a1 || '(None)'
        const to = a2 || '(Cleared)'
        changes.push(`• ${label}: "${from}" → "${to}"`)
      }
    }

    if (currentSystem) {
      // Grid & Metering
      addSolarDiff('DISCO', currentSystem.disco, disco)
      addSolarDiff('DISCO Ref No', currentSystem.discoRefNo, discoRefNo)
      addSolarDiff('Meter Type', currentSystem.meterType, meterType)
      addSolarDiff('Meter Phase', currentSystem.meterPhase, meterPhase)
      addSolarDiff('Zero Export Device', currentSystem.zeroExportDevice ? 'Installed' : 'Not Installed', zeroExportDevice ? 'Installed' : 'Not Installed')
      addSolarDiff('Net Metering', currentSystem.netMetering, netMetering)
      addSolarDiff('Lightning Arrestor', currentSystem.lightningArrestor, lightningArrestor)
      addSolarDiff('Energy Analyzer', currentSystem.energyAnalyzer, energyAnalyzer)

      // Inverter System
      addSolarDiff('Inverter Brand', currentSystem.inverterBrand, inverterBrand)
      addSolarDiff('Inverter Type', currentSystem.inverterType, inverterType)
      addSolarDiff('Inverter Phase', currentSystem.inverterPhase, inverterPhase)
      addSolarDiff('Inverter Category', currentSystem.inverterCategory, inverterCategory)
      addSolarDiff('Inverter Size', currentSystem.inverterSize, inverterSize)
      addSolarDiff('No of Inverters', currentSystem.noOfInverters, noOfInverters)
      addSolarDiff('Inverter Serial', currentSystem.inverterSerial, inverterSerial)
      addArrayDiff('Inverter Serials', currentSystem.inverterSerials, inverterSerials)
      addDateDiff('Inverter Warranty End', currentSystem.inverterWarrantyEnd, inverterWarrantyEnd)
      addSolarDiff('Inverter Portal Username', currentSystem.inverterUsername, inverterUsername)
      if (inverterPassword && inverterPassword !== currentSystem.inverterPassword) {
        changes.push(`• Inverter Portal Password: "(Updated)"`)
      }

      // Controller & Monitoring
      addSolarDiff('PV DG Controller', currentSystem.pvDgController, pvDgController)
      addSolarDiff('PV DG Controller Brand', currentSystem.pvDgControllerBrand, pvDgControllerBrand)
      addSolarDiff('Datalogger', currentSystem.datalogger, datalogger)
      addSolarDiff('Datalogger Brand', currentSystem.dataloggerBrand, dataloggerBrand)
      addSolarDiff('Monitoring Ecosystem', currentSystem.monitoringEcosystem, monitoringEcosystem)

      // Solar Panels
      addSolarDiff('Panel Brand', currentSystem.panelBrand, panelBrand)
      addSolarDiff('Panel Type', currentSystem.panelType, panelType)
      addSolarDiff('Panel Technology', currentSystem.panelTechnology, panelTechnology)
      addSolarDiff('Panel Wattage', currentSystem.panelWattage ? `${currentSystem.panelWattage}W` : '', panelWattage ? `${panelWattage}W` : '')
      addSolarDiff('No of Panels', currentSystem.noOfPanels, noOfPanels)
      addSolarDiff('Total Wattage', currentSystem.totalWattage ? `${currentSystem.totalWattage}W` : '', totalWattage ? `${totalWattage}W` : '')
      addDateDiff('Panel Warranty End', currentSystem.panelWarrantyEnd, panelWarrantyEnd)

      // Battery Storage
      addSolarDiff('Battery Brand', currentSystem.batteryBrand, batteryBrand)
      addSolarDiff('Battery Type', currentSystem.batteryType, batteryType)
      addSolarDiff('Battery Category', currentSystem.batteryCategory, batteryCategory)
      addSolarDiff('No of Batteries', currentSystem.noOfBatteries, noOfBatteries)
      addSolarDiff('Battery Serial', currentSystem.batterySerial, batterySerial)
      addArrayDiff('Battery Serials', currentSystem.batterySerials, batterySerials)
      addDateDiff('Battery Warranty End', currentSystem.batteryWarrantyEnd, batteryWarrantyEnd)

      // Grounding & Installation
      addSolarDiff('Earthing', currentSystem.earthing, earthing)
      addSolarDiff('Earthing AC Ohms', currentSystem.earthingAcOhms, earthingAcOhms)
      addSolarDiff('Earthing DC Ohms', currentSystem.earthingDcOhms, earthingDcOhms)
      addSolarDiff('Breaker Specs', currentSystem.breakerName, breakerName)
      addSolarDiff('Structure Type', currentSystem.structureType, structureType)
      addSolarDiff('Installer Name', currentSystem.installerName, installerName)
      addSolarDiff('Installer Company', currentSystem.installerCompany, installerCompany)
    } else {
      changes.push(`Initial System Specs configured: Inverter ${inverterBrand} ${inverterSize || ''} (${inverterSerial}), Battery ${batteryBrand} (${batterySerial}), Panels ${panelBrand} ${panelWattage}W x${noOfPanels} (${totalWattage}W)`)
    }

    await prisma.solarSystem.upsert({
      where: { customerId },
      update: {
        disco,
        discoRefNo,
        meterType,
        meterPhase,
        zeroExportDevice,
        netMetering,
        pvDgController,
        pvDgControllerBrand,
        datalogger,
        dataloggerBrand,
        monitoringEcosystem,
        inverterBrand,
        inverterType,
        inverterPhase,
        inverterCategory,
        inverterSize,
        noOfInverters,
        inverterSerial,
        inverterSerials,
        inverterWarrantyEnd,
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
        batterySerial,
        batterySerials,
        batteryWarrantyEnd,
        batteryWarrantyEnds,
        earthing,
        earthingAcOhms,
        earthingDcOhms,
        lightningProtection,
        lightningArrestor,
        energyAnalyzer,
        breakerName,
        structureType,
        installerName,
        installerCompany,
        inverterUsername,
        inverterPassword,
        inverterInvoiceUrl,
        inverterImages: finalInverterImages,
        panelImages: finalPanelImages,
        batteryImages: finalBatteryImages,
      },
      create: {
        customerId,
        disco,
        discoRefNo,
        meterType,
        meterPhase,
        zeroExportDevice,
        netMetering,
        pvDgController,
        pvDgControllerBrand,
        datalogger,
        dataloggerBrand,
        monitoringEcosystem,
        inverterBrand,
        inverterType,
        inverterPhase,
        inverterCategory,
        inverterSize,
        noOfInverters,
        inverterSerial,
        inverterSerials,
        inverterWarrantyEnd,
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
        batterySerial,
        batterySerials,
        batteryWarrantyEnd,
        batteryWarrantyEnds,
        earthing,
        earthingAcOhms,
        earthingDcOhms,
        lightningProtection,
        lightningArrestor,
        energyAnalyzer,
        breakerName,
        structureType,
        installerName,
        installerCompany,
        inverterUsername,
        inverterPassword,
        inverterInvoiceUrl,
        inverterImages: finalInverterImages,
        panelImages: finalPanelImages,
        batteryImages: finalBatteryImages,
      }
    })

    if (currentCustomer && changes.length > 0) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      let performedBy = 'O&M Team'
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { supabaseId: user.id },
          select: { fullName: true, role: true, email: true, designation: true }
        })
        if (dbUser) {
          performedBy = `${dbUser.fullName} (${dbUser.designation || dbUser.role.replace(/_/g, ' ')})`
        } else if (user.email) {
          performedBy = user.email
        }
      }

      const notes = [
        currentSystem
          ? `Solar system details updated (${changes.length} field${changes.length > 1 ? 's' : ''} modified):`
          : 'Initial solar system specifications configured:',
        ...changes
      ].join('\n')

      await prisma.customerHistory.create({
        data: {
          customerId,
          customerCode: currentCustomer.customerCode,
          customerName: currentCustomer.fullName,
          actionType: currentSystem ? 'SYSTEM_SPECS_UPDATE' : 'SYSTEM_SPECS_CREATED',
          oldStatus: null,
          newStatus: null,
          notes,
          performedBy,
        }
      })
    }

    if (monitoringTime) {
      await prisma.packagePlan.updateMany({
        where: { customerId },
        data: { monitoringTime }
      })
    }

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to save solar system:', error)
    return { error: error.message || 'Failed to save solar system specifications.' }
  }
}


export async function recordPayment(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const amount = Number(formData.get('amount')) || 0
  const paymentMethod = formData.get('paymentMethod') as string || 'Bank Transfer'
  const customRef = formData.get('reference') as string
  const narration = formData.get('narration') as string || 'Customer O&M Fee Payment'

  if (!customerId || amount <= 0) {
    return { error: 'Please enter a valid payment amount.' }
  }

  const reference = customRef || `PRV-${Math.floor(100000 + Math.random() * 900000)}`

  try {
    // Atomic transaction guarantees zero balance race conditions
    await prisma.$transaction(async (tx) => {
      // 1. Create Transaction record
      await tx.transaction.create({
        data: {
          customerId,
          amount,
          paymentMethod,
          status: 'PAID',
        },
      })

      // 2. Fetch latest balance atomically
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      })

      const previousBalance = lastEntry ? Number(lastEntry.balance) : 0
      const newBalance = previousBalance - amount

      // 3. Create Ledger Credit Entry
      await tx.ledgerEntry.create({
        data: {
          customerId,
          refNumber: reference,
          narration: `${narration} (${paymentMethod})`,
          debit: 0,
          credit: amount,
          balance: newBalance,
        },
      })
    })

    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/ledger')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to record payment:', error)
    return { error: error.message || 'Failed to record payment transaction.' }
  }
}

export async function createCustomerTicket(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const ticketType = formData.get('ticketType') as TicketType || TicketType.TECHNICAL_COMPLAINT
  const category = formData.get('category') as string || 'Inverter'
  const subCategory = formData.get('subCategory') as string || null
  const faultCode = formData.get('faultCode') as string || null
  const assignedTo = formData.get('assignedTo') as string || 'O&M'
  const escalation = formData.get('escalation') as string || 'Medium'
  const description = formData.get('description') as string

  if (!customerId || !description) {
    return { error: 'Complaint description is required.' }
  }

  try {
    const ticketNumber = `TCK-${Date.now().toString().slice(-7)}`

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        customerId,
        ticketType,
        source: 'CRM Customer Portal',
        assignedTo,
        escalation,
        status: TicketStatus.PENDING,
        actionPriority: escalation,
        category,
        subCategory,
        fault: faultCode,
        description,
      },
    })

    // Log history
    await prisma.ticketHistory.create({
      data: {
        ticketId: newTicket.id,
        status: TicketStatus.PENDING,
        department: assignedTo,
        remarks: 'Ticket logged from customer dashboard.',
        createdBy: 'Customer Care Staff',
      },
    })

    // If Solar System Audit Request or checkbox checked, create SystemAudit in O&M Manager Queue
    const createAuditRequest = formData.get('createAuditRequest') === 'true' || faultCode === 'Solar System Audit Request'
    if (createAuditRequest) {
      const auditNumber = `AUD-${Date.now().toString().slice(-6)}`
      await prisma.systemAudit.create({
        data: {
          auditNumber,
          customerId,
          ticketId: newTicket.id,
          auditType: 'ON_DEMAND',
          status: 'PENDING',
          scheduledDate: new Date(),
          notes: `On-Demand Audit Request from Ticket #${ticketNumber}: ${description}`,
          performedBy: 'Customer Support'
        }
      })
    }

    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/tickets')
    revalidatePath('/dashboard/om/audits')
    revalidatePath('/dashboard/installer/jobs')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create ticket:', error)
    return { error: error.message || 'Failed to log customer ticket.' }
  }
}

export async function generateManualInvoice(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const amount = Number(formData.get('amount')) || 0
  const description = formData.get('description') as string || 'Manual Charge'
  const dueDateStr = formData.get('dueDate') as string

  if (!customerId || amount <= 0) {
    return { error: 'Please enter a valid invoice amount.' }
  }

  try {
    const dueDate = dueDateStr ? new Date(dueDateStr) : new Date(new Date().setDate(new Date().getDate() + 7))
    const invoiceNumber = `INV-${Date.now().toString().slice(-7)}`

    let generatedInvoice: any = null
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { packagePlan: true }
    })

    // Atomic transaction guarantees zero balance race conditions
    await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          billingPeriod: new Date(),
          amount,
          salesTax: 0,
          totalAmount: amount,
          status: 'UNPAID',
          dueDate,
        }
      })

      generatedInvoice = invoice

      // 2. Fetch latest balance atomically
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      })

      const previousBalance = lastEntry ? Number(lastEntry.balance) : 0
      const newBalance = previousBalance + amount // Debit increases balance

      // 3. Create Ledger Debit Entry
      await tx.ledgerEntry.create({
        data: {
          customerId,
          invoiceId: invoice.id,
          refNumber: invoiceNumber,
          narration: description,
          debit: amount,
          credit: 0,
          balance: newBalance,
        },
      })
    })

    if (customer && generatedInvoice) {
      try {
        await sendInvoiceNotifications({
          customer: {
            id: customer.id,
            fullName: customer.fullName,
            contactNumber: customer.contactNumber,
            email: customer.email,
            customerCode: customer.customerCode,
          },
          invoice: generatedInvoice,
          planName: customer.packagePlan ? `${customer.packagePlan.packageTier} (${customer.packagePlan.systemSizeKw})` : undefined,
        })
      } catch (notifErr) {
        console.error('Failed to send invoice notification:', notifErr)
      }
    }

    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/ledger')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to generate manual invoice:', error)
    return { error: error.message || 'Failed to generate manual invoice.' }
  }
}

export async function toggleInvoiceStatus(invoiceId: string, currentStatus: string) {
  try {
    if (currentStatus === 'PAID') {
      return { error: 'Paid invoices cannot be reverted to Unpaid to prevent ledger corruption.' }
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })
    
    if (!invoice) throw new Error("Invoice not found")

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' }
    })

    revalidatePath(`/dashboard/customers/${invoice.customerId}`)
    revalidatePath('/dashboard/ledger')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update invoice status:', error)
    return { error: error.message || 'Failed to update invoice status.' }
  }
}

export async function deleteCustomer(customerId: string) {
  if (!customerId) return { error: 'Customer ID is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required.' }
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { fullName: true, role: true, email: true, designation: true }
  })
  const userEmail = (dbUser?.email || user.email || '').toLowerCase()
  const userRole = dbUser?.role

  if (!canUserEditCustomerProfile({ role: userRole, email: userEmail, fullName: dbUser?.fullName, designation: dbUser?.designation })) {
    return { error: 'Access denied: You do not have permission to delete customer accounts.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Delete tickets history and tickets
      const tickets = await tx.ticket.findMany({ where: { customerId }, select: { id: true } })
      const ticketIds = tickets.map(t => t.id)
      if (ticketIds.length > 0) {
        await tx.ticketHistory.deleteMany({ where: { ticketId: { in: ticketIds } } })
        await tx.ticket.deleteMany({ where: { customerId } })
      }

      // Delete ledger entries, invoices, transactions
      await tx.ledgerEntry.deleteMany({ where: { customerId } })
      await tx.invoice.deleteMany({ where: { customerId } })
      await tx.transaction.deleteMany({ where: { customerId } })

      // Delete solar system & package plan
      await tx.solarSystem.deleteMany({ where: { customerId } })
      await tx.packagePlan.deleteMany({ where: { customerId } })

      // Delete customer
      await tx.customer.delete({ where: { id: customerId } })
    })

    revalidatePath('/dashboard/customers')
    revalidatePath('/dashboard/reports')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete customer:', error)
    return { error: error.message || 'Failed to delete customer.' }
  }
}

export async function uploadEquipmentPhotos(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const inverterImagesRaw = formData.get('inverterImages') as string
  const batteryImagesRaw = formData.get('batteryImages') as string

  if (!customerId) return { error: 'Customer ID is required' }

  try {
    let inverterImages: string[] | undefined
    if (inverterImagesRaw) {
      try {
        inverterImages = JSON.parse(inverterImagesRaw)
      } catch {
        inverterImages = [inverterImagesRaw]
      }
    }

    let batteryImages: string[] | undefined
    if (batteryImagesRaw) {
      try {
        batteryImages = JSON.parse(batteryImagesRaw)
      } catch {
        batteryImages = [batteryImagesRaw]
      }
    }

    const currentSystem = await prisma.solarSystem.findUnique({
      where: { customerId }
    })

    const newInverterImages = inverterImages !== undefined
      ? Array.from(new Set([...(currentSystem?.inverterImages || []), ...inverterImages]))
      : undefined

    const newBatteryImages = batteryImages !== undefined
      ? Array.from(new Set([...(currentSystem?.batteryImages || []), ...batteryImages]))
      : undefined

    await prisma.solarSystem.upsert({
      where: { customerId },
      update: {
        ...(newInverterImages ? { inverterImages: newInverterImages } : {}),
        ...(newBatteryImages ? { batteryImages: newBatteryImages } : {}),
      },
      create: {
        customerId,
        inverterBrand: 'General',
        inverterType: 'Hybrid',
        inverterPhase: 'Three Phase',
        inverterCategory: 'Low Voltage',
        noOfInverters: 1,
        inverterSerial: 'SN-INV-' + Date.now().toString().slice(-6),
        panelBrand: 'General',
        panelType: 'Monofacial',
        panelTechnology: 'TOPCON',
        panelWattage: 585,
        noOfPanels: 10,
        totalWattage: 5850,
        batteryBrand: 'General',
        batteryType: 'Lithium',
        batteryCategory: 'Low Voltage',
        noOfBatteries: 1,
        batterySerial: 'SN-BAT-' + Date.now().toString().slice(-6),
        earthing: 'AC',
        lightningProtection: false,
        breakerName: 'MCB',
        meterType: 'Green Meter',
        zeroExportDevice: false,
        inverterImages: newInverterImages || [],
        batteryImages: newBatteryImages || [],
      }
    })

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to upload equipment photos:', error)
    return { error: error.message || 'Failed to update equipment photos.' }
  }
}



