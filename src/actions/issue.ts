'use server'
import { revalidatePath } from 'next/cache'
import { actionData } from 'atomic-utils'

import { prisma } from '@/lib/prisma'
import { issueSchema, Issue } from '@/schemas'
import { Issue as PrismaIssue, Prisma } from '@prisma/client'

const assembleIssue: (issue: Partial<Issue>) => Prisma.IssueCreateInput = (issue) => {
  return {
    title: issue.title || '',
    description: issue.description || '',
    content: issue.content || {},
    status: issue.status || 'draft',
    formConfig: issue.formConfig || {},
    wxPayConfig: issue.wxPayConfig || {},
    startTime: issue.startTime || new Date(),
    endTime: issue.endTime || new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

type createIssueDto = Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>

export async function createIssue(issue: createIssueDto) {
  try {
    const validation = issueSchema.safeParse(issue)

    if (validation.success) {
      const newIssue = await prisma.issue.create({
        data: assembleIssue(validation.data)
      })
      revalidatePath('/client/issues')
      return actionData(newIssue, { status: 200 })
    }

    return actionData(validation.error.format(), {
      status: 400
    })
  } catch (error) {
    console.error('Issue creation failed:', error instanceof Error ? error.message : String(error))
    return {
      status: 500
    }
  }
}

export async function deleteIssue(id: string) {
  try {
    const deletedIssue = await prisma.issue.delete({
      where: {
        id: id
      }
    })

    revalidatePath('/client/issues')

    /**
     * actionResult formats a response so http-react can read data, status code and error
     * The code below will be formated as { data: deletedPost, status: 200 }.
     * You can ommit the status part like this `return actionResult(deletedPost)`
     */
    return actionData(deletedIssue, {
      status: 200
    })
  } catch {
    return actionData(null, {
      status: 500
    })
  }
}

export async function getIssue(id: string) {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id }
    })
    return actionData(issue, { status: 200 })
  } catch (error) {
    console.error('Issue fetch failed:', error instanceof Error ? error.message : String(error))
    return actionData(null, {
      status: 500
    })
  }
}

export async function publishIssueAction(id: string) {
  const issue = await prisma.issue.findUnique({ where: { id } })
  if (issue) {
    const updatedIssue = await prisma.issue.update({ 
      where: { id }, 
      data: { status: issue.status === 'published' ? 'draft' : 'published' }
    })
    return actionData(updatedIssue, { status: 200 })
  }
  return actionData(null, { status: 404 })
}