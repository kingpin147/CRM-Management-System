# Meta WhatsApp Cloud API Specification & Scenarios

> **Client / Organization:** Energy Gurus (Solar O&M Management System)  
> **Contact / Helpline Reference:** +92 316 4266004  
> **CRM Tech Stack:** Next.js (App Router), Prisma ORM, PostgreSQL, Tailwind CSS  
> **API Protocol:** Meta WhatsApp Cloud API (Graph API v21.0) via Official Meta Endpoints  
> **Rule Requirement:** All automated/system-initiated messages require **Meta Pre-Approved Templates** under the **`UTILITY`** category.

---

## 📋 1. Architectural Overview

This document specifies the end-to-end integration requirements for automated and ad-hoc WhatsApp messaging across all **13 core business scenarios** in the Energy Gurus CRM.

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│     CRM Event Triggers    │ ───► │   Next.js API & Services  │ ───► │  Meta WhatsApp Cloud API  │
│ (Cron / Webhook / UI Action)│      │  (src/lib/whatsapp.ts)    │      │  (Graph API v21.0)        │
└───────────────────────────┘      └─────────────┬─────────────┘      └─────────────┬─────────────┘
                                                 │                                  │
                                                 ▼                                  ▼
                                   ┌───────────────────────────┐      ┌───────────────────────────┐
                                   │ Prisma DB CommunicationLog│ ◄─── │ Meta Delivery Webhooks    │
                                   │ (channel: 'WHATSAPP')     │      │ (sent, delivered, read)   │
                                   └───────────────────────────┘      └───────────────────────────┘
```

### 🔐 Meta WhatsApp Business Rules
1. **Business-Initiated Messages (Automated System Notifications):**
   * Whenever the CRM sends a notification without prior customer message, it **MUST use a pre-approved template**.
   * Category: All 12 transactional & notification scenarios below use **`UTILITY`** (approved in 1–5 minutes by Meta). Scenario 13 uses **`MARKETING`** / **`UTILITY`**.
2. **Customer-Initiated Messages (Customer Support):**
   * When a customer replies on WhatsApp, a **24-hour Customer Care Window** opens.
   * Within this window, the CRM agent or bot can send **free-form text & media** without template approval.
3. **Delivery Webhooks:**
   * Meta sends asynchronous status updates (`sent` ➔ `delivered` ➔ `read` ➔ `failed`) which are saved directly to `CommunicationLog`.

---

## ⚙️ 2. Environment Configuration

Add the following to `.env`:

```env
# Meta WhatsApp Cloud API Configuration
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_ACCESS_TOKEN=EAAG...your_permanent_system_user_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=energy_gurus_crm_webhook_secure_token_2026

# CRM Public URL for Dynamic Media & Document Hosting
NEXT_PUBLIC_APP_URL=https://crm.energygurus.pk
CRON_SECRET=your_secure_cron_secret
```

---

## 🚀 3. Comprehensive Scenario Specifications & Template Mappings

---

### Scenario 1: Customer Welcome & Registration Form (CRF)
* **Meta Template Name:** `customer_welcome_crf`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered in `src/app/api/signup/route.ts` or when customer status moves to `CONNECTION_ACTIVE` / `PENDING_ACTIVATION`.
* **Prisma Model Mapping:** `Customer.fullName`, `Customer.customerCode`, `Customer.crfNumber`
* **Header:** `DOCUMENT` (Auto-generated CRF PDF: `{{NEXT_PUBLIC_APP_URL}}/api/customers/{{Customer_ID}}/crf`)
* **Body Text Template:**
  > *"Dear {{1}}, welcome to Energy Gurus! Your solar O&M service account has been successfully registered. Your Customer Code is {{2}} (CRF #{{3}}). Please find your official Customer Registration Form attached. For assistance, contact our helpline at {{4}}."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Customer.customerCode` (e.g. `101`)
  * `{{3}}` -> `Customer.crfNumber` (e.g. `CRF-2026-00101`)
  * `{{4}}` -> `+92 316 4266004`
* **Buttons:**
  * Quick Reply: `Contact Support`

#### Meta Graph API Payload:
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
              "link": "https://crm.energygurus.pk/api/customers/c0a80101-0001-4000-8000-000000000001/crf",
              "filename": "Customer_Registration_Form_101.pdf"
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

### Scenario 2: Monthly Invoice Dispatch
* **Meta Template Name:** `monthly_invoice_dispatch`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Automated cron job at `src/app/api/cron/invoicing/route.ts` executed on the **1st of every month** or via manual single invoice dispatch in Billing Management.
* **Prisma Model Mapping:** `Invoice.invoiceNumber`, `Invoice.totalAmount`, `Invoice.dueDate`, `Invoice.billingPeriod`, `Customer.fullName`
* **Header:** `DOCUMENT` (Official Tax Invoice PDF: `{{NEXT_PUBLIC_APP_URL}}/api/invoice/{{Invoice_ID}}/pdf`)
* **Body Text Template:**
  > *"Dear {{1}}, your solar O&M invoice {{2}} for {{3}} amounting to PKR {{4}} has been generated. The payment due date is {{5}}. Please review your invoice PDF attached below."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Invoice.invoiceNumber` (e.g. `INV-2026-001`)
  * `{{3}}` -> `Formatted Billing Period` (e.g. `October 2026`)
  * `{{4}}` -> `Formatted Invoice Total` (e.g. `4,500`)
  * `{{5}}` -> `Formatted Due Date` (e.g. `10-Oct-2026`)
* **Buttons:**
  * URL Button: `View Online Invoice` ➔ `https://crm.energygurus.pk/api/invoice/{{1}}`

#### Meta Graph API Payload:
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
              "link": "https://crm.energygurus.pk/api/invoice/inv_01/pdf",
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
          { "type": "text", "text": "4,500.00" },
          { "type": "text", "text": "10-Oct-2026" }
        ]
      },
      {
        "type": "button",
        "sub_type": "url",
        "index": "0",
        "parameters": [
          { "type": "text", "text": "inv_01" }
        ]
      }
    ]
  }
}
```

---

### Scenario 3: Payment Due Reminder
* **Meta Template Name:** `payment_due_reminder`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Cron job at `src/app/api/cron/reminders/route.ts` running daily checking for unpaid invoices with `dueDate` in 1–3 days.
* **Prisma Model Mapping:** `Invoice.invoiceNumber`, `Invoice.totalAmount`, `Invoice.dueDate`, `Customer.fullName`
* **Header:** `TEXT` ("⏰ Energy Gurus - Payment Reminder")
* **Body Text Template:**
  > *"Dear {{1}}, this is a friendly reminder that your solar O&M bill for invoice {{2}} amounting to PKR {{3}} is due on {{4}}. Kindly settle your bill to ensure uninterrupted service. For inquiries, contact {{5}}."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Invoice.invoiceNumber`
  * `{{3}}` -> `Invoice.totalAmount`
  * `{{4}}` -> `Formatted Due Date`
  * `{{5}}` -> `+92 316 4266004`
* **Buttons:**
  * Quick Reply: `Payment Proof Submitted`

---

### Scenario 4: Overdue Payment Notice
* **Meta Template Name:** `payment_overdue_notice`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Cron job at `src/app/api/cron/overdue/route.ts` (7+ days past due) + Ad-hoc reminder button on Billing screen.
* **Prisma Model Mapping:** `Invoice.invoiceNumber`, `Invoice.totalAmount`, `Invoice.dueDate`, `Customer.fullName`
* **Header:** `TEXT` ("⚠️ Urgent: Overdue Payment Notice")
* **Body Text Template:**
  > *"Dear {{1}}, invoice {{2}} for PKR {{3}} is past due (due was {{4}}). Please clear this outstanding balance immediately to avoid disconnection. Contact {{5}} for payment guidance."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Invoice.invoiceNumber`
  * `{{3}}` -> `Invoice.totalAmount`
  * `{{4}}` -> `Formatted Due Date`
  * `{{5}}` -> `+92 316 4266004`
* **Buttons:**
  * Quick Reply: `Request Extension`

---

### Scenario 5: Payment Receipt Confirmation
* **Meta Template Name:** `payment_receipt_confirmation`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered in real time when a `Transaction` is approved or `LedgerEntry` credit is added.
* **Prisma Model Mapping:** `Transaction.amount`, `Transaction.paymentMethod`, `LedgerEntry.balance`, `Customer.fullName`
* **Header:** `DOCUMENT` (Official Receipt PDF: `{{NEXT_PUBLIC_APP_URL}}/api/receipt/{{Transaction_ID}}`)
* **Body Text Template:**
  > *"Dear {{1}}, we have received your payment of PKR {{2}} via {{3}} (Receipt #{{4}}). Your updated outstanding balance is PKR {{5}}. Thank you for choosing Energy Gurus! Your official receipt is attached."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Transaction.amount`
  * `{{3}}` -> `Transaction.paymentMethod`
  * `{{4}}` -> `Receipt / Transaction Ref`
  * `{{5}}` -> `Current Ledger Balance`

---

### Scenario 6: Service Suspension (Non-Payment)
* **Meta Template Name:** `service_suspension_nonpayment`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered when `CustomerStatus` changes to `NON_PAYMENT_BLOCKED`.
* **Prisma Model Mapping:** `Customer.fullName`, `Customer.customerCode`, `LedgerEntry.balance`
* **Header:** `TEXT` ("⛔ Service Suspended")
* **Body Text Template:**
  > *"Dear {{1}}, your solar monitoring and O&M service for Customer ID {{2}} has been temporarily suspended due to outstanding dues of PKR {{3}}. Please clear your dues and share proof of payment with {{4}} for immediate restoration."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Customer.customerCode`
  * `{{3}}` -> `Total Outstanding Balance`
  * `{{4}}` -> `+92 316 4266004`

---

### Scenario 7: Service Restoration (After Payment)
* **Meta Template Name:** `service_restored_confirmation`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered when `CustomerStatus` transitions from `NON_PAYMENT_BLOCKED` back to `CONNECTION_ACTIVE`.
* **Prisma Model Mapping:** `Customer.fullName`, `Customer.customerCode`
* **Header:** `TEXT` ("✅ Service Restored")
* **Body Text Template:**
  > *"Dear {{1}}, thank you for clearing your outstanding dues! Your solar O&M service for Customer ID {{2}} has been fully restored as of {{3}}."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Customer.customerCode`
  * `{{3}}` -> `Formatted Current Date & Time`

---

### Scenario 8: Temporary Suspension Notice (Customer Request)
* **Meta Template Name:** `temporary_hold_notice`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered when `CustomerStatus` transitions to `TEMPORARY_BLOCKED`.
* **Prisma Model Mapping:** `Customer.fullName`, `Customer.customerCode`
* **Header:** `TEXT` ("⏸️ Service on Temporary Hold")
* **Body Text Template:**
  > *"Dear {{1}}, as per your request, your solar O&M service (Customer ID: {{2}}) has been placed on temporary hold effective {{3}}. To reactivate your service anytime, contact {{4}}."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Customer.customerCode`
  * `{{3}}` -> `Formatted Effective Date`
  * `{{4}}` -> `+92 316 4266004`

---

### Scenario 9: Temporary Suspension Reactivation
* **Meta Template Name:** `temporary_hold_reactivated`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered when `CustomerStatus` transitions from `TEMPORARY_BLOCKED` to `CONNECTION_ACTIVE`.
* **Prisma Model Mapping:** `Customer.fullName`, `Customer.customerCode`
* **Header:** `TEXT` ("⚡ Service Reactivated")
* **Body Text Template:**
  > *"Dear {{1}}, your solar service for Customer ID {{2}} has been successfully reactivated on {{3}}. Active system monitoring and support features are now live."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Customer.customerCode`
  * `{{3}}` -> `Formatted Reactivation Date`

---

### Scenario 10: Ticket Registration / Complaint Acknowledgement
* **Meta Template Name:** `ticket_registered_ack`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered in `src/app/dashboard/customers/[id]/CustomerTicketForm.tsx` when a new `Ticket` is created.
* **Prisma Model Mapping:** `Ticket.ticketNumber`, `Ticket.category`, `Ticket.assignedTo`, `Customer.fullName`
* **Header:** `TEXT` ("🎫 Support Ticket Registered")
* **Body Text Template:**
  > *"Dear {{1}}, your support request has been registered under Ticket #{{2}} (Category: {{3}}). Our {{4}} team is reviewing your complaint with an expected resolution within {{5}}. Contact {{6}} for urgent updates."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Ticket.ticketNumber` (e.g. `TKT-2026-0042`)
  * `{{3}}` -> `Ticket.category` (e.g. `Inverter Fault`)
  * `{{4}}` -> `Ticket.assignedTo` (e.g. `O&M Technical`)
  * `{{5}}` -> `24 Hours`
  * `{{6}}` -> `+92 316 4266004`

---

### Scenario 11: Ticket Resolution & Closure
* **Meta Template Name:** `ticket_resolved_closure`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Triggered when `TicketStatus` is updated to `RESOLVED` or `CLOSED`.
* **Prisma Model Mapping:** `Ticket.ticketNumber`, `TicketHistory.remarks`, `Customer.fullName`
* **Header:** `TEXT` ("✨ Ticket Resolved")
* **Body Text Template:**
  > *"Dear {{1}}, your Ticket #{{2}} has been resolved on {{3}}. Remarks: {{4}}. Thank you for choosing Energy Gurus!"*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Ticket.ticketNumber`
  * `{{3}}` -> `Formatted Closure Date`
  * `{{4}}` -> `Resolution Summary Remarks`
* **Buttons:**
  * URL Button: `Rate Our Service` ➔ `https://crm.energygurus.pk/feedback/{{1}}`

---

### Scenario 12: Daily Solar Performance Report
* **Meta Template Name:** `daily_solar_generation_report`
* **Meta Category:** `UTILITY`
* **CRM Trigger:** Cron job at `src/app/api/cron/solar-reports/route.ts` executed daily at **6:00 PM**.
* **Prisma Model Mapping:** `SolarSystem.totalWattage`, Inverter Telemetry, `Customer.fullName`
* **Header:** `TEXT` ("☀️ Daily Solar Generation Report")
* **Body Text Template:**
  > *"Dear {{1}}, your solar generation summary for {{2}}:\n⚡ Today's Generation: {{3}} kWh (Units)\n📊 Month-to-Date: {{4}} kWh (Units)\n📈 Year-to-Date: {{5}} kWh (Units)\nEnergy Gurus Solar Monitoring"*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Formatted Report Date`
  * `{{3}}` -> `Today's Units (kWh)`
  * `{{4}}` -> `Month-to-Date Units (kWh)`
  * `{{5}}` -> `Year-to-Date Units (kWh)`

---

### Scenario 13: Operational Broadcast / Scheduled Maintenance Alert
* **Meta Template Name:** `operational_broadcast_alert`
* **Meta Category:** `MARKETING` / `UTILITY`
* **CRM Trigger:** Triggered on-demand by Admins from the CRM Broadcast / Notification screen.
* **Prisma Model Mapping:** `Customer.fullName`
* **Header:** `IMAGE` (Maintenance Banner URL) or `TEXT` ("📢 Energy Gurus Notice")
* **Body Text Template:**
  > *"Dear {{1}}, [Notice: {{2}}]\n{{3}}\nFor any assistance or questions, please contact our helpline at {{4}}."*
* **Variable Replacements:**
  * `{{1}}` -> `Customer.fullName`
  * `{{2}}` -> `Broadcast Subject Title`
  * `{{3}}` -> `Broadcast Message Body`
  * `{{4}}` -> `+92 316 4266004`

---

## 📊 4. Master Meta Template Summary Matrix

| # | Scenario Name | Meta Template Name | Meta Category | Header Type | Interactive Buttons |
|---|---|---|---|---|---|
| **1** | **Customer Welcome & CRF** | `customer_welcome_crf` | `UTILITY` | 📄 Document (`CRF.pdf`) | Quick Reply |
| **2** | **Monthly Invoice Dispatch** | `monthly_invoice_dispatch` | `UTILITY` | 📄 Document (`Invoice.pdf`)| Dynamic URL |
| **3** | **Payment Due Reminder** | `payment_due_reminder` | `UTILITY` | 📝 Text | Quick Reply |
| **4** | **Overdue Payment Notice** | `payment_overdue_notice` | `UTILITY` | 📝 Text | Quick Reply |
| **5** | **Payment Receipt Confirmation** | `payment_receipt_confirmation` | `UTILITY` | 📄 Document (`Receipt.pdf`)| — |
| **6** | **Service Suspension (Non-Payment)** | `service_suspension_nonpayment` | `UTILITY` | 📝 Text | Quick Reply |
| **7** | **Service Restoration (After Payment)** | `service_restored_confirmation` | `UTILITY` | 📝 Text | — |
| **8** | **Temporary Suspension (Customer Request)**| `temporary_hold_notice` | `UTILITY` | 📝 Text | Quick Reply |
| **9** | **Temporary Suspension Reactivation** | `temporary_hold_reactivated` | `UTILITY` | 📝 Text | — |
| **10**| **Ticket Registration** | `ticket_registered_ack` | `UTILITY` | 📝 Text | Quick Reply |
| **11**| **Ticket Resolution & Closure** | `ticket_resolved_closure` | `UTILITY` | 📝 Text | Dynamic URL |
| **12**| **Daily Performance Report** | `daily_solar_generation_report` | `UTILITY` | 📝 Text | — |
| **13**| **Broadcast / Maintenance Alert** | `operational_broadcast_alert` | `MARKETING` | 🖼️ Image / Text | Quick Reply |

---

## 💻 5. Next.js Meta WhatsApp Client Implementation (`src/lib/whatsapp.ts`)

```typescript
// src/lib/whatsapp.ts
import prisma from '@/lib/prisma'

const WHATSAPP_API_URL = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v21.0'}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

interface SendWhatsAppTemplateParams {
  customerId: string
  recipientPhone: string
  templateName: string
  languageCode?: string
  bodyParams: string[]
  headerDocument?: {
    link: string
    filename: string
  }
  headerImage?: string
  urlButtonParam?: string
  type: 'INVOICE' | 'DUE_REMINDER' | 'OVERDUE_REMINDER' | 'RECEIPT' | 'WELCOME' | 'TICKET' | 'STATUS_CHANGE' | 'REPORT' | 'BROADCAST'
  invoiceId?: string
}

export async function sendWhatsAppTemplate(params: SendWhatsAppTemplateParams) {
  const { customerId, recipientPhone, templateName, languageCode = 'en', bodyParams, headerDocument, headerImage, urlButtonParam, type, invoiceId } = params

  // Format recipient phone number: ensure country code (e.g., 923164266004)
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '')
  const formattedPhone = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone

  const components: any[] = []

  // 1. Header component (Document or Image)
  if (headerDocument) {
    components.push({
      type: 'header',
      parameters: [{ type: 'document', document: headerDocument }]
    })
  } else if (headerImage) {
    components.push({
      type: 'header',
      parameters: [{ type: 'image', image: { link: headerImage } }]
    })
  }

  // 2. Body parameters
  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((val) => ({ type: 'text', text: String(val) }))
    })
  }

  // 3. Dynamic URL Button parameters
  if (urlButtonParam) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: urlButtonParam }]
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
      components
    }
  }

  try {
    const res = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    const isSuccess = res.ok && data.messages?.[0]?.id

    // Log to Prisma CommunicationLog
    const log = await prisma.communicationLog.create({
      data: {
        customerId,
        channel: 'WHATSAPP',
        type,
        recipient: formattedPhone,
        messageBody: `[Template: ${templateName}] Params: ${bodyParams.join(', ')}`,
        status: isSuccess ? 'SENT' : 'FAILED',
        externalId: data.messages?.[0]?.id || null,
        invoiceId: invoiceId || null,
        errorDetails: !isSuccess ? JSON.stringify(data.error || data) : null,
        sentAt: new Date()
      }
    })

    return { success: isSuccess, wamid: data.messages?.[0]?.id, log, error: !isSuccess ? data.error : null }
  } catch (err: any) {
    console.error('Failed to dispatch Meta WhatsApp template:', err)
    return { success: false, error: err.message }
  }
}
```

---

## 🔄 6. Webhooks Route (`src/app/api/webhooks/whatsapp/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 1. Webhook Verification for Meta App Setup
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// 2. Real-time Status & Inbound Events Listener
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]?.value

    // Process Status Updates: sent -> delivered -> read -> failed
    if (changes?.statuses?.length > 0) {
      const statusObj = changes.statuses[0]
      const wamid = statusObj.id
      const status = statusObj.status?.toUpperCase() // DELIVERED, READ, FAILED

      const updateData: any = { status }
      if (status === 'DELIVERED') updateData.deliveredAt = new Date(Number(statusObj.timestamp) * 1000)
      if (status === 'READ') updateData.openedAt = new Date(Number(statusObj.timestamp) * 1000)
      if (status === 'FAILED') updateData.errorDetails = JSON.stringify(statusObj.errors || statusObj)

      await prisma.communicationLog.updateMany({
        where: { externalId: wamid },
        data: updateData
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('WhatsApp Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```
