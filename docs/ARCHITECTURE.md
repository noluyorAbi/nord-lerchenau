# Architecture

One Next.js 16 App Router application with Payload CMS 3 mounted inside it.
Public site and admin share one deployment, one database and one media store.

```
Browser ──> Vercel (Next.js 16, Node runtime, Fluid Compute)
              ├─ app/(frontend)    public site, prerendered, tag-revalidated
              ├─ app/(payload)     /admin UI, /api/* REST, /api/graphql
              └─ app/api/fupa      player detail proxy
                    │
                    ├─ Neon Postgres (eu-central-1)      all CMS content
                    ├─ Vercel Blob (store wifujncy146uydef)  uploaded media
                    ├─ OpenAI Chat Completions            /api/chat (Nord-Assistent)
                    ├─ Resend                              /api/contact and /api/foto-zustimmung mails
                    └─ BFV widget API, fussball.de, FuPa, 11teamsports (read only, no keys)
```

## Directory layout

| Path                | Content                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(frontend)/`   | Public pages, own root layout. API routes `api/chat`, `api/contact`, `api/revalidate`.                                                                    |
| `app/(payload)/`    | Payload admin and REST/GraphQL routes, own root layout. `admin/importMap.js` is generated (see Runbook).                                                  |
| `app/api/fupa/`     | `GET /api/fupa/player/[teamSlug]/[playerId]`, CDN-cached proxy to FuPa.                                                                                   |
| `components/`       | React components. `home/` home sections, `site/` header and footer, `seo/` JSON-LD, `chronik/`, `motion/`.                                                |
| `lib/`              | Data access and pure logic. `cms.ts` (cache layer), `payload.ts` (client), `bfv.ts`, `fupa.ts`, `clubshop.ts`, `publicUploads.ts` (media URL resolution). |
| `payload/`          | `collections/`, `globals/`, `access/`, `hooks/`, `components/` (admin dashboard, guided tour).                                                            |
| `payload.config.ts` | DB adapter, storage adapter, admin config, collection and global order.                                                                                   |
| `payload-types.ts`  | Generated, do not edit. `bun run payload:generate-types`.                                                                                                 |
| `scripts/`          | Seed, one-off imports, schema SQL, preflight and CI helpers. See the table in the Runbook.                                                                |
| `tests/`            | Vitest unit tests for `lib/` and `scripts/`.                                                                                                              |
| `public/uploads/`   | Only a short allowlist is committed (see `.gitignore`); everything else lives in Blob.                                                                    |
| `video/`            | Separate Remotion project (npm, own lockfile) that renders the admin tutorial video. Not part of the site build.                                          |

## Rendering and caching

All CMS reads go through `cachedQuery()` in `lib/cms.ts`, a thin wrapper around
`unstable_cache` with coarse tags: `collection:<slug>` and `global:<slug>`.
Default lifetime is 24 h as a safety net; the real invalidation path is:

```
admin save ─> Payload afterChange hook (payload/hooks/revalidate.ts)
          ─> POST {NEXT_PUBLIC_SERVER_URL}/api/revalidate {secret, resource}
          ─> revalidateTag(...) for that resource (+ layout for site-wide globals and media)
```

- Queries that filter on "now" (next fixture, upcoming events) use
  `TIME_WINDOWED_REVALIDATE_SECONDS = 900`, and pages rendering them export
  `revalidate = 900`.
- `/news`, `/news/[slug]` and `/kontakt` are `force-dynamic` because they read
  search params; their queries are still cached.
- External data: BFV fixtures 900 s, BFV squad/club 86400 s, fussball.de table
  1800 s, FuPa 1800 s, club shop 600 s.
- `tests/lib/cms-tags.test.ts` fails when a hook resource and the tag registry
  in `lib/cms.ts` drift apart.
- Cache Components (`'use cache'`) are deliberately not enabled.

The build runs `scripts/preflight-db.ts` first: prerendering against a broken
database would bake fallback markup into the cache, so the build refuses
instead (incident 2026-07-25, Neon quota exhausted).

## CMS model

Collections: `posts`, `events`, `people`, `teams`, `fixtures`, `sponsors`,
`submissions`, `photo-consents`, `users`, `media`. Globals: `home-page`, `chronik-page`,
`vereinsheim-page`, `jugendfoerder-page`, `faq-page`, `legal-pages`,
`site-images`, `site-settings`, `navigation`, `contact-info`.

- Access: read is public for content, writes need a logged-in user. There is
  **no role model**: every user is a full admin. `submissions` cannot be created
  through the API; `/api/contact` writes with the Local API.
- `photo-consents` holds the parents' consent to team photos. The public form
  `/foto-zustimmung` writes through `/api/foto-zustimmung` (double opt-in mail,
  confirm and revoke by token, only its SHA-256 is stored). Admins may create
  paper consents. Revoking a confirmed consent, by link or in the admin, sets
  `teams.hidePhoto`, which hides the team photo from every source (CMS, FuPa,
  BFV) via `teamPhotoAllowed` in `lib/photo-consent.ts`. Hooks:
  `payload/hooks/photoConsent.ts`.
- `people.phone` and `people.email` are readable by logged-in users only; the
  frontend reads them server-side through the Local API and decides itself what
  to show (club wish: no private mobile numbers).
- No drafts or versions. The header menu is defined in code (`lib/nav-tree.ts`),
  the `navigation.header` field is hidden.
- Admin UI is German only (`i18n.supportedLanguages: { de }`), with a custom
  dashboard and a driver.js guided tour (`payload/components/tour/`).
- Media: Sharp generates `thumbnail` 320, `card` 768, `feature` 1280,
  `hero` 1920, all WebP. Uploads go through the server (4.5 MB Vercel body
  limit, the admin says 4 MB); client uploads are off because they break the
  WebP rename. Details: `docs/decisions/CMS-BILDER-ANALYSE-2026-08-18.md`.

## Storage switch

```ts
BLOB_ENABLED =
  Boolean(BLOB_READ_WRITE_TOKEN) &&
  (Boolean(VERCEL) || BLOB_ENABLE_LOCAL === "true");
```

Off means local disk under `public/uploads/`. The guard exists because
`vercel env pull` writes a live production Blob token into `.env.local`.
`lib/publicUploads.ts` resolves media URLs; with
`NEXT_PUBLIC_PREFER_UPLOADED_MEDIA=true` (set in production) the Blob copy wins
over a committed file of the same name.

## Schema management

Production runs with `NODE_ENV=production`, so the Postgres adapter never
pushes there, and there are **no Payload migrations**. Schema changes ship as
additive, idempotent SQL in `scripts/sql/`, applied before the code deploy.
`bun run db:push-schema` only bootstraps an empty database (CI uses it).
Moving to Payload migrations is the top item in the tech debt list below.

## External integrations

| Service                     | Where                                                                   | Auth                                            | Failure mode                    |
| --------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------- |
| BFV widget API, fussball.de | `lib/bfv.ts`                                                            | none                                            | empty lists, page still renders |
| FuPa                        | `lib/fupa.ts`, `app/api/fupa`                                           | none                                            | empty blocks                    |
| 11teamsports club shop      | `lib/clubshop.ts`                                                       | optional `FIRECRAWL_API_KEY`, else direct fetch | empty shop grid                 |
| OpenAI                      | `app/(frontend)/api/chat/route.ts`, prompt in `lib/ai-system-prompt.ts` | `OPENAI_API_KEY`                                | assistant answers with an error |
| Resend                      | `app/(frontend)/api/contact/route.ts`, `lib/photo-consent-mail.ts`      | `RESEND_API_KEY`                                | entry is saved, mail is skipped |
| OpenFreeMap tiles           | `components/MapEmbed.tsx`                                               | none                                            | map area empty                  |

## Known tech debt (prioritised)

1. **No migrations.** Generate a baseline with `payload migrate:create` against
   a copy of production, commit it, and switch the schema workflow to
   migrations. Until then follow the SQL procedure in the Runbook.
2. **No roles.** Add a `role` field (`admin`, `editor`) and restrict user
   management and `submissions` to admins.
3. **`/api/chat`, `/api/contact` and `/api/foto-zustimmung` have no per-IP rate limiting**
   (the consent form caps entries per address only). The chat costs
   money per request. Vercel Firewall rate limiting or a small KV-backed
   limiter would close it.
4. **Preview deployments share the production database** (Vercel env
   `DATABASE_URI` is set for Production and Preview). Give Preview a Neon
   branch.
5. **`scripts/seed.ts` is a bootstrap script, not a sync.** It overwrites
   globals and team fields. It refuses to run against a non-local database
   unless explicitly allowed; never run it against production.
6. Large files worth splitting when touched: `lib/fupa.ts`, `lib/bfv.ts`,
   `components/TermineClient.tsx`, `components/home/InstagramTeaser.tsx`,
   `scripts/seed.ts`.
7. About 170 text spots are still hardcoded in components (department page
   frames, `/verein`, `/sport`). The club asks for edits there now and then.
8. No end-to-end tests. A Playwright smoke run over the sitemap would catch
   broken images and 500s, which is what the club reports.
