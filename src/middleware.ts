import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查是否是预览路径
  if (request.nextUrl.pathname.startsWith('/h5/')) {
    // 从路径中提取 ID
    const id = request.nextUrl.pathname.replace('/h5/', '')
    
    // 获取预览参数
    const searchParams = request.nextUrl.searchParams
    const preview = searchParams.get('preview')
    
    // 构建新的 URL，保留预览参数
    const url = new URL(`/api/preview/${id}`, request.url)
    if (preview) {
      url.searchParams.set('preview', preview)
    }
    
    // 重定向到预览 API
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // 只匹配 /h5/* 路径
  matcher: '/h5/:id*'
} 