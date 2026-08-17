'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createInventoryItem, createCustomBrand } from './actions'
import { Plus, Sparkles, Tag, Layers, MapPin, DollarSign, AlertCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'INVERTER', label: 'Inverters (Hybrid / OnGrid / OffGrid)', prefix: 'INV' },
  { value: 'SOLAR_PANEL', label: 'Solar PV Panels (TopCon / Bifacial)', prefix: 'PAN' },
  { value: 'BATTERY', label: 'Batteries (Lithium / Tubular / Gel)', prefix: 'BAT' },
  { value: 'STRUCTURE', label: 'Mounting Structures (L2 / L3 / Elevated)', prefix: 'STR' },
  { value: 'BREAKER_PROTECTION', label: 'AC/DC Breakers & SPDs', prefix: 'BRK' },
  { value: 'CABLE_WIRE', label: 'Solar & AC Cables / Wires', prefix: 'CBL' },
  { value: 'METER', label: 'Net Meters (Green Meter / Smart Meter)', prefix: 'MET' },
  { value: 'ACCESSORY', label: 'Zero Export Devices & Accessories', prefix: 'ACC' },
  { value: 'OTHER', label: 'Other Hardware', prefix: 'OTH' },
]

const DEFAULT_UNITS = ['Units', 'Panels', 'Meters', 'Coils', 'Sets', 'Boxes', 'Pairs']

export function AddInventoryItemDialog({
  existingBrands,
}: {
  existingBrands: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [category, setCategory] = useState('INVERTER')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [brand, setBrand] = useState(existingBrands[0]?.name || 'Huawei')
  const [customBrandMode, setCustomBrandMode] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [model, setModel] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [unit, setUnit] = useState('Units')
  const [quantityInStock, setQuantityInStock] = useState('10')
  const [minStockAlert, setMinStockAlert] = useState('5')
  const [unitCost, setUnitCost] = useState('')
  const [unitSellingPrice, setUnitSellingPrice] = useState('')
  const [warehouseLocation, setWarehouseLocation] = useState('Lahore Central Warehouse - Bay 1')

  // Auto-generate SKU helper
  function generateSuggestedSku() {
    const catObj = CATEGORIES.find(c => c.value === category)
    const prefix = catObj ? catObj.prefix : 'SOL'
    const brandCode = (customBrandMode ? newBrandName : brand || 'GEN').substring(0, 3).toUpperCase()
    const modelCode = model ? model.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase() : Math.floor(100 + Math.random() * 900)
    setSku(`${prefix}-${brandCode}-${modelCode}`)
  }

  async function handleAddCustomBrand() {
    if (!newBrandName.trim()) return
    setLoading(true)
    const res = await createCustomBrand(newBrandName.trim(), category)
    setLoading(false)
    if (res?.brand) {
      setBrand(res.brand.name)
      setCustomBrandMode(false)
      setNewBrandName('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const chosenBrand = customBrandMode ? newBrandName.trim() : brand.trim()
    if (!chosenBrand) {
      setError('Please provide a Brand name.')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('sku', sku)
    formData.append('name', name)
    formData.append('category', category)
    formData.append('brand', chosenBrand)
    formData.append('model', model)
    formData.append('specifications', specifications)
    formData.append('unit', unit)
    formData.append('quantityInStock', quantityInStock)
    formData.append('minStockAlert', minStockAlert)
    formData.append('unitCost', unitCost || '0')
    formData.append('unitSellingPrice', unitSellingPrice || '0')
    formData.append('warehouseLocation', warehouseLocation)

    const res = await createInventoryItem(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
      // Reset form
      setSku('')
      setName('')
      setModel('')
      setSpecifications('')
      setUnitCost('')
      setUnitSellingPrice('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 bg-[#002868] hover:bg-[#001d4a] text-white font-bold shadow-sm" />}>
        <Plus className="h-4 w-4" /> Add Inventory Item
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 border-line max-h-[90vh] overflow-y-auto bg-white">
        {/* Navy Header Banner */}
        <DialogHeader className="bg-[#002868] px-6 py-4 border-b border-[#001d4a]">
          <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#F58220]" /> Add New Solar Inventory Product
          </DialogTitle>
          <DialogDescription className="text-slate-200 text-xs mt-0.5">
            Register hardware SKUs, custom manufacturer brands, technical specs, and warehouse stock levels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Horizontal Multi-Column Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Product Identification */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
                1. Product Identification & Brand
              </h3>

              {/* Category & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002868]">Equipment Category *</Label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      if (!sku) {
                        const catObj = CATEGORIES.find(c => c.value === e.target.value)
                        if (catObj) setSku(`${catObj.prefix}-`)
                      }
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-[#002868]">SKU / Code *</Label>
                    <button
                      type="button"
                      onClick={generateSuggestedSku}
                      className="text-[11px] font-bold text-[#F58220] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" /> Auto
                    </button>
                  </div>
                  <Input
                    required
                    placeholder="e.g. INV-HUA-20KW"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="h-10 text-xs font-mono font-bold tracking-wide uppercase border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#002868]">Product Name / Title *</Label>
                <Input
                  required
                  placeholder="e.g. Huawei 20kW Three-Phase Hybrid Smart Inverter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-xs font-medium border-slate-300 bg-white"
                />
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-[#002868]">Manufacturer Brand *</Label>
                    <button
                      type="button"
                      onClick={() => setCustomBrandMode(!customBrandMode)}
                      className="text-[11px] font-bold text-[#F58220] hover:underline cursor-pointer"
                    >
                      {customBrandMode ? '← Existing' : '+ Custom'}
                    </button>
                  </div>

                  {customBrandMode ? (
                    <div className="flex gap-1.5">
                      <Input
                        placeholder="Brand..."
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        className="h-10 text-xs border-slate-300 bg-white"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomBrand}
                        size="sm"
                        className="bg-[#002868] text-white font-bold text-xs shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                    >
                      {existingBrands.map(b => (
                        <option key={b.id || b.name} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002868]">Model / Series</Label>
                  <Input
                    placeholder="e.g. SUN2000-20KTL-M2"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="h-10 text-xs border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#002868]">Technical Specifications</Label>
                <Input
                  placeholder="e.g. 20kW Three-Phase, IP65, 4 MPPT, AI Arc Fault"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="h-10 text-xs border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Right Column: Inventory Stock, Pricing & Warehouse */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002868] pb-1 border-b border-slate-200">
                2. Stock Levels, Pricing & Warehouse
              </h3>

              {/* Stock Quantities */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002868]">Initial Stock *</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={quantityInStock}
                    onChange={(e) => setQuantityInStock(e.target.value)}
                    className="h-10 text-xs font-bold border-slate-300 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002868]">Unit</Label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                  >
                    {DEFAULT_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002868]">Min Alert</Label>
                  <Input
                    type="number"
                    min={1}
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="h-10 text-xs border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002868]">Unit Cost (PKR)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Purchase cost"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="h-10 text-xs border-slate-300 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002868]">Selling Price (PKR)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Retail quotation price"
                    value={unitSellingPrice}
                    onChange={(e) => setUnitSellingPrice(e.target.value)}
                    className="h-10 text-xs font-semibold border-slate-300 text-[#002868] bg-white"
                  />
                </div>
              </div>

              {/* Warehouse Location */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#002868]">Warehouse / Storage Rack</Label>
                <Input
                  placeholder="e.g. Lahore Central Warehouse - Bay 1"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  className="h-10 text-xs border-slate-300 bg-white"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Adding this item will automatically register an initial stock ledger transaction in audit logs.
                </span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="pt-3 flex justify-end gap-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs px-6 shadow-sm cursor-pointer"
            >
              {loading ? 'Adding Product...' : 'Add to Inventory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
