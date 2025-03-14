import { NextResponse } from 'next/server';
import { getAccessToken, getJsapiTicket, generateSignature } from '@/lib/wechat-api';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 获取微信配置所需的票据
        const jsapiTicket = await getJsapiTicket();
        
        // 生成随机字符串和时间戳
        const nonceStr = Math.random().toString(36).substr(2, 15);
        const timestamp = Math.floor(Date.now() / 1000);
        
        // 生成签名
        const signature = generateSignature(jsapiTicket, nonceStr, timestamp, decodeURIComponent(url));
        
        // 返回JS-SDK配置
        return NextResponse.json({
            appId: process.env.WECHAT_PAY_APP_ID,
            timestamp,
            nonceStr,
            signature
        });
    } catch (error) {
        console.error('获取 JSSDK 配置失败:', error);
        return NextResponse.json({ error: '获取配置失败' }, { status: 500 });
    }
} 