import { WechatPayV2Service } from './wechat-pay-v2'

// 支付服务单例
let wechatPayService: WechatPayV2Service | null = null

// 获取微信支付服务实例
export function getWechatPayService(): WechatPayV2Service {
    if (!wechatPayService) {
        wechatPayService = new WechatPayV2Service({
            appId: process.env.WECHAT_PAY_APP_ID!,
            mchId: process.env.WECHAT_PAY_MCH_ID!,
            key: 'AqBZTrpNijb7wrpvs9c2TcGdAmoDWadZ',
            pfxPath: process.env.WECHAT_PAY_PFX_PATH,
            notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL!,
        })
    }
    return wechatPayService
}

// 导出类型
export * from './wechat-pay-v2' 