'use server'

import { revalidatePath } from 'next/cache'
import { CustomerType, CustomerStatus } from '@prisma/client'
import prisma from '@/lib/prisma'

async function generateCustomerCode(): Promise<string> {
  // Generate digits-only Customer ID (e.g. 9742)
  for (let i = 0; i < 20; i++) {
    const digits = Math.floor(1000 + Math.random() * 9000).toString()
    const existing = await prisma.customer.findUnique({
      where: { customerCode: digits }
    })
    if (!existing) return digits
  }
  // Fallback to 5-digit number
  return Math.floor(10000 + Math.random() * 90000).toString()
}

function parseDate(value: any): Date | null {
  if (!value || typeof value !== 'string') return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export async function createCustomer(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const customerType = (formData.get('customerType') as CustomerType) || CustomerType.RESIDENTIAL
  const contactNumber = formData.get('contactNumber') as string
  const email = (formData.get('email') as string) || null
  const cnic = formData.get('cnic') as string
  const cnicExpiry = parseDate(formData.get('cnicExpiry'))
  const houseNumber = (formData.get('houseNo') as string) || null
  const streetNumber = (formData.get('streetNo') as string) || null
  const block = (formData.get('block') as string) || null
  const subArea = (formData.get('subArea') as string) || null
  const area = (formData.get('area') as string) || null
  const city = formData.get('city') as string
  const country = (formData.get('country') as string) || 'Pakistan'
  const address = formData.get('address') as string
  const signUpDate = parseDate(formData.get('signUpDate')) || new Date()
  const activationDate = parseDate(formData.get('activationDate'))
  const cnicFrontUrl = (formData.get('cnicFrontUrl') as string) || null
  const cnicBackUrl = (formData.get('cnicBackUrl') as string) || null

  let accountExecutiveId = formData.get('accountExecutiveId') as string | null
  if (!accountExecutiveId || accountExecutiveId === '' || accountExecutiveId === 'none' || accountExecutiveId === 'undefined') {
    accountExecutiveId = null
  } else if (accountExecutiveId) {
    try {
      const userExists = await prisma.user.findUnique({ where: { id: accountExecutiveId } })
      if (!userExists) accountExecutiveId = null
    } catch {
      accountExecutiveId = null
    }
  }

  // Package fields
  const systemSizeKw = (formData.get('systemSizeKw') as string) || '10-20 kW'
  const packageTier = (formData.get('packageTier') as string) || 'Comprehensive'
  const billingType = (formData.get('billingType') as string) || 'Yearly'
  const monitoringTime = (formData.get('monitoringTime') as string) || '24 Hours'
  const monthlyBasePrice = Number(formData.get('monthlyBasePrice') || 0)
  const appliedDiscount = Number(formData.get('appliedDiscount') || 0)
  const salesTaxAmount = Number(formData.get('salesTaxAmount') || 0)
  const onboardingFee = Number(formData.get('onboardingFee') || 0)
  const totalAmount = Number(formData.get('totalAmount') || 0)
  const paidAmount = Number(formData.get('paidAmount') || 0)

  // Solar System fields (Blank/null when not provided)
  const disco = (formData.get('disco') as string) || null
  const discoRefNo = (formData.get('discoRefNo') as string) || null
  const meterType = (formData.get('meterType') as string) || ''
  const meterPhase = (formData.get('meterPhase') as string) || null
  const zeroExportDevice = formData.get('zeroExportDevice') === 'Installed' || formData.get('zeroExportDevice') === 'true'
  const inverterBrand = (formData.get('inverterBrand') as string) || ''
  const inverterType = (formData.get('inverterType') as string) || ''
  const inverterPhase = (formData.get('inverterPhase') as string) || ''
  const inverterCategory = (formData.get('inverterCategory') as string) || ''
  const inverterSize = (formData.get('inverterSize') as string) || null
  const noOfInverters = Number(formData.get('noOfInverters') || 0)
  const inverterSerial = (formData.get('inverterSerial') as string) || ''
  const inverterWarrantyEnd = parseDate(formData.get('inverterWarrantyExpiry'))
  const panelBrand = (formData.get('panelBrand') as string) || ''
  const panelType = (formData.get('panelType') as string) || ''
  const panelTechnology = (formData.get('panelTechnology') as string) || ''
  const panelWattage = Number(formData.get('panelWattage') || 0)
  const noOfPanels = Number(formData.get('noOfPanels') || 0)
  const totalWattage = panelWattage * noOfPanels
  const panelWarrantyEnd = parseDate(formData.get('panelWarrantyExpiry'))
  const batteryCategory = (formData.get('batteryCategory') as string) || ''
  const batteryType = (formData.get('batteryType') as string) || ''
  const batteryBrand = (formData.get('batteryBrand') as string) || ''
  const noOfBatteries = Number(formData.get('noOfBatteries') || 0)
  const batterySerial = (formData.get('batterySerial') as string) || ''
  const batteryWarrantyEnd = parseDate(formData.get('batteryWarrantyExpiry'))
  const earthing = (formData.get('earthingType') as string) || ''
  const earthingOhmsRaw = formData.get('earthingOhms') ? String(formData.get('earthingOhms')) : null
  const earthingAcOhms = earthingOhmsRaw && Number(earthingOhmsRaw) > 0 ? Number(earthingOhmsRaw) : null
  const earthingLastCheck = parseDate(formData.get('lastCheckDate'))
  const ingressProtection = (formData.get('ingressProtection') as string) || null
  const structureType = (formData.get('structureType') as string) || null
  const structureMaterial = (formData.get('structureMaterial') as string) || null
  const systemInstallationDate = parseDate(formData.get('installationDate'))

  // Installer & Audit fields
  const installerName = (formData.get('installerName') as string) || null
  const installerCompany = (formData.get('installerCompany') as string) || null
  const installerAddress = (formData.get('installerAddress') as string) || null
  const installerContact = (formData.get('installerContact') as string) || null
  const installerEmail = (formData.get('installerEmail') as string) || null
  const lastAuditDate = parseDate(formData.get('lastAuditDate'))
  const inverterStatus = (formData.get('inverterAuditStatus') as string) || null
  const panelStatus = (formData.get('panelAuditStatus') as string) || null
  const batteryStatus = (formData.get('batteryAuditStatus') as string) || null
  const structureStatus = (formData.get('structureAuditStatus') as string) || null
  const cableStatus = (formData.get('cableAuditStatus') as string) || null
  const earthingStatus = (formData.get('earthingAuditStatus') as string) || null
  const breakerStatus = (formData.get('breakersAuditStatus') as string) || null

  let inverterImages: string[] = []
  const inverterImagesRaw = formData.get('inverterImages')
  if (inverterImagesRaw && typeof inverterImagesRaw === 'string') {
    try {
      inverterImages = JSON.parse(inverterImagesRaw)
    } catch {
      inverterImages = [inverterImagesRaw]
    }
  }

  let batteryImages: string[] = []
  const batteryImagesRaw = formData.get('batteryImages')
  if (batteryImagesRaw && typeof batteryImagesRaw === 'string') {
    try {
      batteryImages = JSON.parse(batteryImagesRaw)
    } catch {
      batteryImages = [batteryImagesRaw]
    }
  }

  try {
    const customerCode = await generateCustomerCode()
    const crfNumber = `CRF-${Math.floor(100000 + Math.random() * 900000)}`

    let nextBillingDate = new Date()
    if (billingType === 'Monthly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    else if (billingType === 'Quarterly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
    else if (billingType === 'Half Yearly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 6)
    else if (billingType === 'Yearly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 12)

    const newCustomer = await prisma.customer.create({
      data: {
        customerCode,
        crfNumber,
        fullName,
        customerType,
        contactNumber,
        email,
        cnic,
        cnicExpiry,
        cnicFrontUrl,
        cnicBackUrl,
        houseNumber,
        streetNumber,
        block,
        subArea,
        area,
        address,
        city,
        country,
        status: CustomerStatus.SIGNUP_GENERATED,
        signupDate: signUpDate,
        activationDate: null,
        accountExecutiveId,
        packagePlan: {
          create: {
            systemSizeKw,
            packageTier,
            billingType,
            monitoringTime,
            monthlyBasePrice,
            appliedDiscount,
            salesTaxAmount,
            totalAmount,
            nextBillingDate: null,
          }
        },
        solarSystem: {
          create: {
            disco,
            discoRefNo,
            meterType,
            meterPhase,
            zeroExportDevice,
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
            batteryCategory,
            batteryType,
            batteryBrand,
            noOfBatteries,
            batterySerial,
            batteryWarrantyEnd,
            earthing,
            earthingLastCheck,
            earthingAcOhms,
            ingressProtection,
            structureType,
            structureMaterial,
            systemInstallationDate,
            installerName,
            installerCompany,
            installerAddress,
            installerContact,
            installerEmail,
            lastAuditDate,
            inverterStatus,
            panelStatus,
            batteryStatus,
            structureStatus,
            cableStatus,
            earthingStatus,
            breakerStatus,
            breakerName: (formData.get('breakerName') as string) || '',
            lightningProtection: formData.get('lightningProtection') === 'true' || formData.get('lightningProtection') === 'Installed',
            inverterImages,
            batteryImages,
          }
        },
        invoices: totalAmount > 0 ? {
          create: [
            {
              invoiceNumber: `INV-${customerCode.replace(/^[A-Za-z]+-/, '')}`,
              billingPeriod: signUpDate || new Date(),
              amount: totalAmount,
              salesTax: salesTaxAmount,
              totalAmount,
              status: paidAmount >= totalAmount ? 'PAID' : 'UNPAID',
              dueDate: nextBillingDate,
            }
          ]
        } : undefined,
        ledgerEntries: totalAmount > 0 ? {
          create: [
            {
              narration: `Initial Package Subscription (${packageTier} ${systemSizeKw})${onboardingFee > 0 ? ' + On-Boarding Fee (PKR 3,000)' : ''}`,
              refNumber: `INV-${customerCode.replace(/^[A-Za-z]+-/, '')}`,
              debit: totalAmount,
              credit: 0,
              balance: totalAmount,
            },
            ...(paidAmount > 0 ? [{
              narration: `Advance Payment Received`,
              refNumber: `PRV-${Math.floor(100000 + Math.random() * 900000)}`,
              debit: 0,
              credit: paidAmount,
              balance: Math.max(0, totalAmount - paidAmount),
            }] : [])
          ]
        } : undefined
      }
    })

    revalidatePath('/dashboard/customers')
    revalidatePath('/dashboard/reports')
    return { success: true, customerId: newCustomer.id }
  } catch (error: any) {
    console.error('Database/Server error in createCustomer:', error)
    if (error.code === 'P2002') {
      return { error: 'A customer with this CNIC or Customer Code already exists in the system.' }
    }
    return { error: `Server error (${error.message || 'Database transaction failed'}). Please contact site administrator.` }
  }
}
