'use client'

import DraftEditor from "@/components/issue/editor/draft"
import { prisma } from '@/lib/prisma'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ArtboardPreviewPage() {
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