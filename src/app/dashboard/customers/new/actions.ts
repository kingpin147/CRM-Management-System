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
  if (accountExecutiveId === '' || accountExecutiveId === 'none') accountExecutiveId = null

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

  // Solar System fields
  const disco = (formData.get('disco') as string) || 'LESCO'
  const meterType = (formData.get('meterType') as string) || 'Green Meter'
  const meterPhase = (formData.get('meterPhase') as string) || 'Three Phase'
  const zeroExportDevice = formData.get('zeroExportDevice') === 'Installed'
  const inverterBrand = (formData.get('inverterBrand') as string) || 'Solis'
  const inverterType = (formData.get('inverterType') as string) || 'Hybrid'
  const inverterPhase = (formData.get('inverterPhase') as string) || 'Three Phase'
  const inverterCategory = (formData.get('inverterCategory') as string) || 'Low Voltage'
  const inverterSize = (formData.get('inverterSize') as string) || '6kW'
  const noOfInverters = Number(formData.get('noOfInverters') || 1)
  const inverterSerial = (formData.get('inverterSerial') as string) || ''
  const inverterWarrantyEnd = parseDate(formData.get('inverterWarrantyExpiry'))
  const panelBrand = (formData.get('panelBrand') as string) || 'LONGi'
  const panelType = (formData.get('panelType') as string) || 'Monofacial'
  const panelTechnology = (formData.get('panelTechnology') as string) || 'TOPCON'
  const panelWattage = Number(formData.get('panelWattage') || 585)
  const noOfPanels = Number(formData.get('noOfPanels') || 10)
  const totalWattage = panelWattage * noOfPanels
  const panelWarrantyEnd = parseDate(formData.get('panelWarrantyExpiry'))
  const batteryCategory = (formData.get('batteryCategory') as string) || 'High Voltage'
  const batteryType = (formData.get('batteryType') as string) || 'Lithium'
  const batteryBrand = (formData.get('batteryBrand') as string) || 'Pylontech'
  const noOfBatteries = Number(formData.get('noOfBatteries') || 1)
  const batteryWarrantyEnd = parseDate(formData.get('batteryWarrantyExpiry'))
  const earthing = (formData.get('earthingType') as string) || 'AC'
  const earthingOhms = (formData.get('earthingOhms') as string) || '0.5'
  const earthingLastCheck = parseDate(formData.get('lastCheckDate'))
  const ingressProtection = (formData.get('ingressProtection') as string) || 'IP54'
  const structureType = (formData.get('structureType') as string) || 'Standard'
  const structureMaterial = (formData.get('structureMaterial') as string) || 'Pre Galvanized'
  const systemInstallationDate = parseDate(formData.get('installationDate'))

  // Installer & Audit fields
  const installerName = (formData.get('installerName') as string) || null
  const installerCompany = (formData.get('installerCompany') as string) || null
  const installerAddress = (formData.get('installerAddress') as string) || null
  const installerContact = (formData.get('installerContact') as string) || null
  const installerEmail = (formData.get('installerEmail') as string) || null
  const lastAuditDate = parseDate(formData.get('lastAuditDate'))
  const inverterStatus = (formData.get('inverterAuditStatus') as string) || 'Excellent'
  const panelStatus = (formData.get('panelAuditStatus') as string) || 'Excellent'
  const batteryStatus = (formData.get('batteryAuditStatus') as string) || 'Excellent'
  const structureStatus = (formData.get('structureAuditStatus') as string) || 'Excellent'
  const cableStatus = (formData.get('cableAuditStatus') as string) || 'Excellent'
  const earthingStatus = (formData.get('earthingAuditStatus') as string) || 'Excellent'
  const breakerStatus = (formData.get('breakersAuditStatus') as string) || 'Excellent'

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
        activationDate: activationDate,
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
            nextBillingDate,
          }
        },
        solarSystem: {
          create: {
            disco,
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
            batterySerial: 'BAT-SERIAL',
            batteryWarrantyEnd,
            earthing,
            earthingLastCheck,
            earthingAcOhms: Number(earthingOhms) || 0.5,
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
            breakerName: 'Standard Breaker',
            lightningProtection: true,
          }
        },
        ledgerEntries: totalAmount > 0 ? {
          create: [
            {
              narration: `Initial Package Subscription (${packageTier} ${systemSizeKw})${onboardingFee > 0 ? ' + On-Boarding Fee (PKR 3,000)' : ''}`,
              refNumber: customerCode,
              debit: totalAmount,
              credit: 0,
              balance: totalAmount,
            },
            ...(paidAmount > 0 ? [{
              narration: `Advance Payment Received`,
              refNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
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
    if (error.code === 'P2002') {
      return { error: 'A customer with this CNIC already exists.' }
    }
    return { error: error.message || 'Failed to create customer.' }
  }
}
