'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { ChevronDown, MapPin } from 'lucide-react'

interface AutoSuggestInputProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
  onSelectOption?: (selected: string) => void
  disabled?: boolean
  required?: boolean
}

export function AutoSuggestInput({
  value,
  onChange,
  options,
  placeholder = 'Type or select...',
  className = '',
  onSelectOption,
  disabled = false,
}: AutoSuggestInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = React.useMemo(() => {
    if (!value || !value.trim()) return options
    const query = value.trim().toLowerCase()
    return options.filter((opt) => opt.toLowerCase().includes(query))
  }, [value, options])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (selected: string) => {
    onChange(selected)
    if (onSelectOption) onSelectOption(selected)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Input
          type="text"
          value={value || ''}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`pr-8 ${className}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-xl border border-amber-200/80 shadow-lg p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  value === option
                    ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200/60'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{option}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-slate-500 flex items-center gap-2 italic">
              <span>Press enter or continue typing custom value...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
