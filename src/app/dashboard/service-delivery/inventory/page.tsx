import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sun, Battery, ShieldCheck, Zap, Package, RefreshCw, Plus } from 'lucide-react'

export default async function InventoryManagementPage() {
  // Fetch installed system count to calculate inventory allocation
  const totalSystems = await prisma.solarSystem.count()

  const inventoryStock = [
    { id: 'INV-SOLIS-6KW', category: 'Inverters', item: 'Solis 6kW Hybrid Inverter', brand: 'Solis', type: 'Hybrid', inStock: 24, allocated: 18, total: 42, unitPrice: 'PKR 380,000' },
    { id: 'INV-GROWATT-10KW', category: 'Inverters', item: 'Growatt 10kW OnGrid Inverter', brand: 'Growatt', type: 'OnGrid', inStock: 15, allocated: 12, total: 27, unitPrice: 'PKR 450,000' },
    { id: 'INV-HUAWEI-20KW', category: 'Inverters', item: 'Huawei 20kW Three-Phase Inverter', brand: 'Huawei', type: 'Hybrid+OnGrid', inStock: 8, allocated: 6, total: 14, unitPrice: 'PKR 820,000' },
    { id: 'PANEL-LONGI-585W', category: 'Solar Panels', item: 'Longi 585W Hi-MO 6 Monofacial', brand: 'Longi', type: 'TopCon', inStock: 340, allocated: 210, total: 550, unitPrice: 'PKR 24,500' },
    { id: 'PANEL-JINKO-615W', category: 'Solar Panels', item: 'Jinko 615W N-Type Bifacial Panel', brand: 'Jinko Solar', type: 'N-Type TopCon', inStock: 180, allocated: 140, total: 320, unitPrice: 'PKR 27,000' },
    { id: 'BAT-PYLONTECH-100AH', category: 'Batteries', item: 'Pylontech 100Ah Lithium HV Battery', brand: 'Pylontech', type: 'Lithium High Voltage', inStock: 18, allocated: 14, total: 32, unitPrice: 'PKR 540,000' },
    { id: 'BAT-NARADA-200AH', category: 'Batteries', item: 'Narada 200Ah Lead-Acid Gel Battery', brand: 'Narada', type: 'Leadacid', inStock: 30, allocated: 22, total: 52, unitPrice: 'PKR 145,000' },
    { id: 'METER-GREEN-3PH', category: 'Meters & Protection', item: '3-Phase Bi-Directional Green Meter', brand: 'Microtech', type: 'Green Meter', inStock: 45, allocated: 38, total: 83, unitPrice: 'PKR 65,000' },
    { id: 'ZERO-EXP-LIMITER', category: 'Meters & Protection', item: 'Zero Export Limiter Device 50A', brand: 'Sofar Solar', type: 'Smart Meter', inStock: 22, allocated: 16, total: 38, unitPrice: 'PKR 35,000' },
  ]

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
            Service Delivery Inventory Management
          </h1>
          <p className="text-[var(--color-slate-custom)] mt-1">
            Track hardware stock levels, equipment allocations, and serial logistics across warehouse facilities.
          </p>
        </div>
        <Button className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" /> Add Inventory Item
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--color-slate-custom)] uppercase">Inverters in Warehouse</p>
              <p className="text-2xl font-bold text-[var(--color-graphite)] mt-1">47 Units</p>
            </div>
            <Sun className="h-8 w-8 text-[var(--color-amber)] opacity-80" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--color-slate-custom)] uppercase">PV Panels Stock</p>
              <p className="text-2xl font-bold text-[var(--color-graphite)] mt-1">520 Panels</p>
            </div>
            <Zap className="h-8 w-8 text-[var(--color-teal)] opacity-80" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--color-slate-custom)] uppercase">Energy Storage Units</p>
              <p className="text-2xl font-bold text-[var(--color-graphite)] mt-1">48 Units</p>
            </div>
            <Battery className="h-8 w-8 text-[#002868] opacity-80" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--color-slate-custom)] uppercase">Commissioned Systems</p>
              <p className="text-2xl font-bold text-[var(--color-graphite)] mt-1">{totalSystems} Installations</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-blue-600 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Inventory Stock Table */}
      <Card className="shadow-sm border-line bg-white overflow-hidden">
        <CardHeader className="py-4 border-b border-line flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[var(--color-graphite)]">
              Equipment Stock Inventory
            </CardTitle>
            <CardDescription className="text-xs">
              Live warehouse stock records for Inverters, PV Panels, Batteries, Green Meters, and Zero Export Devices.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-[#002868] text-white border-[#002868] text-xs font-semibold">
            Warehouse Status: Operational
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-xs">SKU / Item Code</TableHead>
                <TableHead className="font-bold text-xs">Category</TableHead>
                <TableHead className="font-bold text-xs">Equipment Item</TableHead>
                <TableHead className="font-bold text-xs">Brand & Specs</TableHead>
                <TableHead className="font-bold text-xs">In Stock</TableHead>
                <TableHead className="font-bold text-xs">Allocated</TableHead>
                <TableHead className="font-bold text-xs">Unit Price</TableHead>
                <TableHead className="text-right font-bold text-xs">Stock Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryStock.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">{item.id}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="bg-white text-xs">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-xs text-[var(--color-ink)]">{item.item}</TableCell>
                  <TableCell className="text-xs text-gray-600">{item.brand} • {item.type}</TableCell>
                  <TableCell className="text-xs font-bold text-[#002868]">{item.inStock} Units</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-500">{item.allocated} Units</TableCell>
                  <TableCell className="text-xs font-medium">{item.unitPrice}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline"
                      className={
                        item.inStock > 20
                          ? 'bg-[#002868] text-white border-[#002868] text-xs font-semibold'
                          : item.inStock > 10
                          ? 'bg-amber-100 text-amber-900 border-amber-300 text-xs font-semibold'
                          : 'bg-rose-100 text-rose-900 border-rose-300 text-xs font-semibold'
                      }
                    >
                      {item.inStock > 20 ? 'Optimal' : item.inStock > 10 ? 'Adequate' : 'Low Stock'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
