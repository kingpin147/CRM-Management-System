# CRM System — Requirements Review & Feature Tracking

> **Status Update (2026-08-07):**
> We have reviewed two primary operational account roles:
> 1. **Billing Account / Role**: Previously reviewed, covering extensive billing sub-navigation tabs (Credit/Debit Adjustments, Invoices, Auth 1 & Auth 2 Approvals, Payment Adjustments, Radius Sessions, etc., as documented in Section 3.5 of `requirements.md`).
> 2. **Sales Manager Account / Role**: Step-by-step review completed (Reports, Sales, Complain Management, SD).
> 
> ⚠️ **Pending Review**: The **Admin / Super Admin Account** has **not yet been reviewed**. This is where master user management (adding/creating Billing Managers, Sales Managers, role assignments, and permission controls) takes place.

---

## ✅ Reviewed Account Roles

### 1. Billing Account Role (Reviewed Previously)
- **Scope**: Billing, accounting, and financial management.
- **Key Modules Documented in `requirements.md`**:
  - Credit & Debit Adjustments
  - ServiceWise Status Changed
  - Transaction Approval & Transaction Approval 2 (Auth 1 / Auth 2)
  - Transaction Ledger
  - Asset Invoice & Asset Invoice Approval
  - Service Invoice & Services Invoice Approval
  - Payment Adjustment & Payments Approval
  - Non-Payment Block & Temporary Block Active
  - Reset Radius Sessions
  - Customer Package Details & PendingList CPM

### 2. Sales Manager Account Role (Fully Reviewed & Clarified)
1. **Post-Login Default Page**:
   - Redirects directly to `User/Search` (Advance Search Filter + Advance Search Result grid with View Customer eye icon leading to full Customer Profile).

2. **Top Navigation Tabs (4 Basic Tabs)**:
   - **Reports**: ConnectivityWise Report (`/EReports/ConnectivityWiseReport`), Customer Status Report (`/EReports/CustomerStatusHistoryReport`).
   - **Sales**: Create Sale (5-step wizard), Pending Sale (`/Sales/PendingList`).
   - **Complain Management**: Pending Complains (`/Complain/PendingComplains`).
   - **SD**: Inventory Management (`/SD/Profiles`).

3. **Key Workflows Verified**:
   - **Create Sale**: 5-step wizard form (Step 1: Account -> Step 2: Installation Address -> Step 3: Billing Address -> Step 4: Customer Support -> Step 5: Packages with Add Packages modal).
   - **Pending Sale**: Grid with `Proceed to CPM` tick icon button and `View` document icon button (opens pre-populated 5-step form wizard for updates).
   - **Pending Complains & Edit Complain**: Advance search filter form, table with row edit icon navigating to `/Complain/EditComplain/{id}` page with complaint history table.
   - **Inventory Management (`/SD/Profiles`)**: Table with year selector, reason dropdown, Transfer button, and row edit icon opening the **Allocate Inventory** modal.

---

## ⏳ Pending Account Review & Next Steps

1. **Admin / Super Admin Account Review (Pending)**:
   - **User & Role Management**: Interface and flows for adding, creating, and managing Billing Managers, Sales Managers, Managers, and NOC/Support staff.
   - **Access Control & Permissions**: Role-based permission controls (RBAC) and administrative feature toggles.
   - **System Configurations**: Master settings, financial approval limits (Auth 1 / Auth 2 thresholds), and system logs.

2. **Notification & Automation Rules**:
   - Trigger conditions for SMS/Email notifications on ticket assignment, CPM transfer, or account block.

---
*Updated by: Development Team | Date: 2026-08-07*
