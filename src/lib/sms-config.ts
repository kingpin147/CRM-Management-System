/**
 * Meta WhatsApp Cloud API Configuration and Settings
 */

export interface WhatsAppProviderConfig {
  name: string;
  apiVersion: string;
  authMethod: 'bearer_token';
  rateLimitPerMinute: number;
  supportsBulk: boolean;
  supportsDeliveryStatus: boolean;
}

export const WHATSAPP_CONFIG: WhatsAppProviderConfig = {
  name: 'Meta WhatsApp Cloud API',
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
  authMethod: 'bearer_token',
  rateLimitPerMinute: 1000,
  supportsBulk: true,
  supportsDeliveryStatus: true,
};

// Aliases for backward compatibility
export const SMS_PROVIDERS = {
  META_WHATSAPP: WHATSAPP_CONFIG,
};

// WhatsApp Business Settings
export const WHATSAPP_SETTINGS = {
  DEFAULT_SENDER: 'Energy Gurus',
  WEBHOOK_VERIFICATION_ENABLED: true,
  DEFAULT_TIMEZONE: 'Asia/Karachi',
};

// Template settings
export const TEMPLATE_SETTINGS = {
  ENABLED_TEMPLATES: {
    CUSTOMER_WELCOME_CRF: true,
    MONTHLY_INVOICE_DISPATCH: true,
    PAYMENT_DUE_REMINDER: true,
    PAYMENT_OVERDUE_NOTICE: true,
    PAYMENT_RECEIPT_CONFIRMATION: true,
    SERVICE_SUSPENSION_NONPAYMENT: true,
    SERVICE_RESTORED_CONFIRMATION: true,
    TEMPORARY_HOLD_NOTICE: true,
    TEMPORARY_HOLD_REACTIVATED: true,
    TICKET_REGISTERED_ACK: true,
    TICKET_RESOLVED_CLOSURE: true,
    DAILY_SOLAR_GENERATION_REPORT: true,
    OPERATIONAL_BROADCAST_ALERT: true,
  },
};

// Validation and Formatting functions
export function isValidPhoneNumber(phone: string): boolean {
  const pakistaniPattern = /^(\+92|0092|92|0)?[0-9]{10}$/;
  return pakistaniPattern.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('03')) {
    return '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3')) {
    return '92' + cleaned;
  } else if (cleaned.startsWith('+92')) {
    return cleaned.substring(1);
  }
  return cleaned;
}