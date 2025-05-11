import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fetch from 'node-fetch'; // 需要安装 node-fetch

// GET /api/image-assets/preview/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filename = params.id;

    if (!filename) {
      return NextResponse.json(
        { error: '缺少图片文件名' },
        { status: 400 }
      );
    }

    // 1. 从数据库获取图片信息，通过文件名匹配 URL
    const image = await prisma.imageAsset.findFirst({
      where: {
        // Assuming the filename in the DB URL is unique
        // If not, you might need a more robust way to ensure you get the correct image
        url: {
          endsWith: filename,
        },
      },
    });

    if (!image || !image.url) {
      return NextResponse.json(
        { error: '图片不存在或URL无效' },
        { status: 404 }
      );
    }

    // 2. 从 OSS 获取图片数据
    // 注意：这里的 fetch 需要能处理流式响应，或者根据你的 OSS SDK 进行调整
    // 如果你的 OSS SDK 提供了直接获取可读流的方法，那会更好
    const ossResponse = await fetch(image.url);

    if (!ossResponse.ok) {
      console.error(`从 OSS 获取图片失败: ${image.url}`, ossResponse.status, await ossResponse.text());
      return NextResponse.json(
        { error: '获取图片资源失败' },
        { status: ossResponse.status }
      );
    }

    // 3. 将 OSS 的响应作为 Next.js 的响应返回
    // 获取 content-type，如果 OSS 响应头里有的话
    const contentType = ossResponse.headers.get('content-type') || 'application/octet-stream';
    // 获取 content-length，如果 OSS 响应头里有的话
    const contentLength = ossResponse.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    // 你可能还想设置 Cache-Control 等头部
    // headers.set('Cache-Control', 'public, max-age=31536000, immutable');


    // 将 ReadableStream 从 node-fetch 转换为 Next.js 可用的 ReadableStream
    // 这部分可能需要根据你的具体环境和 Next.js 版本进行调整
    // 对于 Next.js 13+ App Router，可以直接返回 ReadableStream
    const imageStream = ossResponse.body as unknown as ReadableStream;


    return new NextResponse(imageStream, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('处理图片预览请求失败:', error);
    return NextResponse.json(
      { error: '图片预览失败' },
      { status: 500 }
    );
  }
} 