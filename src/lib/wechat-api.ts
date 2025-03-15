import axios from 'axios';

// 缓存 access_token
let accessTokenCache = {
    token: '',
    expires: 0
};

// 缓存 jsapi_ticket
let jsapiTicketCache = {
    ticket: '',
    expires: 0
};

/**
 * 获取微信全局 access_token
 * 该token用于调用微信公众号的各种接口
 */
export async function getAccessToken() {
    // 如果缓存的 token 还有效，直接返回
    if (accessTokenCache.token && accessTokenCache.expires > Date.now()) {
        return accessTokenCache.token;
    }

    const appId = process.env.WECHAT_PAY_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    
    try {
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
        throw new Error('获取 access_token 失败: ' + JSON.stringify(response.data));
    } catch (error) {
        console.error('获取 access_token 出错:', error);
        throw error;
    }
}

/**
 * 获取 jsapi_ticket
 * 用于JS-SDK的调用签名
 */
export async function getJsapiTicket() {
    // 如果缓存的 ticket 还有效，直接返回
    if (jsapiTicketCache.ticket && jsapiTicketCache.expires > Date.now()) {
        return jsapiTicketCache.ticket;
    }

    try {
        const accessToken = await getAccessToken();
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
        throw new Error('获取 jsapi_ticket 失败: ' + JSON.stringify(response.data));
    } catch (error) {
        console.error('获取 jsapi_ticket 出错:', error);
        throw error;
    }
}

/**
 * 获取用户信息
 * 需要用户已关注公众号才能获取详细信息
 * @param openid 用户的openid
 */
export async function getUserInfo(openid: string) {
    try {
        const accessToken = await getAccessToken();
        const response = await axios.get(
            `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${openid}&lang=zh_CN`
        );
        
        if (response.data.errcode) {
            throw new Error(`获取用户信息失败: ${response.data.errmsg}`);
        }
        
        return response.data;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        throw error;
    }
}

/**
 * 生成JS-SDK配置签名
 */
export function generateSignature(jsapiTicket: string, nonceStr: string, timestamp: number, url: string) {
    const crypto = require('crypto');
    const str = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    return crypto.createHash('sha1').update(str).digest('hex');
} 