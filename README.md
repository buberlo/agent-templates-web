# agent-templates-web

Public website for [buberlo/agent-templates](https://github.com/buberlo/agent-templates): browse, search, and export reusable AI agent instruction templates.

**Phase 1** — static generation, no database, no accounts. All template content is read from the content repository at build time.

## Local development

### Requirements

- Node.js 20+
- `git` (to shallow-clone the content repo)
- Python 3 (optional; used if `catalog.json` is missing in the content clone)

### Setup

```bash
npm install
cp .env.example .env.local   # optional overrides
npm run dev
```

`predev` / `prebuild` run `npm run fetch-content`, which clones or updates:

| Variable | Default |
|----------|---------|
| `CONTENT_REPO_URL` | `https://github.com/buberlo/agent-templates.git` |
| `CONTENT_REPO_REF` | `main` |
| `CONTENT_CACHE_DIR` | `.content-cache` (project root) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (set for canonical URLs / sitemap in production) |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run fetch-content` | Clone/update content repo |
| `npm run dev` | Dev server |
| `npm run build` | Production build (SSG) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Vercel deployment

1. Import this GitHub repository in Vercel.
2. Framework preset: **Next.js**.
3. Set environment variables:
   - `NEXT_PUBLIC_SITE_URL` → your production URL (e.g. `https://agent-templates.example.com`)
   - Optionally `CONTENT_REPO_REF` to pin a branch or tag.
4. Build command: `npm run build` (default). Install runs `prebuild` → content fetch on Vercel builders (git is available).

### Rebuild when content changes

The content repo should trigger a new deployment when `main` changes:

1. In Vercel: Project → Settings → Git → **Deploy Hooks** → create a hook URL.
2. In **agent-templates** GitHub repo: add secret `DEPLOY_HOOK_URL` and workflow from [`docs/content-repo-rebuild-hook.example.yml`](docs/content-repo-rebuild-hook.example.yml).

Do not commit the deploy hook URL into either repository.

## Architecture

- **`scripts/fetch-content.mjs`** — shallow clone of the content repository.
- **`lib/content/`** — parse frontmatter, bilingual section headings (German/English), catalog + MCP loaders.
- **`lib/export/`** — platform exports (Hermes/OpenClaw `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, Cursor `.mdc`, generic prompt). Intended for reuse by a future CLI.
- **Pages** — landing, catalog (client-side FlexSearch index), domain/category, template detail, MCP table.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for phases 2 (GitHub login + Postgres favorites) and 3 (moderated experience reports + `npx agent-templates add`).

## License

Same as the parent project; template content remains in the content repository.