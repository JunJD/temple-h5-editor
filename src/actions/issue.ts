'use server'
import { revalidatePath } from 'next/cache'
import { actionData } from 'atomic-utils'

import { prisma } from '@/lib/prisma'
import { issueSchema, Issue, FormConfig } from '@/schemas'
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
    // 1. 找到与 Issue 关联的所有 Submission 的 ID
    const submissionsToDelete = await prisma.submission.findMany({
      where: { issueId: id },
      select: { id: true },
    });
    const submissionIds = submissionsToDelete.map(sub => sub.id);

    // 2. 如果有关联的 Submission，则删除关联的 PaymentLog
    if (submissionIds.length > 0) {
      console.log(`删除 ${submissionIds.length} 个 Submission 关联的 PaymentLog`);
      
      // 分批处理，避免一次性删除太多记录
      const batchSize = 10;
      for (let i = 0; i < submissionIds.length; i += batchSize) {
        const batchIds = submissionIds.slice(i, i + batchSize);
        await prisma.paymentLog.deleteMany({
          where: {
            submissionId: {
              in: batchIds,
            },
          },
        });
        console.log(`已删除 ${Math.min(i + batchSize, submissionIds.length)} / ${submissionIds.length} 个 Submission 的 PaymentLog`);
      }
    }

    // 3. 删除所有关联的 Submission
    console.log(`删除 Issue ${id} 关联的所有 Submission`);
    await prisma.submission.deleteMany({
      where: {
        issueId: id,
      },
    });

    // 4. 最后删除 Issue 本身
    console.log(`删除 Issue ${id}`);
    const deletedIssue = await prisma.issue.delete({
      where: {
        id,
      },
    });

    revalidatePath('/client/issues');

    return actionData(deletedIssue, {
      status: 200,
    });
  } catch (error) {
    console.error('Issue deletion failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Database constraint violation during deletion:', error.code, error.meta);
    }
    return actionData(null, {
      status: 500,
    });
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

export async function updateIssueFormConfig(id: string, newFormConfig: Partial<FormConfig>) {
  const issue = await prisma.issue.findUnique({ where: { id } })
  if (issue) {
    const updatedIssue = await prisma.issue.update({ 
      where: { id }, 
      data: { formConfig: { ...issue.formConfig as FormConfig, ...newFormConfig} }
    })
    return actionData(updatedIssue, { status: 200 })
  }
  return actionData(null, { status: 404 })
}