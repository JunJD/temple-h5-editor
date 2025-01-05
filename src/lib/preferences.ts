import { getServerSession } from 'next-auth'
import { prisma } from './prisma'

export async function getUserPreferences() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return null
  }

  try {
    // 先查找现有记录
    let preferences = await prisma.preferences.findFirst({
      where: {
        user_email: session.user.email
      }
    })

    // 如果没有找到，创建新记录
    if (!preferences) {
      try {
        const username = `user_${Math.random().toString(36).slice(2, 8)}`
        
        preferences = await prisma.preferences.create({
          data: {
            user_email: session.user.email,
            user_description: '',
            user_fullname: session.user.name || username,
            user_profile_picture: session.user.image || 'https://avatar.vercel.sh/fallback',
            username: username
          }
        })
        console.log('Created new preferences:', preferences)
      } catch (createError) {
        console.error('Failed to create preferences:', createError)
        throw createError // 重新抛出错误以便上层处理
      }
    }

    return preferences
  } catch (error) {
    console.error('Error in getUserPreferences:', error)
    return null
  }
}
