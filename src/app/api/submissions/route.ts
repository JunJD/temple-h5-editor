import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取指定issueId的所有提交记录
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
    
    const submissions = await prisma.submission.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: submissions 
    })
  } catch (error) {
    console.error('获取提交记录失败:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: '获取提交记录失败' },
      { status: 500 }
    )
  }
} 