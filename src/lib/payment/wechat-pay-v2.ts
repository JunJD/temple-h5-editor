import crypto from 'crypto'
import fs from 'fs'
import axios from 'axios'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'

interface WechatPayResponse {
  return_code: string
  return_msg: string
  result_code?: string
  err_code?: string
  err_code_des?: string
  paySign?: string
  appId?: string
  timeStamp?: string
  nonceStr?: string
  package?: string
  signType?: string
}
export interface WechatPayV2Config {
  appId: string
  mchId: string
  key: string
  pfxPath?: string
  notifyUrl: string
}

export interface PrepayOrderParamsV2 {
  body: string
  outTradeNo: string
  totalFee: number
  openid: string
  attach?: string
  spbill_create_ip?: string
}

export interface RefundParamsV2 {
  outTradeNo: string
  outRefundNo: string
  totalFee: number
  refundFee: number
  refundDesc?: string
}

export class WechatPayV2Service {
  private readonly config: WechatPayV2Config
  private readonly parser: XMLParser
  private readonly builder: XMLBuilder
  private pfxContent?: Buffer

  constructor(config: WechatPayV2Config) {
    this.config = config
    this.parser = new XMLParser({
      ignoreAttributes: true,
      parseAttributeValue: false,
    })
    this.builder = new XMLBuilder({
      ignoreAttributes: true,
      suppressEmptyNode: true,
    })

    // 如果提供了证书路径，加载证书
    if (config.pfxPath) {
      this.pfxContent = fs.readFileSync(config.pfxPath)
    }
  }

  // 生成随机字符串
  private generateNonceStr(length: number = 32): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let noceStr = ''
    for (let i = 0; i < length; i++) {
      noceStr += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return noceStr
  }

  // 生成签名
  private generateSign(params: Record<string, any>): string {
    // 1. 参数名ASCII码从小到大排序
    const sortedKeys = Object.keys(params).sort()
    
    // 2. 拼接字符串
    let stringA = sortedKeys
      .filter(key => params[key] !== undefined && params[key] !== '')
      .map(key => `${key}=${String(params[key])}`)
      .join('&')
    
    // 3. 拼接商户密钥
    const stringSignTemp = stringA + '&key=' + this.config.key
    
    // 4. MD5并转大写
    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase()
  }

  // 处理请求参数
  private async processRequestParams(params: Record<string, any>): Promise<string> {
    // 1. 添加公共参数
    const finalParams: Record<string, any> = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      nonce_str: this.generateNonceStr(),
      ...params,
    }

    // 2. 生成签名
    finalParams.sign = this.generateSign(finalParams)

    // 3. 转换为XML
    return this.builder.build({ xml: finalParams })
  }

  // 发送请求
  private async request(url: string, params: Record<string, any>, useCert: boolean = false): Promise<any> {
    const xmlData = await this.processRequestParams(params)
    
    const config: any = {
      headers: {
        'Content-Type': 'text/xml',
      },
    }

    // 如果需要证书
    if (useCert && this.pfxContent) {
      config.pfx = this.pfxContent
      config.passphrase = this.config.mchId
    }

    const response = await axios.post(url, xmlData, config)
    const result = this.parser.parse(response.data)
    
    if (result.xml.return_code === 'SUCCESS') {
      // 验证返回签名
      const returnSign = result.xml.sign
      delete result.xml.sign
      const calculatedSign = this.generateSign(result.xml)
      
      if (returnSign !== calculatedSign) {
        throw new Error('Invalid response signature')
      }
      
      return result.xml
    } else {
      throw new Error(result.xml.return_msg || 'Request failed')
    }
  }

  // 统一下单
  async createUnifiedOrder(params: PrepayOrderParamsV2): Promise<WechatPayResponse> {
    const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
    const requestParams = {
      body: params.body,
      out_trade_no: params.outTradeNo,
      total_fee: params.totalFee,
      spbill_create_ip: params.spbill_create_ip || '127.0.0.1',
      notify_url: this.config.notifyUrl,
      trade_type: 'JSAPI',
      openid: params.openid,
      attach: params.attach,
    }

    console.log('统一下单请求参数:', requestParams)
    
    const result = await this.request(url, requestParams)
    console.log('统一下单返回结果:', result)
    
    // 生成支付参数
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = this.generateNonceStr()
    const packageStr = `prepay_id=${result.prepay_id}`
    const signType = 'MD5'

    const payParams = {
      appId: this.config.appId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType,
    }

    const paySign = this.generateSign(payParams)

    return {
      ...payParams,
      paySign,
    } as WechatPayResponse
  }

  // 查询订单
  async queryOrder(outTradeNo: string) {
    const url = 'https://api.mch.weixin.qq.com/pay/orderquery'
    return await this.request(url, { out_trade_no: outTradeNo })
  }

  // 关闭订单
  async closeOrder(outTradeNo: string) {
    const url = 'https://api.mch.weixin.qq.com/pay/closeorder'
    return await this.request(url, { out_trade_no: outTradeNo })
  }

  // 申请退款
  async refund(params: RefundParamsV2) {
    if (!this.pfxContent) {
      throw new Error('Certificate is required for refund')
    }

    const url = 'https://api.mch.weixin.qq.com/secapi/pay/refund'
    const requestParams = {
      out_trade_no: params.outTradeNo,
      out_refund_no: params.outRefundNo,
      total_fee: params.totalFee,
      refund_fee: params.refundFee,
      refund_desc: params.refundDesc,
    }

    return await this.request(url, requestParams, true)
  }

  // 查询退款
  async queryRefund(outRefundNo: string) {
    const url = 'https://api.mch.weixin.qq.com/pay/refundquery'
    return await this.request(url, { out_refund_no: outRefundNo })
  }

  // 验证回调通知签名
  verifyNotification(xmlData: string): any {
    console.log("XML Data for verification:", xmlData);
    
    // 解析 XML 为对象，确保解析选项正确
    const result = this.parser.parse(xmlData);
    const data = result.xml || {};
    
    console.log("Parsed notification data:", JSON.stringify(data));
    
    // 保存原始签名以供验证
    const originalSign = data.sign;
    if (!originalSign) {
      throw new Error('Missing sign in notification');
    }
    
    // 创建一个新对象，确保所有值都是字符串，并删除 sign 字段
    const params: Record<string, string> = {};
    Object.keys(data).forEach(key => {
      if (key !== 'sign' && data[key] !== undefined && data[key] !== '') {
        // 确保每个值都是字符串
        params[key] = String(data[key]);
      }
    });
    
    console.log("Params for sign calculation:", JSON.stringify(params));
    
    // 计算签名
    const calculatedSign = this.generateSign(params);
    console.log("Original sign:", originalSign);
    console.log("Calculated sign:", calculatedSign);
    
    // 验证签名
    if (originalSign !== calculatedSign) {
      console.error(`Sign mismatch: original=${originalSign}, calculated=${calculatedSign}`);
      throw new Error('Invalid notification signature');
    }
    
    // 返回解析后的数据
    return data;
  }
} 