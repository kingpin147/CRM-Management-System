/**
 * SendPK SMS Integration Utility
 * API docs: https://sendpk.com/api.php
 */

export interface SendSmsResult {
  success: boolean
  messageId?: string
  rawResponse?: string
  error?: string
}

export function formatPakistaniPhoneNumber(phone: string): string {
  if (!phone) return ''
  // Remove all non-digit characters
  let clean = phone.replace(/\D/g, '')
  
  // If starts with 0 (e.g. 03001234567), change to 923001234567
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '92' + clean.slice(1)
  }
  // If starts with 92 and length 12, keep it
  else if (clean.startsWith('92') && clean.length === 12) {
    // fine
  }
  // If 10 digits without leading 0 (e.g. 3001234567)
  else if (clean.length === 10 && clean.startsWith('3')) {
    clean = '92' + clean
  }
  return clean
}

/**
 * Send a single SMS via SendPK API
 */
export async function sendSms(mobile: string, message: string): Promise<SendSmsResult> {
  const apiKey = process.env.SENDPK_API_KEY
  const sender = process.env.SENDPK_SENDER_ID || 'SMS Alert'

  if (!apiKey) {
    console.warn('SENDPK_API_KEY is not set in environment variables.')
    return {
      success: false,
      error: 'SENDPK_API_KEY not configured',
    }
  }

  const formattedMobile = formatPakistaniPhoneNumber(mobile)
  if (!formattedMobile || formattedMobile.length < 10) {
    return {
      success: false,
      error: `Invalid phone number: ${mobile}`,
    }
  }

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      sender: sender,
      mobile: formattedMobile,
      message: message,
      format: 'json',
    })

    const response = await fetch(`https://sendpk.com/api/sms.php?${params.toString()}`, {
      method: 'GET',
    })

    const text = await response.text()

    // Try parsing JSON if available, otherwise check plain response
    let json: any = null
    try {
      json = JSON.parse(text)
    } catch {
      // not JSON
    }

    if (json) {
      if (json.status === 'OK' || json.response?.status === 'OK' || String(json.response || '').startsWith('OK')) {
        const id = json.id || json.response?.id || text.match(/ID:(\d+)/i)?.[1]
        return {
          success: true,
          messageId: id ? String(id) : undefined,
          rawResponse: text,
        }
      } else {
        return {
          success: false,
          error: json.error || json.message || text,
          rawResponse: text,
        }
      }
    }

    // Plain text check e.g. "OK ID:29346"
    if (text.startsWith('OK')) {
      const match = text.match(/ID:(\d+)/i)
      return {
        success: true,
        messageId: match ? match[1] : undefined,
        rawResponse: text,
      }
    } else {
      return {
        success: false,
        error: `SendPK Error code: ${text}`,
        rawResponse: text,
      }
    }
  } catch (err: any) {
    console.error('SendPK SMS exception:', err)
    return {
      success: false,
      error: err.message || 'Network error calling SendPK SMS API',
    }
  }
}

/**
 * Check delivery status of a previously sent message
 */
export async function checkSmsDelivery(messageId: string): Promise<{ delivered: boolean; status: string; raw?: string }> {
  const apiKey = process.env.SENDPK_API_KEY
  if (!apiKey || !messageId) {
    return { delivered: false, status: 'UNKNOWN' }
  }

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      id: messageId,
      format: 'json',
    })
    const response = await fetch(`https://sendpk.com/api/delivery.php?${params.toString()}`)
    const text = await response.text()
    const isDelivered = text.toLowerCase().includes('delivered')
    return {
      delivered: isDelivered,
      status: isDelivered ? 'DELIVERED' : 'SENT',
      raw: text,
    }
  } catch (err) {
    return { delivered: false, status: 'UNKNOWN' }
  }
}
