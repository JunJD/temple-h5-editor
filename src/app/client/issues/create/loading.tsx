import { ArrowLeft } from 'lucide-react'

import IssueFormSkeleton from '@/components/issue/issue-form-skeleton'

export default function CreateLoading() {
  return (
    <section>
      <div className='flex gap-1 items-center '>
        <ArrowLeft size={18} />
        Back
      </div>
      <div className='max-w-3xl mx-auto'>
        <header className='my-4 md:my-8'>
          <h1 className='font-bold text-2xl'>Add Issue</h1>
        </header>
        <IssueFormSkeleton />
      </div>
    </section>
  )
}
