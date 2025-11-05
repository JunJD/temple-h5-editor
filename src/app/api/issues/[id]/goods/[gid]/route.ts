import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string; gid: string } }
) {
  try {
    const good = await prisma.good.findFirst({
      where: { id: params.gid, issueId: params.id },
    })
    if (!good) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(good)
  } catch (e) {
    return new NextResponse('Failed to fetch good', { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string; gid: string } }
) {
  try {
    const body = await req.json()
    const { title, description, imageUrl, price, currency, quantity } = body || {}

    const updated = await prisma.good.update({
      where: { id: params.gid },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(quantity !== undefined ? { quantity } : {}),
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return new NextResponse('Failed to update good', { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; gid: string } }
) {
  try {
    await prisma.good.delete({ where: { id: params.gid } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return new NextResponse('Failed to delete good', { status: 500 })
  }
}

