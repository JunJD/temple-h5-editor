'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { publishIssueAction } from '@/actions/issue'
import { useToast } from '@/hooks/use-toast'

export default function PublishToggle({
  issueId,
  status,
}: {
  issueId: string
  status: 'draft' | 'published'
}) {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState<'draft' | 'published'>(status)
  const router = useRouter()
  const { toast } = useToast()

  const onToggle = () => {
    if (!issueId) return
    startTransition(async () => {
      const res = await publishIssueAction(issueId)
      if (res?.status === 200 && res.data) {
        const newStatus = (res.data.status as 'draft' | 'published') || 'draft'
        setLocalStatus(newStatus)
        toast({
          title: newStatus === 'published' ? '发布成功' : '已解除发布',
          description: newStatus === 'published' ? '该页面已对外可访问' : '该页面已回到草稿状态',
        })
        router.refresh()
      } else {
        toast({ title: '操作失败', description: '请稍后重试', variant: 'destructive' })
      }
    })
  }

  const isPublished = localStatus === 'published'
  return (
    <Button size='sm' variant='outline' onClick={onToggle} disabled={isPending}>
      {isPublished ? '解除发布' : '发布'}
    </Button>
  )
}

