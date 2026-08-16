'use server'

import { revalidatePath } from 'next/cache'
import { CustomerStatus, CustomerType } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function updateCustomer(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const fullName = formData.get('fullName') as string
  const contactNumber = formData.get('contactNumber') as string
  const email = formData.get('email') as string || null
  const cnic = formData.get('cnic') as string
  const customerType = formData.get('customerType') as CustomerType
  const status = formData.get('status') as CustomerStatus
  const address = formData.get('address') as string
  const city = formData.get('city') as string || 'Islamabad'
  const houseNumber = formData.get('houseNumber') as string || null
  const streetNumber = formData.get('streetNumber') as string || null
  const block = formData.get('block') as string || null
  const area = formData.get('area') as string || null

  if (!customerId || !fullName || !contactNumber || !cnic) {
    return { error: 'Full Name, Contact Number, and CNIC are required.' }
  }

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName,
        contactNumber,
        email,
        cnic,
        customerType,
        status,
        address,
        city,
        houseNumber,
        streetNumber,
        block,
        area,
      },
    })

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
  const systemSizeKw = formData.get('systemSizeKw') as string
  const packageTier = formData.get('packageTier') as string
  const billingType = formData.get('billingType') as string
  const monitoringTime = formData.get('monitoringTime') as string
  const monthlyBasePrice = Number(formData.get('monthlyBasePrice'))
  const appliedDiscount = Number(formData.get('appliedDiscount'))
  
  const salesTaxAmount = 0
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
