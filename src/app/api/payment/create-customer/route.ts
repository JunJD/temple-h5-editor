import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { getWechatPayService } from '@/lib/payment'

type ClientItem = {
  id: string
  quantity: number
}

type ClientGoodsPayload = {
  items: ClientItem[]
}

export async function POST(req: Request) {
  try {
    const ip = (req as any).headers?.['x-forwarded-for'] || (req as any).headers?.['x-real-ip']
    const body = await req.json()

    const {
      issueId,
      openid,
      formData,
      userInfo,
      goods, // stringified JSON or object: { items: [{ id, quantity }] }
    } = body || {}

    if (!issueId || !openid) {
      return NextResponse.json({ error: 'Missing required parameters: issueId, openid' }, { status: 400 })
    }

    // Parse goods payload
    let goodsPayload: ClientGoodsPayload | null = null
    try {
      goodsPayload = typeof goods === 'string' ? JSON.parse(goods) : goods
    } catch (e) {
      return NextResponse.json({ error: 'Invalid goods payload' }, { status: 400 })
    }

    if (!goodsPayload || !Array.isArray(goodsPayload.items) || goodsPayload.items.length === 0) {
      return NextResponse.json({ error: 'Goods items required' }, { status: 400 })
    }

    // Fetch goods from DB to calculate total and validate
    const ids = goodsPayload.items.map((i) => i.id).filter(Boolean)
    const dbGoods = await prisma.good.findMany({
      where: { id: { in: ids }, issueId },
    })

    if (dbGoods.length !== ids.length) {
      return NextResponse.json({ error: 'Some goods not found or not belong to issue' }, { status: 400 })
    }

    // Merge quantities and compute totals
    let total = 0
    const normalized = dbGoods.map((g) => {
      const q = Math.max(0, Number(goodsPayload!.items.find((i) => i.id === g.id)?.quantity || 0))
      return {
        id: g.id,
        title: g.title,
        price: g.price,
        currency: g.currency,
        quantity: q,
        lineTotal: g.price * q,
      }
    })

    // Validate quantities (optional: check stock)
    for (const item of normalized) {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
      }
      const g = dbGoods.find((x) => x.id === item.id)!
      if (typeof g.quantity === 'number' && item.quantity > g.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${g.title}` }, { status: 400 })
      }
      total += item.lineTotal
    }

    if (!(total > 0)) {
      return NextResponse.json({ error: 'Total amount must be greater than 0' }, { status: 400 })
    }

    // Prepare submission payload; store goods info into formData.goods for now
    const paymentId = nanoid()
    const submission = await prisma.submission.create({
      data: {
        issueId,
        formData: {
          ...(formData || {}),
          goods: {
            items: normalized,
            total,
            currency: normalized[0]?.currency || 'CNY',
          },
        },
        amount: parseFloat(String(total)),
        openid,
        paymentId,
        status: 'PENDING',
        payMethod: 'WXPAY',
        userInfo: userInfo || null,
      },
    })

    // Create unified order
    const payService = getWechatPayService()
    const orderParams = {
      body: `客户下单-${submission.id}`,
      outTradeNo: paymentId,
      totalFee: Math.round(total * 100),
      openid,
      attach: submission.id,
      spbill_create_ip: ip,
    }

    const result = await payService.createUnifiedOrder(orderParams)

    if ((result as any).return_code === 'FAIL' || (result as any).result_code === 'FAIL') {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: 'FAILED',
          wxPayInfo: {
            error: (result as any).err_code_des || (result as any).return_msg,
            errorCode: (result as any).err_code || '',
            errorMsg: (result as any).return_msg,
            raw: JSON.parse(JSON.stringify(result)),
          },
        },
      })

      const errorMessage = (result as any).err_code === 'NOAUTH'
        ? `appId:${(result as any).appId} 商户无此接口权限`
        : ((result as any).err_code_des || (result as any).return_msg || '创建支付订单失败')

      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    await prisma.submission.update({
      where: { id: submission.id },
      data: { wxPayInfo: JSON.parse(JSON.stringify(result)) },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('支付创建异常(create-customer):', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '支付创建失败' },
      { status: 500 }
    )
  }
}

