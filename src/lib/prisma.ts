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
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

pool.on('error', (err) => {
  console.warn('Prisma pg connection warning (handled):', err.message)
})

// Cache in ALL environments — critical for production serverless
// Without this, each Vercel function invocation creates a new Pool,
// quickly exhausting the database connection limit (pool_size: 15)
globalThis.pgPoolGlobal = pool

const adapter = globalThis.adapterGlobal ?? new PrismaPg(pool)

globalThis.adapterGlobal = adapter

const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter })

globalThis.prismaGlobal = prisma

export default prisma


