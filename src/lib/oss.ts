import OSS from 'ali-oss'

// 检查环境变量
const accessKeyId = process.env.ALIYUN_OSS_ACCESS_KEY_ID
const accessKeySecret = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET
const bucket = process.env.ALIYUN_OSS_BUCKET
const regionRaw = process.env.ALIYUN_OSS_REGION
// ali-oss 需要形如 oss-cn-beijing，若传入 cn-beijing 则自动补全前缀
const region = regionRaw && regionRaw.startsWith('oss-') ? regionRaw : (regionRaw ? `oss-${regionRaw}` : regionRaw)

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

// 公开：获取底层 OSS 客户端（用于脚本）
export const getOSSClient = () => client

// 检查对象是否存在
export const objectExists = async (key: string) => {
  try {
    await client.head(key)
    return true
  } catch (err: any) {
    // 404 不存在
    if (err?.name === 'NoSuchKeyError' || err?.status === 404) return false
    // 其他错误按不存在处理，但打印日志
    console.warn('OSS head error (treat as not exists):', err?.message || err)
    return false
  }
}
