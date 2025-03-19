import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadToOSS, deleteFromOSS } from '@/lib/oss'

// 获取图片列表
export async function GET() {
  try {
    const images = await prisma.imageAsset.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(images)
  } catch (error) {
    console.error('获取图片列表失败:', error)
    return NextResponse.json(
      { error: '获取图片列表失败' },
      { status: 500 }
    )
  }
}

// 上传图片
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string

    if (!file || !name) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 将 File 对象转换为 Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${file.name.split('.').pop()}`

    // 上传到 OSS
    const url = await uploadToOSS(buffer, fileName)

    // 保存到数据库
    const image = await prisma.imageAsset.create({
      data: {
        name,
        url
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('上传图片失败:', error)
    return NextResponse.json(
      { error: '上传图片失败' },
      { status: 500 }
    )
  }
}

// 删除图片
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少图片 ID' },
        { status: 400 }
      )
    }

    // 获取图片信息
    const image = await prisma.imageAsset.findUnique({
      where: { id }
    })

    if (!image) {
      return NextResponse.json(
        { error: '图片不存在' },
        { status: 404 }
      )
    }

    // 从 OSS 删除
    await deleteFromOSS(image.url)

    // 从数据库删除
    await prisma.imageAsset.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除图片失败:', error)
    return NextResponse.json(
      { error: '删除图片失败' },
      { status: 500 }
    )
  }
} 