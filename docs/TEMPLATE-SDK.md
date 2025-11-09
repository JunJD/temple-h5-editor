# 模板 SDK 与 React 模板构建

本工程新增了一个模板 SDK（运行时工具）与模板构建链路。按 issueId 管理模板，构建产出仅包含 `index.html + template.css` 两个文件（运行时 JS 内联在 HTML）。

## 目录结构

- `src/templates/h5-sdk/` 模板运行时与通用工具
- `src/templates/<issueId>/template.html` 或 `template.tsx`（二选一，推荐 html，无 SSR）
- `src/templates/<issueId>/template.css` 模板样式（必需）
- `src/templates/<issueId>/runtime.ts` 模板交互逻辑（可选；若缺省则使用默认 h5-lamp 版本）
- `scripts/build-template.ts` 构建脚本（支持按 issueId 构建；如使用 tsx，将在构建时渲染为静态 HTML）
- 产物：`dist/templates/<issueId>/{index.html, template.css}`

## 使用方式

1. 安装依赖（首次或依赖变化时）

```bash
pnpm install
```

2. 构建模板（生成独立 HTML + CSS）

```bash
pnpm template:build -- --id <issueId>
```

输出位置：
- `dist/templates/<issueId>/index.html`
- `dist/templates/<issueId>/template.css`

### 模板资源与 OSS 上传

为使模板可在任意环境稳定加载静态资源（图标/图片等），构建脚本内置“资源自动上传 OSS + 引用替换”为服务端预览地址的能力：

- 放置位置（推荐）：将资源放在 `src/templates/<issueId>/assets/`（例如 `src/templates/abc123/assets/icon.png`）。
- 模板引用方式：在模板 HTML/TSX/CSS 中统一使用相对路径 `./assets/...` 引用资源，例如：
  - HTML/TSX：`<img src="./assets/icon.png" />`
  - CSS：`background-image: url('./assets/bg.jpg');`
- 构建会：
  1) 扫描 `index.html` 和 `template.css` 中所有 `./assets/...` 引用；
  2) 读取文件并计算内容哈希（SHA1 前 12 位），生成对象键：`templates/<issueId>/<sha12>-<原文件名>`；
  3) 覆盖上传至 OSS；
  4) 将 HTML/CSS 中的相对路径替换为服务端预览 URL：`/api/image-assets/preview/<sha12-原文件名>`，与系统现有图片预览一致。
- 备用路径（兼容旧项目）：若未在 `src/templates/<issueId>/assets/` 找到，会回退到 `public/templates/<issueId>/assets/` 或 `public/templates/assets/`。

所需环境变量：

```
ALIYUN_OSS_ACCESS_KEY_ID=
ALIYUN_OSS_ACCESS_KEY_SECRET=
ALIYUN_OSS_BUCKET=
ALIYUN_OSS_REGION=cn-beijing           # 示例
# 可选：自定义域名（已配置 CDN/域名绑定时）
```

注意：
- 仅会扫描并处理以 `./assets/` 开头的相对资源引用；请将需要上传的静态资源统一放入模板目录 `assets/` 并使用相对路径引用。
- 对象键包含 `<issueId>` 与内容哈希，彼此隔离且可重复构建覆盖。

3. 在编辑器中导入模板（可选）

- 如需在 GrapesJS 中一键导入，可扩展插件去读取 `dist/templates/<issueId>/index.html`（目前示例插件默认指向旧的 public 路径，未强依赖此功能时可忽略）。

## 自定义与扩展

- 仅改样式：修改 `src/templates/<issueId>/template.css`，然后 `pnpm template:build -- --id <issueId>`。
- 改结构（无 SSR 推荐）：修改 `src/templates/<issueId>/template.html`。
- 改结构（TSX 可选）：新增/修改 `src/templates/<issueId>/template.tsx`，构建时会渲染为静态 HTML（不引入运行时 SSR）。
- 改交互：修改 `src/templates/<issueId>/runtime.ts`，构建时会被内联到 HTML 尾部（若不存在则回退默认版本）。
- 公共工具：在 `src/templates/h5-sdk` 中新增/调整工具方法。

## 与当前 docs/template.html/.css 的关系

`src/templates/h5-lamp/` 已按 `docs/template.html/.css` 迁移并对齐。你可以基于此为不同 issueId 建立独立目录。

## 下一步可选项

- 多模板支持：在 `src/templates/` 下按文件夹划分多个模板（如 `h5-xxx`），build 脚本增量编译所有模板。
- 主题系统：将颜色变量与间距提取为 CSS 变量/主题配置，一键换肤。
- 数据接口抽象：在 SDK 中抽出 `fetchGoods` / `fetchSubmissions` 接口，支持在构建时注入或运行时覆写。
- GrapesJS 导出器：在导出 HTML 时自动拼接模板 CSS 与 runtime（当前已有第三方导出插件，后续可定制）。

## 注意

- 构建脚本依赖 `tsx` 与 `esbuild`，已加入 `devDependencies`。
- 运行时仍依赖后端接口 `/api/issues/:id/goods`、`/api/submissions`、`/api/payment/create-customer`。
- 不再拷贝到 `public/templates`，产物仅在 `dist/templates/<issueId>`。
