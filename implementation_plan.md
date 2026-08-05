# Full-Fledged CRM System — Implementation Plan

> **Scope confirmed:** This is a complete, full-featured CRM — not a review-only portal.
> The existing system (crm.optix.pk) was studied for reference. We are building from scratch.
> **Client confirmed:** This portal is NOT an admin account — we are building a full CRM.

---

## 1. Tech Stack Decision

### ✅ Chosen Database: Supabase (over Neon DB)

**Why Supabase wins for this CRM:**

| Criteria | Supabase ✅ | Neon ❌ |
|----------|------------|---------|
| **Authentication** | Built-in (JWT, magic link, OAuth, RLS) | Needs Clerk = +$25/mo extra |
| **Real-time** | Built-in Realtime (live NOC + notifications) | Not available |
| **Storage** | Built-in (KYC docs, photos, attachments) | Not available |
| **Cost (Pakistan)** | Free tier + $25/mo Pro — all-in-one | $25/mo + auth + storage = much more |
| **PostgreSQL** | Full Postgres (no migration lock-in) | Full Postgres |
| **Row Level Security** | Native RBAC via RLS policies | Manual implementation needed |
| **Cold Starts** | No cold starts (always-on) | Scale-to-zero = ~500ms delays |
| **Dashboard** | Excellent data explorer | Basic |

**Cost Path:**
- **Development / MVP:** Free tier ($0/mo) — 500MB DB, 50K MAU
- **Production:** Pro plan ($25/mo) — 8GB DB, 100K MAU, no auto-pause

---

## 2. Full Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  Framework        │  Next.js 14+ (App Router)                   │
│  Language         │  TypeScript (strict mode)                   │
│  UI Components    │  shadcn/ui (owned, fully customised)        │
│  Styling          │  Tailwind CSS v3                            │
│  Data Tables      │  TanStack Table v8 (headless, powerful)     │
│  Charts           │  Recharts (dashboards & analytics)          │
│  Forms            │  React Hook Form + Zod validation           │
│  Data Fetching    │  TanStack Query (React Query v5)            │
│  State            │  Zustand (lightweight global state)         │
│  Date/Time        │  date-fns                                   │
│  Icons            │  Lucide React                               │
│  PDF Export       │  @react-pdf/renderer                        │
│  Excel Export     │  xlsx (SheetJS)                             │
│  Notifications    │  Sonner (toast) + in-app via Supabase RT    │
│  Rich Text        │  Tiptap (complaint descriptions)            │
├─────────────────────────────────────────────────────────────────┤
│                        BACKEND (Next.js API)                    │
├─────────────────────────────────────────────────────────────────┤
│  API Layer        │  Next.js Server Actions + API Routes        │
│  ORM              │  Prisma ORM (type-safe DB access)           │
│  Validation       │  Zod schemas (shared frontend + backend)    │
│  Auth             │  Supabase Auth + Next.js middleware (JWT)   │
│  File Uploads     │  Supabase Storage (S3-compatible)           │
│  Background Jobs  │  Supabase Edge Functions (cron/SLA checks)  │
├─────────────────────────────────────────────────────────────────┤
│                        DATABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│  Database         │  Supabase PostgreSQL (hosted)               │
│  Real-time        │  Supabase Realtime (websockets)             │
│  RBAC/Security    │  Supabase Row Level Security (RLS)          │
│  Caching          │  TanStack Query (client-side)               │
├─────────────────────────────────────────────────────────────────┤
│                        DEPLOYMENT                               │
├─────────────────────────────────────────────────────────────────┤
│  Hosting          │  Vercel (free tier / pro, Next.js native)   │
│  Domain           │  Client's own domain (e.g. crm.optix.pk)   │
│  CDN              │  Vercel Edge Network (global)               │
│  Env Variables    │  Vercel Environment Variables               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Project Folder Structure

```
crm-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Shared navbar + sidebar
│   │   ├── dashboard/page.tsx          # Home dashboard
│   │   ├── customers/
│   │   │   ├── page.tsx                # Customer search
│   │   │   └── [id]/page.tsx           # Customer detail
│   │   ├── sales/
│   │   │   ├── page.tsx                # Sales dashboard
│   │   │   ├── leads/page.tsx
│   │   │   ├── leads/[id]/page.tsx
│   │   │   ├── crf/page.tsx
│   │   │   ├── quotations/page.tsx
│   │   │   ├── pending-list/page.tsx
│   │   │   └── performance/page.tsx
│   │   ├── customer-service/
│   │   │   ├── page.tsx                # CS dashboard
│   │   │   ├── tickets/page.tsx
│   │   │   ├── tickets/[id]/page.tsx
│   │   │   ├── create-ticket/page.tsx
│   │   │   ├── escalated/page.tsx
│   │   │   ├── sla/page.tsx
│   │   │   └── feedback/page.tsx
│   │   ├── om/
│   │   │   ├── page.tsx                # O&M dashboard
│   │   │   ├── job-cards/page.tsx
│   │   │   ├── job-cards/[id]/page.tsx
│   │   │   ├── technicians/page.tsx
│   │   │   ├── noc/page.tsx
│   │   │   ├── preventive/page.tsx
│   │   │   └── installations/page.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx                # Billing dashboard
│   │   │   ├── credit-adjustment/
│   │   │   ├── debit-adjustment/
│   │   │   ├── servicewise-status/
│   │   │   ├── transaction-approval/
│   │   │   ├── transaction-ledger/
│   │   │   ├── asset-invoice/
│   │   │   ├── asset-invoice-approval/
│   │   │   ├── service-invoice/
│   │   │   ├── service-invoice-approval/
│   │   │   ├── transaction-approval-2/
│   │   │   ├── payment-adjustment/
│   │   │   ├── payments-approval/
│   │   │   ├── non-payment-block/
│   │   │   ├── reset-radius/
│   │   │   ├── customer-package-details/
│   │   │   ├── pending-list-cpm/
│   │   │   └── temporary-block/
│   │   ├── reports/
│   │   │   ├── connectivity/
│   │   │   ├── receivables/
│   │   │   ├── adjustments/
│   │   │   ├── billing-payments/
│   │   │   ├── customers-register/
│   │   │   ├── customer-status/
│   │   │   ├── advance-tax/
│   │   │   └── invoice-breakup/
│   │   └── admin/
│   │       ├── users/page.tsx
│   │       ├── roles/page.tsx
│   │       ├── areas/page.tsx
│   │       ├── packages/page.tsx
│   │       └── settings/page.tsx
│   └── api/
│       ├── auth/[...supabase]/route.ts
│       ├── customers/route.ts
│       ├── leads/route.ts
│       ├── tickets/route.ts
│       ├── jobs/route.ts
│       └── billing/route.ts
├── components/
│   ├── ui/                             # Owned shadcn/ui components
│   ├── data-table/                     # Universal CRM data table
│   ├── customer-card/                  # Reusable customer card
│   ├── forms/                          # Shared form components
│   ├── charts/                         # Dashboard chart components
│   └── layout/                         # Navbar, Sidebar, Breadcrumbs
├── lib/
│   ├── supabase/                       # Supabase client setup
│   ├── services/                       # Business logic layer
│   ├── schemas/                        # Zod validation schemas
│   └── utils/                          # Helpers, formatters
├── prisma/
│   └── schema.prisma                   # Full database schema
├── middleware.ts                        # Auth + RBAC route protection
└── types/                              # Shared TypeScript types
```

---

## 4. Role-Based Access Control (RBAC)

### Role Hierarchy — 3 Tiers

```
TIER 1 ─ SUPER ADMIN
  └── Full system access, user management, system configuration

TIER 2 ─ MANAGERS (department-specific)
  ├── Sales Manager
  ├── Customer Service Manager
  ├── O&M Manager
  ├── Billing Manager
  └── Finance Manager

TIER 3 ─ OPERATORS (department-specific)
  ├── Sales Officer (SFO)
  ├── Customer Service Agent (CSR)
  ├── Field Technician
  ├── NOC Engineer
  ├── Billing Officer
  └── Finance Officer
```

### Permission Matrix

> **Legend:** `✅ Full Access` | `🔵 Limited` (own records / view-only) | `❌ No Access`

---

#### 🌐 Global Access (All Roles)

| Page | Super Admin | All Managers | All Operators |
|------|:-----------:|:------------:|:-------------:|
| Dashboard | ✅ All data | ✅ Dept. KPIs | ✅ Own KPIs |
| Customer Search | ✅ | ✅ | ✅ |
| Customer Detail | ✅ Full | ✅ Full | 🔵 View only |
| Create Ticket | ✅ | ✅ | ✅ |

---

#### 💼 Sales Module

| Page / Feature | Super Admin | Sales Manager | Sales Officer | All Others |
|----------------|:-----------:|:-------------:|:-------------:|:----------:|
| Sales Dashboard | ✅ | ✅ Team data | ✅ Own data | ❌ |
| Lead Management | ✅ | ✅ All leads | 🔵 Own leads | ❌ |
| Lead — Create / Edit | ✅ | ✅ | ✅ | ❌ |
| CRF Management | ✅ | ✅ All CRFs | 🔵 Own CRFs | ❌ |
| CRF — Approve / Reject | ✅ | ✅ | ❌ | ❌ |
| Quotation — Create | ✅ | ✅ | ✅ | ❌ |
| Quotation — Approve | ✅ | ✅ | ❌ | ❌ |
| Sales Performance Report | ✅ | ✅ Team | ❌ | ❌ |
| Pending List CPM | ✅ | ✅ | ✅ | ❌ |

---

#### 🎧 Customer Service Module

| Page / Feature | Super Admin | CS Manager | CS Agent | O&M Manager | All Others |
|----------------|:-----------:|:----------:|:--------:|:-----------:|:----------:|
| CS Dashboard | ✅ | ✅ | ✅ Own | 🔵 View | ❌ |
| All Tickets | ✅ | ✅ All | 🔵 Assigned | 🔵 View | ❌ |
| Ticket Detail | ✅ | ✅ | 🔵 Assigned | 🔵 View | ❌ |
| Create Ticket | ✅ | ✅ | ✅ | ❌ | ❌ |
| Escalate Ticket | ✅ | ✅ | ✅ | ❌ | ❌ |
| Close Ticket | ✅ | ✅ | ✅ Assigned | ❌ | ❌ |
| Escalated Tickets | ✅ | ✅ | 🔵 View | ✅ View | ❌ |
| SLA Configuration | ✅ | ✅ | ❌ | ❌ | ❌ |
| SLA Dashboard | ✅ | ✅ | 🔵 Own | 🔵 View | ❌ |
| CSAT / Feedback | ✅ | ✅ | 🔵 Enter only | ❌ | ❌ |

---

#### 🔧 O&M Module

| Page / Feature | Super Admin | O&M Manager | NOC Engineer | Field Technician | All Others |
|----------------|:-----------:|:-----------:|:------------:|:----------------:|:----------:|
| O&M Dashboard | ✅ | ✅ | ✅ | ✅ Own jobs | ❌ |
| Job Cards — All | ✅ | ✅ | ✅ | 🔵 Own only | ❌ |
| Job Card — Create | ✅ | ✅ | ✅ | ❌ | ❌ |
| Job Card — Assign | ✅ | ✅ | ✅ | ❌ | ❌ |
| Job Card — Complete | ✅ | ✅ | ✅ | ✅ Own only | ❌ |
| Technician Management | ✅ | ✅ | 🔵 View | ❌ | ❌ |
| NOC Live View | ✅ | ✅ | ✅ | ❌ | ❌ |
| Preventive Maintenance | ✅ | ✅ | ✅ | 🔵 View | ❌ |
| Installation Requests | ✅ | ✅ | ✅ | 🔵 Own only | ❌ |

---

#### 💳 Billing Module

| Page / Feature | Super Admin | Billing Manager | Billing Officer | Finance Manager | Finance Officer | All Others |
|----------------|:-----------:|:---------------:|:---------------:|:---------------:|:---------------:|:----------:|
| Billing Dashboard | ✅ | ✅ | ✅ Own | ✅ | ✅ Own | ❌ |
| Credit Adjustment — Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Credit Adjustment — Approve (Auth 1) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Credit Adjustment — Approve (Auth 2) | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Debit Adjustment — Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Asset Invoice — Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Asset Invoice — Approve | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Service Invoice — Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Service Invoice — Approve | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Transaction Approval (Auth 1) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Transaction Approval (Auth 2) | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Transaction Ledger | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Payment Adjustment | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Payments Approval | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Non-Payment Block | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reset Radius Sessions | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Servicewise Status Change | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Customer Package Details | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Temporary Block Active | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

#### 📊 Reports Module

| Report | Super Admin | Sales Mgr | CS Manager | O&M Manager | Billing Mgr | Finance Mgr | Operators |
|--------|:-----------:|:---------:|:----------:|:-----------:|:-----------:|:-----------:|:---------:|
| Connectivity Wise | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Customers Receivable | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Adjustments Report | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Billing Payments | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Customers Register | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Customer Status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Advance Tax | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Invoice Breakup | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Sales Report *(new)* | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| CS Report *(new)* | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| O&M Report *(new)* | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |

---

#### ⚙️ Admin Panel

| Page | Super Admin | All Other Roles |
|------|:-----------:|:---------------:|
| User Management | ✅ Full CRUD | ❌ |
| Role Permissions | ✅ Full | ❌ |
| Area Configuration | ✅ Full CRUD | ❌ |
| Package Configuration | ✅ Full CRUD | ❌ |
| System Settings | ✅ Full | ❌ |
| Audit Log | ✅ Full | ❌ |

---

## 5. Database Schema (Prisma / Supabase PostgreSQL)

### 5.1 Users & Auth

```prisma
model User {
  id            String     @id @default(uuid())
  supabaseId    String     @unique
  fullName      String
  email         String     @unique
  phone         String?
  role          Role
  department    Department
  teamLeadId    String?
  teamLead      User?      @relation("TeamHierarchy", fields: [teamLeadId], references: [id])
  reportees     User[]     @relation("TeamHierarchy")
  isActive      Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

enum Role {
  SUPER_ADMIN
  SALES_MANAGER       SALES_OFFICER
  CS_MANAGER          CS_AGENT
  OM_MANAGER          NOC_ENGINEER       FIELD_TECHNICIAN
  BILLING_MANAGER     BILLING_OFFICER
  FINANCE_MANAGER     FINANCE_OFFICER
}

enum Department {
  ADMIN   SALES   CUSTOMER_SERVICE   OPERATIONS_MAINTENANCE   BILLING   FINANCE
}
```

### 5.2 Customers

```prisma
model Customer {
  id               String         @id @default(uuid())
  customerCode     String         @unique
  crfNumber        String         @unique
  prefix           String?
  fullName         String
  customerType     CustomerType
  cnic             String         @unique
  cnicExpiry       DateTime?
  passportNumber   String?
  mobileNumber     String
  phoneNumber      String?
  email            String?
  ntnNumber        String?
  pocName          String?
  pocContact       String?
  activationDate   DateTime?
  signupDate       DateTime?
  status           CustomerStatus
  balance          Decimal        @default(0)
  cityId           String
  areaId           String
  subAreaId        String
  houseAddress     String
  latitude         Decimal?
  longitude        Decimal?
  packageId        String?
  oltInfo          String?
  pon              String?
  card             String?
  oltPort          String?
  salesPersonId    String?
  salesPerson      User?          @relation(fields: [salesPersonId], references: [id])
  services         CustomerService[]
  tickets          Ticket[]
  invoices         Invoice[]
  transactions     Transaction[]
  leads            Lead[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}

enum CustomerType   { INDIVIDUAL CORPORATE SME }
enum CustomerStatus {
  SIGN_UP_GENERATED   PENDING_ON_SALES   PENDING_ON_INVENTORY
  PENDING_ON_ACTIVATION   CONNECTION_ACTIVE   NON_PAYMENT_BLOCKED
  BLOCKED   TEMPORARY_BLOCKED   FOC   REFUND   TERMINATED
  IN_HOUSE   MPPL   REFUSED_BY_CUSTOMER
}
```

### 5.3 Geography

```prisma
model Country  { id String @id; name String; provinces Province[] }
model Province { id String @id; name String; countryId String; cities City[] }
model City     { id String @id; name String; provinceId String; areas Area[] }
model Area     { id String @id; name String; cityId String; subAreas SubArea[] }
model SubArea  { id String @id; name String; areaId String }
```

### 5.4 Sales Module

```prisma
model Lead {
  id              String       @id @default(uuid())
  leadCode        String       @unique @default(cuid())
  fullName        String
  cnic            String?
  contactNumber   String
  email           String?
  houseAddress    String
  cityId          String
  areaId          String
  subAreaId       String?
  packageInterest String?
  source          LeadSource
  status          LeadStatus   @default(NEW)
  feasible        Boolean      @default(false)
  remarks         String?
  assignedToId    String?
  assignedTo      User?        @relation(fields: [assignedToId], references: [id])
  customerId      String?
  customer        Customer?    @relation(fields: [customerId], references: [id])
  activities      LeadActivity[]
  quotations      Quotation[]
  convertedAt     DateTime?
  createdById     String
  createdBy       User         @relation("LeadCreator", fields: [createdById], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum LeadSource {
  WALK_IN   PHONE_CALL   WHATSAPP   REFERRAL   ONLINE_FORM   FIELD_VISIT   EMAIL
}

enum LeadStatus {
  NEW   CONTACTED   FEASIBILITY_CHECK   PROPOSAL_SENT   NEGOTIATION   WON   LOST   ON_HOLD
}

model LeadActivity {
  id          String   @id @default(uuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id])
  type        String   // Call, WhatsApp, Visit, Email, Note
  description String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}

model Quotation {
  id              String          @id @default(uuid())
  quotationNumber String          @unique
  leadId          String?
  lead            Lead?           @relation(fields: [leadId], references: [id])
  customerId      String?
  packageId       String
  discount        Decimal         @default(0)
  subtotal        Decimal
  salesTax        Decimal
  grandTotal      Decimal
  validUntil      DateTime
  status          QuotationStatus @default(DRAFT)
  items           QuotationItem[]
  createdById     String
  createdAt       DateTime        @default(now())
}

enum QuotationStatus { DRAFT   SENT   ACCEPTED   REJECTED   EXPIRED }

model QuotationItem {
  id          String    @id @default(uuid())
  quotationId String
  quotation   Quotation @relation(fields: [quotationId], references: [id])
  description String
  qty         Int
  unitPrice   Decimal
  stPercent   Decimal
  stAmount    Decimal
  lineTotal   Decimal
}
```

### 5.5 Customer Service Module

```prisma
model Ticket {
  id              String          @id @default(uuid())
  ticketNumber    String          @unique
  customerId      String
  customer        Customer        @relation(fields: [customerId], references: [id])
  source          ComplaintSource
  department      String
  categoryId      String
  category        TicketCategory  @relation(fields: [categoryId], references: [id])
  subCategoryId   String?
  faultId         String?
  priority        Priority        @default(MEDIUM)
  status          TicketStatus    @default(OPEN)
  description     String
  assignedToId    String?
  assignedTo      User?           @relation(fields: [assignedToId], references: [id])
  escalationLevel Int             @default(0)
  fcr             Boolean         @default(false)
  slaDeadline     DateTime?
  slaBreached     Boolean         @default(false)
  resolvedAt      DateTime?
  closedAt        DateTime?
  closedById      String?
  remarks         String?
  csatRating      Int?            // 1-5
  csatComment     String?
  attachments     TicketAttachment[]
  history         TicketHistory[]
  jobCards        JobCard[]
  createdById     String
  createdBy       User            @relation("TicketCreator", fields: [createdById], references: [id])
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum ComplaintSource { UAN   WHATSAPP   EMAIL   WALK_IN   APP   WEB   FACEBOOK }
enum Priority        { LOW   MEDIUM   HIGH   CRITICAL }
enum TicketStatus    {
  OPEN   IN_PROGRESS   WAITING_CUSTOMER   ESCALATED
  RESOLVED   CLOSED   REOPENED
}

model TicketCategory {
  id            String             @id @default(uuid())
  name          String
  department    String
  slaHours      Int                // default SLA in hours per priority
  tickets       Ticket[]
  subCategories TicketSubCategory[]
}

model TicketSubCategory {
  id         String         @id @default(uuid())
  name       String
  categoryId String
  category   TicketCategory @relation(fields: [categoryId], references: [id])
  faults     TicketFault[]
}

model TicketFault {
  id            String            @id @default(uuid())
  name          String
  subCategoryId String
  subCategory   TicketSubCategory @relation(fields: [subCategoryId], references: [id])
}

model TicketHistory {
  id          String        @id @default(uuid())
  ticketId    String
  ticket      Ticket        @relation(fields: [ticketId], references: [id])
  changedById String
  changedBy   User          @relation(fields: [changedById], references: [id])
  oldStatus   TicketStatus?
  newStatus   TicketStatus?
  remarks     String?
  createdAt   DateTime      @default(now())
}

model TicketAttachment {
  id        String   @id @default(uuid())
  ticketId  String
  ticket    Ticket   @relation(fields: [ticketId], references: [id])
  filePath  String   // Supabase Storage path
  fileName  String
  fileSize  Int
  createdAt DateTime @default(now())
}
```

### 5.6 O&M Module

```prisma
model JobCard {
  id            String    @id @default(uuid())
  jobNumber     String    @unique
  customerId    String?
  customer      Customer? @relation(fields: [customerId], references: [id])
  ticketId      String?
  ticket        Ticket?   @relation(fields: [ticketId], references: [id])
  jobType       JobType
  priority      Priority  @default(MEDIUM)
  status        JobStatus @default(PENDING)
  description   String
  assignedToId  String?
  assignedTo    User?     @relation("JobAssignee", fields: [assignedToId], references: [id])
  teamLeadId    String?
  teamLead      User?     @relation("JobTeamLead", fields: [teamLeadId], references: [id])
  cityId        String?
  areaId        String?
  address       String?
  scheduledDate DateTime?
  startedAt     DateTime?
  completedAt   DateTime?
  slaDeadline   DateTime?
  slaBreached   Boolean   @default(false)
  resolution    String?
  attachments   JobAttachment[]
  createdById   String
  createdBy     User      @relation("JobCreator", fields: [createdById], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum JobType {
  INSTALLATION   FAULT_REPAIR   PREVENTIVE_MAINTENANCE
  SURVEY   DISCONNECTION   RELOCATION   UPGRADE
}

enum JobStatus {
  PENDING   DISPATCHED   IN_PROGRESS   ON_HOLD   COMPLETED   FAILED   CANCELLED
}

model Technician {
  id             String     @id @default(uuid())
  userId         String     @unique
  user           User       @relation(fields: [userId], references: [id])
  employeeCode   String     @unique
  specialization String[]
  areaCoverage   String[]
  currentStatus  TechStatus @default(AVAILABLE)
  currentJobId   String?
  createdAt      DateTime   @default(now())
}

enum TechStatus { AVAILABLE   ON_JOB   OFF_DUTY   ON_LEAVE }

model PreventiveMaintenance {
  id              String   @id @default(uuid())
  taskNumber      String   @unique
  nodeName        String
  nodeType        String   // OLT, Fiber Cabinet, Tower, etc.
  location        String
  cityId          String
  areaId          String?
  maintenanceType String
  scheduledDate   DateTime
  assignedTeamId  String?
  status          PMStatus @default(SCHEDULED)
  lastDoneAt      DateTime?
  nextDueAt       DateTime?
  completedById   String?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum PMStatus { SCHEDULED   IN_PROGRESS   COMPLETED   OVERDUE   CANCELLED }
```

### 5.7 Billing Module

```prisma
model Invoice {
  id            String        @id @default(uuid())
  invoiceNumber String        @unique
  customerId    String
  customer      Customer      @relation(fields: [customerId], references: [id])
  invoiceType   InvoiceType
  invoiceDate   DateTime      @default(now())
  invoiceMonth  String?       // e.g. "JUNE-2025"
  dueDate       DateTime
  subtotal      Decimal
  salesTax      Decimal
  advanceTax    Decimal
  netAmount     Decimal
  discount      Decimal       @default(0)
  status        InvoiceStatus @default(PENDING)
  items         InvoiceItem[]
  transactions  Transaction[]
  approvals     InvoiceApproval[]
  createdById   String
  createdBy     User          @relation(fields: [createdById], references: [id])
  createdAt     DateTime      @default(now())
}

enum InvoiceType   { RECURRING   ASSET   SERVICE   CUSTOM }
enum InvoiceStatus { PENDING   APPROVED   POSTED   VOID   PAID   PARTIAL_PAID }

model InvoiceItem {
  id          String  @id @default(uuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id])
  description String
  qty         Int     @default(1)
  unitPrice   Decimal
  stPercent   Decimal @default(0)
  stAmount    Decimal @default(0)
  lineTotal   Decimal
}

model Transaction {
  id              String          @id @default(uuid())
  customerId      String
  customer        Customer        @relation(fields: [customerId], references: [id])
  invoiceId       String?
  invoice         Invoice?        @relation(fields: [invoiceId], references: [id])
  transactionType TransactionType
  amount          Decimal
  serviceType     ServiceType
  voucherType     String
  narration       String?
  refNumber       String          @unique @default(cuid())
  isPosted        Boolean         @default(false)
  postedAt        DateTime?
  postedById      String?
  approvals       TransactionApproval[]
  createdById     String
  createdAt       DateTime        @default(now())
}

enum TransactionType { CR   DR   PAYMENT   ADJUSTMENT }
enum ServiceType     { INTERNET   CABLE_TV   PHONE   IPTV }

model Payment {
  id            String        @id @default(uuid())
  customerId    String
  receiptNumber String        @unique
  paymentDate   DateTime
  paymentMethod PaymentMethod
  paymentAmount Decimal
  paymentType   String
  bankName      String?
  chequeNumber  String?
  accountId     String?
  isPosted      Boolean       @default(false)
  teamLeadId    String?
  agentId       String?
  narration     String?
  approvals     PaymentApproval[]
  createdById   String
  createdAt     DateTime      @default(now())
}

enum PaymentMethod {
  CASH   CHEQUE   BANK_TRANSFER
  KUICKPAY   JAZZCASH   EASYPAISA   ONLINE
}
```

### 5.8 System Models

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // TICKET_ASSIGNED, APPROVAL_NEEDED, SLA_BREACH, JOB_ASSIGNED, etc.
  title     String
  message   String
  link      String?  // deep link to the relevant page
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String   // CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.
  entityType String   // Customer, Ticket, Invoice, Lead, etc.
  entityId   String
  oldValue   Json?
  newValue   Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
}
```

---

## 6. Module-by-Module Feature Specification

### 6.1 Authentication & Admin Panel

| Page | URL | Access |
|------|-----|--------|
| Login | `/login` | Public |
| Forgot Password | `/forgot-password` | Public |
| Admin — Users | `/admin/users` | Super Admin |
| Admin — Roles | `/admin/roles` | Super Admin |
| Admin — Areas | `/admin/areas` | Super Admin |
| Admin — Packages | `/admin/packages` | Super Admin |
| Admin — Settings | `/admin/settings` | Super Admin |

**Key Features:**
- Invite-only registration (admin sends invite email via Supabase)
- Force password reset on first login
- Role + Department assignment at user creation
- Deactivate user (soft delete — no hard delete)
- Session management (view active sessions, force logout)
- Audit log viewer (who did what, when)

---

### 6.2 Global Dashboard

**URL:** `/dashboard` — Role-aware (each role sees their own KPIs)

| Section | KPIs |
|---------|------|
| **Sales** | New Leads Today · CRFs Generated · Activations This Month · Conversion Rate % · Pipeline Value (PKR) |
| **Customer Service** | Open Tickets · SLA Breached 🔴 · FCR Rate % · Avg Resolution Time · CSAT Score |
| **O&M** | Open Job Cards · Completed Today · Technician Utilization % · Pending PM Tasks |
| **Billing** | Pending Approvals Count · Revenue Collected Today · Overdue Invoices · Non-Payment Blocked |

**Charts:** Lead Funnel · Ticket Volume (7-day) · Monthly Revenue · Job Status (donut)

**Quick Actions:** Create Lead · Create Ticket · Create Job Card · Search Customer

---

### 6.3 Sales Module

#### ISP Sales Pipeline (SPANCO Framework)
```
Lead → Contacted → Feasibility Check → Proposal/Quotation Sent → Negotiation → CRF Generated
                                                                              → Won (→ Activation)
                                                                              → Lost (with reason)
```

#### Page List

| Page | URL | Description |
|------|-----|-------------|
| Sales Dashboard | `/sales` | KPIs, Kanban pipeline, leaderboard |
| Lead Management | `/sales/leads` | Create/manage all leads |
| Lead Detail | `/sales/leads/[id]` | Full lead + activity log |
| CRF Management | `/sales/crf` | Track CRFs from creation to activation |
| Quotation Generator | `/sales/quotations` | Build, preview, send PDF quotes |
| Pending List CPM | `/sales/pending-list` | Existing page — integrated here |
| Sales Performance | `/sales/performance` | Officer-level stats and rankings |

#### Sales — Lead Detail Features
- Personal info (Name, CNIC, Contact, Email)
- Address with cascading City → Area → Sub-Area dropdowns
- Package of Interest
- Source of Lead (Walk-in / Phone / WhatsApp / Referral / Online / Field Visit)
- Assign Sales Officer
- Feasibility check toggle — "Coverage Available?"
- **Activity Log** — chronological log of calls, WhatsApp messages, visits, notes
- WhatsApp quick-contact button
- Convert to CRF button (enabled only if Feasibility = true)

#### Sales — CRF Management
- Tracks CRFs: Pending → Approved → Rejected → Converted to Active Customer
- Approve/Reject by Sales Manager with remarks
- Approved CRF → auto-triggers **O&M Installation Job Card**

#### Sales — Quotation Generator
- Select Lead or existing Customer
- Add line items: Packages, OTC charges, Hardware
- Auto-calculate Sales Tax (17%) + Advance Tax (Pakistan standard)
- Preview PDF
- Download PDF / Send via Email
- Track quotation status: Draft → Sent → Accepted → Rejected

---

### 6.4 Customer Service Module

> **Note:** This **replaces and expands** the existing "Complain Management" tab.
> The existing "Pending Complaints" page becomes a filtered view within "All Tickets".

#### Ticket Lifecycle
```
New Ticket → Assigned → In Progress → Resolved → Customer Confirmed → Closed
                      → Escalated (L1 → L2 → L3)
                                                → Reopened (if unresolved)
```

#### SLA Framework (Pakistan ISP Standard)

| Priority | Response Time | Resolution Time | Auto-Escalate At |
|----------|:------------:|:---------------:|:----------------:|
| 🔴 Critical | 15 minutes | 2 hours | 50% elapsed |
| 🟠 High | 1 hour | 4 hours | 50% elapsed |
| 🟡 Medium | 4 hours | 24 hours | 80% elapsed |
| 🟢 Low | 24 hours | 72 hours | 80% elapsed |

#### Escalation Matrix

| Level | Trigger | Assigned To |
|-------|---------|-------------|
| Level 0 | Default | Assigned CS Agent |
| Level 1 | 50% SLA elapsed | Senior Agent / Team Lead |
| Level 2 | 80% SLA elapsed | CS Manager |
| Level 3 | SLA Breached | Department Head / Super Admin |

#### Page List

| Page | URL | Description |
|------|-----|-------------|
| CS Dashboard | `/customer-service` | KPIs, live SLA ticker, agent workload |
| All Tickets | `/customer-service/tickets` | Full ticket list (all statuses) |
| Ticket Detail | `/customer-service/tickets/[id]` | Full ticket + timeline + linked job |
| Create Ticket | `/customer-service/create-ticket` | Log new complaint from any channel |
| Escalated Tickets | `/customer-service/escalated` | Manager view of escalated tickets |
| SLA Management | `/customer-service/sla` | Configure SLA policies + breach monitor |
| CSAT / Feedback | `/customer-service/feedback` | Customer satisfaction ratings |

#### CS — Ticket Detail Features
- Customer card (same design as existing system)
- Activity timeline (status changes, agent notes, escalations, timestamps)
- Linked O&M Job Card (if technical dispatch was done)
- Attachment uploads (photos, screenshots from customer)
- Live SLA countdown timer
- Escalate button (select escalation level)
- Add Note / Reply section
- Close Ticket (triggers CSAT request via SMS/WhatsApp)

#### CS — Create Ticket Features
- Customer Code search → auto-fill customer info
- Source: UAN / WhatsApp / Email / Walk-in / App / Web / Facebook
- Cascading: Department → Category → Sub-Category → Fault
- Priority selection
- Complaint description (rich text editor)
- Attach files/photos
- Assign to Agent or SFO
- SLA deadline auto-set by category (editable by manager)

---

### 6.5 O&M Module (Operations & Maintenance)

> **Mobile-first for field technicians:** Fully responsive — desktop for NOC/managers, mobile cards for technicians.

#### Job Card Lifecycle
```
Created → Dispatched → Technician Accepts → In Progress → Completed (notes + photos)
                                                        → Failed (reason) → Reassigned
```

#### Page List

| Page | URL | Description |
|------|-----|-------------|
| O&M Dashboard | `/om` | KPIs, heatmap, technician utilization |
| Job Cards | `/om/job-cards` | Create/manage all field job orders |
| Job Card Detail | `/om/job-cards/[id]` | Full job + timeline + resolution |
| Create Job Card | `/om/job-cards/create` | New work order form |
| Technician Management | `/om/technicians` | Roster + availability status |
| NOC Live View | `/om/noc` | Real-time area-level outage view |
| Preventive Maintenance | `/om/preventive` | Schedule + track routine PM tasks |
| Installation Requests | `/om/installations` | Auto-fed from approved CRFs (Sales) |

#### O&M — Job Card Fields
- Link to existing CS Ticket (optional)
- Link to Customer Code (optional)
- Job Type: Installation / Fault Repair / PM / Survey / Disconnection / Relocation / Upgrade
- Priority: Low / Medium / High / Critical
- Description
- Address + City + Area
- Assign Technician (dropdown with live availability status)
- Schedule Date/Time
- SLA Deadline (auto or manual)

#### O&M — Field Technician Mobile View
- "My Jobs" card list (simplified)
- One-tap status updates: Accept → Start → Complete
- Photo upload using phone camera on job completion
- No access to management/config screens

#### O&M — NOC Live View Features
- Area-level summary table: Area | Active Tickets | Open Jobs | Critical Count
- Auto-refreshing via **Supabase Realtime** (no page reload needed)
- High-priority ticket feed (live)
- Bulk dispatch: select multiple jobs → assign to technician
- Designed for wide-screen NOC monitors

#### O&M — Preventive Maintenance Features
- Create PM Task: Node name, Type (OLT/Fiber/Tower), Location, Frequency
- Frequency options: Daily / Weekly / Monthly / Quarterly / Annual
- Assign team + scheduled date
- Mark Complete with notes and next-due auto-calculation
- Overdue tasks highlighted in red
- Export schedule to Excel

---

### 6.6 Billing Module

*(All 17 existing pages are retained — see `requirements.md` for full spec)*

#### New Addition: Billing Dashboard

**URL:** `/billing`

| Widget | Description |
|--------|-------------|
| Pending Auth 1 | Count of transactions awaiting first approval |
| Pending Auth 2 | Count awaiting second approval |
| Pending Payments | Count awaiting posting |
| Pending Asset Invoices | Count awaiting approval |
| Revenue Today | Total payments posted today (PKR) |
| Overdue Invoices | Count of unpaid past-due invoices |
| Non-Payment Blocked | Count of currently blocked customers |

#### Enhancements to Existing Billing Pages
- **Auto-Invoice Trigger:** When Sales marks CRF as "Activated", first recurring invoice is auto-generated
- **WhatsApp Invoice:** Send invoice PDF to customer WhatsApp (via WhatsApp Business API — future phase)
- **Payment Gateway Notes:** KuickPay, JazzCash, Easypaisa integration placeholders
- **PDF Export** added to all billing approval pages

---

### 6.7 Reports Module

*(All 8 existing report pages retained — see `requirements.md` for full spec)*

#### New Reports Added
| Report | URL |
|--------|-----|
| Sales Report | `/reports/sales` |
| Customer Service Report | `/reports/customer-service` |
| O&M Performance Report | `/reports/om-performance` |

#### Enhancement: PDF Export
All report pages now have both **Export to Excel** and **Export to PDF** buttons.

---

### 6.8 Customer Detail Page (Enhanced)

*(Existing design retained — enhanced with new tabs)*

| Tab | Content |
|-----|---------|
| **Profile** | Existing: all customer info, badges, status |
| **Services** | Existing: active service packages |
| **Tickets** | All complaint tickets (linked from CS module) |
| **Payment History** | Full transaction ledger (existing Transaction Ledger page logic) |
| **Service History** | Package changes, activations, blocks timeline |
| **Job Cards** | All O&M jobs for this customer |
| **Documents** | CNIC scan, CRF copy, contract (Supabase Storage) |
| **Log Complaint** | Existing: Create Ticket shortcut |

---

## 7. Navigation Structure

```
Top Navigation Bar (role-aware — tabs hidden if no access)
│
├── 🏠 Dashboard
├── 🔍 Customers (Search + Detail)
├── 💼 Sales
│   ├── Sales Dashboard
│   ├── Lead Management
│   ├── CRF Management
│   ├── Quotations
│   ├── Pending List CPM
│   └── Sales Performance
├── 🎧 Customer Service
│   ├── CS Dashboard
│   ├── All Tickets
│   ├── Create Ticket
│   ├── Escalated Tickets
│   ├── SLA Management
│   └── CSAT / Feedback
├── 🔧 O & M
│   ├── O&M Dashboard
│   ├── Job Cards
│   ├── Technicians
│   ├── NOC Live View
│   ├── Preventive Maintenance
│   └── Installation Requests
├── 💳 Billing
│   ├── Billing Dashboard
│   └── [17 existing sub-pages]
├── 📊 Reports
│   └── [8 existing + 3 new reports]
└── ⚙️  Admin (Super Admin only)
    ├── User Management
    ├── Role Permissions
    ├── Area Configuration
    ├── Package Configuration
    └── System Settings
```

---

## 8. Cross-Module Integration Points

```
SALES ──────────────────────────────────────────────────────
  Lead Won → CRF Generated → CRF Approved
          → Auto-creates O&M Installation Job Card
          → Once Installed → Customer Status = CONNECTION_ACTIVE
          → Billing auto-generates first recurring invoice

CUSTOMER SERVICE ───────────────────────────────────────────
  Technical complaint logged
          → CSR can spawn O&M Job Card from ticket
          → Job Card Completed → Ticket auto-moves to "Resolved"
  Billing complaint logged
          → Billing Officer notified
  SLA at 80% elapsed
          → Auto-escalate + push notification to manager

O&M ────────────────────────────────────────────────────────
  Job Completed
          → Linked CS Ticket → "Resolved"
          → If Installation → Customer → "CONNECTION_ACTIVE"
  PM Completed
          → Log entry + next due date auto-calculated

BILLING ────────────────────────────────────────────────────
  Transaction approved at Auth 1 → Appears in Auth 2 queue
  Invoice Posted → Customer balance updated
  Non-Payment Block applied → Customer status updated
  Payment Posted → Transaction ledger updated
```

---

## 9. In-App Notification System

Using **Supabase Realtime** for live push notifications (no external service needed).

| Event | Notified Roles |
|-------|---------------|
| New ticket assigned to me | CS Agent / Field Technician |
| SLA at 80% elapsed | Assigned Agent + CS Manager |
| SLA breached | CS Manager + Dept Head |
| Transaction submitted for Approval 1 | Billing Manager |
| Transaction moved to Approval 2 | Finance Manager |
| CRF approved | Sales Officer (creator) |
| Job Card assigned to me | Field Technician |
| New installation request created | O&M Manager |
| PM task overdue | O&M Manager + NOC Engineer |

**UI:** Bell icon in top navbar with unread count badge. Click → dropdown of recent notifications with links.

---

## 10. Responsive Design Strategy

| Breakpoint | Experience |
|------------|-----------|
| **Desktop (≥1280px)** | Full sidebar + horizontal navbar + data table layout |
| **Tablet (768–1279px)** | Collapsible sidebar + responsive tables with horizontal scroll |
| **Mobile (<768px)** | Bottom navigation bar + card-based lists + simplified forms |

**Field Technician Mobile Optimisations:**
- Simplified "My Jobs" card view (no data tables)
- One-tap job status updates
- Camera integration for job completion photos
- TanStack Query offline cache (jobs viewable without internet)

**NOC View Optimisations:**
- Designed for wide monitors (≥1920px)
- Auto-refresh every 30 seconds via Supabase Realtime
- Compact density mode for maximum data visibility

---

## 11. Phased Development Roadmap (12 Weeks)

### Phase 1 — Foundation (Week 1–2)
- [ ] Next.js project setup with TypeScript + Tailwind + shadcn/ui
- [ ] Supabase project setup (DB + Auth + Storage + Realtime)
- [ ] Prisma schema setup + migrations
- [ ] Authentication: Login, Forgot Password, JWT session
- [ ] RBAC middleware (role-based route protection)
- [ ] Universal Data Table component (TanStack Table v8)
- [ ] Global layout (navbar, sidebar, notification bell shell)
- [ ] Customer Search + Customer Detail page

### Phase 2 — Billing Module (Week 3–4)
- [ ] Billing Dashboard
- [ ] All 17 existing Billing pages rebuilt in Next.js
- [ ] 2-tier approval workflow engine
- [ ] PDF invoice generation
- [ ] Excel export on all pages

### Phase 3 — Reports Module (Week 5)
- [ ] All 8 existing Report pages rebuilt
- [ ] Excel + PDF export on all reports
- [ ] Advanced column filters (TanStack Table)
- [ ] Date range filters

### Phase 4 — Customer Service Module (Week 6–7)
- [ ] Ticket Create / Manage / Escalate / Close lifecycle
- [ ] SLA engine (auto-deadline + breach detection via Edge Function)
- [ ] Escalation matrix (auto-trigger notifications)
- [ ] Ticket Detail page with activity timeline
- [ ] CS Dashboard with live metrics
- [ ] Supabase Realtime for notification delivery
- [ ] CSAT / Feedback page

### Phase 5 — Sales Module (Week 8–9)
- [ ] Lead Management with activity log
- [ ] CRF Tracking (Approve / Reject workflow)
- [ ] Quotation generator with PDF export
- [ ] Sales Dashboard + Kanban pipeline view
- [ ] Sales Performance report

### Phase 6 — O&M Module (Week 10–11)
- [ ] Job Card lifecycle (Create → Dispatch → Complete)
- [ ] Technician Management + availability status
- [ ] NOC Live View with Supabase Realtime
- [ ] Preventive Maintenance scheduler
- [ ] Installation Request pipeline (from Sales CRF approval)
- [ ] Mobile-responsive Technician view

### Phase 7 — Admin Panel + Polish (Week 12)
- [ ] Admin: User Management (invite, edit, deactivate)
- [ ] Admin: Role Permissions viewer
- [ ] Admin: Area / Package / Settings configuration
- [ ] Cross-module integration end-to-end testing
- [ ] RBAC enforcement testing (all roles)
- [ ] Performance optimization (RSC, Suspense boundaries)
- [ ] Deployment to Vercel + Supabase production

---

## 12. Summary — Total Pages Count

| Module | Pages |
|--------|------:|
| Auth (Login + Forgot Password) | 2 |
| Global Dashboard | 1 |
| Customer Search + Detail | 2 |
| **Sales** | 7 |
| **Customer Service** | 7 |
| **O&M** | 8 |
| **Billing** (17 existing + 1 dashboard) | 18 |
| **Reports** (8 existing + 3 new) | 11 |
| **Admin Panel** | 5 |
| **Total** | **61 pages** |

---

*Document Version: 1.0*
*Prepared: 2026-08-05*
*Status: ✅ Ready for Development — Pending Client Approval*
