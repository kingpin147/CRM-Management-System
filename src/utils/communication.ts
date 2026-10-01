import prisma from '@/lib/prisma'
import { sendWhatsAppTemplate, sendWhatsAppText, formatWhatsAppPhone } from '@/lib/whatsapp'
import { sendInvoiceEmail } from './brevo'
import { formatDate } from '@/lib/utils'

export interface LogAndSendWhatsAppOptions {
  customerId: string
  recipientPhone: string
  message?: string
  templateName?: string
  bodyParams?: (string | number)[]
  headerDocument?: {
    link: string
    filename: string
  }
  headerImage?: string
  urlButtonParam?: string
  type: 'INVOICE' | 'DUE_REMINDER' | 'OVERDUE_REMINDER' | 'RECEIPT' | 'WELCOME' | 'TICKET' | 'STATUS_CHANGE' | 'REPORT' | 'BROADCAST' | 'MANUAL'
  invoiceId?: string
}

/**
 * Dispatches a WhatsApp notification via Meta Cloud API and logs to CommunicationLog table
 */
export async function logAndSendWhatsApp(options: LogAndSendWhatsAppOptions) {
  const { customerId, recipientPhone, templateName, bodyParams, headerDocument, headerImage, urlButtonParam, type, invoiceId, message } = options

  if (templateName) {
    return await sendWhatsAppTemplate({
      customerId,
      recipientPhone,
      templateName,
      bodyParams: bodyParams || [],
      headerDocument,
      headerImage,
      urlButtonParam,
      type,
      invoiceId,
    })
  } else if (message) {
    return await sendWhatsAppText({
      customerId,
      recipientPhone,
      message,
      type,
      invoiceId,
    })
  } else {
    return { success: false, error: 'Neither templateName nor message provided' }
  }
}

// Backward-compatible alias for any legacy callers
export const logAndSendSms = logAndSendWhatsApp

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
 * High-level helper: Send both Meta WhatsApp Template & Email when invoice is generated
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.energygurus.pk'

  const results: { whatsapp?: any; email?: any } = {}

  // 1. Send WhatsApp Template
  if (customer.contactNumber) {
    results.whatsapp = await sendWhatsAppTemplate({
      customerId: customer.id,
      recipientPhone: customer.contactNumber,
      templateName: 'monthly_invoice_dispatch',
      bodyParams: [
        customer.fullName,
        invoice.invoiceNumber,
        monthName,
        formattedAmount,
        formattedDueDate,
      ],
      headerDocument: {
        link: `${appUrl}/api/invoice/${invoice.id}/pdf`,
        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
      },
      urlButtonParam: invoice.id,
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
