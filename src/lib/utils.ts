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

