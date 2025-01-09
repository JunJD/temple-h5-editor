'use client'

import { getIssue } from "@/actions/issue"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface IssuePageProps {
  issue: any
}

export default function IssuePage() {
  const params = useParams()
  console.log('params',params)
  const [issue, setIssue] = useState<{
    content: any
    html: string,
    css: string,
  } | null>(null)
  useEffect(() => {
    const fetchIssue = async () => {
      const {data: issue} = await getIssue(params.id as string)
      console.log('issue',issue)
      setIssue(issue as any)
    }
    fetchIssue()
  }, [params.id])
  return (
    <div className="container mx-auto p-4">
      {issue?.content ? (
        <pre>{JSON.stringify(issue.content, null, 2)}</pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
} 