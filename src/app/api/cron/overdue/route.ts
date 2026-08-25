import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logAndSendSms } from '@/utils/communication'
import { formatDate } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const now = new Date()
    // Overdue cutoff: Invoices whose dueDate is at least 7 days in the past
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['UNPAID', 'OVERDUE'] },
        dueDate: {
          lte: sevenDaysAgo,
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

        const message = `Dear ${customer.fullName}, your solar bill for amount PKR ${formattedAmount} (due was ${formattedDueDate}) is now overdue. Kindly pay at your earliest to avoid disconnection. Energy Gurus`

        await logAndSendSms({
          customerId: customer.id,
          recipientPhone: customer.contactNumber,
          message,
          type: 'OVERDUE_REMINDER',
          invoiceId: invoice.id,
        })

        // Update status to OVERDUE if it was UNPAID
        if (invoice.status === 'UNPAID') {
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
      message: `Checked overdue invoices. Sent ${overdueRemindersSent} overdue follow-up SMS reminders.`,
    })
  } catch (error: any) {
    console.error('Overdue cron error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send overdue follow-ups' }, { status: 500 })
  }
}
