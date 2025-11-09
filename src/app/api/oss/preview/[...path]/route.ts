import { NextResponse } from 'next/server'
import { getOSSClient } from '@/lib/oss'
import { Readable } from 'node:stream'

export async function GET(
  request: Request,
  { params }: { params: { path: string[] | string } }
) {
  try {
    const segs = Array.isArray(params.path) ? params.path : [params.path]
    // key 可能包含多级目录，如 templates/<issueId>/<hash>-file.ext
    const key = decodeURIComponent(segs.join('/'))
    if (!key) {
      return NextResponse.json({ error: '缺少对象键' }, { status: 400 })
    }

    const client = getOSSClient()
    // 轻量日志，便于排错（不包含敏感信息）
    console.info('[oss-preview] fetching', {
      bucket: process.env.ALIYUN_OSS_BUCKET,
      region: process.env.ALIYUN_OSS_REGION,
      key,
    })
    const { stream, res } = await client.getStream(key)
    const headers = new Headers()
    const h = (res && (res as any).headers) || {}
    const ct = h['content-type'] || 'application/octet-stream'
    if (ct) headers.set('Content-Type', ct)
    const len = h['content-length']
    if (len) headers.set('Content-Length', String(len))
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    // Node Readable -> Web ReadableStream
    const webStream = (Readable as any).toWeb ? (Readable as any).toWeb(stream) : (stream as any)
    return new Response(webStream as any, { status: 200, headers })
  } catch (error: any) {
    const msg = error?.message || String(error)
    if (/NoSuchKey|NoSuchKeyError|404/.test(msg)) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
    console.error('OSS preview error:', error)
    return NextResponse.json({ error: 'OSS 预览失败' }, { status: 500 })
  }
}
