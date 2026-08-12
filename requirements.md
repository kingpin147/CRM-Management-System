# EnergyGurus CRM Management System Requirements

## 1. Overview
The EnergyGurus CRM is a comprehensive system designed specifically for a Solar Energy & Monitoring business. It handles customer profiling, solar system specifications, complex package pricing (based on kW system sizes and monitoring hours), and comprehensive complaint and ledger management.

## 2. User Roles & Authentication
1. **Authentication**: The home page of the application always starts with the sign-in page.
2. **Registration**: There will be no sign-up page, as the system is invite-only.
3. **Roles**: The system supports the following initial roles:
   * **Super Admin**: Creates usernames and passwords of users and assigns access and permissions to managers.
   * **Manager**: Manager of relevant departments (Sales, Billing, Technical) with specific feature access and permissions.
4. **Post-Login Routing**: After successful login, users are redirected directly to the **User Search Page**.

## 3. Navigation Menu
The top menu contains 4 basic tabs with specific sub-menus:
* **Sales**: Create Sale, Pending Sale. *(Note: After creating a sale by a sales person, it is sent to the Sales Manager for approval, then to Payment Verification, and finally to the SD Manager).*
* **Complain Management**: Pending Complaints.
* **Reports**: Customer Status Report, Sales Report, Customer Receivable, Adjustment Report, Payments Report, Customer Register.
* **Service Delivery**: Inventory Management.

## 4. Key Pages & Workflows

### 4.1 User Search Page (Post-Login)
Automatically displays a search form and data table upon login.
* **Search Fields**: Customer Code, CRF #, Full Name, Contact Number, CNIC, Email.

### 4.2 Customer Profile Page
Accessed by clicking a customer from the search table. It contains a detailed profile with the following tabs:
1. **Customer Profile**: Displays basic customer info (Name, Contact, Address, Type: Residential/Corporate/Industrial, Status, Activation Date).
2. **Package Details**: Displays selected system size, package tier, billing type, and monitoring time.
3. **Customer Ledger**: Displays payment history with columns for Payment Date, Ref # (Receipt and Invoices), Narration, Debit, Credit, and Balance.
4. **Create Ticket**: Form to log complaints.
5. **Complaints Details**: History of generated tickets for the customer.

### 4.3 Create Sale (Solar Specifications Form)
When creating a sale or viewing customer details, exhaustive solar system data is captured:

**1. Customer Details Section:**
* Customer ID (Auto-generated), Customer Name, Customer Status (Active/Temporary Blocked/Terminated), Contact #, House #, Street #, Area, Sub Area, City, Country, Email, CNIC #, CNIC Expiry, Upload CNIC Front/Back, CRP Number, Sign Up Date, Activation Date.
* Customer Type: Residential, Corporate, Industrial.

**2. Package Details Section:**
* **System Type (Size)**: 1-10 kW, 10-20 kW, 20-30 kW, 30 kW & Above.
* **Package**: Basic, Moderate, Comprehensive.
* **Billing Type**: Monthly, Quarterly, Half Yearly, Yearly.
* **Monitoring Time**: 12 Hours, 24 Hours.

**3. Solar System Details Section:**
* **Meter Type**: Green Meter, Non Green.
* **Zero Export Device**: Installed, Not Installed.
* **Inverter**:
  * Brand: (e.g., Huawei, Growatt, Solis, Sungrow, Sofar, Knox, SAJ, Goodwe, Inverex, Fronius, SMA, Crown, Chint, Tesla, Homage, Other)
  * Type: Hybrid, OnGrid, Hybrid+OnGrid.
  * Phase Type: Single Phase, Three Phase.
  * Category: High Voltage, Low Voltage.
  * No of Inverter, Inverter Serial #.
* **Panels**:
  * Brand: (e.g., Jinko, Longi, Canadian Solar, Trina, JA Solar, Risen, Astronergy, SunPower, QCells, Panasonic, REC, Yingli, Talesun, First Solar, Other)
  * Type: P-Type, N-Type.
  * Technology: Mono Perc, Topcon, HJT.
  * Wattage, No of Panels, Total Wattage.
* **Battery**:
  * Category: High Voltage, Low Voltage.
  * Type: Lithium, Tubular, Lead Acid.
  * Brand: (e.g., Pylontech, Huawei, Growatt, BYD, Narada, Shoto, Tesla, LG Chem, Sacred Sun, Exide, Osaka, Phoenix, AGS, Other)
  * No of Batteries, Battery Serial #.
* **Other Hardware**:
  * Earthing: AC, DC, Both AC DC.
  * Lightning Protection (LA): Installed, Not Installed.
  * Breakers Name: (e.g., Tomzn, Schneider, Chint, ABB, Siemens, LS, Fuji, Terasaki, Himel, EATON, Hager, Mitsubishi, Other).

### 4.4 Complain Management (Create Ticket)
Used to log and track issues specifically tailored to solar hardware and billing.
* **Ticket Type**: Technical Complaint, Billing Complaint, Service Request.
* **Source of Complain**: UAN, Email, Whatsapp, Sales, Billing.
* **Escalation**: Level-1, Level-2, Level-3.
* **Assigned To**: Operation & Maintenance, Billing, Sales, Customer Service, Support.
* **Complain Status**: Pending, Resolved, Canceled, OnHold, Closed.

**Technical Complaint Fault Categories:**
* **Inverter**: Over Temp, Overload, Short Circ, Grid Over, Grid Under, Phase.
* **Panel**: (No specific sub-faults listed, general category).
* **Battery**: Bat Vol Low, Bat Over Cur/Short.
* **Breaker**: (General category).

**Billing & Service Categories:**
* **Billing Complaint**: Wrong arrears, Invoice Not Received, Billing is not Updated, Billing Plan Change, Wrong Invoice Charges.
* **Service Request**: Internal Shifting, Package Change, Temp. Blocked, Termination, Restoration, Profile Change Request.

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
* **Quarterly Payment**: 20% Discount
* **Half Yearly Payment**: 40% Discount
* **Yearly Payment**: 60% Discount

*(Example logic calculation for 12 Hours, Basic, 1-10 kW, Quarterly: Base Monthly is 1,000. 3 Months = 3,000. 20% Discount = 2,400 Price. Sales Tax 5% = 120. Total = 2,520).*
