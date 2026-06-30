# Agent memory — CMS customer-editable migration

Read this before touching the CMS on the `feat/cms-customer-editable` branch.
Full human report: `docs/CMS-MIGRATION-2026-06-30.md`. Ops runbook: `docs/CMS-BETRIEB.md`.

## State (2026-06-30)

This branch turned the Payload CMS from display-only into customer-operable.
Code is **done and locally tested** (tsc/lint/prettier/tests green, 28 pages
smoke-tested, CMS reads marker-verified). **Prod is NOT activated yet** — that
needs console/ops steps (Blob, Resend, the prod reseed). Globals 9 -> 18.

## HARD RULES (do not violate)

1. **Schema-push (prod reseed) MUST run before the code deploy.** There are no
   migration files; the prod schema evolves only via drizzle dev-push run through
   the seed. New columns are additive/backward-compatible, so: reseed prod (adds
   columns) -> old prod keeps running -> THEN merge/deploy. Deploying code that
   references a new column before the column exists = site-wide 500.
   Prod reseed: `ALLOW_PROD_SEED=true PAYLOAD_ADMIN_PASSWORD=… bun --env-file=.env.local.production scripts/seed.ts`
2. **Never point dev/seed at Neon.** `.env.local.*` files contain the prod Neon
   URI; dev-push against it alters the prod schema. The seed has a guard
   (`assertSeedTargetIsAllowed`) that refuses a Neon URI unless `ALLOW_PROD_SEED=true`.
   For local work `.env.local` must point at localhost Postgres.
3. **`payload generate:types` / `generate:importmap` CLI is broken** (Node 24 +
   tsx cannot resolve the extensionless `./payload/collections/*` imports).
   `next build`/withPayload is fine. So **hand-maintain `payload-types.ts`** when
   you add fields. The Blob client component IS already in `importMap.js`.
4. **Don't blindly wire a populated CMS field.** The prod DB is seeded; a field
   may hold stale values. Check the prod value before wiring, or seed the correct
   value. Use the regression-proof pattern below.

## The regression-proof migration pattern (use for all remaining backlog)

For each hardcoded block:

1. Add the CMS field in the right global/collection with `defaultValue` = the
   EXACT current hardcoded value. German label + admin.description.
2. Frontend reads `cms.field ?? HARDCODE_CONSTANT` — keep the original hardcoded
   values as fallback constants in the code. Page must render identically when the
   field is empty -> zero regression.
3. Seed the field with the current value (so the admin shows it; the prod reseed
   makes it authoritative).
4. Update `payload-types.ts` by hand. Run `bunx tsc --noEmit`.
5. Verify with a **marker test**: write a distinct value into the DB column,
   curl the page, confirm it appears (proves CMS-read, not just fallback), revert.

## How the migration batches were run (repeat for more pages)

Worktree-isolated agents via the Workflow tool, one page each, self-verifying
`tsc`. Each returns: full content of its new global file + rewritten page file,
plus snippets for the 3 shared files. I integrate centrally:

- `payload.config.ts`: add `import { XPage }` + add `XPage,` to the `globals: []` array.
- `payload-types.ts`: add `export interface XPage {…}` + `export interface XPageSelect<…>{…}`;
  add the slug to BOTH the `Config.globals` and `Config.globalsSelect` maps (follow FaqPage/"faq-page").
- `scripts/seed.ts`: add `await payload.updateGlobal({ slug, data: {…} as never })` in main()'s globals section (before `seedSportPages`).
- Then central `bunx tsc --noEmit`, reseed locally, restart dev, smoke + marker test.

The agent worktrees branch from the base commit (not uncommitted work), so keep
their pages disjoint from yours; integration stays additive.

## Local test recipe

```bash
set -a; source .env.local; set +a   # localhost Postgres, BLOB token must be commented out
export PAYLOAD_ADMIN_PASSWORD=LocalDev_test
bun run scripts/seed.ts             # idempotent; pushes schema + seeds
bun run dev                         # http://localhost:3000 ; /admin works
```

Local DB: native `postgresql@18` on 5432, role `svnord`/`svnord_dev`, db `svnord`.
Pages are all `force-dynamic` -> CMS edits show immediately, no revalidation needed.

## What is done (editable now)

All collections (news/events/sponsors/people/teams/contact/faq/vereinsheim/
jugendfoerder), home (hero text + hero slideshow upload + stats + sportsGrid +
section toggles), 5 sport pages (`Teams.sportPage`), and 9 page globals:
`mitgliedschaft-page`, `verein-page`, `sponsoren-page`, `jugendschutz-page`,
`shop-page`, `sport-overview-page`, `fussball-page`, `fussball-categories`,
`vorstand-page`. Termine: Sommerfest + Betreuer-Essen are real Events records.

## Deferred backlog (NOT done — with reason; finish with the pattern above)

- **Impressum/Datenschutz**: `legal-pages` global exists + is seeded (editable in
  admin), but the frontend renders a designed structured `app/(frontend)/{impressum,datenschutz}/_content.ts`
  (kv-tables, callouts, icons via `components/legal/LegalSections`). Naive wiring
  downgrades the design. Sensitive (compliance) — migrate the structured schema AND
  verify text equivalence first. Highest-priority deferred item.
- **Chronik narrative** (`components/chronik/*`, `chronik-page` global exists): custom
  component, ~0 churn. High effort, low value.
- **InstagramTeaser** (`components/home/InstagramTeaser.tsx`, ~900 lines): semi-external.
- **SEO JSON-LD** (`components/seo/SiteSchema.tsx`) + **Footer credit** (`components/site/Footer.tsx`): technical/dev, club never edits.
- **PageHero intro ledes** (per route, `components/PageHero.tsx`) + **BFV-Formulare** (`lib/bfv-formulare.ts`): scattered boilerplate / external links.

## Key files

- Storage/roles/db guards: `payload.config.ts`, `lib/publicUploads.ts`,
  `payload/access/isAdmin.ts`, `payload/collections/{Users,Submissions}.ts`.
- richText render: `lib/lexical.ts`.
- New globals: `payload/globals/*Page.ts` (+ `FussballCategoriesPage.ts`).
- Seed (authoritative, idempotent): `scripts/seed.ts` (`seedSportPages` only fills empty).
- Env flags: `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA`, `ALLOW_PROD_SEED` (see `.env.example`).
