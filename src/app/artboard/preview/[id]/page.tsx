'use client'

import { useState, useEffect } from 'react'

export default function PreviewPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<{html: string, css: string}>()
  
  useEffect(() => {
    // 加载保存的内容
  }, [])

  return (
    <div>
      <style>{content?.css}</style>
      <div dangerouslySetInnerHTML={{ __html: content?.html }} />
    </div>
  )
} 