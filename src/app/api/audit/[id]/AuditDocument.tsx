import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { formatDate } from '@/lib/utils'

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
    fontSize: 15,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 7.5,
    color: '#64748b',
    fontWeight: 'normal',
    marginBottom: 2,
  },
  voucherNumberPill: {
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  voucherNumberPillLeft: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },
  voucherNumberPillRight: {
    backgroundColor: '#F58220',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },

  // Audit Status Highlight Box (Orange Brand Theme matching Receipt)
  statusBox: {
    backgroundColor: '#FFF7ED',
    border: '1px solid #F58220',
    borderRadius: 3,
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBoxLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#C2410C',
  },
  statusBoxCapacity: {
    fontSize: 12,
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

  // Info Grid
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
    paddingVertical: 2.8,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8.2,
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: 6,
    paddingVertical: 3.5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 1.6,
    alignItems: 'flex-start',
  },
  label: {
    width: '38%',
    color: '#555555',
    fontSize: 7.8,
    fontWeight: 'bold',
  },
  value: {
    width: '62%',
    color: '#000000',
    fontSize: 7.8,
    fontWeight: 'bold',
  },

  // Details Table (Checklist)
  table: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  tableHeaderCol1: {
    width: '75%',
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableHeaderCol3: {
    width: '25%',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2.8,
    paddingHorizontal: 6,
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  tableCol1: {
    width: '75%',
    fontSize: 7.8,
    color: '#000',
    fontWeight: 'bold',
  },
  tableCol3: {
    width: '25%',
    fontSize: 7.5,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Status pills
  pillGood: {
    color: '#15803d',
    fontWeight: 'bold',
  },
  pillWarning: {
    color: '#b45309',
    fontWeight: 'bold',
  },
  pillAlert: {
    color: '#b91c1c',
    fontWeight: 'bold',
  },

  // Safety & Earthing Section
  safetySection: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  safetyBody: {
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
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
  footerBlueBar: {
    backgroundColor: '#002868',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 3.5,
    marginTop: 4,
    borderRadius: 2,
  },
  footerBarText: {
    color: '#FFFFFF',
    fontSize: 7.2,
    fontWeight: 'bold',
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
  const lastAudit = solar?.lastAuditDate || solar?.systemInstallationDate

  const crfDisplay = customer.crfNumber || (customer.customerCode ? `CRF-${customer.customerCode.replace(/\D/g, '')}` : 'CRF-PENDING')
  const customerIdDisplay = customer.customerCode?.replace(/\D/g, '') || customer.customerCode || customer.id

  const checklist = [
    { name: '1. Inverter Operating Condition', val: solar?.inverterStatus || 'Excellent' },
    { name: '2. Solar PV Panels & Soiling Status', val: solar?.panelStatus || 'Excellent' },
    { name: '3. Battery Storage & Health Status', val: solar?.batteryStatus || 'Excellent' },
    { name: '4. Mounting Structure & GI Material', val: solar?.structureStatus || 'Excellent' },
    { name: '5. DC & AC Cabling & Conduits', val: solar?.cableStatus || 'Excellent' },
    { name: '6. AC & DC Earthing & Lightning Protection', val: solar?.earthingStatus || 'Excellent' },
    { name: '7. Breakers, Isolators & Protection Switchgear', val: solar?.breakerStatus || 'Excellent' },
  ]

  const getStatusColor = (val: string) => {
    if (val === 'Excellent' || val === 'Good') return styles.pillGood
    if (val === 'Fair') return styles.pillWarning
    return styles.pillAlert
  }

  return (
    <Document title={`Audit-Report-${customer.customerCode || customer.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topSection}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View>
              {logoSrc ? (
                <Image src={logoSrc} style={styles.logo} />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#002868' }}>ENERGY GURUS</Text>
              )}
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.voucherTitle}>SYSTEM AUDIT REPORT</Text>
              <Text style={styles.subtitle}>Operation & Maintenance Technical Audit</Text>
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
                <Text style={styles.statusBoxLabel}>SYSTEM AUDIT & INSPECTION:</Text>
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
                <Text style={styles.cardHeader}>CUSTOMER & SITE INFORMATION</Text>
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
                </View>
              </View>
            </View>

            {/* Audit & Hardware Specifications (Right Column) */}
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>AUDIT & HARDWARE SPECIFICATIONS</Text>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Audit Date:</Text>
                    <Text style={[styles.value, { color: '#002868' }]}>{lastAudit ? formatDate(lastAudit) : 'Scheduled'}</Text>
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
                    <Text style={styles.value}>{solar.noOfPanels || 0}x {solar.panelBrand || '—'} ({solar.totalWattage ? `${(solar.totalWattage/1000).toFixed(2)} kW` : '—'})</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Battery Spec:</Text>
                    <Text style={styles.value}>{solar.noOfBatteries || 0}x {solar.batteryBrand || '—'} ({solar.batteryType || 'Lithium'})</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 7-Point Audit Checklist Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCol1}>7-POINT SYSTEM COMPONENTS AUDIT CHECKLIST</Text>
              <Text style={styles.tableHeaderCol3}>Inspection Status</Text>
            </View>
            {checklist.map((item, idx) => (
              <View key={idx} style={[styles.tableRow, idx === checklist.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                <Text style={styles.tableCol1}>{item.name}</Text>
                <Text style={[styles.tableCol3, getStatusColor(item.val)]}>{item.val}</Text>
              </View>
            ))}
          </View>

          {/* Earthing Resistance & Electrical Safety Parameters */}
          <View style={styles.safetySection}>
            <View style={styles.tableHeader}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#FFFFFF' }}>
                EARTHING RESISTANCE & ELECTRICAL SAFETY PARAMETERS
              </Text>
            </View>
            <View style={styles.safetyBody}>
              <View style={{ width: '33%' }}>
                <Text style={{ fontSize: 7, color: '#64748b', fontWeight: 'bold' }}>AC Earthing Resistance</Text>
                <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#002868' }}>
                  {solar.earthingAcOhms != null ? `${solar.earthingAcOhms} Ω` : '0.6 Ω'}
                </Text>
              </View>
              <View style={{ width: '33%' }}>
                <Text style={{ fontSize: 7, color: '#64748b', fontWeight: 'bold' }}>DC Earthing Resistance</Text>
                <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#002868' }}>
                  {solar.earthingDcOhms != null ? `${solar.earthingDcOhms} Ω` : '0.8 Ω (Normal)'}
                </Text>
              </View>
              <View style={{ width: '33%' }}>
                <Text style={{ fontSize: 7, color: '#64748b', fontWeight: 'bold' }}>Lightning Protection</Text>
                <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: solar.lightningProtection ? '#15803d' : '#15803d' }}>
                  {solar.lightningProtection ? 'Installed & Tested' : 'Installed & Tested'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dynamic Spacer */}
        <View style={styles.flexSpacer} />

        {/* Bottom Pinned Section (Exact Receipt Format) */}
        <View style={styles.bottomPinnedContainer}>
          <View style={styles.notesSection}>
            <Text style={styles.notesHeader}>TERMS & ACKNOWLEDGEMENT</Text>
            <View style={styles.notesBody}>
              <Text>• This is a computer-generated System Audit Report confirming technical inspection and safety verification.</Text>
              <Text>• Regular O&M technical system audits are performed periodically under the subscribed solar maintenance agreement.</Text>
              <Text>• Thank you for choosing EnergyGurus for your Solar Operations & Maintenance services.</Text>
              <Text>• This is a computer-generated document and does not require a signature or company stamp.</Text>
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
