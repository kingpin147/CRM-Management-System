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
 * Hybrid:
 * - 1-5 kW: Basic = 960 | Moderate = 1150 | Comprehensive = 1340
 * - 6-10 kW: Basic = 1440 | Moderate = 1730 | Comprehensive = 2020
 * - 11-15 kW: Basic = 1920 | Moderate = 2300 | Comprehensive = 2690
 * - 16-20 kW: Basic = 2400 | Moderate = 2880 | Comprehensive = 3360
 * - 21-25 kW: Basic = 3000 | Moderate = 3600 | Comprehensive = 4200
 * - 26-30 kW: Basic = 3600 | Moderate = 4320 | Comprehensive = 5040
 * - 30+ kW: 0 / Custom Quote
 *
 * Grid Tied:
 * - 1-5 kW: Basic = 800 | Moderate = 960 | Comprehensive = 1120
 * - 6-10 kW: Basic = 1200 | Moderate = 1440 | Comprehensive = 1680
 * - 11-15 kW: Basic = 1600 | Moderate = 1920 | Comprehensive = 2240
 * - 16-20 kW: Basic = 2000 | Moderate = 2400 | Comprehensive = 2800
 * - 21-25 kW: Basic = 2500 | Moderate = 3000 | Comprehensive = 3500
 * - 26-30 kW: Basic = 3000 | Moderate = 3600 | Comprehensive = 4200
 * - 30+ kW: 0 / Custom Quote
 */
export const PRICING_MATRIX: Record<
  'Hybrid' | 'Grid Tied',
  Record<string, Record<'Basic' | 'Moderate' | 'Comprehensive', number>>
> = {
  'Hybrid': {
    '1 - 5 kW': { Basic: 960, Moderate: 1150, Comprehensive: 1340 },
    '6 - 10 kW': { Basic: 1440, Moderate: 1730, Comprehensive: 2020 },
    '11 - 15 kW': { Basic: 1920, Moderate: 2300, Comprehensive: 2690 },
    '16 - 20 kW': { Basic: 2400, Moderate: 2880, Comprehensive: 3360 },
    '21 - 25 kW': { Basic: 3000, Moderate: 3600, Comprehensive: 4200 },
    '26 - 30 kW': { Basic: 3600, Moderate: 4320, Comprehensive: 5040 },
    '30 kW & Above': { Basic: 0, Moderate: 0, Comprehensive: 0 },
  },
  'Grid Tied': {
    '1 - 5 kW': { Basic: 800, Moderate: 960, Comprehensive: 1120 },
    '6 - 10 kW': { Basic: 1200, Moderate: 1440, Comprehensive: 1680 },
    '11 - 15 kW': { Basic: 1600, Moderate: 1920, Comprehensive: 2240 },
    '16 - 20 kW': { Basic: 2000, Moderate: 2400, Comprehensive: 2800 },
    '21 - 25 kW': { Basic: 2500, Moderate: 3000, Comprehensive: 3500 },
    '26 - 30 kW': { Basic: 3000, Moderate: 3600, Comprehensive: 4200 },
    '30 kW & Above': { Basic: 0, Moderate: 0, Comprehensive: 0 },
  },
}

export function getBaseMonthlyRate(
  systemSizeKw?: string | null,
  packageTier?: string | null,
  monitoringTime?: string | null
): number {
  const windowKey = (monitoringTime === 'Grid Tied' ? 'Grid Tied' : 'Hybrid') as 'Hybrid' | 'Grid Tied'
  const sizeKey = systemSizeKw || '1 - 5 kW'
  const tierKey = (packageTier || 'Basic') as 'Basic' | 'Moderate' | 'Comprehensive'

  const sizeTable = PRICING_MATRIX[windowKey]?.[sizeKey] || PRICING_MATRIX[windowKey]?.['1 - 5 kW']
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
  // - Quarterly: 7% (3 months)
  // - Half Yearly: 15% (6 months)
  // - Yearly: 30% (12 months)
  // - FOC: 100% (12 months)
  let months = 1
  let discountPct = 0

  if (billingType === 'Quarterly') {
    months = 3
    discountPct = 7
  } else if (billingType === 'Half Yearly') {
    months = 6
    discountPct = 15
  } else if (billingType === 'Yearly') {
    months = 12
    discountPct = 30
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
