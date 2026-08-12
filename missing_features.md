# Missing Features & Clarifications (EnergyGurus CRM)

This document tracks open questions, missing implementations, and discrepancies in the provided requirements that need to be clarified by the client before or during development.

## ❓ Open CRM Questions for the Client

1. **Dashboard & Analytics:** 
   - The current routing states that users go directly to the "User Search" page after login. Is a high-level visual dashboard required for Managers (e.g., showing total sales, active tickets, and revenue)?

2. **Automated Invoicing:** 
   - Should the system automatically generate recurring invoices at the end of a customer's billing cycle (Monthly, Quarterly, Half-Yearly, Yearly), or will invoices be generated manually by the Billing department?

3. **Customer Notifications:** 
   - Does the system need to send automated SMS or Email notifications to customers? (e.g., when a support ticket is created/resolved, or when a payment is due).

4. **Inventory Tracking:** 
   - The navigation menu mentions "Inventory Management". Do we need to track physical warehouse stock and specific serial numbers of hardware (inverters, panels, batteries) before they are assigned to a customer?

5. **Technician Assignment Workflow:** 
   - When a "Technical Complaint" ticket is generated, is there a specific workflow required to assign it to a field technician and track their dispatch/completion status, or is it just handled generally by the O&M department?

6. **Custom Pricing Logic:**
   - For systems "30 kW & Above", the pricing is marked as 0 in the provided sheet. Does this mean it requires manual custom quoting, or is there a formula that needs to be implemented? 

---
*Please review these questions with the stakeholders to finalize the CRM scope.*
