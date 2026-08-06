# CRM System — Requirements Review & Feature Tracking

> **Status Update (2026-08-06):**
> We have completed a full, step-by-step review of the **Sales Manager** account role across all tabs and pages based on live screenshots. All specifications for the Sales Manager workflow are fully documented in `requirements.md`.

---

## ✅ Sales Manager Account Role — Fully Reviewed & Clarified

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

## 🟢 Remaining Clarifications & Next Steps

1. **Billing / Admin Role Deep-Dive**:
   - Review and verify admin-specific billing workflows (Auth 1 / Auth 2 approval rules, asset/service invoice approval limits) when reviewing additional account roles.
2. **Notification & Automation Rules**:
   - Trigger conditions for SMS/Email notifications on ticket assignment, CPM transfer, or account block.

---
*Updated by: Development Team | Date: 2026-08-06*
