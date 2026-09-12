'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, UploadCloud, RefreshCw, X, CheckCircle2, SwitchCamera, Image as ImageIcon, Eye, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface CameraPhotoCaptureProps {
  label?: string
  badge?: string
  subtext?: string
  file?: File | null
  value?: string | null // image URL
  onFileSelect?: (file: File | null) => void
  onValueChange?: (url: string | null) => void
  onUpload?: (file: File) => Promise<string | null | void>
  disabled?: boolean
  guideType?: 'card' | 'equipment' | 'general' | 'none'
  cardSide?: 'front' | 'back'
  compact?: boolean
  fileNamePrefix?: string
  accept?: string
  required?: boolean
  className?: string
}

export function CameraPhotoCapture({
  label,
  badge,
  subtext,
  file,
  value,
  onFileSelect,
  onValueChange,
  onUpload,
  disabled = false,
  guideType = 'equipment',
  cardSide,
  compact = false,
  fileNamePrefix = 'photo',
  accept = 'image/*',
  required = false,
  className = '',
}: CameraPhotoCaptureProps) {
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null)
  const [isShutterActive, setIsShutterActive] = useState(false)
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null)

  // Manage preview URL from file or value
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else if (value) {
      setPreviewUrl(value)
    } else {
      setPreviewUrl(null)
    }
  }, [file, value])

  // Stop camera stream helper
  const stopCameraStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }, [cameraStream])

  // Start live webcam / mobile camera stream
  const startCameraStream = useCallback(async (mode: 'environment' | 'user') => {
    setCameraError(null)
    setCapturedSnapshot(null)

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by your browser. Please use the Phone Camera or Upload File button.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(err => {
          console.warn('Video play error:', err)
        })
      }
    } catch (err: any) {
      console.error('Camera open failed:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in browser settings, or use the Phone Camera button.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.')
      } else {
        setCameraError(err.message || 'Unable to open camera.')
      }
    }
  }, [cameraStream])

  // Open modal and initialize camera
  const handleOpenLiveCamera = async () => {
    setIsLiveCameraOpen(true)
    setCapturedSnapshot(null)
    await startCameraStream(facingMode)
  }

  // Close live camera modal
  const handleCloseLiveCamera = () => {
    stopCameraStream()
    setIsLiveCameraOpen(false)
    setCapturedSnapshot(null)
    setCameraError(null)
  }

  // Toggle front / back camera
  const handleToggleFacingMode = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    await startCameraStream(nextMode)
  }

  // Snap photo from video feed
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsShutterActive(true)
    setTimeout(() => setIsShutterActive(false), 200)

    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedSnapshot(dataUrl)
  }

  // Process selected file (either from snapshot, phone camera or gallery upload)
  const processSelectedFile = async (selectedFile: File) => {
    if (onFileSelect) {
      onFileSelect(selectedFile)
    }

    if (onUpload) {
      setIsUploading(true)
      try {
        const uploadedUrl = await onUpload(selectedFile)
        if (uploadedUrl && typeof uploadedUrl === 'string' && onValueChange) {
          onValueChange(uploadedUrl)
        }
      } catch (err) {
        console.error('Upload handler error:', err)
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Confirm captured snapshot & create File
  const handleConfirmSnapshot = () => {
    if (!canvasRef.current || !capturedSnapshot) return

    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_')
        const prefix = fileNamePrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        const fileName = `${prefix}_camera_${timestamp}.jpg`
        const capturedFile = new File([blob], fileName, { type: 'image/jpeg' })
        
        await processSelectedFile(capturedFile)
        handleCloseLiveCamera()
      }
    }, 'image/jpeg', 0.92)
  }

  // Handle native file inputs (Phone Camera & Gallery Upload)
  const handleNativeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected) {
      await processSelectedFile(selected)
    }
    e.target.value = ''
  }

  // Handle Remove Photo
  const handleRemove = () => {
    if (onFileSelect) onFileSelect(null)
    if (onValueChange) onValueChange(null)
    setPreviewUrl(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  const hasImage = Boolean(file || value || previewUrl)

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Hidden file inputs */}
      {/* 1. Gallery / File Upload */}
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleNativeFileChange}
      />

      {/* 2. Direct Native Device Camera (opens phone camera directly on Android / iOS) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleNativeFileChange}
      />

      {/* Header Label and Badge */}
      {(label || badge) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{label}</span>
              {required && <span className="text-red-500">*</span>}
              {badge && (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
                  {badge}
                </span>
              )}
            </label>
          )}
          {hasImage && !isUploading && (
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Photo Ready
            </Badge>
          )}
          {isUploading && (
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 font-bold flex items-center gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
              Uploading...
            </Badge>
          )}
        </div>
      )}

      {/* Main Buttons / Container */}
      {!hasImage ? (
        <div className={`border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/20 rounded-xl transition-all text-center ${compact ? 'p-2 space-y-2' : 'p-3.5 space-y-2.5'}`}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* 1. Live Camera Button */}
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={disabled || isUploading}
              onClick={handleOpenLiveCamera}
              className={`bg-[#135d86] hover:bg-[#002868] text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer ${compact ? 'h-8 px-2.5 text-[11px]' : 'h-9 px-3.5'}`}
            >
              <Camera className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-300`} />
              <span>Take Photo (Camera)</span>
            </Button>

            {/* 2. Direct Device Native Camera (Phone Camera) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => nativeCameraInputRef.current?.click()}
              className={`text-xs font-semibold border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900 gap-1.5 cursor-pointer ${compact ? 'h-8 px-2.5 text-[11px]' : 'h-9 px-3'}`}
              title="Open Device Native Camera App"
            >
              <Camera className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-700`} />
              <span>Phone Camera</span>
            </Button>

            {/* 3. Upload from Gallery / Storage */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => galleryInputRef.current?.click()}
              className={`text-xs font-semibold border-slate-300 hover:bg-white text-slate-700 gap-1.5 cursor-pointer ${compact ? 'h-8 px-2.5 text-[11px]' : 'h-9 px-3'}`}
            >
              <UploadCloud className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-600`} />
              <span>Upload File</span>
            </Button>
          </div>

          {subtext && (
            <p className="text-[11px] text-slate-500 font-medium">
              {subtext}
            </p>
          )}
        </div>
      ) : (
        /* Captured / Uploaded Image Preview Card */
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
          {/* Thumbnail Preview */}
          <div className="relative w-16 h-14 sm:w-20 sm:h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-300 group">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={label || 'Uploaded Photo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
            {previewUrl && (
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                title="View full image"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {file?.name || (value ? (value.split('/').pop() || 'Photo') : 'Captured Photo')}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Cloud Attached'} {badge ? `• ${badge}` : ''}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={handleOpenLiveCamera}
              className="h-8 px-2 text-xs font-semibold text-slate-700 hover:text-[#002868] border-slate-300 gap-1 cursor-pointer"
              title="Retake photo using live camera"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Retake</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => galleryInputRef.current?.click()}
              className="h-8 px-2 text-xs font-semibold text-slate-700 hover:text-[#002868] border-slate-300 gap-1 cursor-pointer"
              title="Replace from files"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Change</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || isUploading}
              onClick={handleRemove}
              className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Full Image Zoom Modal */}
      {isZoomModalOpen && previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 p-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                {label || 'Photo Preview'}
              </span>
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={label || 'Full Photo'} className="max-h-[75vh] w-auto object-contain mx-auto rounded-lg" />
          </div>
        </div>
      )}

      {/* Interactive Live Camera Modal Dialog */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in-0 duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Take {label || 'Photo'} {badge && <span className="uppercase text-amber-400">({badge})</span>}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Align your subject and snap a clear picture.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Camera Button (Front / Back) */}
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
                  title="Switch Front / Rear Camera"
                >
                  <SwitchCamera className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Flip</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseLiveCamera}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Viewfinder Area / Snapshot Area */}
            <div className="relative bg-black flex items-center justify-center flex-1 min-h-[340px] sm:min-h-[420px] overflow-hidden">
              {/* Camera Error Message */}
              {cameraError ? (
                <div className="p-6 text-center max-w-md space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Camera Access Issue</h4>
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleCloseLiveCamera()
                        nativeCameraInputRef.current?.click()
                      }}
                      className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" />
                      Open Phone Camera
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseLiveCamera}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : capturedSnapshot ? (
                /* Still Snapshot Preview */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedSnapshot}
                    alt="Captured Snapshot"
                    className="max-h-[460px] w-auto object-contain rounded-lg shadow-lg"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                    Preview Snapshot ({badge || label || 'Photo'})
                  </div>
                </div>
              ) : (
                /* Live Camera Stream */
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full max-h-[460px] object-cover"
                  />

                  {/* Shutter Animation Overlay */}
                  {isShutterActive && (
                    <div className="absolute inset-0 bg-white/80 animate-out fade-out duration-200 z-30" />
                  )}

                  {/* Dynamic Viewfinder Overlay Guides */}
                  {guideType === 'card' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                      <div className="w-[85%] max-w-[440px] aspect-[1.586/1] border-2 border-dashed border-amber-400/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative flex flex-col items-center justify-between p-3.5">
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                        <span className="text-[11px] font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded-full tracking-wide">
                          {cardSide ? `CNIC ${cardSide.toUpperCase()} HERE` : 'DOCUMENT / ID CARD HERE'}
                        </span>
                        <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-full font-medium">
                          Hold steady & ensure text is readable
                        </span>
                      </div>
                    </div>
                  )}

                  {guideType === 'equipment' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                      <div className="w-[90%] max-w-[480px] h-[75%] border-2 border-amber-400/70 rounded-xl relative flex flex-col items-center justify-between p-3 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                        {/* Crosshairs & Corner Highlights */}
                        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-amber-400" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <div className="w-10 h-0.5 bg-amber-400" />
                          <div className="h-10 w-0.5 bg-amber-400 -ml-5" />
                        </div>

                        <span className="text-[11px] font-bold text-amber-300 bg-black/70 px-2.5 py-0.5 rounded-full tracking-wide">
                          {badge || label || 'FRAME EQUIPMENT HERE'}
                        </span>
                        <span className="text-[10px] text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full font-medium">
                          Ensure serial label & hardware are clearly visible
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden Canvas for Frame Capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Modal Bottom Controls */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
              {capturedSnapshot ? (
                /* Controls after capture */
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCapturedSnapshot(null)}
                    className="text-xs font-semibold text-slate-300 hover:text-white border-slate-700 bg-slate-800 hover:bg-slate-700 gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleConfirmSnapshot}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md cursor-pointer px-5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Use This Photo</span>
                  </Button>
                </>
              ) : (
                /* Controls during live viewfinder */
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseLiveCamera}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </Button>

                  {/* Circular Capture Shutter Button */}
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    className="group relative w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all shadow-lg cursor-pointer"
                    title="Capture Photo"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-400 group-hover:bg-amber-300 transition-colors shadow-inner" />
                  </button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleCloseLiveCamera()
                      galleryInputRef.current?.click()
                    }}
                    className="text-xs font-medium text-slate-300 border-slate-700 hover:bg-slate-800 gap-1 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
