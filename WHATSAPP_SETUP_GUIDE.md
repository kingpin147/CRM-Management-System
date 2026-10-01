# Meta WhatsApp Cloud API Setup & Integration Guide

> **Organization:** Energy Gurus (Solar O&M Management System)  
> **API Version:** Meta Graph API v21.0  
> **Official Documentation:** [Meta WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

## 📋 Overview

Energy Gurus CRM uses the official **Meta WhatsApp Cloud API** for:
- Automated Customer Welcome with Customer Registration Form (CRF) PDF document attachment
- Monthly Solar O&M Invoices with dynamic PDF attachments & direct payment links
- Automated Payment Due Reminders & Overdue Alerts
- Instant Payment Receipts with PDF receipt attachments
- Real-time Service Status Alerts (Suspension & Restoration)
- Customer Support Ticket Creation & Resolution Notifications
- Daily Solar Inverter Performance Reports (kWh Generation)
- Broadcast Announcements & Scheduled Maintenance Alerts

---

## 🚀 Step-by-Step Meta Setup Guide

### 1. Create a Meta App & WhatsApp Business Account (WABA)
1. Navigate to the [Meta for Developers Portal](https://developers.facebook.com/).
2. Click **My Apps** ➔ **Create App** ➔ Select **Other** ➔ Choose **Business** as the app type.
3. Under *Add products to your app*, click **Set up** on **WhatsApp**.
4. Link your Meta Business Manager and verify your official WhatsApp business phone number (`+92 316 4266004`).

---

### 2. Configure Environment Variables

Add the following environment variables to your `.env` / `.env.local` file:

```env
# Meta WhatsApp Cloud API Configuration
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_account_id_here
WHATSAPP_ACCESS_TOKEN=EAAG...your_permanent_system_user_token_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=energy_gurus_crm_webhook_secure_token_2026

# CRM Public Application URL (Used for hosting downloadable PDFs)
NEXT_PUBLIC_APP_URL=https://crm.energygurus.pk

# Cron Security Token
CRON_SECRET=your_secure_cron_secret_here
```

---

### 3. Generate a Permanent System User Token
1. Go to **Meta Business Suite** ➔ **Settings** ➔ **Users** ➔ **System Users**.
2. Click **Add System User**, set role to **Admin**.
3. Click **Add Assets** and grant Full Control over your WhatsApp Business Account.
4. Click **Generate Token**, select the following permissions:
   * `whatsapp_business_messaging`
   * `whatsapp_business_management`
5. Copy the generated permanent token into `WHATSAPP_ACCESS_TOKEN` in your `.env`.

---

### 4. Create Pre-Approved Templates in WhatsApp Manager

Go to **WhatsApp Manager** ➔ **Account Tools** ➔ **Message Templates** ➔ **Create Template**:

| Template Name | Category | Header | Body Template Text |
|---|---|---|---|
| `customer_welcome_crf` | `UTILITY` | Document (PDF) | *"Dear {{1}}, welcome to Energy Gurus! Your solar O&M service account has been successfully registered. Your Customer Code is {{2}} (CRF #{{3}}). Please find your official Customer Registration Form attached. For assistance, contact {{4}}."* |
| `monthly_invoice_dispatch` | `UTILITY` | Document (PDF) | *"Dear {{1}}, your solar O&M invoice {{2}} for {{3}} amounting to PKR {{4}} has been generated. The payment due date is {{5}}. Please review your invoice PDF attached below."* |
| `payment_due_reminder` | `UTILITY` | Text | *"Dear {{1}}, this is a friendly reminder that your solar O&M bill for invoice {{2}} amounting to PKR {{3}} is due on {{4}}. Kindly settle your bill to ensure uninterrupted service. For inquiries, contact {{5}}."* |
| `payment_overdue_notice` | `UTILITY` | Text | *"Dear {{1}}, invoice {{2}} for PKR {{3}} is past due (due was {{4}}). Please clear this outstanding balance immediately to avoid disconnection. Contact {{5}} for payment guidance."* |
| `payment_receipt_confirmation` | `UTILITY` | Document (PDF) | *"Dear {{1}}, we have received your payment of PKR {{2}} via {{3}} (Receipt #{{4}}). Your updated outstanding balance is PKR {{5}}. Thank you for choosing Energy Gurus! Your official receipt is attached."* |
| `service_suspension_nonpayment`| `UTILITY` | Text | *"Dear {{1}}, your solar monitoring and O&M service for Customer ID {{2}} has been temporarily suspended due to outstanding dues of PKR {{3}}. Please clear your dues and share proof of payment with {{4}} for immediate restoration."* |
| `service_restored_confirmation`| `UTILITY` | Text | *"Dear {{1}}, thank you for clearing your outstanding dues! Your solar O&M service for Customer ID {{2}} has been fully restored as of {{3}}."* |
| `ticket_registered_ack` | `UTILITY` | Text | *"Dear {{1}}, your support request has been registered under Ticket #{{2}} (Category: {{3}}). Our {{4}} team is reviewing your complaint with an expected resolution within {{5}}. Contact {{6}} for urgent updates."* |
| `ticket_resolved_closure` | `UTILITY` | Text | *"Dear {{1}}, your Ticket #{{2}} has been resolved on {{3}}. Remarks: {{4}}. Thank you for choosing Energy Gurus!"* |
| `daily_solar_generation_report`| `UTILITY` | Text | *"Dear {{1}}, your solar generation summary for {{2}}:\n⚡ Today's Generation: {{3}} kWh (Units)\n📊 Month-to-Date: {{4}} kWh (Units)\n📈 Year-to-Date: {{5}} kWh (Units)\nEnergy Gurus Solar Monitoring"* |

> **Note:** All `UTILITY` templates are evaluated automatically by Meta AI and typically approved within **1 to 5 minutes**.

---

### 5. Configure Meta Webhooks
1. In Meta App Dashboard, go to **WhatsApp** ➔ **Configuration** ➔ **Webhook**.
2. Click **Edit**:
   * **Callback URL:** `https://crm.energygurus.pk/api/webhooks/whatsapp`
   * **Verify Token:** `energy_gurus_crm_webhook_secure_token_2026` (Matches `WHATSAPP_WEBHOOK_VERIFY_TOKEN`).
3. Under **Webhook Fields**, subscribe to:
   * `messages` (Real-time delivery status: `sent`, `delivered`, `read`, `failed` + inbound replies).

---

## 🧪 Testing Your WhatsApp Setup

You can test message dispatch directly via the Next.js API or curl:

```bash
curl -X POST https://crm.energygurus.pk/api/cron/invoicing \
  -H "Authorization: Bearer your_secure_cron_secret_here"
```

All sent messages and real-time delivery statuses are logged in the CRM database under `CommunicationLog` (`channel: 'WHATSAPP'`).