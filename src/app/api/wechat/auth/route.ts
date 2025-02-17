import { NextResponse } from 'next/server';
import axios from 'axios';

class WechatAuthService {
    private static instance: WechatAuthService;
    private constructor() { }

    static getInstance(): WechatAuthService {
        if (!WechatAuthService.instance) {
            WechatAuthService.instance = new WechatAuthService();
        }
        return WechatAuthService.instance;
    }

    // 生成授权URL
    generateAuthUrl(redirectUrl: string, state: string = ''): string {
        const appId = process.env.WECHAT_PAY_APP_ID;
        const encodedRedirectUrl = encodeURIComponent(redirectUrl);

        return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUrl}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
    }

    // 使用code获取openid
    async getOpenid(code: string): Promise<string> {
        const appId = process.env.WECHAT_PAY_APP_ID;
        const appSecret = process.env.WECHAT_APP_SECRET;

        try {
            const response = await axios.get(
                `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
            );

            if (response.data.errcode) {
                throw new Error(`Failed to get openid: ${response.data.errmsg}`);
            }

            return response.data.openid;
        } catch (error) {
            console.error('Get openid failed:', error);
            throw error;
        }
    }
}

// 导出 GET 处理函数
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // state 参数中包含了原始URL

    try {
        const wechatAuth = WechatAuthService.getInstance();

        if (code) {
            // 获取 openid
            const openid = await wechatAuth.getOpenid(code);
            
            // 解码原始URL并添加openid参数
            const originalUrl = decodeURIComponent(state || '');
            const redirectUrl = new URL(originalUrl);
            redirectUrl.searchParams.set('openid', openid);
            
            // 重定向回原始页面，带上openid
            return NextResponse.redirect(redirectUrl.toString());
        } else {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }
    } catch (error) {
        console.error('微信认证错误:', error);
        return NextResponse.json(
            { error: '微信认证失败，请稍后重试' },
            { status: 500 }
        );
    }
} 