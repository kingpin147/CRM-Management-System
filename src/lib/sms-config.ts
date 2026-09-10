/**
 * SMS Configuration and Settings
 */

export interface SMSProviderConfig {
  name: string;
  apiUrl: string;
  authMethod: 'api_key' | 'bearer_token' | 'basic_auth';
  rateLimitPerMinute: number;
  supportsBulk: boolean;
  supportsDeliveryStatus: boolean;
}

// Popular SMS providers configurations
export const SMS_PROVIDERS: Record<string, SMSProviderConfig> = {
  // Pakistani SMS Providers
  SENDPK: {
    name: 'SendPK',
    apiUrl: 'https://sendpk.com/api/sms.php',
    authMethod: 'api_key',
    rateLimitPerMinute: 100,
    supportsBulk: true,
    supportsDeliveryStatus: true
  },
  
  LIFETIMESMS: {
    name: 'LifetimeSMS',
    apiUrl: 'https://lifetimesms.com/plain',
    authMethod: 'api_key',
    rateLimitPerMinute: 60,
    supportsBulk: true,
    supportsDeliveryStatus: false
  },

  EOCEAN: {
    name: 'eOcean',
    apiUrl: 'https://eocean.us/api/send',
    authMethod: 'api_key',
    rateLimitPerMinute: 120,
    supportsBulk: true,
    supportsDeliveryStatus: true
  },

  // International Providers
  TWILIO: {
    name: 'Twilio',
    apiUrl: 'https://api.twilio.com/2010-04-01/Accounts',
    authMethod: 'basic_auth',
    rateLimitPerMinute: 1000,
    supportsBulk: false,
    supportsDeliveryStatus: true
  },

  NEXMO: {
    name: 'Vonage (Nexmo)',
    apiUrl: 'https://rest.nexmo.com/sms/json',
    authMethod: 'api_key',
    rateLimitPerMinute: 1000,
    supportsBulk: false,
    supportsDeliveryStatus: true
  }
};

// SMS Settings
export const SMS_SETTINGS = {
  // Default sender name (will be truncated to 11 characters)
  DEFAULT_SENDER: 'EnergyGuru',
  
  // Maximum message length for single SMS
  MAX_MESSAGE_LENGTH: 160,
  
  // Maximum message length for long SMS (concatenated)
  MAX_LONG_MESSAGE_LENGTH: 1600,
  
  // Retry attempts for failed messages
  MAX_RETRY_ATTEMPTS: 3,
  
  // Delay between bulk messages (milliseconds)
  BULK_MESSAGE_DELAY: 1000,
  
  // Webhook verification
  WEBHOOK_VERIFICATION_ENABLED: true,
  
  // Default timezone for Pakistan
  DEFAULT_TIMEZONE: 'Asia/Karachi'
};

// Message type priorities
export const MESSAGE_PRIORITIES = {
  HIGH: ['COMPLAINT_REGISTERED', 'PAYMENT_RECEIVED'],
  MEDIUM: ['INVOICE_GENERATED', 'DUE_REMINDER'],
  LOW: ['REGISTRATION_COMPLETE', 'COMPLAINT_RESOLVED', 'SOLAR_REPORT']
};

// Business hours for SMS sending (Pakistan time)
export const BUSINESS_HOURS = {
  START: 9, // 9 AM
  END: 21,  // 9 PM
  TIMEZONE: 'Asia/Karachi'
};

// SMS template settings
export const TEMPLATE_SETTINGS = {
  // Enable/disable specific templates
  ENABLED_TEMPLATES: {
    REGISTRATION_COMPLETE: true,
    INVOICE_GENERATED: true,
    PAYMENT_DUE_REMINDER: true,
    PAYMENT_RECEIVED: true,
    COMPLAINT_REGISTERED: true,
    COMPLAINT_RESOLVED: true,
    DAILY_SOLAR_REPORT: true
  },
  
  // Template sending rules
  RULES: {
    // Don't send due reminders on weekends
    NO_DUE_REMINDERS_WEEKEND: true,
    
    // Only send solar reports to active customers
    SOLAR_REPORTS_ACTIVE_ONLY: true,
    
    // Don't send invoice SMS after business hours
    INVOICE_BUSINESS_HOURS_ONLY: false,
    
    // Maximum number of reminders per invoice
    MAX_REMINDERS_PER_INVOICE: 3
  }
};

// Validation functions
export function isValidPhoneNumber(phone: string): boolean {
  // Pakistani phone number validation
  const pakistaniPattern = /^(\+92|0092|92|0)?[0-9]{10}$/;
  return pakistaniPattern.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  // Clean and format phone number
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Convert to international format
  if (cleaned.startsWith('03')) {
    return '+92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3')) {
    return '+92' + cleaned;
  } else if (cleaned.startsWith('923')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('+92')) {
    return cleaned;
  }
  
  return cleaned;
}

export function isBusinessHours(): boolean {
  const now = new Date();
  const pakistanTime = new Date(now.toLocaleString("en-US", {timeZone: BUSINESS_HOURS.TIMEZONE}));
  const hour = pakistanTime.getHours();
  
  return hour >= BUSINESS_HOURS.START && hour <= BUSINESS_HOURS.END;
}

export function isWeekend(): boolean {
  const now = new Date();
  const pakistanTime = new Date(now.toLocaleString("en-US", {timeZone: BUSINESS_HOURS.TIMEZONE}));
  const day = pakistanTime.getDay();
  
  // Sunday = 0, Saturday = 6
  return day === 0 || day === 6;
}