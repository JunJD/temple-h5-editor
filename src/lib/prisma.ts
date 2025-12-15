import { PrismaClient } from '@prisma/client'

// Reuse a single PrismaClient in dev to avoid exhausting connections
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Optional connectivity check that does NOT touch the shared client
export async function checkDatabaseConnection() {
  const testClient = new PrismaClient()
  try {
    await testClient.$connect()
    await testClient.$runCommandRaw({ ping: 1 })
    console.log('✅ Successfully connected to MongoDB')
    return true
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    return false
  } finally {
    await testClient.$disconnect()
  }
}
