import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadToOSS, deleteFromOSS } from '@/lib/oss'

// 获取音频列表
export async function GET() {
  try {
    const audioAssets = await prisma.audioAsset.findMany({
      orderBy: {
        createdAt: 'desc'
      },
    });

    return NextResponse.json(audioAssets);
  } catch (error) {
    console.error('获取音频列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取音频列表失败' },
      { status: 500 }
    )
  }
}

// 上传音频
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string

    if (!file || !name) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
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
    const audio = await prisma.audioAsset.create({
      data: {
        name,
        url
      }
    })

    return NextResponse.json(audio)
  } catch (error) {
    console.error('上传音频失败:', error)
    return NextResponse.json(
      { success: false, message: '上传音频失败' },
      { status: 500 }
    )
  }
}

// 删除音频
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少音频 ID' },
        { status: 400 }
      )
    }

    // 获取音频信息
    const audio = await prisma.audioAsset.findUnique({
      where: { id }
    })

    if (!audio) {
      return NextResponse.json(
        { success: false, message: '音频不存在' },
        { status: 404 }
      )
    }

    // 从 OSS 删除
    await deleteFromOSS(audio.url)

    // 从数据库删除
    await prisma.audioAsset.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除音频失败:', error)
    return NextResponse.json(
      { success: false, message: '删除音频失败' },
      { status: 500 }
    )
  }
} 