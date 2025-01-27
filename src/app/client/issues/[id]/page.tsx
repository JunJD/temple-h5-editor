'use client'

import { getIssue } from "@/actions/issue"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

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
    <div className="container mx-auto p-4">
      {issue?.content ? (
        <pre>{JSON.stringify(issue.content, null, 2)}</pre>
      ) : (
        null
      )}
    </div>
  )
} 
