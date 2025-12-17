'use client'

import BuilderEditor from '@/components/builder/editor'
import { BuilderHeader } from '@/components/builder/builder-header'
import Template from '@/components/animated-template'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getIssue } from '@/actions/issue'
import { IssueProvider } from '@/contexts/issue-context'
import { Issue } from '@/schemas'
import { Alert, AlertDescription, AlertTitle, Button } from '@/components/ui'

// 默认项目数据
const defaultProjectData = {
  // GrapesJS 期望的数据结构
  assets: [],
  styles: [],
  pages: [{
    component: {
      type: 'wrapper',
      components: [
        {
          type: 'text',
          content: '欢迎使用页面编辑器',
          style: {
            padding: '20px',
            'text-align': 'center',
            color: '#666',
            'font-size': '24px',
            'font-weight': '300'
          }
        }
      ],
      style: {
        'background-color': '#fff',
        'min-height': '100vh'
      }
    }
  }]
}

export default function EditIssueLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [goodsCount, setGoodsCount] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const [issueRes, goodsRes] = await Promise.all([
          getIssue(params.id as string) as Promise<any>,
          fetch(`/api/issues/${params.id}/goods`).then((r) => (r.ok ? r.json() : [])),
        ])

        if (issueRes?.status === 200 && issueRes?.data) {
          setIssue(issueRes.data as Issue)
        }
        setGoodsCount(Array.isArray(goodsRes) ? goodsRes.length : 0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])
  
  if(!issue) return null
  if(loading) return null

  if(!issue?.id) {
    return <div>
      <h1>404</h1>
      <p>页面不存在</p>
    </div>
  }

  // 当该项目存在商品（商品编辑）时，禁止进入 GrapesJS 可视化编辑
  if ((goodsCount ?? 0) > 0) {
    return (
      <Template>
        {/* 提供 Issue 上下文，便于在禁用编辑器的场景中仍可编辑标题 */}
        <IssueProvider value={{ issue, loading, setIssue }}>
          {/* 仅展示顶部头部，允许标题编辑、发布、预览、二维码等操作 */}
          <BuilderHeader />
          <div className='container mx-auto p-6 pt-20 max-w-4xl'>
            <Alert>
              <AlertTitle>已启用商品编辑，禁用可视化编辑器</AlertTitle>
              <AlertDescription>
                该页面已配置商品数据。为避免与 GrapesJS 可视化编辑冲突，当前不支持进入前端编辑器。
                请前往商品管理进行内容配置，或在该页面上传 HTML / CSS。
              </AlertDescription>
            </Alert>
            <div className='mt-6 flex flex-wrap gap-3'>
              <Link href={`/client/issues/${params.id}/goods`}>
                <Button>前往商品管理</Button>
              </Link>
              <Link href={`/api/preview/${params.id}?preview=1`} target='_blank'>
                <Button variant='outline'>预览</Button>
              </Link>
              <Link href={`/client/issues/${params.id}`}>
                <Button variant='ghost'>返回详情</Button>
              </Link>
            </div>
          </div>
        </IssueProvider>
      </Template>
    )
  }

  return (
    <Template>
        <IssueProvider value={{ issue, loading, setIssue }}>
        <BuilderEditor 
          projectData={issue?.content?.projectData ?? defaultProjectData}
          formConfig={issue?.formConfig ?? {
            fields: [],
            submitButtonText: '提交'
          }}
          id={params.id as string}
        >
          {children}
        </BuilderEditor>
      </IssueProvider>
    </Template>
  )
}
