import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 18,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#000000',
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
    marginBottom: 6,
  },
  logo: {
    width: 170,
    height: 'auto',
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  crfPill: {
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  crfPillLeft: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    fontWeight: 'bold',
    fontSize: 8.5,
  },
  crfPillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    fontWeight: 'bold',
    fontSize: 8.5,
  },

  // Section Cards
  card: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 7,
    fontWeight: 'bold',
    fontSize: 9,
    letterSpacing: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },
  cardBody: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  // Grid Tables
  gridRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  gridRowLast: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  gridColLeft: {
    width: '48.8%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridColRight: {
    width: '48.8%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: '2.4%',
  },

  label: {
    width: '42%',
    color: '#002868',
    fontSize: 7.8,
    fontWeight: 'bold',
  },
  value: {
    width: '58%',
    color: '#1F2937',
    fontSize: 7.8,
  },
  badgePill: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 2,
    fontSize: 7.2,
    fontWeight: 'bold',
  },
  badgeGreen: {
    backgroundColor: '#059669',
    color: '#FFFFFF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 2,
    fontSize: 7.2,
    fontWeight: 'bold',
  },
  badgeAmber: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 2,
    fontSize: 7.2,
    fontWeight: 'bold',
  },

  // Two Column Container for Solar specs
  twoColContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colBox: {
    width: '49.2%',
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  colHeader: {
    backgroundColor: '#F3F4F6',
    color: '#002868',
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 8,
    borderBottom: '1px solid #c2d0e0',
  },

  // Notes & Signatures
  notesSection: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 7.8,
  },
  notesBody: {
    padding: 3.5,
    fontSize: 6.8,
    color: '#333333',
    lineHeight: 1.2,
  },

  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 3,
    paddingHorizontal: 10,
  },
  signBox: {
    width: '35%',
    borderTop: '1px dashed #9CA3AF',
    paddingTop: 2,
    alignItems: 'center',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  footerAddress: {
    width: '49%',
  },
  footerTitle: {
    fontWeight: 'bold',
    color: '#002868',
    fontSize: 7.2,
    marginBottom: 1,
  },
  footerText: {
    fontSize: 6.5,
    color: '#4B5563',
  },
  footerBlueBar: {
    backgroundColor: '#002868',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2.5,
    marginTop: 3,
    borderRadius: 2,
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  footerBarDivider: {
    color: '#FFFFFF',
    fontSize: 7,
  },
})

function formatDateStr(d: any) {
  if (!d) return '—'
  const dateObj = new Date(d)
  if (isNaN(dateObj.getTime())) return '—'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(dateObj.getDate()).padStart(2, '0')} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`
}

export function SignupDocument({ customer, logoSrc }: { customer: any; logoSrc?: string }) {
  const solar = customer?.solarSystem || {}
  const plan = customer?.packagePlan || {}

  const crfCode = customer?.crfNumber || (customer?.customerCode ? `CRF-${customer.customerCode.replace(/\D/g, '')}` : 'CRF-964256')
  const custCode = customer?.customerCode?.replace(/\D/g, '') || customer?.customerCode || customer?.id || '9484'
  const accountExecName = typeof customer?.accountExecutive === 'object' && customer?.accountExecutive
    ? (customer.accountExecutive.fullName || customer.accountExecutive.name || 'EnergyGurus Finance')
    : (typeof customer?.accountExecutive === 'string' ? customer.accountExecutive : 'EnergyGurus Finance')
    
  const totalAmountVal = Number(plan?.totalAmount || 0)
  const earthingAcStr = solar?.earthingAcOhms != null ? String(solar.earthingAcOhms) : '0.5'
  const earthingDcStr = solar?.earthingDcOhms != null ? String(solar.earthingDcOhms) : '0.5'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topContent}>

          {/* 1. Header */}
          <View style={styles.topHeader}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <View style={styles.logo}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#002868' }}>EnergyGurus.Online</Text>
              </View>
            )}
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>CUSTOMER REGISTRATION</Text>
              <View style={styles.crfPill}>
                <Text style={styles.crfPillLeft}>CRF Number</Text>
                <Text style={styles.crfPillRight}>{crfCode}</Text>
              </View>
            </View>
          </View>

          {/* 2. Customer Profile Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Customer Profile</Text>
              <Text style={{ fontSize: 7.8, color: '#E5E7EB' }}>ID: {custCode}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Customer ID:</Text>
                  <Text style={[styles.value, { fontWeight: 'bold' }]}>{custCode}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Installation Address:</Text>
                  <Text style={styles.value}>{customer?.address || '—'}, {customer?.city || 'Pakistan'}</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Customer Name:</Text>
                  <Text style={[styles.value, { fontWeight: 'bold' }]}>{customer?.fullName}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Customer Type:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{customer?.customerType || 'Residential'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Contact #:</Text>
                  <Text style={styles.value}>{customer?.contactNumber}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Customer Status:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={customer?.status === 'CONNECTION_ACTIVE' ? styles.badgeGreen : styles.badgeAmber}>
                      {customer?.status?.replace(/_/g, ' ') || 'Active'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{customer?.email || '—'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>CRF Number:</Text>
                  <Text style={[styles.value, { fontWeight: 'bold' }]}>{crfCode}</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>CNIC #:</Text>
                  <Text style={styles.value}>{customer?.cnic || '—'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Account Exec:</Text>
                  <Text style={[styles.value, { fontWeight: 'bold' }]}>{accountExecName}</Text>
                </View>
              </View>

              <View style={styles.gridRowLast}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Activation / Signup:</Text>
                  <Text style={styles.value}>{formatDateStr(customer?.activationDate || customer?.signupDate || customer?.createdAt)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Total Amount:</Text>
                  <Text style={[styles.value, { fontWeight: 'bold', color: '#002868' }]}>PKR {totalAmountVal.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3. Package Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Package Details</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>System Type:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{plan?.systemSizeKw || '10-20 kW'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Billing Type:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{plan?.billingType || 'Yearly'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Package:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{plan?.packageTier || 'Comprehensive'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Next Billing Date:</Text>
                  <Text style={styles.value}>{formatDateStr(plan?.nextBillingDate)}</Text>
                </View>
              </View>

              <View style={styles.gridRowLast}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Monitoring Time:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{plan?.monitoringTime || '12 Hours'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Subscription Price:</Text>
                  <Text style={[styles.value, { fontWeight: 'bold' }]}>
                    PKR {totalAmountVal.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 4. Solar System Technical Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Solar System Technical Specifications</Text>
            </View>
            <View style={{ padding: 3 }}>
              <View style={styles.twoColContainer}>
                
                {/* Left Sub Column: Grid & Inverter */}
                <View style={styles.colBox}>
                  <Text style={styles.colHeader}>GRID CONNECTION & INVERTER SYSTEM</Text>
                  <View style={{ paddingHorizontal: 4, paddingVertical: 2 }}>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Meter Type:</Text>
                      <Text style={styles.value}>{solar?.meterType || 'Green Meter'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Zero Export Device:</Text>
                      <Text style={styles.value}>{solar?.zeroExportDevice ? 'Installed' : 'Not Installed'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>DISCO:</Text>
                      <Text style={styles.value}>{solar?.disco || 'LESCO'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Consumer ID:</Text>
                      <Text style={styles.value}>{solar?.discoRefNo || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Brand:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>{solar?.inverterBrand || 'GoodWe'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Type:</Text>
                      <Text style={styles.value}>{solar?.inverterType || 'Hybrid'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Phase:</Text>
                      <Text style={styles.value}>{solar?.inverterPhase || 'Single Phase'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Category:</Text>
                      <Text style={styles.value}>{solar?.inverterCategory || 'High Voltage'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Size:</Text>
                      <Text style={styles.value}>{solar?.inverterSize || '6kW'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>No. of Inverters:</Text>
                      <Text style={styles.value}>{solar?.noOfInverters || 1}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Serial #:</Text>
                      <Text style={styles.value}>{solar?.inverterSerial || '1234457945'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Warranty:</Text>
                      <Text style={styles.value}>{formatDateStr(solar?.inverterWarrantyEnd)}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Earthing & OHMs:</Text>
                      <Text style={styles.value}>AC: {earthingAcStr} Ω | DC: {earthingDcStr} Ω</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Ingress Protection:</Text>
                      <Text style={styles.value}>{solar?.ingressProtection || 'IP21 / IP65'}</Text>
                    </View>
                    <View style={styles.gridRowLast}>
                      <Text style={styles.label}>Structure:</Text>
                      <Text style={styles.value}>{solar?.structureType || 'Standard'} ({solar?.structureMaterial || 'Painted'})</Text>
                    </View>
                  </View>
                </View>

                {/* Right Sub Column: Panels & Battery */}
                <View style={styles.colBox}>
                  <Text style={styles.colHeader}>PV PANELS & BATTERY ENERGY STORAGE</Text>
                  <View style={{ paddingHorizontal: 4, paddingVertical: 2 }}>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Tech:</Text>
                      <Text style={styles.value}>{solar?.panelTechnology || 'TOPCON'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Brand:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>{solar?.panelBrand || 'LONGI'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Wattage:</Text>
                      <Text style={styles.value}>{solar?.panelWattage || 585} W</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>No of Panels:</Text>
                      <Text style={styles.value}>{solar?.noOfPanels || 10}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Total Wattage:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>
                        {solar?.totalWattage || 5850} W ({((solar?.totalWattage || 5850)/1000).toFixed(2)} kW)
                      </Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Warranty:</Text>
                      <Text style={styles.value}>{formatDateStr(solar?.panelWarrantyEnd)}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Battery Category:</Text>
                      <Text style={styles.value}>{solar?.batteryCategory || 'Low Voltage'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Battery Brand:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>{solar?.batteryBrand || 'Pylontech'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>No. of Batteries:</Text>
                      <Text style={styles.value}>{solar?.noOfBatteries || 1}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Battery Serial #:</Text>
                      <Text style={styles.value}>{solar?.batterySerial || 'BAT-SERIAL'}</Text>
                    </View>
                    <View style={styles.gridRowLast}>
                      <Text style={styles.label}>Battery Warranty:</Text>
                      <Text style={styles.value}>{formatDateStr(solar?.batteryWarrantyEnd)}</Text>
                    </View>
                  </View>
                </View>

              </View>
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
              <Text>• This is a computer-generated Customer Registration Form (CRF) confirming acknowledgment of solar subscription.</Text>
              <Text>• All solar equipment warranties and specifications are managed under EnergyGurus O&M subscription services.</Text>
              <Text>• Thank you for choosing EnergyGurus for your Solar Operations & Maintenance services.</Text>
              <Text>• This is computer generated Form no need for signature and stamp</Text>
            </View>
          </View>

          {/* Dotted Signature Lines (Lines kept, signature labels removed as per rule) */}
          <View style={styles.signRow}>
            <View style={styles.signBox} />
            <View style={styles.signBox} />
          </View>

          {/* Footer Addresses */}
          <View style={styles.footerRow}>
            <View style={styles.footerAddress}>
              <Text style={styles.footerTitle}>Head Office:</Text>
              <Text style={styles.footerText}>Building No 61, Block A, Bankers Society, State Life - Lahore</Text>
            </View>
            <View style={[styles.footerAddress, { borderLeft: '1px solid #c2d0e0', paddingLeft: 6 }]}>
              <Text style={styles.footerTitle}>South Office:</Text>
              <Text style={styles.footerText}>80 C, Ground Floor 13th Commercial Street Road, DHA Phase II - Karachi</Text>
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
