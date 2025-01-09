'use server'
import { revalidatePath } from 'next/cache'
import { actionData } from 'atomic-utils'

import { prisma } from '@/lib/prisma'

export async function updateIssue(id: string, content: {
    html: string
    css: string
    projectData: any
}) {
    try {
        const newIssue = await prisma.issue.update({
            where: {
                id: id
            },
            data: {
                content: {
                    html: content.html,
                    css: content.css,
                    projectData: content.projectData
                }
            }
        })

        revalidatePath(`/client/issues/${id}`)
        return actionData(newIssue)
    } catch (error) {
        console.error('Issue creation failed:', error instanceof Error ? error.message : String(error))
        return {
            status: 500
        }
    }
}
