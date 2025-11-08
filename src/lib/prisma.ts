import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

// 添加连接检查函数
export async function checkDatabaseConnection() {
  try {
    // 先尝试连接（如果已连接则不会重复连接）
    await prisma.$connect()
    
    // 然后执行 ping 命令检查连接状态
    await prisma.$runCommandRaw({ ping: 1 })
    
    console.log('✅ Successfully connected to MongoDB')
    console.log('📌 Connection URL:', process.env.MONGO_URI)
    return true
  } catch (error) {
    console.error('❌ MongoDB connection error')
    console.error('📌 Connection URL:', process.env.MONGO_URI)
    console.error('🔍 Error details:', error)
    return false
  }
  // 注意：不要在这里调用 $disconnect()
  // Prisma Client 在 Next.js 中应该保持连接，让连接池自己管理
}
