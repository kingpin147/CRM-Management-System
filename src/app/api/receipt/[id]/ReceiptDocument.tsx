import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 28,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#000',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  
  topSection: {
    flexShrink: 0,
  },

  // Top Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottom: '2px solid #002868',
    paddingBottom: 10,
  },
  logo: {
    width: 190,
    height: 'auto',
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  voucherTitle: {
    fontSize: 20,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  voucherNumberPill: {
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  voucherNumberPillLeft: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  voucherNumberPillRight: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },

  // Info Grid
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  col: {
    width: '48.8%',
  },
  card: {
    border: '1px solid #c2d0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    alignItems: 'flex-start',
  },
  label: {
    width: '40%',
    color: '#555555',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    color: '#000000',
    fontSize: 8.5,
    fontWeight: 'bold',
  },

  // Payment Highlight Box
  paymentBox: {
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #10B981',
    borderRadius: 4,
    padding: 12,
    marginBottom: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmountLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
  },
  paymentAmountValue: {
    fontSize: 18,
    fontWeight: 'extrabold',
    color: '#047857',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8.5,
    fontWeight: 'bold',
    marginTop: 4,
    alignSelf: 'flex-start',
  },

  // Details Table
  table: {
    border: '1px solid #c2d0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#002868',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderCol1: {
    width: '50%',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8.5,
  },
  tableHeaderCol2: {
    width: '25%',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8.5,
    textAlign: 'center',
  },
  tableHeaderCol3: {
    width: '25%',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8.5,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  tableCol1: {
    width: '50%',
    fontSize: 8.5,
    color: '#000',
  },
  tableCol2: {
    width: '25%',
    fontSize: 8.5,
    color: '#000',
    textAlign: 'center',
  },
  tableCol3: {
    width: '25%',
    fontSize: 8.5,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Spacer
  flexSpacer: {
    flexGrow: 1,
    minHeight: 12,
  },

  // Bottom Content
  bottomPinnedContainer: {
    marginTop: 'auto',
    marginBottom: 6,
    flexShrink: 0,
  },
  notesSection: {
    border: '1px solid #c2d0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 8,
  },
  notesBody: {
    padding: 6,
    fontSize: 7.5,
    color: '#333333',
    lineHeight: 1.3,
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  signBox: {
    width: '35%',
    borderTop: '1px dashed #9CA3AF',
    paddingTop: 4,
    alignItems: 'center',
  },
  signText: {
    fontSize: 7.8,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  footerAddress: {
    width: '48%',
    fontSize: 7.5,
    color: '#4B5563',
    lineHeight: 1.2,
  },
  footerTitle: {
    color: '#002868',
    fontWeight: 'bold',
    marginBottom: 1,
    fontSize: 8,
  },

  // Bottom Blue Bar
  footerBlueBar: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 3.5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontSize: 7.5,
    alignItems: 'center',
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 7.5,
  },
})

export function ReceiptDocument({
  customer,
  receipt,
  logoSrc,
}: {
  customer: any
  receipt: any
  logoSrc?: string
}) {
  const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  const paymentDate = receipt?.createdAt ? new Date(receipt.createdAt) : new Date()
  const paymentDateStr = `${paymentDate.getDate()}-${monthShorts[paymentDate.getMonth()]}-${paymentDate.getFullYear()}`
  
  const rawRef = receipt?.refNumber || receipt?.id || '303798'
  const voucherNumber = rawRef.startsWith('PRV-') || rawRef.startsWith('RCP-') || rawRef.startsWith('PAY-') 
    ? rawRef 
    : `PRV-${rawRef.replace(/^(INV|TX|REV)-/, '')}`
  
  const customerIdDigits = customer?.customerCode ? customer.customerCode.replace(/^[A-Za-z]+-/, '') : (customer?.id || '9742')
  const amount = Number(receipt?.credit || receipt?.amount || 50000)
  const narration = receipt?.narration || 'Payment received against solar O&M subscription billing'
  const paymentMethod = receipt?.paymentMethod || 'Online Bank Transfer / KuickPay'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topSection}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <View style={styles.logo}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#002868' }}>EnergyGurus.Online</Text>
              </View>
            )}
            <View style={styles.titleWrapper}>
              <Text style={styles.voucherTitle}>RECEIPT VOUCHER</Text>
              <View style={styles.voucherNumberPill}>
                <Text style={styles.voucherNumberPillLeft}>Voucher #</Text>
                <Text style={styles.voucherNumberPillRight}>{voucherNumber}</Text>
              </View>
            </View>
          </View>

          {/* Amount Paid Highlight Card */}
          <View style={styles.paymentBox}>
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentAmountLabel}>AMOUNT RECEIVED:</Text>
                <Text style={styles.statusBadge}>✓ PAYMENT VERIFIED & CREDITED</Text>
              </View>
              <Text style={styles.paymentAmountValue}>PKR {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>

          {/* Two-Column Info Grid */}
          <View style={styles.grid}>
            {/* Left: Customer Info */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>RECEIVED FROM (CUSTOMER)</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer ID:</Text>
                    <Text style={styles.value}>{customerIdDigits}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{customer?.fullName || 'Customer'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Contact #:</Text>
                    <Text style={styles.value}>{customer?.contactNumber || '—'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>CNIC #:</Text>
                    <Text style={styles.value}>{customer?.cnic || '—'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{customer?.address || 'Lahore, Pakistan'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right: Voucher Info */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>RECEIPT VOUCHER DETAILS</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Voucher #:</Text>
                    <Text style={styles.value}>{voucherNumber}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Payment Date:</Text>
                    <Text style={styles.value}>{paymentDateStr}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Payment Mode:</Text>
                    <Text style={styles.value}>{paymentMethod}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Transaction Ref:</Text>
                    <Text style={styles.value}>{rawRef}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Account Exec:</Text>
                    <Text style={styles.value}>{customer?.accountExecutive || 'EnergyGurus Finance'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Breakdown Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCol1}>Payment Narration / Description</Text>
              <Text style={styles.tableHeaderCol2}>Payment Method</Text>
              <Text style={styles.tableHeaderCol3}>Amount (PKR)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>{narration}</Text>
              <Text style={styles.tableCol2}>{paymentMethod}</Text>
              <Text style={styles.tableCol3}>{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Spacer */}
        <View style={styles.flexSpacer} />

        {/* Bottom Pinned Section */}
        <View style={styles.bottomPinnedContainer}>
          <View style={styles.notesSection}>
            <Text style={styles.notesHeader}>TERMS & ACKNOWLEDGEMENT</Text>
            <View style={styles.notesBody}>
              <Text>• This is a computer-generated Payment Receipt Voucher confirming acknowledgment of received funds.</Text>
              <Text>• All payments are subject to real-time clearance and bank reconciliation.</Text>
              <Text>• Thank you for choosing EnergyGurus for your Solar Operations & Maintenance services.</Text>
            </View>
          </View>

          {/* Signatures */}
          <View style={styles.signRow}>
            <View style={styles.signBox}>
              <Text style={styles.signText}>Customer Signature</Text>
            </View>
            <View style={styles.signBox}>
              <Text style={styles.signText}>Authorized Officer / Accounts</Text>
            </View>
          </View>

          {/* Footer Addresses */}
          <View style={styles.footerRow}>
            <View style={styles.footerAddress}>
              <Text style={styles.footerTitle}>Head Office:</Text>
              <Text>Building No 61, Block A, Bankers Society, State Life - Lahore</Text>
            </View>
            <View style={[styles.footerAddress, { borderLeft: '1px solid #c2d0e0', paddingLeft: 10 }]}>
              <Text style={styles.footerTitle}>South Office:</Text>
              <Text>80 C, Ground Floor 13th Commercial Street Road, DHA Phase II - Karachi</Text>
            </View>
          </View>
        </View>

        {/* Bottom Blue Bar */}
        <View style={styles.footerBlueBar}>
          <Text style={styles.footerBarText}>www.energygurus.online</Text>
          <Text style={{ color: '#FFF' }}>|</Text>
          <Text style={styles.footerBarText}>facebook.com/energygurus.online</Text>
          <Text style={{ color: '#FFF' }}>|</Text>
          <Text style={styles.footerBarText}>youtube.com/energygurus.online</Text>
        </View>
      </Page>
    </Document>
  )
}
