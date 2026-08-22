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
        role: { in: ['INSTALLATION', 'OM_MANAGER', 'SUPER_ADMIN'] },
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
    if (inverterBrand || inverterSize || panelBrand || panelQuantityStr || batteryBrand || batteryQtyStr || earthingAcOhmsStr || earthingDcOhmsStr) {
      const pQty = panelQuantityStr !== '' && panelQuantityStr !== null ? parseInt(panelQuantityStr, 10) : undefined
      const bQty = batteryQtyStr !== '' && batteryQtyStr !== null ? parseInt(batteryQtyStr, 10) : undefined
      const acOhms = earthingAcOhmsStr !== '' && earthingAcOhmsStr !== null ? parseFloat(earthingAcOhmsStr) : undefined
      const dcOhms = earthingDcOhmsStr !== '' && earthingDcOhmsStr !== null ? parseFloat(earthingDcOhmsStr) : undefined

      await prisma.solarSystem.upsert({
        where: { customerId },
        create: {
          customerId,
          meterType: 'Green Meter',
          zeroExportDevice: false,
          inverterBrand: inverterBrand || '',
          inverterType: 'OnGrid',
          inverterPhase: 'Three',
          inverterCategory: 'Low Voltage',
          inverterSize: inverterSize || '',
          noOfInverters: 1,
          inverterSerial: '',
          panelBrand: panelBrand || '',
          panelType: 'Bifacial',
          panelTechnology: 'Mono Perc',
          panelWattage: 550,
          noOfPanels: pQty || 0,
          totalWattage: (pQty || 0) * 550,
          batteryCategory: 'Low Voltage',
          batteryType: 'Lithium',
          batteryBrand: batteryBrand || '',
          noOfBatteries: bQty || 0,
          batterySerial: '',
          earthing: 'Both',
          earthingAcOhms: acOhms || 0,
          earthingDcOhms: dcOhms || 0,
          lightningProtection: false,
          breakerName: 'Schneider / ABB',
        },
        update: {
          inverterBrand,
          inverterSize,
          panelBrand,
          noOfPanels: pQty,
          batteryBrand,
          noOfBatteries: bQty,
          earthingAcOhms: acOhms,
          earthingDcOhms: dcOhms,
        }
      })
    }

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
