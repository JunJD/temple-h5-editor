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