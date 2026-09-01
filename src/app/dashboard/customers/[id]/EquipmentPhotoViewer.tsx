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
      <div
        onClick={() => setOpen(true)}
        className={`group relative overflow-hidden rounded-md border border-slate-200 bg-slate-100 cursor-pointer shadow-sm hover:border-[#002868] transition-all flex items-center justify-center ${className || 'w-16 h-12'}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </div>

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
