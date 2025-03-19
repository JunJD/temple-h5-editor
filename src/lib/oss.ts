import OSS from 'ali-oss'

// 检查环境变量
const accessKeyId = process.env.ALIYUN_OSS_ACCESS_KEY_ID
const accessKeySecret = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET
const bucket = process.env.ALIYUN_OSS_BUCKET
const region = process.env.ALIYUN_OSS_REGION

if (!accessKeyId || !accessKeySecret || !bucket || !region) {
  console.error('阿里云 OSS 配置缺失:', {
    accessKeyId: !!accessKeyId,
    accessKeySecret: !!accessKeySecret,
    bucket: !!bucket,
    region: !!region
  })
  throw new Error('阿里云 OSS 配置不完整')
}

// 创建 OSS 客户端
const client = new OSS({
  accessKeyId,
  accessKeySecret,
  bucket,
  region,
})

// 生成唯一的文件名
const generateUniqueFileName = (originalName: string) => {
  const ext = originalName.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}.${ext}`
}

// 上传文件到 OSS
export const uploadToOSS = async (file: Buffer, fileName: string) => {
  try {
    console.log('开始上传文件到 OSS:', {
      fileName,
      fileSize: file.length,
      bucket,
      region
    })
    
    const result = await client.put(fileName, file)
    console.log('文件上传成功:', result)
    return result.url
  } catch (error) {
    console.error('上传到 OSS 失败:', error)
    throw error
  }
}

// 从 OSS 删除文件
export const deleteFromOSS = async (url: string) => {
  try {
    // 从 URL 中提取文件名
    const fileName = url.split('/').pop()
    if (!fileName) throw new Error('无效的文件 URL')
    
    console.log('开始从 OSS 删除文件:', fileName)
    await client.delete(fileName)
    console.log('文件删除成功')
  } catch (error) {
    console.error('从 OSS 删除文件失败:', error)
    throw error
  }
} 