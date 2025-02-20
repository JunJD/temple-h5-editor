import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { headers } from 'next/headers'

import { Button } from '@/components/ui'
import IssueCard from '@/components/issue/issue-card'
import { IssueSearch } from '@/components/issue/issue-search'

import { prisma } from '@/lib/prisma'
import { RenderList } from 'atomic-utils'
import { FormConfig, WxPayConfig, Issue } from '@/schemas'

export const revalidate = 0

export default async function Issues({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  headers()

  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : undefined
  
  // 改进日期处理逻辑
  let startDate: Date | undefined
  let endDate: Date | undefined
  
  if (typeof searchParams.startDate === 'string' && searchParams.startDate) {
    const parsedStartDate = new Date(searchParams.startDate)
    if (!isNaN(parsedStartDate.getTime())) {
      startDate = parsedStartDate
    }
  }
  
  if (typeof searchParams.endDate === 'string' && searchParams.endDate) {
    const parsedEndDate = new Date(searchParams.endDate)
    if (!isNaN(parsedEndDate.getTime())) {
      endDate = parsedEndDate
    }
  }

  const where: any = {
    AND: []
  }

  // 只在有关键词时添加关键词筛选
  if (keyword) {
    where.AND.push({
      OR: [
        { title: { contains: keyword } },
        { description: { contains: keyword } }
      ]
    })
  }

  // 只在有有效日期时添加日期筛选
  if (startDate) {
    where.AND.push({ createdAt: { gte: startDate } })
  }
  if (endDate) {
    where.AND.push({ createdAt: { lte: endDate } })
  }

  // 如果没有任何筛选条件，使用空对象
  const finalWhere = where.AND.length > 0 ? where : {}

  const issues = await prisma.issue.findMany({
    where: finalWhere,
    include: {
      _count: {
        select: {
          submissions: true
        }
      }
    }
  });

  const issuesWithFormConfig = issues.reverse().map(issue => ({
    formConfig: issue.formConfig as FormConfig,
    startTime: issue.startTime as Date,
    endTime: issue.endTime as Date | undefined,
    wxPayConfig: issue.wxPayConfig as WxPayConfig | undefined,
    createdAt: issue.createdAt as Date,
    updatedAt: issue.updatedAt as Date,
    id: issue.id as string,
    title: issue.title as string,
    content: issue.content as any,
    description: issue.description as string,
    _count: issue._count
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

      <div className="mb-6">
        <IssueSearch />
      </div>

      {issuesWithFormConfig.length === 0 ? (
        <div className='h-72 flex items-center justify-center'>
          <p>No issues to show</p>
        </div>
      ) : (
        <div className='py-4 grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 items-stretch gap-6 rounded-md'>
          <RenderList
            data={issuesWithFormConfig as any}
            render={(issue: Issue & { id: string; _count?: { submissions: number } }) => (
              <IssueCard issue={issue} key={issue.id} />
            )}
          />
        </div>
      )}
    </section>
  )
}
