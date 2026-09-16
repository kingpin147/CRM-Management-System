'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MainNav } from '@/components/layout/MainNav'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Logo } from '@/components/ui/logo'

export function MobileNav({
  role,
  fullName,
  designation,
}: {
  role?: string
  fullName?: string
  designation?: string
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Auto-close sheet when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div onClick={handleClose}>
            <Logo
              href="/dashboard/customers"
              iconSize={28}
              className="h-16 px-6 border-b border-line shadow-sm hover:opacity-80 transition-opacity"
            />
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <MainNav 
              role={role} 
              fullName={fullName} 
              designation={designation} 
              orientation="vertical" 
              onItemClick={handleClose}
            />
          </nav>
        </SheetContent>
      </Sheet>
      <Logo href="/dashboard/customers" iconSize={24} className="hover:opacity-80 transition-opacity" />
    </div>
  )
}
