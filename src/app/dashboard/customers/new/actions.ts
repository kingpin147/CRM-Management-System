'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CustomerType, CustomerStatus } from '@prisma/client'
import prisma from '@/lib/prisma'

// Simple helper to generate a unique customer code
function generateCustomerCode(type: CustomerType) {
  const prefix = type === 'RESIDENTIAL' ? 'RES' : type === 'CORPORATE' ? 'COR' : 'IND'
  const randomPart = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${randomPart}`
}

export async function createCustomer(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const customerType = formData.get('customerType') as CustomerType
  const contactNumber = formData.get('contactNumber') as string
  const email = formData.get('email') as string | null
  const cnic = formData.get('cnic') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const block = formData.get('block') as string | null
  const cnicFrontUrl = formData.get('cnicFrontUrl') as string | null
  const cnicBackUrl = formData.get('cnicBackUrl') as string | null
  
  let accountExecutiveId = formData.get('accountExecutiveId') as string | null
  if (accountExecutiveId === '') accountExecutiveId = null

  try {
    const customerCode = generateCustomerCode(customerType)

    const newCustomer = await prisma.customer.create({
      data: {
        customerCode,
        fullName,
        customerType,
        contactNumber,
        email,
        cnic,
        cnicFrontUrl,
        cnicBackUrl,
        address,
        city,
        block,
        status: CustomerStatus.SIGNUP_GENERATED,
        signupDate: new Date(),
        accountExecutiveId,
      }
    })

    revalidatePath('/dashboard/customers')
    return { success: true, customerId: newCustomer.id }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'A customer with this CNIC already exists.' }
    }
    return { error: error.message || 'Failed to create customer.' }
  }
}
