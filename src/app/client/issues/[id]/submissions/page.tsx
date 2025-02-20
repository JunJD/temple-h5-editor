import { SubmissionTable } from '@/components/issue/submission-table';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Issue, Submission } from '@/schemas';

interface Props {
  params: {
    id: string;
  };
}

export default async function IssueSubmissionsPage({ params }: Props) {
  const issue: Issue | null = await prisma.issue.findUnique({
    where: { id: params.id },
    include: {
      submissions: true,
    },
  }) as Issue | null;

  if (!issue) {
    notFound();
  }

  return (
    <section className="container mx-auto py-8">
      <Link href="/client/issues" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </Link>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <p className="text-muted-foreground mt-1">提交记录 ({issue.submissions!.length})</p>
        </div>

        {issue.submissions!.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无提交记录
          </div>
        ) : (
          <SubmissionTable submissions={issue.submissions as Submission[]} />
        )}
      </div>
    </section>
  );
}