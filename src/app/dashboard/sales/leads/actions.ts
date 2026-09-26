'use server'

import { revalidatePath } from 'next/cache'
import { CustomerType, CustomerStatus, TicketType, TicketStatus } from '@prisma/client'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

async function generateCustomerCode(): Promise<string> {
  const existingCustomers = await prisma.customer.findMany({
    select: { customerCode: true }
  })
  
  const existingCodes = new Set(
    existingCustomers
      .map(c => c.customerCode?.trim())
      .filter(Boolean)
  )

  let nextNum = 101
  while (existingCodes.has(nextNum.toString())) {
    nextNum++
  }
  return nextNum.toString()
}

function generateTicketNumber(): string {
  const rand = Math.floor(1000000 + Math.random() * 9000000)
  return `T-${rand}`
}

export async function createSalesLead(formData: FormData) {
  const fullName = (formData.get('fullName') as string || '').trim()
  const contactNumber = (formData.get('contactNumber') as string || '').trim()
  const address = (formData.get('address') as string || '').trim()
  const solarSystemSize = (formData.get('solarSystemSize') as string || '').trim() || '10-20 kW'
  const city = (formData.get('city') as string || '').trim() || 'Lahore'
  const sourceOfLead = (formData.get('sourceOfLead') as string || '').trim() || 'Website'

  if (!fullName) return { error: 'Customer Name is required.' }
  if (!contactNumber) return { error: 'Contact Number is required.' }
  if (!address) return { error: 'Address is required.' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const dbUser = user ? await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: user.id },
          ...(user.email ? [{ email: { equals: user.email, mode: 'insensitive' as const } }] : [])
        ]
      }
    }) : null

    const creatorName = dbUser?.fullName || user?.email?.split('@')[0] || 'Sales Executive'
    const accountExecutiveId = dbUser?.role === 'SALES' || dbUser?.role === 'SALES_MANAGER' ? dbUser.id : null

    const customerCode = await generateCustomerCode()
    const crfNumber = `CRF-${customerCode}`

    // 1. Create Customer Record
    const customer = await prisma.customer.create({
      data: {
        customerCode,
        fullName,
        contactNumber,
        address,
        city,
        country: 'Pakistan',
        status: CustomerStatus.SIGNUP_GENERATED,
        customerType: CustomerType.RESIDENTIAL,
        signupDate: new Date(),
        crfNumber,
        accountExecutiveId,
        solarSystem: {
          create: {
            disco: 'LESCO',
            meterType: 'Non Green',
            zeroExportDevice: false,
            inverterBrand: 'Standard',
            inverterType: 'Hybrid',
            inverterPhase: 'Single',
            inverterCategory: 'Low Voltage',
            inverterSize: solarSystemSize,
            noOfInverters: 1,
            inverterSerial: 'PENDING',
            panelBrand: 'Standard',
            panelType: 'Monofacial',
            panelTechnology: 'Mono Perc',
            panelWattage: 580,
            noOfPanels: 10,
            totalWattage: 5800,
            batteryCategory: 'Low Voltage',
            batteryType: 'Lithium',
            batteryBrand: 'Standard',
            noOfBatteries: 1,
            batterySerial: 'PENDING',
            earthing: 'Both',
            lightningProtection: true,
            breakerName: 'Standard',
          }
        },
        packagePlan: {
          create: {
            systemSizeKw: solarSystemSize,
            packageTier: 'Basic',
            billingType: 'Monthly',
            monitoringTime: '12 Hours',
            monthlyBasePrice: 0,
            appliedDiscount: 0,
            salesTaxAmount: 0,
            totalAmount: 0,
          }
        },
        customerHistory: {
          create: {
            customerCode,
            customerName: fullName,
            actionType: 'SALES_LEAD_CREATED',
            newStatus: CustomerStatus.SIGNUP_GENERATED,
            notes: `Sales Lead created from source: ${sourceOfLead}. Solar System Size: ${solarSystemSize}. Automated assigned to Sales.`,
            performedBy: creatorName,
          }
        }
      }
    })

    // 2. Automated Ticket Creation Assigned to Sales
    const ticketNumber = generateTicketNumber()
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        customerId: customer.id,
        ticketType: TicketType.SERVICE_REQUEST,
        source: sourceOfLead,
        assignedTo: 'Sales',
        escalation: 'Level-1',
        status: TicketStatus.PENDING,
        actionPriority: 'High',
        category: 'Sales Lead',
        subCategory: sourceOfLead,
        fault: `Lead - ${solarSystemSize}`,
        description: `New Sales Lead created from ${sourceOfLead}.\nCustomer: ${fullName}\nContact #: ${contactNumber}\nCity: ${city}\nAddress: ${address}\nSolar System Size: ${solarSystemSize}`,
        histories: {
          create: {
            status: TicketStatus.PENDING,
            department: 'Sales',
            remarks: `Sales lead captured via ${sourceOfLead} and automated assigned to Sales Department.`,
            createdBy: creatorName,
            timeInDept: '0 mins',
          }
        }
      }
    })

    revalidatePath('/dashboard/tickets')
    revalidatePath('/dashboard/customers')
    revalidatePath(`/dashboard/customers/${customer.id}`)
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard/sales/leads')
    revalidatePath('/dashboard/management-dashboard')

    return {
      success: true,
      customerId: customer.id,
      customerCode: customer.customerCode,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
    }
  } catch (err: any) {
    console.error('Error creating sales lead:', err)
    return { error: err.message || 'Failed to create sales lead.' }
  }
}
