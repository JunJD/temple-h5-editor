import { prisma } from '@/lib/prisma'
import GoodsManager from '@/components/issue/goods-manager'
// import ContentUploader from '@/components/issue/content-uploader'
import HtmlCssEditor from '@/components/issue/html-css-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import GoodsPageHeader from '@/components/issue/goods-page-header'

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
      <GoodsPageHeader
        issueId={params.id}
        initialTitle={issue?.title ?? '未命名页面'}
        status={(issue?.status as any) === 'published' ? 'published' : 'draft'}
      />

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
            <CardDescription>在下方编辑 HTML/CSS，右侧实时预览。</CardDescription>
          </CardHeader>
          <CardContent>
            <HtmlCssEditor issueId={params.id} initialHtml={(issue?.content as any)?.html} initialCss={(issue?.content as any)?.css} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
