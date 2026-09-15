'use client'

import React, { useState } from 'react'
import { Camera } from 'lucide-react'
import { DraggableImageInspector, normalizeImageUrl } from '@/components/ui/DraggableImageInspector'

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
  const normalizedUrl = normalizeImageUrl(imageUrl)

  if (!normalizedUrl) {
    return <span className="text-slate-400 font-medium">—</span>
  }

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={`group relative overflow-hidden rounded-md border border-slate-200 bg-slate-100 cursor-pointer shadow-sm hover:border-[#002868] transition-all flex items-center justify-center ${className || 'w-16 h-12'}`}
        title="Click to open movable photo inspector"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={normalizedUrl} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </div>

      {open && (
        <DraggableImageInspector
          isOpen={open}
          imageUrl={normalizedUrl}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

