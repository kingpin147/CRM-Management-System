# EnergyGurus CRM Management System Requirements

## 1. Overview
The EnergyGurus CRM is a comprehensive system designed specifically for a Solar Energy & Monitoring business. It handles customer profiling, solar system specifications, complex package pricing (based on kW system sizes and monitoring hours), and comprehensive complaint and ledger management.

## 2. User Roles & Authentication
1. **Authentication**: The home page of the application always starts with the sign-in page.
2. **Registration**: There will be no sign-up page, as the system is invite-only.
3. **Roles**: The system supports the following initial roles:
   * **Super Admin**: Super Admin will have full access to all system features and settings.
   * **Admin**: Creates usernames and passwords of users and assigns access and permissions to managers.
   * **Manager**: Manager of relevant departments (Sales, Billing, Technical) with specific feature access and permissions.
4. **Post-Login Routing**: After successful login, users are redirected directly to the **User Search Page**.

## 3. Navigation Menu
The top menu contains basic tabs with specific sub-menus:
* **Sales**: Create Sale, Pending Sale. *(Note: After creating a sale by a sales person, it is sent to the Sales Manager for approval, then to Payment Verification, and finally to the SD Manager).*
* **Complain Management**: Pending Complaints.
* **Reports**: Customer Status Report, Sales Report, Customer Receivable, Adjustment Report, Payments Report, Customer Register.
* **Service Delivery**: (Note: Inventory Tracking is disabled/not required).

## 4. Key Pages & Workflows

### 4.1 User Search Page (Post-Login)
Automatically displays a search form and data table upon login.
* **Search Fields**: Customer Code, CRF #, Full Name, Contact Number, CNIC, Email.

### 4.2 Customer Profile Page
Accessed by clicking a customer from the search table. It contains a detailed profile with the following tabs:
1. **Customer Profile**: Displays basic customer info (Customer ID, Customer Name, Installation Address, Contact #, Customer Type: Residential/Corporate/Industrial, Customer Status: Active/Temporary Blocked/Terminated, Email, CRF Number, Activation Date, CNIC #) and **Package Details** (System Type, Package, Billing Type, Monitoring Time, Next Billing Date).
2. **Solar System Details**: Displays the full hardware specifications of the customer's installation, including hardware warranty end dates (Inverter Warranty End, Panels Warranty End, Battery Warranty End).
3. **Customer Ledger**: Displays payment history with columns for Payment Date, Ref # (Receipt and Invoices), Narration, Debit, Credit, and Balance. *(Note: Clicking on any Invoice Number opens the Invoice directly in a PDF file format).*
4. **Create Ticket**: Form to log complaints.
5. **Complaints Details**: History of generated tickets for the customer.
6. **Customer History**: Historical events or interactions related to the customer.
7. **Message History**: Automated SMS notifications sent to the customer's registered number.
8. **Email History**: Emails sent to the customer.

### 4.2.1 Automated Invoicing & Notifications
* **Automated Invoicing**: The system generates recurring invoices on the 1st of the month according to the customer's billing cycle (Monthly, Quarterly, Half-Yearly, Yearly). The Billing Manager triggers this for all Active customers via a 'Generate Invoices' process button.
* **Invoice PDF Preview**: Clicking on any Invoice Number across the CRM (Customer Ledger, Invoice lists) opens the formatted invoice as a printable PDF file.
* **Customer Notifications**: The Billing Manager can send emails directly to the customer using a 'Send Email' button. The system also sends automated SMS notifications to the registered contact number.

### 4.3 Create Sale (Solar Specifications Form)
When creating a sale or viewing customer details, exhaustive solar system data is captured:
* **CRF Form Printable PDF**: Upon submitting the signup/sale form, the CRF Number is auto-generated and the complete CRF Form is printable / downloadable as a PDF file.

**1. Customer Details Section:**
* Customer ID (Auto-generated), Customer Name, Customer Status (Active/Temporary Blocked/Terminated), Contact #, House #, Street #, Block, Area, Sub Area, City, Country, Email, CNIC #, CNIC Expiry, Upload CNIC Front/Back, CRF Number (Auto-generated at signup submit), Sign Up Date, Activation Date.
* Customer Type: Residential, Corporate, Industrial.

**2. Package Details Section (Signup Form Dropdown Selections & Profile View):**
* **System Type (Size)**: Dropdown selection (`1–10 kW`, `10–20 kW`, `20–30 kW`, `30 kW & Above`).
* **Package**: Dropdown selection (`Basic`, `Moderate`, `Comprehensive`).
* **Billing Type**: Dropdown selection (`Monthly`, `Quarterly`, `Half Yearly`, `Yearly`, `FOC` - Free of Cost for office/internal installations).
* **Monitoring Time**: Dropdown selection (`12 Hours`, `24 Hours`).
* **Next Billing Date**: Appears automatically based on the billing type (Not applicable for FOC).
* **Custom Pricing Logic**: The system allows manual price entry for arbitrary or custom scenarios (like 30 kW & Above), and calculates the final totals automatically based on entered prices.

**3. Solar System Details Section:**
* **DISCO**: (e.g., LESCO, etc.)
* **Meter Type**: Green Meter, Non Green.
* **Meter Phase**: Single Phase, Three Phase.
* **Zero Export Device**: Installed, Not Installed.
* **Inverter**:
  * Brand: (e.g., Huawei, Growatt, Solis, Sungrow, Sofar, Knox, SAJ, Goodwe, Inverex, Fronius, SMA, Crown, Chint, Tesla, Homage, Other)
  * Type: Hybrid, OnGrid, Hybrid+OnGrid.
  * Phase Type: Single Phase, Three Phase.
  * Category: High Voltage, Low Voltage.
  * Inverter Size: (e.g., 6kW)
  * No of Inverter, Inverter Serial #.
  * **Inverter Warranty End**: Calendar Date Picker.
* **Panels**:
  * Brand: (e.g., Jinko, Longi, Canadian Solar, Trina, JA Solar, Risen, Astronergy, SunPower, QCells, Panasonic, REC, Yingli, Talesun, First Solar, Other)
  * Type: Monofacial, Bifacial.
  * Technology: Mono Perc, Topcon, HJT, ABC, HIBC, TBC, PERC, Other.
  * Wattage, No of Panels, Total Wattage.
  * **Panels Warranty End**: Calendar Date Picker.
* **Battery**:
  * Category: High Voltage, Low Voltage.
  * Type: Lithium, Tubular, Lead Acid, Dry.
  * Brand: (e.g., Pylontech, Huawei, Growatt, BYD, Narada, Shoto, Tesla, LG Chem, Sacred Sun, Exide, Osaka, Phoenix, AGS, Other)
  * No of Batteries, Battery Serial #.
  * **Battery Warranty End**: Calendar Date Picker.
* **Other Hardware & Installation Details**:
  * Earthing: AC, DC, Both AC DC. (Includes: Date of Last Check, OHMs value)
  * Lightning Protection (LA): Installed, Not Installed.
  * Breakers Name: (e.g., Tomzn, Schneider, Chint, ABB, Siemens, LS, Fuji, Terasaki, Himel, EATON, Hager, Mitsubishi, Other).
  * Ingress Protection (IP): 20, 21, 34, 40, 54, 65, 66, 67.
  * Structure Type: Elevated, Standard (Painted, Alumunium, Hot Dip Galvanized, Pre Galvanized) - L1, L2, L3, L4.
* **Installer & Audit Details**:
  * System Installation Date.
  * Installer Details: Name, Company, Address, Contact No, Email Address.
  * Last Audit of System: Date.
  * Hardware Status Ratings (Excellent, Good, Fair, Service Required, Replacement Required) for: Inverter, Panel, Battery, Structure, Cable, AC/DC Earthing, Breakers.

### 4.4 Complain Management (Create Ticket)
Used to log and track issues specifically tailored to solar hardware and billing.
* **Ticket Type**: Technical Complaint, Billing Complaint, Service Request.
* **Source of Complain**: UAN, Email, Whatsapp, Escalation (Level-1, Level-2, Level-3).
* **Assigned To**: Operation & Maintenance, Billing, Sales, Customer Support.
* **Complain Status**: Pending, Resolved, Canceled, OnHold, Closed.
* **First Call Resolution**: Yes, No.

**Technician Assignment Workflow:**
* Technical Complaints are automatically assigned to the O&M Manager.
* Billing and Service Requests are assigned to the Billing Manager.
* When any department team person updates their remarks or complaint status, their name will be shown in the ticket closed setup history.

**Technical Complaint Categories:**
* **Inverter**: Sub-category: Inverter Brands. Faults: (01) BatVolLow, (02) BatOverCurrSw.
* **Panel**: Sub-category: Panel Brands.
* **Battery**: Sub-category: Battery Brands.
* **Breaker**: Sub-category: Breaker Brands.

**Billing & Service Categories:**
* **Billing Complaint**: Wrong arrears, Invoice Not Received, Billing is not Updated, Billing Plan Change, Wrong Invoice Charges.
* **Service Request**: Internal Shifting, Package Change, Temp. Blocked, Termination, Restoration, Profile Change Request.

**Ticket Closed Setup & History Table:**
* The ticket closure form includes: Customer Code, Customer Name, Customer Address, Contact #, Action (High, Medium, Low), Department, Complain Status, Remarks, and Submit.
* A History Table displays the audit trail: Status, Department, Remarks, CreatedBy, CreatedAt, Time in Department.

## 5. Packages & Pricing Plans

The system features dynamic pricing based on monitoring hours, system size, tier, and billing frequency.

### 5.1 Monitoring 12 Hours Package Plan
| System Size | Basic (Monthly) | Moderate (Monthly) | Comprehensive (Monthly) |
| :--- | :--- | :--- | :--- |
| **1-10 kW** | Price: 1,000 (Tax 50) = 1,050 | Price: 1,800 (Tax 90) = 1,890 | Price: 3,000 (Tax 150) = 3,150 |
| **10-20 kW** | Price: 1,250 (Tax 63) = 1,313 | Price: 2,250 (Tax 113) = 2,363 | Price: 3,750 (Tax 188) = 3,938 |
| **20-30 kW** | Price: 1,500 (Tax 75) = 1,575 | Price: 2,700 (Tax 135) = 2,835 | Price: 4,500 (Tax 225) = 4,725 |
| **30 kW & Above** | Custom | Custom | Custom |

### 5.2 Monitoring 24 Hours Package Plan
| System Size | Basic (Monthly) | Moderate (Monthly) | Comprehensive (Monthly) |
| :--- | :--- | :--- | :--- |
| **1-10 kW** | Price: 2,000 (Tax 100) = 2,100 | Price: 3,600 (Tax 180) = 3,780 | Price: 6,000 (Tax 300) = 6,300 |
| **10-20 kW** | Price: 2,500 (Tax 125) = 2,625 | Price: 4,500 (Tax 225) = 4,725 | Price: 7,500 (Tax 375) = 7,875 |
| **20-30 kW** | Price: 3,000 (Tax 150) = 3,150 | Price: 5,400 (Tax 270) = 5,670 | Price: 9,000 (Tax 450) = 9,450 |
| **30 kW & Above** | Custom | Custom | Custom |

### 5.3 Discount Logic Rules
The system must automatically apply the following discounts based on the selected billing frequency (which applies to the base Monthly price multiplied by the number of months):
* **Quarterly Payment**: 10% Discount
* **Half Yearly Payment**: 20% Discount
* **Yearly Payment**: 40% Discount
* **FOC (Free of Cost)**: 100% Discount / Free of Cost (Price = 0, Sales Tax = 0, Total Amount = 0; used for office solar systems or internal installations, bypassing recurring invoicing).

*(Example logic calculation for 12 Hours, Basic, 1-10 kW, Quarterly: Base Monthly is 1,000. 3 Months = 3,000. 10% Discount = 2,700 Price. Sales Tax 5% = 135. Total = 2,835).*
