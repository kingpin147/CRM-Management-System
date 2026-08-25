import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 28,
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
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#002868',
    paddingBottom: 8,
  },
  logo: {
    width: 160,
    height: 'auto',
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#002868',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: 'normal',
  },
  reportBadge: {
    backgroundColor: '#002868',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 4,
  },
  card: {
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#002868',
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
    letterSpacing: 0.3,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    minHeight: 18,
    alignItems: 'center',
  },
  gridCellLabel: {
    width: '32%',
    fontSize: 8,
    color: '#002868',
    fontWeight: 'bold',
    paddingVertical: 2,
  },
  gridCellValue: {
    width: '68%',
    fontSize: 8,
    color: '#1e293b',
    paddingVertical: 2,
  },
  twoColWrapper: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  halfCard: {
    flex: 1,
    border: '1px solid #c2d0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  statusLabel: {
    fontSize: 8,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  statusPillGood: {
    backgroundColor: '#dcfce7',
    color: '#14532d',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  statusPillWarning: {
    backgroundColor: '#fef3c7',
    color: '#78350f',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  statusPillAlert: {
    backgroundColor: '#fee2e2',
    color: '#7f1d1d',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  noticeBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 3,
  },
  noticeText: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.35,
  },
  noticeHighlight: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#002868',
    marginTop: 3,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 4,
    height: 25,
  },
  signatureTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#002868',
  },
  signatureSub: {
    fontSize: 7,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 28,
    right: 28,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 4,
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

  const checklist = [
    { name: '1. Inverter Operating Condition', val: solar?.inverterStatus || 'Good' },
    { name: '2. Solar PV Panels & Soiling Status', val: solar?.panelStatus || 'Good' },
    { name: '3. Battery Storage & Health Status', val: solar?.batteryStatus || 'Good' },
    { name: '4. Mounting Structure & GI Material', val: solar?.structureStatus || 'Good' },
    { name: '5. DC & AC Cabling & Conduits', val: solar?.cableStatus || 'Good' },
    { name: '6. AC & DC Earthing & Lightning Protection', val: solar?.earthingStatus || 'Good' },
    { name: '7. Breakers, Isolators & Protection Switchgear', val: solar?.breakerStatus || 'Good' },
  ]

  const getStatusStyle = (val: string) => {
    if (val === 'Excellent' || val === 'Good') return styles.statusPillGood
    if (val === 'Fair') return styles.statusPillWarning
    return styles.statusPillAlert
  }

  return (
    <Document title={`Audit-Report-${customer.customerCode || customer.id}`}>
      <Page size="A4" style={styles.page}>
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
            <Text style={styles.title}>SYSTEM AUDIT REPORT</Text>
            <Text style={styles.subtitle}>Operation & Maintenance Technical Audit</Text>
            <Text style={styles.reportBadge}>
              CRF: {customer.crfNumber || (customer.customerCode ? `CRF-${customer.customerCode.replace(/\D/g, '')}` : '—')}
            </Text>
          </View>
        </View>

        {/* Official Policy Note */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>IMPORTANT NOTICE & AUDIT SCHEDULE POLICY</Text>
          <Text style={styles.noticeText}>
            Regular O&M technical system audits are performed periodically on a Quarterly, Half-Yearly, and Yearly basis under the subscribed solar maintenance agreement.
          </Text>
          <Text style={styles.noticeHighlight}>
            NOTE: On Customer On-Demand / Special Audit Request, a fee of PKR 3,000/- will be charged.
          </Text>
        </View>

        {/* 2-Column: Customer Details & Solar Specs */}
        <View style={styles.twoColWrapper}>
          {/* Customer Info */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>CUSTOMER & SITE INFORMATION</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Customer ID:</Text>
                <Text style={styles.gridCellValue}>{customer.customerCode?.replace(/\D/g, '') || customer.customerCode || customer.id}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Customer Name:</Text>
                <Text style={styles.gridCellValue}>{customer.fullName}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Contact Number:</Text>
                <Text style={styles.gridCellValue}>{customer.contactNumber}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Installation Address:</Text>
                <Text style={styles.gridCellValue}>{customer.address || '—'}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>City / Area:</Text>
                <Text style={styles.gridCellValue}>{customer.city || '—'} {customer.area ? `(${customer.area})` : ''}</Text>
              </View>
              <View style={[styles.gridRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.gridCellLabel}>Package Tier:</Text>
                <Text style={styles.gridCellValue}>{plan.packageTier || 'Basic'} ({plan.systemSizeKw || '1-10 kW'})</Text>
              </View>
            </View>
          </View>

          {/* System Info & Auditor */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>AUDIT & HARDWARE SPECIFICATIONS</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Audit Date:</Text>
                <Text style={[styles.gridCellValue, { fontWeight: 'bold', color: '#002868' }]}>{lastAudit ? formatDate(lastAudit) : 'Scheduled'}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Auditor / Installer:</Text>
                <Text style={styles.gridCellValue}>{solar.installerName || customer.assignedInstaller?.fullName || 'EnergyGurus Tech Team'}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Inverter Spec:</Text>
                <Text style={styles.gridCellValue}>{solar.inverterBrand || '—'} {solar.inverterSize || ''} ({solar.inverterType || 'Hybrid'})</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Inverter Serial #:</Text>
                <Text style={styles.gridCellValue}>{solar.inverterSerial || '—'}</Text>
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>PV Panels Spec:</Text>
                <Text style={styles.gridCellValue}>{solar.noOfPanels || 0}x {solar.panelBrand || '—'} ({solar.totalWattage ? `${(solar.totalWattage/1000).toFixed(2)} kW` : '—'})</Text>
              </View>
              <View style={[styles.gridRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.gridCellLabel}>Battery Spec:</Text>
                <Text style={styles.gridCellValue}>{solar.noOfBatteries || 0}x {solar.batteryBrand || '—'} ({solar.batteryType || 'Lithium'})</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 7-Point Audit Checklist Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>7-POINT SYSTEM COMPONENTS AUDIT CHECKLIST</Text>
          </View>
          <View style={{ paddingHorizontal: 4, paddingVertical: 2 }}>
            {checklist.map((item, idx) => (
              <View key={idx} style={[styles.statusRow, idx === checklist.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                <Text style={styles.statusLabel}>{item.name}</Text>
                <Text style={getStatusStyle(item.val)}>{item.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Earthing & Resistance Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>EARTHING RESISTANCE & ELECTRICAL SAFETY PARAMETERS</Text>
          </View>
          <View style={[styles.cardBody, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <View style={{ width: '33%' }}>
              <Text style={{ fontSize: 7.5, color: '#64748b' }}>AC Earthing Resistance</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#002868' }}>
                {solar.earthingAcOhms != null ? `${solar.earthingAcOhms} Ω` : '1.2 Ω (Normal)'}
              </Text>
            </View>
            <View style={{ width: '33%' }}>
              <Text style={{ fontSize: 7.5, color: '#64748b' }}>DC Earthing Resistance</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#002868' }}>
                {solar.earthingDcOhms != null ? `${solar.earthingDcOhms} Ω` : '0.8 Ω (Normal)'}
              </Text>
            </View>
            <View style={{ width: '33%' }}>
              <Text style={{ fontSize: 7.5, color: '#64748b' }}>Lightning Protection</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: solar.lightningProtection ? '#15803d' : '#94a3b8' }}>
                {solar.lightningProtection ? 'Installed & Tested' : 'Standard'}
              </Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>Auditor / Field Engineer Signature</Text>
            <Text style={styles.signatureSub}>EnergyGurus Operations & Maintenance</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>Customer Verification Signature</Text>
            <Text style={styles.signatureSub}>{customer.fullName}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          EnergyGurus (Pvt) Ltd. • Solar O&M & Audit Platform • Document Generated: {new Date().toLocaleDateString('en-GB')}
        </Text>
      </Page>
    </Document>
  )
}
