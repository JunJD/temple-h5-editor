"use client"

import { useState } from 'react'
import { Button, Textarea } from '@/components/ui'

export default function ContentUploader({ issueId, initial }: { issueId: string; initial?: { html?: string; css?: string } }) {
  const [html, setHtml] = useState(initial?.html || '')
  const [css, setCss] = useState(initial?.css || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/issues/${issueId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-3'>
      <div>
        <div className='text-sm mb-1 text-muted-foreground'>HTML</div>
        <Textarea className='min-h-40 font-mono' value={html} onChange={e => setHtml(e.target.value)} placeholder='粘贴 HTML 内容' />
      </div>
      <div>
        <div className='text-sm mb-1 text-muted-foreground'>CSS</div>
        <Textarea className='min-h-40 font-mono' value={css} onChange={e => setCss(e.target.value)} placeholder='粘贴 CSS 内容' />
      </div>
      <div className='flex items-center gap-2'>
        <Button disabled={loading} onClick={handleSave}>保存 HTML/CSS</Button>
        {saved && <span className='text-sm text-green-600'>已保存</span>}
      </div>
    </div>
  )
}

