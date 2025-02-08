'use client'

import { 
  GoHome,
  GoLock
} from 'react-icons/go'
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from 'atomic-utils'
import Link from 'next/link'
import { DevicesProvider, useEditorMaybe } from '@grapesjs/react'
import { useParams } from 'next/navigation'
import { updateIssue } from '@/actions/builder'
import { useIssue, usePublishIssue } from '@/contexts/issue-context'
import { useMemo } from 'react'
import { toast } from '@/hooks/use-toast'

export const BuilderHeader = () => {
  const { issue } = useIssue()

  const title = issue?.title ?? '未命名页面'
  const locked = useMemo(() => {
    console.log(issue?.status, 'issue?.status')
    return issue?.status === 'published'
  }, [issue?.status])
  const leftPanelSize = 0
  const rightPanelSize = 0
  const isDragging = false
  const editor = useEditorMaybe()

  const id = useParams().id as string
  const publishIssue = usePublishIssue()
  const onPublish = () => {
    publishIssue()
  }
  
  const onSave = async () => {
    if (!editor) return

    const html = editor.getHtml() ?? ''
    const css = editor.getCss() ?? ''
    const projectData = editor.getProjectData() ?? {}
    await updateIssue(id, { html, css, projectData })
    toast({
      title: '保存成功',
      description: 'Issue已成功保存',
      variant: 'default',
    })
  }

  return (
    <TooltipProvider>
      <div
        style={{ left: `${leftPanelSize}%`, right: `${rightPanelSize}%` }}
        className={cn(
          "fixed inset-x-0 top-0 z-[60] h-16 bg-background/50 backdrop-blur-lg lg:z-20",
          !isDragging && "transition-[left,right]",
        )}
      >
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center justify-center gap-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon" variant="ghost">
                  <Link href="/client/issues">
                    <GoHome />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>返回列表</TooltipContent>
            </Tooltip>

            <span className="mr-2 text-xs opacity-40">/</span>

            <h1 className="font-medium">{title}</h1>

            {locked && (
              <Tooltip>
                <TooltipTrigger>
                  <GoLock className="ml-2 opacity-75" size={14} />
                </TooltipTrigger>
                <TooltipContent>页面已锁定，无法编辑</TooltipContent>
              </Tooltip>
            )}
          </div>

          <DevicesProvider>
            {({ selected, select, devices }) => {
              return (
                <div className="flex items-center gap-2">
                  {devices.map(device => (
                    <Button
                      key={device.id}
                      size="sm"
                      variant={selected === device.id ? 'default' : 'ghost'}
                      onClick={() => select(device.id.toString())}
                    >
                      {device.getName()}
                    </Button>
                  ))}
                </div>
              )
            }}
          </DevicesProvider>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onPublish} size="sm">
              发布
            </Button>
            <Button size="sm" onClick={onSave}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
