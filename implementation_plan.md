# Full-Fledged CRM System — Implementation Plan (EnergyGurus)

> **Scope confirmed:** This is a complete, full-featured CRM for a Solar Installation and Energy Monitoring business (EnergyGurus).
> The previous telecom/ISP iteration has been completely deprecated in favor of this new domain model.

---

## 1. Tech Stack Decision

### ✅ Chosen Database: Supabase

**Why Supabase wins for this CRM:**
* **Authentication**: Built-in (JWT, magic link, OAuth, RLS)
* **Real-time**: Built-in Realtime (vital for ticket/complaint updates)
* **Storage**: Built-in (for storing CNIC images, invoices)
* **PostgreSQL**: Full Postgres (no migration lock-in)
* **Row Level Security**: Native RBAC via RLS policies (Super Admin vs Managers)

---

## 2. Full Tech Stack

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  Framework        │  Next.js 14+ (App Router)                   │
│  Language         │  TypeScript (strict mode)                   │
│  UI Components    │  shadcn/ui                                  │
│  Styling          │  Tailwind CSS v3 (or Vanilla CSS if preferred)│
│  Data Tables      │  TanStack Table v8                          │
│  Forms            │  React Hook Form + Zod validation           │
│  Data Fetching    │  TanStack Query (React Query v5)            │
│  State            │  Zustand                                    │
├─────────────────────────────────────────────────────────────────┤
│                        BACKEND (Next.js API)                    │
├─────────────────────────────────────────────────────────────────┤
│  API Layer        │  Next.js Server Actions + API Routes        │
│  ORM              │  Prisma ORM (type-safe DB access)           │
│  Validation       │  Zod schemas                                │
│  Auth             │  Supabase Auth                              │
│  File Uploads     │  Supabase Storage (S3-compatible)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Overview (Solar Domain)

### 3.1 Users & Auth
```prisma
model User {
  id            String     @id @default(uuid())
  supabaseId    String     @unique
  fullName      String
  email         String     @unique
  role          Role
  isActive      Boolean    @default(true)
  createdAt     DateTime   @default(now())
}

enum Role {
  SUPER_ADMIN
  SALES_MANAGER
  BILLING_MANAGER
  TECHNICAL_MANAGER
}
```

### 3.2 Customers & Solar System
```prisma
model Customer {
  id               String       @id @default(uuid())
  customerCode     String       @unique
  fullName         String
  customerType     CustomerType
  contactNumber    String
  email            String?
  cnic             String       @unique
  cnicExpiry       DateTime?
  crpNumber        String?
  status           CustomerStatus
  activationDate   DateTime?
  signupDate       DateTime?
  address          String
  block            String?
  city             String
  solarSystem      SolarSystem?
  packagePlan      PackagePlan?
  tickets          Ticket[]
  transactions     Transaction[]
}

enum CustomerType { RESIDENTIAL CORPORATE INDUSTRIAL TEMPORARY_BLOCKED TERMINATED }
enum CustomerStatus { ACTIVE BLOCKED }

model SolarSystem {
  id                  String   @id @default(uuid())
  customerId          String   @unique
  customer            Customer @relation(fields: [customerId], references: [id])
  disco               String?  // LESCO, etc.
  meterType           String   // Green Meter, Non Green
  meterPhase          String?  // Single Phase, Three Phase
  zeroExportDevice    Boolean
  inverterBrand       String
  inverterType        String   // Hybrid, OnGrid, Hybrid+OnGrid
  inverterPhase       String   // Single, Three
  inverterCategory    String   // High Voltage, Low Voltage
  inverterSize        String?  // 6kW
  noOfInverters       Int
  inverterSerial      String
  panelBrand          String
  panelType           String   // Monofacial, Bifacial
  panelTechnology     String   // Mono Perc, Topcon, HJT, ABC, HIBC, etc.
  panelWattage        Int
  noOfPanels          Int
  totalWattage        Int
  batteryCategory     String   // High Voltage, Low Voltage
  batteryType         String   // Lithium, Tubular, Lead Acid, Dry
  batteryBrand        String
  noOfBatteries       Int
  batterySerial       String
  earthing            String   // AC, DC, Both
  earthingLastCheck   DateTime?
  earthingOhms        Decimal?
  lightningProtection Boolean
  breakerName         String
  ingressProtection   String?  // 20, 65, 67, etc.
  structureType       String?  // Elevated, Standard, etc.
  systemInstallationDate DateTime?
  installerName       String?
  installerCompany    String?
  installerAddress    String?
  installerContact    String?
  installerEmail      String?
  lastAuditDate       DateTime?
  inverterStatus      String?  // Excellent, Good, Fair, etc.
  panelStatus         String?
  batteryStatus       String?
  structureStatus     String?
  cableStatus         String?
  earthingStatus      String?
  breakerStatus       String?
}
```

### 3.3 Packages & Pricing
```prisma
model PackagePlan {
  id              String   @id @default(uuid())
  customerId      String   @unique
  customer        Customer @relation(fields: [customerId], references: [id])
  systemSizeKw    String   // 1-10 kW, 10-20 kW, 20-30 kW, 30+ kW
  packageTier     String   // Basic, Moderate, Comprehensive
  billingType     String   // Monthly, Quarterly, Half Yearly, Yearly
  monitoringTime  String   // 12 Hours, 24 Hours
  nextBillingDate DateTime?
  monthlyBasePrice Decimal
  appliedDiscount  Decimal // 0%, 20%, 40%, 60%
  salesTaxAmount   Decimal
  totalAmount      Decimal
}
```

### 3.4 Tickets & Complaints
```prisma
model Ticket {
  id                  String       @id @default(uuid())
  ticketNumber        String       @unique
  customerId          String
  customer            Customer     @relation(fields: [customerId], references: [id])
  ticketType          TicketType   // Technical, Billing, Service Request
  source              String       // UAN, Email, Whatsapp, Escalation
  assignedTo          String       // O&M, Billing, Sales, Customer Service, Support
  escalation          String       // Level-1, Level-2, Level-3
  status              TicketStatus // Pending, Resolved, Canceled, OnHold, Closed
  actionPriority      String?      // High, Medium, Low
  firstCallResolution Boolean      @default(false)
  category            String       // Inverter, Panel, Battery, Breaker (if Technical)
  fault               String?      // (01) BatVolLow, (02) BatOverCurrSw, etc.
  description         String
  createdAt           DateTime     @default(now())
  histories           TicketHistory[]
}

model TicketHistory {
  id            String       @id @default(uuid())
  ticketId      String
  ticket        Ticket       @relation(fields: [ticketId], references: [id])
  status        TicketStatus
  department    String
  remarks       String?
  createdBy     String       // User name or ID
  createdAt     DateTime     @default(now())
  timeInDept    String?      // Duration spent in department
}

enum TicketType { TECHNICAL_COMPLAINT BILLING_COMPLAINT SERVICE_REQUEST }
enum TicketStatus { PENDING RESOLVED CANCELED ON_HOLD CLOSED }
```

---

## 4. Implementation Phases

### Phase 1: Database & API Foundation
- Initialize Supabase project and Prisma ORM.
- Map the comprehensive Solar CRM schema.
- Write a seeder script (parsing the logic from `Dev-File.xlsx`) to pre-populate all dropdown options (Inverter Brands, Panel Brands, Breaker names).
- Create generic CRUD API endpoints.

### Phase 2: Core Application & Auth
- Setup Next.js App Router with layout and navigation scaffolding.
- Implement Supabase Auth (Sign-in page, session management).
- Build Role-Based Access Control (RBAC) middleware to protect routes based on Manager type.

### Phase 3: Customer Management & Sales Flow
- Develop the **User Search Page** (data table with filtering).
- Implement the complex **Create Sale** form that handles conditional logic (e.g., Battery details only required if Inverter is Hybrid).
- Implement the **Pricing Engine** to auto-calculate Package pricing with discounts (20% for Quarterly, etc.) and support Custom manual pricing for 30kW+.
- Build the **Customer Profile Page** with all its tabs (Profile, Solar System Details, Ledger, Create Ticket, Complaints Details, History tabs).

### Phase 4: Complain Management & Ledgers
- Develop the **Create Ticket** form with dependent dropdowns and auto-assignment logic (Technical -> O&M, Billing -> Billing Manager).
- Develop the **Pending Complaints** dashboard and Ticket Closed Setup view with history timeline.
- Develop the **Customer Ledger** for tracking invoice payments.
- Implement the **Automated Invoicing** system to batch process invoices on the 1st of each month.
- Implement **Customer Notifications** (Email dispatch and automated SMS triggers for invoices/complaints).
