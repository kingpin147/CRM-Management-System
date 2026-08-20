import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#000000',
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
    fontSize: 15,
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
    fontSize: 8,
  },
  voucherNumberPillDebit: {
    backgroundColor: '#B91C1C',
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },
  voucherNumberPillCredit: {
    backgroundColor: '#047857',
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },

  // Highlight Box for Amount
  noteAmountBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  noteAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  amountValueDebit: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#B91C1C',
  },
  amountValueCredit: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#047857',
  },
  statusBadgeDebit: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#B91C1C',
  },
  statusBadgeCredit: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#047857',
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
    color: '#334155',
    fontSize: 7.8,
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    color: '#0F172A',
    fontSize: 7.8,
  },

  // Description Card
  descCard: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  descBody: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#FAFAFA',
  },
  descText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#002868',
    lineHeight: 1.25,
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
    fontSize: 7.5,
    lineHeight: 1.2,
  },
  footerTitle: {
    color: '#002868',
    fontWeight: 'bold',
    marginBottom: 1.5,
    fontSize: 8,
  },
  footerAddressText: {
    color: '#333333',
    fontSize: 7.5,
  },
  footerBlueBar: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 3.5,
    borderRadius: 3,
    marginTop: 4,
    alignItems: 'center',
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 7.5,
  },
  footerBarDivider: {
    color: '#FFFFFF',
    fontSize: 7.5,
    opacity: 0.8,
  },
  boldDisclaimer: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#002868',
    textAlign: 'center',
    marginBottom: 2,
  }
})

function formatDateStr(dateVal?: Date | string | null): string {
  if (!dateVal) return '—'
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

interface NoteDocumentProps {
  customer: any
  note: any
  logoSrc?: string
}

export function NoteDocument({ customer, note, logoSrc }: NoteDocumentProps) {
  const isDebit = Number(note?.debit || 0) > 0 || note?.narration?.toLowerCase().includes('debit note') || note?.refNumber?.includes('Debit Note')
  const amount = Number(isDebit ? note?.debit : note?.credit) || Number(note?.amount || 0)

  const customerIdDigits = customer?.customerCode 
    ? customer.customerCode.replace(/^[A-Za-z]+-/, '') 
    : (customer?.id || '—')

  const code = (note?.refNumber || note?.id || '62DC6B1B').replace(/^(TX-|DB-ADJ-|CR-ADJ-|Debit Note-|Credit Note-)/i, '').trim()
  const refNumber = isDebit ? `Debit Note-${code}` : `Credit Note-${code}`

  let narration = note?.narration || ''
  if (!narration || narration === '—') {
    narration = isDebit 
      ? 'Debit Note charged against Package Adjustment / Audit Charges' 
      : 'Credit Note Adjustment against Package Adjustment'
  }

  const systemType = customer?.packagePlan?.systemSizeKw || customer?.solarSystem?.inverterSize || '1-10 kW'
  const packageTier = customer?.packagePlan?.packageTier || 'Moderate'
  const dateStr = formatDateStr(note?.createdAt || note?.date || new Date())

  return (
    <Document>
      <Page size={[612, 396]} style={styles.page}>
        <View style={styles.topSection}>
          {/* Header */}
          <View style={styles.topHeader}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <View style={styles.logo}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#002868' }}>EnergyGurus.Online</Text>
              </View>
            )}
            <View style={styles.titleWrapper}>
              <Text style={styles.voucherTitle}>{isDebit ? 'DEBIT NOTE VOUCHER' : 'CREDIT NOTE VOUCHER'}</Text>
              <View style={styles.voucherNumberPill}>
                <Text style={styles.voucherNumberPillLeft}>{isDebit ? 'Debit Note #' : 'Credit Note #'}</Text>
                <Text style={isDebit ? styles.voucherNumberPillDebit : styles.voucherNumberPillCredit}>{refNumber}</Text>
              </View>
            </View>
          </View>

          {/* Amount Box */}
          <View style={styles.noteAmountBox}>
            <View style={styles.noteAmountRow}>
              <View>
                <Text style={styles.amountLabel}>{isDebit ? 'DEBIT CHARGE AMOUNT:' : 'CREDIT ADJUSTMENT AMOUNT:'}</Text>
                <Text style={isDebit ? styles.statusBadgeDebit : styles.statusBadgeCredit}>
                  {isDebit ? '✓ DEBIT NOTE RECORDED IN CUSTOMER LEDGER' : '✓ CREDIT NOTE ADJUSTMENT APPLIED TO LEDGER'}
                </Text>
              </View>
              <Text style={isDebit ? styles.amountValueDebit : styles.amountValueCredit}>
                PKR {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* 2 Column Info Grid */}
          <View style={styles.grid}>
            {/* Customer Details */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>CUSTOMER INFORMATION</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer ID:</Text>
                    <Text style={[styles.value, { fontWeight: 'bold' }]}>{customerIdDigits}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer Name:</Text>
                    <Text style={[styles.value, { fontWeight: 'bold' }]}>{customer?.fullName || 'Customer'}</Text>
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
                    <Text style={styles.label}>City:</Text>
                    <Text style={styles.value}>{customer?.city || 'Pakistan'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Note & Account Details */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>VOUCHER & ACCOUNT DETAILS</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Voucher Date:</Text>
                    <Text style={styles.value}>{dateStr}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Ref Number:</Text>
                    <Text style={[styles.value, { fontWeight: 'bold' }]}>{refNumber}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>System Size:</Text>
                    <Text style={styles.value}>{systemType}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Package Tier:</Text>
                    <Text style={styles.value}>{packageTier}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Ledger Status:</Text>
                    <Text style={[styles.value, { fontWeight: 'bold', color: isDebit ? '#B91C1C' : '#047857' }]}>
                      POSTED TO LEDGER
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Description Block */}
          <View style={styles.descCard}>
            <Text style={styles.cardHeader}>VOUCHER DESCRIPTION / NARRATION</Text>
            <View style={styles.descBody}>
              <Text style={styles.descText}>{narration}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.bottomPinnedContainer}>
          <Text style={styles.boldDisclaimer}>
            This is a computer-generated {isDebit ? 'Debit Note' : 'Credit Note'} Voucher confirming financial ledger adjustment. No signature required.
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.footerAddress}>
              <Text style={styles.footerTitle}>Head Office:</Text>
              <Text style={styles.footerAddressText}>Building No 61, Block A, Bankers Society, State Life - Lahore</Text>
            </View>
            <View style={[styles.footerAddress, { borderLeft: '1px solid #c2d0e0', paddingLeft: 6 }]}>
              <Text style={styles.footerTitle}>South Office:</Text>
              <Text style={styles.footerAddressText}>80 C, Ground Floor 13th Commercial Street Road, DHA Phase II - Karachi</Text>
            </View>
          </View>

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
