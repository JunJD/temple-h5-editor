import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const issue = await prisma.issue.findUnique({
        where: {
            id: params.id
        }
    })

    if (!issue) {
        return new NextResponse('Not found', { status: 404 })
    }

    return NextResponse.json(issue)
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const body = await request.json()
    
    // 更新数据库中的数据
    const updatedIssue = await prisma.issue.update({
        where: { id: params.id },
        data: {
            content: body.content
        },
    })
    
    return NextResponse.json(updatedIssue)
} 