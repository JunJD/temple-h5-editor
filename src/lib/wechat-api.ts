import axios from 'axios';
import redisClient from '@/lib/redis'; // 导入共享的 Redis 实例

// 微信 API 凭证和 ticket 的缓存键名
const ACCESS_TOKEN_KEY = 'wechat:access_token';
const JSAPI_TICKET_KEY = 'wechat:jsapi_ticket';
// 缓存有效期（秒），比微信官方有效期略短，例如 7000 秒
const CACHE_TTL_SECONDS = 7000;

/**
 * 获取微信全局 access_token
 * 该token用于调用微信公众号的各种接口
 */
export async function getAccessToken(): Promise<string> {
    // 1. 尝试从 Redis 获取缓存的 token
    try {
        // 使用导入的 redisClient
        const cachedToken = await redisClient.get(ACCESS_TOKEN_KEY);
        if (cachedToken) {
            console.log('Using cached access_token');
            return cachedToken;
        }
    } catch (error) {
        console.error('Redis get access_token error:', error, '- proceeding to fetch new one.');
    }


    // 2. 如果缓存没有或获取失败，则从微信 API 获取
    console.log('Fetching new access_token from WeChat API');
    const appId = process.env.WECHAT_PAY_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error('Missing WECHAT_PAY_APP_ID or WECHAT_APP_SECRET environment variables');
    }

    try {
        const response = await axios.get(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
        );

        if (response.data && response.data.access_token) {
            const newToken = response.data.access_token;
            // 3. 将新 token 存入 Redis，并设置有效期
             try {
                 // 使用导入的 redisClient
                await redisClient.setex(ACCESS_TOKEN_KEY, CACHE_TTL_SECONDS, newToken);
                console.log('New access_token cached in Redis');
            } catch (error) {
                console.error('Redis setex access_token error:', error);
                // 即使缓存失败，也应返回获取到的 token，保证本次请求可用
            }
            return newToken;
        }
        // 记录详细错误信息
        const errorMsg = response.data?.errmsg || JSON.stringify(response.data);
        throw new Error(`获取 access_token 失败: ${errorMsg}`);
    } catch (error) {
         console.error('获取 access_token 出错:', error instanceof Error ? error.message : error);
         // 抛出原始错误或包装后的错误
         throw error instanceof Error ? error : new Error(String(error));
    }
}

/**
 * 获取 jsapi_ticket
 * 用于JS-SDK的调用签名
 */
export async function getJsapiTicket(): Promise<string> {
    // 1. 尝试从 Redis 获取缓存的 ticket
     try {
         // 使用导入的 redisClient
        const cachedTicket = await redisClient.get(JSAPI_TICKET_KEY);
        if (cachedTicket) {
            console.log('Using cached jsapi_ticket');
            return cachedTicket;
        }
    } catch (error) {
        console.error('Redis get jsapi_ticket error:', error, '- proceeding to fetch new one.');
    }


    // 2. 如果缓存没有或获取失败，则从微信 API 获取
    console.log('Fetching new jsapi_ticket from WeChat API');
    try {
        const accessToken = await getAccessToken(); // 确保获取到有效的 access_token
        const response = await axios.get(
            `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
        );

        if (response.data && response.data.ticket) {
            const newTicket = response.data.ticket;
             // 3. 将新 ticket 存入 Redis，并设置有效期
            try {
                // 使用导入的 redisClient
                await redisClient.setex(JSAPI_TICKET_KEY, CACHE_TTL_SECONDS, newTicket);
                console.log('New jsapi_ticket cached in Redis');
            } catch (error) {
                 console.error('Redis setex jsapi_ticket error:', error);
                 // 即使缓存失败，也应返回获取到的 ticket
            }
            return newTicket;
        }
         // 记录详细错误信息
         const errorMsg = response.data?.errmsg || JSON.stringify(response.data);
         throw new Error(`获取 jsapi_ticket 失败: ${errorMsg}`);
    } catch (error) {
        console.error('获取 jsapi_ticket 出错:', error instanceof Error ? error.message : error);
        throw error instanceof Error ? error : new Error(String(error));
    }
}

/**
 * 获取用户信息 (此函数与缓存无关，保持不变)
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
 * 生成JS-SDK配置签名 (此函数保持不变)
 */
export function generateSignature(jsapiTicket: string, nonceStr: string, timestamp: number, url: string) {
    const crypto = require('crypto');
    // 确保 URL 是解码后的
    const decodedUrl = decodeURIComponent(url);
    const str = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${decodedUrl}`;
    try {
      return crypto.createHash('sha1').update(str).digest('hex');
    } catch(e) {
      console.error('签名生成失败', e)
      throw e
    }
}