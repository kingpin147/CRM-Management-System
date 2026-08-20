'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, User, Phone, MapPin, X, Check } from 'lucide-react'
import { searchCustomersAutoSuggest } from '../actions'

interface CustomerSuggestion {
  id: string
  customerCode: string
  fullName: string
  contactNumber: string
  cnic: string
  crfNumber?: string | null
  status?: string | null
  city?: string | null
  address?: string | null
}

interface CustomerSearchAutoSuggestProps {
  onSelectCustomer: (customerId: string) => void
  isSearchingCustomer?: boolean
  placeholder?: string
}

export function CustomerSearchAutoSuggest({
  onSelectCustomer,
  isSearchingCustomer = false,
  placeholder = 'Search by Customer Name, ID, Phone, CRF #, CNIC...'
}: CustomerSearchAutoSuggestProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced auto-suggest fetch
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await searchCustomersAutoSuggest(trimmed)
        if (res?.customers) {
          setSuggestions(res.customers)
          setIsOpen(true)
        } else {
          setSuggestions([])
        }
      } catch (err) {
        console.error('Auto-suggest error:', err)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (customer: CustomerSuggestion) => {
    setQuery(`${customer.fullName} (${customer.customerCode.replace(/\D/g, '') || customer.customerCode})`)
    setIsOpen(false)
    setSelectedIndex(-1)
    onSelectCustomer(customer.id)
  }

  const handleManualSearch = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex])
      return
    }
    if (query.trim()) {
      setIsOpen(false)
      onSelectCustomer(query.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      if (!isOpen || suggestions.length === 0) return
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      if (!isOpen || suggestions.length === 0) return
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleManualSearch()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(-1)
            }}
            onFocus={() => {
              if (suggestions.length > 0 && query.trim()) setIsOpen(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-9 h-10 text-sm bg-white border border-slate-300 rounded-lg focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:outline-none shadow-2xs font-medium text-slate-900 transition-all hover:border-slate-400"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSuggestions([])
                setIsOpen(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={handleManualSearch}
          disabled={isSearchingCustomer || isLoading || !query.trim()}
          className="h-10 px-5 bg-[#002868] hover:bg-[#001d4a] text-white font-semibold text-xs gap-2 rounded-lg shadow-2xs cursor-pointer shrink-0"
        >
          {isSearchingCustomer || isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 text-amber-400" />
              <span>Search Customer</span>
            </>
          )}
        </Button>
      </div>

      {/* Auto-suggest Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-84 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Matching Customers ({suggestions.length})</span>
            <span className="text-[10px] font-normal text-slate-400">Use ↑ ↓ to navigate</span>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching customers found for &quot;<span className="font-semibold text-slate-700">{query}</span>&quot;
            </div>
          ) : (
            suggestions.map((c, idx) => {
              const isSelected = idx === selectedIndex
              const custIdDisplay = c.customerCode?.replace(/\D/g, '') || c.customerCode
              const crfDisplay = c.crfNumber || `CRF-${custIdDisplay}`

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-2.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-slate-100/90 text-[#002868]' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-[#002868] text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                      <User className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate">{c.fullName}</span>
                        <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300 font-mono text-[10px]">
                          ID: {custIdDisplay}
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 font-mono text-[10px]">
                          {crfDisplay}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium truncate">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          {c.contactNumber}
                        </span>
                        {c.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            {c.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {c.status && (
                      <Badge 
                        variant="outline" 
                        className={
                          c.status === 'CONNECTION_ACTIVE'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] font-bold'
                            : 'bg-amber-100 text-amber-950 border-amber-300 text-[10px] font-bold'
                        }
                      >
                        {c.status.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {isSelected && <Check className="h-4 w-4 text-[#002868]" />}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
