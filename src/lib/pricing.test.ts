import { describe, it, expect } from 'vitest'
import {
  getEligibleFreeMonths,
  calculateBillingDurationMonths,
  calculateNextBillingDate,
  calculatePackageBreakdown,
  isCustomCapacityTier,
} from './pricing'

describe('Promotional Free Months & Billing Calculation', () => {
  describe('getEligibleFreeMonths', () => {
    it('returns 1 free month for Monthly and Quarterly billing cycles', () => {
      expect(getEligibleFreeMonths('Monthly')).toBe(1)
      expect(getEligibleFreeMonths('Quarterly')).toBe(1)
    })

    it('returns 2 free months for Half Yearly and Yearly billing cycles', () => {
      expect(getEligibleFreeMonths('Half Yearly')).toBe(2)
      expect(getEligibleFreeMonths('Yearly')).toBe(2)
    })

    it('returns 0 for FOC or unspecified billing types', () => {
      expect(getEligibleFreeMonths('FOC')).toBe(0)
      expect(getEligibleFreeMonths(undefined)).toBe(0)
      expect(getEligibleFreeMonths(null)).toBe(0)
      expect(getEligibleFreeMonths('')).toBe(0)
    })
  })

  describe('calculateBillingDurationMonths', () => {
    it('computes correct duration for Monthly', () => {
      expect(calculateBillingDurationMonths('Monthly', 0)).toBe(1)
      expect(calculateBillingDurationMonths('Monthly', 1)).toBe(2)
    })

    it('computes correct duration for Quarterly', () => {
      expect(calculateBillingDurationMonths('Quarterly', 0)).toBe(3)
      expect(calculateBillingDurationMonths('Quarterly', 1)).toBe(4)
    })

    it('computes correct duration for Half Yearly', () => {
      expect(calculateBillingDurationMonths('Half Yearly', 0)).toBe(6)
      expect(calculateBillingDurationMonths('Half Yearly', 2)).toBe(8)
    })

    it('computes correct duration for Yearly', () => {
      expect(calculateBillingDurationMonths('Yearly', 0)).toBe(12)
      expect(calculateBillingDurationMonths('Yearly', 2)).toBe(14)
    })
  })

  describe('calculateNextBillingDate', () => {
    const startDate = new Date(2026, 0, 15) // 15 Jan 2026

    it('calculates next billing date for Monthly (Standard vs 1 Month Free)', () => {
      const standardDate = calculateNextBillingDate(startDate, 'Monthly', 0)
      expect(standardDate.getFullYear()).toBe(2026)
      expect(standardDate.getMonth()).toBe(1) // Feb (+1)
      expect(standardDate.getDate()).toBe(15)

      const promoDate = calculateNextBillingDate(startDate, 'Monthly', 1)
      expect(promoDate.getFullYear()).toBe(2026)
      expect(promoDate.getMonth()).toBe(2) // March (+2)
      expect(promoDate.getDate()).toBe(15)
    })

    it('calculates next billing date for Quarterly (Standard vs 1 Month Free)', () => {
      const standardDate = calculateNextBillingDate(startDate, 'Quarterly', 0)
      expect(standardDate.getFullYear()).toBe(2026)
      expect(standardDate.getMonth()).toBe(3) // April (+3)
      expect(standardDate.getDate()).toBe(15)

      const promoDate = calculateNextBillingDate(startDate, 'Quarterly', 1)
      expect(promoDate.getFullYear()).toBe(2026)
      expect(promoDate.getMonth()).toBe(4) // May (+4)
      expect(promoDate.getDate()).toBe(15)
    })

    it('calculates next billing date for Half Yearly (Standard vs 2 Months Free)', () => {
      const standardDate = calculateNextBillingDate(startDate, 'Half Yearly', 0)
      expect(standardDate.getFullYear()).toBe(2026)
      expect(standardDate.getMonth()).toBe(6) // July (+6)
      expect(standardDate.getDate()).toBe(15)

      const promoDate = calculateNextBillingDate(startDate, 'Half Yearly', 2)
      expect(promoDate.getFullYear()).toBe(2026)
      expect(promoDate.getMonth()).toBe(8) // September (+8)
      expect(promoDate.getDate()).toBe(15)
    })

    it('calculates next billing date for Yearly (Standard vs 2 Months Free)', () => {
      const standardDate = calculateNextBillingDate(startDate, 'Yearly', 0)
      expect(standardDate.getFullYear()).toBe(2027)
      expect(standardDate.getMonth()).toBe(0) // Jan 2027 (+12)
      expect(standardDate.getDate()).toBe(15)

      const promoDate = calculateNextBillingDate(startDate, 'Yearly', 2)
      expect(promoDate.getFullYear()).toBe(2027)
      expect(promoDate.getMonth()).toBe(2) // March 2027 (+14)
      expect(promoDate.getDate()).toBe(15)
    })
  })

  describe('isCustomCapacityTier', () => {
    it('detects 31 kW & Above and custom sizes', () => {
      expect(isCustomCapacityTier('31 kW & Above')).toBe(true)
      expect(isCustomCapacityTier('30 kW & Above')).toBe(true)
      expect(isCustomCapacityTier('35 kW')).toBe(true)
      expect(isCustomCapacityTier('50kW')).toBe(true)
    })

    it('returns false for standard range options', () => {
      expect(isCustomCapacityTier('1 - 5 kW')).toBe(false)
      expect(isCustomCapacityTier('6 - 10 kW')).toBe(false)
      expect(isCustomCapacityTier('11 - 15 kW')).toBe(false)
      expect(isCustomCapacityTier('16 - 20 kW')).toBe(false)
      expect(isCustomCapacityTier('21 - 25 kW')).toBe(false)
      expect(isCustomCapacityTier('26 - 30 kW')).toBe(false)
    })
  })

  describe('calculatePackageBreakdown with 5% Sales Tax on Onboarding and Custom Pricing', () => {
    it('charges 5% sales tax on both base subscription and 3,000 onboarding charges', () => {
      // 1 - 5 kW Basic Hybrid = 960/mo
      const b = calculatePackageBreakdown('1 - 5 kW', 'Basic', 'Monthly', 'Hybrid')
      expect(b.baseMonthlyRate).toBe(960)
      expect(b.priceAfterDiscount).toBe(960)
      expect(b.onboardingFee).toBe(3000)
      // 5% of 960 = 48
      expect(b.subscriptionSalesTax).toBe(48)
      // 5% of 3000 = 150
      expect(b.onboardingSalesTax).toBe(150)
      // Total sales tax = 48 + 150 = 198
      expect(b.salesTax).toBe(198)
      // Grand total = 960 + 3000 + 198 = 4158
      expect(b.grandTotal).toBe(4158)
    })

    it('calculates custom price for 31 kW & Above correctly', () => {
      // User enters custom base price of 10,000 PKR
      const b = calculatePackageBreakdown('31 kW & Above', 'Moderate', 'Monthly', 'Hybrid', 10000)
      expect(b.baseMonthlyRate).toBe(10000)
      expect(b.priceAfterDiscount).toBe(10000)
      expect(b.onboardingFee).toBe(3000)
      // 5% of 10000 = 500
      expect(b.subscriptionSalesTax).toBe(500)
      // 5% of 3000 = 150
      expect(b.onboardingSalesTax).toBe(150)
      // Total tax = 650
      expect(b.salesTax).toBe(650)
      // Grand total = 10000 + 3000 + 650 = 13650
      expect(b.grandTotal).toBe(13650)
    })

    it('handles 0 custom price before entry with 150 tax on onboarding', () => {
      const b = calculatePackageBreakdown('31 kW & Above', 'Moderate', 'Monthly', 'Hybrid', 0)
      expect(b.baseMonthlyRate).toBe(0)
      expect(b.priceAfterDiscount).toBe(0)
      expect(b.onboardingFee).toBe(3000)
      expect(b.subscriptionSalesTax).toBe(0)
      expect(b.onboardingSalesTax).toBe(150)
      expect(b.salesTax).toBe(150)
      expect(b.grandTotal).toBe(3150)
    })

    it('waives onboarding fee and sales tax for FOC', () => {
      const b = calculatePackageBreakdown('1 - 5 kW', 'Basic', 'FOC', 'Hybrid')
      expect(b.onboardingFee).toBe(0)
      expect(b.isOnboardingWaived).toBe(true)
      expect(b.subscriptionSalesTax).toBe(0)
      expect(b.onboardingSalesTax).toBe(0)
      expect(b.salesTax).toBe(0)
      expect(b.grandTotal).toBe(0)
    })

    it('calculates 10%, 25%, and 50% VIP / Family & Friends discount on Monthly billing', () => {
      // 1 - 5 kW Basic Hybrid = 960/mo base
      // 10% discount: 960 * 0.10 = 96. Price after = 864. Sub tax (5%) = 43. Onboarding = 3000, tax = 150. Total = 864 + 43 + 3000 + 150 = 4057
      const b10 = calculatePackageBreakdown('1 - 5 kW', 'Basic', 'Monthly', 'Hybrid', null, 10)
      expect(b10.discountPct).toBe(10)
      expect(b10.discountAmount).toBe(96)
      expect(b10.priceAfterDiscount).toBe(864)
      expect(b10.subscriptionSalesTax).toBe(43)
      expect(b10.grandTotal).toBe(4057)

      // 25% discount: 960 * 0.25 = 240. Price after = 720. Sub tax = 36. Onboarding = 3000, tax = 150. Total = 720 + 36 + 3000 + 150 = 3906
      const b25 = calculatePackageBreakdown('1 - 5 kW', 'Basic', 'Monthly', 'Hybrid', null, 25)
      expect(b25.discountPct).toBe(25)
      expect(b25.discountAmount).toBe(240)
      expect(b25.priceAfterDiscount).toBe(720)
      expect(b25.subscriptionSalesTax).toBe(36)
      expect(b25.grandTotal).toBe(3906)

      // 50% discount: 960 * 0.50 = 480. Price after = 480. Sub tax = 24. Onboarding = 3000, tax = 150. Total = 480 + 24 + 3000 + 150 = 3654
      const b50 = calculatePackageBreakdown('1 - 5 kW', 'Basic', 'Monthly', 'Hybrid', null, 50)
      expect(b50.discountPct).toBe(50)
      expect(b50.discountAmount).toBe(480)
      expect(b50.priceAfterDiscount).toBe(480)
      expect(b50.subscriptionSalesTax).toBe(24)
      expect(b50.grandTotal).toBe(3654)
    })
  })
})
