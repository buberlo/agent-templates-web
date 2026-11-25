# Roadmap

## Phase 1 (this repository)

Public static site: browse, search, filter, read templates, export per platform, MCP catalog. Content fetched from `buberlo/agent-templates` at build time.

## Phase 2 — Accounts and favorites

- GitHub OAuth login
- Postgres (e.g. Vercel Postgres) storing user favorites and recently viewed templates
- Optional sync of export history per user (no content duplication)

## Phase 3 — Community signal and CLI

- Moderated “real user experience” reports tied to template IDs (not fabricated quotes or star ratings on the marketing site)
- `npx agentstencil add <id> --target hermes` CLI reusing `lib/export` from this repo
- Webhook-triggered rebuilds when the content repo changes (documented in README)

## Non-goals for phase 1

- User-generated templates hosted in this repo
- Review scores or testimonials not sourced from moderated submissions
- Storing template bodies outside the content repository