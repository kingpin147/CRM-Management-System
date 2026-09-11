const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function cleanCustomerData() {
  console.log('--- STARTING SAFE TEST CUSTOMER DATA CLEANUP ---')
  console.log('NOTE: All User accounts and passwords will remain 100% untouched.\n')

  const initialUserCount = await prisma.user.count()
  console.log(`Current User accounts count (to preserve): ${initialUserCount}`)

  // 1. Delete Communication Logs
  const deletedCommLogs = await prisma.communicationLog.deleteMany({})
  console.log(`✓ Cleared Communication Logs: ${deletedCommLogs.count}`)

  // 2. Delete Customer History
  const deletedCustHistory = await prisma.customerHistory.deleteMany({})
  console.log(`✓ Cleared Customer History: ${deletedCustHistory.count}`)

  // 3. Delete Ticket History
  const deletedTicketHistory = await prisma.ticketHistory.deleteMany({})
  console.log(`✓ Cleared Ticket History: ${deletedTicketHistory.count}`)

  // 4. Delete Tickets / Complaints
  const deletedTickets = await prisma.ticket.deleteMany({})
  console.log(`✓ Cleared Tickets / Complaints: ${deletedTickets.count}`)

  // 5. Delete Ledger Entries
  const deletedLedger = await prisma.ledgerEntry.deleteMany({})
  console.log(`✓ Cleared Ledger Entries: ${deletedLedger.count}`)

  // 6. Delete Invoices
  const deletedInvoices = await prisma.invoice.deleteMany({})
  console.log(`✓ Cleared Invoices: ${deletedInvoices.count}`)

  // 7. Delete Transactions
  const deletedTransactions = await prisma.transaction.deleteMany({})
  console.log(`✓ Cleared Transactions: ${deletedTransactions.count}`)

  // 8. Delete Solar Systems
  const deletedSolar = await prisma.solarSystem.deleteMany({})
  console.log(`✓ Cleared Solar System specs: ${deletedSolar.count}`)

  // 9. Delete Package Plans
  const deletedPackages = await prisma.packagePlan.deleteMany({})
  console.log(`✓ Cleared Package Plans: ${deletedPackages.count}`)

  // 10. Delete Customers
  const deletedCustomers = await prisma.customer.deleteMany({})
  console.log(`✓ Cleared Customers: ${deletedCustomers.count}`)

  // Verify users
  const finalUserCount = await prisma.user.count()
  console.log(`\nFinal verification:`)
  console.log(`User accounts preserved: ${finalUserCount} (Initial: ${initialUserCount})`)
  console.log(`Customer count: ${await prisma.customer.count()}`)
  console.log(`Ticket count: ${await prisma.ticket.count()}`)
  console.log(`Invoice count: ${await prisma.invoice.count()}`)
  console.log(`Ledger entry count: ${await prisma.ledgerEntry.count()}`)
  console.log('\n--- DATA CLEANUP COMPLETED SUCCESSFULLY ---')
}

cleanCustomerData()
  .catch(err => {
    console.error('Error during cleanup:', err)
  })
  .finally(() => pool.end())
