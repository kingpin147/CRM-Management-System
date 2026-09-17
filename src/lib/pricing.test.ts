import { describe, it, expect } from 'vitest'
import {
  getEligibleFreeMonths,
  calculateBillingDurationMonths,
  calculateNextBillingDate,
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
})
