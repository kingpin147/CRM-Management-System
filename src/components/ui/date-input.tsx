'use client'

/**
 * DateInput — A date picker that always displays as DD/MM/YYYY regardless of browser locale.
 *
 * Internally the underlying <input type="date"> is kept hidden so the browser's native calendar
 * picker is still available when the user clicks the calendar icon. The visible text field shows
 * the value formatted as DD/MM/YYYY.
 *
 * Props mirror a standard <input> for drop-in replacement:
 *   value       — YYYY-MM-DD string (same format as <input type="date">)
 *   onChange    — called with a synthetic event whose target.value is YYYY-MM-DD
 *   className   — applied to the visible wrapper
 *   placeholder — shown when no date is selected (default: "DD/MM/YYYY")
 *   min/max     — forwarded to the hidden date input for validation
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

function toDisplay(iso: string): string {
  if (!iso || iso.length < 10) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value = '', onChange, className, placeholder = 'DD/MM/YYYY', min, max, disabled, ...rest }, ref) => {
    // The hidden input ref — used to programmatically open the picker
    const hiddenRef = React.useRef<HTMLInputElement>(null)

    const displayValue = toDisplay(value)

    function handleCalendarClick() {
      if (disabled) return
      // Open the native date picker on the hidden input
      const el = hiddenRef.current
      if (!el) return
      try {
        el.showPicker?.()
      } catch {
        el.focus()
        el.click()
      }
    }

    function handleHiddenChange(e: React.ChangeEvent<HTMLInputElement>) {
      onChange?.(e)
    }

    return (
      <div className={cn('relative flex items-center', className)}>
        {/* Visible read-only text field showing DD/MM/YYYY */}
        <input
          ref={ref}
          readOnly
          type="text"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onClick={handleCalendarClick}
          className={cn(
            'flex h-9 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-1',
            'text-xs font-medium text-[var(--color-ink)] placeholder:text-slate-400',
            'cursor-pointer select-none',
            'focus:outline-none focus:ring-2 focus:ring-[#002868]/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...rest}
        />

        {/* Calendar icon button */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={handleCalendarClick}
          className="absolute right-2 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:pointer-events-none"
          aria-label="Open date picker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </button>

        {/* Hidden native date input — provides the calendar picker */}
        <input
          ref={hiddenRef}
          type="date"
          value={value}
          min={min as string}
          max={max as string}
          disabled={disabled}
          onChange={handleHiddenChange}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 w-full opacity-0 pointer-events-none"
        />
      </div>
    )
  }
)

DateInput.displayName = 'DateInput'
