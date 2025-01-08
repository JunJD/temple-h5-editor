'use client'

import BuilderEditor from '@/components/builder/editor'

import Template from '@/components/animated-template'

export default function EditIssueLayout({ children }: { children: React.ReactNode }) {
  return (
    <Template>
      <BuilderEditor>{children}</BuilderEditor>
    </Template>
  )
}
