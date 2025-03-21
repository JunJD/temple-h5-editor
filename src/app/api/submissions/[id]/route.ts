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