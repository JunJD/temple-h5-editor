import { WechatPayV2Service } from './wechat-pay-v2'

// 注释掉或移除全局缓存变量
// let wechatPayService: WechatPayV2Service | null = null;

// 获取微信支付服务实例
export function getWechatPayService(): WechatPayV2Service {
    // 移除 if 检查，强制每次都创建新实例
    // if (!wechatPayService) {
        
    // 每次调用都创建一个新的服务实例
    const newServiceInstance = new WechatPayV2Service({
        appId: process.env.WECHAT_PAY_APP_ID!,
        mchId: process.env.WECHAT_PAY_MCH_ID!,
        key: process.env.WECHAT_PAY_KEY!, // 确保这里能读到最新的环境变量
        pfxPath: process.env.WECHAT_PAY_PFX_PATH,
        notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL!,
    });

    // }
    // return wechatPayService; // 不再返回缓存的实例
    return newServiceInstance; // 返回新创建的实例
}

// 导出类型
export * from './wechat-pay-v2' 