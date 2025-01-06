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
    content: {},
    formConfig: {},
    wxPayConfig: {},
    startTime: new Date(),
    endTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function createIssue(issue: any) {
  try {
    const validation = issueSchema.safeParse(issue)

    if (validation.success) {
      const newIssue = await prisma.issue.create({
        data: assembleIssue(validation.data)
      })

      revalidatePath('/issues')
      return actionData(newIssue)
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

    revalidatePath('/issues')

    /**
     * actionResult formats a response so http-react can read data, status code and error
     * The code below will be formated as { data: deletedPost, status: 200 }.
     * You can ommit the status part like this `return actionResult(deletedPost)`
     */
    return actionData(deletedIssue, {
      status: 200
    })
  } catch {
    return {
      status: 500
    }
  }
}
