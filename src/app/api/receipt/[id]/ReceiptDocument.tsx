import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
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
    marginBottom: 6,
    borderBottom: '1.5px solid #002868',
    paddingBottom: 5,
  },
  logo: {
    width: 145,
    height: 'auto',
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 2,
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
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.5,
  },
  voucherNumberPillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.5,
  },

  // Info Grid
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  col: {
    width: '48.8%',
  },
  card: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 1.8,
    alignItems: 'flex-start',
  },
  label: {
    width: '40%',
    color: '#555555',
    fontSize: 8,
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    color: '#000000',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Payment Highlight Box (Orange Brand Theme)
  paymentBox: {
    backgroundColor: '#FFF7ED',
    border: '1px solid #F58220',
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginBottom: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmountLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#C2410C',
  },
  paymentAmountValue: {
    fontSize: 15,
    fontWeight: 'extrabold',
    color: '#F58220',
  },
  statusBadge: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 2,
    fontSize: 7.5,
    fontWeight: 'bold',
    marginTop: 2,
    alignSelf: 'flex-start',
  },

  // Details Table
  table: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
    marginTop: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  tableHeaderCol1: {
    width: '70%',
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableHeaderCol3: {
    width: '30%',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  tableCol1: {
    width: '70%',
    fontSize: 8,
    color: '#000',
  },
  tableCol3: {
    width: '30%',
    fontSize: 8,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Spacer
  flexSpacer: {
    flexGrow: 1,
    minHeight: 2,
  },

  // Bottom Content
  bottomPinnedContainer: {
    marginTop: 'auto',
    marginBottom: 2,
    flexShrink: 0,
  },
  notesSection: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 7.8,
  },
  notesBody: {
    padding: 4,
    fontSize: 7,
    color: '#333333',
    lineHeight: 1.2,
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  signBox: {
    width: '35%',
    borderTop: '1px dashed #9CA3AF',
    paddingTop: 2,
    alignItems: 'center',
  },
  signText: {
    fontSize: 7.5,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  footerAddress: {
    width: '48%',
    fontSize: 7.2,
    color: '#4B5563',
    lineHeight: 1.15,
  },
  footerTitle: {
    color: '#002868',
    fontWeight: 'bold',
    marginBottom: 1,
    fontSize: 7.8,
  },

  // Bottom Blue Bar
  footerBlueBar: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 3.5,
    borderRadius: 2,
    marginTop: 4,
    alignItems: 'center',
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 7.2,
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
  const paymentDateStr = `${String(paymentDate.getDate()).padStart(2, '0')} ${monthShorts[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`
  
  const rawRef = receipt?.refNumber || receipt?.id || '847291'
  const cleanDigits = rawRef.replace(/^(PAY|RCP|PRV|INV|TX|REV|KuickPay|KUICKPAY)-+/gi, '') || '847291'
  const voucherNumber = `PRV-${cleanDigits}`
  
  const customerIdDigits = customer?.customerCode ? customer.customerCode.replace(/^[A-Za-z]+-/, '') : (customer?.id || '9742')
  const amount = Number(receipt?.credit || receipt?.amount || 50000)
  const narration = receipt?.narration || 'Payment received for INV-2026-007 via Bank Alfalah / 1Link'

  return (
    <Document>
      <Page size={[612, 396]} style={styles.page}>
        <View style={styles.topSection}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <View style={styles.logo}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#002868' }}>EnergyGurus.Online</Text>
              </View>
            )}
            <View style={styles.titleWrapper}>
              <Text style={styles.voucherTitle}>PAYMENT RECEIPT</Text>
              <View style={styles.voucherNumberPill}>
                <Text style={styles.voucherNumberPillLeft}>Receipt #</Text>
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
                    <Text style={styles.value}>
                      {customer?.address || '—'}
                      {customer?.block ? `, ${customer.block}` : ''}
                      {customer?.city ? `, ${customer.city}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right: Receipt Info */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>PAYMENT RECEIPT DETAILS</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Receipt #:</Text>
                    <Text style={styles.value}>{voucherNumber}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Payment Date:</Text>
                    <Text style={styles.value}>{paymentDateStr}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Transaction Ref:</Text>
                    <Text style={styles.value}>{voucherNumber}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Account Exec:</Text>
                    <Text style={styles.value}>
                      {typeof customer?.accountExecutive === 'object' && customer?.accountExecutive
                        ? (customer.accountExecutive.fullName || customer.accountExecutive.name || 'EnergyGurus Finance')
                        : (typeof customer?.accountExecutive === 'string' ? customer.accountExecutive : 'EnergyGurus Finance')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Breakdown Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCol1}>Description</Text>
              <Text style={styles.tableHeaderCol3}>Amount (PKR)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>{narration}</Text>
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
              <Text>• This is a computer-generated Payment Receipt confirming acknowledgment of received funds.</Text>
              <Text>• All payments are subject to real-time clearance and bank reconciliation.</Text>
              <Text>• Thank you for choosing EnergyGurus for your Solar Operations & Maintenance services.</Text>
              <Text>• This is computer generated Receipt no need for signature and stamp</Text>
            </View>
          </View>


          {/* Footer Addresses */}
          <View style={styles.footerRow}>
            <View style={styles.footerAddress}>
              <Text style={styles.footerTitle}>Head Office:</Text>
              <Text>Building No 61, Block A, Bankers Society, State Life - Lahore</Text>
            </View>
            <View style={[styles.footerAddress, { borderLeft: '1px solid #c2d0e0', paddingLeft: 6 }]}>
              <Text style={styles.footerTitle}>South Office:</Text>
              <Text>80 C, Ground Floor 13th Commercial Street Road, DHA Phase II - Karachi</Text>
            </View>
          </View>

          {/* Bottom Blue Bar */}
          <View style={styles.footerBlueBar}>
            <Text style={styles.footerBarText}>www.energygurus.online</Text>
            <Text style={{ color: '#FFF', fontSize: 7.2 }}>|</Text>
            <Text style={styles.footerBarText}>facebook.com/energygurus.online</Text>
            <Text style={{ color: '#FFF', fontSize: 7.2 }}>|</Text>
            <Text style={styles.footerBarText}>youtube.com/energygurus.online</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
