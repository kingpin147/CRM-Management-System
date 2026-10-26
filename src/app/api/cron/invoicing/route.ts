import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendInvoiceNotifications } from '@/utils/communication'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    // Basic protection (can be expanded with a secret CRON_SECRET token)
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const activeCustomers = await prisma.customer.findMany({
      where: {
        status: 'CONNECTION_ACTIVE',
        packagePlan: { isNot: null }
      },
      include: {
        packagePlan: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    let invoicesGenerated = 0

    for (const customer of activeCustomers) {
      const plan = customer.packagePlan
      if (!plan) continue

      const lastInvoice = customer.invoices[0]
      const alreadyInvoicedThisMonth = lastInvoice && new Date(lastInvoice.createdAt) >= currentMonthStart

      if (!alreadyInvoicedThisMonth) {
        let totalAmount = Number(plan.totalAmount)
        let basePrice = Number(plan.monthlyBasePrice)
        let salesTax = Number(plan.salesTaxAmount || 0)
        let isProrated = false
        let narration = `Automated Monthly O&M Invoice (${plan.packageTier} Plan)`
        let invoiceBillingPeriod = currentMonthStart

        const nextMonthStart = new Date(currentMonthStart)
        nextMonthStart.setMonth(nextMonthStart.getMonth() + 1)

        // Determine if customer has an active nextBillingDate
        const nextBilling = plan.nextBillingDate ? new Date(plan.nextBillingDate) : null

        if (nextBilling) {
          // If next billing date is in a future month, customer is still in prepaid / promo coverage
          if (nextBilling >= nextMonthStart) {
            continue
          }

          // Mid-month cutoff (e.g. 24 Dec 2026): Bill the exact number of days from 24 Dec-26 to 31 Dec-26
          if (nextBilling.getDate() !== 1 && nextBilling >= currentMonthStart && nextBilling < nextMonthStart) {
            const proratedStartDate = new Date(nextBilling)
            const proratedEndDate = new Date(proratedStartDate.getFullYear(), proratedStartDate.getMonth() + 1, 0)
            
            const daysToBill = (proratedEndDate.getDate() - proratedStartDate.getDate()) + 1
            const daysInMonth = proratedEndDate.getDate()
            
            basePrice = Number(((Number(plan.monthlyBasePrice) / daysInMonth) * daysToBill).toFixed(2))
            salesTax = Number(((Number(plan.salesTaxAmount || 0) / daysInMonth) * daysToBill).toFixed(2))
            totalAmount = basePrice + salesTax
            isProrated = true
            invoiceBillingPeriod = proratedStartDate

            const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            narration = `Prorated O&M Invoice (${daysToBill} days: ${proratedStartDate.getDate()} ${monthShorts[proratedStartDate.getMonth()]} ${proratedStartDate.getFullYear()} to ${proratedEndDate.getDate()} ${monthShorts[proratedEndDate.getMonth()]} ${proratedEndDate.getFullYear()})`
          }
        } else {
          // Legacy fallback when nextBillingDate is null
          const activationDate = customer.activationDate ? new Date(customer.activationDate) : new Date(customer.signupDate || new Date())
          const initialCycleEnd = new Date(activationDate)
          initialCycleEnd.setMonth(initialCycleEnd.getMonth() + 1)
          initialCycleEnd.setDate(initialCycleEnd.getDate() - 1)
          if (now < initialCycleEnd) {
            continue
          }
        }

        const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${customer.customerCode}`
        // Automatic Client Requirement: Invoice generated on 1st, Due date is always 10th of every month
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59)

        let createdInvoice: any = null

        await prisma.$transaction(async (tx) => {
          const invoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              customerId: customer.id,
              billingPeriod: invoiceBillingPeriod,
              amount: basePrice,
              salesTax: salesTax,
              totalAmount: totalAmount,
              status: 'UNPAID',
              dueDate
            }
          })

          createdInvoice = invoice

          const lastEntry = await tx.ledgerEntry.findFirst({
            where: { customerId: customer.id },
            orderBy: { createdAt: 'desc' }
          })

          const prevBal = lastEntry ? Number(lastEntry.balance) : 0
          const newBal = prevBal + totalAmount

          await tx.ledgerEntry.create({
            data: {
              customerId: customer.id,
              invoiceId: invoice.id,
              refNumber: invoiceNumber,
              narration: narration,
              debit: totalAmount,
              credit: 0,
              balance: newBal
            }
          })

          // Advance nextBillingDate to the 1st of the following month (e.g. 01 Jan 2027)
          const nextCycleDate = new Date(invoiceBillingPeriod.getFullYear(), invoiceBillingPeriod.getMonth() + 1, 1)
          await tx.packagePlan.update({
            where: { customerId: customer.id },
            data: { nextBillingDate: nextCycleDate }
          })
        })

        // Automatically dispatch Email and SMS notification to customer and log history
        if (createdInvoice) {
          try {
            await sendInvoiceNotifications({
              customer: {
                id: customer.id,
                fullName: customer.fullName,
                contactNumber: customer.contactNumber,
                email: customer.email,
                customerCode: customer.customerCode,
              },
              invoice: createdInvoice,
              planName: `${plan.packageTier} (${plan.systemSizeKw})`,
            })
          } catch (notifErr) {
            console.error(`Failed to send invoice notifications for customer ${customer.id}:`, notifErr)
          }
        }

        invoicesGenerated++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${activeCustomers.length} active clients. Generated ${invoicesGenerated} new monthly invoices.`
    })
  } catch (error: any) {
    console.error('Automated Invoicing Error:', error)
    return NextResponse.json({ error: 'Failed to run recurring invoicing job. Check server logs.' }, { status: 500 })
  }
}
