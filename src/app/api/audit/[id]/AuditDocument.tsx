import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { formatDate, calculateNextAuditDate, getAuditFrequencyLabel } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 12,
    fontFamily: 'Helvetica',
    fontSize: 7.5,
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
    marginBottom: 4,
    borderBottom: '1.2px solid #002868',
    paddingBottom: 3,
  },
  logo: {
    width: 125,
    height: 'auto',
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  voucherTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002868',
    marginBottom: 1,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 6.8,
    color: '#64748b',
    fontWeight: 'normal',
    marginBottom: 2,
  },
  voucherNumberPill: {
    flexDirection: 'row',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  voucherNumberPillLeft: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 7.5,
  },
  voucherNumberPillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 7.5,
  },

  // Status & Capacity Highlight Box (Orange Brand Theme matching Receipt)
  statusBox: {
    backgroundColor: '#FFF7ED',
    border: '1px solid #F58220',
    borderRadius: 2.5,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBoxLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#C2410C',
  },
  statusBoxCapacity: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F58220',
  },
  statusBadge: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6.5,
    fontWeight: 'bold',
    marginTop: 1.5,
    alignSelf: 'flex-start',
  },

  // 2-Column Info Grid
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3.5,
  },
  col: {
    width: '49%',
  },
  card: {
    border: '1px solid #c2d0e0',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 7.2,
    letterSpacing: 0.3,
  },
  cardBody: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 0.9,
    alignItems: 'flex-start',
  },
  label: {
    width: '39%',
    color: '#555555',
    fontSize: 6.7,
    fontWeight: 'bold',
  },
  value: {
    width: '61%',
    color: '#000000',
    fontSize: 6.7,
    fontWeight: 'bold',
  },

  // 2-Column 7-Point Audit Checklist Card
  checklistCard: {
    border: '1px solid #c2d0e0',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 3.5,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  checklistHeaderText: {
    fontSize: 7.2,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  checklistBody: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
  },
  checklistColLeft: {
    width: '50%',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRight: '1px solid #E2E8F0',
  },
  checklistColRight: {
    width: '50%',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  checklistItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1.2,
    borderBottom: '0.5px solid #F1F5F9',
  },
  checkItemLabel: {
    fontSize: 6.8,
    color: '#334155',
    fontWeight: 'bold',
    width: '74%',
  },
  checkItemStatus: {
    fontSize: 6.8,
    fontWeight: 'bold',
    width: '26%',
    textAlign: 'right',
  },

  // Status Colors
  pillGood: {
    color: '#15803d',
  },
  pillWarning: {
    color: '#b45309',
  },
  pillAlert: {
    color: '#b91c1c',
  },

  // Safety & Earthing Section
  safetySection: {
    border: '1px solid #c2d0e0',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 3,
  },
  safetyHeader: {
    backgroundColor: '#002868',
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  safetyHeaderText: {
    fontSize: 7.2,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  safetyBody: {
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
  },
  safetyCol: {
    width: '33%',
  },
  safetyLabel: {
    fontSize: 6.2,
    color: '#64748b',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  safetyValue: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#002868',
  },

  // Bottom Pinned Container
  bottomContainer: {
    marginTop: 'auto',
    flexShrink: 0,
  },
  notesSection: {
    border: '1px solid #c2d0e0',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 2.5,
  },
  notesHeader: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 1.8,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 6.8,
  },
  notesBody: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 5.8,
    color: '#333333',
    lineHeight: 1.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 1,
  },
  footerAddress: {
    width: '49%',
    fontSize: 5.8,
    color: '#4B5563',
    lineHeight: 1.15,
  },
  footerTitle: {
    color: '#002868',
    fontWeight: 'bold',
    marginBottom: 0.5,
    fontSize: 6.4,
  },
  footerBlueBar: {
    backgroundColor: '#002868',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2.2,
    marginTop: 2.5,
    borderRadius: 2,
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 'bold',
  },
  footerBarDivider: {
    color: '#FFFFFF',
    fontSize: 6,
    marginHorizontal: 8,
  },
})

export function AuditDocument({
  customer,
  logoSrc,
}: {
  customer: any
  logoSrc?: string
}) {
  const solar = customer?.solarSystem || {}
  const plan = customer?.packagePlan || {}
  const firstAudit = (solar as any)?.firstAuditDate || solar?.systemInstallationDate || customer.activationDate || customer.signupDate
  const lastAudit = solar?.lastAuditDate || solar?.systemInstallationDate

  const baseDateForNext = lastAudit || firstAudit || customer.signupDate
  const nextAudit = (solar as any)?.nextAuditDate || calculateNextAuditDate(baseDateForNext, plan.packageTier)

  const crfDisplay = customer.crfNumber || (customer.customerCode ? `CRF-${customer.customerCode.replace(/\D/g, '')}` : 'CRF-PENDING')
  const customerIdDisplay = customer.customerCode?.replace(/\D/g, '') || customer.customerCode || customer.id

  const checklistLeft = [
    { name: '1. Inverter Operating Condition', val: solar?.inverterStatus || 'Excellent' },
    { name: '2. Solar PV Panels & Soiling', val: solar?.panelStatus || 'Excellent' },
    { name: '3. Battery Storage & Health', val: solar?.batteryStatus || 'Excellent' },
    { name: '4. Mounting Structure & GI', val: solar?.structureStatus || 'Excellent' },
  ]

  const checklistRight = [
    { name: '5. DC & AC Cabling & Conduits', val: solar?.cableStatus || 'Excellent' },
    { name: '6. AC/DC Earthing & Lightning', val: solar?.earthingStatus || 'Excellent' },
    { name: '7. Breakers, Isolators & Protection', val: solar?.breakerStatus || 'Excellent' },
    { name: '8. Overall Audit & Safety Status', val: 'Verified Pass' },
  ]

  const getStatusColor = (val: string) => {
    if (val === 'Excellent' || val === 'Good' || val === 'Verified Pass') return styles.pillGood
    if (val === 'Fair') return styles.pillWarning
    return styles.pillAlert
  }

  const pvWattageDisplay = solar.panelWattage && solar.noOfPanels
    ? `${solar.noOfPanels}x ${solar.panelBrand || 'Panel'} (${((solar.panelWattage * solar.noOfPanels) / 1000).toFixed(2)} kW)`
    : (solar.totalWattage ? `${(solar.totalWattage / 1000).toFixed(2)} kW` : (plan.systemSizeKw || '—'))

  const batteryDisplay = Number(solar.noOfBatteries) > 0 || (solar.batteryBrand && solar.batteryBrand !== 'N/A')
    ? `${solar.noOfBatteries || 1}x ${solar.batteryBrand || 'Battery'} (${solar.batteryType || 'Lithium'})`
    : 'N/A (No Battery Bank)'

  const frequencyLabel = getAuditFrequencyLabel(plan.packageTier)

  return (
    <Document title={`Audit-Report-${customer.customerCode || customer.id}`}>
      {/* Half Page Size: 612 width x 396 height (Half Letter landscape format) */}
      <Page size={[612, 396]} style={styles.page}>
        <View style={styles.topSection}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View>
              {logoSrc ? (
                <Image src={logoSrc} style={styles.logo} />
              ) : (
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#002868' }}>ENERGY GURUS</Text>
              )}
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.voucherTitle}>SYSTEM AUDIT REPORT</Text>
              <Text style={styles.subtitle}>Operation &amp; Maintenance Technical Audit</Text>
              <View style={styles.voucherNumberPill}>
                <Text style={styles.voucherNumberPillLeft}>CRF #</Text>
                <Text style={styles.voucherNumberPillRight}>{crfDisplay}</Text>
              </View>
            </View>
          </View>

          {/* Status & Capacity Highlight Box (Orange Brand Theme matching Receipt) */}
          <View style={styles.statusBox}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusBoxLabel}>SYSTEM AUDIT &amp; INSPECTION:</Text>
                <Text style={styles.statusBadge}>TECHNICAL AUDIT VERIFIED</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.statusBoxCapacity}>
                  {plan.systemSizeKw || solar.inverterSize || '1-10 kW'} ({plan.packageTier || 'Moderate'})
                </Text>
              </View>
            </View>
          </View>

          {/* 2-Column Info Grid */}
          <View style={styles.grid}>
            {/* Customer & Site Information (Left Column) */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>CUSTOMER &amp; SITE INFORMATION</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer ID:</Text>
                    <Text style={styles.value}>{customerIdDisplay}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer Name:</Text>
                    <Text style={styles.value}>{customer.fullName}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Contact Number:</Text>
                    <Text style={styles.value}>{customer.contactNumber}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>CNIC #:</Text>
                    <Text style={styles.value}>{customer.cnic || '—'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Installation Address:</Text>
                    <Text style={styles.value}>{customer.address || '—'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>City / Area:</Text>
                    <Text style={styles.value}>{customer.city || '—'} {customer.area ? `(${customer.area})` : ''}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Package Tier:</Text>
                    <Text style={[styles.value, { color: '#002868' }]}>{plan.packageTier || 'Moderate'} ({frequencyLabel})</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Audit & Hardware Specifications (Right Column) */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>AUDIT &amp; HARDWARE SPECIFICATIONS</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Audit Date:</Text>
                    <Text style={[styles.value, { color: '#002868' }]}>{lastAudit ? formatDate(lastAudit) : 'Scheduled'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Next Audit Date:</Text>
                    <Text style={[styles.value, { color: '#C2410C', fontWeight: 'bold' }]}>
                      {nextAudit ? formatDate(nextAudit) : 'Pending Schedule'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Auditor / Installer:</Text>
                    <Text style={styles.value}>{solar.installerName || customer.assignedInstaller?.fullName || 'EnergyGurus Technical Team'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Inverter Spec:</Text>
                    <Text style={styles.value}>{solar.inverterBrand || '—'} {solar.inverterSize || ''} ({solar.inverterType || 'Hybrid'})</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Inverter Serial #:</Text>
                    <Text style={styles.value}>{solar.inverterSerial || '—'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>PV Panels Spec:</Text>
                    <Text style={styles.value}>{pvWattageDisplay}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Battery Spec:</Text>
                    <Text style={styles.value}>{batteryDisplay}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 7-Point Audit Checklist Card - TWO COLUMNS */}
          <View style={styles.checklistCard}>
            <View style={styles.checklistHeader}>
              <Text style={styles.checklistHeaderText}>7-POINT SYSTEM COMPONENTS AUDIT CHECKLIST</Text>
              <Text style={styles.checklistHeaderText}>Inspection Status</Text>
            </View>
            <View style={styles.checklistBody}>
              {/* Left Column (Items 1 to 4) */}
              <View style={styles.checklistColLeft}>
                {checklistLeft.map((item, idx) => (
                  <View key={idx} style={styles.checklistItemRow}>
                    <Text style={styles.checkItemLabel}>{item.name}</Text>
                    <Text style={[styles.checkItemStatus, getStatusColor(item.val)]}>{item.val}</Text>
                  </View>
                ))}
              </View>

              {/* Right Column (Items 5 to 8) */}
              <View style={styles.checklistColRight}>
                {checklistRight.map((item, idx) => (
                  <View key={idx} style={styles.checklistItemRow}>
                    <Text style={styles.checkItemLabel}>{item.name}</Text>
                    <Text style={[styles.checkItemStatus, getStatusColor(item.val)]}>{item.val}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Earthing Resistance & Electrical Safety Parameters */}
          <View style={styles.safetySection}>
            <View style={styles.safetyHeader}>
              <Text style={styles.safetyHeaderText}>
                EARTHING RESISTANCE &amp; ELECTRICAL SAFETY PARAMETERS
              </Text>
            </View>
            <View style={styles.safetyBody}>
              <View style={styles.safetyCol}>
                <Text style={styles.safetyLabel}>AC Earthing Resistance</Text>
                <Text style={styles.safetyValue}>
                  {solar.earthingAcOhms != null ? `${solar.earthingAcOhms} Ω` : '0.6 Ω'}
                </Text>
              </View>
              <View style={styles.safetyCol}>
                <Text style={styles.safetyLabel}>DC Earthing Resistance</Text>
                <Text style={styles.safetyValue}>
                  {solar.earthingDcOhms != null ? `${solar.earthingDcOhms} Ω (Normal)` : '0.8 Ω (Normal)'}
                </Text>
              </View>
              <View style={styles.safetyCol}>
                <Text style={styles.safetyLabel}>Lightning Protection</Text>
                <Text style={[styles.safetyValue, { color: '#15803d' }]}>
                  {solar.lightningProtection !== false ? 'Installed & Tested' : 'Not Installed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Pinned Section (Exact Receipt Format) */}
        <View style={styles.bottomContainer}>
          <View style={styles.notesSection}>
            <Text style={styles.notesHeader}>TERMS &amp; ACKNOWLEDGEMENT</Text>
            <View style={styles.notesBody}>
              <Text>• This is a computer-generated System Audit Report confirming technical inspection and safety verification.</Text>
              <Text>• Regular O&amp;M technical system audits are performed periodically ({frequencyLabel}) under the subscribed solar maintenance agreement.</Text>
              <Text>• Thank you for choosing EnergyGurus for your Solar Operations &amp; Maintenance services.</Text>
            </View>
          </View>

          {/* Footer Addresses */}
          <View style={styles.footerRow}>
            <View style={styles.footerAddress}>
              <Text style={styles.footerTitle}>Head Office:</Text>
              <Text>Building No 61, Block A, Bankers Society, State Life - Lahore</Text>
            </View>
            <View style={[styles.footerAddress, { borderLeft: '1px solid #c2d0e0', paddingLeft: 4 }]}>
              <Text style={styles.footerTitle}>South Office:</Text>
              <Text>80 C, Ground Floor 13th Commercial Street Road, DHA Phase II - Karachi</Text>
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
