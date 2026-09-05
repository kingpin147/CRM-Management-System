import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DIRECT_URL || process.env.DATABASE_URL}`

declare const globalThis: {
  prismaGlobal?: PrismaClient;
  pgPoolGlobal?: Pool;
  adapterGlobal?: PrismaPg;
} & typeof global;

const pool = globalThis.pgPoolGlobal ?? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

pool.on('error', (err) => {
  console.warn('Prisma pg connection warning (handled):', err.message)
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPoolGlobal = pool
}

const adapter = globalThis.adapterGlobal ?? new PrismaPg(pool)

if (process.env.NODE_ENV !== 'production') {
  globalThis.adapterGlobal = adapter
}

const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma


