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
    // Window for upcoming due date: 3 days ahead
    const targetStartDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const targetEndDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)

    // Find unpaid invoices whose due date falls within target window
    const upcomingInvoices = await prisma.invoice.findMany({
      where: {
        status: 'UNPAID',
        dueDate: {
          gte: targetStartDate,
          lte: targetEndDate,
        },
      },
      include: {
        customer: true,
      },
    })

    let remindersSent = 0

    for (const invoice of upcomingInvoices) {
      const customer = invoice.customer
      if (!customer || !customer.contactNumber) continue

      // Check if we already sent a due reminder for this invoice in the last 4 days
      const alreadySent = await prisma.communicationLog.findFirst({
        where: {
          customerId: customer.id,
          invoiceId: invoice.id,
          type: 'DUE_REMINDER',
          createdAt: {
            gte: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          },
        },
      })

      if (!alreadySent) {
        const formattedDueDate = formatDate(invoice.dueDate)
        const amountNumber = Number(invoice.totalAmount) || 0
        const formattedAmount = amountNumber.toLocaleString(undefined, { minimumFractionDigits: 2 })

        const message = `Dear ${customer.fullName}, kindly pay your solar bill for PKR ${formattedAmount} because the due date (${formattedDueDate}) is near. After this date, your bill will be marked overdue. Energy Gurus`

        await logAndSendSms({
          customerId: customer.id,
          recipientPhone: customer.contactNumber,
          message,
          type: 'DUE_REMINDER',
          invoiceId: invoice.id,
        })

        remindersSent++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked upcoming invoices. Sent ${remindersSent} due date reminders.`,
    })
  } catch (error: any) {
    console.error('Due reminder cron error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send due reminders' }, { status: 500 })
  }
}
