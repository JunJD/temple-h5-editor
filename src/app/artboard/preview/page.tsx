'use client'

import DraftEditor from "@/components/issue/editor/draft"
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

// 该页面依赖搜索参数，强制动态渲染，避免构建时预渲染
export const dynamic = 'force-dynamic'

function PreviewContent() {
    const searchParams = useSearchParams()
    const issueId = searchParams.get('issueId')
    
    const [issue, setIssue] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchIssue() {
            if (!issueId) return
            
            try {
                const response = await fetch(`/api/issues/${issueId}`)
                const data = await response.json()
                setIssue(data)
            } catch (error) {
                console.error('Failed to fetch issue:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchIssue()
    }, [issueId])

    if (loading) return <div>Loading...</div>
    if (!issue) return <div>Issue not found</div>

    return (
      <DraftEditor 
        editable={false} 
        content={issue.content ? JSON.stringify(issue.content) : '暂无内容'} 
      />
    )
}

export default function ArtboardPreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewContent />
    </Suspense>
  )
}
