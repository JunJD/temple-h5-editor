import { NextResponse } from 'next/server'
import { getWechatPayService } from '@/lib/payment'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip']
    const { issueId, formData, amount, openid } = await req.json()

    console.log('支付请求参数:', {
      issueId,
      amount,
      openid,
      ip,
      timestamp: new Date().toISOString()
    })

    if (!issueId || !formData || !amount || !openid) {
      return NextResponse.json(
        { error: `Missing required parameters: issueId:${issueId}, formData:${formData}, amount:${amount}, openid:${openid}` },
        { status: 400 }
      )
    }

    const paymentId = nanoid()
    
    // 创建支付记录
    const submission = await prisma.submission.create({
      data: {
        issueId,
        formData,
        amount: parseFloat(amount),
        openid,
        paymentId,
        status: 'PENDING',
        payMethod: 'WXPAY',
      },
    })

    // 获取支付服务实例
    const payService = getWechatPayService()
    
    const orderParams = {
      body: `表单提交支付-${submission.id}`,
      outTradeNo: paymentId,
      totalFee: Math.round(amount * 100),
      openid,
      attach: submission.id,
      spbill_create_ip: ip,
    }

    console.log('预支付订单参数:', orderParams)
    
    // 创建预支付订单
    const result = await payService.createUnifiedOrder(orderParams)

    console.log('预支付订单结果:', result)

    if (result.return_code === 'FAIL' || result.result_code === 'FAIL') {
      console.error('微信支付下单失败:', {
        return_code: result.return_code,
        return_msg: result.return_msg,
        result_code: result.result_code,
        err_code: result.err_code,
        err_code_des: result.err_code_des
      })
      
      // 更新订单状态
      await prisma.submission.update({
        where: { id: submission.id },
        data: { 
          status: 'FAILED',
          wxPayInfo: {
            error: result.err_code_des || result.return_msg,
            errorCode: result.err_code || '',
            errorMsg: result.return_msg,
            raw: JSON.parse(JSON.stringify(result)) // 确保可以序列化
          }
        }
      })

      return NextResponse.json({ error: result.err_code_des || result.return_msg }, { status: 400 })
    }

    // 支付成功，更新支付信息
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        wxPayInfo: JSON.parse(JSON.stringify(result)) // 确保可以序列化
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('支付创建异常:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '支付创建失败' },
      { status: 500 }
    )
  }
}