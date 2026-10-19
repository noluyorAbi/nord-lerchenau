# Contributing

This repository runs a live club website (https://www.svnord.de). Every merge to
`main` deploys to production on Vercel within minutes, so `main` is protected and
changes go through pull requests.

## Setup

Requirements: Bun (version pinned in `package.json` under `packageManager`),
Node 24 (`.nvmrc`), Docker.

```bash
bun install
cp .env.example .env.local      # fill DATABASE_URI, PAYLOAD_SECRET, REVALIDATE_SECRET
bun run db:up                   # local Postgres 17 in Docker
bun run dev                     # first start pushes the schema into the empty DB
bun run seed                    # demo content + admin user (see scripts/seed.ts)
```

Never point a local `.env.local` at the production database. `vercel env pull`
writes production values (including `DATABASE_URI` and a live Blob token) into
`.env.local`; restore the local `DATABASE_URI` afterwards. See
`docs/RUNBOOK.md` for why this matters (Drizzle dev push can rename or drop
production tables).

If you previously ran Postgres 16 locally, the data volume is incompatible with
the 17 image: `bun run db:reset` and seed again.

## Workflow

1. Branch from `main`: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>`.
2. Commit in Conventional Commits style (`feat(scope): ...`, `fix(scope): ...`).
   Code, comments, commits and PRs are in English. Text the club reads (UI copy,
   admin labels, CMS help texts) is German.
3. Before pushing: `bun run check` (format check, lint, typecheck, unit tests).
   `bun run format` fixes formatting.
4. Open a PR against `main`. CI runs the same checks plus a production build
   against an empty Postgres. The PR template asks for deploy notes; fill them.
5. Squash-merge. The branch is deleted automatically.

## Changes that need extra care

- **Payload schema** (fields, collections, globals): production does not run
  Drizzle push and there are no Payload migrations yet. Schema changes ship as
  an additive, idempotent SQL script under `scripts/sql/`, applied to production
  **before** the code deploy. Details and the reasoning in `docs/RUNBOOK.md`.
- **Admin components** referenced by path in the Payload config: after adding or
  moving one, `app/(payload)/admin/importMap.js` must be regenerated and
  committed. `payload generate:importmap` fails here on the `@/` aliases; the
  dev server rewrites the file on a config hot reload, so touch
  `payload.config.ts` while `bun run dev` is running.
- **`NEXT_PUBLIC_*` variables** are inlined at build time; changing one in Vercel
  needs a fresh deployment (Vercel's "Redeploy" reuses the old build
  environment) and a purge of every cache tag; see `docs/RUNBOOK.md`.
- **Generated types**: `bun run payload:generate-types` (the plain Payload CLI
  typegen does not work in this setup).

## Tests

`bun run test` runs Vitest over `tests/` (`tests/lib`, `tests/payload`, `tests/scripts`). Pure logic in `lib/` is expected to
have a test next to its siblings in `tests/lib/`.
