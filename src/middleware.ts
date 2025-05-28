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
      
      // 创建重定向响应并保留原始请求头
      const response = NextResponse.redirect(authUrl)
      
      // 保留关键请求头
      const headersToKeep = [
        'x-real-ip',
        'x-forwarded-for',
        'x-forwarded-proto',
        'x-forwarded-host',
        'x-forwarded-port',
        'x-original-uri',
        'x-original-host',
        'origin',
        'referer',
        'user-agent'
      ]

      headersToKeep.forEach(header => {
        const value = request.headers.get(header)
        if (value) {
          response.headers.set(header, value)
        }
      })

      return response
    }

    // 如果已经有openid或不是微信浏览器，继续处理
    const url = new URL(`/api/preview/${id}`, request.nextUrl.origin)
    if (preview) {
      url.searchParams.set('preview', preview)
    }
    // 如果有openid，保留它
    const openid = nextUrl.searchParams.get('openid')
    if (openid) {
      url.searchParams.set('openid', openid)
    }

    // 创建重写响应并保留所有相关的请求头
    const response = NextResponse.rewrite(url)
    
    // 确保设置正确的origin和其他关键头信息
    response.headers.set('x-middleware-rewrite', url.toString())
    response.headers.set('x-original-url', request.url)
    
    // 从原始请求复制所有请求头
    request.headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    // 特别确保设置这些关键头信息
    response.headers.set('origin', process.env.NEXTAUTH_URL || request.headers.get('origin') || '')
    response.headers.set('next-action', 'rewrite')

    return response
  }

  // 测试
  if (request.nextUrl.pathname.startsWith('/h6/')) {
    const nextUrl = request.nextUrl
    const response = NextResponse.redirect("https://baidu.com")
      
      // 保留关键请求头
      const headersToKeep = [
        'x-real-ip',
        'x-forwarded-for',
        'x-forwarded-proto',
        'x-forwarded-host',
        'x-forwarded-port',
        'x-original-uri',
        'x-original-host',
        'origin',
        'referer',
        'user-agent'
      ]

      headersToKeep.forEach(header => {
        const value = request.headers.get(header)
        if (value) {
          response.headers.set(header, value)
        }
      })
    return response
  }

  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export const config = {
  // 只匹配 /h5/* 路径
  matcher: '/(h5|h6)/:id*'
} 
