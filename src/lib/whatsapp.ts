/**
 * Meta WhatsApp Cloud API Client
 * Official Meta Graph API v21.0
 */

import prisma from '@/lib/prisma'

export interface SendWhatsAppTemplateOptions {
  customerId: string
  recipientPhone: string
  templateName: string
  languageCode?: string
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

export interface SendWhatsAppTextOptions {
  customerId: string
  recipientPhone: string
  message: string
  type: 'INVOICE' | 'DUE_REMINDER' | 'OVERDUE_REMINDER' | 'RECEIPT' | 'WELCOME' | 'TICKET' | 'STATUS_CHANGE' | 'REPORT' | 'BROADCAST' | 'MANUAL'
  invoiceId?: string
}

export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return ''
  // Remove all non-digits
  let clean = phone.replace(/\D/g, '')

  // If local Pakistani 03XXXXXXXXX (11 digits), convert to 923XXXXXXXXX
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '92' + clean.slice(1)
  } else if (clean.length === 10 && clean.startsWith('3')) {
    clean = '92' + clean
  }
  return clean
}

/**
 * Dispatches a pre-approved Meta WhatsApp Template (Required for business-initiated triggers)
 */
export async function sendWhatsAppTemplate(options: SendWhatsAppTemplateOptions) {
  const {
    customerId,
    recipientPhone,
    templateName,
    languageCode = 'en',
    bodyParams = [],
    headerDocument,
    headerImage,
    urlButtonParam,
    type,
    invoiceId,
  } = options

  const formattedPhone = formatWhatsAppPhone(recipientPhone)
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      error: `Invalid phone number: ${recipientPhone}`,
    }
  }

  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0'
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsApp] WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN is missing in .env')
  }

  const components: any[] = []

  // 1. Header (Document PDF or Image)
  if (headerDocument) {
    components.push({
      type: 'header',
      parameters: [
        {
          type: 'document',
          document: {
            link: headerDocument.link,
            filename: headerDocument.filename,
          },
        },
      ],
    })
  } else if (headerImage) {
    components.push({
      type: 'header',
      parameters: [
        {
          type: 'image',
          image: {
            link: headerImage,
          },
        },
      ],
    })
  }

  // 2. Body Parameters
  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((param) => ({
        type: 'text',
        text: String(param),
      })),
    })
  }

  // 3. Dynamic URL Button Parameter
  if (urlButtonParam) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [
        {
          type: 'text',
          text: String(urlButtonParam),
        },
      ],
    })
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  }

  let isSuccess = false
  let wamid: string | null = null
  let errorDetails: string | null = null

  if (phoneNumberId && accessToken) {
    try {
      const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.messages?.[0]?.id) {
        isSuccess = true
        wamid = data.messages[0].id
      } else {
        errorDetails = JSON.stringify(data.error || data)
        console.error('[WhatsApp Cloud API Error]:', data)
      }
    } catch (err: any) {
      errorDetails = err.message
      console.error('[WhatsApp Cloud API Exception]:', err)
    }
  } else {
    // Simulated delivery in development if tokens not set yet
    isSuccess = true
    wamid = `wamid.simulated.${Date.now()}`
  }

  // Persist to Prisma CommunicationLog
  try {
    const log = await prisma.communicationLog.create({
      data: {
        customerId,
        channel: 'WHATSAPP',
        type,
        recipient: formattedPhone,
        messageBody: `[Template: ${templateName}] Variables: ${bodyParams.join(' | ')}`,
        status: isSuccess ? 'SENT' : 'FAILED',
        externalId: wamid,
        invoiceId: invoiceId || null,
        errorDetails: errorDetails,
        sentAt: new Date(),
      },
    })
    return { success: isSuccess, wamid, log, error: errorDetails }
  } catch (dbErr: any) {
    console.error('Failed to log WhatsApp communication to DB:', dbErr)
    return { success: isSuccess, wamid, error: dbErr.message }
  }
}

/**
 * Dispatches a free-form WhatsApp text message (Valid within 24-hour service window)
 */
export async function sendWhatsAppText(options: SendWhatsAppTextOptions) {
  const { customerId, recipientPhone, message, type, invoiceId } = options

  const formattedPhone = formatWhatsAppPhone(recipientPhone)
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      error: `Invalid phone number: ${recipientPhone}`,
    }
  }

  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0'
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'text',
    text: { body: message },
  }

  let isSuccess = false
  let wamid: string | null = null
  let errorDetails: string | null = null

  if (phoneNumberId && accessToken) {
    try {
      const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.messages?.[0]?.id) {
        isSuccess = true
        wamid = data.messages[0].id
      } else {
        errorDetails = JSON.stringify(data.error || data)
      }
    } catch (err: any) {
      errorDetails = err.message
    }
  } else {
    isSuccess = true
    wamid = `wamid.simulated.${Date.now()}`
  }

  try {
    const log = await prisma.communicationLog.create({
      data: {
        customerId,
        channel: 'WHATSAPP',
        type,
        recipient: formattedPhone,
        messageBody: message,
        status: isSuccess ? 'SENT' : 'FAILED',
        externalId: wamid,
        invoiceId: invoiceId || null,
        errorDetails: errorDetails,
        sentAt: new Date(),
      },
    })
    return { success: isSuccess, wamid, log, error: errorDetails }
  } catch (dbErr: any) {
    return { success: isSuccess, wamid, error: dbErr.message }
  }
}
