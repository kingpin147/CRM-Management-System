'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { InventoryCategory, InventoryStatus } from '@prisma/client'

// Default Solar Brands to seed if none exist
const DEFAULT_BRANDS = [
  { name: 'Huawei', category: 'INVERTER', country: 'China' },
  { name: 'Solis', category: 'INVERTER', country: 'China' },
  { name: 'Growatt', category: 'INVERTER', country: 'China' },
  { name: 'GoodWe', category: 'INVERTER', country: 'China' },
  { name: 'Sungrow', category: 'INVERTER', country: 'China' },
  { name: 'Fronius', category: 'INVERTER', country: 'Austria' },
  { name: 'Longi', category: 'SOLAR_PANEL', country: 'China' },
  { name: 'Jinko Solar', category: 'SOLAR_PANEL', country: 'China' },
  { name: 'Canadian Solar', category: 'SOLAR_PANEL', country: 'Canada' },
  { name: 'JA Solar', category: 'SOLAR_PANEL', country: 'China' },
  { name: 'Trina Solar', category: 'SOLAR_PANEL', country: 'China' },
  { name: 'Pylontech', category: 'BATTERY', country: 'China' },
  { name: 'Narada', category: 'BATTERY', country: 'China' },
  { name: 'BYD', category: 'BATTERY', country: 'China' },
  { name: 'Dyness', category: 'BATTERY', country: 'China' },
  { name: 'Schneider', category: 'BREAKER_PROTECTION', country: 'France' },
  { name: 'Chint', category: 'BREAKER_PROTECTION', country: 'China' },
  { name: 'ABB', category: 'BREAKER_PROTECTION', country: 'Switzerland' },
  { name: 'Pakistan Cables', category: 'CABLE_WIRE', country: 'Pakistan' },
  { name: 'Fast Cables', category: 'CABLE_WIRE', country: 'Pakistan' },
  { name: 'Microtech', category: 'METER', country: 'Pakistan' },
  { name: 'Sofar Solar', category: 'METER', country: 'China' },
]

export async function seedDefaultInventoryIfEmpty() {
  try {
    const brandCount = await prisma.inventoryBrand.count()
    if (brandCount === 0) {
      for (const b of DEFAULT_BRANDS) {
        await prisma.inventoryBrand.upsert({
          where: { name: b.name },
          update: {},
          create: b,
        })
      }
    }

    const itemCount = await prisma.inventoryItem.count()
    if (itemCount === 0) {
      const initialItems = [
        {
          sku: 'INV-SOL-6KW-HYB',
          name: 'Solis 6kW Hybrid Inverter S6 Series',
          category: InventoryCategory.INVERTER,
          brand: 'Solis',
          model: 'S6-EH1P6K-L-PRO',
          specifications: '6kW Single-Phase Hybrid, Dual MPPT, IP65, WiFi Logger Included',
          unit: 'Units',
          quantityInStock: 24,
          quantityAllocated: 18,
          minStockAlert: 5,
          unitCost: 340000,
          unitSellingPrice: 380000,
          warehouseLocation: 'Lahore Central - Bay 1A',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'INV-GRO-10KW-ON',
          name: 'Growatt 10kW On-Grid Three-Phase Inverter',
          category: InventoryCategory.INVERTER,
          brand: 'Growatt',
          model: 'MID 10KTL3-X',
          specifications: '10kW Three-Phase OnGrid, Dual MPPT, 98.7% Efficiency, Smart Monitoring',
          unit: 'Units',
          quantityInStock: 15,
          quantityAllocated: 12,
          minStockAlert: 4,
          unitCost: 395000,
          unitSellingPrice: 450000,
          warehouseLocation: 'Lahore Central - Bay 1B',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'INV-HUA-20KW-HYB',
          name: 'Huawei 20kW Three-Phase Smart Inverter',
          category: InventoryCategory.INVERTER,
          brand: 'Huawei',
          model: 'SUN2000-20KTL-M2',
          specifications: '20kW Three-Phase, 4 MPPT, Built-in DC Switch, AI Arc Fault Protection',
          unit: 'Units',
          quantityInStock: 8,
          quantityAllocated: 6,
          minStockAlert: 3,
          unitCost: 740000,
          unitSellingPrice: 820000,
          warehouseLocation: 'Lahore Central - Bay 1C',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'PAN-LON-585W-TOP',
          name: 'Longi 585W Hi-MO 6 Solar Panel',
          category: InventoryCategory.SOLAR_PANEL,
          brand: 'Longi',
          model: 'LR5-72HTH-585M',
          specifications: '585W Monofacial HPBC Cell, Anti-PID, 25-Year Linear Power Warranty',
          unit: 'Panels',
          quantityInStock: 340,
          quantityAllocated: 210,
          minStockAlert: 50,
          unitCost: 21500,
          unitSellingPrice: 24500,
          warehouseLocation: 'Lahore Central - Warehouse Pallet 3-12',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'PAN-JIN-615W-BIF',
          name: 'Jinko 615W Tiger Neo N-Type Bifacial Panel',
          category: InventoryCategory.SOLAR_PANEL,
          brand: 'Jinko Solar',
          model: 'JKM615N-78HL4-BDV',
          specifications: '615W Bifacial Dual Glass N-Type TopCon, Up to 22.8% Module Efficiency',
          unit: 'Panels',
          quantityInStock: 180,
          quantityAllocated: 140,
          minStockAlert: 40,
          unitCost: 23800,
          unitSellingPrice: 27000,
          warehouseLocation: 'Lahore Central - Warehouse Pallet 14-20',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'BAT-PYL-100AH-HV',
          name: 'Pylontech 100Ah Lithium HV Battery Module',
          category: InventoryCategory.BATTERY,
          brand: 'Pylontech',
          model: 'Force-H2 3.55kWh',
          specifications: 'High Voltage LiFePO4 Battery, 95% DoD, 6000+ Cycles @ 25°C',
          unit: 'Units',
          quantityInStock: 18,
          quantityAllocated: 14,
          minStockAlert: 4,
          unitCost: 480000,
          unitSellingPrice: 540000,
          warehouseLocation: 'Lahore Central - Battery Vault A',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'BAT-NAR-200AH-GEL',
          name: 'Narada 200Ah Deep Cycle Gel Battery',
          category: InventoryCategory.BATTERY,
          brand: 'Narada',
          model: '12NDT200',
          specifications: '12V 200Ah Tubular Gel Valve-Regulated Lead-Acid, High Temp Resistant',
          unit: 'Units',
          quantityInStock: 30,
          quantityAllocated: 22,
          minStockAlert: 8,
          unitCost: 125000,
          unitSellingPrice: 145000,
          warehouseLocation: 'Lahore Central - Battery Vault B',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'MET-GRN-3PH-BI',
          name: '3-Phase Bi-Directional Green Meter (DISCO Certified)',
          category: InventoryCategory.METER,
          brand: 'Microtech',
          model: 'MT-3000-ND',
          specifications: 'Class 1.0 accuracy, 3x240/415V Net Metering with Optical Port & GSM Modem',
          unit: 'Units',
          quantityInStock: 45,
          quantityAllocated: 38,
          minStockAlert: 10,
          unitCost: 52000,
          unitSellingPrice: 65000,
          warehouseLocation: 'Lahore Central - Secured Room S-1',
          status: InventoryStatus.ACTIVE,
        },
        {
          sku: 'ACC-ZERO-EXP-50A',
          name: 'Zero Export Limiter Device 50A',
          category: InventoryCategory.ACCESSORY,
          brand: 'Sofar Solar',
          model: 'ARU-50-3P',
          specifications: 'Smart CT Meter for Non-Green / Pre-Net-Metering anti-backfeed protection',
          unit: 'Units',
          quantityInStock: 22,
          quantityAllocated: 16,
          minStockAlert: 5,
          unitCost: 28000,
          unitSellingPrice: 35000,
          warehouseLocation: 'Lahore Central - Shelf E-3',
          status: InventoryStatus.ACTIVE,
        },
      ]

      for (const item of initialItems) {
        const created = await prisma.inventoryItem.create({
          data: item,
        })
        await prisma.inventoryStockLog.create({
          data: {
            itemId: created.id,
            changeType: 'INITIAL_STOCK',
            quantity: created.quantityInStock,
            previousQty: 0,
            newQty: created.quantityInStock,
            reference: 'SYSTEM-SETUP',
            notes: 'Initial opening stock intake',
            performedBy: 'System Admin',
          }
        })
      }
    }
  } catch (err) {
    console.error('Error seeding inventory data:', err)
  }
}

// 1. Create Product
export async function createInventoryItem(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const performedBy = user?.email || 'Admin'

    const sku = (formData.get('sku') as string)?.trim().toUpperCase()
    const name = (formData.get('name') as string)?.trim()
    const category = formData.get('category') as InventoryCategory
    const brand = (formData.get('brand') as string)?.trim()
    const model = (formData.get('model') as string)?.trim() || null
    const specifications = (formData.get('specifications') as string)?.trim() || null
    const unit = (formData.get('unit') as string)?.trim() || 'Units'
    const quantityInStock = Math.max(0, parseInt(formData.get('quantityInStock') as string || '0', 10))
    const minStockAlert = Math.max(1, parseInt(formData.get('minStockAlert') as string || '5', 10))
    const unitCost = parseFloat(formData.get('unitCost') as string || '0')
    const unitSellingPrice = parseFloat(formData.get('unitSellingPrice') as string || '0')
    const warehouseLocation = (formData.get('warehouseLocation') as string)?.trim() || null

    if (!sku || !name || !category || !brand) {
      return { error: 'SKU, Product Name, Category, and Brand are required.' }
    }

    // Check SKU unique
    const existingSku = await prisma.inventoryItem.findUnique({
      where: { sku }
    })
    if (existingSku) {
      return { error: `An inventory product with SKU "${sku}" already exists.` }
    }

    // Ensure brand exists in brands list
    await prisma.inventoryBrand.upsert({
      where: { name: brand },
      update: {},
      create: { name: brand, category: category }
    })

    const status = quantityInStock === 0 ? InventoryStatus.OUT_OF_STOCK : (quantityInStock <= minStockAlert ? InventoryStatus.LOW_STOCK : InventoryStatus.ACTIVE)

    const newItem = await prisma.inventoryItem.create({
      data: {
        sku,
        name,
        category,
        brand,
        model,
        specifications,
        unit,
        quantityInStock,
        quantityAllocated: 0,
        minStockAlert,
        unitCost,
        unitSellingPrice,
        warehouseLocation,
        status,
      }
    })

    if (quantityInStock > 0) {
      await prisma.inventoryStockLog.create({
        data: {
          itemId: newItem.id,
          changeType: 'INITIAL_STOCK',
          quantity: quantityInStock,
          previousQty: 0,
          newQty: quantityInStock,
          reference: 'INITIAL-CREATION',
          notes: 'Initial inventory intake',
          performedBy,
        }
      })
    }

    revalidatePath('/dashboard/service-delivery/inventory')
    return { success: true, item: newItem }
  } catch (err: any) {
    console.error('Error creating inventory item:', err)
    return { error: err.message || 'Failed to create inventory item.' }
  }
}

// 2. Update Product
export async function updateInventoryItem(formData: FormData) {
  try {
    const id = formData.get('id') as string
    if (!id) return { error: 'Item ID is required.' }

    const sku = (formData.get('sku') as string)?.trim().toUpperCase()
    const name = (formData.get('name') as string)?.trim()
    const category = formData.get('category') as InventoryCategory
    const brand = (formData.get('brand') as string)?.trim()
    const model = (formData.get('model') as string)?.trim() || null
    const specifications = (formData.get('specifications') as string)?.trim() || null
    const unit = (formData.get('unit') as string)?.trim() || 'Units'
    const minStockAlert = Math.max(1, parseInt(formData.get('minStockAlert') as string || '5', 10))
    const unitCost = parseFloat(formData.get('unitCost') as string || '0')
    const unitSellingPrice = parseFloat(formData.get('unitSellingPrice') as string || '0')
    const warehouseLocation = (formData.get('warehouseLocation') as string)?.trim() || null
    const statusVal = formData.get('status') as InventoryStatus

    if (!sku || !name || !category || !brand) {
      return { error: 'SKU, Product Name, Category, and Brand are required.' }
    }

    // Check SKU conflict with another record
    const existingSku = await prisma.inventoryItem.findFirst({
      where: { sku, NOT: { id } }
    })
    if (existingSku) {
      return { error: `SKU "${sku}" is already assigned to another item.` }
    }

    // Ensure brand is saved
    await prisma.inventoryBrand.upsert({
      where: { name: brand },
      update: {},
      create: { name: brand, category: category }
    })

    const currentItem = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!currentItem) return { error: 'Item not found.' }

    let status = statusVal || currentItem.status
    if (currentItem.quantityInStock === 0 && status !== InventoryStatus.DISCONTINUED) {
      status = InventoryStatus.OUT_OF_STOCK
    } else if (currentItem.quantityInStock <= minStockAlert && status !== InventoryStatus.DISCONTINUED) {
      status = InventoryStatus.LOW_STOCK
    } else if (status !== InventoryStatus.DISCONTINUED) {
      status = InventoryStatus.ACTIVE
    }

    await prisma.inventoryItem.update({
      where: { id },
      data: {
        sku,
        name,
        category,
        brand,
        model,
        specifications,
        unit,
        minStockAlert,
        unitCost,
        unitSellingPrice,
        warehouseLocation,
        status,
      }
    })

    revalidatePath('/dashboard/service-delivery/inventory')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating inventory item:', err)
    return { error: err.message || 'Failed to update inventory item.' }
  }
}

// 3. Delete Product
export async function deleteInventoryItem(id: string) {
  try {
    if (!id) return { error: 'Item ID is required.' }

    await prisma.inventoryItem.delete({
      where: { id }
    })

    revalidatePath('/dashboard/service-delivery/inventory')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting inventory item:', err)
    return { error: err.message || 'Failed to delete inventory item.' }
  }
}

// 4. Adjust Stock (Stock In / Stock Out / Allocation)
export async function adjustStockQuantity(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const performedBy = user?.email || 'Admin'

    const itemId = formData.get('itemId') as string
    const changeType = formData.get('changeType') as string // 'STOCK_IN' | 'STOCK_OUT' | 'ALLOCATE' | 'DEALLOCATE' | 'ADJUST'
    const qtyChange = parseInt(formData.get('quantity') as string || '0', 10)
    const reference = (formData.get('reference') as string)?.trim() || null
    const notes = (formData.get('notes') as string)?.trim() || null

    if (!itemId || isNaN(qtyChange) || qtyChange <= 0) {
      return { error: 'Valid item and positive quantity are required.' }
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } })
    if (!item) return { error: 'Item not found.' }

    let newStock = item.quantityInStock
    let newAllocated = item.quantityAllocated

    if (changeType === 'STOCK_IN') {
      newStock += qtyChange
    } else if (changeType === 'STOCK_OUT') {
      if (item.quantityInStock < qtyChange) {
        return { error: `Insufficient stock! Current stock is ${item.quantityInStock} ${item.unit}.` }
      }
      newStock -= qtyChange
    } else if (changeType === 'ALLOCATE') {
      if (item.quantityInStock < qtyChange) {
        return { error: `Cannot allocate more than available stock (${item.quantityInStock} ${item.unit}).` }
      }
      newAllocated += qtyChange
    } else if (changeType === 'DEALLOCATE') {
      newAllocated = Math.max(0, newAllocated - qtyChange)
    } else if (changeType === 'ADJUST') {
      const targetStock = parseInt(formData.get('targetStock') as string || '0', 10)
      newStock = Math.max(0, targetStock)
    }

    let newStatus = item.status
    if (newStock === 0 && item.status !== InventoryStatus.DISCONTINUED) {
      newStatus = InventoryStatus.OUT_OF_STOCK
    } else if (newStock <= item.minStockAlert && item.status !== InventoryStatus.DISCONTINUED) {
      newStatus = InventoryStatus.LOW_STOCK
    } else if (item.status !== InventoryStatus.DISCONTINUED) {
      newStatus = InventoryStatus.ACTIVE
    }

    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantityInStock: newStock,
        quantityAllocated: newAllocated,
        status: newStatus,
      }
    })

    await prisma.inventoryStockLog.create({
      data: {
        itemId,
        changeType,
        quantity: qtyChange,
        previousQty: item.quantityInStock,
        newQty: newStock,
        reference,
        notes,
        performedBy,
      }
    })

    revalidatePath('/dashboard/service-delivery/inventory')
    return { success: true, newStock, newAllocated }
  } catch (err: any) {
    console.error('Error adjusting stock:', err)
    return { error: err.message || 'Failed to adjust stock.' }
  }
}

// 5. Add Custom Brand
export async function createCustomBrand(name: string, category?: string) {
  try {
    const cleanName = name.trim()
    if (!cleanName) return { error: 'Brand name is required.' }

    const brand = await prisma.inventoryBrand.upsert({
      where: { name: cleanName },
      update: { category: category || undefined },
      create: { name: cleanName, category: category || 'SOLAR' }
    })

    revalidatePath('/dashboard/service-delivery/inventory')
    return { success: true, brand }
  } catch (err: any) {
    console.error('Error creating brand:', err)
    return { error: err.message || 'Failed to add custom brand.' }
  }
}

// 6. Get Item History Logs
export async function getItemStockLogs(itemId: string) {
  try {
    const logs = await prisma.inventoryStockLog.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    })
    return { success: true, logs }
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch stock logs.' }
  }
}
