import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { headers } from 'next/headers'

import { Button } from '@/components/ui'
import IssueCard from '@/components/issue/issue-card'

import { prisma } from '@/lib/prisma'
import { RenderList } from 'atomic-utils'
import { FormConfig, WxPayConfig } from '@/schemas'

export const revalidate = 0

export default async function Issues() {
  headers()

  const issues = (await prisma.issue.findMany({})).reverse()

  const issuesWithFormConfig = issues.map(issue => ({
    formConfig: issue.formConfig as FormConfig,
    startTime: issue.startTime as Date,
    endTime: issue.endTime as Date | undefined,
    wxPayConfig: issue.wxPayConfig as WxPayConfig | undefined,
    createdAt: issue.createdAt as Date,
    updatedAt: issue.updatedAt as Date,
    id: issue.id as string,
    title: issue.title as string,
    content: issue.content as any,
    description: issue.description as string
  }))
  
  return (
    <section className='py-8 px-6 md:px-8'>
      <Link href='/' className='flex gap-1 items-center max-w-min'>
        <ArrowLeft size={18} />
        Back
      </Link>
      <header className='flex items-center justify-between my-4 md:my-8'>
        <h1 className='font-bold text-2xl'>All Issues</h1>
        <Link href='/client/issues/create'>
          <Button size='sm' variant='outline'>
            Create Issue
          </Button>
        </Link>
      </header>

      {issuesWithFormConfig.length === 0 ? (
        <div className='h-72 flex items-center justify-center'>
          <p>No issues to show</p>
        </div>
      ) : (
        <div className='py-4 grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 items-stretch gap-6 rounded-md'>
          <RenderList
            data={issuesWithFormConfig}
            render={issue => <IssueCard issue={issue as any} key={issue.id} />}
          />
        </div>
      )}
    </section>
  )
}
