# CRM Management System Requirements

> [!NOTE]
> This document is continuously updated with requirements based on user-provided images and specifications.

## 1. Overview
The goal is to build a modern, robust Customer Relationship Management (CRM) system. This system will include detailed reporting, complaint management, and billing modules. 

## 2. User Roles & Authentication
* **Authentication**: The home page of the application always starts with the Sign-in page.
* **Registration**: There will be no sign-up page, as the system is invite-only.
* **Roles**: The system supports the following initial roles (specific feature access and permissions will be defined later):
  * Super Admin
  * Admin
  * Manager
  * Sales Manager
* **Post-Login Routing**: After successful login, users are redirected directly to the User Search Page.

### 2.1 Sales Manager & Manager Roles
* **Post-Login Routing**: After sign-in, the User/Search page opens automatically, displaying the search form and data table.
* **Navigation Menu**: The top menu for these roles contains 4 basic tabs with specific sub-menus:
  * **Reports**: ConnectivityWise Report, Customer Status Report
  * **Sales**: Create Sale, Pending Sale
  * **Complain Management**: Pending Complains
  * **SD**: Inventory Management

## 3. Navigation & Modules
The application features a top navigation bar with tabs that vary based on the user's role (e.g., Sales Manager / Manager role has access to Reports, Sales, Complain Management, and SD). Each tab contains specific sub-menus:

### 3.1 Reports
* ConnectivityWise Report
* Customer Status Report
*(Note: Full admin view may also include additional financial and receivable reports)*

### 3.2 Sales
* Create Sale
* Pending Sale

### 3.3 Complain Management
* Pending Complains

### 3.4 SD
* Inventory Management

### 3.5 Billing
*(Available for specific admin/billing roles)*
* Credit Adjustment
* ServiceWise Status Changed
* Transaction Approval
* Transaction Ledger
* Debit Adjustment
* Asset Invoice
* Asset Invoice Approval
* Service Invoice
* Services Invoice Approval
* Transaction Approval 2
* Payment Adjustment
* Payments Approval
* Non Payment Block
* Reset Radius Sessions
* Customer Package Details
* PendingList Cpm
* Temporay Block Active

## 4. Key Pages & Features

### 4.1 Sign-in Page
* **Layout**: A split-screen design. Left side features a modern graphic. Right side contains the login form.
* **Fields**: Email and Password.
* **Links**: "Forgot Password?" link.
* **Actions**: A primary "Sign In" button.

### 4.2 User Search Page
The primary landing page post-login, containing search capabilities and a data grid.

**Basic Search:**
* Search input field
* Dropdown selector (e.g., searching by "Customer Code")
* Primary "Search" button
* "Advanced Search" toggle/link

**Advance Search Filter:**
A detailed form to narrow down customer records using the following fields:
* Customer Code
* CRF #
* Full Name
* Contact Number
* CNIC
* Email
* A primary "Search" button for the advanced filter.

**Advance Search Result Table:**
Below the search form, a data table displays the results with the following columns (with column filtering):
* Customer Code
* CRF Number
* Full Name
* CNIC
* Mobile Number
* Email Address
* Status
* **Action**: Contains a "View Customer" eye icon. Clicking this icon opens the detailed Customer Profile page for that user.

**Export:**
* An "Export to Excel" button is located at the top-left of the results table.

### 4.2.1 Customer Profile Page
When a user clicks the eye icon in the search results table, this comprehensive profile page opens. It is divided into several cards/sections:

**1. Customer Profile Card (Left Column):**
* Displays User Avatar, Name, Status, Balance.
* Fields: Activation Status, Health Complaint Status, Customer Code, CRF Number, Customer Type, Activation Date, Email, Phone, Identification Number, City, Location, Installation Address.

**2. Package Details Card:**
* Fields: Package, OLT, OLT Information, Internet Profile.

**3. Log Complains Card:**
* Features a "Create Ticket" button to log a new complaint.

**4. Recent Complaints Table:**
* Columns: DEPARTMENT, TICKET NUMBER, DATETIME, SERVICE/CATEGORY, COMPLAIN, ESCALATION, PRIORTY, STATUS, ACTION.

**5. Billing Profile Card:**
* Fields: Total Outstandings, Subscription, POC Name, POC Number, Address.

**6. Services Table:**
* Columns: SERVICETYPE, ACTIVATIONDATE, NEXT BILLING, SERVICENAME, MRC, USERNAME, PASSWORD, STATUS, ACTION.

**7. Customer Ledger Table:**
* Columns: PAYMENT DATE, REF #, NARRATION, DEBIT, CREDIT, BALANCE.
* Also contains an export button.

**8. Logs Section (Tabs):**
* Features multiple tabs: Radius Session Log, Radius Command Log, Radius Auth Reply, Customer Rotation History, Customer Message History.
* **Radius Session Log Table** includes: acctsessionid, username, bandwidth, framedipaddress, nasipaddress, acctstarttime, acctstoptime, acctsessiontime, acctauthentic, upload, download, etc., with an "Export to Excel" button and refresh icon.

### 4.2.2 Inventory Management Page (SD Tab)
Located at URL path `/SD/Profiles`, titled **Verified Profile Signup's**.

**1. Top Search Header:**
* Quick Search Bar (`Search CRM Management System`) with input field, `Customer Code` selector, `Search` button, and an `Advanced Search` link.

**2. Table Control Bar:**
* **Export to Excel** button on the top-left of the data grid.
* **Filter Dropdowns & Action (Top-Right):**
  * **Year Dropdown**: Dropdown to select year based on table data (e.g., `2026`).
  * **Reason / Status Dropdown**: Options include `Please Select`, `Refuse By Customer`, `Refund`, `Cancelled`, `Hold by Customer`, `Hold by Sales Team`, `Out of Coverage`, `Inventory Allocation`.
  * **Transfer Button**: Primary action button to transfer selected records.

**3. Verified Profile Signup's Data Table:**
* **Edit Action Column**: Edit icon on each row (far left) that opens the **Allocate Inventory** modal for that customer.
* **Selection Column**: Row selection checkboxes.
* **Data Columns:**
  * `Customer Code`
  * `CRF Number`
  * `Full Name`
  * `Mobile Number`
  * `City Name`
  * `Area Name`
  * `Sub Area Name`
  * `Address`
  * `Remarks`
  * `Dep. Time Elapsed` (e.g., `202 Days`, `44 Days`, `1 Hours`, `0 Hours`)
  * `Status` (e.g., `PendingOnInventoryAllocation`, `HoldByCustomer`)

**4. Allocate Inventory Modal (Opens via Row Edit Icon):**
* **Header Section**:
  * Customer Initials Avatar box.
  * Customer Name.
  * Badges: `Customer ID` (e.g., `00078309`), `Customer Type` (e.g., `INDIVIDUAL`), `Status` (e.g., `PendingOnInventoryAllocation`).
* **Package Information**:
  * Displays Package Type details (e.g., `Package Type: 50Mbps Blazing Speed X2 (Upto 100Mbps)-M1 | Single`).
* **Service Details Table**:
  * Columns: `SERVICETYPE`, `PACKAGEDETAIL`, `USERNAME`, `PASSWORD`, `OTHER DETAIL`.
* **Inventory Allocation Grid**:
  * Header/Columns: `SERVICE`, `WAREHOUSE`, `PRODUCT`, `BRAND`, `MODEL`, `INVENTORY`.
  * Select Dropdowns for `WAREHOUSE` (options like `Optix HO Lahore`, `STATIC IP Global`), `PRODUCT`, `BRAND`, `MODEL`, `INVENTORY`.
* **Modal Action Footer**:
  * `close` button.
  * `Save` button.

### 4.2.3 Pending Complains Page (Complain Management Tab)
Located at URL path `/Complain/PendingComplains`.

**1. Advance Search Filter Form:**
* Filter fields:
  * `Ticket #` (text input)
  * `Customer Code` (text input)
  * `Country` (select dropdown)
  * `Province` (select dropdown)
  * `City` (select dropdown)
  * `Area` (select dropdown)
  * `Complain Type` (select dropdown)
  * `Category` (select dropdown)
  * `Sub category` (select dropdown)
  * `Fault` (select dropdown)
  * `Department` (select dropdown)
  * `House #` (text input)
  * `Statuses` (select dropdown)
  * `Date` (date picker)
* Action: Primary purple **Search** button.

**2. Pending Complains Data Table:**
* **Top Toolbar**: **Export to Excel** button.
* **Columns**: `Ticket No`, `Created At`, `C.Code`, `CustomerName`, `MobileNumber`, `Department`, `CategoryName`, `SubCategoryName`, `Fcr`, `ClosedBy`, `TicketType`, `Complain`, `RFOsName`, `Remarks`, `Escalation`, `Priority`, `ComplainStatus`, `Address`, `CityName`, `AreaName`, `SubAreaName`, `SourceOfCom...`, `Resolved Elapse (Hours)`, `Time Elapse (Hours)`, `Action`.
* **Action Column**: Contains an Edit icon button on every row that navigates to the dedicated **Edit Complain** page (`/Complain/EditComplain/{id}`).

### 4.2.4 Edit Complain Page
Located at URL path `/Complain/EditComplain/{id}`.

**1. Header Card:**
* Page Title: **Edit Complain - Ticket # [TicketNo]** with subtitle "Update existing complain".
* Customer Initial Avatar box and Customer Name.
* Badges: `Customer ID`, `Customer Type`, `Status`.

**2. Complaint Summary Bar & Description:**
* Displays key fields: `SOURCE`, `SERVICE`, `CATEGORY`, `SUB-CATEGORY`, `FAULT`, `ESCALATION` (badge), `PRIORITY` (badge).
* `Complain Description`: Text box displaying the original complaint description text.

**3. Update Complain Form:**
* Fields:
  * `Action` (select dropdown)
  * `Department` (select dropdown)
  * `Complain Status` (select dropdown)
  * `RFOs` (select dropdown)
  * `Remarks` (textarea for update comments)
  * `FeedBack Grade` (select dropdown)
* Actions: `Update Complain` button and `Back` button.

**4. Complaint History Table:**
* Data grid displaying progress history across departments.
* Columns: `STATUS`, `DEPARTMENT`, `REMARKS`, `CREATEDBY`, `CREATEDAT`, `TIME IN DEPARTMENT`.

### 4.2.5 Create Sale Page (Sales Tab)
Located under `Sales -> Create Sale`. Features a 5-step wizard multi-step form:

**Multi-Step Stepper Header:**
1. **Account**: *Setup Account*
2. **Installation Address**: *Setup Installation Address*
3. **Billing Address**: *Add Payment Address*
4. **Customer Support**: *Data for customer service*
5. **Packages**: *Custmer Packages Detail*

---

#### Step 1: Account (Setup Account)
Form Section Header: **Enter your Account Details**

**Form Fields:**
* `CRF Number *`: Text input (Required)
* `Customer Type *`: Dropdown selector (`Please Select`, Required)
* `Industry *`: Dropdown selector (`Please Select`, Required)
* `Latitude *`: Input field (Default: `0`, Required)
* `Longitude *`: Input field (Default: `0`, Required)
* `Customer Name *` (Prefix): Dropdown selector (`Please Select`, Required)
* `Customer Full Name *`: Text input (Required)
* `CNIC Number *`: Text input (Required)
* `Expiry of CNIC *`: Date input (`dd/mm/yyyy`, Required)
* `Land Line Number *`: Text input (`XXXXXXXXXX`, Required)
* `Mobile Number *`: Text input (`XXXXXXXXXX`, Required)
* `Email Address *`: Text input (Required)
* `Date of Birth *`: Date input (`dd/mm/yyyy`, Required)
* `NTN Number *`: Text input (Required)
* `Tax Status *`: Dropdown selector (`Please Select`, Required)
* `Passport #`: Text input (Optional)

**Navigation Controls:**
* **NEXT** primary purple button to proceed to Step 2 (*Installation Address*).

---

#### Step 2: Installation Address (`Setup Installation Address`)
Form Section Header: **Enter Customer Installation Address**

**Form Fields:**
* `Country *`: Dropdown selector (Required, e.g., `Pakistan`)
* `Province *`: Dropdown selector (Required, e.g., `PUNJAB`)
* `City *`: Dropdown selector (Required, e.g., `LAHORE`)
* `Area *`: Dropdown selector (Required, e.g., `GULBERG 03`)
* `Sub-Area *`: Dropdown selector (Required, e.g., `Main Boulevard`, note: "Sub-area is not available to every area.")
* `SubArea2`: Dropdown selector (`Please Select`, note: "Only for DHA karachi")
* `House Address`: Text input for house address
* `Floor`: Text input
* `Plaza`: Text input
* `Building`: Text input
* `Building No`: Text input
* `Road`: Text input
* `Street`: Text input
* `Lane No`: Text input
* `Block`: Text input
* `Phase`: Text input

**Navigation Controls:**
* `PREVIOUS` button (returns to Step 1)
* `NEXT` button (proceeds to Step 3)

---

#### Step 3: Billing Address (`Add Payment Address`)
Form Section Header: **Enter Customer Billing Address**

**Form Fields:**
* `Country *`: Dropdown selector (Required, e.g., `Pakistan`)
* `Province *`: Dropdown selector (Required, e.g., `PUNJAB`)
* `City *`: Dropdown selector (Required, e.g., `LAHORE`)
* `Area *`: Dropdown selector (Required, e.g., `GULBERG 03`)
* `Sub-Area *`: Dropdown selector (Required, e.g., `Main Boulevard`)
* `SubArea2`: Dropdown selector (`Please Select`)
* `House Address`: Text input
* `Floor`: Text input
* `Plaza`: Text input
* `Building`: Text input
* `Building No`: Text input
* `Road`: Text input
* `Street`: Text input
* `Lane No`: Text input
* `Block`: Text input
* `Phase`: Text input

**Navigation Controls:**
* `PREVIOUS` button (returns to Step 2)
* `NEXT` button (proceeds to Step 4)

---

#### Step 4: Customer Support (`Data for customer service`)
Form Section Header: **Enter data for sale support and services**

**Form Fields:**
* `POC Name *`: Prefix dropdown (e.g. `M/S`) + Text input for full name of POC (Required)
* `POC Contact Number *`: Text input for contact number (Required)
* `Customer Tag *`: Dropdown selector (`Normal`, Required)
* `Attach CNIC Image *`: File upload input (`Choose file`, Required) + "Click here to view last uploaded CNIC" link
* `Attach Back CNIC Image *`: File upload input (`Choose file`, Required) + "Click here to view last uploaded CNIC" link
* `Attach Form PDF *`: File upload input (`Choose file`, Required) + "Click here to view last uploaded PDF" link

**Navigation Controls:**
* `PREVIOUS` button (returns to Step 3)
* `NEXT` button (proceeds to Step 5)

---

#### Step 5: Packages (`Custmer Packages Detail`)
Section Header: **Customer Selected Packages**

**Toolbar Buttons:**
* `Remove` button (purple action button)
* `Add Packages` button (opens the **Add Packages Modal**)

**Customer Selected Packages Data Table:**
* Columns: `Package`, `MRC Amt`, `Dis. Amt`, `SaleTax Amt.`, `ADV.Tax`, `MRC Dis.%`, `Total Mrc`, `OTC`, `Dis. OTC`, `Installment`, `Per. Installment`, `OTC`.

**Package Billing Configuration:**
* `Total Receivable`: Read-only text field (e.g. `3,999`)
* `Business Development Name *`: Dropdown selector (Required, e.g., `Shahid Hameed`)
* `Subscription *`: Dropdown selector (`Monthly`, `Half Yearly`, `Yearly`, Required)

**Add Packages Modal (Opens via `Add Packages` button):**
* Modal Title: **Enter details for customer's selected packages**
* Fields:
  * `Packages`: Dropdown selector (`Please Select`, `Single`, `Bundles`, `AddOn`)
  * `Package - Services`: Dropdown selector (`Please Select`)
* Actions: `Close` button and `Save` button.

**Navigation Controls:**
* `PREVIOUS` button (returns to Step 4)

### 4.2.6 Pending Sale Page (Sales Tab)
Located at URL path `/Sales/PendingList`, titled **Pending Customers**.

**1. Top Search & Controls:**
* Quick Search Bar (`Search CRM Management System`) with input field, `Customer Code` selector, `Search` button, and `Advanced Search` link.
* **Top-Left**: `Export to Excel` button.
* **Top-Right**: Year selector dropdown (e.g., `2026`).
* **Grid Toolbar**: Dedicated global `Search...` bar on the top-right of the data grid.

**2. Pending Customers Data Table:**
* **Columns**:
  * `Proceed to CPM` Action Column (Checkmark icon button)
  * `View` Action Column (Document icon button)
  * `Customer Code`
  * `CRF Number`
  * `Full Name`
  * `Mobile Number`
  * `City Name`
  * `Area Name`
  * `Sub Area Name`
  * `Address`
  * `Remarks`
  * `Source` (e.g., `ONLINE`)
  * `Status` (e.g., `Cancelled`, `HoldBySalesTeam`, `Refund`)

**3. Key Action Buttons:**
* **Proceed to CPM (Tick Icon Button)**: Triggered to proceed the sale to the CPM (Customer Provisioning Management) stage.
* **View (Document Icon Button)**: Opens the pre-populated **5-Step Form Wizard** (`/Sales/Sale?id={id}`) allowing the sales manager/user to review, update, or edit all recorded details across the 5 steps (*Account, Installation Address, Billing Address, Customer Support, Packages*).

### 4.3 ConnectivityWise Report (Reports Tab)
Located at URL path `/EReports/ConnectivityWiseReport`, titled **Connectivity Wise Report**.

**Advance Search Filter Form:**
* **Date Range Picker**: Select Start Date (e.g., `07/07/2026`) and End Date (e.g., `06/08/2026`).
* Primary purple **Search** button.

**Report Data Table:**
Below the search filter, a data table displays results:
* **Top Toolbar:**
  * **Export to Excel** button.
  * **Refresh** button (circular arrow icon next to Export).
  * **Drag-and-Drop Grouping Banner**: *"Drag a column header and drop it here to group by that column"*.
  * Global **Search..** input box on the top-right toolbar.
* **Columns (with individual header column filters):**
  * `Cu...` (Customer ID)
  * `Customer Code`
  * `Full Name`
  * `Package`
  * `Customer Type`
  * `ActivationDate`
  * `CreatedAt`
  * `Created By`
  * `House Address`
  * `City`
  * `Area`
  * `SubArea`
  * `Status By Name`
* **Footer:**
  * **Pagination** controls at the bottom-left.
  * **Total count** display (e.g., `Total 22`) at the bottom-right.

### 4.3.1 Customer Status Report / Customers Register (Reports Tab)
Located at URL path `/EReports/CustomerStatusHistoryReport`, with data table titled **Customers Register**.

**Advance Search Filter Form:**
* **Filter (Multi-Select Status Dropdown)**: Allows selecting multiple status tag filters. Available tags include:
  * `SignUpGenerated`, `PendingOnSales`, `PendingOnInventoryAllocation`, `PendingOnActivation`, `ConnectionActive`, `NonPaymentBlocked`, `Blocked`, `TemporaryBlocked`, `Foc`, `Refund`, `Terminated`, `InHouseConnection`, `MPPL`, `RefuseByCustomer`, `PendingOnCpm`, `Cancelled`, `HoldByCustomer`, `HoldBySalesTeam`, `OutOfCoverage`, `CablingNCoreDone`, `PackageChanged`, `TemporaryTerminated/IP`.
* **Date Range Picker**: Select Start Date (e.g., `07/07/2026`) and End Date (e.g., `06/08/2026`).
* Primary purple **Search** button.

**Customers Register Data Table:**
* **Top Toolbar:**
  * **Export to Excel** button.
  * **Refresh** button (circular arrow icon next to Export).
  * **Drag-and-Drop Grouping Banner**: *"Drag a column header and drop it here to group by that column"*.
  * Global **Search..** input box on top-right toolbar.
* **Columns (with header column filters):**
  * `Customer ID`
  * `Customer Code`
  * `Full Name`
  * `Package`
  * `Created At`
  * `Current Status`
  * `Last Status`
  * `Remarks`
  * `Created At`
  * `Created By`
  * `Sale Person`
  * `House Address`
  * `City`
  * `Area`
  * `SubArea`

### 4.4 Customers Receivable Report (Reports Tab)
A specialized reporting page focusing on customer balances and receivables.

**Report Data Table:**
A large data grid for displaying the receivables:
* **Top Toolbar:**
  * **Export to Excel** button on the left.
  * A dedicated **Search bar** (with a magnifying glass icon) on the right side.
* **Columns:**
  * CustomerID
  * CustomerCode
  * StatusName
  * CustomerName
  * Address
  * SubAreaName
  * CustomerPackage
  * AreaName
  * CityName
  * Arrears
  * CurrentInvoice
  * Payment
  * Adjustment
  * PayableAmount
* **Footer:**
  * **Pagination** controls at the bottom-left (displaying multiple page numbers, e.g., 1 to 10).
  * **Item Count** at the bottom-right (e.g., "1 - 5000 of 78258 items").

### 4.5 Universal Data Table Capabilities
All data tables across the system (e.g., Search Results, Reports) must support the following advanced capabilities:
* **Global Table Search:** A dedicated search bar at the top-right of every table to search for a single record across all table data.
* **Advanced Column Filters:** Every column header must include a robust filtering menu that supports:
  * **Comparison Operations:** Text matching conditions such as *Is equal to, Is not equal to, Starts with, Contains, Does not contain, Ends with, Is null, Is not null, Is empty, Is not empty, Has value, Has no value.*
  * **Logical Conditions:** Support for combining multiple filter conditions using **"And"** / **"Or"** operators.
  * **Actions:** Explicit "Filter" and "Clear" buttons to apply or remove the column conditions.

### 4.6 Adjustment Report (Reports Tab)
A specialized reporting page focusing on customer account adjustments.

**Advance Search Filter:**
A dedicated form to narrow down the report results using the following fields:
* Customer Code (Text input)
* Province (Dropdown selector)
* Area (Dropdown selector)
* Country (Dropdown selector)
* City (Dropdown selector)
* Date range (Start Date to End Date)
* A primary "Search" button.

**Report Data Table:**
Includes the universal data table capabilities (Export to Excel, global search bar, advanced column filtering) with the following specific columns:
* Adjustment ID/Number
* Voucher Type
* Transaction
* Remarks
* Narration
* Transaction Amount
* Sales Tax
* Advance Invoice
* Before Amount
* After Amount
* Customer ID
* Customer Code
* Full Name
* Service Name
* City Name
* Area Name
* Sub Area Name
* Address
* Is Posted
* Created At
* Created By

### 4.7 Billing Payments Report (Reports Tab)
A reporting page designed to track billing payments and their details.

**Advance Search Filter:**
Uses the same advanced filter structure as the Adjustment Report:
* Customer Code (Text input)
* Province (Dropdown selector)
* Area (Dropdown selector)
* Country (Dropdown selector)
* City (Dropdown selector)
* Date range (Start Date to End Date)
* A primary "Search" button.

**Report Data Table:**
Includes the universal data table capabilities (Export to Excel, global search bar, advanced column filtering) with the following specific columns:
* Customer Package
* Customer ID
* Customer Code
* Full Name
* City Name
* Area Name
* Sub Area Name
* Address
* Receipt Number
* Payment Date
* Payment Type
* Narration
* Payment Amount
* Payment Method
* Cheque Number
* Is Posted
* Created At
* Created By
* Posted At
* Posted By

### 4.8 Customers Register (Reports Tab)
A reporting page designed to display a comprehensive list of all registered customers and their detailed attributes.

**Advance Search Filter:**
A dedicated form to narrow down the report results using the following fields:
* City (Dropdown selector)
* Date range (Start Date to End Date)
* A primary "Search" button.

**Report Data Table:**
Includes the universal data table capabilities (Export to Excel, global search bar, advanced column filtering) with an extensive set of columns:
* Customer ID
* Customer Code
* Prefix
* Full Name
* Customer Type
* CNIC
* CNIC Expiry
* Passport Number
* Mobile Number
* Phone No
* Email
* NTN Number
* CRF Number
* Activation Date
* POC Name
* POC Contact
* Package Name
* Username
* Password
* City Name
* Area Name
* Sub Area Name
* Status Name
* Latitude
* Longitude
* Pon
* Card
* OLT
* Sale Person
* Signup Date
* Business Date
* Last Updated

### 4.9 Customer Status Report (Reports Tab)
A specialized report tracking the status changes and current state of customers.

**Advance Search Filter:**
A simple filter form containing:
* Filter (Dropdown selector)
* Date range (Start Date to End Date)
* A primary "Search" button.

**Report Data Table:**
Includes universal data table capabilities (Export to Excel, Refresh button, drag-and-drop column grouping, global search bar, advanced column filtering) with the following columns:
* Customer ID
* Customer Code
* Customer Type
* Full Name
* Package
* Created At
* Current Status
* Last Status
* Remarks
* Created At (Secondary Timestamp)
* Created By
* Sale Person
* House Address
* City
* Area
* Sub Area

### 4.10 Advance Tax Report (Reports Tab)
A reporting page designed to track advance tax amounts and their designated date ranges for customers.

**Advance Search Filter:**
A simple filter form containing only:
* Date range (Start Date to End Date)
* A primary "Search" button.

**Report Data Table:**
Includes universal data table capabilities (Export to Excel, global search bar, advanced column filtering) with the following columns:
* Customer ID
* Customer Code
* Full Name
* CNIC
* From (Date)
* To (Date)
* Taxable Amount
* Tax Amount
* Created At

### 4.11 Invoice Breakup Report (Reports Tab)
A reporting page designed to display a detailed breakdown of customer invoices, including all charges, taxes, and amounts.

**Advance Search Filter:**
A simple filter form containing only:
* Date range (Start Date to End Date)
* A primary "Search" button.

**Report Data Table:**
Includes universal data table capabilities (Export to Excel, global search bar, advanced column filtering) with the following columns:
* Customer ID
* Customer Code
* Full Name
* Invoice Number
* Invoice Date
* Invoice Month
* Package Name
* Package Price
* Discount
* Sales Tax
* Advance Tax
* Net Amount
* Due Date
* Status
* City Name
* Area Name
* Sub Area Name
* Created At
* Created By

### 5.1 Pending Complaints (Complain Management Tab)
A reporting and management page listing all pending customer complaints with comprehensive filter and edit capabilities.

**Advance Search Filter:**
A two-column form to narrow down complaint records using the following fields:
* Ticket # (Text input)
* Customer Code (Text input)
* Country (Dropdown selector)
* Province (Dropdown selector)
* City (Dropdown selector)
* Area (Dropdown selector)
* Complain Type (Dropdown selector)
* Category (Dropdown selector)
* Sub Category (Dropdown selector)
* Fault (Dropdown selector)
* Department (Dropdown selector)
* House # (Text input)
* Statuses (Dropdown selector)
* Date (Date picker)
* A primary "Search" button (bottom-right of filter form).

**Report Data Table:**
Includes the universal data table capabilities (Export to Excel, global search bar, advanced column filtering) with the following specific columns:
* Ticket No
* Created At
* C.Code (Customer Code)
* Customer Name
* Mobile Number
* Department
* Category Name
* Sub Category Name
* FCR (First Call Resolution — Yes/No)
* Closed By
* Ticket Type
* Complain (full complaint text — may be lengthy)
* SFO Name
* Remarks
* Escalation
* Priority
* Complaint Status (e.g., "Pending")
* Address
* City Name
* Area Name
* Sub Area Name
* Source Of Complaint (e.g., "UAN", "Whatsapp")
* Resolved Elapse (Hours)
* Time Elapse (Hours)
* **Edit** (action column — icon button to open an edit form for the complaint record)

**Footer:**
* **Pagination** controls at the bottom-left (e.g., page 1, with prev/next arrows).
* **Item Count** at the bottom-right (e.g., "1 - 186 of 186 items").

## 6. Billing Module

### 6.1 Credit Adjustment — Credit Note Issuance (Billing Tab)
A form-based page used to issue credit notes against a customer account. The page title is **"Credit Note Issuance"** with subtitle **"Complete Data"**.

**Customer Search Section:**
* A "Search Customers" label above a full-width text input ("Enter Customer Code").
* A **"Search"** button (right-aligned, primary color) to look up the customer.
* After a successful search, a **Customer Card** is displayed:
  * **Left side**: Customer avatar/thumbnail with initials (e.g., "BK") and full **Customer Name** (e.g., "Basharat Khaleeque").
  * **Right side**: Colour-coded read-only badge labels for:
    * **Customer ID** (e.g., "00000010" — amber badge)
    * **Customer Type** (e.g., "INDIVIDUAL" — amber badge)
    * **Status** (e.g., "ConnectionActive" — teal/green badge)
* Below the customer card, a **Package Type** label shows the customer's active package (e.g., "Hyper Sonic-200Mbps #M1 | Single").
* A **Service Details Table** lists all services linked to the customer with the following columns:
  * **Service Type** (e.g., Cable Tv, Internet)
  * **Package Detail** (e.g., 1st IPTV, Static IP – 300, Xtream LED-APP, Hyper Sonic-200Mbps #MI)
  * **Username**
  * **Password**
  * **Other Detail** (e.g., device MAC/Android info)

**Credit Note Form Fields** (below the service table):
Arranged in a multi-column grid layout:
* **Credit Type** (Dropdown — default: "Normal")
* **Service** (Dropdown — default: "Internet")
* **Remarks** (Text input — full-width)
* **Sales Tax** (Numeric text input)
* **Advance Income Tax** (Numeric text input)
* **Amount** (Numeric text input)
* **Voucher Type** (Dropdown — placeholder: "Please Select")
* **Adjustment Date** (Date picker input)

**Actions:**
* A **"SUBMIT FOR APPROVAL"** button (primary color, bottom-right) to submit the credit note for the approval workflow.

---

### 6.2 ServiceWise Status Changed (Billing Tab)
A form-based page used to change the status of individual services for a customer. The page title is **"Servicewise Status Changed"**.

**Customer Search Section:**
* Same search layout as Credit Adjustment: full-width "Enter Customer Code" input + **"Search"** button.
* After a successful search, the same **Customer Card** is displayed:
  * Customer avatar/initials + full name on the left.
  * Colour-coded badges for **Customer ID**, **Customer Type**, and **Status** on the right.

**Customer-Level Status Change Fields** (below the customer card):
* **Package Type** (Read-only text field — displays the customer's active package name, e.g., "Hyper Sonic-200Mbps #M1 | Single").
* **New Status** (Dropdown — placeholder: "Please select"; helper text: "Set new status of Customer") — changes the overall customer status.
* **Remarks** (Full-width text area).

**Service Details Table** (below the customer-level fields):
Lists all services linked to the customer. Each row has an individual status change dropdown:
* **Service Type** (e.g., Phone, Internet, Cable Tv)
* **Package Detail** (e.g., Bundle Phone, Static IP – 300, XTREAM 75 Mbps, XTREAM TV, XTREAM VOD, LED + Mobile Tv APP, Hyper Sonic-200Mbps #MI, 1st IPTV, Xtream LED-APP)
* **Current Status** (Bold text — colour-coded: e.g., "Cancelled" in red, "ConnectionActive" in dark/black)
* **Change Status** (Dropdown per row — placeholder: "Please select" — to set a new status for that specific service)

**Actions:**
* A **"Process"** button (primary color, bottom-right) to apply all the status changes.

---

### 6.3 Transaction Approval (Billing Tab)
A list-based approval page displaying pending credit/debit transactions that require authorization. The full page heading is **"Pending Approval For Authorization 1"**.

**Top Toolbar:**
* **Export to Excel** button (top-left).
* **Process** button (primary color, top-right) — applies to all currently selected rows.

**Data Table:**
Includes universal data table capabilities (global search bar, advanced column filtering). Each row has a **checkbox** on the left for individual row selection. The table header also includes a **"select all"** checkbox to select/deselect every row at once.

**Table Columns:**
* ☐ (Checkbox — row selection)
* **Id** (Transaction ID, e.g., 32470)
* **Customer Code** (e.g., 00046132 — displayed as a coloured link)
* **Customer** (Full name, e.g., "Naveed Abdul Rasheed" — displayed as a coloured link)
* **Transaction Type** (e.g., "CR" for Credit)
* **Amount** (Numeric)
* **Service Type** (e.g., Internet, Cable Tv)
* **Voucher Type** (e.g., Normal)
* **Narration** (e.g., "Package Change adjustment", "Additional Service Block")
* **Created By** (e.g., "Shoryar Ahmed")
* **Created At** (Datetime, e.g., "04 Aug, 2026 05:00:35 PM")

**Row Selection & Process Behaviour (✅ Confirmed):**
* Users can select one or more rows using the individual checkboxes, or select all using the header checkbox.
* Clicking the **"Process"** button immediately approves/processes the selected transactions — **no confirmation dialog is shown before execution**.
* Upon success, a **modal dialog** appears with:
  * A **green animated checkmark** circle icon.
  * The message: **"Request has been processed."**
  * An **"Ok, got it!"** button (primary color) to dismiss the modal.
* After dismissal, the processed rows are removed from the pending list.

---

### 6.4 Transaction Ledger (Billing Tab)
A customer-specific ledger page displaying a full financial transaction history. URL: `/Billing/TransactionLeisure`.

**Customer Search Section:**
* Same layout as Credit Adjustment: full-width "Search Customers" input + **Search** button.
* After search, the same **Customer Card** is shown (avatar/initials, full name, colour-coded Customer ID / Customer Type / Status badges).
* **Package Type** label displayed below the customer card (e.g., "Hyper Sonic-200Mbps #M1 | Single").
* **Service Details Table** (same columns as Credit Adjustment): Service Type, Package Detail, Username, Password, Other Detail.

**Ledger Table** (below the service details):
A scrollable data table showing the customer's full transaction history:

* **Table Columns:**
  * **Payment Date** (e.g., "31 May, 2025")
  * **Ref #** (Reference number — e.g., ADJ-0, LHR-10450, PAY-KuickPay-8049, LHR-12089, PAY-KuickPay-33997)
  * **Narration** (e.g., "OPENING BALANCE AS ON 31 MAY 2025", "RECURRING INVOICE PERIOD JUNE-2025", "PAYMENT / COLLECTION AGAINST BILLING BY KUICKPAY")
  * **Debit** (Numeric)
  * **Credit** (Numeric — highlighted in amber/orange when non-zero)
  * **Balance** (Running balance — highlighted in amber/orange)
  * ⚙️ **(Settings / Gear icon)** — action button, rightmost column, one per row

* **Footer:**
  * Pagination controls (bottom-left).
  * Item count (bottom-right, e.g., "1 – 33 of 33 items").

**Row Action — Gear Icon (⚙️):**
* Clicking the gear icon on any row **highlights** that row and shows a small **"View Detail"** label/tooltip next to the icon.
* Clicking **"View Detail"** opens the **Ledger Detail Modal**.

**Ledger Detail Modal:**
A full modal dialog that shows the invoice/ledger breakdown for that specific transaction row.

* **Modal Header:**
  * Title: **"Ledger Detail"**
  * Top-right: A **PDF download icon button** to download/print the bill as a PDF.
  * Top-right: A **✕ (close) button** to dismiss the modal.

* **Modal Content — Per-Service Breakdown Cards:**
  Each service linked to the customer is displayed as a separate card/section inside the modal. Each card contains:
  * **Service Name** as the card heading (e.g., "Phone – Bundle Phone", "Internet – Static IP – 300", "Internet – XTREAM 75 Mbps", "Cable Tv – XTREAM TV", "Cable Tv – XTREAM VOD", "Cable Tv – LED + Mobile Tv APP")
  * An **"Add On"** badge (shown for add-on services).
  * **Date range** on the right of the heading (e.g., "01 Jul, 2025 – 31 Jul, 2025").
  * A two-column field layout inside each card:
    * **Left column:** Service Amount · Sale Tax · Actual Mrc · Actual CRDR
    * **Right column:** Discount % · Advance Tax · After Dis. Mrc · Total Mrc / CRDR

* **Modal Footer:**
  * A **"Close"** button at the bottom to dismiss the modal.

---

### 6.5 Debit Adjustment — Debit Note Issuance (Billing Tab)
A form-based page used to issue debit notes against a customer account. The page title is **"Debit Note Issuance"** with subtitle **"Complete Data"**.

> [!NOTE]
> This page is **structurally identical** to section 6.1 (Credit Note Issuance) with only two differences:
> 1. The page title is **"Debit Note Issuance"** (not "Credit Note Issuance").
> 2. The first form field is labelled **"Debit Type"** (not "Credit Type").
> All other sections — Customer Search, Customer Card, Service Details Table, form fields (Service, Remarks, Sales Tax, Advance Income Tax, Amount, Voucher Type, Adjustment Date), and the **"SUBMIT FOR APPROVAL"** button — are identical.

**Customer Search Section:** *(same as 6.1)*
* Full-width "Search Customers" input + **Search** button.
* Customer Card with avatar/initials, name, and colour-coded badges: Customer ID (amber), Customer Type (amber), Status (teal).
* Package Type label + Service Details Table (Service Type, Package Detail, Username, Password, Other Detail).

**Debit Note Form Fields** (below service table):
* **Debit Type** (Dropdown — default: "Normal")
* **Service** (Dropdown — default: "Internet")
* **Remarks** (Text input — full-width)
* **Sales Tax** (Numeric text input)
* **Advance Income Tax** (Numeric text input)
* **Amount** (Numeric text input)
* **Voucher Type** (Dropdown — placeholder: "Please Select")
* **Adjustment Date** (Date picker input)

**Actions:**
* A **"SUBMIT FOR APPROVAL"** button (primary color, bottom-right) to submit the debit note for the approval workflow.

---
---

### 6.6 Asset Invoice — Custom Invoice (Billing Tab)
A form-based page used to create custom asset invoices for a customer. The page title is **"Custom Invoice - Assets"**. URL: `/Billing/CustomInvoice`.

**Customer Search Section:** *(same as 6.1)*
* Full-width "Search Customers" input + **Search** button.
* Customer Card: avatar/initials, full name, colour-coded badges (Customer ID — amber, Customer Type — amber, Status — teal).
* **Package Type** label below the card.
* **Service Details Table**: Service Type, Package Detail, Username, Password, Other Detail.

**Invoice Line Items Section:**
A dynamic, editable line-item table for building the invoice.

* **Toolbar (above the table):**
  * **+ Add Line** button — adds a new blank product row to the table.
  * **✓ Save changes** button — saves the current line items.
  * **⊗ Cancel changes** button — discards unsaved changes.

* **Line Items Table Columns:**
  * **Product** (Dropdown per row — placeholder: "-- Select --"; available options include):
    * ONT
    * CATV
    * ONT Replacement Charges
    * CAT 6 Charges
    * Shifting Charges
    * Remote Charges
    * Adapter Charges
    * Patch Cord Charges
    * Fiber Charges
    * Configuration Charges
    * *(and more)*
  * **Qty** (Numeric input — default: 1)
  * **Unit Price** (Numeric — default: 0.00; auto-calculates line total)
  * **ST Amount** (Sales Tax Amount — numeric, auto-calculated)
  * **ST %** (Sales Tax Percentage — numeric)
  * **Line Total** (Read-only, auto-calculated)
  * **Delete** (Per-row "✕ Delete" button to remove that line item)

* **Invoice Summary** (bottom-right, below the table):
  * **Subtotal:** auto-calculated total of all line totals.
  * **Tax:** auto-calculated total tax across all lines.
  * **Grand Total:** Subtotal + Tax.

**Actions:**
* A **"SUBMIT FOR APPROVAL"** button (primary color, bottom-right) to submit the asset invoice for the approval workflow.

---

### 6.7 Asset Invoice Approval (Billing Tab)
A list-based approval page for pending asset invoices. The page heading is **"Pending Approval For Asset Invoices"**. URL: `/Billing/AssetInvoiceApproval`.

**Page Layout:**
* The page includes the **standard Search Banner** at the top (same purple/dark gradient banner as the User Search Page — with Search input, Customer Code dropdown, Search button, and Advanced Search link).

**Top-right Action Controls:**
* An **Action Dropdown** (positioned left of the Process button) with the following options:
  * **"Please select"** (default placeholder)
  * **Post** — approves and posts the selected invoices.
  * **Void** (displayed in red/danger color) — voids/cancels the selected invoices.
* A **"Process"** button (primary color) — executes the action selected in the dropdown on all checked rows.

> [!IMPORTANT]
> The user must **first select an action** (Post or Void) from the dropdown, **then** click Process. This is different from Transaction Approval (6.3) where Process always approves.

**Top Toolbar (below the page heading):**
* **Export to Excel** button (top-left).

**Data Table:**
Each row has a **checkbox** for individual selection; the table header has a **select-all** checkbox.

* **Table Columns:**
  * ☐ (Checkbox — row selection)
  * **Invoice No.** (Invoice number)
  * **Customer Id**
  * **Customer Code**
  * **Full Name**
  * **Total Amt.** (Total Amount)
  * **Arrears** (Outstanding arrears)
  * **Invoice Type**
  * **Created By**
  * **Created At**

---

---

### 6.8 Service Invoice — Custom Package Invoice (Billing Tab)
A form-based page used to create custom service invoices for a customer. The page title is **"Custom Invoice - Services"**. URL: `/Billing/CustomPackageInvoice`.

> [!NOTE]
> This page shares the same Customer Search, Customer Card, Service Details Table, toolbar (+ Add Line / Save changes / Cancel changes), invoice summary (Subtotal / Tax / Grand Total), and SUBMIT FOR APPROVAL button as the Asset Invoice (6.6). The key differences are the **page title, URL, and the line-item table columns**.

**Customer Search Section:** *(same as 6.1)*
* Full-width "Search Customers" input + **Search** button.
* Customer Card: avatar/initials, name, colour-coded badges (Customer ID, Customer Type, Status).
* Package Type label + Service Details Table (Service Type, Package Detail, Username, Password, Other Detail).

**Invoice Line Items Section:**

* **Toolbar:** `+ Add Line` · `✓ Save changes` · `⊗ Cancel changes`

* **Line Items Table Columns** *(different from Asset Invoice)*:
  * **Service** (Dropdown per row — placeholder: "-- Select --"; includes an **inline search/filter box** inside the dropdown; available service packages include):
    * SME – 5 Mbps, SME – 10 Mbps, SME – 20 Mbps, SME – 30 Mbps, SME – 40 Mbps, SME – 60 Mbps
    * PREMIUM – 60 Mbps CIR
    * XTREAM Home 4 Mbps, XTREAM Home 10 Mbps
    * XTREAM Home Plus 4 Mbps, XTREAM Home Plus 10 Mbps
    * 64 Kbps – NPDC
    * *(and more — full searchable list)*
  * **Service Price** (Numeric — 0.00; the recurring monthly price of the selected service)
  * **Service OTC Price** (One-Time Charge price — Numeric, 0.00)
  * **ST Amount** (Sales Tax Amount — auto-calculated)
  * **ST %** (Sales Tax Percentage — numeric)
  * **ADV Amount** (Advance Tax Amount — numeric, 0.00)
  * **ADV %** (Advance Tax Percentage — numeric, 0.00)
  * **Line Total** (Read-only, auto-calculated — highlighted in amber/orange)
  * **Delete** (Per-row "✕ Delete" button)

* **Invoice Summary** (bottom-right):
  * **Subtotal**, **Tax**, **Grand Total** — all auto-calculated; Grand Total highlighted in amber/orange.

**Actions:**
* **"SUBMIT FOR APPROVAL"** button (primary color, bottom-right).

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---

### 6.9 Services Invoice Approval (Billing Tab)
A list-based approval page for pending service invoices. The page heading is **"Pending Approval For Services Invoices"**. URL: `/Billing/ServiceInvoiceApproval`.

> [!NOTE]
> This page is **structurally identical** to section 6.7 (Asset Invoice Approval) with only two differences:
> 1. Page heading: **"Pending Approval For Services Invoices"** (not "Pending Approval For Asset Invoices").
> 2. URL: `/Billing/ServiceInvoiceApproval` (not `/Billing/AssetInvoiceApproval`).
> All other elements — Search Banner, Action Dropdown (Post / Void), Process button, Export to Excel, checkbox row selection, and table columns — are identical.

**Page Layout:** Standard Search Banner at the top (same as 6.7).

**Top-right Action Controls:**
* **Action Dropdown**: Please select / **Post** / **Void** (red)
* **Process** button — executes the selected action on all checked rows.

**Top Toolbar:** Export to Excel button.

**Data Table (identical columns to 6.7):**
* ☐ (Checkbox), **Invoice No.**, **Customer Id**, **Customer Code**, **Full Name**, **Total Amt.**, **Arrears**, **Invoice Type**, **Created By**, **Created At**

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---

### 6.10 Transaction Approval 2 (Billing Tab)
A second-level authorization page for transactions that have already been approved by a first authorizer. The page heading is **"Pending Approval For Authorization 2"**.

> [!NOTE]
> This page represents a **two-tier approval workflow**. Transactions appear here after they have been approved in Transaction Approval (6.3 — "Authorization 1"). The key differences from 6.3 are the page heading, the presence of the Search Banner, and two additional **Authorizer** columns showing who completed the first approval.

**Page Layout:** Includes the **standard Search Banner** at the top (same purple/dark gradient banner with Search input, Customer Code dropdown, Search button, Advanced Search link).

**Top-right Action Controls:**
* A **"Process"** button (primary color) — immediately processes all checked rows (same direct behaviour as 6.3, no action dropdown).

**Top Toolbar:** **Export to Excel** button (top-left).

**Data Table:**
Each row has a **checkbox** for individual selection; table header has a **select-all** checkbox.

* **Table Columns:**
  * ☐ (Checkbox — row selection)
  * **Id** (Transaction ID, e.g., 32483)
  * **Customer Code** (e.g., 00019268)
  * **Customer** (Full name, e.g., "Atif Dastgir")
  * **Transaction Type** (e.g., "CR")
  * **Amount** (Numeric, e.g., 859)
  * **Service Type** (e.g., Cable Tv)
  * **Voucher Type** (e.g., Normal)
  * **Narration** (e.g., "Additional Service Block")
  * **Created By** (e.g., "Shoryar Ahmed")
  * **Created At** (Datetime, e.g., "04 Aug, 2026 07:19:57 PM")
  * **Authorizer 1** *(new vs 6.3)* — Name of the person who approved at Authorization level 1 (e.g., "Muhammad Ajmal")
  * **Authorizer 2** *(new vs 6.3, partially visible)* — Date/time or name of the second authorizer field

**Process Behaviour:** Same as 6.3 — clicking Process immediately processes selected rows and shows the **"Request has been processed."** success modal with "Ok, got it!" dismiss button.

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---

### 6.11 Payment Adjustment (Billing Tab)
A form-based page used to record and adjust a payment against a customer account. The page title is **"Payment Adjustment"** with subtitle **"Search Customer with Customer Code"**.

**Customer Search Section:** *(same as 6.1)*
* Full-width text input (customer code) + **Search** button.
* Customer Card: avatar/initials, full name, colour-coded badges (Customer ID — amber, Customer Type — amber, Status — teal).
* **Package Type** label + **Service Details Table** (Service Type, Package Detail, Username, Password, Other Detail).

**Payment Form Fields** (below service table, arranged in a two-column grid):
* **Team Leader** (Dropdown — placeholder: "Please Select"; helper: "Please select Team lead")
* **Agent** (Dropdown — placeholder: "Please Select"; helper: "Please select Agent")
* **Receipt No.** (Text input — placeholder: "Receipt No"; helper: "Please enter Receipt Number")
* **Payment Date** (Date input — format: dd/mm/yyyy; helper: "Please enter Payment Date")
* **Payment Method** (Dropdown — placeholder: "Please Select"; helper: "Please select Payment Method")
* **Payment Amount** (Numeric input — placeholder: "Payment Amount"; helper: "Please enter Amount")

**Actions:**
* A **"SUBMIT"** button (primary color, bottom-right) — submits the payment adjustment directly. *(Note: Unlike other billing forms, this uses "SUBMIT" not "SUBMIT FOR APPROVAL".)*

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---

### 6.12 Payments Approval (Billing Tab)
A list-based approval page for pending payment records. The page heading is **"Pending Approval For Payments"**. URL: `/Billing/PaymentsApproval`.

**Page Layout:** Includes the **standard Search Banner** at the top (purple/dark gradient — Search input, Customer Code dropdown, Search button, Advanced Search link).

**Top-right Action Controls:**
* **Action Dropdown**: Please select / **Post** / **Void** (red)
* **Process** button (primary color) — executes the selected action on all checked rows.

> [!NOTE]
> Same Post / Void action pattern as Asset Invoice Approval (6.7) and Services Invoice Approval (6.9), but applied to **payment records** instead of invoices.

**Top Toolbar:** **Export to Excel** button (top-left).

**Data Table:**
Header checkbox (select all) + per-row checkbox for selection.

* **Table Columns:**
  * ☐ (Checkbox — row selection)
  * **Id**
  * **Customer Id**
  * **Customer Code**
  * **Full Name**
  * **Payment Method**
  * **Payment Amt.** (Payment Amount)
  * **Payment Date**
  * **Receipt Number**
  * **Payment Type**
  * **Bank Name**
  * **Cheque Number**
  * **Account Id** *(partially visible — rightmost column)*

---

### 6.13 Non Payment Block (Billing Tab)
A page used to search customers and apply or change their non-payment block status in bulk. URL: `/User/Npdc`.

**Advance Search Filter:**
* **Customer Code** (Large multi-line text area — allows entry of multiple customer codes, one per line; helper text: *"Search customers with customer code like 00000001, 00000002, 00000003"*)
* A **Search** button (bottom-right of the filter area).

**Search Result Section:**
* **Export to Excel** button (top-left).
* **Statuses** dropdown (top-right of results) with options:
  * Please-Select (default)
  * **Connection Active**
  * **Non Payment Block**
* **Process** button (next to the Statuses dropdown) — applies the selected status to all checked rows.

**Results Table:**
Each row has a **checkbox** for selection; header has a **select-all** checkbox.

* **Table Columns:**
  * ☐ (Checkbox — row selection)
  * **Customer Code** (e.g., 00000010)
  * **CRF Number** (e.g., LHE-20001)
  * **Full Name** (e.g., Basharat Khaleeque)
  * **CNIC** (e.g., 3520014346835)
  * **Mobile Number** (e.g., 03211111123)
  * **Email Address** (e.g., bkhaleeque@gmail.com)
  * **Status** (numeric status code, e.g., "4")
  * **Status** (colour-coded badge, e.g., "ConnectionActive" — teal badge)
  * 👁️ **(View icon)** — action button; hovering shows tooltip "**View Customer**"; clicking opens the Customer Detail page.

---

#### 6.13.1 Customer Detail Page (opened from "View Customer")
A full customer profile page opened when the 👁️ View Customer icon is clicked. URL navigates to: `/User/SearchResult?id=<CustomerID>`.

The page is divided into three panels:

**Left Panel — Customer Profile:**
* Customer avatar/initials (e.g., "BA") + full **Customer Name** (e.g., "Basharat Khaleeque").
* Customer type label (e.g., "Normal" — teal text).
* Outstanding **Balance** amount (e.g., "11969.00").
* **Print** icon button (top-right of the panel, to print/export the profile).
* **Activation Status** — colour-coded badge (e.g., "ConnectionActive").
* **Health Complaint Status** — toggle/indicator.
* Read-only fields:
  * **Customer Code** (e.g., 00000010)
  * **CRF Number** (e.g., LHE-20001)
  * **Customer Type** badge (e.g., INDIVIDUAL — amber)
  * **Activation Date** (e.g., 08 Nov, 2018)
  * **Email**
  * **Phone**
  * **Identification Number** (CNIC)
  * **City** (clickable link, e.g., "LAHORE")
  * **Location** (GPS coordinates, e.g., 24.91740, 67.02896)
  * **Installation Address** (full multi-line address)

**Center Panel — Package Details:**
* **Package** (e.g., Hyper Sonic-200Mbps #MI)
* **OLT** (e.g., LHR-TECH | CARD_00 | PORT_02)
* **OLT Information**
* **Internet Profile** (e.g., 200mbps)

**Right Panel — Log Complaints:**
* A purple/dark banner card with title: **"Log Complaints :"** and subtitle: *"Create Ticket for customer complain"*.
* A **"Create Ticket"** button (white text on dark background) to raise a new complaint ticket for this customer.

**Recent Complaints Table** (below the three panels):
A table displaying the customer's recent complaint history with columns:
* **Department** (e.g., Operation & Maintenance)
* **Ticket Number** (e.g., T-0180139)
* **Datetime** (e.g., 19 May, 2026 04:55:45 PM)
* **Service/Category** (e.g., Internet, Service Queries)
* **Complain** (source/channel e.g., Whatsapp, Billing)
* **Escalation** (e.g., Level-1)
* **Priority** (e.g., Medium, High)
* **Status** (colour-coded badge e.g., "Closed" — teal)
* **Action** (edit icon button per row)

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---

### 6.14 Reset Radius Sessions (Billing Tab)
A page used to search customers and reset their RADIUS network sessions in bulk.

> [!NOTE]
> This page is **structurally identical** to Non Payment Block (6.13) with one key difference:
> * **No "Statuses" dropdown** — the results toolbar shows only a direct **"Process"** button (top-right), because resetting a session is a single action that doesn't require status selection.
> * The **Advance Search Filter**, table columns (Customer Code, CRF Number, Full Name, CNIC, Mobile Number, Email Address, Status numeric, Status badge, 👁️ View icon), checkbox selection, and Export to Excel button are all identical to 6.13.

**Process Behaviour:** Selecting rows and clicking **Process** immediately resets the RADIUS sessions for those customers (kicks them off the network so they reconnect with updated settings).

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---
---

### 6.15 Customer Package Details (Billing Tab)
A searchable, filterable data table showing all customers with their package and service details. Page title: **"Customer Package Details"**. URL: `/Billing/CustomerPackageDetails`.

**Top Filter Controls** (top-right of the page, above the table):
* **Filter** label + **"Please Select"** dropdown — filter the table by customer connection status. The dropdown includes an **inline search box**. All available status options:
  * SignUpGenerated
  * PendingOnSales
  * PendingOnInventoryAllocation
  * PendingOnActivation
  * ConnectionActive
  * NonPaymentBlocked
  * Blocked
  * TemporaryBlocked
  * Foc
  * Refund
  * Terminated
  * InHouseConnection
  * MPPL
  * RefusebyCustomer
* A **text search input** (next to the dropdown, with "..." placeholder) — for searching by keyword.
* A **Search** button (primary color) to apply filters.

**Top Toolbar** (above the table):
* **Export to Excel** button.
* **🔄 Refresh** (reload) icon button.

**Data Table** (Universal Data Table with column-level filters):
* **Table Columns:**
  * **Customer Id** (e.g., 117715)
  * **Customer Code** (e.g., 00078272)
  * **Customer Name** (Full name, e.g., "Javedan Corporation (Property Share)", "Mr. Saroj")
  * **Status** (e.g., "SignUpGenerated")
  * **Last Updated** (Datetime)
  * **Last Updated By**
  * **City** (e.g., KARACHI)
  * **Area** (e.g., Naya Nazimabad, DHA)
  * **Sub Area** (e.g., Block...)
  * **Password**
  * **Service Type** (e.g., Internet)
  * **Service Name** (e.g., "30Mbps Lightning Fast X2 (Upto 75Mbps)-MI")
  * **Service Tag** (e.g., 2241)

* **Footer:** Pagination controls (bottom-left) + item count (bottom-right, e.g., "1 – 2 of 2 items").

---

### 6.16 PendingList Cpm (Billing Tab)
A list of pending customers filtered by year. The page heading is **"Pending Customers"**. URL: `/Sales/PendingListCpm`.

> [!NOTE]
> Despite being listed under the Billing tab in the navigation, this page's URL is under `/Sales/`, suggesting it bridges the Sales and Billing workflows.

**Page Layout:** Includes the **standard Search Banner** at the top (purple/dark gradient with Search input, Customer Code dropdown, Search button, Advanced Search link).

**Top-right Year Filter:**
* A **Year dropdown** (top-right of the page heading row) to filter pending customers by the year of their record. Available years:
  * 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, **2026** (current year, highlighted)

**Top Toolbar:** **Export to Excel** button (top-left).

**Data Table** (Universal Data Table with column-level filters):
* **Table Columns:**
  * **Customer Code**
  * **CRF Number**
  * **Full Name**
  * **Mobile Number**
  * **Sale Explicitly Approved** (checkbox / approval status field)
  * **Address**
  * **Status**

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---

### 6.17 Temporary Block Active (Billing Tab)
A page used to search customers and apply or remove a temporary block on their account. URL: `/User/TemporaryBlock`.

> [!NOTE]
> This page is **structurally identical** to Non Payment Block (6.13) with one key difference — the **Statuses dropdown** options:
> * **Connection Active** — restores the customer's connection.
> * **Temporary Blocked** — applies a temporary block to the customer's account.
>
> The same multi-line Customer Code search filter, table columns (Customer Code, CRF Number, Full Name, CNIC, Mobile Number, Email Address, Status numeric, Status badge), checkbox selection, Export to Excel, and Process button are all present.

**Top-right Action Controls:**
* **Statuses** dropdown: Please-Select / **Connection Active** / **Temporary Blocked**
* **Process** button (primary color) — applies the selected status to all checked rows.

**Data Table Columns:**
* ☐ (Checkbox), **Customer Code**, **CRF Number**, **Full Name**, **CNIC**, **Mobile Number**, **Email Address**, **Status** (numeric), **Status** (badge)

**Footer:** Pagination controls + item count (e.g., "1 – 1 of 1 items").

---

## 7. UI/UX Design & Layout
* **Header/Navbar**: Clean top navigation showing the primary modules (Reports, Complain Management, Billing) and a user profile avatar/indicator.
* **Search Area**: A prominent, styled banner area for the basic search bar.
* **Forms**: Input fields with clear labels and placeholder text (e.g., "Enter Customer Code", "Please enter your full name").
* **Aesthetics**: Modern look, clean UI components, and soft shadows. Avoiding specific original company logos or branding, as requested.

---
**Status**: ✅ ALL PAGES FULLY DEFINED — Roles, authentication flow, detailed search page, all 8 Reports sub-menu pages, Pending Complaints (Complain Management), and all 17 Billing sub-menus (Credit Adjustment, ServiceWise Status Changed, Transaction Approval, Transaction Ledger, Debit Adjustment, Asset Invoice, Asset Invoice Approval, Service Invoice, Services Invoice Approval, Transaction Approval 2, Payment Adjustment, Payments Approval, Non Payment Block + Customer Detail Page, Reset Radius Sessions, Customer Package Details, PendingList Cpm, Temporary Block Active) are fully documented.
