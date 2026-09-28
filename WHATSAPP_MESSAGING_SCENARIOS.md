# WhatsApp & SMS Messaging Scenarios & Requirements Specification

> **Contact / Reference:** +92 316 4266004  
> **System Architecture:**  
> - **Frontend & API Handlers:** Next.js (App Router / React)  
> - **Backend / ORM:** Node.js, Prisma ORM, PostgreSQL  
> - **Status:** Provider Agnostic (Ready for WhatsApp Business API / SMS Gateway Integration)

---

## 📋 Overview

This document outlines the complete set of business scenarios, triggers, message classifications, and payload requirements for automated customer notifications in **Energy Guru CRM**. 

These scenarios are designed to support both **WhatsApp Business API (Cloud/On-Premise via BSP)** and **Transactional SMS** services with dynamic parameter injection and document/media attachments (e.g., PDF Invoices, Receipts, Registration Forms).

---

## 🚀 Scenario Specifications

### 1. Customer Welcome / Registration
* **Category:** Utility / Authentication / Onboarding
* **Trigger Event:** Triggered in real time when a new customer account is verified and activated in the CRM.
* **Delivery Payload:** Welcome text notification + **Customer Registration Form (CRF) PDF document attachment**.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Customer_ID}}` (e.g., `EG-001234`)
  * `{{CRF_Number}}`
  * `{{CRF_Document_URL}}` (or direct PDF attachment)
  * `{{Support_Contact}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, welcome to Energy Gurus! Your solar service account has been successfully activated. Customer ID: {{Customer_ID}}. Please find your official Customer Registration Form (CRF) attached. For support, reach us at {{Support_Contact}}."*

---

### 2. Monthly Invoice Dispatch
* **Category:** Recurring Utility / Billing
* **Trigger Event:** Scheduled cron job executed automatically on the **1st of every month** (or manually triggered by the Billing Manager).
* **Delivery Payload:** Billing summary message + **Tax Invoice PDF document link/attachment**.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Invoice_Number}}` (e.g., `INV-2026-001`)
  * `{{Billing_Period}}` (e.g., `September 2026`)
  * `{{Total_Payable_Amount}}` (PKR)
  * `{{Due_Date}}`
  * `{{Invoice_PDF_URL}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, your solar O&M invoice {{Invoice_Number}} for {{Billing_Period}} amounting to PKR {{Total_Payable_Amount}} is now available. Due Date: {{Due_Date}}. Download Invoice: {{Invoice_PDF_URL}}."*

---

### 3. Payment Due Reminder
* **Category:** Scheduled Reminder / Utility
* **Trigger Event:** Scheduled cron job dispatched **1 day prior to the invoice due date** for all unpaid accounts.
* **Delivery Payload:** Text reminder prompt.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Invoice_Number}}`
  * `{{Total_Payable_Amount}}` (PKR)
  * `{{Due_Date}}`
  * `{{Support_Contact}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, this is a friendly reminder that your invoice {{Invoice_Number}} of PKR {{Total_Payable_Amount}} is due tomorrow ({{Due_Date}}). Please settle your bill to ensure uninterrupted solar monitoring and maintenance service."*

---

### 4. Overdue Payment Notice
* **Category:** Utility / Billing Notice
* **Trigger Event:** 
  1. **Automated:** Dispatched once automatically by the system after the due date lapses.
  2. **Manual/Ad-Hoc:** CRM billing managers can trigger follow-up reminders directly from the Billing/Customer dashboard.
* **Delivery Payload:** Overdue alert text with outstanding breakdown.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Invoice_Number}}`
  * `{{Overdue_Amount}}` (PKR)
  * `{{Days_Overdue}}`
  * `{{Support_Contact}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, invoice {{Invoice_Number}} for PKR {{Overdue_Amount}} is past due. Kindly clear your outstanding payment immediately to avoid service suspension. Contact {{Support_Contact}} for payment assistance."*

---

### 5. Payment Receipt Confirmation
* **Category:** Transactional / Utility Confirmation
* **Trigger Event:** Triggered instantly in real time whenever a payment entry (Bank Transfer, Cash, Online) is recorded and verified in the CRM.
* **Delivery Payload:** Confirmation message + **Official Payment Receipt PDF attachment/link**.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Paid_Amount}}` (PKR)
  * `{{Receipt_Number}}` (e.g., `RCP-87654321`)
  * `{{Payment_Date}}`
  * `{{Current_Balance}}` (PKR)
  * `{{Receipt_PDF_URL}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, we have received your payment of PKR {{Paid_Amount}}. Receipt Number: {{Receipt_Number}} on {{Payment_Date}}. Your updated balance is PKR {{Current_Balance}}. Thank you for your payment!"*

---

### 6. Service Suspension (Non-Payment)
* **Category:** Account Alert / Utility
* **Trigger Event:** Triggered automatically in real time when a customer account status changes to `NON_PAYMENT_BLOCKED` or is suspended due to unpaid dues.
* **Delivery Payload:** Immediate suspension notice with outstanding amount and restoration instructions.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Customer_ID}}`
  * `{{Total_Outstanding_Amount}}` (PKR)
  * `{{Support_Contact}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, your solar monitoring and maintenance service has been temporarily suspended due to outstanding dues of PKR {{Total_Outstanding_Amount}}. Please clear your dues and share proof of payment with {{Support_Contact}} for immediate restoration."*

---

### 7. Service Restoration (After Payment)
* **Category:** Account Alert / Confirmation
* **Trigger Event:** Triggered in real time when overdue payment is cleared and the account status is updated back to `CONNECTION_ACTIVE`.
* **Delivery Payload:** Service reactivation confirmation.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Customer_ID}}`
  * `{{Restoration_Timestamp}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, thank you for clearing your outstanding dues. Your solar monitoring and O&M service (Customer ID: {{Customer_ID}}) has been successfully restored as of {{Restoration_Timestamp}}."*

---

### 8. Temporary Suspension Notice (Customer Request)
* **Category:** Service Management / Customer Request
* **Trigger Event:** Triggered in real time when a customer's formal request for a temporary hold/pause (e.g., renovation, relocation, vacant property) is approved and marked `TEMPORARY_BLOCKED` in the CRM.
* **Delivery Payload:** Confirmation of temporary suspension.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Customer_ID}}`
  * `{{Effective_Date}}`
  * `{{Support_Contact}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, as per your request, your solar O&M service (Customer ID: {{Customer_ID}}) has been placed on temporary hold starting {{Effective_Date}}. To reactivate your service anytime, please contact {{Support_Contact}}."*

---

### 9. Temporary Suspension Reactivation
* **Category:** Service Management / Reactivation
* **Trigger Event:** Triggered in real time when a temporarily held service is unblocked and reactivated back to `CONNECTION_ACTIVE`.
* **Delivery Payload:** Service live notification.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Customer_ID}}`
  * `{{Reactivation_Date}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, your solar service for Customer ID {{Customer_ID}} has been successfully reactivated on {{Reactivation_Date}}. All active monitoring and support features are now live."*

---

### 10. Ticket Registration
* **Category:** Customer Support / Incident Management
* **Trigger Event:** Dispatched instantly in real time when a customer complaint or service request ticket is registered in the CRM.
* **Delivery Payload:** Ticket acknowledgement with tracking details and SLA timelines.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Ticket_Number}}` (e.g., `TKT-2026-0042`)
  * `{{Ticket_Category}}` (e.g., `Inverter Fault`, `Billing Dispute`, `Site Inspection`)
  * `{{Estimated_Resolution_Time}}`
  * `{{Support_Contact}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, your support request has been registered under Ticket #{{Ticket_Number}} (Category: {{Ticket_Category}}). Our technical support team is reviewing it with an expected resolution within {{Estimated_Resolution_Time}}."*

---

### 11. Ticket Resolution & Closure
* **Category:** Customer Support / Resolution
* **Trigger Event:** Triggered in real time when a support ticket status is changed to `RESOLVED` / `CLOSED`.
* **Delivery Payload:** Resolution summary message with feedback/rating link.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Ticket_Number}}`
  * `{{Resolution_Summary}}`
  * `{{Closure_Date}}`
  * `{{Feedback_URL}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, your Ticket #{{Ticket_Number}} has been resolved and closed on {{Closure_Date}}. Summary: {{Resolution_Summary}}. If you have any further questions or wish to rate our service, please visit: {{Feedback_URL}}."*

---

### 12. Daily Performance Report
* **Category:** Periodic Operational Utility
* **Trigger Event:** Automated daily scheduled job executed at **6:00 PM** delivering solar generation analytics.
* **Delivery Payload:** Daily generation stats summary.
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Today_Units_kWh}}`
  * `{{MTD_Units_kWh}}` (Month-to-Date)
  * `{{YTD_Units_kWh}}` (Year-to-Date)
  * `{{Report_Date}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, your Solar System Daily Report for {{Report_Date}}:\n⚡ Generated Today: {{Today_Units_kWh}} Units\n📊 Month-to-Date: {{MTD_Units_kWh}} Units\n📈 Year-to-Date: {{YTD_Units_kWh}} Units\nThank you for choosing Energy Gurus!"*

---

### 13. Custom Broadcast / Maintenance Alert
* **Category:** Utility / Marketing Announcement
* **Trigger Event:** Triggered on-demand by CRM Admins or Operations managers to notify all customers or specific segmented groups (e.g., specific city, specific inverter brand, scheduled grid downtime).
* **Delivery Payload:** Custom rich-text broadcast message (optional image/banner attachment).
* **Key Dynamic Variables:**
  * `{{Customer_Name}}`
  * `{{Broadcast_Title}}`
  * `{{Broadcast_Body}}`
  * `{{Support_Contact}}`
* **Sample Text:**
  > *"Dear {{Customer_Name}}, [Notice: {{Broadcast_Title}}]\n{{Broadcast_Body}}\nFor any queries or emergency assistance, please contact us at {{Support_Contact}}."*

---

## 📊 Scenarios Summary Matrix

| # | Scenario Name | Category | Trigger Type | Media / Attachment |
|---|---|---|---|---|
| **1** | **Customer Welcome / Registration** | Onboarding / Utility | Real-time (Event) | 📄 CRF PDF Document |
| **2** | **Monthly Invoice Dispatch** | Recurring Utility | Scheduled (1st of month) | 📄 Invoice PDF Document / URL |
| **3** | **Payment Due Reminder** | Scheduled Reminder | Scheduled (T-1 Day before due) | 💬 Text / Link |
| **4** | **Overdue Payment Notice** | Billing Alert | Auto (Post Due) + Manual Ad-hoc | 💬 Text / Link |
| **5** | **Payment Receipt Confirmation** | Transactional | Real-time (Payment Event) | 📄 Payment Receipt PDF |
| **6** | **Service Suspension (Non-Payment)** | Account Alert | Real-time (Status Change) | 💬 Text / Alert |
| **7** | **Service Restoration (After Payment)** | Account Alert | Real-time (Status Change) | 💬 Text / Confirmation |
| **8** | **Temporary Suspension (Customer Request)**| Service Mgmt | Real-time (Status Change) | 💬 Text / Confirmation |
| **9** | **Temporary Suspension Reactivation** | Service Mgmt | Real-time (Status Change) | 💬 Text / Confirmation |
| **10**| **Ticket Registration** | Customer Support | Real-time (Ticket Create) | 💬 Text / SLA Details |
| **11**| **Ticket Resolution & Closure** | Customer Support | Real-time (Ticket Resolve) | 💬 Text / Feedback URL |
| **12**| **Daily Performance Report** | Periodic Utility | Scheduled (Daily 6:00 PM) | 💬 Text Summary |
| **13**| **Custom Broadcast / Maintenance Alert** | Announcement | On-Demand (Manual Admin) | 🖼️ Optional Banner / Text |

---

## ⚙️ Technical Delivery Requirements for Messaging Providers

When selecting and integrating the final WhatsApp / SMS provider, the implementation will require:
1. **REST API / Webhook Support:** JSON payload dispatch with authentication tokens.
2. **Template Pre-Approval Support:** Compatible with Meta/WhatsApp Business API template guidelines (Header, Body, Footer, Interactive Buttons).
3. **Media & Document Upload API:** Capability to pass hosted PDF URLs or Base64 binary streams for customer attachments.
4. **Delivery Status Webhooks:** Real-time callbacks (`SENT`, `DELIVERED`, `READ`, `FAILED`) mapped directly into the CRM's `CommunicationLog` table.
