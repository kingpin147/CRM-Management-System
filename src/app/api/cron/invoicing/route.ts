import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
        const totalAmount = Number(plan.totalAmount)
        const basePrice = Number(plan.monthlyBasePrice)
        const salesTax = Number(plan.salesTaxAmount || 0)

        const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${customer.customerCode}`
        const dueDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)

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
              narration: `Automated Monthly O&M Invoice (${plan.packageTier} Plan)`,
              debit: totalAmount,
              credit: 0,
              balance: newBal
            }
          })
        })

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
