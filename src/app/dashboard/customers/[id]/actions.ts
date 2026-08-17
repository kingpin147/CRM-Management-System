'use server'

import { revalidatePath } from 'next/cache'
import { CustomerStatus, CustomerType, TicketStatus, TicketType } from '@prisma/client'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

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
  const monthlyBasePrice = Number(formData.get('monthlyBasePrice')) || 0
  const appliedDiscount = Number(formData.get('appliedDiscount')) || 0
  
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

export async function saveSolarSystem(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const disco = formData.get('disco') as string || null
  const meterType = formData.get('meterType') as string || 'Green Meter'
  const meterPhase = formData.get('meterPhase') as string || 'Three Phase'
  const zeroExportDevice = formData.get('zeroExportDevice') === 'true'
  
  // Inverter
  const inverterBrand = formData.get('inverterBrand') as string || 'Huawei'
  const inverterType = formData.get('inverterType') as string || 'Hybrid'
  const inverterPhase = formData.get('inverterPhase') as string || 'Three Phase'
  const inverterCategory = formData.get('inverterCategory') as string || 'Low Voltage'
  const inverterSize = formData.get('inverterSize') as string || '10 kW'
  const noOfInverters = Number(formData.get('noOfInverters')) || 1
  const inverterSerial = formData.get('inverterSerial') as string || 'SN-INV-' + Date.now().toString().slice(-6)
  
  // Panel
  const panelBrand = formData.get('panelBrand') as string || 'Longi'
  const panelType = formData.get('panelType') as string || 'Bifacial'
  const panelTechnology = formData.get('panelTechnology') as string || 'Topcon'
  const panelWattage = Number(formData.get('panelWattage')) || 585
  const noOfPanels = Number(formData.get('noOfPanels')) || 18
  const totalWattage = panelWattage * noOfPanels
  
  // Battery
  const batteryBrand = formData.get('batteryBrand') as string || 'Narada'
  const batteryType = formData.get('batteryType') as string || 'Lithium'
  const batteryCategory = formData.get('batteryCategory') as string || 'Low Voltage'
  const noOfBatteries = Number(formData.get('noOfBatteries')) || 1
  const batterySerial = formData.get('batterySerial') as string || 'SN-BAT-' + Date.now().toString().slice(-6)

  // Earthing & Specs
  const earthing = formData.get('earthing') as string || 'AC & DC Grounding'
  const earthingAcOhms = Number(formData.get('earthingAcOhms')) || 1.2
  const earthingDcOhms = Number(formData.get('earthingDcOhms')) || 0.8
  const lightningProtection = formData.get('lightningProtection') === 'true' || true
  const breakerName = formData.get('breakerName') as string || 'Schneider 32A MCB'
  const structureType = formData.get('structureType') as string || 'Elevated GI Structure'
  const installerName = formData.get('installerName') as string || 'EnergyGurus Technical Team'
  const installerCompany = formData.get('installerCompany') as string || 'EnergyGurus Private Limited'

  if (!customerId) return { error: 'Customer ID is required' }

  try {
    await prisma.solarSystem.upsert({
      where: { customerId },
      update: {
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
        panelBrand,
        panelType,
        panelTechnology,
        panelWattage,
        noOfPanels,
        totalWattage,
        batteryBrand,
        batteryType,
        batteryCategory,
        noOfBatteries,
        batterySerial,
        earthing,
        earthingAcOhms,
        earthingDcOhms,
        lightningProtection,
        breakerName,
        structureType,
        installerName,
        installerCompany,
      },
      create: {
        customerId,
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
        panelBrand,
        panelType,
        panelTechnology,
        panelWattage,
        noOfPanels,
        totalWattage,
        batteryBrand,
        batteryType,
        batteryCategory,
        noOfBatteries,
        batterySerial,
        earthing,
        earthingAcOhms,
        earthingDcOhms,
        lightningProtection,
        breakerName,
        structureType,
        installerName,
        installerCompany,
      },
    })

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

  const reference = customRef || `TX-${Date.now().toString().slice(-8)}`

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
  const actionPriority = formData.get('actionPriority') as string || 'Medium'
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
        escalation: 'Level-1',
        status: TicketStatus.PENDING,
        actionPriority,
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

    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/tickets')
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

