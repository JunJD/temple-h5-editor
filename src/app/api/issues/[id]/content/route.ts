import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 更新 Issue 的内容，允许直接上传 HTML/CSS
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { html, css, projectData } = body || {}

    if (html === undefined && css === undefined && projectData === undefined) {
      return new NextResponse('Nothing to update', { status: 400 })
    }

    // 读取原有内容，做部分合并
    const issue = await prisma.issue.findUnique({ where: { id: params.id } })
    if (!issue) return new NextResponse('Not found', { status: 404 })

    const prev = (issue.content || {}) as any

    const updated = await prisma.issue.update({
      where: { id: params.id },
      data: {
        content: {
          html: html !== undefined ? html : prev.html || '',
          css: css !== undefined ? css : prev.css || '',
          projectData: projectData !== undefined ? projectData : prev.projectData || undefined,
        },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    return new NextResponse('Failed to update content', { status: 500 })
  }
}

