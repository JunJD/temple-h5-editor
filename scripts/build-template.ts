/* Build template to standalone HTML + CSS by issueId */
import fs from 'node:fs'
import path from 'node:path'
import * as esbuild from 'esbuild'

const ROOT = process.cwd()
const templatesRoot = path.join(ROOT, 'src', 'templates')

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true })
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
  const args = process.argv.slice(2)
  let issueId = ''
  for (const a of args) {
    if (a.startsWith('--id=')) issueId = a.slice(5)
    else if (a.startsWith('--issue=')) issueId = a.slice(8)
    else if (!a.startsWith('--') && !issueId) issueId = a
  }
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
  <body class="h5-page" style="padding:12px;">
    ${bodyInner}
    <script>(function(){${runtime}})();</script>
  </body>
</html>`

  // 4) Write outputs (no copy to public)
  const cssSrc = path.join(srcDir, 'template.css')
  if (!fs.existsSync(cssSrc)) throw new Error(`Missing CSS: ${cssSrc}`)
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8')
  fs.copyFileSync(cssSrc, path.join(outDir, 'template.css'))

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
