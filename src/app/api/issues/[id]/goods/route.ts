import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const goods = await prisma.good.findMany({
      where: { issueId: params.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(goods)
  } catch (e) {
    return new NextResponse('Failed to fetch goods', { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { title, description, imageUrl, price, currency = 'CNY', quantity } = body || {}

    if (!title || typeof price !== 'number' || typeof quantity !== 'number') {
      return new NextResponse('Invalid payload', { status: 400 })
    }

    const created = await prisma.good.create({
      data: {
        title,
        description,
        imageUrl,
        price,
        currency,
        quantity,
        issueId: params.id,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return new NextResponse('Failed to create good', { status: 500 })
  }
}

