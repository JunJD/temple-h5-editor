'use client'

import { FormConfig, Issue } from '@/schemas'
import { createContext, useContext } from 'react'
import { publishIssueAction, updateIssueFormConfig } from '@/actions/issue'
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

export function useUpdateFormConfigField() {
  const context = useContext(IssueContext)
  if (context === undefined) {
    throw new Error('useUpdateFormConfigField must be used within a IssueProvider')
  }
  const setIssue = context.setIssue
  const issue = context.issue

  return async (newFormConfig: Partial<FormConfig>) => {
    if (!issue?.id) return
    const updatedIssueData = await updateIssueFormConfig(issue.id, newFormConfig)

    if (updatedIssueData.status === 200) {
      const issueData = updatedIssueData.data
      if(!issueData) {
        toast({
          variant: 'destructive',
          title: '更新失败',
          description: '更新表单字段失败',
        })
        return
      }
      setIssue({
        ...issue,
        ...issueData,
        formConfig: issue.formConfig as FormConfig,
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
        title: '更新成功',
        description: '更新表单字段成功',
      })

    } else {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '更新表单字段失败',
      })
    }
  }
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
        formConfig: issue.formConfig as FormConfig,
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