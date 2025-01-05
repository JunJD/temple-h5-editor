import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

// 添加连接检查函数
export async function checkDatabaseConnection() {
  try {
    // 先尝试连接
    await prisma.$connect()
    
    // 然后执行 ping 命令
    await prisma.$runCommandRaw({ ping: 1 })
    
    console.log('✅ Successfully connected to MongoDB')
    console.log('📌 Connection URL:', process.env.MONGO_URI)
    return true
  } catch (error) {
    console.error('❌ MongoDB connection error')
    console.error('📌 Connection URL:', process.env.MONGO_URI)
    console.error('🔍 Error details:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// 在开发环境中自动检查连接
if (process.env.NODE_ENV !== 'production') {
  checkDatabaseConnection()
}
