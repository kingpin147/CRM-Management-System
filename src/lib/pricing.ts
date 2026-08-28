export interface PricingBreakdown {
  baseMonthlyRate: number
  months: number
  subtotalBeforeDiscount: number
  discountPct: number
  discountAmount: number
  priceAfterDiscount: number
  salesTax: number
  onboardingFee: number
  isOnboardingWaived: boolean
  grandTotal: number
}

/**
 * Official Monthly Base Rates Matrix:
 *
 * Monitoring 12 Hours:
 * - 1-10 kW: Basic = 1,200 | Moderate = 1,600 | Comprehensive = 2,000
 * - 10-20 kW: Basic = 1,380 | Moderate = 1,840 | Comprehensive = 2,300
 * - 20-30 kW: Basic = 1,560 | Moderate = 2,080 | Comprehensive = 2,600
 * - 30+ kW: 0 / Custom Quote
 *
 * Monitoring 24 Hours:
 * - 1-10 kW: Basic = 1,440 | Moderate = 1,920 | Comprehensive = 2,400
 * - 10-20 kW: Basic = 1,660 | Moderate = 2,210 | Comprehensive = 2,760
 * - 20-30 kW: Basic = 1,870 | Moderate = 2,500 | Comprehensive = 3,120
 * - 30+ kW: 0 / Custom Quote
 */
export const PRICING_MATRIX: Record<
  '12 Hours' | '24 Hours',
  Record<string, Record<'Basic' | 'Moderate' | 'Comprehensive', number>>
> = {
  '12 Hours': {
    '1-10 kW': { Basic: 1200, Moderate: 1600, Comprehensive: 2000 },
    '10-20 kW': { Basic: 1380, Moderate: 1840, Comprehensive: 2300 },
    '20-30 kW': { Basic: 1560, Moderate: 2080, Comprehensive: 2600 },
    '30+ kW': { Basic: 0, Moderate: 0, Comprehensive: 0 },
    '30 kW & Above': { Basic: 0, Moderate: 0, Comprehensive: 0 },
  },
  '24 Hours': {
    '1-10 kW': { Basic: 1440, Moderate: 1920, Comprehensive: 2400 },
    '10-20 kW': { Basic: 1660, Moderate: 2210, Comprehensive: 2760 },
    '20-30 kW': { Basic: 1870, Moderate: 2500, Comprehensive: 3120 },
    '30+ kW': { Basic: 0, Moderate: 0, Comprehensive: 0 },
    '30 kW & Above': { Basic: 0, Moderate: 0, Comprehensive: 0 },
  },
}

export function getBaseMonthlyRate(
  systemSizeKw?: string | null,
  packageTier?: string | null,
  monitoringTime?: string | null
): number {
  const windowKey = (monitoringTime === '24 Hours' ? '24 Hours' : '12 Hours') as '12 Hours' | '24 Hours'
  const sizeKey = systemSizeKw || '1-10 kW'
  const tierKey = (packageTier || 'Basic') as 'Basic' | 'Moderate' | 'Comprehensive'

  const sizeTable = PRICING_MATRIX[windowKey]?.[sizeKey] || PRICING_MATRIX[windowKey]?.['1-10 kW']
  return sizeTable?.[tierKey] ?? 0
}

export function calculatePackageBreakdown(
  systemSizeKw?: string | null,
  packageTier?: string | null,
  billingType?: string | null,
  monitoringTime?: string | null
): PricingBreakdown {
  const baseMonthlyRate = getBaseMonthlyRate(systemSizeKw, packageTier, monitoringTime)

  // Billing Cycles & Discount Percentages:
  // - Quarterly: 10% (3 months)
  // - Half Yearly: 20% (6 months)
  // - Yearly: 40% (12 months)
  // - FOC: 100% (12 months)
  let months = 1
  let discountPct = 0

  if (billingType === 'Quarterly') {
    months = 3
    discountPct = 10
  } else if (billingType === 'Half Yearly') {
    months = 6
    discountPct = 20
  } else if (billingType === 'Yearly') {
    months = 12
    discountPct = 40
  } else if (billingType === 'FOC') {
    months = 12
    discountPct = 100
  }

  const subtotalBeforeDiscount = baseMonthlyRate * months
  const discountAmount = subtotalBeforeDiscount * (discountPct / 100)
  const priceAfterDiscount = subtotalBeforeDiscount - discountAmount
  const salesTax = Math.round(priceAfterDiscount * 0.05) // 5% PRA Sales Tax

  // On-Boarding Charges Rules:
  // - Waived Off ONLY on Yearly payment on all packages (0)
  // - Charged on Monthly, Quarterly, Half Yearly (PKR 3,000)
  // - FOC: 0 (Waived)
  let onboardingFee = 0
  let isOnboardingWaived = false

  if (billingType === 'FOC' || billingType === 'Yearly') {
    onboardingFee = 0
    isOnboardingWaived = true
  } else {
    onboardingFee = 3000
    isOnboardingWaived = false
  }

  const grandTotal = billingType === 'FOC' ? 0 : Math.round(priceAfterDiscount + salesTax + onboardingFee)

  return {
    baseMonthlyRate,
    months,
    subtotalBeforeDiscount,
    discountPct,
    discountAmount,
    priceAfterDiscount,
    salesTax,
    onboardingFee,
    isOnboardingWaived,
    grandTotal,
  }
}
