import { NextResponse } from 'next/server';
import { getAccessToken, getJsapiTicket, generateSignature } from '@/lib/wechat-api';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const encodedUrlFromQuery = searchParams.get('url'); // 获取编码后的 URL

        if (!encodedUrlFromQuery) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // const decodedUrl = decodeURIComponent(encodedUrlFromQuery); // 不再解码 URL
        console.log('>>>>> Backend received URL (encoded):', encodedUrlFromQuery); // 记录编码后的 URL

        const jsapiTicket = await getJsapiTicket();
        const nonceStr = Math.random().toString(36).substr(2, 15);
        const timestamp = Math.floor(Date.now() / 1000);

        // 使用从前端接收到的、未解码的 URL 生成签名
        const signature = generateSignature(jsapiTicket, nonceStr, timestamp, encodedUrlFromQuery);
        console.log('>>>>> Backend URL used for signature (should be encoded):', encodedUrlFromQuery); // 确认使用未解码的 URL

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