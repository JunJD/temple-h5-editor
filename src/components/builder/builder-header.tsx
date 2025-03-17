'use client'

import { 
  GoHome,
  GoLock,
  GoSync
} from 'react-icons/go'
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from 'atomic-utils'
import Link from 'next/link'
import { DevicesProvider, useEditorMaybe } from '@grapesjs/react'
import { useParams } from 'next/navigation'
import { updateIssue } from '@/actions/builder'
import { useIssue, usePublishIssue } from '@/contexts/issue-context'
import { useMemo, useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

export const BuilderHeader = () => {
  const { issue } = useIssue()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

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
  
  // 监听自动保存事件
  useEffect(() => {
    if (!editor) return

    const handleBeforeSave = () => {
      setIsSaving(true);
    };

    const handleAfterSave = (data: any) => {
      setIsSaving(false);
      setLastSaved(new Date());
      
      // 根据showToast标志决定是否显示通知
      if (data && data.showToast) {
        toast({
          title: '自动保存成功',
          description: '页面内容已自动保存',
          variant: 'default',
        });
      }
    };

    const handleSaveError = (error: any) => {
      setIsSaving(false);
      
      // 错误总是显示
      toast({
        title: '自动保存失败',
        description: typeof error === 'string' ? error : '保存过程中发生错误',
        variant: 'destructive',
      });
    };

    // 添加事件监听器
    editor.on('autoSave:before', handleBeforeSave);
    editor.on('autoSave:after', handleAfterSave);
    editor.on('autoSave:error', handleSaveError);

    return () => {
      // 移除事件监听器
      editor.off('autoSave:before', handleBeforeSave);
      editor.off('autoSave:after', handleAfterSave);
      editor.off('autoSave:error', handleSaveError);
    };
  }, [editor]);

  const onPublish = () => {
    publishIssue()
  }

  const onPreview = () => {
    window.open(`/h5/${issue?.id}?preview=1`, '_blank')
  }
  
  const onSave = async () => {
    if (!editor) return
    
    setIsSaving(true);

    try {
      const html = editor.getHtml() ?? ''
      const css = editor.getCss() ?? ''

      if(!html || !css) {
        toast({
          title: '保存失败',
          description: '页面内容不能为空',
          variant: 'destructive',
        })
        setIsSaving(false);
        return
      }
      
      const projectData = editor.getProjectData() ?? {}
      await updateIssue(id, { html, css, projectData })
      toast({
        title: '保存成功',
        description: 'Issue已成功保存',
        variant: 'default',
      })
      
      setLastSaved(new Date());
    } catch (error) {
      toast({
        title: '保存失败',
        description: '保存过程中发生错误',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false);
    }
  }

  // 格式化最后保存时间
  const formattedLastSaved = useMemo(() => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    
    // 如果不到1分钟
    if (diff < 60000) {
      return '刚刚保存';
    }
    
    // 如果小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分钟前保存`;
    }
    
    // 今天的其他时间
    if (now.getDate() === lastSaved.getDate() && 
        now.getMonth() === lastSaved.getMonth() &&
        now.getFullYear() === lastSaved.getFullYear()) {
      return `今天 ${lastSaved.getHours().toString().padStart(2, '0')}:${lastSaved.getMinutes().toString().padStart(2, '0')} 保存`;
    }
    
    // 其他日期
    return `${lastSaved.getFullYear()}-${(lastSaved.getMonth()+1).toString().padStart(2, '0')}-${lastSaved.getDate().toString().padStart(2, '0')} ${lastSaved.getHours().toString().padStart(2, '0')}:${lastSaved.getMinutes().toString().padStart(2, '0')} 保存`;
  }, [lastSaved]);

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

            {!locked && (
              <div className="ml-4 flex items-center">
                {isSaving ? (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <GoSync className="mr-1 animate-spin" size={12} />
                    <span>保存中...</span>
                  </div>
                ) : (
                  lastSaved && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                          <span>已保存</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{formattedLastSaved}</TooltipContent>
                    </Tooltip>
                  )
                )}
              </div>
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
            <Button variant="outline" onClick={onPreview} size="sm">
              预览
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
