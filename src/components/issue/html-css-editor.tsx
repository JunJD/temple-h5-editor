'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { html as htmlLang } from '@codemirror/lang-html'
import { css as cssLang } from '@codemirror/lang-css'
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
  // 基础语言高亮
  const htmlExt = useMemo(() => [htmlLang()], [])
  const cssExt = useMemo(() => [cssLang()], [])

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

  // 使用 Prettier 动态导入进行可靠格式化（官方推荐集成方式）
  const onFormat = useCallback(async () => {
    try {
      const [{ default: prettier }, { default: parserHtml }, { default: parserPostcss }] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/html'),
        import('prettier/plugins/postcss'),
      ])

      const [newHtml, newCss] = await Promise.all([
        prettier
          .format(html, {
            parser: 'html',
            plugins: [parserHtml],
          })
          .catch(() => html),
        prettier
          .format(css, {
            parser: 'css',
            plugins: [parserPostcss],
          })
          .catch(() => css),
      ])

      setHtml(newHtml)
      setCss(newCss)
    } catch (e) {
      // 动态导入或格式化失败则静默回退
    }
  }, [html, css])

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
