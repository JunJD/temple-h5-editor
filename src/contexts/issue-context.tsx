'use client'

import { Issue } from '@/schemas'
import { createContext, useContext } from 'react'
import { publishIssueAction } from '@/actions/issue'
import { toast } from '@/hooks/use-toast'

interface IssueContextType {
  issue: Issue | null,
  loading: boolean,
  setIssue: (issue: Issue | null) => void
}

const IssueContext = createContext<IssueContextType | undefined>(undefined)

export function useIssue() {

  const context = useContext(IssueContext)
  if (context === undefined) {
    throw new Error('useIssue must be used within a IssueProvider')
  }
  return context
}

export function usePublishIssue() {

  const context = useContext(IssueContext)
  if (context === undefined) {
    throw new Error('usePublishIssue must be used within a IssueProvider')
  }
  const setIssue = context.setIssue
  const issue = context.issue

  return async () => {

    if (!issue?.id) return
    const updatedIssueData = await publishIssueAction(issue.id)

    if (updatedIssueData.status === 200) {
      const issueData = updatedIssueData.data
      if(!issueData) {
        toast({
          variant: 'destructive',
          title: '发布失败',
          description: '发布失败',
        })
        return
      }
      setIssue({
        ...issue,
        ...issueData,
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
        startTime: issueData!.startTime!,
        endTime: issueData!.endTime!,
        status: issueData!.status as 'draft' | 'published' 
      })
      toast({
        variant: 'default',
        title: '发布成功',
        description: '发布成功',
      })
      window.open(`/h5/${issue.id}`, '_blank')
    } else {
      toast({
        variant: 'destructive',
        title: '发布失败',
        description: '发布失败',
      })
    }
  }
}

export function IssueProvider({
  children,
  value
}: {
  children: React.ReactNode
  value: IssueContextType
}) {
  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>
} 