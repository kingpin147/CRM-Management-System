import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWhatsAppTemplate } from '@/lib/whatsapp'
import { formatDate } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const now = new Date()
    // Overdue cutoff: Invoices whose dueDate is past
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['UNPAID', 'OVERDUE', 'Unpaid', 'Overdue'] },
        dueDate: {
          lt: now,
        },
      },
      include: {
        customer: true,
      },
    })

    let overdueRemindersSent = 0

    for (const invoice of overdueInvoices) {
      const customer = invoice.customer
      if (!customer || !customer.contactNumber) continue

      // Check if we already sent an overdue reminder for this invoice in the last 7 days
      const alreadySent = await prisma.communicationLog.findFirst({
        where: {
          customerId: customer.id,
          invoiceId: invoice.id,
          type: 'OVERDUE_REMINDER',
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      })

      if (!alreadySent) {
        const formattedDueDate = formatDate(invoice.dueDate)
        const amountNumber = Number(invoice.totalAmount) || 0
        const formattedAmount = amountNumber.toLocaleString(undefined, { minimumFractionDigits: 2 })

        // Calculate days past due
        const daysPastDue = Math.max(1, Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)))

        await sendWhatsAppTemplate({
          customerId: customer.id,
          recipientPhone: customer.contactNumber,
          templateName: 'payment_overdue_notice',
          bodyParams: [
            customer.fullName,
            invoice.invoiceNumber,
            formattedAmount,
            daysPastDue,
            '+92 316 4266004',
          ],
          type: 'OVERDUE_REMINDER',
          invoiceId: invoice.id,
        })

        // Update status to OVERDUE if it was UNPAID
        if (invoice.status.toUpperCase() === 'UNPAID') {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'OVERDUE' },
          })
        }

        overdueRemindersSent++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked overdue invoices. Sent ${overdueRemindersSent} WhatsApp overdue notices.`,
      overdueRemindersSent,
    })
  } catch (error: any) {
    console.error('Overdue reminder cron error:', error)
    return NextResponse.json({ error: 'Failed to process overdue notices. Check server logs.' }, { status: 500 })
  }
}
