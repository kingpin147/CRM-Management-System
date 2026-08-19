# EnergyGurus Solar CRM Management System

A full-featured enterprise Customer Relationship Management (CRM) and Enterprise Operations Platform built specifically for solar energy companies.

---

## 🚀 Key Modules & Capabilities

### 1. 🔍 Customer Management & Unified Profiling
- **Strict Identifiers**:
  - **Customer ID**: Pure numeric digits (e.g. `9484`, `1001`, `1002`).
  - **CRF #**: Standardized 6-digit reference (e.g. `CRF-964256`).
- **Comprehensive Profiles**:
  - Customer personal details, CNIC verification, location/sub-area hierarchy.
  - Complete solar technical specs (DISCO, Net Metering type, Inverter brand/serial, Panels wattage & technology, Battery chemistry/serial, Earthing resistance ohms, Lightning & Breaker protections).
  - Active Package Subscription, Invoices, Real-time Customer Ledger, and Support Tickets.

---

### 2. 💼 Sales & 3-Stage Workflow Approval
- **Create Sale**: Detailed customer onboarding form with multi-step validation.
- **Manager Approval Pipeline**:
  - **Stage 1 (Sales Manager)**: Review signup details and approve lead.
  - **Stage 2 (Billing Manager)**: Verify advance security deposit and invoice payment.
  - **Stage 3 (O&M / Installation Manager)**: Verify solar installation and activate service.

---

### 3. 💳 Billing & CPM (Change Process Management)
- **Package & Status Change**:
  - Live dropdown matrix for System Type (kW), Package Tier (Basic, Moderate, Comprehensive), Billing Frequency (Monthly, Quarterly, Half-Yearly, Yearly), Monitoring Hours, and Status.
  - **Auto Financial Adjustments**: Automatically calculates the difference when upgrading/downgrading plans and posts real-time Debit/Credit adjustments directly to the customer ledger.
- **Manual Debit / Credit Notes (Maker-Checker Workflow)**:
  - Log debit or credit adjustments with Customer ID lookup and account executive tags.
  - **Transaction Approval Queue**: Unposted notes require manager verification (`Post` or `Delete`).
- **Payment Entry & Approval**:
  - Log received payments (Bank Transfer, Cash, Cheque, Direct Debit) with reference numbers.
  - **Payment Approval Queue**: Verification queue to post payments directly to the ledger.
- **Bulk Customer Status Change**:
  - Multi-ID search box to paste up to 100 Customer IDs.
  - Preview table with checkboxes (`Select All` supported), target status dropdown, single-click batch processing, and Excel/CSV export.

---

### 4. 🎫 Complaints & Ticket Management
- Log customer grievances across **Technical**, **Billing**, and **Service Request** categories.
- Track fault codes, equipment categories, department assignments (O&M, Billing, Sales, Support), and multi-tier escalation (Level-1 to Level-3).
- Full ticket history timeline with department transition tracking.

---

### 5. 📊 Analytics & Reporting Engine
Interactive reporting dashboard with real-time filtering, summaries, and Excel/CSV export across 6 core report categories:
1. **Customer Status Report**
2. **Sales Report**
3. **Customer Receivable Report**
4. **Adjustment Report**
5. **Payments Report**
6. **Customer Register**

---

### 6. 📦 Service Delivery & Inventory Management
- Real-time stock tracking across Categories (Inverters, Solar Panels, Batteries, Structures, Breakers, Cables, Meters).
- Min-stock threshold alerts, warehouse locations, and complete stock movement audit logs.

---

### 7. 🛡️ User Management & Role-Based Access Control
- Granular permissions for:
  - `SUPER_ADMIN`
  - `ADMIN`
  - `SALES_MANAGER`
  - `BILLING_MANAGER`
  - `OM_MANAGER`
  - `INSTALLATION`
  - `CUSTOMER_SUPPORT`
- Password reset utilities, account enable/disable toggles, and role assignments.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack) & React 19
- **Database & Auth**: PostgreSQL (Supabase) + Supabase Auth
- **ORM**: Prisma ORM with `@prisma/adapter-pg`
- **Styling**: Tailwind CSS & CSS Variables Design System
- **Icons & UI**: Lucide Icons, Radix UI Primitives

---

## 💻 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kingpin147/CRM-Management-System.git
cd "CRM Management System"
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### 3. Run Database Migrations & Seeds
```bash
# Push schema to database
npx prisma db push

# Seed sample customers, packages, and admin users
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── login/                     # Auth login page with Server Actions
│   ├── dashboard/
│   │   ├── admin/                 # User management & role assignment
│   │   ├── billing-cpm/           # Billing & Change Process Management
│   │   ├── customers/             # Customer search, detail profile, & creation
│   │   ├── ledger/                # Customer ledger & statement views
│   │   ├── reports/               # 6-category reporting & Excel export
│   │   ├── sales/pending/         # 3-Stage Manager Approval Queue
│   │   ├── service-delivery/      # Inventory & stock management
│   │   ├── settings/              # User account settings
│   │   └── tickets/               # Complaints & support tickets
├── components/
│   ├── layout/                    # Responsive header, MainNav, mobile drawer
│   └── ui/                        # Reusable design system primitives
├── lib/
│   ├── prisma.ts                  # Database client singleton
│   └── utils.ts                   # Formatting & calculation utilities
└── utils/
    └── supabase/                  # Server & admin Supabase client factories
```

---

## 📄 License
Private and proprietary software developed for **EnergyGurus**. All rights reserved.
