'use client'

import BuilderEditor from '@/components/builder/editor'

import Template from '@/components/animated-template'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getIssue } from '@/actions/issue'

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
      <BuilderEditor projectData={issue?.content?.projectData ?? {
        components: [
          {
            id: 'formatTempList',
            name: 'formatTempList',
            label: '格式化模板列表',
            content: {
              type: 'formatTempList',
            },
          },
        ],
        styles: [],
        scripts: [],
      }}>{children}</BuilderEditor>
    </Template>
  )
}
