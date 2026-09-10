# SMS Notification System Setup Guide

## Overview

This SMS notification system provides automated SMS messaging for your Energy Guru CRM with support for:
- Customer registration confirmations
- Invoice notifications
- Payment due reminders
- Payment received confirmations
- Complaint registration & resolution
- Daily solar production reports
- Custom messaging

## 🚀 Quick Setup

### 1. Environment Configuration

Add these environment variables to your `.env.local` file:

```env
# SMS Configuration
SMS_API_KEY=your_sms_api_key_here
SMS_API_URL=https://sendpk.com/api/sms.php
SMS_SENDER_NAME=EnergyGuru
SMS_WEBHOOK_SECRET=your_webhook_secret_here

# Cron Job Security
CRON_SECRET=your_secure_cron_secret_here
```

### 2. SMS Provider Setup

The system supports multiple SMS providers. Here are the most popular ones in Pakistan:

#### SendPK (Recommended for Pakistan)
```env
SMS_API_KEY=your_sendpk_api_key
SMS_API_URL=https://sendpk.com/api/sms.php
```

#### LifetimeSMS
```env
SMS_API_KEY=your_lifetimesms_api_key
SMS_API_URL=https://lifetimesms.com/plain
```

#### eOcean
```env
SMS_API_KEY=your_eocean_api_key
SMS_API_URL=https://eocean.us/api/send
```

### 3. Database Migration

The SMS system uses the existing `CommunicationLog` model in your Prisma schema. No additional migrations needed.

## 📱 SMS Templates

### Available Templates

1. **Registration Complete**
   ```
   Dear Customer, Welcome to EnergyGurus.online! Your registration is complete. Customer ID: EG-001234. 
   
   For support: WhatsApp +923009433303. Thank you!
   ```

2. **Invoice Generated**
   ```
   Dear Customer, Invoice INV-2024-001 for Oct 2026: PKR 15,000 | Due: 15-Oct-2026. Please pay by the due date to continue uninterrupted service. 
   
   For support: WhatsApp +923009433303. Thank you!
   ```

3. **Payment Due Reminder**
   ```
   Dear Customer, Invoice INV-2024-001 of PKR 15,000 is due tomorrow, 15-Oct-2026. Please clear your dues to avoid service interruption.
   
   For support: WhatsApp +923009433303. Thank you!
   ```

4. **Payment Received**
   ```
   Dear Customer, Payment of PKR 15,000 received. Receipt RCP-12345678 | 09-Oct-2026.
   
   For support: WhatsApp +923009433303. Thank you!
   ```

5. **Complaint Registered**
   ```
   Dear Customer, Your complaint has been registered. Complaint TKT-2024-001 | Date: 09-Oct-2026. Our support team will review it shortly.
   
   For support: WhatsApp +923009433303. Thank you!
   ```

6. **Complaint Resolved**
   ```
   Dear Customer, Complaint TKT-2024-001 has been resolved and closed. Closure Date: 09-Oct-2026. 
   
   For support: WhatsApp +923009433303. Thank you!
   ```

7. **Daily Solar Report**
   ```
   Dear Customer, 
   
   Your Solar System | Produced 45 Units Today | MTD Units 1350 | YTD Units 16200 .
   
   For support: WhatsApp +923009433303. Thank you!
   ```

## 🔧 Integration with Existing APIs

### Method 1: Using Helper Functions (Recommended)

Import and call these helper functions in your existing API routes:

```typescript
import {
  triggerRegistrationSMS,
  triggerInvoiceSMS,
  triggerPaymentReceivedSMS,
  triggerComplaintRegisteredSMS,
  triggerComplaintResolvedSMS
} from '@/lib/integration-helpers';

// Example: After creating a customer
const customer = await prisma.customer.create({ data: customerData });
triggerRegistrationSMS(customer.id); // Runs in background

// Example: After creating an invoice
const invoice = await prisma.invoice.create({ data: invoiceData });
triggerInvoiceSMS(invoice.id); // Runs in background

// Example: After payment processing
const transaction = await prisma.transaction.create({ data: transactionData });
triggerPaymentReceivedSMS(transaction.id); // Runs in background

// Example: After creating a ticket
const ticket = await prisma.ticket.create({ data: ticketData });
triggerComplaintRegisteredSMS(ticket.id); // Runs in background

// Example: After resolving a ticket
const ticket = await prisma.ticket.update({
  where: { id: ticketId },
  data: { status: 'RESOLVED' }
});
if (ticket.status === 'RESOLVED') {
  triggerComplaintResolvedSMS(ticket.id); // Runs in background
}
```

### Method 2: Direct API Calls

You can also call the SMS API directly:

```typescript
// Send any SMS type
await fetch('/api/sms/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'INVOICE',
    invoiceId: 'invoice-id-here'
  })
});
```

## 🤖 Automated SMS (Cron Jobs)

### Setup Cron Jobs

Add these to your hosting platform's cron job scheduler:

#### 1. Daily Overdue Payment Reminders
```
# Run daily at 10 AM Pakistan time
0 10 * * * curl -H "Authorization: Bearer ${CRON_SECRET}" https://yourdomain.com/api/cron/sms-reminders
```

#### 2. Daily Solar Reports  
```
# Run daily at 6 PM Pakistan time
0 18 * * * curl -H "Authorization: Bearer ${CRON_SECRET}" https://yourdomain.com/api/cron/solar-reports
```

### Vercel Cron Jobs (if using Vercel)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sms-reminders",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/solar-reports", 
      "schedule": "0 18 * * *"
    }
  ]
}
```

## 🎛️ SMS Dashboard

Access the SMS dashboard at: `/dashboard/sms`

Features:
- Test all SMS templates
- View SMS delivery logs
- Send bulk reminders
- Monitor SMS statistics

## 📊 API Endpoints

### Send SMS
```
POST /api/sms/send
Body: {
  "type": "INVOICE|REGISTRATION|DUE_REMINDER|etc",
  "customerId": "customer-id",
  "invoiceId": "invoice-id", // if applicable
  "ticketId": "ticket-id", // if applicable
  "transactionId": "transaction-id", // if applicable
  "message": "custom message", // for custom type
  "solarData": { // for solar reports
    "todayUnits": 45,
    "mtdUnits": 1350, 
    "ytdUnits": 16200
  }
}
```

### Get SMS Templates
```
GET /api/sms/templates
```

### Get SMS Logs
```
GET /api/sms/logs?limit=20&offset=0&customerId=xxx&type=INVOICE&status=SENT
```

### Send Bulk Reminders
```
POST /api/sms/bulk-reminders
```

### Webhook (for delivery status)
```
POST /api/sms/webhook
Body: {
  "messageId": "external-message-id",
  "status": "DELIVERED|FAILED|etc",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🔒 Security Features

- API key authentication for SMS provider
- Webhook signature verification
- Cron job authorization
- Rate limiting protection
- Input validation with Zod schemas
- SQL injection protection via Prisma

## 🎯 Customization

### Modify SMS Templates

Edit templates in `src/lib/sms-service.ts`:

```typescript
private static readonly TEMPLATES = {
  REGISTRATION_COMPLETE: `Your custom template here {{customerCode}}`,
  // ... other templates
}
```

### Add New SMS Provider

1. Add provider config to `src/lib/sms-config.ts`
2. Update API implementation in `src/lib/sms-api.ts`
3. Test with new provider credentials

### Custom Business Logic

Modify business rules in `src/lib/sms-config.ts`:
- Business hours restrictions
- Weekend messaging rules
- Customer type filtering
- Rate limiting per customer

## 📈 Monitoring & Analytics

### SMS Statistics

View statistics in the dashboard or via API:
- Total SMS sent (last 24 hours)
- Delivery success rate
- Failed message details
- Customer engagement metrics

### Logging

All SMS communications are logged to the `CommunicationLog` table with:
- Message content
- Delivery status
- Timestamps
- Error details
- External provider message IDs

## 🐛 Troubleshooting

### Common Issues

1. **SMS not sending**
   - Check API key configuration
   - Verify SMS provider balance
   - Check network connectivity
   - Review error logs in database

2. **Invalid phone numbers**
   - Ensure Pakistani number format: +923xxxxxxxxx
   - Check number validation in `sms-config.ts`

3. **Template variables not replacing**
   - Verify data exists in database
   - Check template context in `sms-service.ts`

4. **Webhook not working**
   - Verify webhook URL with SMS provider
   - Check webhook secret configuration
   - Review webhook signature verification

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log all SMS requests and responses to the console.

## 📞 Support

For technical support or customization requests:
- WhatsApp: +923009433303
- Email: support@energygurus.online

## 🔄 Version History

- **v1.0.0** - Initial SMS system implementation
- **v1.1.0** - Added bulk messaging and cron jobs
- **v1.2.0** - Added webhook support and delivery tracking
- **v1.3.0** - Added SMS dashboard and analytics