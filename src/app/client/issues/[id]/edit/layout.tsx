'use client'

import BuilderEditor from '@/components/builder/editor'
import Template from '@/components/animated-template'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getIssue } from '@/actions/issue'
import { IssueProvider } from '@/contexts/issue-context'
import { Issue } from '@/schemas'

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

  useEffect(() => {
    setLoading(true)
    const fetchIssue = async () => {
      const {data: issue, status} = await getIssue(params.id as string) as any

      if(status === 200) {
        setIssue(issue as Issue)
      }
      setLoading(false)
    }

    fetchIssue()
  }, [params.id])
  
  if(!issue) return null
  if(loading) return null

  if(!issue?.id) {
    return <div>
      <h1>404</h1>
      <p>页面不存在</p>
    </div>
  }

  return (
    <Template>
        <IssueProvider value={{ issue, loading, setIssue }}>
        <BuilderEditor 
          projectData={issue?.content?.projectData ?? defaultProjectData}
          id={params.id as string}
        >
          {children}
        </BuilderEditor>
      </IssueProvider>
    </Template>
  )
}
