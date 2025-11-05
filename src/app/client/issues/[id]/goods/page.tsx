import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import GoodsManager from '@/components/issue/goods-manager'
import ContentUploader from '@/components/issue/content-uploader'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface Props {
  params: { id: string }
}

export default async function GoodsPage({ params }: Props) {
  const [issue, goods] = await Promise.all([
    prisma.issue.findUnique({ where: { id: params.id } }),
    prisma.good.findMany({ where: { issueId: params.id }, orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <section className='container py-8'>
      <div className='mb-4'>
        <Link href='/client/issues' className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'>
          <ArrowLeft size={16} />
          返回 Issues
        </Link>
      </div>

      <header className='mb-6 flex items-center justify-between'>
        <h1 className='font-bold text-2xl'>商品管理 · {issue?.title ?? '#'}</h1>
        <div className='flex items-center gap-2'>
          <Link href={`/client/issues/${params.id}`}>
            <Button size='sm' variant='outline'>页面详情</Button>
          </Link>
          <Link href={`/api/preview/${params.id}?preview=1`} target='_blank'>
            <Button size='sm'>预览</Button>
          </Link>
        </div>
      </header>

      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>商品编辑</CardTitle>
            <CardDescription>添加、修改与管理与该页面关联的商品。</CardDescription>
          </CardHeader>
          <CardContent>
            <GoodsManager issueId={params.id} initial={goods as any} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>页面内容</CardTitle>
            <CardDescription>上传 HTML / CSS，用于渲染前端页面。</CardDescription>
          </CardHeader>
          <CardContent>
            <ContentUploader issueId={params.id} initial={{ html: (issue?.content as any)?.html, css: (issue?.content as any)?.css }} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
