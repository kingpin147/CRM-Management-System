import prisma from '@/lib/prisma'
import { sendSms } from './sendpk'
import { sendInvoiceEmail } from './brevo'
import { formatDate } from '@/lib/utils'

export interface LogAndSendSmsOptions {
  customerId: string
  recipientPhone: string
  message: string
  type: 'INVOICE' | 'DUE_REMINDER' | 'OVERDUE_REMINDER' | 'MANUAL'
  invoiceId?: string
}

export async function logAndSendSms(options: LogAndSendSmsOptions) {
  const { customerId, recipientPhone, message, type, invoiceId } = options

  // 1. Send SMS via SendPK
  const result = await sendSms(recipientPhone, message)

  // 2. Persist to CommunicationLog
  try {
    const log = await prisma.communicationLog.create({
      data: {
        customerId,
        channel: 'SMS',
        type,
        recipient: recipientPhone,
        messageBody: message,
        status: result.success ? 'DELIVERED' : 'FAILED',
        externalId: result.messageId || null,
        invoiceId: invoiceId || null,
        errorDetails: result.error || null,
        deliveredAt: result.success ? new Date() : null,
      },
    })
    return { success: result.success, log, error: result.error }
  } catch (err: any) {
    console.error('Failed to log SMS to database:', err)
    return { success: result.success, error: err.message }
  }
}

export interface LogAndSendEmailOptions {
  customerId: string
  recipientEmail: string
  recipientName: string
  subject: string
  messageBodySummary: string
  type: 'INVOICE' | 'DUE_REMINDER' | 'OVERDUE_REMINDER' | 'MANUAL' | 'INVITATION'
  invoiceId?: string
  invoiceParams?: {
    invoiceNumber: string
    amount: number
    month: string
    dueDate: string
    planName?: string
  }
}

export async function logAndSendInvoiceEmail(options: LogAndSendEmailOptions) {
  const { customerId, recipientEmail, recipientName, subject, messageBodySummary, type, invoiceId, invoiceParams } = options

  let sendResult: { success: boolean; messageId?: string; error?: string } = { success: false }

  if (invoiceParams) {
    sendResult = await sendInvoiceEmail({
      email: recipientEmail,
      name: recipientName,
      invoiceNumber: invoiceParams.invoiceNumber,
      amount: invoiceParams.amount,
      month: invoiceParams.month,
      dueDate: invoiceParams.dueDate,
      planName: invoiceParams.planName,
    })
  }

  try {
    const log = await prisma.communicationLog.create({
      data: {
        customerId,
        channel: 'EMAIL',
        type,
        recipient: recipientEmail,
        subject,
        messageBody: messageBodySummary,
        status: sendResult.success ? 'DELIVERED' : 'FAILED',
        externalId: sendResult.messageId || null,
        invoiceId: invoiceId || null,
        errorDetails: sendResult.error || null,
        deliveredAt: sendResult.success ? new Date() : null,
      },
    })
    return { success: sendResult.success, log, error: sendResult.error }
  } catch (err: any) {
    console.error('Failed to log Email to database:', err)
    return { success: sendResult.success, error: err.message }
  }
}

/**
 * High-level helper: Send both Email & SMS when invoice is generated or sent
 */
export async function sendInvoiceNotifications(params: {
  customer: {
    id: string
    fullName: string
    contactNumber: string
    email?: string | null
    customerCode?: string
  }
  invoice: {
    id: string
    invoiceNumber: string
    totalAmount: any
    dueDate: Date
    billingPeriod: Date
  }
  planName?: string
}) {
  const { customer, invoice, planName } = params
  const monthName = new Date(invoice.billingPeriod).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const formattedDueDate = formatDate(invoice.dueDate)
  const amountNumber = Number(invoice.totalAmount) || 0
  const formattedAmount = amountNumber.toLocaleString(undefined, { minimumFractionDigits: 2 })

  const smsText = `Dear ${customer.fullName}, your solar O&M bill for amount PKR ${formattedAmount} is due for the month of ${monthName} with due date ${formattedDueDate}. Kindly pay on time. Energy Gurus`

  const results: { sms?: any; email?: any } = {}

  // 1. Send SMS
  if (customer.contactNumber) {
    results.sms = await logAndSendSms({
      customerId: customer.id,
      recipientPhone: customer.contactNumber,
      message: smsText,
      type: 'INVOICE',
      invoiceId: invoice.id,
    })
  }

  // 2. Send Email if email address exists
  if (customer.email) {
    const emailSummary = `Invoice #${invoice.invoiceNumber} for PKR ${formattedAmount} (${monthName}) due on ${formattedDueDate}`
    results.email = await logAndSendInvoiceEmail({
      customerId: customer.id,
      recipientEmail: customer.email,
      recipientName: customer.fullName,
      subject: `Monthly Solar O&M Invoice (${monthName}) - PKR ${formattedAmount}`,
      messageBodySummary: emailSummary,
      type: 'INVOICE',
      invoiceId: invoice.id,
      invoiceParams: {
        invoiceNumber: invoice.invoiceNumber,
        amount: amountNumber,
        month: monthName,
        dueDate: formattedDueDate,
        planName: planName,
      },
    })
  }

  return results
}
