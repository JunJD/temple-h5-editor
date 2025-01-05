import { PrismaClient } from '@prisma/client'

export async function checkDatabaseConnection() {
  const prisma = new PrismaClient()
  try {
    console.log('正在连接数据库...')
    await prisma.$connect()
    console.log('数据库连接成功，开始测试写入...')
    
    // 测试写入操作
    const testWrite = await prisma.preferences.create({
      data: {
        user_email: `test${Date.now()}@example.com`, // 使用时间戳确保唯一性
        user_fullname: "Test User",
        user_profile_picture: "https://example.com/avatar.png",
        username: `testuser_${Date.now()}`, // 使用时间戳确保唯一性
        user_description: "Test description"
      }
    })
    
    console.log('✅ 数据库连接和写入测试成功', testWrite)
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('❌ 数据库测试失败:', error)
    if (error instanceof Error) {
      console.error('错误详情:', error.message)
      console.error('错误堆栈:', error.stack)
    }
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
checkDatabaseConnection()
  .then(success => {
    if (!success) {
      console.log('数据库测试失败，请检查配置')
      process.exit(1)
    }
  }) 