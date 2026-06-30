<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# CMS work — read the agent memory first

Before changing anything CMS-related (Payload globals/collections, `scripts/seed.ts`,
content migration, image uploads, roles), read **`docs/CMS-AGENT-MEMORY.md`**. It
holds the hard rules (prod reseed must run before deploy; never point dev/seed at
Neon; `payload generate:types` CLI is broken so hand-maintain `payload-types.ts`),
the regression-proof migration pattern, the local test recipe, and the remaining
backlog. Human report: `docs/CMS-MIGRATION-2026-06-30.md`. Ops: `docs/CMS-BETRIEB.md`.
