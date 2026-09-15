'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  GripHorizontal,
  Image as ImageIcon,
  Sparkles,
  Move,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface DraggableImageInspectorProps {
  isOpen: boolean
  imageUrl: string | null
  title?: string
  badge?: string
  subtext?: string
  onClose: () => void
  initialPosition?: { x: number; y: number }
}

/**
 * Normalizes image URL to handle local paths, cloud URLs, and fallback to proxy if needed.
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('blob:')) return url
  // If URL has .r2.dev, rewrite to local proxy route /api/uploads/
  if (url.includes('.r2.dev/')) {
    const parts = url.split('.r2.dev/')
    if (parts[1]) {
      return `/api/uploads/${parts[1]}`
    }
  }
  return url
}

export function DraggableImageInspector({
  isOpen,
  imageUrl,
  title = 'Hardware Photo Inspection',
  badge,
  subtext,
  onClose,
  initialPosition,
}: DraggableImageInspectorProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)
  const [activeUrl, setActiveUrl] = useState<string | null>(null)

  // Pan inside image
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const windowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize position to top-right corner when opened
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const defaultWidth = 460
      const defaultTop = 80
      const defaultLeft = Math.max(20, window.innerWidth - defaultWidth - 30)

      if (initialPosition) {
        setPosition(initialPosition)
      } else {
        setPosition({ x: defaultLeft, y: defaultTop })
      }
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setRotation(0)
      setIsMinimized(false)
      setImageError(false)
      setTriedFallback(false)
      setActiveUrl(normalizeImageUrl(imageUrl))
    }
  }, [isOpen, imageUrl, initialPosition])

  // Handle Dragging of the floating inspector window
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from header
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const newX = Math.max(10, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x))
      const newY = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y))
      setPosition({ x: newX, y: newY })
    },
    [isDragging, dragOffset]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return
      const touch = e.touches[0]
      const newX = Math.max(10, Math.min(window.innerWidth - 320, touch.clientX - dragOffset.x))
      const newY = Math.max(10, Math.min(window.innerHeight - 80, touch.clientY - dragOffset.y))
      setPosition({ x: newX, y: newY })
    },
    [isDragging, dragOffset]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsPanning(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp])

  // Pan within the image viewport when zoomed in
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return
    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    })
  }

  const handleImageMouseUp = () => {
    setIsPanning(false)
  }

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))
    } else {
      setZoom((z) => {
        const next = Math.max(0.75, +(z - 0.25).toFixed(2))
        if (next <= 1) setPan({ x: 0, y: 0 })
        return next
      })
    }
  }

  // Image load error handler with fallback
  const handleImageError = () => {
    if (!triedFallback && activeUrl) {
      setTriedFallback(true)
      // If it failed on a full URL, try local /api/uploads/ fallback
      if (activeUrl.includes('/uploads/')) {
        const key = activeUrl.split('/uploads/')[1]
        if (key) {
          setActiveUrl(`/api/uploads/${key}`)
          return
        }
      }
    }
    setImageError(true)
  }

  if (!mounted || !isOpen || !imageUrl) return null

  return createPortal(
    <div
      ref={windowRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-[99999] w-[90vw] sm:w-[460px] bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col transition-shadow ${
        isDragging ? 'opacity-95 ring-4 ring-amber-400/40 shadow-amber-500/20' : 'opacity-100'
      }`}
    >
      {/* Movable Grip Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800 rounded-t-2xl cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <div className="p-1 bg-amber-500/20 text-amber-400 rounded-md shrink-0">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[240px]">
                {title}
              </span>
              {badge && (
                <Badge
                  variant="outline"
                  className="text-[9px] bg-amber-500/10 text-amber-300 border-amber-500/30 px-1 py-0 uppercase font-bold shrink-0"
                >
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              Hold &amp; Drag header to move • Zoom &amp; read serial #
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized((m) => !m)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            title={isMinimized ? 'Expand' : 'Collapse'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-rose-400 hover:text-white rounded hover:bg-rose-900/60 cursor-pointer ml-0.5"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body (Collapsed / Expanded) */}
      {!isMinimized && (
        <div className="flex flex-col">
          {/* Zoom & Rotation Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                className="h-6 px-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px]">In</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setZoom((z) => {
                    const next = Math.max(0.75, +(z - 0.25).toFixed(2))
                    if (next <= 1) setPan({ x: 0, y: 0 })
                    return next
                  })
                }
                className="h-6 px-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px]">Out</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setZoom(1)
                  setPan({ x: 0, y: 0 })
                  setRotation(0)
                }}
                className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-white hover:bg-slate-800"
                title="Reset zoom & position"
              >
                100%
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="h-6 px-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-300 font-semibold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Image Viewport */}
          <div
            onWheel={handleWheel}
            onMouseDown={handleImageMouseDown}
            onMouseMove={handleImageMouseMove}
            onMouseUp={handleImageMouseUp}
            onDoubleClick={() => {
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
            className={`relative w-full h-[290px] sm:h-[330px] bg-black overflow-hidden flex items-center justify-center select-none ${
              zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
          >
            {imageError ? (
              <div className="p-6 text-center space-y-2">
                <ImageIcon className="w-10 h-10 text-amber-400/60 mx-auto" />
                <p className="text-xs font-bold text-white">Image Preview Not Found</p>
                <p className="text-[11px] text-slate-400 max-w-[280px]">
                  The remote photo could not be fetched. You can click &quot;Change&quot; in the form to upload a fresh image.
                </p>
              </div>
            ) : (
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                }}
                className="relative max-w-full max-h-full flex items-center justify-center pointer-events-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeUrl || ''}
                  alt={title}
                  onError={handleImageError}
                  className="max-h-[280px] sm:max-h-[320px] w-auto max-w-[440px] object-contain rounded"
                />
              </div>
            )}

            {/* Drag to move hint overlay */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-[10px] text-slate-300 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1 pointer-events-none">
              <Move className="w-3 h-3 text-amber-400" />
              <span>Scroll to zoom • Drag window to position</span>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 rounded-b-2xl flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono truncate">
              {activeUrl ? activeUrl.split('/').pop() : ''}
            </span>
            <span className="text-[10px] text-amber-300 font-medium">
              Side-by-Side Active
            </span>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
