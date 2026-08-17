'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Loader2, User, ChevronDown } from 'lucide-react'

export function UserNav({ email }: { email: string | undefined }) {
  const router = useRouter()
  const supabase = createClient()

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error('Logout error', error)
      setIsLoggingOut(false)
    }
  }

  const initial = email?.charAt(0).toUpperCase() || 'U'
  const displayName = email?.split('@')[0] || 'User'

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#002868]"
            />
          }
        >
          <div className="w-7 h-7 rounded-full bg-[#002868] flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {initial}
          </div>
          <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate hidden sm:inline-block">
            {displayName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-60 bg-white p-1.5 shadow-lg border border-slate-200 rounded-xl" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#002868] flex items-center justify-center text-white font-bold text-[10px]">
                    {initial}
                  </div>
                  <p className="text-xs font-bold text-slate-900 leading-none truncate">
                    {displayName}
                  </p>
                </div>
                <p className="text-[11px] leading-none text-slate-500 truncate pt-1 font-mono">
                  {email || 'user@energygurus.pk'}
                </p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 border-slate-100" />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            ) : (
              <LogOut className="h-4 w-4 text-red-600" />
            )}
            <span>{isLoggingOut ? 'Logging out...' : 'Sign Out / Logout'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Logout Button directly in header */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Sign Out"
        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="sr-only">Sign out</span>
      </button>
    </div>
  )
}

