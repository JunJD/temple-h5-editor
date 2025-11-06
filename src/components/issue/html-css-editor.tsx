'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { Button } from '@/components/ui'
import styles from './html-css-editor.module.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 400) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

export default function HtmlCssEditor({
  issueId,
  initialHtml,
  initialCss,
}: {
  issueId: string
  initialHtml?: string
  initialCss?: string
}) {
  const [html, setHtml] = useState(initialHtml || '')
  const [css, setCss] = useState(initialCss || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'preview'|'html'|'css'>('preview')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // 不使用额外语言包，保持基础编辑能力，避免安装依赖
  const htmlExt: any[] = []
  const cssExt: any[] = []

  const previewBase = useMemo(() => `/api/preview/${issueId}?preview=1`, [issueId])
  const refreshIframe = useCallback(() => {
    if (!iframeRef.current) return
    iframeRef.current.src = `${previewBase}&t=${Date.now()}`
  }, [previewBase])

  // Debounced auto-save and refresh preview
  const debouncedAutoSave = useMemo(
    () => debounce(async (h: string, c: string) => {
      try {
        await fetch(`/api/issues/${issueId}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: h, css: c }),
        })
        refreshIframe()
      } catch {}
    }, 1000),
    [issueId, refreshIframe]
  )

  useEffect(() => {
    debouncedAutoSave(html, css)
  }, [html, css, debouncedAutoSave])

  // 不动态导入语言模块，避免编译期模块不存在报错

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/issues/${issueId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css }),
      })
      if (!res.ok) throw new Error('保存失败')
      setSaved(true)
      refreshIframe()
    } finally {
      setSaving(false)
    }
  }

  const indent = (n: number) => '  '.repeat(Math.max(0, n))

  const formatHtml = (input: string) => {
    try {
      const voidTags = new Set([
        'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
      ])
      const tagRe = /<!--[\s\S]*?-->|<\/?([a-zA-Z0-9\-]+)([^>]*)>/g
      let out: string[] = []
      let last = 0
      let level = 0
      let m: RegExpExecArray | null
      while ((m = tagRe.exec(input))) {
        const raw = m[0]
        const text = input.slice(last, m.index)
        const textTrim = text.replace(/\s+/g, ' ').trim()
        if (textTrim) out.push(indent(level) + textTrim)
        if (raw.startsWith('<!--')) {
          out.push(indent(level) + raw)
        } else {
          const tag = m[1]?.toLowerCase() || ''
          const isClosing = raw.startsWith('</')
          const selfClose = /\/>$/.test(raw) || voidTags.has(tag)
          if (isClosing) level = Math.max(0, level - 1)
          out.push(indent(level) + raw)
          if (!isClosing && !selfClose) level++
        }
        last = tagRe.lastIndex
      }
      const rest = input.slice(last).replace(/\s+/g, ' ').trim()
      if (rest) out.push(indent(level) + rest)
      return out.join('\n')
    } catch {
      return input
    }
  }

  const formatCss = (input: string) => {
    try {
      let out = ''
      let level = 0
      let i = 0
      const push = (s: string) => { out += s }
      const newline = () => { out += '\n' + indent(level) }
      while (i < input.length) {
        const ch = input[i]
        const next2 = input.slice(i, i + 2)
        if (next2 === '/*') {
          // copy comment
          const end = input.indexOf('*/', i + 2)
          const seg = end === -1 ? input.slice(i) : input.slice(i, end + 2)
          if (!out.endsWith('\n')) newline()
          push(seg)
          i += seg.length
          newline()
          continue
        }
        if (ch === '{') {
          push(' {')
          level++
          newline()
        } else if (ch === '}') {
          level = Math.max(0, level - 1)
          out = out.trimEnd()
          push('\n' + indent(level) + '}')
          if (i + 1 < input.length) newline()
        } else if (ch === ';') {
          push(';' )
          newline()
        } else if (ch === '\n' || ch === '\r') {
          // normalize
          if (!out.endsWith('\n')) push('\n' + indent(level))
        } else {
          push(ch)
        }
        i++
      }
      return out.replace(/\n{3,}/g, '\n\n').trim() + '\n'
    } catch {
      return input
    }
  }

  const onFormat = () => {
    const newHtml = formatHtml(html)
    const newCss = formatCss(css)
    setHtml(newHtml)
    setCss(newCss)
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Button variant='outline' onClick={onFormat}>一键格式化</Button>
        <Button onClick={save} disabled={saving}>{saving ? '保存中...' : '保存 HTML/CSS'}</Button>
        {saved && <span className='text-sm text-green-600'>已保存</span>}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value='html'>HTML</TabsTrigger>
          <TabsTrigger value='css'>CSS</TabsTrigger>
        </TabsList>

        <TabsContent value='preview'>
        </TabsContent>
        <TabsContent value='html'>
          <div className='border rounded-md overflow-hidden'>
            <div className='px-3 py-2 text-xs text-muted-foreground border-b bg-muted/30'>HTML</div>
            <div className={styles.editorLight}>
              <CodeMirror
                value={html}
                height='72vh'
                theme='light'
                extensions={htmlExt}
                basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                onChange={(v) => setHtml(v)}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value='css'>
          <div className='border rounded-md overflow-hidden'>
            <div className='px-3 py-2 text-xs text-muted-foreground border-b bg-muted/30'>CSS</div>
            <div className={styles.editorLight}>
              <CodeMirror
                value={css}
                height='72vh'
                theme='light'
                extensions={cssExt}
                basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                onChange={(v) => setCss(v)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
