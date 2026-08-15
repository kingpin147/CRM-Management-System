'use server'

import { revalidatePath } from 'next/cache'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createPackagePlan(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const systemSizeKw = formData.get('systemSizeKw') as string
  const packageTier = formData.get('packageTier') as string
  const billingType = formData.get('billingType') as string
  const monitoringTime = formData.get('monitoringTime') as string
  const monthlyBasePrice = Number(formData.get('monthlyBasePrice'))
  const appliedDiscount = Number(formData.get('appliedDiscount'))
  
  const salesTaxAmount = 0 // Will be handled if applicable
  const totalAmount = monthlyBasePrice * (1 - appliedDiscount / 100)

  try {
    await prisma.packagePlan.upsert({
      where: { customerId },
      update: {
        systemSizeKw,
        packageTier,
        billingType,
        monitoringTime,
        monthlyBasePrice,
        appliedDiscount,
        salesTaxAmount,
        totalAmount
      },
      create: {
        customerId,
        systemSizeKw,
        packageTier,
        billingType,
        monitoringTime,
        monthlyBasePrice,
        appliedDiscount,
        salesTaxAmount,
        totalAmount
      }
    })

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to create package plan.' }
  }
}
