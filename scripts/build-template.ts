/* Build template to standalone HTML + CSS by issueId */
import fs from 'node:fs'
import path from 'node:path'
import * as esbuild from 'esbuild'
import crypto from 'node:crypto'
import { prisma } from '@/lib/prisma'

const ROOT = process.cwd()
const templatesRoot = path.join(ROOT, 'src', 'templates')

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true })
}

function loadEnvFromDotenv() {
  try {
    const envPath = path.join(ROOT, '.env')
    if (!fs.existsSync(envPath)) return
    const content = fs.readFileSync(envPath, 'utf8')
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx <= 0) continue
      const key = line.slice(0, idx).trim()
      let rawVal = line.slice(idx + 1).trim()
      const quoted = (rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))
      let val = rawVal
      if (quoted) {
        val = rawVal.slice(1, -1)
      } else {
        // 去掉未加引号值中的行内注释（# 之后的内容）
        const hashIdx = rawVal.indexOf('#')
        if (hashIdx >= 0) {
          val = rawVal.slice(0, hashIdx).trim()
        }
      }
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {}
}

async function buildRuntimeIIFE(entry: string) {
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2018'],
    globalName: 'LampTemplate',
  })
  const js = result.outputFiles?.[0]?.text ?? ''
  return js
}

async function main() {
  // 尝试从 .env 加载环境变量（脚本执行环境不一定自动加载）
  loadEnvFromDotenv()
  const args = process.argv.slice(2)
  let issueId = ''
  // 默认不复制本地资源（强制走远程）
  // 简化：不支持本地兜底，统一走远程上传
  for (const a of args) {
    if (a.startsWith('--id=')) issueId = a.slice(5)
    else if (a.startsWith('--issue=')) issueId = a.slice(8)
    // no-op: 不再支持 --local-assets 兜底
    else if (!a.startsWith('--') && !issueId) issueId = a
  }
  // 不再支持 TEMPLATE_COPY_ASSETS/TEMPLATE_SKIP_COPY_ASSETS
  if (!issueId) {
    console.error('Usage: pnpm template:build -- --id <issueId>')
    process.exit(1)
  }

  const srcDir = path.join(templatesRoot, issueId)
  const outDir = path.join(ROOT, 'dist', 'templates', issueId)
  ensureDir(outDir)

  // 1) Read body: prefer template.html, else template.tsx rendered at build-time
  const htmlPath = path.join(srcDir, 'template.html')
  const tsxPath = path.join(srcDir, 'template.tsx')
  let bodyInner = ''
  if (fs.existsSync(htmlPath)) {
    bodyInner = fs.readFileSync(htmlPath, 'utf8')
  } else if (fs.existsSync(tsxPath)) {
    const React = await import('react')
    const ReactDOMServer = await import('react-dom/server')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore dynamic import from absolute path
    const mod = await import(path.relative(__dirname, tsxPath))
    const Tpl = mod.default
    bodyInner = ReactDOMServer.renderToStaticMarkup(React.createElement(Tpl, {}))
  } else {
    throw new Error(`No template.html or template.tsx found in ${srcDir}`)
  }

  // 2) Bundle runtime (per-issue if exists, else fallback)
  const runtimeEntry = fs.existsSync(path.join(srcDir, 'runtime.ts'))
    ? path.join(srcDir, 'runtime.ts')
    : path.join(templatesRoot, 'h5-lamp', 'runtime.ts')
  const runtime = await buildRuntimeIIFE(runtimeEntry)

  // 3) Compose full HTML document
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>H5 模板</title>
    <link rel="stylesheet" href="./template.css" />
  </head>
  <body class="h5-page" >
    ${bodyInner}
    <script>(function(){${runtime}})();</script>
  </body>
</html>`

  // 4) Write outputs (no copy to public)
  const cssSrc = path.join(srcDir, 'template.css')
  if (!fs.existsSync(cssSrc)) throw new Error(`Missing CSS: ${cssSrc}`)
  let finalHtml = html
  let finalCss = fs.readFileSync(cssSrc, 'utf8')

  // 4.1) 收集并上传 assets 到 OSS（与 issueId 关联，避免重复）
  const assetRefs = new Set<string>()
  const collect = (text: string, re: RegExp) => {
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      assetRefs.add(m[1])
    }
  }
  // 形如 ./assets/xxx
  collect(finalHtml, /src=["'](\.\/assets\/[^"']+)["']/g)
  collect(finalHtml, /href=["'](\.\/assets\/[^"']+)["']/g)
  collect(finalCss, /url\((?:'|")?(\.\/assets\/[^'"\)]+)(?:'|")?\)/g)

  const uploaded = new Map<string, string>()
  const hasOssEnv = Boolean(process.env.ALIYUN_OSS_ACCESS_KEY_ID && process.env.ALIYUN_OSS_ACCESS_KEY_SECRET && process.env.ALIYUN_OSS_BUCKET && process.env.ALIYUN_OSS_REGION)
  if (!hasOssEnv) {
    console.error('[build-template] Missing OSS env. Required: ALIYUN_OSS_ACCESS_KEY_ID, ALIYUN_OSS_ACCESS_KEY_SECRET, ALIYUN_OSS_BUCKET, ALIYUN_OSS_REGION')
    process.exit(1)
  }
  let oss: any
  try {
    oss = await import('@/lib/oss')
  } catch (err: any) {
    console.error('[build-template] OSS initialization failed:', err?.message || err)
    process.exit(1)
  }

  for (const rel of assetRefs) {
    const stripped = rel.replace(/^\.\//, '') // e.g. assets/xxx.png
    // Prefer assets colocated with the template: src/templates/<issueId>/assets/...
    const cand1 = path.join(srcDir, stripped)
    console.log('cand1', cand1)
    const localPath = [cand1].find(p => fs.existsSync(p))
    console.log('localPath', localPath)
    if (!localPath) {
      console.warn('[build-template] asset not found in candidates:', { rel, cand1 })
      continue
    }
    const buf = fs.readFileSync(localPath)
    const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12)
    const base = path.basename(localPath)
    const key = `templates/${issueId}/${hash}-${base}`
    // 始终覆盖上传
    const remoteUrl: string = await oss.uploadToOSS(buf, key)
    const filename = path.basename(key)
    // 确保 /api/image-assets/preview 可用：写入或更新数据库映射
    try {
      const exist = await prisma.imageAsset.findFirst({ where: { url: { endsWith: filename } } })
      if (exist) {
        await prisma.imageAsset.update({ where: { id: exist.id }, data: { url: remoteUrl, name: base } })
      } else {
        await prisma.imageAsset.create({ data: { name: base, url: remoteUrl } })
      }
    } catch (e) {
      console.warn('[build-template] Failed to upsert ImageAsset for', filename, e)
    }
    // 构建时统一返回与现有系统一致的预览路径（服务端代理）
    const serverUrl = `/api/image-assets/preview/${encodeURIComponent(filename)}`
    uploaded.set(rel, serverUrl)
  }
  // 已在上方缺失 OSS env 时直接退出

  // 4.2) 将相对路径替换为 OSS URL
  for (const [rel, url] of uploaded) {
    const esc = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    finalHtml = finalHtml.replace(new RegExp(esc, 'g'), url)
    finalCss = finalCss.replace(new RegExp(esc, 'g'), url)
  }

  // 写出文件
  fs.writeFileSync(path.join(outDir, 'index.html'), finalHtml, 'utf8')
  fs.writeFileSync(path.join(outDir, 'template.css'), finalCss, 'utf8')

  // 不复制本地资源；如有历史残留则清理 dist/assets
  const outAssets = path.join(outDir, 'assets')
  if (fs.existsSync(outAssets)) {
    try { fs.rmSync(outAssets, { recursive: true, force: true }) } catch {}
  }

  // Log summary
  console.log('Built template:')
  console.log(' -', path.relative(ROOT, path.join(outDir, 'index.html')))
  console.log(' -', path.relative(ROOT, path.join(outDir, 'template.css')))
  console.log(`Source: ${path.relative(ROOT, srcDir)}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
