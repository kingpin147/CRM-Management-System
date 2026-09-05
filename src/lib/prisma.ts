import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

declare const globalThis: {
  prismaGlobal?: PrismaClient;
  pgPoolGlobal?: Pool;
} & typeof global;

const pool = globalThis.pgPoolGlobal ?? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => {
  console.warn('Prisma pg connection warning:', err.message)
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPoolGlobal = pool
}

const adapter = new PrismaPg(pool)

const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma


