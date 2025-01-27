'use client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import { createIssue, deleteIssue } from '@/actions/issue'
import { MoreHorizontal } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Issue } from '@/schemas'
import { useState } from 'react'

interface Props {
  issue: Issue & { id: string }
}

export default function IssueCard({ issue }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (confirm('确定要删除这个Issue吗？')) {
      await deleteIssue(issue.id)
      router.refresh()
    }
  }

  const handleDuplicate = async () => {
    try {
      setIsLoading(true)
      const { title, description, content, startTime, endTime } = issue
      const duplicatedIssue = {
        title: `${title} (复制)`,
        description,
        content,
        formConfig: {
          fields: [],
          layout: 'vertical' as const,
          submitButtonText: '提交'
        },
        wxPayConfig: {
          mchid: '',
          appid: '',
          notifyUrl: 'http://localhost:3000/api/wxpay/notify',
          description: '测试',
          attach: '',
          timeExpire: '',
        },
        startTime,
        endTime
      }
      const result = await createIssue(duplicatedIssue)
      if (result.status === 500) {
        throw new Error('复制失败')
      }
      router.refresh()
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[280px]">
      <CardHeader className="flex-none">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <CardTitle className="text-lg truncate">{issue.title}</CardTitle>
            <CardDescription>{issue.createdAt ? formatDate(issue.createdAt) : '-'}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/client/issues/${issue.id}`}>查看详情</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/client/issues/${issue.id}/edit`}>编辑</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isLoading}
                onClick={handleDuplicate}
              >
                {isLoading ? '复制中...' : '复制'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <article className="text-sm prose prose-stone dark:prose-invert line-clamp-6">
          <ReactMarkdown>{issue.description}</ReactMarkdown>
        </article>
      </CardContent>
      <CardFooter className="flex-none flex justify-end">
        <Button size="sm" variant="default" asChild>
          <Link href={`/client/issues/${issue.id}/edit`}>编辑</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
