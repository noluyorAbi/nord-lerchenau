# SV Nord München-Lerchenau: club website

Website and CMS of SV Nord München-Lerchenau e.V., a multi-sport club in Munich.
One Next.js application with Payload CMS mounted inside it: the public site and
the admin share one deployment, one Postgres database and one media store.
Content is maintained by the club in the admin; fixtures, tables and squads are
pulled from BFV, fussball.de and FuPa.

- Live: https://www.svnord.de
- Admin: https://www.svnord.de/admin (two accounts, both full admins)

Every merge to `main` deploys to production. Read
[Before you deploy](#before-you-deploy) first.

## Stack

| Layer     | Choice                                                   |
| --------- | -------------------------------------------------------- |
| Framework | Next.js 16.2, App Router                                 |
| UI        | React 19, TypeScript strict                              |
| Styling   | Tailwind CSS v4                                          |
| CMS       | Payload 3.91, admin at `/admin`, German-only UI          |
| Database  | Postgres: Neon in production, Docker Postgres 17 locally |
| Media     | Vercel Blob in production, `public/uploads/` locally     |
| Mail      | Resend (contact form)                                    |
| AI        | OpenAI Chat Completions (`/api/chat`, club assistant)    |
| Tooling   | Bun, Vitest, ESLint, Prettier, husky                     |
| Hosting   | Vercel                                                   |

## Quick start

Requirements: Bun, Node 24 (`.nvmrc`), Docker.

```bash
bun install                  # also installs the git hooks (husky)
cp .env.example .env.local   # fill DATABASE_URI, PAYLOAD_SECRET, REVALIDATE_SECRET
bun run db:up                # local Postgres 17 in Docker
bun run dev                  # http://localhost:3000, first start pushes the schema
PAYLOAD_ADMIN_PASSWORD=... bun run seed   # demo content + admin@svnord.de
```

`bun run seed` skips the admin user without `PAYLOAD_ADMIN_PASSWORD` and refuses
any non-local database unless `SEED_ALLOW_REMOTE=true` is set (do not set it). Never point `.env.local` at production: `vercel env pull`
writes the production `DATABASE_URI` and a live Blob token into it. See
[docs/RUNBOOK.md](docs/RUNBOOK.md#local-development-traps).

## Scripts

| Script                              | What it does                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `bun run dev`                       | Next.js dev server (pushes the schema into the local database on start)                    |
| `bun run build`                     | DB preflight, then production build (prerenders against the database)                      |
| `bun run check`                     | Format check, lint, typecheck, unit tests                                                  |
| `bun run format`                    | Prettier, writes                                                                           |
| `bun run lint`                      | ESLint                                                                                     |
| `bun run typecheck`                 | `tsc --noEmit`                                                                             |
| `bun run test`                      | Vitest over `tests/`                                                                       |
| `bun run db:up` / `db:down`         | Start / stop the local Postgres container                                                  |
| `bun run db:reset`                  | Drop the local volume and start fresh (destructive, local only)                            |
| `bun run db:push-schema`            | Create the schema in an empty database (CI); no-op on a populated one                      |
| `bun run seed`                      | Bootstrap a fresh local database. Never against production                                 |
| `bun run media-usage`               | List media documents nothing references (read only)                                        |
| `bun run payload:generate-types`    | Regenerate `payload-types.ts` (the plain Payload CLI typegen fails here)                   |
| `bun run legal-pages-aktualisieren` | Rewrite Impressum and Datenschutz in the CMS from `app/(frontend)/datenschutz/_content.ts` |

One-off and historical scripts are listed in
[docs/RUNBOOK.md](docs/RUNBOOK.md#scripts).

## Git hooks and CI

- `pre-commit`: lint-staged (Prettier, `eslint --fix` on staged files)
- `commit-msg`: commitlint, Conventional Commits
- `pre-push`: typecheck and unit tests

CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck, tests and a
production build against an empty Postgres service container.

## Before you deploy

Details and reasoning in [docs/RUNBOOK.md](docs/RUNBOOK.md#deploying).

1. Schema changes (fields, collections, globals) ship as additive SQL in `scripts/sql/`, applied to production **before** the merge. There are no Payload migrations and production never runs Drizzle push.
2. Never run `bun run dev` or `bun run seed` against the production database.
3. A changed `NEXT_PUBLIC_` variable needs a fresh deployment (not "Redeploy") and a purge of every cache tag via `/api/revalidate`.
4. Preview deployments use the production database and Blob store: an admin save on a preview changes live content.
5. `app/(payload)/admin/importMap.js` must be regenerated and committed after adding or moving an admin component.
6. The build refuses to run when the database preflight fails, by design.

## Project structure

```
app/(frontend)/     public site, own root layout; api/chat, api/contact, api/revalidate
app/(payload)/      Payload admin, REST and GraphQL routes
app/api/fupa/       FuPa player proxy
components/         React components (home/, site/, seo/, chronik/, motion/)
lib/                data access and pure logic (cms.ts cache layer, bfv.ts, fupa.ts, ...)
payload/            collections, globals, access, hooks, admin components
payload.config.ts   DB adapter, storage adapter, admin config
scripts/            seed, preflight, one-off imports, scripts/sql/ schema changes
tests/              Vitest unit tests
video/              separate Remotion project for the admin tutorial video
docs/               architecture, runbook, decisions, client documents
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): system overview, caching, CMS model, tech debt
- [docs/RUNBOOK.md](docs/RUNBOOK.md): environments, env vars, deploying, traps, incidents
- [CONTRIBUTING.md](CONTRIBUTING.md): setup, branch and commit workflow, review rules
- [docs/README.md](docs/README.md): index of every document in the repo

## License

Code © 2026 SV Nord München-Lerchenau e.V. Contributors retain copyright to their commits.

Images embedded in the repo (Wix CDN URLs used as fallbacks) belong to SV Nord München-Lerchenau e.V. and are used with permission for the club's own website.

The SV Nord crest, name, and "Einmal Nordler, immer Nordler." slogan are the property of SV Nord München-Lerchenau e.V.
