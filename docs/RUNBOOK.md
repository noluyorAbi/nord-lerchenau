# Runbook

Operational knowledge that is not obvious from the code. Every item here cost
at least one debugging session or one production incident.

## Environments

|            | URL                                           | Database                                               | Media                                |
| ---------- | --------------------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| Production | https://www.svnord.de (apex redirects to www) | Neon `aged-breeze-63922318`, eu-central-1, pooler host | Vercel Blob store `wifujncy146uydef` |
| Preview    | Vercel preview URLs per PR                    | **same Neon database as production**                   | same Blob store                      |
| Local      | http://localhost:3000                         | Docker Postgres 17 (`bun run db:up`)                   | `public/uploads/`                    |

Legacy domain `svnord-lerchenau.de`: DNS at Wix (club account), `www` points
to Vercel. The apex still has a Wix A record next to the Vercel one and fails
TLS; fix by setting only `76.76.21.21` at Wix or moving the nameservers.
`svnord.de` DNS and mail (MX `smtpin.rzone.de`) are at Strato: never touch MX.

Because Preview shares the production database, an admin save on a preview
deployment changes live content. Treat preview admins as production.

## Environment variables

Source of truth is the Vercel project `nord-lerchenau`. `.env.example` lists
every variable with comments.

| Variable                                                 | Prod                       | Notes                                                                         |
| -------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URI`                                           | required                   | Neon pooler connection string. Build fails without it (preflight).            |
| `PAYLOAD_SECRET`                                         | required                   | Signs admin sessions. Rotating it logs everyone out, nothing else.            |
| `NEXT_PUBLIC_SERVER_URL`                                 | required                   | `https://www.svnord.de`. Inlined at build time. Revalidation hooks POST here. |
| `REVALIDATE_SECRET`                                      | required                   | Without it admin saves stay invisible for up to 24 h.                         |
| `BLOB_READ_WRITE_TOKEN`                                  | required                   | Injected by the Blob store connection.                                        |
| `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA`                      | `true`                     | See "Changing a `NEXT_PUBLIC_` variable".                                     |
| `OPENAI_API_KEY`                                         | required for the assistant | `OPENAI_MODEL` optional, default `gpt-4o-mini`.                               |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` | required for contact mails | Sender is still `kontakt@adatepe.dev` (interim, see below).                   |
| `FIRECRAWL_API_KEY`                                      | optional                   | Club shop scrape; direct fetch without it.                                    |
| `CMS_ADMIN_*`, `CMS_VEREIN_*`                            | scripts only               | Read by `scripts/set-cms-credentials.ts`, not at runtime.                     |

Setting a secret with the Vercel CLI: pipe from a file
(`vercel env add NAME production < file`). Piping from `echo` once truncated a
key to 12 characters. Sensitive variables cannot be pulled back to verify.

## Deploying

Merge to `main` deploys production. There is nothing else to run unless the
change touches the schema or a `NEXT_PUBLIC_` variable.

### Schema changes (fields, collections, globals)

Production never runs Drizzle push and there are no Payload migrations. A field
added in code without the matching columns makes every page that reads the
collection fail with a database error.

1. Write `scripts/sql/YYYY-MM-DD-<topic>.sql`: additive only, `IF NOT EXISTS`,
   one transaction. Column and index names must match what Payload derives from
   the config: create the schema in a throwaway local database
   (`bun run db:reset && bun run dev`) and copy the DDL from `pg_dump -s`.
   Enable the Blob plugin while doing so (`BLOB_ENABLE_LOCAL=true` and a dummy
   `BLOB_READ_WRITE_TOKEN`), otherwise the columns it adds to `media` are
   missing from the comparison.
2. Apply to production **before the first push** of the branch, not just
   before merging: preview deployments use the production database, so a pushed
   branch with new fields already runs against it.
   `psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/<file>.sql`
3. Verify with `\d <table>`, then push and merge.

Never "check" by running `bun run dev` against production: the dev push compares
config and database and, on drift, asks interactively whether a table was
renamed. Answering yes renames a live table. `bun run db:push-schema` is no
check either; it refuses any database that already has tables.

### Changing a `NEXT_PUBLIC_` variable

1. Change it in Vercel.
2. Trigger a **fresh** deployment (push a commit). "Redeploy" reuses the old
   build environment and ignores the change.
3. Purge every cache tag: POST to `/api/revalidate` once per resource in
   `CACHED_COLLECTIONS` and `CACHED_GLOBALS` (`lib/cms.ts`). The Vercel data
   cache survives deployments, so skipping this serves stale URLs. It broke
   nine images live once.

## Local development traps

- `vercel env pull` overwrites `.env.local` with the Development environment.
  `DATABASE_URI` only exists in Production and Preview, so the local one is
  gone afterwards and `BLOB_READ_WRITE_TOKEN` is added; put the local
  `DATABASE_URI` back. `vercel env pull --environment=production` does bring
  the production database URL: `next dev` with push on against production is
  the most dangerous command in this repo.
- The Blob token in `.env.local` is harmless on its own (see `BLOB_ENABLED` in
  `payload.config.ts`) unless `VERCEL=1` or `BLOB_ENABLE_LOCAL=true` is also
  set, in which case uploads and seeds write into the live store.
- `payload generate:types` and `payload generate:importmap` fail on the `@/`
  path aliases. Use `bun run payload:generate-types`; for the import map, touch
  `payload.config.ts` while the dev server runs and commit the rewritten
  `app/(payload)/admin/importMap.js`.
- `importMap.js` must keep the `VercelBlobClientUploadHandler` entry even though
  client uploads are off; the storage plugin registers it unconditionally.
- Scripts that talk to a real database run with
  `NODE_ENV=production PAYLOAD_DISABLE_PUSH=true bun --conditions=production`
  (see the `package.json` scripts). `--conditions=production` avoids a Lexical
  circular-import crash under Bun.

## Scripts

| Script                                                                                           | When                                                                            | Safe against production?                                                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `bun run seed`                                                                                   | Fresh local database only                                                       | **No.** Overwrites globals and team fields. Refuses non-local hosts unless `SEED_ALLOW_REMOTE=true`. |
| `bun run db:push-schema`                                                                         | Empty database (CI)                                                             | No-op on a populated one                                                                             |
| `bun run media-usage`                                                                            | Find unreferenced media                                                         | Read only                                                                                            |
| `bun run legal-pages-aktualisieren`                                                              | Rewrite Impressum and Datenschutz from `app/(frontend)/datenschutz/_content.ts` | Yes, overwrites those two fields on purpose                                                          |
| `bun run seed-abteilungs-zahlen`                                                                 | One-off, applied 2026-08-27                                                     | Idempotent                                                                                           |
| `bun run import-static-images`                                                                   | One-off, applied 2026-08-26                                                     | Aborts without a Blob token against a remote DB                                                      |
| `scripts/set-cms-credentials.ts`                                                                 | Reset the two admin logins                                                      | Yes                                                                                                  |
| `scripts/sql/*.sql`                                                                              | Applied schema changes, kept as record                                          | Idempotent                                                                                           |
| `scripts/migrate-media-to-blob.ts`, `import-news.ts`, `seed-g-junioren.ts`, `download-images.ts` | Historical one-off imports                                                      | Read the header before running                                                                       |

## Content operations

- Admin: https://www.svnord.de/admin. Five accounts: one for the maintainer,
  one shared club account and three the club created itself. Credentials stay
  with the maintainer and in the `CMS_*` variables in Vercel, never in this
  repo. Every account is a full admin; there is no role model.
- An image replaced in the admin shows up within seconds (media hooks purge
  every dependent tag and the layout).
- Unreferenced media: `bun run media-usage` lists them with admin links. The
  club decides what to delete; deleting is permanent.
- Contact form submissions are stored in the `submissions` collection even when
  the mail fails.

## Open operational items

- **Resend sender.** Mails go out from `kontakt@adatepe.dev`, a domain owned by
  the maintainer personally. Create a Resend account for the club, verify
  `svnord.de` (SPF, DKIM, DMARC records at Strato, MX untouched), swap
  `RESEND_API_KEY` and set `RESEND_FROM_EMAIL=SV Nord Kontakt <kontakt@svnord.de>`,
  push a commit, send a test message.
- **Apex `svnord-lerchenau.de`** TLS (see Environments).
- **Backups.** Neon point-in-time restore is set to 6 hours of history
  (`history_retention_seconds: 21600`; the Launch plan allows up to 7 days).
  There is no independent backup; take a `pg_dump` before risky operations.
  There is no independent dump. A weekly `pg_dump` to private storage is
  recommended.
- **Preview database.** Give Preview its own Neon branch.

## Incidents worth knowing

| Date       | What happened                                                                                                                                  | Guard now in place                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-25 | Neon compute quota exhausted; queries failed while TCP still connected.                                                                        | `scripts/preflight-db.ts` queries before every build. Pool releases idle connections after 10 s so the compute can suspend. |
| 2026-08-18 | Admin uploads broken for weeks: the Blob plugin had been removed from the config.                                                              | Plugin back, tests for media URL resolution.                                                                                |
| 2026-08-26 | Image import ran against production with an empty Blob token; 67 files landed on a laptop, 18 media docs pointed nowhere. Repaired 2026-10-08. | Import aborts without a token against a remote database.                                                                    |
