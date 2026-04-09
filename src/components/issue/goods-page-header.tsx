'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { updateIssueTitle } from '@/actions/builder'
import { Button } from '@/components/ui'
import { toast } from '@/hooks/use-toast'
import PublishToggle from '@/components/issue/publish-toggle'
import QrcodeButton from '@/components/issue/qrcode-button'

interface GoodsPageHeaderProps {
  issueId: string
  initialTitle: string
  status: 'draft' | 'published'
}

export default function GoodsPageHeader({
  issueId,
  initialTitle,
  status,
}: GoodsPageHeaderProps) {
  const [title, setTitle] = useState(initialTitle || '未命名页面')
  const [draftTitle, setDraftTitle] = useState(initialTitle || '未命名页面')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const locked = status === 'published'

  const startEditTitle = () => {
    if (locked) return
    setDraftTitle(title)
    setIsEditingTitle(true)
  }

  const saveTitle = async () => {
    const nextTitle = draftTitle.trim()

    if (!nextTitle) {
      setDraftTitle(title)
      setIsEditingTitle(false)
      return
    }

    if (nextTitle === title) {
      setIsEditingTitle(false)
      return
    }

    try {
      const result = await updateIssueTitle(issueId, nextTitle)
      if (!result || !('data' in result) || !result.data) {
        throw new Error('更新失败')
      }

      setTitle(nextTitle)
      setDraftTitle(nextTitle)
      toast({
        title: '标题已更新',
        description: '页面标题已成功保存',
      })
    } catch (error) {
      setDraftTitle(title)
      toast({
        title: '更新失败',
        description: '保存标题时发生错误',
        variant: 'destructive',
      })
    } finally {
      setIsEditingTitle(false)
    }
  }

  const cancelEditTitle = () => {
    setDraftTitle(title)
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void saveTitle()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditTitle()
    }
  }

  return (
    <header className='mb-6 space-y-4'>
      <Link
        href='/client/issues'
        className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft size={16} />
        返回 Issues
      </Link>

      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>商品管理</p>
          {isEditingTitle ? (
            <input
              type='text'
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={() => void saveTitle()}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className='rounded border border-primary bg-background px-2 py-1 text-2xl font-bold outline-none ring-primary/50 focus:ring-2'
              style={{ minWidth: '180px', width: `${Math.max(draftTitle.length + 2, 12)}ch` }}
            />
          ) : (
            <h1
              className='text-2xl font-bold transition-colors hover:text-primary'
              onDoubleClick={startEditTitle}
              title={locked ? '页面已发布，无法编辑标题' : '双击编辑标题'}
            >
              {title}
            </h1>
          )}
          <p className='text-xs text-muted-foreground'>
            {locked ? '页面已发布，如需改标题请先解除发布。' : '双击左侧标题可直接修改。'}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Link href={`/client/issues/${issueId}`}>
            <Button size='sm' variant='outline'>页面详情</Button>
          </Link>
          <PublishToggle issueId={issueId} status={status} />
          <Link href={`/api/preview/${issueId}?preview=1`} target='_blank'>
            <Button size='sm'>预览</Button>
          </Link>
          <QrcodeButton issueId={issueId} title={title} />
        </div>
      </div>
    </header>
  )
}
