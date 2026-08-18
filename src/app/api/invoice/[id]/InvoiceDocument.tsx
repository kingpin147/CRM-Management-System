import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 18,
    paddingBottom: 26,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
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
    minHeight: 8,
  },

  bottomPinnedContainer: {
    marginTop: 'auto',
    marginBottom: 4,
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
    width: 200,
    height: 'auto',
  },
  invoiceTitleWrapper: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 4,
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
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 9.5,
  },
  invoiceNumberPillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 9.5,
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
    paddingVertical: 3,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 2,
    alignItems: 'flex-start',
  },
  label: {
    width: '42%',
    color: '#000000',
    fontSize: 8.5,
  },
  value: {
    width: '58%',
    color: '#000000',
    fontSize: 8.5,
  },
  
  // Invoice Summary Specific
  dottedLine: {
    borderBottom: '1px dashed #c2d0e0',
    marginVertical: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#002868',
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 2,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10.5,
  },
  totalValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10.5,
  },
  rebateBox: {
    border: '1px solid #F58220',
    backgroundColor: '#FFFFFF',
    paddingVertical: 3.5,
    paddingHorizontal: 4,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  rebateText: {
    color: '#002868',
    fontSize: 7.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Right Graphic
  rightGraphic: {
    width: '100%',
    height: 'auto',
    borderRadius: 3,
  },
  
  // Billing History Table
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #c2d0e0',
    paddingBottom: 2.5,
    marginBottom: 2,
  },
  th: {
    width: '25%',
    color: '#002868',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
  },
  td: {
    width: '25%',
    fontSize: 7.8,
    textAlign: 'center',
    paddingVertical: 1.5,
    color: '#000000',
  },
  
  // Important Notes
  notesSection: {
    marginTop: 0,
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  notesBody: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 1.5,
  },
  bullet: {
    width: 8,
    fontSize: 10,
    color: '#000000',
    lineHeight: 1,
  },
  noteText: {
    fontSize: 7.8,
    lineHeight: 1.25,
    color: '#000000',
    flex: 1,
  },
  
  // Footer Addresses
  footerRow: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  footerAddress: {
    width: '48%',
    fontSize: 7.8,
    lineHeight: 1.25,
  },
  footerTitle: {
    color: '#002868',
    fontWeight: 'bold',
    marginBottom: 1.5,
    fontSize: 8.2,
  },
  footerText: {
    color: '#333333',
    fontSize: 7.8,
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
  footerBarDivider: {
    color: '#FFFFFF',
    fontSize: 7.5,
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
  
  const billingType = customer?.packagePlan?.billingType || 'Quarterly'
  const billingMonth = getBillingPeriod(issueDate, billingType)
  
  // Issue Date is ALWAYS 1st of the month, Due Date is ALWAYS 10th of the month
  const issueDateStr = `1-${monthShorts[issueDate.getMonth()]}-${issueDate.getFullYear()}`
  const dueDateStr = `10-${monthShorts[issueDate.getMonth()]}-${issueDate.getFullYear()}`
  
  const totalAmount = invoice ? Number(invoice.totalAmount) : (customer?.packagePlan ? Number(customer.packagePlan.totalAmount) : 50000)
  const basePrice = invoice ? Number(invoice.amount) : (customer?.packagePlan ? Number(customer.packagePlan.monthlyBasePrice) : 50000)
  const salesTax = invoice ? Number(invoice.salesTax) : (customer?.packagePlan ? Number(customer.packagePlan.salesTaxAmount) : 0)
  const arrears = 0.00
  
  const systemType = customer?.packagePlan?.systemSizeKw || customer?.solarSystem?.inverterSize || '1-10 kW'
  const packageTier = customer?.packagePlan?.packageTier || 'Moderate'
  const monitoringTime = customer?.packagePlan?.monitoringTime || '12 Hours'
  const customerIdDigits = customer?.customerCode ? customer.customerCode.replace(/^[A-Za-z]+-/, '') : (customer?.id || '9742')
  
  // Billing history for up to 6 invoices
  const dbInvoices = (customer?.invoices && customer.invoices.length > 0) ? customer.invoices : []
  const pastInvoices = dbInvoices.length > 0 ? dbInvoices.slice(0, 6) : [
    { 
      id: '1', 
      invoiceNumber: invoiceNumber, 
      createdAt: issueDate, 
      totalAmount: totalAmount, 
      status: invoice?.status || 'PAID' 
    }
  ]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
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
                    <Text style={styles.value}>{customer?.fullName || 'Aafaq Ali Ichsan'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Contact #:</Text>
                    <Text style={styles.value}>{customer?.contactNumber || '03064006882'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{customer?.email || 'aafaaq.a.ichsan@gmail.com'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>CNIC #:</Text>
                    <Text style={styles.value}>{customer?.cnic || '35201-2701829-0'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>
                      {customer?.address || '401 G Phase - 1 State Life Housing Society Lahore'}
                      {customer?.block ? `, ${customer.block}` : ''}
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
                  <View style={styles.tableHeader}>
                    <Text style={styles.th}>Invoice #</Text>
                    <Text style={styles.th}>Month</Text>
                    <Text style={styles.th}>Bill Amount</Text>
                    <Text style={styles.th}>Payment</Text>
                  </View>
                  {pastInvoices.map((inv: any, idx: number) => {
                    const isDbInvoice = inv.createdAt !== undefined
                    const d = isDbInvoice ? new Date(inv.createdAt) : null
                    const invNum = inv.invoiceNumber || `INV-${1000 + idx * 111}`
                    const month = isDbInvoice && d ? `${monthShorts[d.getMonth()]}-${d.getFullYear().toString().substr(-2)}` : (inv.month || 'Aug-26')
                    const amt = isDbInvoice ? Number(inv.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2}) : inv.amount
                    const pay = isDbInvoice ? (inv.status === 'PAID' ? Number(inv.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2}) : (inv.status === 'PENDING' ? '0.00' : Number(inv.paidAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2}))) : inv.payment

                    return (
                      <View style={{flexDirection: 'row'}} key={inv.id || idx}>
                        <Text style={styles.td}>{invNum}</Text>
                        <Text style={styles.td}>{month}</Text>
                        <Text style={styles.td}>{amt}</Text>
                        <Text style={styles.td}>{pay}</Text>
                      </View>
                    )
                  })}
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
                    <Text style={[styles.label, { width: '36%' }]}>Billing Month:</Text>
                    <Text style={[styles.value, { width: '64%', fontSize: 7.6, fontWeight: 'bold' }]}>{billingMonth}</Text>
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

        {/* Dynamic Spacer: Fills remaining empty vertical space so bottom section is pinned to page bottom */}
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
              <View style={styles.noteItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.noteText}>This is computer generated invoice no need for signature and stamp</Text>
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
        </View>
        
        {/* Bottom Blue Bar */}
        <View style={styles.footerBlueBar}>
          <Text style={styles.footerBarText}>www.energygurus.online</Text>
          <Text style={styles.footerBarDivider}>|</Text>
          <Text style={styles.footerBarText}>facebook.com/energygurus.online</Text>
          <Text style={styles.footerBarDivider}>|</Text>
          <Text style={styles.footerBarText}>youtube.com/energygurus.online</Text>
        </View>

      </Page>
    </Document>
  )
}
