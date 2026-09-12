'use client'

import React from 'react'
import { CameraPhotoCapture } from './CameraPhotoCapture'

export interface CnicCameraCaptureProps {
  label: string
  cardSide: 'front' | 'back'
  file: File | null
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

export function CnicCameraCapture({
  label,
  cardSide,
  file,
  onFileSelect,
  disabled = false
}: CnicCameraCaptureProps) {
  return (
    <CameraPhotoCapture
      label={label}
      badge={`CNIC ${cardSide.toUpperCase()}`}
      cardSide={cardSide}
      guideType="card"
      file={file}
      onFileSelect={onFileSelect}
      disabled={disabled}
      fileNamePrefix={`cnic_${cardSide}`}
      subtext={`Take a clear photo of CNIC ${cardSide.toUpperCase()} or upload from gallery.`}
    />
  )
}
