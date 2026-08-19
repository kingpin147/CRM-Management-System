import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 15,
    paddingBottom: 14,
    paddingHorizontal: 20,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#000',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  topContent: {
    flexShrink: 0,
  },

  flexSpacer: {
    flexGrow: 1,
    minHeight: 2,
  },

  bottomPinnedContainer: {
    marginTop: 'auto',
    marginBottom: 2,
    flexShrink: 0,
  },
  
  // Top Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 195,
    height: 'auto',
  },
  invoiceTitleWrapper: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 27,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  invoiceNumberPill: {
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  invoiceNumberPillLeft: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 9,
    fontWeight: 'bold',
    fontSize: 10,
  },
  invoiceNumberPillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 9,
    fontWeight: 'bold',
    fontSize: 10,
  },
  
  // Grid Layout
  mainGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftCol: {
    width: '48.8%',
  },
  rightCol: {
    width: '48.8%',
  },
  
  // Section Cards
  card: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    marginBottom: 7,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9.8,
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingVertical: 5.5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 3.2,
    alignItems: 'flex-start',
  },
  label: {
    width: '42%',
    color: '#000000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  value: {
    width: '58%',
    color: '#000000',
    fontSize: 9,
  },
  
  // Invoice Summary Specific
  dottedLine: {
    borderBottom: '1px dashed #c2d0e0',
    marginVertical: 4.5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#002868',
    paddingVertical: 5.5,
    paddingHorizontal: 9,
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  totalValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  rebateBox: {
    border: '1px solid #F58220',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 5,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  rebateText: {
    color: '#002868',
    fontSize: 8.4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Right Graphic
  rightGraphic: {
    width: '100%',
    height: 'auto',
    borderRadius: 3,
  },
  
  // Billing History Table Grid
  tableContainer: {
    border: '1px solid #b0c4de',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#edf2f7',
    borderBottom: '1px solid #b0c4de',
  },
  thCell: {
    width: '25%',
    color: '#002868',
    fontWeight: 'bold',
    fontSize: 8.8,
    textAlign: 'center',
    paddingVertical: 3.5,
    borderRight: '1px solid #b0c4de',
  },
  thCellLast: {
    width: '25%',
    color: '#002868',
    fontWeight: 'bold',
    fontSize: 8.8,
    textAlign: 'center',
    paddingVertical: 3.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #cbd5e1',
  },
  tableDataRowLast: {
    flexDirection: 'row',
  },
  tdCell: {
    width: '25%',
    fontSize: 8.6,
    textAlign: 'center',
    paddingVertical: 3.2,
    color: '#000000',
    borderRight: '1px solid #cbd5e1',
  },
  tdCellLast: {
    width: '25%',
    fontSize: 8.6,
    textAlign: 'center',
    paddingVertical: 3.2,
    color: '#000000',
  },
  
  // Important Notes
  notesSection: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 9,
    fontWeight: 'bold',
    fontSize: 9.8,
    letterSpacing: 0.5,
  },
  notesBody: {
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 2.8,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: '#000000',
    lineHeight: 1.1,
  },
  noteText: {
    fontSize: 8.5,
    lineHeight: 1.28,
    color: '#000000',
    flex: 1,
  },
  
  // Footer Addresses
  footerRow: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  footerAddress: {
    width: '48%',
    fontSize: 8.5,
    lineHeight: 1.28,
  },
  footerTitle: {
    color: '#002868',
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 9.0,
  },
  footerText: {
    color: '#333333',
    fontSize: 8.5,
  },
  
  // Bottom Blue Bar
  footerBlueBar: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4.5,
    borderRadius: 3,
    marginTop: 5,
    alignItems: 'center',
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 8.4,
  },
  footerBarDivider: {
    color: '#FFFFFF',
    fontSize: 8.4,
    opacity: 0.8,
  }
})

function getBillingPeriod(baseDate: Date, billingTypeStr?: string): string {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const year = baseDate.getFullYear()
  const monthIdx = baseDate.getMonth()
  
  let numMonths = 1
  const bType = (billingTypeStr || '').toLowerCase()
  if (bType.includes('quarter')) {
    numMonths = 3
  } else if (bType.includes('half') || bType.includes('semi') || bType.includes('bi')) {
    numMonths = 6
  } else if (bType.includes('year') || bType.includes('annual')) {
    numMonths = 12
  }

  const startDateStr = `1-${monthNames[monthIdx]}-${year}`
  
  const endTargetMonthIdx = monthIdx + numMonths - 1
  const endYear = year + Math.floor(endTargetMonthIdx / 12)
  const normalizedEndMonthIdx = ((endTargetMonthIdx % 12) + 12) % 12
  const lastDay = new Date(endYear, normalizedEndMonthIdx + 1, 0).getDate()
  const endDateStr = `${lastDay}-${monthNames[normalizedEndMonthIdx]}-${endYear}`
  
  return `${startDateStr} To ${endDateStr}`
}

export function InvoiceDocument({ 
  customer, 
  invoice, 
  logoSrc, 
  rightGraphicSrc,
}: { 
  customer: any; 
  invoice?: any; 
  logoSrc?: string; 
  rightGraphicSrc?: string;
}) {
  const issueDate = invoice ? new Date(invoice.createdAt) : new Date()
  const invoiceNumber = invoice?.invoiceNumber || (customer?.customerCode ? `INV-${customer.customerCode.replace(/^[A-Za-z]+-/, '')}` : 'INV-520722')
  
  const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  const billingType = customer?.packagePlan?.billingType || 'Monthly'
  const billingMonth = getBillingPeriod(issueDate, billingType)
  
  // Issue Date is ALWAYS 1st of the month, Due Date is ALWAYS 10th of the month
  const issueDateStr = `01 ${monthShorts[issueDate.getMonth()]} ${issueDate.getFullYear()}`
  const dueDateStr = `10 ${monthShorts[issueDate.getMonth()]} ${issueDate.getFullYear()}`
  
  const basePrice = invoice ? Number(invoice.amount) : (customer?.packagePlan ? Number(customer.packagePlan.monthlyBasePrice) : 50000)
  const salesTax = invoice ? Number(invoice.salesTax) : (customer?.packagePlan ? Number(customer.packagePlan.salesTaxAmount) : 0)

  // Calculate Arrears from unpaid previous invoices
  const dbInvoices = (customer?.invoices && customer.invoices.length > 0) ? customer.invoices : []
  let arrears = 0
  if (invoice?.arrears != null) {
    arrears = Number(invoice.arrears)
  } else if (dbInvoices.length > 0) {
    const currentInvId = invoice?.id
    arrears = dbInvoices.reduce((sum: number, inv: any) => {
      if (inv.id !== currentInvId && inv.status !== 'PAID') {
        const total = Number(inv.totalAmount || 0)
        const paid = Number(inv.paidAmount || 0)
        return sum + Math.max(0, total - paid)
      }
      return sum
    }, 0)
  }

  // Exact mathematically perfect total calculation: Base + Tax + Arrears
  const totalAmount = basePrice + salesTax + arrears
  
  const systemType = customer?.packagePlan?.systemSizeKw || customer?.solarSystem?.inverterSize || '1-10 kW'
  const packageTier = customer?.packagePlan?.packageTier || 'Moderate'
  const monitoringTime = customer?.packagePlan?.monitoringTime || '12 Hours'
  const customerIdDigits = customer?.customerCode ? customer.customerCode.replace(/^[A-Za-z]+-/, '') : (customer?.id || '9742')
  
  // Billing history: 6 full rows
  const pastInvoices: any[] = []
  
  if (dbInvoices.length > 0) {
    dbInvoices.slice(0, 6).forEach((inv: any) => pastInvoices.push(inv))
  }
  
  while (pastInvoices.length < 6) {
    const cycleIdx = pastInvoices.length
    const d = new Date(issueDate.getFullYear(), issueDate.getMonth() - cycleIdx, 1)
    const mStr = `${monthShorts[d.getMonth()]}-${d.getFullYear().toString().slice(-2)}`
    const invCode = cycleIdx === 0 ? invoiceNumber : `LHE-${1234 + cycleIdx * 111}`
    pastInvoices.push({
      id: `cycle-${cycleIdx}`,
      invoiceNumber: invCode,
      month: mStr,
      amount: totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      payment: cycleIdx === 0 ? '0.00' : totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      status: cycleIdx === 0 ? 'PENDING' : 'PAID',
      isMock: true,
    })
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Top Header & Main Cards Section */}
        <View style={styles.topContent}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <View style={styles.logo}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#002868' }}>EnergyGurus.Online</Text>
              </View>
            )}
            <View style={styles.invoiceTitleWrapper}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.invoiceNumberPill}>
                <Text style={styles.invoiceNumberPillLeft}>Invoice #</Text>
                <Text style={styles.invoiceNumberPillRight}>{invoiceNumber}</Text>
              </View>
            </View>
          </View>
          
          {/* Main Grid */}
          <View style={styles.mainGrid}>
            
            {/* LEFT COLUMN */}
            <View style={styles.leftCol}>
              {/* Customer Details */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>CUSTOMER DETAILS</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer ID:</Text>
                    <Text style={styles.value}>{customerIdDigits}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer Name:</Text>
                    <Text style={styles.value}>{customer?.fullName || 'Customer'}</Text>
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
                    <Text style={styles.value}>
                      {customer?.address || '—'}
                      {customer?.block ? `, ${customer.block}` : ''}
                      {customer?.city ? `, ${customer.city}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Invoice Summary */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>INVOICE SUMMARY</Text>
                <View style={styles.cardBody}>
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
                  
                  <View style={styles.dottedLine} />
                  
                  <View style={styles.row}>
                    <Text style={styles.label}>Subscription Charges:</Text>
                    <Text style={styles.value}>{basePrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Sales Tax:</Text>
                    <Text style={styles.value}>{salesTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Arrears:</Text>
                    <Text style={styles.value}>{arrears.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                  </View>
                  
                  {/* Total Row with High-Contrast White Text */}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                  </View>
                  
                  {/* Orange Rebate Box */}
                  <View style={styles.rebateBox}>
                    <Text style={styles.rebateText}>
                      Pay Your bill before Due Date {dueDateStr} and enjoy rebate of Rs. 100/-
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Billing History */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>BILLING HISTORY</Text>
                <View style={styles.cardBody}>
                  <View style={styles.tableContainer}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={styles.thCell}>Invoice #</Text>
                      <Text style={styles.thCell}>Month</Text>
                      <Text style={styles.thCell}>Bill Amount</Text>
                      <Text style={styles.thCellLast}>Payment</Text>
                    </View>
                    {pastInvoices.map((inv: any, idx: number) => {
                      const isDbInvoice = inv.createdAt !== undefined && !inv.isMock
                      const d = isDbInvoice ? new Date(inv.createdAt) : null
                      const invNum = inv.invoiceNumber || `INV-${1000 + idx * 111}`
                      const month = isDbInvoice && d ? `${monthShorts[d.getMonth()]} ${d.getFullYear()}` : (inv.month || 'Aug 2026')
                      const amt = isDbInvoice ? Number(inv.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2}) : inv.amount
                      const pay = isDbInvoice ? (inv.status === 'PAID' ? Number(inv.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2}) : (inv.status === 'PENDING' || inv.status === 'UNPAID' ? '0.00' : Number(inv.paidAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2}))) : inv.payment
                      const isLast = idx === pastInvoices.length - 1

                      return (
                        <View style={isLast ? styles.tableDataRowLast : styles.tableDataRow} key={inv.id || idx}>
                          <Text style={styles.tdCell}>{invNum}</Text>
                          <Text style={styles.tdCell}>{month}</Text>
                          <Text style={styles.tdCell}>{amt}</Text>
                          <Text style={styles.tdCellLast}>{pay}</Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
              
            </View>
            
            {/* RIGHT COLUMN */}
            <View style={styles.rightCol}>
              {/* Invoice Details */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>INVOICE DETAILS</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Invoice #:</Text>
                    <Text style={styles.value}>{invoiceNumber}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Billing Month:</Text>
                    <Text style={styles.value}>{billingMonth}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Issue Date:</Text>
                    <Text style={styles.value}>{issueDateStr}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Due Date:</Text>
                    <Text style={styles.value}>{dueDateStr}</Text>
                  </View>
                </View>
              </View>
              
              {/* Solar House Illustration and Payment Options Graphic */}
              {rightGraphicSrc && (
                <Image src={rightGraphicSrc} style={styles.rightGraphic} />
              )}
              
            </View>
            
          </View>
        </View>

        {/* Dynamic Spacer */}
        <View style={styles.flexSpacer} />
        
        {/* Bottom Pinned Section */}
        <View style={styles.bottomPinnedContainer}>
          {/* Important Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesHeader}>IMPORTANT NOTES</Text>
            <View style={styles.notesBody}>
              <View style={styles.noteItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.noteText}>In case of any arrears the connection can be disconnected without any further notice</Text>
              </View>
              <View style={styles.noteItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.noteText}>5% surcharge will be charged on payable after due date</Text>
              </View>
              <View style={styles.noteItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.noteText}>Dishonored Cheque: Rs 300/- will be charged incase customer cheque dishonored</Text>
              </View>
              <View style={styles.noteItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.noteText}>You are requested to pay your bill via our recommended payment options i.e. __________________</Text>
              </View>
            </View>
          </View>
          
          {/* Footer Addresses */}
          <View style={styles.footerRow}>
            <View style={styles.footerAddress}>
              <Text style={styles.footerTitle}>Head Office:</Text>
              <Text style={styles.footerText}>Building No 61, Block A, Bankers Society,</Text>
              <Text style={styles.footerText}>Adjacent State Life Housing Society - Lahore</Text>
            </View>
            <View style={[styles.footerAddress, {borderLeft: '1px solid #c2d0e0', paddingLeft: 12}]}>
              <Text style={styles.footerTitle}>South Office:</Text>
              <Text style={styles.footerText}>80 C, Ground Floor 13th Commercial Street Road,</Text>
              <Text style={styles.footerText}>DHA Phase II Extension CCA - Karachi</Text>
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


