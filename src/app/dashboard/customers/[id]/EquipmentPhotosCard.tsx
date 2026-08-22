'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Camera, Eye, Zap, Battery, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { SolarSystemDialog } from './SolarSystemDialog'

interface EquipmentPhotosCardProps {
  customerId: string
  solarSystem?: any
  canEdit?: boolean
}

export function EquipmentPhotosCard({ customerId, solarSystem, canEdit }: EquipmentPhotosCardProps) {
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null)

  const inverterImage = solarSystem?.inverterImages?.[0]
  const batteryImage = solarSystem?.batteryImages?.[0]

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
      <SectionHeader
        action={
          canEdit && (
            <SolarSystemDialog customerId={customerId} solarSystem={solarSystem} />
          )
        }
      >
        <span className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#F58220]" />
          System Equipment Photos
        </span>
      </SectionHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Inverter Image Card */}
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-slate-50/50 p-4 space-y-3 shadow-2xs relative">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#002868]">Inverter Unit Photo</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {solarSystem?.inverterBrand ? `${solarSystem.inverterBrand} (${solarSystem.inverterSize || 'Hybrid'})` : 'Inverter Hardware'}
                  </p>
                </div>
              </div>

              {inverterImage ? (
                <Badge variant="outline" className="bg-emerald-100 text-emerald-950 border-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-medium">
                  No Image Uploaded
                </Badge>
              )}
            </div>

            {inverterImage ? (
              <div
                onClick={() => setActiveImage({ url: inverterImage, title: `${solarSystem?.inverterBrand || 'Inverter'} Hardware Photo` })}
                className="group relative w-full h-56 rounded-lg overflow-hidden border border-amber-200/90 bg-slate-950 flex items-center justify-center cursor-pointer shadow-inner transition-all hover:border-amber-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inverterImage}
                  alt="Inverter Photo"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-xs">
                  <Eye className="w-4 h-4 text-amber-400" /> View Full Inverter Photo
                </div>
              </div>
            ) : (
              <div className="w-full h-56 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/30 flex flex-col items-center justify-center gap-2 text-center p-4">
                <ImageIcon className="w-8 h-8 text-amber-400 opacity-60" />
                <p className="text-xs font-semibold text-slate-700">No Inverter Image Uploaded</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Upload an inverter unit photo in Solar Specs dialog.
                </p>
              </div>
            )}

            {/* Specs Summary Row */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 font-mono">
              <div className="bg-white/80 p-2 rounded border border-slate-200/60">
                <span className="text-[10px] text-slate-500 block">Serial Number:</span>
                <span className="font-bold text-[#002868]">{solarSystem?.inverterSerial || '—'}</span>
              </div>
              <div className="bg-white/80 p-2 rounded border border-slate-200/60">
                <span className="text-[10px] text-slate-500 block">Phase / Type:</span>
                <span className="font-bold text-amber-900">{solarSystem?.inverterPhase || 'Three Phase'}</span>
              </div>
            </div>
          </div>

          {/* 2. Battery Image Card */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-slate-100/50 p-4 space-y-3 shadow-2xs relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#002868] text-white flex items-center justify-center font-bold shadow-2xs">
                  <Battery className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#002868]">Battery Storage Unit Photo</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {solarSystem?.batteryBrand ? `${solarSystem.batteryBrand} (${solarSystem.batteryType || 'Lithium'})` : 'Battery Hardware'}
                  </p>
                </div>
              </div>

              {batteryImage ? (
                <Badge variant="outline" className="bg-emerald-100 text-emerald-950 border-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-medium">
                  No Image Uploaded
                </Badge>
              )}
            </div>

            {batteryImage ? (
              <div
                onClick={() => setActiveImage({ url: batteryImage, title: `${solarSystem?.batteryBrand || 'Battery'} Hardware Photo` })}
                className="group relative w-full h-56 rounded-lg overflow-hidden border border-slate-300 bg-slate-950 flex items-center justify-center cursor-pointer shadow-inner transition-all hover:border-[#002868]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={batteryImage}
                  alt="Battery Photo"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-xs">
                  <Eye className="w-4 h-4 text-sky-400" /> View Full Battery Photo
                </div>
              </div>
            ) : (
              <div className="w-full h-56 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 text-center p-4">
                <ImageIcon className="w-8 h-8 text-slate-400 opacity-60" />
                <p className="text-xs font-semibold text-slate-700">No Battery Image Uploaded</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Upload a battery storage photo in Solar Specs dialog.
                </p>
              </div>
            )}

            {/* Specs Summary Row */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 font-mono">
              <div className="bg-white/80 p-2 rounded border border-slate-200/60">
                <span className="text-[10px] text-slate-500 block">Serial Number:</span>
                <span className="font-bold text-[#002868]">{solarSystem?.batterySerial || '—'}</span>
              </div>
              <div className="bg-white/80 p-2 rounded border border-slate-200/60">
                <span className="text-[10px] text-slate-500 block">Quantity / Tech:</span>
                <span className="font-bold text-slate-800">
                  {solarSystem?.noOfBatteries ? `${solarSystem.noOfBatteries} Units` : '1 Unit'} ({solarSystem?.batteryType || 'Lithium'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox Preview Modal */}
        <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
          <DialogContent className="max-w-4xl bg-slate-950 border border-slate-800 p-2 rounded-2xl">
            {activeImage && (
              <div className="space-y-2 p-2">
                <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {activeImage.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">Equipment Photo Preview</p>
                  </div>
                </div>
                <div className="w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeImage.url} alt={activeImage.title} className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl" />
                </div>
                <div className="text-right">
                  <a
                    href={activeImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:underline font-mono"
                  >
                    Open Original R2 URL ↗
                  </a>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
