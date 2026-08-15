import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import path from 'path'

// Register fonts if needed, currently using default Helvetica
// Font.register({ family: 'Inter', src: 'path-to-font' })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#12213A', // EnergyGurus Ink
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottom: '2px solid #E8A33D', // EnergyGurus Amber
    paddingBottom: 20,
  },
  logo: {
    width: 100,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#12213A',
  },
  customerSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E8A33D',
    marginBottom: 10,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 30,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1B1F24',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#4A5A73',
    fontSize: 10,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  }
})

export function InvoiceDocument({ customer }: { customer: any }) {
  // Use absolute path to the public logo for server-side generation
  const logoPath = path.join(process.cwd(), 'public', 'LogoNew-pdf.png')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={{ fontSize: 10, color: '#4A5A73', marginTop: 4 }}>Date: {new Date().toLocaleDateString()}</Text>
            <Text style={{ fontSize: 10, color: '#4A5A73' }}>Invoice #: INV-{Math.floor(10000 + Math.random() * 90000)}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={{ fontWeight: 'bold' }}>{customer.fullName}</Text>
          <Text>{customer.address}, {customer.city}</Text>
          <Text>Customer Code: {customer.customerCode}</Text>
          <Text>Contact: {customer.contactNumber}</Text>
        </View>

        {/* Invoice Items */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, { backgroundColor: '#F5F6F3' }]}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Amount (PKR)</Text>
            </View>
          </View>
          {/* Table Row 1 */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                O&M Service Package: {customer.packagePlan.packageTier} ({customer.packagePlan.systemSizeKw})
                {'\n'}Billing Cycle: {customer.packagePlan.billingType}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{customer.packagePlan.monthlyBasePrice}</Text>
            </View>
          </View>
          {/* Table Row 2 */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Discount Applied ({customer.packagePlan.appliedDiscount}%)</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                -{((customer.packagePlan.monthlyBasePrice * customer.packagePlan.appliedDiscount) / 100).toLocaleString()}
              </Text>
            </View>
          </View>
          {/* Total Row */}
          <View style={[styles.tableRow, { backgroundColor: '#E8A33D', color: '#12213A' }]}>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCellHeader, { color: '#12213A' }]}>Total Amount Due</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCellHeader, { color: '#12213A' }]}>
                PKR {customer.packagePlan.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing EnergyGurus!</Text>
          <Text>For support, contact us at support@energygurus.online</Text>
        </View>
      </Page>
    </Document>
  )
}
