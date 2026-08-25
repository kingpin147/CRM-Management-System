"use client"

import { useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function CustomerIdQuickSwitch({
  currentCustomerCode,
}: {
  currentCustomerCode?: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const currentDigits = useMemo(() => {
    const code = currentCustomerCode || ''
    return code.replace(/\D/g, '')
  }, [currentCustomerCode])

  const go = () => {
    const nextDigits = value.trim().replace(/\D/g, '')
    if (!nextDigits) return
    if (nextDigits === currentDigits) return

    const qs = tab ? `?tab=${encodeURIComponent(tab)}` : ''
    startTransition(() => {
      router.push(`/dashboard/customers/${encodeURIComponent(nextDigits)}${qs}`)
    })
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="relative w-full sm:w-[240px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-slate-custom)]" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') go()
          }}
          placeholder="Type Customer ID"
          className="pl-9 text-xs h-10 border-[var(--color-line)] bg-slate-50/60 focus:bg-white"
          inputMode="numeric"
        />
      </div>
      <Button
        type="button"
        onClick={go}
        disabled={isPending}
        className="h-10 text-xs font-bold bg-[#002868] hover:bg-[#001d4a] text-white shadow-md gap-2 cursor-pointer px-5"
      >
        Open
      </Button>
    </div>
  )
}

