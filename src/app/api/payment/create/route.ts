import { NextResponse } from 'next/server'
import { getWechatPayService } from '@/lib/payment'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip']
    const { issueId, formData, amount, openid } = await req.json()

    console.log(issueId, formData, amount, openid, '<==issueId, formData, amount, openid')

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
        paymentId, // 生成商户订单号
        status: 'PENDING',
        payMethod: 'WXPAY',
      },
    })

    // 获取支付服务实例
    const payService = getWechatPayService()

    // 创建预支付订单
    const result = await payService.createUnifiedOrder({
      body: `表单提交支付-${submission.id}`,
      outTradeNo: paymentId,
      totalFee: Math.round(amount * 100), // 转换为分
      openid,
      attach: submission.id, // 附加数据，用于回调时关联订单
      spbill_create_ip: ip,
    })

    console.log(result, '<==result')

    // 创建支付日志
    await prisma.paymentLog.create({
      data: {
        submissionId: submission.id,
        type: 'CREATE',
        content: {
          prepayId: result.package.replace('prepay_id=', ''),
          outTradeNo: paymentId,
        },
      },
    })

    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Create payment failed:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}