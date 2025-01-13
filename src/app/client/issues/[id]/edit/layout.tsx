'use client'

import BuilderEditor from '@/components/builder/editor'
import Template from '@/components/animated-template'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getIssue } from '@/actions/issue'

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
        height: '100vh',
        'background-color': '#fff',
        'min-height': '100vh'
      }
    }
  }]
}

export default function EditIssueLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const [issue, setIssue] = useState<{
    content: any
    html: string,
    css: string,
  } | null>(null)

  useEffect(() => {
    const fetchIssue = async () => {
      const {data: issue} = await getIssue(params.id as string) as any
      console.log('issue',issue)
      setIssue(issue as any)
    }
    fetchIssue()
  }, [params.id])
  
  if(!issue) return null
  
  return (
    <Template>
      <BuilderEditor 
        projectData={issue?.content?.projectData ?? defaultProjectData}
      >
        {children}
      </BuilderEditor>
    </Template>
  )
}
