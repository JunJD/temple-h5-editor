import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Link from 'next/link';

interface ViewSubmissionsButtonProps {
  issueId: string;
  submissionsCount?: number;
}

export function ViewSubmissionsButton({ issueId, submissionsCount }: ViewSubmissionsButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
    >
      <Link href={`/client/issues/${issueId}/submissions`} className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        提交记录
        {typeof submissionsCount === 'number' && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
            {submissionsCount}
          </span>
        )}
      </Link>
    </Button>
  );
} 