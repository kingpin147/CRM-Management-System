# CRM System — Questions Before We Begin Development

Hi,

I have reviewed the CRM portal (`crm.optix.pk`) in detail and documented all the pages and features. Before we start building, I have a few important questions. Your answers will directly shape how we design and develop the system.

I have grouped them from most important to least important.

---

## 🔴 Must Answer First — These affect everything

**1. Is this the complete system, or is there a separate Admin panel?**
I noticed there is no option to add new customers, manage staff accounts, or assign user roles anywhere in the portal. Is there a separate Admin or Super Admin panel that handles these things, or do you want us to build that as part of this project?

**2. What should a user see immediately after logging in?**
Right now, after login, the system goes directly to a search page. Should there be a proper Home / Dashboard page first? If yes, what should it show — for example, summary numbers (active customers, pending complaints, revenue this month), charts, or quick shortcuts?

**3. Where and how are new customers added to the system?**
I could not find an "Add Customer" button anywhere. Do customers come from another system (like a field app or a separate sales portal), and this CRM just shows their data? Or do you want us to add that feature here?

**4. How many types of users (roles) will use this system?**
For example: Billing Officer, Billing Manager, Customer Support, Finance Manager, Admin, etc. And should each role only see certain pages? (e.g., a billing officer cannot see Payments Approval, but a manager can)

---

## 🟡 Important — Affects specific pages

**5. Who approves transactions at Level 1, and who approves at Level 2?**
I see the system has two approval steps (Authorization 1 and Authorization 2). Is this based on the user's role, or is it assigned individually to specific staff members?

**6. How do payments come into the system?**
I see a "Payment Adjustment" page, but no way to directly record a new payment from a customer. Do payments come automatically from KuickPay or other gateways, or do staff need to manually enter them?

**7. Can a submitted invoice be edited before it is approved?**
Once an Asset Invoice or Service Invoice is submitted for approval, can it be cancelled or changed, or is it locked?

**8. What are the options in the "Payment Method" dropdown?**
(For example: Cash, Cheque, Bank Transfer, KuickPay, JazzCash, Easypaisa?)

**9. What are the options in the "Voucher Type" dropdown?**
(Used in Credit Adjustment and Debit Adjustment forms)

---

## 🟡 Complaints — What else is needed?

**10. Can staff create a new complaint from the Complaints menu?**
Currently I only see a "Pending Complaints" list. Is there a way to open a new ticket from here, or does it only happen from the Customer Detail page?

**11. Are there more complaint pages we have not seen?**
For example: All Complaints, Resolved Complaints, Escalated Complaints, SLA tracking?

**12. Who can close or escalate a complaint — from this portal?**

---

## 🟢 Reports — Small details

**13. Can users filter reports by a custom date range?**
Some reports have filter forms, but I want to confirm — can all reports be filtered by a From / To date?

**14. Do any reports need a PDF export option?**
Currently all reports only have an "Export to Excel" button.

**15. Are there any reports that are hidden or only visible to certain roles?**

---

## 🟢 Customer Detail Page

**16. Can staff edit customer information from the Customer Detail page?**
From what I saw it looks read-only. Should it be editable?

**17. Are there more sections in the Customer Detail page that we have not seen?**
I documented: Profile, Package Details, Log Complaints, Recent Complaints.
Are there more, such as: Payment History, Service History, Documents / Attachments?

---

## 🟢 Notifications

**18. Should there be in-app notifications?**
For example, a notification bell that alerts a billing manager when a new transaction is submitted for their approval?

**19. Does the system send any emails or SMS to customers?**
For example: invoice generated, payment received, account blocked?

---

## Summary — Quick Decisions Needed

| # | Question | Why urgent |
|---|----------|------------|
| 1 | Is there a separate Admin panel? | Defines the full scope of the project |
| 2 | What is on the home/dashboard page? | Home page is completely undefined |
| 3 | Where are customers added? | No add-customer feature exists |
| 4 | How many roles, and what can each access? | Changes the entire menu and page structure |

Please feel free to answer as many as you can. Even partial answers will help us move forward quickly.

Looking forward to your reply.

---
*Prepared by: Development Team | Date: 2026-08-04*
