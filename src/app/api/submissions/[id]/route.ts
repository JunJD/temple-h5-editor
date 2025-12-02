import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取单个提交记录
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { issue: true }
    })
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: '提交记录不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error) {
    console.error('获取提交记录失败2:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: '获取提交记录失败2' },
      { status: 500 }
    )
  }
}

// 更新单个提交记录
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const payload = await request.json()

    // 仅允许更新的字段白名单
    const allowedFields = [
      'formData',
      'amount',
      'currency',
      'status',
      'goods1',
      'goods2',
      'name',
      'name1',
      'paymentId',
      'tradeNo',
      'openid',
      'paidAt',
      'expiredAt',
      'refundId',
      'refundStatus',
      'refundAmount',
      'refundReason',
      'refundedAt',
    ] as const

    const data: Record<string, any> = {}
    for (const key of allowedFields) {
      if (key in payload) data[key] = payload[key]
    }

    // 转换日期字段
    if (data.paidAt) data.paidAt = new Date(data.paidAt)
    if (data.expiredAt) data.expiredAt = new Date(data.expiredAt)
    if (data.refundedAt) data.refundedAt = new Date(data.refundedAt)

    const updated = await prisma.submission.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('更新提交记录失败:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: '更新提交记录失败' },
      { status: 500 }
    )
  }
}

// 删除单个提交记录（同时清理关联支付日志）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // 先删除关联的支付日志
    await prisma.paymentLog.deleteMany({ where: { submissionId: id } })

    // 再删除提交记录
    const deleted = await prisma.submission.delete({ where: { id } })

    return NextResponse.json({ success: true, data: deleted })
  } catch (error) {
    console.error('删除提交记录失败:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: '删除提交记录失败' },
      { status: 500 }
    )
  }
}
