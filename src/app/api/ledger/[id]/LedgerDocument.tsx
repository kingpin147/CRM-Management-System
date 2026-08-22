import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

import { formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 20,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 180,
    height: 'auto',
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  statementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002868',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  datePill: {
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  datePillLeft: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.5,
  },
  datePillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.5,
  },

  // 2-Column Customer Details Card as requested
  detailsCard: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3.5,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  cardGrid: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  gridColLeft: {
    width: '50%',
    paddingRight: 6,
    borderRight: '1px solid #e2e8f0',
  },
  gridColRight: {
    width: '50%',
    paddingLeft: 6,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 2,
    alignItems: 'flex-start',
  },
  label: {
    width: '40%',
    color: '#000000',
    fontSize: 8.5,
    fontWeight: 'bold', // Headings bold as requested
  },
  value: {
    width: '60%',
    color: '#000000',
    fontSize: 8.5,
  },

  // Ledger Table
  tableCard: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    flexGrow: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#002868',
    borderBottom: '1px solid #001d4a',
    paddingVertical: 4,
  },
  th: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e2e8f0',
    paddingVertical: 3.5,
    alignItems: 'center',
  },
  td: {
    fontSize: 8,
    paddingHorizontal: 4,
    color: '#1e293b',
  },

  // Column Widths (Reduced Ref column, Increased Narration column as requested)
  colDate: { width: '13%' },
  colRef: { width: '22%' },     // Reduced Ref column
  colNarration: { width: '35%' }, // Increased Narration column
  colDebit: { width: '10%', textAlign: 'right' },
  colCredit: { width: '10%', textAlign: 'right' },
  colBalance: { width: '10%', textAlign: 'right' },

  // Summary Row
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTop: '1.5px solid #002868',
    paddingVertical: 4,
    fontWeight: 'bold',
  },

  // Footer
  bottomPinnedContainer: {
    marginTop: 'auto',
    marginBottom: 2,
    flexShrink: 0,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  footerAddress: {
    width: '48%',
    fontSize: 8,
    lineHeight: 1.25,
  },
  footerTitle: {
    color: '#002868',
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 8.5,
  },
  footerAddressText: {
    color: '#333333',
    fontSize: 8,
  },
  footerBlueBar: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    borderRadius: 3,
    marginTop: 5,
    alignItems: 'center',
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 8,
  },
  footerBarDivider: {
    color: '#FFFFFF',
    fontSize: 8,
    opacity: 0.8,
  },
  boldDisclaimer: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#002868',
    textAlign: 'center',
    marginBottom: 3,
  }
})

interface LedgerDocumentProps {
  customer: any
  ledgerEntries: any[]
  logoSrc?: string
}

export function LedgerDocument({ customer, ledgerEntries, logoSrc }: LedgerDocumentProps) {
  const customerIdDigits = customer?.customerCode ? customer.customerCode.replace(/^[A-Za-z]+-/, '') : (customer?.id || '9742')
  const systemType = customer?.packagePlan?.systemSizeKw || customer?.solarSystem?.inverterSize || '1-10 kW'
  const packageTier = customer?.packagePlan?.packageTier || 'Moderate'
  const monitoringTime = customer?.packagePlan?.monitoringTime || '12 Hours'
  const billingType = customer?.packagePlan?.billingType || 'Quarterly'

  const todayStr = formatDate(new Date())

  let totalDebit = 0
  let totalCredit = 0
  ledgerEntries.forEach(le => {
    totalDebit += Number(le.debit) || 0
    totalCredit += Number(le.credit) || 0
  })
  const closingBalance = ledgerEntries.length > 0 ? Number(ledgerEntries[ledgerEntries.length - 1].balance) || 0 : 0

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
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
            <Text style={styles.statementTitle}>CUSTOMER LEDGER</Text>
            <View style={styles.datePill}>
              <Text style={styles.datePillLeft}>Statement Date</Text>
              <Text style={styles.datePillRight}>{todayStr}</Text>
            </View>
          </View>
        </View>

        {/* 2-Column CUSTOMER DETAILS Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>CUSTOMER DETAILS</Text>
          <View style={styles.cardGrid}>
            {/* Left Column */}
            <View style={styles.gridColLeft}>
              <View style={styles.row}>
                <Text style={styles.label}>Customer ID:</Text>
                <Text style={{ ...styles.value, fontWeight: 'bold' }}>{customerIdDigits}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Customer Name:</Text>
                <Text style={styles.value}>{customer?.fullName || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Contact #:</Text>
                <Text style={styles.value}>{customer?.contactNumber || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{customer?.email || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>CNIC #:</Text>
                <Text style={styles.value}>{customer?.cnic || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{customer?.address || '—'}</Text>
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.gridColRight}>
              <View style={styles.row}>
                <Text style={styles.label}>System Type:</Text>
                <Text style={styles.value}>{systemType}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Package:</Text>
                <Text style={styles.value}>{packageTier}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Monitoring Time:</Text>
                <Text style={styles.value}>{monitoringTime}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Billing Type:</Text>
                <Text style={styles.value}>{billingType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* LEDGER TABLE */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colDate]}>Date</Text>
            <Text style={[styles.th, styles.colRef]}>Ref # (Receipt / Invoice)</Text>
            <Text style={[styles.th, styles.colNarration]}>Description</Text>
            <Text style={[styles.th, styles.colDebit]}>Debit</Text>
            <Text style={[styles.th, styles.colCredit]}>Credit</Text>
            <Text style={[styles.th, styles.colBalance]}>Balance</Text>
          </View>

          {ledgerEntries.map((le, idx) => {
            const rawRef = (le.refNumber || '').trim()
            const rawNarr = (le.narration || '').trim()
            const code = rawRef.replace(/^(TX-|DB-ADJ-|CR-ADJ-|Debit Note-|Credit Note-)/i, '').trim()

            const isDebitNote = rawNarr.toLowerCase().includes('debit note') || rawRef.startsWith('DB-ADJ-') || (rawRef.startsWith('TX-') && Number(le.debit) > 0 && !rawNarr.toLowerCase().includes('invoice') && !rawNarr.toLowerCase().includes('subscription'))
            const isCreditNote = rawNarr.toLowerCase().includes('credit note') || rawRef.startsWith('CR-ADJ-') || (rawRef.startsWith('TX-') && Number(le.credit) > 0 && !rawNarr.toLowerCase().includes('payment'))

            let refDisplay = rawRef
            let formattedNarr = rawNarr

            if (isDebitNote) {
              refDisplay = rawRef.startsWith('Debit Note-') ? rawRef : `Debit Note-${code}`
              let reason = rawNarr
                .replace(/^Debit Note:\s*/i, '')
                .replace(/^Package Change Debit Note\s*/i, '')
                .replace(/^Debit Note charged against\s*/i, '')
                .trim()
              if (reason.includes('(') && reason.includes('->')) {
                reason = 'Package Upgrade'
              }
              formattedNarr = `Debit Note charged against ${reason || 'Manual Adjustment'}`
            } else if (isCreditNote) {
              refDisplay = rawRef.startsWith('Credit Note-') ? rawRef : `Credit Note-${code}`
              let reason = rawNarr
                .replace(/^Credit Note:\s*/i, '')
                .replace(/^Package Change Credit Note\s*/i, '')
                .replace(/^Credit Note Adjustment against\s*/i, '')
                .trim()
              if (reason.includes('(') && reason.includes('->')) {
                reason = 'Package Downgrade'
              }
              formattedNarr = `Credit Note Adjustment against ${reason || 'Manual Adjustment'}`
            } else if (Number(le.credit) > 0 && !rawRef.startsWith('PRV-') && !rawRef.startsWith('RCP-') && !rawRef.startsWith('PAY-')) {
              refDisplay = `PRV-${rawRef.replace(/^(INV|TX)-/, '')}`
            }

            const dStr = le.createdAt ? formatDate(le.createdAt) : '—'

            return (
              <View key={le.id || idx} style={styles.tableRow}>
                <Text style={[styles.td, styles.colDate]}>{dStr}</Text>
                <Text style={[styles.td, styles.colRef, { fontWeight: 'bold' }]}>{refDisplay}</Text>
                <Text style={[styles.td, styles.colNarration]}>{formattedNarr || '—'}</Text>
                <Text style={[styles.td, styles.colDebit, { color: '#b91c1c' }]}>
                  {Number(le.debit) > 0 ? Number(le.debit).toLocaleString() : '0'}
                </Text>
                <Text style={[styles.td, styles.colCredit, { color: '#047857', fontWeight: 'bold' }]}>
                  {Number(le.credit) > 0 ? Number(le.credit).toLocaleString() : '0'}
                </Text>
                <Text style={[styles.td, styles.colBalance, { fontWeight: 'bold' }]}>
                  PKR {Number(le.balance).toLocaleString()}
                </Text>
              </View>
            )
          })}

          {/* Summary Row */}
          <View style={styles.summaryRow}>
            <Text style={[styles.td, styles.colDate, { fontWeight: 'bold' }]}>TOTAL</Text>
            <Text style={[styles.td, styles.colRef]}></Text>
            <Text style={[styles.td, styles.colNarration, { fontWeight: 'bold' }]}>Account Statement Summary</Text>
            <Text style={[styles.td, styles.colDebit, { fontWeight: 'bold', color: '#b91c1c' }]}>
              {totalDebit.toLocaleString()}
            </Text>
            <Text style={[styles.td, styles.colCredit, { fontWeight: 'bold', color: '#047857' }]}>
              {totalCredit.toLocaleString()}
            </Text>
            <Text style={[styles.td, styles.colBalance, { fontWeight: 'bold', color: '#002868' }]}>
              PKR {closingBalance.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.bottomPinnedContainer}>
          {/* Footer Addresses */}
          <View style={styles.footerRow}>
            <View style={styles.footerAddress}>
              <Text style={styles.footerTitle}>Head Office:</Text>
              <Text style={styles.footerAddressText}>Building No 61, Block A, Bankers Society,</Text>
              <Text style={styles.footerAddressText}>Adjacent State Life Housing Society - Lahore</Text>
            </View>
            <View style={[styles.footerAddress, { borderLeft: '1px solid #c2d0e0', paddingLeft: 12 }]}>
              <Text style={styles.footerTitle}>South Office:</Text>
              <Text style={styles.footerAddressText}>80 C, Ground Floor 13th Commercial Street Road,</Text>
              <Text style={styles.footerAddressText}>DHA Phase II Extension CCA - Karachi</Text>
            </View>
          </View>

          {/* Bottom Blue Bar */}
          <View style={styles.footerBlueBar}>
            <Text style={styles.footerBarText}>www.energygurus.online</Text>
            <Text style={styles.footerBarDivider}>|</Text>
            <Text style={styles.footerBarText}>facebook.com/energygurus.online</Text>
            <Text style={styles.footerBarDivider}>|</Text>
            <Text style={styles.footerBarText}>youtube.com/energygurus.online</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
