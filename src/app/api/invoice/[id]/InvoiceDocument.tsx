import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import path from 'path'

const styles = StyleSheet.create({
  page: {
    padding: 20,
    paddingBottom: 40, // Space for footer
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000',
  },
  // Top Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logo: {
    width: 220,
    height: 'auto',
  },
  invoiceTitleWrapper: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 5,
  },
  invoiceNumberPill: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  invoiceNumberPillLeft: {
    backgroundColor: '#002868',
    color: '#FFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  invoiceNumberPillRight: {
    backgroundColor: '#F58220',
    color: '#FFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  
  // Grid layout
  mainGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftCol: {
    width: '48%',
  },
  rightCol: {
    width: '48%',
  },
  
  // Section Cards
  card: {
    border: '1px solid #c2d0e0',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    color: '#FFF',
    padding: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
  },
  cardBody: {
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  label: {
    width: '40%',
    color: '#333',
  },
  value: {
    width: '60%',
    color: '#000',
  },
  
  // Invoice Summary specific
  dottedLine: {
    borderBottom: '1px dashed #c2d0e0',
    marginVertical: 5,
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#002868',
    color: '#FFF',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 12,
  },
  rebateBox: {
    border: '1px solid #F58220',
    padding: 5,
    marginTop: 10,
    textAlign: 'center',
    color: '#002868',
    fontSize: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Billing History Table
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #c2d0e0',
    paddingBottom: 4,
    marginBottom: 4,
  },
  th: {
    width: '25%',
    color: '#002868',
    fontWeight: 'bold',
    fontSize: 9,
    textAlign: 'center',
  },
  td: {
    width: '25%',
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 3,
  },
  
  // Notes
  notesSection: {
    marginTop: 5,
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFF',
    padding: 4,
    fontWeight: 'bold',
    fontSize: 10,
  },
  noteItem: {
    flexDirection: 'row',
    marginTop: 3,
    paddingHorizontal: 10,
  },
  bullet: {
    width: 10,
    fontSize: 14,
  },
  noteText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  
  // Footer
  footerRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  footerAddress: {
    width: '48%',
    fontSize: 9,
    lineHeight: 1.3,
  },
  footerBlueBar: {
    backgroundColor: '#002868',
    color: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontSize: 9,
  }
})

export function InvoiceDocument({ customer, invoice, logoSrc }: { customer: any; invoice?: any; logoSrc?: string }) {
  const issueDate = invoice ? new Date(invoice.createdAt) : new Date()
  const dueDate = invoice && invoice.dueDate ? new Date(invoice.dueDate) : new Date(issueDate.getTime() + 10 * 24 * 60 * 60 * 1000)
  const invoiceNumber = invoice ? invoice.invoiceNumber : `INV-${Math.floor(10000 + Math.random() * 90000)}`
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const billingMonth = `${monthNames[issueDate.getMonth()]}-${issueDate.getFullYear()}`
  
  const totalAmount = invoice ? Number(invoice.totalAmount) : (customer.packagePlan ? Number(customer.packagePlan.totalAmount) : 0)
  const basePrice = invoice ? Number(invoice.amount) : (customer.packagePlan ? Number(customer.packagePlan.monthlyBasePrice) : 0)
  const salesTax = invoice ? Number(invoice.salesTax) : 0
  const arrears = 0 // In real system, this would be computed from ledger

  const pastInvoices = (customer.invoices || []).slice(0, 6)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View style={styles.logo} />}
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
                  <Text style={styles.value}>{customer.customerCode || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Customer Name:</Text>
                  <Text style={styles.value}>{customer.fullName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Contact #:</Text>
                  <Text style={styles.value}>{customer.contactNumber}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{customer.email || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>CNIC #:</Text>
                  <Text style={styles.value}>{customer.cnic || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Address:</Text>
                  <Text style={styles.value}>{customer.address}{customer.block ? `, ${customer.block}` : ''}, {customer.city}</Text>
                </View>
              </View>
            </View>
            
            {/* Invoice Summary */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>INVOICE SUMMARY</Text>
              <View style={styles.cardBody}>
                {customer.packagePlan ? (
                  <>
                    <View style={styles.row}>
                      <Text style={styles.label}>System Type:</Text>
                      <Text style={styles.value}>{customer.packagePlan.systemSizeKw} kW</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Package:</Text>
                      <Text style={styles.value}>{customer.packagePlan.packageTier}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Billing Type:</Text>
                      <Text style={styles.value}>{customer.packagePlan.billingType}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.row}>
                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.value}>Manual Charge</Text>
                  </View>
                )}
                
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
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.label}>Total:</Text>
                <Text style={styles.value}>{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
              </View>
              <View style={styles.rebateBox}>
                <Text>Pay Your bill before Due Date {dueDate.toLocaleDateString()} and enjoy rebate of Rs. 100/-</Text>
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
                {pastInvoices.length > 0 ? pastInvoices.map((inv: any) => {
                  const d = new Date(inv.createdAt)
                  return (
                    <View style={{flexDirection: 'row'}} key={inv.id}>
                      <Text style={styles.td}>{inv.invoiceNumber}</Text>
                      <Text style={styles.td}>{`${monthNames[d.getMonth()]}-${d.getFullYear().toString().substr(-2)}`}</Text>
                      <Text style={styles.td}>{Number(inv.totalAmount).toLocaleString()}</Text>
                      <Text style={styles.td}>{inv.status === 'PAID' ? Number(inv.totalAmount).toLocaleString() : '-'}</Text>
                    </View>
                  )
                }) : (
                  <Text style={{textAlign: 'center', fontSize: 9, marginVertical: 5, color: '#666'}}>No history available</Text>
                )}
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
                  <Text style={styles.value}>{issueDate.toLocaleDateString()}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Due Date:</Text>
                  <Text style={styles.value}>{dueDate.toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
            
            {/* Payment Options Placeholder (Just text since we don't have the icons/images) */}
            <View style={[styles.card, {marginTop: 20, borderColor: '#fff'}]}>
               <Text style={{color: '#002868', fontWeight: 'bold', fontSize: 11, marginBottom: 10}}>PAYMENT OPTIONS</Text>
               <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                 <View style={{alignItems: 'center', width: '25%'}}>
                   <Text style={{fontSize: 8, textAlign: 'center'}}>Bank Transfer</Text>
                 </View>
                 <View style={{alignItems: 'center', width: '25%'}}>
                   <Text style={{fontSize: 8, textAlign: 'center'}}>Credit / Debit Card</Text>
                 </View>
                 <View style={{alignItems: 'center', width: '25%'}}>
                   <Text style={{fontSize: 8, textAlign: 'center'}}>EasyPaisa / JazzCash</Text>
                 </View>
                 <View style={{alignItems: 'center', width: '25%'}}>
                   <Text style={{fontSize: 8, textAlign: 'center'}}>Cheque / Pay Order</Text>
                 </View>
               </View>
            </View>
            
          </View>
          
        </View>
        
        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesHeader}>IMPORTANT NOTES</Text>
          <View style={{border: '1px solid #c2d0e0', borderTop: 'none', paddingBottom: 10}}>
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
        
        {/* Footer Address */}
        <View style={styles.footerRow}>
          <View style={styles.footerAddress}>
            <Text style={{color: '#002868', fontWeight: 'bold', marginBottom: 2}}>Head Office:</Text>
            <Text>Building No 61, Block A, Bankers Society,</Text>
            <Text>Adjacent State Life Housing Society - Lahore</Text>
          </View>
          <View style={[styles.footerAddress, {borderLeft: '1px solid #c2d0e0', paddingLeft: 10}]}>
            <Text style={{color: '#002868', fontWeight: 'bold', marginBottom: 2}}>South Office:</Text>
            <Text>80 C, Ground Floor 13th Commercial Street Road,</Text>
            <Text>DHA Phase II Extension CCA - Karachi</Text>
          </View>
        </View>
        
        {/* Blue Footer Bar */}
        <View style={styles.footerBlueBar}>
          <Text>www.energygurus.online</Text>
          <Text>|</Text>
          <Text>facebook.com/energygurus.online</Text>
          <Text>|</Text>
          <Text>youtube.com/energygurus.online</Text>
        </View>

      </Page>
    </Document>
  )
}
