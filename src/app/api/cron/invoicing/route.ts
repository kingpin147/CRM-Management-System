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

        // Calculate initial cycle end date
        const activationDate = customer.activationDate ? new Date(customer.activationDate) : new Date(customer.signupDate || new Date())
        const initialCycleEnd = new Date(activationDate)
        initialCycleEnd.setMonth(initialCycleEnd.getMonth() + 1)
        initialCycleEnd.setDate(initialCycleEnd.getDate() - 1)

        const nextMonthStart = new Date(currentMonthStart)
        nextMonthStart.setMonth(nextMonthStart.getMonth() + 1)

        if (initialCycleEnd >= currentMonthStart && initialCycleEnd < nextMonthStart) {
          // Prorated month
          const proratedStartDate = new Date(initialCycleEnd)
          proratedStartDate.setDate(proratedStartDate.getDate() + 1)
          
          const proratedEndDate = new Date(proratedStartDate.getFullYear(), proratedStartDate.getMonth() + 1, 0)
          
          const msPerDay = 1000 * 60 * 60 * 24
          const daysToBill = Math.round((proratedEndDate.getTime() - proratedStartDate.getTime()) / msPerDay) + 1
          const daysInMonth = proratedEndDate.getDate()
          
          // Apply proration
          basePrice = Number(((basePrice / daysInMonth) * daysToBill).toFixed(2))
          salesTax = Number(((salesTax / daysInMonth) * daysToBill).toFixed(2))
          totalAmount = basePrice + salesTax
          isProrated = true
          
          narration = `Prorated O&M Invoice (${daysToBill} days: ${proratedStartDate.toLocaleDateString()} to ${proratedEndDate.toLocaleDateString()})`
        } else if (now < initialCycleEnd) {
          // Still in the prepaid first month
          continue
        }

        const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${customer.customerCode}`
        const dueDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)

        let createdInvoice: any = null

        await prisma.$transaction(async (tx) => {
          const invoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              customerId: customer.id,
              billingPeriod: currentMonthStart,
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
    return NextResponse.json({ error: error.message || 'Failed to run recurring invoicing job.' }, { status: 500 })
  }
}
