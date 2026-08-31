import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ManagerApprovalView } from './ManagerApprovalView'

// Re-evaluated Prisma schema
export default async function PendingSalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dbUser = user ? await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } }) : null
  const userRole = dbUser?.role || ''

  // Fetch all customer sales in pending pipeline stages and available installer users
  const [rawPendingCustomers, rawInstallers] = await Promise.all([
    prisma.customer.findMany({
      where: {
        status: {
          in: [
            'SIGNUP_GENERATED',
            'PENDING_PAYMENT_VERIFICATION',
            'PENDING_ACTIVATION',
          ]
        }
      },
      include: {
        packagePlan: true,
        solarSystem: true,
        accountExecutive: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { signupDate: 'desc' }
    }),
    prisma.user.findMany({
      where: {
        role: { in: ['INSTALLATION', 'OM_MANAGER'] },
        isActive: true
      },
      select: { id: true, fullName: true, role: true, email: true },
      orderBy: { fullName: 'asc' }
    })
  ])

  // Sanitize Prisma types and map assigned installer details
  const installerMap = new Map(rawInstallers.map(i => [i.id, i]))
  const pendingCustomers = JSON.parse(JSON.stringify(rawPendingCustomers)).map((c: any) => ({
    ...c,
    assignedInstaller: c.assignedInstallerId ? installerMap.get(c.assignedInstallerId) || null : null
  }))
  const installers = JSON.parse(JSON.stringify(rawInstallers))

  // Action for advancing workflow status across stages
  async function advanceWorkflow(formData: FormData) {
    'use server'
    const customerId = formData.get('customerId') as string
    const currentStatus = formData.get('currentStatus') as string

    let nextStatus = currentStatus
    if (currentStatus === 'SIGNUP_GENERATED') {
      nextStatus = 'PENDING_PAYMENT_VERIFICATION' // Approved by Sales Manager -> Sent to Billing Manager
    } else if (currentStatus === 'PENDING_PAYMENT_VERIFICATION') {
      nextStatus = 'PENDING_ACTIVATION' // Payment verified by Billing Manager -> Sent to O&M Manager
    } else if (currentStatus === 'PENDING_ACTIVATION') {
      nextStatus = 'CONNECTION_ACTIVE' // Approved by O&M Manager -> Active Connection
    }

    const isActivating = nextStatus === 'CONNECTION_ACTIVE'
    const activationDate = isActivating ? new Date() : undefined

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { packagePlan: true }
    })

    let nextBillingDate: Date | undefined
    if (isActivating && customer?.packagePlan) {
      const bType = customer.packagePlan.billingType || 'Monthly'
      nextBillingDate = new Date(activationDate!)
      if (bType === 'Quarterly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
      else if (bType === 'Half Yearly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 6)
      else if (bType === 'Yearly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 12)
      else nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: { 
        status: nextStatus as any,
        ...(isActivating ? { activationDate } : {}),
        ...(isActivating && nextBillingDate ? {
          packagePlan: {
            update: {
              nextBillingDate
            }
          }
        } : {})
      }
    })

    revalidatePath('/dashboard/sales/pending')
    revalidatePath('/dashboard/customers')
  }

  // Action for updating CRF details and optionally advancing workflow
  async function updateCrfAndAdvance(formData: FormData) {
    'use server'
    const customerId = formData.get('customerId') as string
    const currentStatus = formData.get('currentStatus') as string
    const shouldAdvance = formData.get('shouldAdvance') === 'true'

    // Customer basic fields
    const fullName = (formData.get('fullName') as string) || undefined
    const cnic = (formData.get('cnic') as string) || undefined
    const contactNumber = (formData.get('contactNumber') as string) || undefined
    const email = (formData.get('email') as string) || undefined
    const address = (formData.get('address') as string) || undefined
    const block = (formData.get('block') as string) || undefined
    const area = (formData.get('area') as string) || undefined
    const city = (formData.get('city') as string) || undefined
    const coordinates = (formData.get('coordinates') as string) || undefined

    // Package fields
    const systemSizeKw = (formData.get('systemSizeKw') as string) || undefined
    const packageTier = (formData.get('packageTier') as string) || undefined
    const billingType = (formData.get('billingType') as string) || undefined
    const monitoringTime = (formData.get('monitoringTime') as string) || undefined
    const monthlyBasePrice = formData.get('monthlyBasePrice') ? Number(formData.get('monthlyBasePrice')) : undefined
    const appliedDiscount = formData.get('appliedDiscount') ? Number(formData.get('appliedDiscount')) : undefined
    const salesTaxAmount = formData.get('salesTaxAmount') ? Number(formData.get('salesTaxAmount')) : undefined
    const totalAmount = formData.get('totalAmount') ? Number(formData.get('totalAmount')) : undefined

    // Solar system fields
    const inverterBrand = (formData.get('inverterBrand') as string) || undefined
    const inverterSize = (formData.get('inverterSize') as string) || undefined
    const panelBrand = (formData.get('panelBrand') as string) || undefined
    const panelQuantityStr = formData.get('panelQuantity') as string
    const batteryBrand = (formData.get('batteryBrand') as string) || undefined
    const batteryQtyStr = formData.get('batteryQty') as string
    const earthingAcOhmsStr = formData.get('earthingAcOhms') as string
    const earthingDcOhmsStr = formData.get('earthingDcOhms') as string

    const meterType = (formData.get('meterType') as string) || undefined
    const meterPhase = (formData.get('meterPhase') as string) || undefined
    const zeroExportDevice = formData.get('zeroExportDevice') === 'Yes' ? true : formData.get('zeroExportDevice') === 'No' ? false : undefined
    const disco = (formData.get('disco') as string) || undefined
    const discoRefNo = (formData.get('discoRefNo') as string) || undefined
    
    const inverterType = (formData.get('inverterType') as string) || undefined
    const inverterPhase = (formData.get('inverterPhase') as string) || undefined
    const inverterCategory = (formData.get('inverterCategory') as string) || undefined
    const noOfInvertersStr = formData.get('noOfInverters') as string
    const inverterSerial = (formData.get('inverterSerial') as string) || undefined
    const inverterWarrantyEndStr = formData.get('inverterWarrantyEnd') as string

    const panelType = (formData.get('panelType') as string) || undefined
    const panelTechnology = (formData.get('panelTechnology') as string) || undefined
    const panelWattageStr = formData.get('panelWattage') as string
    const panelWarrantyEndStr = formData.get('panelWarrantyEnd') as string

    const batteryCategory = (formData.get('batteryCategory') as string) || undefined
    const batteryType = (formData.get('batteryType') as string) || undefined
    const batterySerial = (formData.get('batterySerial') as string) || undefined
    const batteryWarrantyEndStr = formData.get('batteryWarrantyEnd') as string

    const earthingType = (formData.get('earthingType') as string) || undefined
    const lightningProtection = formData.get('lightningProtection') === 'Yes' ? true : formData.get('lightningProtection') === 'No' ? false : undefined
    const breakerName = (formData.get('breakerName') as string) || undefined
    const ingressProtection = (formData.get('ingressProtection') as string) || undefined
    const structureType = (formData.get('structureType') as string) || undefined
    const structureMaterial = (formData.get('structureMaterial') as string) || undefined
    const systemInstallationDateStr = formData.get('systemInstallationDate') as string
    
    const installerName = (formData.get('installerName') as string) || undefined
    const installerCompany = (formData.get('installerCompany') as string) || undefined
    const installerAddress = (formData.get('installerAddress') as string) || undefined
    const installerContact = (formData.get('installerContact') as string) || undefined
    const installerEmail = (formData.get('installerEmail') as string) || undefined
    
    const lastAuditDateStr = formData.get('lastAuditDate') as string
    const inverterStatus = (formData.get('inverterStatus') as string) || undefined
    const panelStatus = (formData.get('panelStatus') as string) || undefined
    const batteryStatus = (formData.get('batteryStatus') as string) || undefined
    const structureStatus = (formData.get('structureStatus') as string) || undefined
    const cableStatus = (formData.get('cableStatus') as string) || undefined
    const earthingStatus = (formData.get('earthingStatus') as string) || undefined
    const breakerStatus = (formData.get('breakerStatus') as string) || undefined

    let nextStatus = currentStatus
    if (shouldAdvance) {
      if (currentStatus === 'SIGNUP_GENERATED') {
        nextStatus = 'PENDING_PAYMENT_VERIFICATION' // Sales Manager Approval
      } else if (currentStatus === 'PENDING_PAYMENT_VERIFICATION') {
        nextStatus = 'PENDING_ACTIVATION' // Billing Manager Approval
      } else if (currentStatus === 'PENDING_ACTIVATION') {
        nextStatus = 'CONNECTION_ACTIVE' // O&M Manager Approval
      }
    }

    const assignedInstallerId = (formData.get('assignedInstallerId') as string) || undefined
    const isActivating = nextStatus === 'CONNECTION_ACTIVE'
    const activationDate = isActivating ? new Date() : undefined

    let calculatedNextBillingDate: Date | undefined
    if (isActivating) {
      const bType = billingType || 'Monthly'
      calculatedNextBillingDate = new Date(activationDate!)
      if (bType === 'Quarterly') calculatedNextBillingDate.setMonth(calculatedNextBillingDate.getMonth() + 3)
      else if (bType === 'Half Yearly') calculatedNextBillingDate.setMonth(calculatedNextBillingDate.getMonth() + 6)
      else if (bType === 'Yearly') calculatedNextBillingDate.setMonth(calculatedNextBillingDate.getMonth() + 12)
      else calculatedNextBillingDate.setMonth(calculatedNextBillingDate.getMonth() + 1)
    }

    // 1. Update Customer
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName,
        cnic,
        contactNumber,
        email,
        address,
        block,
        area,
        city,
        coordinates,
        assignedInstallerId,
        status: nextStatus as any,
        ...(isActivating ? { activationDate } : {})
      }
    })

    // 2. Upsert Package Plan
    if (systemSizeKw || packageTier || billingType || monitoringTime || calculatedNextBillingDate || totalAmount !== undefined) {
      await prisma.packagePlan.upsert({
        where: { customerId },
        create: {
          customerId,
          systemSizeKw: systemSizeKw || '1-10 kW',
          packageTier: packageTier || 'Basic',
          billingType: billingType || 'Monthly',
          monitoringTime: monitoringTime || '12 Hours',
          monthlyBasePrice: monthlyBasePrice ?? 0,
          appliedDiscount: appliedDiscount ?? 0,
          salesTaxAmount: salesTaxAmount ?? 0,
          totalAmount: totalAmount ?? 0,
          nextBillingDate: calculatedNextBillingDate,
        },
        update: {
          systemSizeKw,
          packageTier,
          billingType,
          monitoringTime,
          ...(monthlyBasePrice !== undefined ? { monthlyBasePrice } : {}),
          ...(appliedDiscount !== undefined ? { appliedDiscount } : {}),
          ...(salesTaxAmount !== undefined ? { salesTaxAmount } : {}),
          ...(totalAmount !== undefined ? { totalAmount } : {}),
          ...(calculatedNextBillingDate ? { nextBillingDate: calculatedNextBillingDate } : {})
        }
      })
    }

    // 3. Upsert Solar System
    const pQty = panelQuantityStr !== '' && panelQuantityStr !== null ? parseInt(panelQuantityStr, 10) : undefined
    const bQty = batteryQtyStr !== '' && batteryQtyStr !== null ? parseInt(batteryQtyStr, 10) : undefined
    const acOhms = earthingAcOhmsStr !== '' && earthingAcOhmsStr !== null ? parseFloat(earthingAcOhmsStr) : undefined
    const dcOhms = earthingDcOhmsStr !== '' && earthingDcOhmsStr !== null ? parseFloat(earthingDcOhmsStr) : undefined
    const pWatt = panelWattageStr !== '' && panelWattageStr !== null ? parseInt(panelWattageStr, 10) : undefined
    const invCount = noOfInvertersStr !== '' && noOfInvertersStr !== null ? parseInt(noOfInvertersStr, 10) : undefined
    
    const invWarrantyEnd = inverterWarrantyEndStr ? new Date(inverterWarrantyEndStr) : undefined
    const panWarrantyEnd = panelWarrantyEndStr ? new Date(panelWarrantyEndStr) : undefined
    const batWarrantyEnd = batteryWarrantyEndStr ? new Date(batteryWarrantyEndStr) : undefined
    const sysInstDate = systemInstallationDateStr ? new Date(systemInstallationDateStr) : undefined
    const lastAuditDt = lastAuditDateStr ? new Date(lastAuditDateStr) : undefined

    await prisma.solarSystem.upsert({
      where: { customerId },
      create: {
        customerId,
        meterType: meterType || 'Green Meter',
        meterPhase: meterPhase,
        zeroExportDevice: zeroExportDevice ?? false,
        disco: disco,
        discoRefNo: discoRefNo,
        
        inverterBrand: inverterBrand || '',
        inverterType: inverterType || 'OnGrid',
        inverterPhase: inverterPhase || 'Three',
        inverterCategory: inverterCategory || 'Low Voltage',
        inverterSize: inverterSize || '',
        noOfInverters: invCount || 1,
        inverterSerial: inverterSerial || '',
        inverterWarrantyEnd: invWarrantyEnd,
        
        panelBrand: panelBrand || '',
        panelType: panelType || 'Bifacial',
        panelTechnology: panelTechnology || 'Mono Perc',
        panelWattage: pWatt || 550,
        noOfPanels: pQty || 0,
        totalWattage: (pQty || 0) * (pWatt || 550),
        panelWarrantyEnd: panWarrantyEnd,
        
        batteryCategory: batteryCategory || 'Low Voltage',
        batteryType: batteryType || 'Lithium',
        batteryBrand: batteryBrand || '',
        noOfBatteries: bQty || 0,
        batterySerial: batterySerial || '',
        batteryWarrantyEnd: batWarrantyEnd,
        
        earthing: earthingType || 'Both',
        earthingAcOhms: acOhms || 0,
        earthingDcOhms: dcOhms || 0,
        lightningProtection: lightningProtection ?? false,
        breakerName: breakerName || 'Schneider / ABB',
        ingressProtection: ingressProtection,
        structureType: structureType,
        structureMaterial: structureMaterial,
        systemInstallationDate: sysInstDate,
        
        installerName: installerName,
        installerCompany: installerCompany,
        installerAddress: installerAddress,
        installerContact: installerContact,
        installerEmail: installerEmail,
        
        lastAuditDate: lastAuditDt,
        inverterStatus: inverterStatus,
        panelStatus: panelStatus,
        batteryStatus: batteryStatus,
        structureStatus: structureStatus,
        cableStatus: cableStatus,
        earthingStatus: earthingStatus,
        breakerStatus: breakerStatus
      },
      update: {
        meterType,
        meterPhase,
        ...(zeroExportDevice !== undefined ? { zeroExportDevice } : {}),
        disco,
        discoRefNo,
        
        inverterBrand,
        inverterType,
        inverterPhase,
        inverterCategory,
        inverterSize,
        ...(invCount !== undefined ? { noOfInverters: invCount } : {}),
        inverterSerial,
        ...(invWarrantyEnd !== undefined ? { inverterWarrantyEnd: invWarrantyEnd } : {}),
        
        panelBrand,
        panelType,
        panelTechnology,
        ...(pWatt !== undefined ? { panelWattage: pWatt } : {}),
        ...(pQty !== undefined ? { noOfPanels: pQty } : {}),
        ...(pQty !== undefined && pWatt !== undefined ? { totalWattage: pQty * pWatt } : {}),
        ...(panWarrantyEnd !== undefined ? { panelWarrantyEnd: panWarrantyEnd } : {}),
        
        batteryCategory,
        batteryType,
        batteryBrand,
        ...(bQty !== undefined ? { noOfBatteries: bQty } : {}),
        batterySerial,
        ...(batWarrantyEnd !== undefined ? { batteryWarrantyEnd: batWarrantyEnd } : {}),
        
        ...(earthingType !== undefined ? { earthing: earthingType } : {}),
        ...(acOhms !== undefined ? { earthingAcOhms: acOhms } : {}),
        ...(dcOhms !== undefined ? { earthingDcOhms: dcOhms } : {}),
        ...(lightningProtection !== undefined ? { lightningProtection } : {}),
        breakerName,
        ingressProtection,
        structureType,
        structureMaterial,
        ...(sysInstDate !== undefined ? { systemInstallationDate: sysInstDate } : {}),
        
        installerName,
        installerCompany,
        installerAddress,
        installerContact,
        installerEmail,
        
        ...(lastAuditDt !== undefined ? { lastAuditDate: lastAuditDt } : {}),
        inverterStatus,
        panelStatus,
        batteryStatus,
        structureStatus,
        cableStatus,
        earthingStatus,
        breakerStatus
      }
    })

    revalidatePath('/dashboard/sales/pending')
    revalidatePath('/dashboard/customers')
    revalidatePath(`/dashboard/customers/${customerId}`)
  }

  return (
    <ManagerApprovalView 
      customers={pendingCustomers}
      installers={installers}
      userRole={userRole}
      onAdvanceWorkflow={advanceWorkflow}
      onUpdateCrfWorkflow={updateCrfAndAdvance}
    />
  )
}
