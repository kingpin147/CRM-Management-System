import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * Standard system date format: 19 Aug 2026 (or 19 August 2026)
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: { fullMonth?: boolean }
): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'

  const day = String(d.getDate()).padStart(2, '0')
  const months = options?.fullMonth ? FULL_MONTH_NAMES : SHORT_MONTH_NAMES
  const month = months[d.getMonth()]
  const year = d.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Standard complaints / tickets date-time format: 19 Aug 2026 03:45 PM
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  options?: { fullMonth?: boolean }
): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'

  const day = String(d.getDate()).padStart(2, '0')
  const months = options?.fullMonth ? FULL_MONTH_NAMES : SHORT_MONTH_NAMES
  const month = months[d.getMonth()]
  const year = d.getFullYear()

  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const formattedHours = String(hours).padStart(2, '0')

  return `${day} ${month} ${year} ${formattedHours}:${minutes} ${ampm}`
}

/**
 * Auto-formats Pakistani DISCO Consumer / Reference ID (e.g., 04-11515-0469701 U)
 * When executive types digits only, hyphens are inserted automatically: XX-XXXXX-XXXXXXX.
 */
export function formatDiscoRefNo(val: string): string {
  if (!val) return ''
  const upper = val.toUpperCase()

  const raw = upper.replace(/[^A-Z0-9]/g, '')
  if (!raw) return ''

  const digitsMatch = raw.match(/^\d+/)
  const digits = digitsMatch ? digitsMatch[0] : ''
  const lettersMatch = raw.match(/[A-Z]+$/)
  const letters = lettersMatch ? lettersMatch[0] : ''

  if (!digits) return letters

  let formattedDigits = ''
  if (digits.length <= 2) {
    formattedDigits = digits
  } else if (digits.length <= 7) {
    formattedDigits = `${digits.slice(0, 2)}-${digits.slice(2)}`
  } else {
    formattedDigits = `${digits.slice(0, 2)}-${digits.slice(2, 7)}-${digits.slice(7, 14)}`
  }

  return letters ? `${formattedDigits} ${letters}` : formattedDigits
}

/**
 * Calculates Next Audit Date based on Customer Package Tier and First/Base Audit Date:
 * - Basic: 1 audit per year (Next audit = +12 months / 1 year)
 * - Moderate / FOC: 2 audits per year (Next audit = +6 months / half year)
 * - Comprehensive: 4 audits per year (Next audit = +3 months / quarterly)
 */
export function calculateNextAuditDate(
  baseAuditDate: string | Date | null | undefined,
  packageTier?: string | null
): Date | null {
  if (!baseAuditDate) return null
  const d = typeof baseAuditDate === 'string' ? new Date(baseAuditDate) : new Date(baseAuditDate.getTime())
  if (isNaN(d.getTime())) return null

  const tier = (packageTier || 'Moderate').toLowerCase().trim()
  if (tier.includes('comprehensive')) {
    // 4 audits in year -> Quarterly (+3 months)
    d.setMonth(d.getMonth() + 3)
  } else if (tier.includes('basic')) {
    // 1 audit in year -> Yearly (+12 months)
    d.setMonth(d.getMonth() + 12)
  } else {
    // Moderate / FOC / Default -> Semi-annual (+6 months)
    d.setMonth(d.getMonth() + 6)
  }
  return d
}

export function getAuditFrequencyLabel(packageTier?: string | null): string {
  const tier = (packageTier || 'Moderate').toLowerCase().trim()
  if (tier.includes('comprehensive')) return 'Quarterly (4x/Year)'
  if (tier.includes('basic')) return 'Annual (1x/Year)'
  return 'Semi-Annual (2x/Year)'
}
