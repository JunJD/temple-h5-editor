import axios from 'axios'

export class WechatAuth {
    private static instance: WechatAuth
    private constructor() { }

    static getInstance(): WechatAuth {
        if (!WechatAuth.instance) {
            WechatAuth.instance = new WechatAuth()
        }
        return WechatAuth.instance
    }

    // 生成授权URL
    generateAuthUrl(redirectUrl: string, state: string = ''): string {
        const appId = process.env.WECHAT_PAY_APP_ID
        const encodedRedirectUrl = encodeURIComponent(redirectUrl)

        return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUrl}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`
    }

    // 使用code获取openid
    async getOpenid(code: string): Promise<string> {
        const appId = process.env.WECHAT_PAY_APP_ID
        const appSecret = process.env.WECHAT_APP_SECRET

        try {
            const response = await axios.get(
                `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
            )

            if (response.data.errcode) {
                throw new Error(`Failed to get openid: ${response.data.errmsg}`)
            }

            return response.data.openid
        } catch (error) {
            console.error('Get openid failed:', error)
            throw error
        }
    }
} 