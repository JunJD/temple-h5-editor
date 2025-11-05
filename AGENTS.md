# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (Next.js App Router)
  - `src/app/` pages and API routes
  - `src/components/` UI and editor components
  - `src/plugins/` GrapesJS plugins and blocks
  - `src/actions/` server actions; `src/lib/` utilities; `src/styles/` styles
  - Other: `src/hooks/`, `src/contexts/`, `src/store/`, `public/`
- Data: `prisma/schema.prisma` (MongoDB via Prisma)
- Config: `next.config.js`, `tailwind.config.js`, `.prettierrc`
- Docs/assets: `docs/`, `cert/`

## Build, Test, and Development Commands
- Install: `pnpm install`
- Dev server: `pnpm dev` (generates Prisma client, runs Next at 3000)
- Build: `pnpm build`
- Start: `pnpm start`
- DB tools: `pnpm prisma:generate`, `pnpm prisma:studio`, `pnpm db:push`, `pnpm db:deploy`
- Docker (optional): `docker-compose up -d` (requires env vars; see compose file)

## Coding Style & Naming Conventions
- Language: TypeScript + React 18, Next.js 14 (App Router)
- Formatting: Prettier enforced
  - Single quotes, no semicolons, no trailing commas, JSX single quotes
- Indentation: 2 spaces
- Naming: files `kebab-case.ts(x)`; components `PascalCase`; variables/functions `camelCase`.
- UI: Tailwind CSS; prefer utility classes with `cn()` helper when composing.

## Testing Guidelines
- No test suite is committed yet. If adding logic or complex UI, include tests.
- Recommended: Vitest + React Testing Library.
- Location: `src/**/__tests__` or `*.test.ts(x)` adjacent to source.
- Add `"test": "vitest"` to `package.json` and run with `pnpm test`.

## Commit & Pull Request Guidelines
- Commit style follows Conventional Commits seen in history: `feat: ...`, `fix: ...`, `refactor: ...` (messages may be in Chinese or English).
- Keep commits scoped and descriptive; reference issues (e.g., `feat: 支持音频资源上传 (#123)`).
- PRs must include:
  - Summary, scope, and screenshots/GIFs for UI changes
  - Notes on DB changes (Prisma schema/migrations) and env vars
  - Checklist: ran `pnpm build`, basic smoke test locally

## Security & Configuration Tips
- Required envs: `MONGO_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Google OAuth, WeChat Pay, and Aliyun OSS variables (see `docker-compose.yml`/`Dockerfile`). Do not commit secrets.
- Certificates for payments live in `cert/`; reference via env paths.
- Prefer server actions for sensitive operations; avoid exposing secrets to the client.

