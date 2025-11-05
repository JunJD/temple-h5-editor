'use client'

export default function PreviewPage({ params }: { params: { id: string } }) {
  const src = `/api/preview/${params.id}?preview=1`
  return (
    <iframe
      src={src}
      style={{ border: 'none', width: '100%', height: '100vh' }}
      title="页面预览"
    />
  )
}
