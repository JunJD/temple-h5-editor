import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';

// 缓存 access_token 和 jsapi_ticket
let accessTokenCache = {
    token: '',
    expires: 0
};

let jsapiTicketCache = {
    ticket: '',
    expires: 0
};

// 获取 access_token
async function getAccessToken() {
    // 如果缓存的 token 还有效，直接返回
    if (accessTokenCache.token && accessTokenCache.expires > Date.now()) {
        return accessTokenCache.token;
    }

    const appId = process.env.WECHAT_PAY_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    
    const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    
    if (response.data.access_token) {
        // 缓存 token，设置过期时间为 7000 秒（微信的过期时间是 7200 秒）
        accessTokenCache = {
            token: response.data.access_token,
            expires: Date.now() + 7000000
        };
        return response.data.access_token;
    }
    throw new Error('Failed to get access_token');
}

// 获取 jsapi_ticket
async function getJsapiTicket(accessToken: string) {
    // 如果缓存的 ticket 还有效，直接返回
    if (jsapiTicketCache.ticket && jsapiTicketCache.expires > Date.now()) {
        return jsapiTicketCache.ticket;
    }

    const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
    );
    
    if (response.data.ticket) {
        // 缓存 ticket，设置过期时间为 7000 秒
        jsapiTicketCache = {
            ticket: response.data.ticket,
            expires: Date.now() + 7000000
        };
        return response.data.ticket;
    }
    throw new Error('Failed to get jsapi_ticket');
}

// 生成签名
function generateSignature(jsapiTicket: string, noncestr: string, timestamp: number, url: string) {
    const string1 = `jsapi_ticket=${jsapiTicket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
    return crypto.createHash('sha1').update(string1).digest('hex');
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const accessToken = await getAccessToken();
        const jsapiTicket = await getJsapiTicket(accessToken);
        
        const nonceStr = Math.random().toString(36).substr(2, 15);
        const timestamp = Math.floor(Date.now() / 1000);
        
        const signature = generateSignature(jsapiTicket, nonceStr, timestamp, decodeURIComponent(url));
        
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
