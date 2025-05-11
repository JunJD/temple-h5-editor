import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadToOSS, deleteFromOSS } from '@/lib/oss'

// 获取图片列表
export async function GET() {
  try {
    // Fetch image metadata, selecting only necessary fields for the list
    const imageMetadatas = await prisma.imageAsset.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        url: true,
      }
    });

    // Transform the data to include a preview URL instead of the direct OSS URL
    const imagesForClient = imageMetadatas.map(meta => {
      // Extract filename from the full URL
      // Assumes URL is like 'https://domain.com/path/to/filename.jpg'
      const filename = meta.url ? meta.url.substring(meta.url.lastIndexOf('/') + 1) : '';
      return {
        id: meta.id, // Keep the original database ID for other potential uses
        name: meta.name,
        createdAt: meta.createdAt,
        url: meta.url, // Keep the original OSS URL as well
        // If you have other fields selected above, map them here too:
        // fileType: meta.fileType,
        previewUrl: filename ? `/api/image-assets/preview/${filename}` : '' // Use filename for preview
      };
    });

    return NextResponse.json(imagesForClient);
  } catch (error) {
    console.error('获取图片列表失败:', error);
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