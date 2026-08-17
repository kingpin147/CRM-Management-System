'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddInventoryItemDialog } from './AddInventoryItemDialog'
import { EditInventoryItemDialog } from './EditInventoryItemDialog'
import { StockAdjustDialog } from './StockAdjustDialog'
import { StockHistoryDialog } from './StockHistoryDialog'
import { DeleteInventoryItemDialog } from './DeleteInventoryItemDialog'
import {
  Sun,
  Battery,
  ShieldCheck,
  Zap,
  Package,
  Search,
  Filter,
  Layers,
  AlertTriangle,
  Boxes,
  TrendingUp,
  MapPin,
  RefreshCw,
} from 'lucide-react'

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Equipment' },
  { id: 'INVERTER', label: 'Inverters' },
  { id: 'SOLAR_PANEL', label: 'Solar PV Panels' },
  { id: 'BATTERY', label: 'Batteries' },
  { id: 'STRUCTURE', label: 'Structures' },
  { id: 'BREAKER_PROTECTION', label: 'Breakers & SPDs' },
  { id: 'CABLE_WIRE', label: 'Cables & Wires' },
  { id: 'METER', label: 'Net Meters' },
  { id: 'ACCESSORY', label: 'Accessories' },
]

export function InventoryClientView({
  initialItems,
  brands,
  totalInstalledSystems,
}: {
  initialItems: any[]
  brands: { id: string; name: string }[]
  totalInstalledSystems: number
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [selectedStockLevel, setSelectedStockLevel] = useState('ALL')

  // Filtered items logic
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false
      }

      // Brand filter
      if (selectedBrand !== 'ALL' && item.brand?.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false
      }

      // Stock Level filter
      if (selectedStockLevel === 'LOW_STOCK' && (item.quantityInStock > item.minStockAlert || item.quantityInStock === 0)) {
        return false
      }
      if (selectedStockLevel === 'OUT_OF_STOCK' && item.quantityInStock > 0) {
        return false
      }
      if (selectedStockLevel === 'OPTIMAL' && item.quantityInStock <= item.minStockAlert) {
        return false
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchSku = item.sku?.toLowerCase().includes(query)
        const matchName = item.name?.toLowerCase().includes(query)
        const matchBrand = item.brand?.toLowerCase().includes(query)
        const matchModel = item.model?.toLowerCase().includes(query)
        const matchSpecs = item.specifications?.toLowerCase().includes(query)
        const matchLocation = item.warehouseLocation?.toLowerCase().includes(query)
        if (!matchSku && !matchName && !matchBrand && !matchModel && !matchSpecs && !matchLocation) {
          return false
        }
      }

      return true
    })
  }, [initialItems, selectedCategory, selectedBrand, selectedStockLevel, searchQuery])

  // Aggregate Metrics
  const totalSkus = initialItems.length
  const totalStockUnits = initialItems.reduce((acc, i) => acc + (i.quantityInStock || 0), 0)
  const totalAllocatedUnits = initialItems.reduce((acc, i) => acc + (i.quantityAllocated || 0), 0)
  const lowStockCount = initialItems.filter(i => i.quantityInStock <= i.minStockAlert && i.quantityInStock > 0).length
  const outOfStockCount = initialItems.filter(i => i.quantityInStock === 0).length
  const totalValuation = initialItems.reduce((acc, i) => acc + ((i.quantityInStock || 0) * (Number(i.unitCost) || 0)), 0)

  return (
    <div className="space-y-6 animate-reveal">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
            Solar Equipment Inventory Management
          </h1>
          <p className="text-[var(--color-slate-custom)] mt-1 text-sm">
            Live SKU catalog, custom solar brand logistics, warehouse stock adjustments, and project allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddInventoryItemDialog existingBrands={brands} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Unique SKUs</p>
              <p className="text-2xl font-bold text-[#002868] mt-1">{totalSkus} Products</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{brands.length} Verified Brands</p>
            </div>
            <div className="p-3 bg-[#002868]/10 rounded-xl">
              <Boxes className="h-6 w-6 text-[#002868]" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warehouse Stock</p>
              <p className="text-2xl font-bold text-[#002868] mt-1">{totalStockUnits.toLocaleString()} Units</p>
              <p className="text-[11px] text-[#F58220] font-semibold mt-0.5">{totalAllocatedUnits} Units Allocated</p>
            </div>
            <div className="p-3 bg-[#F58220]/10 rounded-xl">
              <Sun className="h-6 w-6 text-[#F58220]" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Alerts</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {lowStockCount + outOfStockCount} Items
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lowStockCount} Low • {outOfStockCount} Out of Stock
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Valuation</p>
              <p className="text-2xl font-bold text-[#002868] mt-1">
                PKR {(totalValuation / 1000000).toFixed(2)}M
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{totalInstalledSystems} Deployed Systems</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-[#002868]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px bg-slate-100/80 p-1.5 rounded-t-xl">
        {CATEGORY_TABS.map((tab) => {
          const count = tab.id === 'ALL'
            ? initialItems.length
            : initialItems.filter(i => i.category === tab.id).length

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all rounded-t-lg cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-[#002868] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#002868] hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === tab.id ? 'bg-[#F58220] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search and Filters Bar */}
      <Card className="shadow-xs border-slate-200 bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search SKU, Product Name, Brand, Model, Specifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs border-slate-300"
              />
            </div>

            {/* Brand Filter */}
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">All Brands ({brands.length})</option>
                {brands.map((b) => (
                  <option key={b.id || b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Stock Level Filter */}
            <div>
              <select
                value={selectedStockLevel}
                onChange={(e) => setSelectedStockLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="OPTIMAL">Optimal Stock</option>
                <option value="LOW_STOCK">⚠️ Low Stock Alert</option>
                <option value="OUT_OF_STOCK">❌ Out of Stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Products Table */}
      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-[#002868]">
              Equipment Catalog ({filteredItems.length} Products Found)
            </CardTitle>
            <CardDescription className="text-xs">
              Manage product details, perform stock in/out adjustments, and track warehouse allocations.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/70">
              <TableRow className="border-b border-slate-200">
                <TableHead className="font-bold text-xs text-[#002868] py-3">SKU Code</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Product Name & Model</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Brand & Category</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] text-center">In Stock</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] text-center">Allocated</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Pricing (PKR)</TableHead>
                <TableHead className="font-bold text-xs text-[#002868]">Warehouse</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] text-center">Status</TableHead>
                <TableHead className="font-bold text-xs text-[#002868] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                    No solar inventory products found matching your search and filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantityInStock <= item.minStockAlert && item.quantityInStock > 0
                  const isOut = item.quantityInStock === 0

                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                      {/* SKU */}
                      <TableCell className="font-mono text-xs font-bold text-[#002868]">
                        {item.sku}
                      </TableCell>

                      {/* Product Name & Specs */}
                      <TableCell className="max-w-[220px]">
                        <div className="font-bold text-xs text-slate-900 leading-snug">{item.name}</div>
                        {item.model && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Model: {item.model}
                          </div>
                        )}
                        {item.specifications && (
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.specifications}
                          </div>
                        )}
                      </TableCell>

                      {/* Brand & Category */}
                      <TableCell>
                        <div className="font-bold text-xs text-slate-800">{item.brand}</div>
                        <Badge variant="outline" className="text-[10px] mt-1 bg-slate-50 border-slate-200">
                          {item.category?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>

                      {/* In Stock */}
                      <TableCell className="text-center">
                        <div className="text-xs font-bold text-[#002868]">
                          {item.quantityInStock} {item.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Min: {item.minStockAlert}
                        </div>
                      </TableCell>

                      {/* Allocated */}
                      <TableCell className="text-center">
                        <div className="text-xs font-semibold text-[#F58220]">
                          {item.quantityAllocated} {item.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Avail: {Math.max(0, item.quantityInStock - item.quantityAllocated)}
                        </div>
                      </TableCell>

                      {/* Pricing */}
                      <TableCell className="text-xs">
                        {item.unitSellingPrice ? (
                          <div className="font-bold text-slate-900">
                            PKR {Number(item.unitSellingPrice).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        {item.unitCost ? (
                          <div className="text-[10px] text-slate-500">
                            Cost: PKR {Number(item.unitCost).toLocaleString()}
                          </div>
                        ) : null}
                      </TableCell>

                      {/* Warehouse Location */}
                      <TableCell className="text-xs text-slate-600 max-w-[120px] truncate">
                        {item.warehouseLocation ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            {item.warehouseLocation}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            isOut
                              ? 'bg-rose-100 text-rose-800 border-rose-200 text-[10px] font-bold'
                              : isLow
                              ? 'bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold'
                              : 'bg-blue-50 text-[#002868] border-blue-200 text-[10px] font-bold'
                          }
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <StockAdjustDialog item={item} />
                          <StockHistoryDialog item={item} />
                          <EditInventoryItemDialog item={item} existingBrands={brands} />
                          <DeleteInventoryItemDialog item={item} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
