import axios from 'axios'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 检查是否是预览路径
  if (request.nextUrl.pathname.startsWith('/h5/')) {
    const nextUrl = request.nextUrl
    // 从路径中提取 ID
    const id = nextUrl.pathname.replace('/h5/', '')
    // 获取预览参数
    const searchParams = request.nextUrl.searchParams
    const preview = searchParams.get('preview')

    // 检查是否在微信浏览器中
    const userAgent = request.headers.get('user-agent') || ''
    const isWeixinBrowser = /MicroMessenger/i.test(userAgent)

    // 如果是微信浏览器且没有 openid
    if (isWeixinBrowser && !nextUrl.searchParams.has('openid')) {
      // 使用实际的域名
      const currentPath = request.nextUrl.pathname + request.nextUrl.search
      const targetUrl = `${process.env.NEXTAUTH_URL}${currentPath}`
      
      // 构建微信授权URL
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${
        process.env.WECHAT_PAY_APP_ID
      }&redirect_uri=${encodeURIComponent(
        process.env.NEXTAUTH_URL + '/api/wechat/auth'
      )}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(
        targetUrl
      )}#wechat_redirect`
      
      console.log('Redirecting to auth URL:', authUrl)
      return NextResponse.redirect(authUrl)
    }

    // 如果已经有openid或不是微信浏览器，继续处理
    const url = new URL(`/api/preview/${id}`, process.env.NEXTAUTH_URL)
    if (preview) {
      url.searchParams.set('preview', preview)
    }
    // 如果有openid，保留它
    const openid = nextUrl.searchParams.get('openid')
    if (openid) {
      url.searchParams.set('openid', openid)
    }
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // 只匹配 /h5/* 路径
  matcher: '/h5/:id*'
} 
