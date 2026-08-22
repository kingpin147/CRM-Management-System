'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Camera } from 'lucide-react'

export function EquipmentPhotoViewer({ 
  imageUrl, 
  title, 
  buttonLabel,
  className 
}: { 
  imageUrl?: string | null
  title: string
  buttonLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  if (!imageUrl) {
    return <span className="text-slate-400 font-medium">—</span>
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={className || "h-7 text-xs bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-bold gap-1 px-2.5 shadow-2xs cursor-pointer"}
      >
        <Camera className="w-3.5 h-3.5 text-amber-600" /> {buttonLabel || 'View Photo'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-white border-b border-slate-800 pb-3">
              <Camera className="w-4 h-4 text-amber-400" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
