import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import IssueForm from '@/components/issue/issue-form'

export default function Create() {
  return (
    <section className='py-8 px-6 md:px-8'>
      <Link href='/client/issues' className='flex gap-1 items-center max-w-min'>
        <ArrowLeft size={18} />
        Back
      </Link>
      <div className='max-w-3xl mx-auto'>
        <header className='my-4 md:my-8'>
          <h1 className='font-bold text-2xl'>Add Issue</h1>
        </header>
        <IssueForm />
      </div>
    </section>
  )
}
