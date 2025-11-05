'use client'

import { getIssue } from "@/actions/issue"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from 'next/link'
import { Button } from '@/components/ui'

interface IssuePageProps {
  issue: any
}

export default function IssuePage() {
  const params = useParams()
  const [issue, setIssue] = useState<{
    content: any
    html: string,
    css: string,
  } | null>(null)
  useEffect(() => {
    const fetchIssue = async () => {
      const result = await getIssue(params.id as string)
      if ('data' in result && result.data) {
        console.log('issue', result.data)
        setIssue(result.data as any)
      }
    }
    fetchIssue()
  }, [params.id])
  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className='flex items-center gap-2'>
        <Link href={`/client/issues/${params.id}/goods`}>
          <Button size='sm' variant='outline'>管理商品</Button>
        </Link>
        <Link href={`/api/preview/${params.id}?preview=1`} target='_blank'>
          <Button size='sm'>预览</Button>
        </Link>
      </div>
      {issue?.content ? (
        <pre>{JSON.stringify(issue.content, null, 2)}</pre>
      ) : (
        null
      )}
    </div>
  )
} 
