import prisma from '@/lib/prisma'
import { seedDefaultInventoryIfEmpty } from './actions'
import { InventoryClientView } from './InventoryClientView'

export const dynamic = 'force-dynamic'

export default async function InventoryManagementPage() {
  // Ensure default brands and initial items exist
  await seedDefaultInventoryIfEmpty()

  // Fetch all items from Prisma database
  const rawItems = await prisma.inventoryItem.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Fetch all brands
  const brands = await prisma.inventoryBrand.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, category: true },
  })

  // Fetch total commissioned solar systems count
  const totalSystems = await prisma.solarSystem.count()

  // Convert Decimals to numbers/strings for client component
  const items = JSON.parse(JSON.stringify(rawItems))

  return (
    <InventoryClientView
      initialItems={items}
      brands={brands}
      totalInstalledSystems={totalSystems}
    />
  )
}
