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

  /**
   * 统一下单接口 - 创建预支付订单
   * @param params 支付参数
   * @returns 预支付订单信息
   */
  async createUnifiedOrder(params: PrepayOrderParamsV2): Promise<WechatPayResponse> {
    const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
    const requestParams = {
      body: params.body,
      out_trade_no: params.outTradeNo,
      total_fee: params.totalFee.toString(),
      spbill_create_ip: params.spbill_create_ip || '127.0.0.1',
      notify_url: this.config.notifyUrl,
      trade_type: 'JSAPI',
      openid: params.openid,
      appid: this.config.appId,
      mch_id: this.config.mchId,
      nonce_str: this.generateNonceStr(),
      attach: params.attach,
    }

    // 生成签名
    const sign = this.generateSign(requestParams)
    
    // 完整请求参数，包含签名
    const fullRequestParams = {
      ...requestParams,
      sign
    }

    // 将参数转换为XML
    const requestXml = await this.processRequestParams(fullRequestParams)

    try {
      // 发送请求到微信支付API
      const response = await axios.post(url, requestXml, {
        headers: { 'Content-Type': 'text/xml' },
      })
      const result = this.parser.parse(response.data)

      // 检查返回结果
      if (result.xml.return_code !== 'SUCCESS' || result.xml.result_code !== 'SUCCESS') {
        throw new Error(
          `统一下单失败: ${result.xml.return_msg || result.xml.err_code_des || '未知错误'}`
        )
      }

      // 构造JSAPI支付参数
      const timeStamp = Math.floor(Date.now() / 1000).toString()
      const nonceStr = this.generateNonceStr()
      const packageStr = `prepay_id=${result.xml.prepay_id}`
      const signType = 'MD5'

      const payParams = {
        appId: this.config.appId,
        timeStamp,
        nonceStr,
        package: packageStr,
        signType,
      }

      const paySign = this.generateSign(payParams)

      // 返回符合WechatPayResponse类型的响应
      return {
        return_code: 'SUCCESS',
        return_msg: 'OK',
        appId: this.config.appId,
        timeStamp,
        nonceStr,
        package: packageStr,
        signType,
        paySign,
        outTradeNo: params.outTradeNo,
      } as WechatPayResponse
    } catch (error) {
      console.error('统一下单请求失败:', error)
      throw error
    }
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

  /**
   * 验证微信支付通知
   * @param xmlData 微信支付通知XML数据
   * @returns 解析后的通知数据
   */
  verifyNotification(xmlData: string): any {
    // 使用正则表达式直接解析 XML，避免数据类型转换问题
    const data: Record<string, string> = {}
    const tagPattern = /<([^><\/\s]+)>(?:<!\[CDATA\[([^><]*?)\]\]>|([^><]*?))<\/\1>/g
    let match
    
    while ((match = tagPattern.exec(xmlData)) !== null) {
      const tagName = match[1]
      // 优先使用 CDATA 中的值，如果没有则使用普通标签值
      const tagValue = match[2] !== undefined ? match[2] : match[3]
      if (tagName && tagValue !== undefined) {
        data[tagName] = tagValue
      }
    }
    
    // 保存原始签名以供验证
    const originalSign = data.sign
    if (!originalSign) {
      throw new Error('签名缺失')
    }
    
    // 创建用于签名计算的参数对象，排除 sign 字段
    const params: Record<string, string> = {}
    Object.keys(data).forEach(key => {
      if (key !== 'sign' && data[key] !== undefined && data[key] !== '') {
        params[key] = data[key]
      }
    })
    
    // 计算签名
    const calculatedSign = this.generateSign(params)
    
    // 验证签名
    if (originalSign !== calculatedSign) {
      console.error('签名不匹配')
      throw new Error('无效的通知签名')
    }
    
    return data
  }
} 