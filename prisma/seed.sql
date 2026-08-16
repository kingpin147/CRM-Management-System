-- ==========================================================
-- EnergyGurus CRM - Dummy Data Seed for Supabase SQL Editor
-- Run this directly in Supabase Dashboard -> SQL Editor -> Run
-- ==========================================================

-- 1. Insert Staff Users
INSERT INTO "User" ("id", "supabaseId", "fullName", "email", "role", "isActive", "createdAt")
VALUES 
  ('usr-001', 'supa-admin-001', 'Muhammad Nouman (Admin)', 'admin@energygurus.pk', 'SUPER_ADMIN', true, NOW()),
  ('usr-002', 'supa-sales-001', 'Hamza Tariq (Sales Lead)', 'sales@energygurus.pk', 'SALES', true, NOW()),
  ('usr-003', 'supa-om-001', 'Engr. Bilal Ahmed (O&M Manager)', 'om@energygurus.pk', 'INSTALLATION', true, NOW())
ON CONFLICT ("email") DO NOTHING;

-- 2. Insert Customers
INSERT INTO "Customer" ("id", "customerCode", "fullName", "customerType", "contactNumber", "email", "cnic", "crfNumber", "status", "signupDate", "activationDate", "address", "houseNumber", "streetNumber", "block", "subArea", "area", "city", "country", "accountExecutiveId")
VALUES
  ('cust-001', 'EG-2026-001', 'Dr. Zafar Iqbal', 'RESIDENTIAL', '+92 300 8451234', 'zafar.iqbal@gmail.com', '35201-1234567-1', 'CRF-2026-0101', 'CONNECTION_ACTIVE', '2026-01-15', '2026-01-20', 'House 142-A, Street 7, Sector J, DHA Phase 5, Lahore', '142-A', 'Street 7', 'Block J', 'Phase 5', 'DHA', 'Lahore', 'Pakistan', 'usr-002'),
  ('cust-002', 'EG-2026-002', 'Kohinoor Textile Mills (HQ)', 'CORPORATE', '+92 42 35789000', 'facilities@kohinoor.com.pk', '35202-9988776-5', 'CRF-2026-0102', 'CONNECTION_ACTIVE', '2025-08-10', '2025-08-15', 'Plot 45, Main Industrial Zone, Gulberg III, Lahore', 'Plot 45', 'Main Boulevard', 'Industrial Zone', 'Gulberg III', 'Gulberg', 'Lahore', 'Pakistan', 'usr-002'),
  ('cust-003', 'EG-2026-003', 'Syed Usman Ali', 'RESIDENTIAL', '+92 321 4455667', 'usman.ali@outlook.com', '35202-3344556-9', 'CRF-2026-0103', 'PENDING_ACTIVATION', '2026-08-01', '2026-08-05', 'House 88, Street 12, Sector F-7/2, Islamabad', '88', 'Street 12', 'Block C', 'Sector F-7/2', 'F-7', 'Islamabad', 'Pakistan', 'usr-002'),
  ('cust-004', 'EG-2026-004', 'Al-Madina Agro Industries', 'INDUSTRIAL', '+92 301 7788990', 'contact@almadina-agro.pk', '36302-5566778-1', 'CRF-2026-0104', 'CONNECTION_ACTIVE', '2025-06-15', '2025-06-20', 'Plot 12-B, Small Industrial Estate, Multan', 'Plot 12-B', 'Vehari Road', 'Sector 4', 'Industrial Estate', 'Multan Road', 'Multan', 'Pakistan', 'usr-002'),
  ('cust-005', 'EG-2026-005', 'Chaudhry Nadeem Akhtar', 'RESIDENTIAL', '+92 333 5566778', 'nadeem.akhtar@yahoo.com', '35201-9988112-3', 'CRF-2026-0105', 'NON_PAYMENT_BLOCKED', '2025-01-05', '2025-01-10', '52-B Canal Road, Model Town, Lahore', '52', 'Canal Road', 'Block B', 'Model Town', 'Model Town', 'Lahore', 'Pakistan', 'usr-002'),
  ('cust-006', 'EG-2026-006', 'Fatima Memorial Hospital (Solar Wing)', 'CORPORATE', '+92 42 111 555 600', 'admin.solar@fms.edu.pk', '35201-7788990-2', 'CRF-2026-0106', 'FOC_CONNECTION', '2024-11-20', '2024-12-01', 'Shadman Road, Block G, Shadman, Lahore', 'Block G', 'Shadman Road', 'Block G', 'Shadman', 'Shadman', 'Lahore', 'Pakistan', 'usr-002')
ON CONFLICT ("customerCode") DO NOTHING;

-- 3. Insert Solar Systems
INSERT INTO "SolarSystem" ("id", "customerId", "disco", "meterType", "meterPhase", "zeroExportDevice", "inverterBrand", "inverterType", "inverterPhase", "inverterCategory", "inverterSize", "noOfInverters", "inverterSerial", "panelBrand", "panelType", "panelTechnology", "panelWattage", "noOfPanels", "totalWattage", "batteryCategory", "batteryType", "batteryBrand", "noOfBatteries", "batterySerial", "earthing", "earthingAcOhms", "earthingDcOhms", "lightningProtection", "breakerName", "ingressProtection", "structureType", "structureMaterial", "systemInstallationDate", "installerName", "installerCompany", "lastAuditDate", "inverterStatus", "panelStatus", "batteryStatus")
VALUES
  ('solar-001', 'cust-001', 'LESCO', 'Green Meter', 'Three Phase', true, 'Huawei SUN2000', 'Hybrid', 'Three', 'High Voltage', '15kW', 1, 'HW-SUN15K-2026019', 'Longi Hi-MO 6', 'Monofacial', 'Mono Perc', 585, 26, 15210, 'High Voltage', 'Lithium', 'Huawei LUNA2000', 2, 'HW-BAT10K-9921', 'Both', 1.2, 1.4, true, 'Schneider EasyPact', 'IP65', 'Elevated', 'Hot Dip Galvanized', '2025-11-10', 'Engr. Bilal Ahmed', 'EnergyGurus Operations', '2026-07-01', 'Excellent', 'Excellent', 'Good'),
  ('solar-002', 'cust-002', 'LESCO', 'Green Meter', 'Three Phase', false, 'Sungrow SG110CX', 'OnGrid', 'Three', 'High Voltage', '100kW', 2, 'SG-110CX-884120', 'Jinko Solar Tiger Neo', 'Bifacial', 'Topcon', 620, 320, 198400, 'None', 'None', 'N/A', 0, 'N/A', 'Both', 0.8, 0.9, true, 'ABB SACE Emax 2', 'IP66', 'Elevated', 'Hot Dip Galvanized', '2025-08-15', 'Engr. Bilal Ahmed', 'EnergyGurus Industrial', '2026-08-01', 'Excellent', 'Good', 'N/A'),
  ('solar-003', 'cust-003', 'IESCO', 'Green Meter Pending', 'Three Phase', true, 'Growatt SPH 10000TL3', 'Hybrid', 'Three', 'Low Voltage', '10kW', 1, 'GW-SPH10K-5521', 'Canadian Solar HiKu7', 'Monofacial', 'Mono Perc', 590, 18, 10620, 'Low Voltage', 'Lithium', 'Pylontech US5000', 2, 'PY-US5K-30219', 'Both', 1.5, 1.6, true, 'Terasaki MCCB', 'IP65', 'Standard', 'Aluminium', '2026-08-01', 'Engr. Bilal Ahmed', 'EnergyGurus Operations', '2026-08-05', 'New', 'New', 'New'),
  ('solar-004', 'cust-004', 'MEPCO', 'Green Meter', 'Three Phase', false, 'Sungrow SG50CX', 'OnGrid', 'Three', 'High Voltage', '50kW', 1, 'SG-50CX-4912', 'JA Solar DeepBlue 4.0', 'Bifacial', 'Topcon', 580, 88, 51040, 'None', 'None', 'N/A', 0, 'N/A', 'Both', 0.9, 1.1, true, 'Schneider Electric NSX', 'IP66', 'Elevated', 'Hot Dip Galvanized', '2025-06-20', 'Engr. Bilal Ahmed', 'EnergyGurus Industrial', '2026-07-15', 'Good', 'Good', 'N/A'),
  ('solar-005', 'cust-005', 'LESCO', 'Green Meter', 'Three Phase', true, 'Knox Krypton 10kW', 'Hybrid', 'Three', 'Low Voltage', '10kW', 1, 'KX-KRP10-1192', 'Longi Hi-MO X6', 'Monofacial', 'Mono Perc', 575, 18, 10350, 'Low Voltage', 'Tubular', 'Phoenix TX-2500', 4, 'PH-TX25-8841', 'Both', 2.1, 2.4, false, 'Chint Electric', 'IP54', 'Standard', 'Painted Mild Steel', '2025-01-10', 'Engr. Bilal Ahmed', 'EnergyGurus Operations', '2026-05-10', 'Fair', 'Good', 'Fair'),
  ('solar-006', 'cust-006', 'LESCO', 'Green Meter', 'Three Phase', true, 'Fronius Eco 27.0-3-S', 'OnGrid', 'Three', 'High Voltage', '27kW', 1, 'FR-ECO27-9021', 'Trina Solar Vertex', 'Bifacial', 'Topcon', 600, 45, 27000, 'None', 'None', 'N/A', 0, 'N/A', 'Both', 0.7, 0.8, true, 'Siemens 3VA', 'IP66', 'Elevated', 'Hot Dip Galvanized', '2024-12-01', 'Engr. Bilal Ahmed', 'EnergyGurus Operations', '2026-08-10', 'Excellent', 'Excellent', 'N/A')
ON CONFLICT ("customerId") DO NOTHING;

-- 4. Insert Package Plans
INSERT INTO "PackagePlan" ("id", "customerId", "systemSizeKw", "packageTier", "billingType", "monitoringTime", "monthlyBasePrice", "appliedDiscount", "salesTaxAmount", "totalAmount")
VALUES
  ('pkg-001', 'cust-001', '10-20 kW', 'Comprehensive', 'Monthly', '24 Hours', 15000, 10, 2160, 15660),
  ('pkg-002', 'cust-002', '30+ kW', 'Comprehensive', 'Quarterly', '24 Hours', 85000, 20, 10880, 78880),
  ('pkg-003', 'cust-003', '1-10 kW', 'Moderate', 'Monthly', '12 Hours', 9500, 0, 1520, 11020),
  ('pkg-004', 'cust-004', '30+ kW', 'Basic', 'Monthly', '12 Hours', 35000, 0, 5600, 40600),
  ('pkg-005', 'cust-005', '1-10 kW', 'Basic', 'Monthly', '12 Hours', 8000, 0, 1280, 9280),
  ('pkg-006', 'cust-006', '20-30 kW', 'Comprehensive', 'FOC', '24 Hours', 28000, 100, 0, 0)
ON CONFLICT ("customerId") DO NOTHING;

-- 5. Insert Invoices
INSERT INTO "Invoice" ("id", "invoiceNumber", "customerId", "billingPeriod", "amount", "salesTax", "totalAmount", "status", "dueDate", "createdAt")
VALUES
  ('inv-001', 'INV-2026-001', 'cust-001', '2026-07-01', 13500, 2160, 15660, 'Paid', '2026-07-15', '2026-07-01'),
  ('inv-002', 'INV-2026-002', 'cust-001', '2026-08-01', 13500, 2160, 15660, 'Paid', '2026-08-15', '2026-08-01'),
  ('inv-003', 'INV-2026-003', 'cust-002', '2026-05-01', 204000, 32640, 236640, 'Paid', '2026-05-20', '2026-05-01'),
  ('inv-004', 'INV-2026-004', 'cust-002', '2026-08-01', 204000, 32640, 236640, 'Unpaid', '2026-08-25', '2026-08-01'),
  ('inv-005', 'INV-2026-005', 'cust-003', '2026-08-05', 9500, 1520, 11020, 'Paid', '2026-08-20', '2026-08-05'),
  ('inv-006', 'INV-2026-006', 'cust-004', '2026-07-01', 35000, 5600, 40600, 'Paid', '2026-07-15', '2026-07-01'),
  ('inv-007', 'INV-2026-007', 'cust-004', '2026-08-01', 35000, 5600, 40600, 'Paid', '2026-08-15', '2026-08-01'),
  ('inv-008', 'INV-2026-008', 'cust-005', '2026-06-01', 8000, 1280, 9280, 'Overdue', '2026-06-15', '2026-06-01'),
  ('inv-009', 'INV-2026-009', 'cust-005', '2026-07-01', 8000, 1280, 9280, 'Overdue', '2026-07-15', '2026-07-01')
ON CONFLICT ("invoiceNumber") DO NOTHING;

-- 6. Insert Transactions
INSERT INTO "Transaction" ("id", "customerId", "amount", "paymentMethod", "status", "createdAt")
VALUES
  ('tx-001', 'cust-001', 15660, 'Online Bank Transfer (1Link)', 'PAID', '2026-07-05'),
  ('tx-002', 'cust-001', 15660, 'Online Bank Transfer (1Link)', 'PAID', '2026-08-05'),
  ('tx-003', 'cust-002', 236640, 'Direct Corporate Cheque', 'PAID', '2026-05-10'),
  ('tx-004', 'cust-003', 11020, 'Bank Alfalah App', 'PAID', '2026-08-06'),
  ('tx-005', 'cust-004', 40600, 'Online Bank Transfer (HBL)', 'PAID', '2026-07-05'),
  ('tx-006', 'cust-004', 40600, 'Online Bank Transfer (HBL)', 'PAID', '2026-08-05')
ON CONFLICT ("id") DO NOTHING;

-- 7. Insert Ledger Entries
INSERT INTO "LedgerEntry" ("id", "customerId", "invoiceId", "date", "refNumber", "narration", "debit", "credit", "balance", "createdAt")
VALUES
  ('led-001', 'cust-001', 'inv-001', '2026-07-01', 'INV-2026-001', 'Monthly Solar O&M Billing (INV-2026-001)', 15660, 0, 15660, '2026-07-01'),
  ('led-002', 'cust-001', 'inv-001', '2026-07-05', 'REC-INV-2026-001', 'Payment received via 1Link - Bank Alfalah', 0, 15660, 0, '2026-07-05'),
  ('led-003', 'cust-001', 'inv-002', '2026-08-01', 'INV-2026-002', 'Monthly Solar O&M Billing (INV-2026-002)', 15660, 0, 15660, '2026-08-01'),
  ('led-004', 'cust-001', 'inv-002', '2026-08-05', 'REC-INV-2026-002', 'Payment received via 1Link - Bank Alfalah', 0, 15660, 0, '2026-08-05'),
  ('led-005', 'cust-002', 'inv-003', '2026-05-01', 'INV-2026-003', 'Quarterly O&M Billing (INV-2026-003)', 236640, 0, 236640, '2026-05-01'),
  ('led-006', 'cust-002', 'inv-003', '2026-05-10', 'REC-INV-2026-003', 'Payment received via Corporate Cheque', 0, 236640, 0, '2026-05-10'),
  ('led-007', 'cust-002', 'inv-004', '2026-08-01', 'INV-2026-004', 'Quarterly O&M Billing (INV-2026-004)', 236640, 0, 236640, '2026-08-01'),
  ('led-008', 'cust-003', 'inv-005', '2026-08-05', 'INV-2026-005', 'Monthly Solar O&M Billing (INV-2026-005)', 11020, 0, 11020, '2026-08-05'),
  ('led-009', 'cust-003', 'inv-005', '2026-08-06', 'REC-INV-2026-005', 'Payment received via Bank Alfalah App', 0, 11020, 0, '2026-08-06'),
  ('led-010', 'cust-005', 'inv-008', '2026-06-01', 'INV-2026-008', 'Monthly Solar O&M Billing (INV-2026-008)', 9280, 0, 9280, '2026-06-01'),
  ('led-011', 'cust-005', 'inv-009', '2026-07-01', 'INV-2026-009', 'Monthly Solar O&M Billing (INV-2026-009)', 9280, 0, 18560, '2026-07-01')
ON CONFLICT ("id") DO NOTHING;

-- 8. Insert Tickets
INSERT INTO "Ticket" ("id", "ticketNumber", "customerId", "ticketType", "source", "assignedTo", "escalation", "status", "actionPriority", "category", "subCategory", "fault", "description", "createdAt")
VALUES
  ('tck-001', 'TCK-2026-101', 'cust-001', 'SERVICE_REQUEST', 'Whatsapp', 'O&M', 'Level-1', 'CLOSED', 'Low', 'Panel', 'Cleaning', 'Routine panel washing', 'Quarterly panel dust cleaning completed on DHA site.', '2026-07-10'),
  ('tck-002', 'TCK-2026-102', 'cust-002', 'TECHNICAL_COMPLAINT', 'Email', 'O&M', 'Level-2', 'PENDING', 'High', 'Inverter', 'Sungrow SG110CX', '(04) GridOverVoltage', 'Inverter 2 tripped due to sudden DISCO grid voltage surge over 260V.', '2026-08-12'),
  ('tck-003', 'TCK-2026-103', 'cust-003', 'BILLING_COMPLAINT', 'UAN', 'Billing', 'Level-1', 'RESOLVED', 'Medium', 'Billing', 'Activation Invoice', 'Advance security deposit verification', 'Payment verified via Bank Alfalah receipt.', '2026-08-06'),
  ('tck-004', 'TCK-2026-104', 'cust-005', 'BILLING_COMPLAINT', 'UAN', 'Billing', 'Level-3', 'ON_HOLD', 'High', 'Billing', 'Non-payment Overdue', 'Connection suspended due to 60+ days unpaid invoices', 'Customer notified via SMS & Email. Awaiting payment receipt.', '2026-07-20')
ON CONFLICT ("ticketNumber") DO NOTHING;
