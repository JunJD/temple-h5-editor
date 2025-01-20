import { ArrowLeft } from 'lucide-react'

import IssueCardSkeleton from '@/components/issue/issue-card-skeleton'
import { Button } from '@/components/ui'

export default function IssuesLoading() {
  return (
    <section className='py-8 px-6 md:px-8'>
      <div className='flex gap-1 items-center '>
        <ArrowLeft size={18} />
        Back
      </div>
      <header className='flex items-center justify-between my-4 md:my-8'>
        <h1 className='font-bold text-2xl'>All Issues</h1>
        <Button size='sm' variant='outline'>
          Create Issue
        </Button>
      </header>
      <div className='py-4 grid  grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-md'>
        <IssueCardSkeleton />
        <IssueCardSkeleton />
        <IssueCardSkeleton />
        <IssueCardSkeleton />
        <IssueCardSkeleton />
        <IssueCardSkeleton />
      </div>
    </section>
  )
}
