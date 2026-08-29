import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 20,
    fontFamily: 'Helvetica',
    fontSize: 8.2,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },

  topContent: {
    flexShrink: 0,
  },

  bottomPinnedContainer: {
    marginTop: 10,
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
    width: 175,
    height: 'auto',
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 3,
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
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 8.5,
  },
  crfPillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 8.5,
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
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 9.2,
    letterSpacing: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9.2,
  },
  cardBody: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  // Grid Tables
  gridRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 3.2,
    alignItems: 'center',
  },
  gridRowLast: {
    flexDirection: 'row',
    paddingVertical: 3.2,
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
    fontSize: 8.2,
    fontWeight: 'bold',
  },
  value: {
    width: '58%',
    color: '#1F2937',
    fontSize: 8.2,
  },
  badgePill: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 2,
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  badgeGreen: {
    backgroundColor: '#059669',
    color: '#FFFFFF',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 2,
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  badgeAmber: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 2,
    fontSize: 7.5,
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
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.2,
    borderBottom: '1px solid #c2d0e0',
  },

  // Notes & Signatures
  notesSection: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    fontWeight: 'bold',
    fontSize: 8.2,
  },
  notesBody: {
    padding: 4.5,
    fontSize: 7.2,
    color: '#333333',
    lineHeight: 1.3,
  },

  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 4,
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
    marginTop: 4,
  },
  footerAddress: {
    width: '49%',
  },
  footerTitle: {
    fontWeight: 'bold',
    color: '#002868',
    fontSize: 7.5,
    marginBottom: 1,
  },
  footerText: {
    fontSize: 6.8,
    color: '#4B5563',
  },
  footerBlueBar: {
    backgroundColor: '#002868',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
    marginTop: 4,
    borderRadius: 2,
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  footerBarDivider: {
    color: '#FFFFFF',
    fontSize: 7.5,
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

  // Earthing calculation
  const hasAc = solar?.earthingAcOhms != null && Number(solar.earthingAcOhms) > 0
  const hasDc = solar?.earthingDcOhms != null && Number(solar.earthingDcOhms) > 0
  let earthingDisplay = '—'
  if (hasAc || hasDc) {
    earthingDisplay = `AC: ${hasAc ? String(solar.earthingAcOhms) : '—'} Ohm | DC: ${hasDc ? String(solar.earthingDcOhms) : '—'} Ohm`
  } else if (solar?.earthing && solar.earthing.trim() !== '') {
    earthingDisplay = solar.earthing
  }

  // Structure calculation
  const structureDisplay = [solar?.structureType, solar?.structureMaterial ? `(${solar.structureMaterial})` : null].filter(Boolean).join(' ') || '—'

  // Total wattage calculation
  const totalW = Number(solar?.totalWattage || 0)
  const totalWattageDisplay = totalW > 0 ? `${totalW} W (${(totalW / 1000).toFixed(2)} kW)` : '—'

  // Zero export calculation
  const zeroExportDisplay = solar?.zeroExportDevice ? 'Installed' : ((solar?.inverterBrand || solar?.meterType || solar?.disco) ? 'Not Installed' : '—')

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
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
                  <Text style={styles.value}>{customer?.address || (customer?.city ? `${customer.city}, Pakistan` : '—')}</Text>
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
                  <Text style={styles.value}>
                    {customer?.contactNumber}
                    {(customer as any)?.pocNumber ? ` / POC: ${(customer as any).pocNumber}` : ''}
                  </Text>
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
                  <Text style={styles.label}>Activation Date:</Text>
                  <Text style={styles.value}>
                    {customer?.status === 'CONNECTION_ACTIVE' && customer?.activationDate 
                      ? formatDateStr(customer.activationDate) 
                      : 'Pending O&M Approval'}
                  </Text>
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
                    <Text style={styles.badgePill}>{plan?.systemSizeKw || '—'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Billing Type:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{plan?.billingType || '—'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Package:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{plan?.packageTier || '—'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.gridColRight}>
                  <Text style={styles.label}>Next Billing Date:</Text>
                  <Text style={styles.value}>
                    {customer?.status === 'CONNECTION_ACTIVE' && plan?.nextBillingDate
                      ? formatDateStr(plan.nextBillingDate)
                      : 'Pending Activation'}
                  </Text>
                </View>
              </View>

              <View style={styles.gridRowLast}>
                <View style={styles.gridColLeft}>
                  <Text style={styles.label}>Monitoring Time:</Text>
                  <View style={{ width: '58%' }}>
                    <Text style={styles.badgePill}>{plan?.monitoringTime || '—'}</Text>
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
                      <Text style={styles.value}>{solar?.meterType || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Zero Export Device:</Text>
                      <Text style={styles.value}>{zeroExportDisplay}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>DISCO:</Text>
                      <Text style={styles.value}>{solar?.disco || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Consumer ID:</Text>
                      <Text style={styles.value}>{solar?.discoRefNo || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Brand:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>{solar?.inverterBrand || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Type:</Text>
                      <Text style={styles.value}>{solar?.inverterType || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Phase:</Text>
                      <Text style={styles.value}>{solar?.inverterPhase || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Category:</Text>
                      <Text style={styles.value}>{solar?.inverterCategory || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Size:</Text>
                      <Text style={styles.value}>{solar?.inverterSize || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>No. of Inverters:</Text>
                      <Text style={styles.value}>{solar?.noOfInverters && Number(solar.noOfInverters) > 0 ? String(solar.noOfInverters) : '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Serial #:</Text>
                      <Text style={styles.value}>{solar?.inverterSerial || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Inverter Warranty:</Text>
                      <Text style={styles.value}>{formatDateStr(solar?.inverterWarrantyEnd)}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Earthing & OHMs:</Text>
                      <Text style={styles.value}>{earthingDisplay}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Ingress Protection:</Text>
                      <Text style={styles.value}>{solar?.ingressProtection ? (solar.ingressProtection.startsWith('IP') ? solar.ingressProtection : `IP${solar.ingressProtection}`) : '—'}</Text>
                    </View>
                    <View style={styles.gridRowLast}>
                      <Text style={styles.label}>Structure:</Text>
                      <Text style={styles.value}>{structureDisplay}</Text>
                    </View>
                  </View>
                </View>

                {/* Right Sub Column: Panels & Battery */}
                <View style={styles.colBox}>
                  <Text style={styles.colHeader}>PV PANELS & BATTERY ENERGY STORAGE</Text>
                  <View style={{ paddingHorizontal: 4, paddingVertical: 2 }}>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Tech:</Text>
                      <Text style={styles.value}>{solar?.panelTechnology || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Brand:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>{solar?.panelBrand || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Wattage:</Text>
                      <Text style={styles.value}>{solar?.panelWattage && Number(solar.panelWattage) > 0 ? `${solar.panelWattage} W` : '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>No of Panels:</Text>
                      <Text style={styles.value}>{solar?.noOfPanels && Number(solar.noOfPanels) > 0 ? String(solar.noOfPanels) : '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Total Wattage:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>
                        {totalWattageDisplay}
                      </Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Panel Warranty:</Text>
                      <Text style={styles.value}>{formatDateStr(solar?.panelWarrantyEnd)}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Battery Category:</Text>
                      <Text style={styles.value}>{solar?.batteryCategory || '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Battery Brand:</Text>
                      <Text style={[styles.value, { fontWeight: 'bold' }]}>{solar?.batteryBrand && solar.batteryBrand !== 'N/A' ? solar.batteryBrand : (solar?.batteryBrand === 'N/A' && Number(solar?.noOfBatteries) > 0 ? 'N/A' : '—')}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>No. of Batteries:</Text>
                      <Text style={styles.value}>{solar?.noOfBatteries && Number(solar.noOfBatteries) > 0 ? String(solar.noOfBatteries) : '—'}</Text>
                    </View>
                    <View style={styles.gridRow}>
                      <Text style={styles.label}>Battery Serial #:</Text>
                      <Text style={styles.value}>{solar?.batterySerial || '—'}</Text>
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
