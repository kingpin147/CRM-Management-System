# Meta WhatsApp Cloud API Messaging Scenarios & Requirements Specification

> **Contact / Reference:** +92 316 4266004  
> **System Architecture:**  
> - **Frontend & API Handlers:** Next.js (App Router / React)  
> - **Backend / ORM:** Node.js, Prisma ORM, PostgreSQL  
> - **Provider Protocol:** Meta WhatsApp Cloud API (Graph API v21.0) via Official Meta Graph Endpoints  

---

## 📋 Overview

This document outlines the complete set of business scenarios, triggers, Meta message classifications, template parameters, and JSON payload requirements for automated customer notifications in **Energy Guru CRM**.

All communications leverage the official **Meta WhatsApp Cloud API** with:
- **Pre-Approved Meta Message Templates** (Utility & Marketing categories).
- **Dynamic Parameter Injection** (`{{1}}`, `{{2}}`, etc.).
- **Rich Media & Document Attachments** (Customer Registration Form PDFs, Invoices, Receipts, Inspection Reports).
- **Interactive Quick Reply & Call-To-Action (CTA) Buttons**.
- **Real-Time Webhook Status Tracking** (`sent`, `delivered`, `read`, `failed`).

---

## 🔌 Meta WhatsApp Cloud API Architecture

### Endpoint
```http
POST https://graph.facebook.com/v21.0/{{WHATSAPP_PHONE_NUMBER_ID}}/messages
Authorization: Bearer {{WHATSAPP_ACCESS_TOKEN}}
Content-Type: application/json
```

### Required Environment Variables
```env
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_ACCESS_TOKEN=EAAG...your_permanent_system_user_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secure_verify_token
NEXT_PUBLIC_APP_URL=https://crm.energygurus.pk
```

---

## 🚀 Scenario Specifications

### 1. Customer Welcome / Registration
* **Template Name:** `customer_welcome_crf`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event triggered when a new customer account is verified and activated in the CRM.
* **Header:** `DOCUMENT` (Customer Registration Form PDF - `crf_{{Customer_ID}}.pdf`)
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Customer ID (e.g., `101`)
  * `{{3}}` - CRF Number
  * `{{4}}` - Support Phone / Helpline
* **Template Body:**
  > *"Dear {{1}}, welcome to Energy Gurus! Your solar O&M service account has been successfully activated. Your Customer ID is {{2}} and CRF #{{3}}. Please find your official Customer Registration Form attached. For assistance, contact {{4}}."*
* **Buttons:**
  * Quick Reply: `Contact Support`
* **Meta API Payload Sample:**
  ```json
  {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "923164266004",
    "type": "template",
    "template": {
      "name": "customer_welcome_crf",
      "language": { "code": "en" },
      "components": [
        {
          "type": "header",
          "parameters": [
            {
              "type": "document",
              "document": {
                "link": "https://crm.energygurus.pk/api/documents/crf/101.pdf",
                "filename": "CRF_Registration_101.pdf"
              }
            }
          ]
        },
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "Nouman Attique" },
            { "type": "text", "text": "101" },
            { "type": "text", "text": "CRF-2026-00101" },
            { "type": "text", "text": "+92 316 4266004" }
          ]
        }
      ]
    }
  }
  ```

---

### 2. Monthly Invoice Dispatch
* **Template Name:** `monthly_invoice_dispatch`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Automated cron job executed on the **1st of every month** (or manually triggered by the Billing Manager).
* **Header:** `DOCUMENT` (Official Tax Invoice PDF)
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Invoice Number (e.g., `INV-2026-001`)
  * `{{3}}` - Billing Month / Period (e.g., `October 2026`)
  * `{{4}}` - Total Payable Amount (PKR)
  * `{{5}}` - Due Date (e.g., `10-Oct-2026`)
* **Template Body:**
  > *"Dear {{1}}, your solar O&M invoice {{2}} for {{3}} amounting to PKR {{4}} is now generated. The payment due date is {{5}}. Please find your invoice PDF attached."*
* **Buttons:**
  * URL Button: `View Online Invoice` -> `https://crm.energygurus.pk/portal/invoice/{{2}}`
* **Meta API Payload Sample:**
  ```json
  {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "923164266004",
    "type": "template",
    "template": {
      "name": "monthly_invoice_dispatch",
      "language": { "code": "en" },
      "components": [
        {
          "type": "header",
          "parameters": [
            {
              "type": "document",
              "document": {
                "link": "https://crm.energygurus.pk/api/invoices/INV-2026-001/pdf",
                "filename": "Invoice_INV-2026-001.pdf"
              }
            }
          ]
        },
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "Nouman Attique" },
            { "type": "text", "text": "INV-2026-001" },
            { "type": "text", "text": "October 2026" },
            { "type": "text", "text": "4,500" },
            { "type": "text", "text": "10-Oct-2026" }
          ]
        },
        {
          "type": "button",
          "sub_type": "url",
          "index": "0",
          "parameters": [
            { "type": "text", "text": "INV-2026-001" }
          ]
        }
      ]
    }
  }
  ```

---

### 3. Payment Due Reminder
* **Template Name:** `payment_due_reminder`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Automated scheduled job dispatched **1 day before the invoice due date** for all unpaid accounts.
* **Header:** `TEXT` ("⏰ Energy Gurus - Payment Reminder")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Invoice Number
  * `{{3}}` - Amount Due (PKR)
  * `{{4}}` - Due Date
  * `{{5}}` - Support / Accounts Contact
* **Template Body:**
  > *"Dear {{1}}, this is a friendly reminder that invoice {{2}} of PKR {{3}} is due on {{4}}. Kindly settle the bill to avoid service disruption. For payment inquiries, contact {{5}}."*
* **Buttons:**
  * Quick Reply: `Payment Proof Submitted`

---

### 4. Overdue Payment Notice
* **Template Name:** `payment_overdue_notice`
* **Meta Category:** `UTILITY`
* **Trigger Event:** 
  1. Auto-dispatched after due date lapses.
  2. Ad-hoc dispatch triggered from the CRM Billing Management screen.
* **Header:** `TEXT` ("⚠️ Urgent: Overdue Notice")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Invoice Number
  * `{{3}}` - Overdue Amount (PKR)
  * `{{4}}` - Days Past Due
  * `{{5}}` - Helpline Contact
* **Template Body:**
  > *"Dear {{1}}, invoice {{2}} for PKR {{3}} is currently {{4}} days overdue. Please clear this outstanding balance immediately to prevent automated service suspension. Contact {{5}} for payment guidance."*

---

### 5. Payment Receipt Confirmation
* **Template Name:** `payment_receipt_confirmation`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event triggered immediately when a customer payment (Bank Transfer, Online, Cash) is verified and posted in the CRM.
* **Header:** `DOCUMENT` (Official Payment Receipt PDF - `Receipt_{{Receipt_Number}}.pdf`)
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Paid Amount (PKR)
  * `{{3}}` - Receipt Number (e.g., `RCP-87654321`)
  * `{{4}}` - Payment Date & Time
  * `{{5}}` - Remaining Outstanding Balance (PKR)
* **Template Body:**
  > *"Dear {{1}}, we have received your payment of PKR {{2}}. Receipt Number: {{3}} dated {{4}}. Your updated balance is PKR {{5}}. Thank you for choosing Energy Gurus! Your receipt is attached."*

---

### 6. Service Suspension (Non-Payment)
* **Template Name:** `service_suspension_nonpayment`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event triggered when account status is transitioned to `NON_PAYMENT_BLOCKED`.
* **Header:** `TEXT` ("⛔ Service Suspended")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Customer ID
  * `{{3}}` - Total Outstanding Amount (PKR)
  * `{{4}}` - Support Helpline
* **Template Body:**
  > *"Dear {{1}}, your solar monitoring and O&M service for Customer ID {{2}} has been temporarily suspended due to overdue dues of PKR {{3}}. Please clear the dues and share payment confirmation with {{4}} for immediate restoration."*

---

### 7. Service Restoration (After Payment)
* **Template Name:** `service_restored_confirmation`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event triggered when overdue payment is cleared and status updates back to `CONNECTION_ACTIVE`.
* **Header:** `TEXT` ("✅ Service Restored")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Customer ID
  * `{{3}}` - Restoration Timestamp
* **Template Body:**
  > *"Dear {{1}}, thank you for settling your dues! Your solar monitoring and O&M services for Customer ID {{2}} have been fully reactivated as of {{3}}."*

---

### 8. Temporary Suspension Notice (Customer Request)
* **Template Name:** `temporary_hold_notice`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event when a customer request for temporary pause (renovations/vacation) is marked `TEMPORARY_BLOCKED`.
* **Header:** `TEXT` ("⏸️ Service on Temporary Hold")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Customer ID
  * `{{3}}` - Effective Date
  * `{{4}}` - Helpline Contact
* **Template Body:**
  > *"Dear {{1}}, as per your request, your solar O&M service (Customer ID: {{2}}) has been placed on temporary hold starting {{3}}. To reactivate your service anytime, contact {{4}}."*

---

### 9. Temporary Suspension Reactivation
* **Template Name:** `temporary_hold_reactivated`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event when temporary hold is lifted back to `CONNECTION_ACTIVE`.
* **Header:** `TEXT` ("⚡ Service Reactivated")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Customer ID
  * `{{3}}` - Reactivation Date
* **Template Body:**
  > *"Dear {{1}}, your solar service for Customer ID {{2}} is now reactivated on {{3}}. Active telemetry and health monitoring are live."*

---

### 10. Ticket Registration
* **Template Name:** `ticket_registered_ack`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event when a customer support complaint or service ticket is opened.
* **Header:** `TEXT` ("🎫 Support Ticket Created")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Ticket Number (e.g., `TKT-2026-0042`)
  * `{{3}}` - Ticket Category (e.g., `Inverter Fault`)
  * `{{4}}` - SLA Resolution Target (e.g., `24 Hours`)
  * `{{5}}` - Support Helpline
* **Template Body:**
  > *"Dear {{1}}, your support request is registered under Ticket #{{2}} (Category: {{3}}). Our technical team is reviewing it with an expected SLA of {{4}}. For urgent queries, reach us at {{5}}."*

---

### 11. Ticket Resolution & Closure
* **Template Name:** `ticket_resolved_closure`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Real-time event when ticket status is updated to `RESOLVED` / `CLOSED`.
* **Header:** `TEXT` ("✨ Ticket Resolved")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Ticket Number
  * `{{3}}` - Resolution Summary
  * `{{4}}` - Closure Timestamp
* **Template Body:**
  > *"Dear {{1}}, your Ticket #{{2}} has been resolved and closed on {{4}}. Resolution Summary: {{3}}. Thank you for your patience!"*
* **Buttons:**
  * URL Button: `Rate Our Service` -> `https://crm.energygurus.pk/feedback/{{2}}`

---

### 12. Daily Performance Report
* **Template Name:** `daily_solar_generation_report`
* **Meta Category:** `UTILITY`
* **Trigger Event:** Scheduled cron job at **6:00 PM daily** fetching solar inverter generation data.
* **Header:** `TEXT` ("☀️ Daily Solar Report")
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Report Date
  * `{{3}}` - Generation Today (kWh)
  * `{{4}}` - MTD Generation (kWh)
  * `{{5}}` - YTD Generation (kWh)
* **Template Body:**
  > *"Dear {{1}}, here is your Solar Generation Summary for {{2}}:\n⚡ Today: {{3}} Units (kWh)\n📊 Month-to-Date: {{4}} Units (kWh)\n📈 Year-to-Date: {{5}} Units (kWh)\nThank you for choosing Energy Gurus!"*

---

### 13. Custom Broadcast / Maintenance Alert
* **Template Name:** `operational_broadcast_alert`
* **Meta Category:** `MARKETING` / `UTILITY`
* **Trigger Event:** Admin/Manager on-demand broadcast to all customers or filtered segments (e.g., grid downtime, scheduled maintenance).
* **Header:** `IMAGE` (Optional Maintenance Banner) or `TEXT`
* **Key Dynamic Parameters:**
  * `{{1}}` - Customer Name
  * `{{2}}` - Broadcast Notice Title
  * `{{3}}` - Notice Message Body
  * `{{4}}` - Support Contact
* **Template Body:**
  > *"Dear {{1}}, [Notice: {{2}}]\n{{3}}\nFor assistance, please reach out to {{4}}."*

---

## 📊 Meta WhatsApp Templates Summary Matrix

| # | Scenario Name | Meta Template Name | Meta Category | Header Type | Interactive Buttons |
|---|---|---|---|---|---|
| **1** | **Customer Welcome / Registration** | `customer_welcome_crf` | `UTILITY` | 📄 Document (CRF PDF) | Quick Reply |
| **2** | **Monthly Invoice Dispatch** | `monthly_invoice_dispatch` | `UTILITY` | 📄 Document (Invoice PDF) | Dynamic URL Button |
| **3** | **Payment Due Reminder** | `payment_due_reminder` | `UTILITY` | 📝 Text | Quick Reply |
| **4** | **Overdue Payment Notice** | `payment_overdue_notice` | `UTILITY` | 📝 Text | Quick Reply / Call |
| **5** | **Payment Receipt Confirmation** | `payment_receipt_confirmation` | `UTILITY` | 📄 Document (Receipt PDF) | — |
| **6** | **Service Suspension (Non-Payment)** | `service_suspension_nonpayment` | `UTILITY` | 📝 Text | Quick Reply |
| **7** | **Service Restoration (After Payment)** | `service_restored_confirmation` | `UTILITY` | 📝 Text | — |
| **8** | **Temporary Suspension (Customer Request)**| `temporary_hold_notice` | `UTILITY` | 📝 Text | Quick Reply |
| **9** | **Temporary Suspension Reactivation** | `temporary_hold_reactivated` | `UTILITY` | 📝 Text | — |
| **10**| **Ticket Registration** | `ticket_registered_ack` | `UTILITY` | 📝 Text | Quick Reply |
| **11**| **Ticket Resolution & Closure** | `ticket_resolved_closure` | `UTILITY` | 📝 Text | Dynamic URL (Rating) |
| **12**| **Daily Performance Report** | `daily_solar_generation_report` | `UTILITY` | 📝 Text | — |
| **13**| **Custom Broadcast / Maintenance Alert** | `operational_broadcast_alert` | `MARKETING` | 🖼️ Image / Text | Quick Reply |

---

## ⚙️ Meta Webhooks & Delivery Status Integration

### 1. Webhook Verification Endpoint (`GET /api/webhooks/whatsapp`)
```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}
```

### 2. Real-Time Status & Inbound Message Processing (`POST /api/webhooks/whatsapp`)
Meta sends instant JSON event notifications for:
- **Message Status Updates:** `sent` ➔ `delivered` ➔ `read` ➔ `failed`. Updates the `CommunicationLog` table.
- **Inbound Customer Replies:** 24-hour customer service window activation. Automatically logs conversation history or creates a support ticket.
