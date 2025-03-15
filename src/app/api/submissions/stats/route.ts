import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取提交记录统计信息
export async function GET(request: NextRequest) {
  try {
    // 从URL参数中获取issueId
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issueId')
    
    if (!issueId) {
      return NextResponse.json(
        { error: '缺少issueId参数' },
        { status: 400 }
      )
    }
    
    const totalCount = await prisma.submission.count({
      where: { issueId }
    })
    
    const paidCount = await prisma.submission.count({
      where: { 
        issueId,
        status: 'PAID' 
      }
    })
    
    const totalAmount = await prisma.submission.aggregate({
      where: {
        issueId,
        status: 'PAID'
      },
      _sum: { amount: true }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        paidCount,
        totalAmount: totalAmount._sum.amount || 0
      }
    })
  } catch (error) {
    console.error('获取提交统计失败:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: '获取提交统计失败' },
      { status: 500 }
    )
  }
} 