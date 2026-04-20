# SV Nord München-Lerchenau · Website

Modern rebuild of **SV Nord München-Lerchenau e.V.** — a 78-year-old traditional sports club in Munich's Lerchenau district. Replaces the legacy Wix site with a fast, editable, fully-typed Next.js 16 app backed by Payload CMS.

> *„Einmal Nordler, immer Nordler."*

## Highlights

- **Full site** — home, Verein (overview, Chronik, Vorstand, Vereinsheim, Jugendförderverein), Fußball (overview + 22 team pages), Volleyball, Gymnastik, Ski, Esport, Schiedsrichter, News (index + posts), Termine, Sponsoren, Mitgliedschaft, Kontakt, legal
- **Payload CMS v3** mounted at `/admin` — 9 collections + 8 globals, Lexical rich-text editor with a persistent Word-like toolbar, live preview, image uploads
- **Every word editable** — headlines, nav, footer, legal text, chronicle, team descriptions, sponsors, fixtures, events, contact info — nothing hardcoded
- **Matchday UX** — live-ticker above the header, homepage Wochenendplan block (fixtures + Bezirksliga mini-table with "UNS" highlight), next-fixture hero card
- **Design system** — warm paper + deep navy + gold club palette, Barlow Condensed display type, Fraunces italic heritage accents, Inter body, JetBrains Mono labels
- **Motion** — hero stagger, stat counters, scroll fade-ups, sponsor marquee — all gated on `prefers-reduced-motion`
- **Accessible** — skip-to-content link, visible focus rings, semantic landmarks, aria-live on form feedback
- **Cache invalidation** — Payload `afterChange` hooks → `/api/revalidate` → `revalidateTag()` so the public site refreshes within ~1 s of an admin save
- **Contact form** — zod validation + honeypot + Payload `Submissions` record + Resend email
- **SEO** — `robots.txt`, dynamic `sitemap.xml`, OpenGraph metadata

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| UI | React 19 · TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` tokens) |
| Motion | [Motion](https://motion.dev) (Framer Motion v12) |
| CMS | [Payload v3](https://payloadcms.com) in-app at `/admin` |
| Editor | Lexical rich text with fixed toolbar |
| DB | Postgres (Docker dev · Neon prod) |
| Storage | local `public/uploads/` (dev) · Vercel Blob (prod) |
| Email | [Resend](https://resend.com) |
| Validation | [Zod](https://zod.dev) |
| Primitives | Radix UI (Dialog for mobile menu) |
| Package manager | [Bun](https://bun.sh) |
| Deploy | Vercel |

## Screenshots

*(Add after first deploy — or run `bun dev` to see it locally.)*

## Getting Started

Prereqs: **Bun** 1.1+, **Docker Desktop**, a `.env.local` file.

```bash
# 1. Install deps
bun install

# 2. Copy env template and fill in values
cp .env.example .env.local
# At minimum set DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL, REVALIDATE_SECRET

# 3. Start local Postgres
bun run db:up

# 4. Generate Payload types (reads payload.config.ts)
bun run payload:generate-types

# 5. (One-time) Download legacy Wix images + seed demo content
bun run download-images   # populates tmp/wix-images/
bun run seed              # creates admin + Vorstand + teams + sample posts/globals

# 6. Run dev server
bun run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin (login `admin@svnord.de` / `ChangeMeNach-P1` — change it immediately)

## Project Structure

```
.
├── app/
│   ├── (frontend)/              Public site (own root layout, html+body)
│   │   ├── fussball/[team]/     22 football team pages from one template
│   │   ├── news/[slug]/         News post with live-preview support
│   │   ├── api/contact/         Zod-validated contact form endpoint
│   │   └── api/revalidate/      Internal cache-invalidation endpoint
│   └── (payload)/               Payload CMS (own root layout, html+body)
│       ├── admin/[[...segments]]/
│       └── api/[...slug]/
├── components/
│   ├── home/                    Hero, MatchdayBlock, NewsGrid, Sports…
│   ├── motion/                  FadeUp, HeroStagger, StatCounter
│   ├── site/                    Header, Footer, MatchdayTicker, MobileMenu
│   ├── Crest.tsx                SV Nord shield SVG
│   └── …
├── payload/
│   ├── collections/             Users, Media, People, Teams, Posts, …
│   ├── globals/                 SiteSettings, Navigation, HomePage, …
│   ├── access/                  Shared access helpers
│   └── hooks/                   revalidateOnChange
├── lib/
│   ├── slug.ts                  German transliteration slug helper
│   ├── format-date.ts           de-DE date formatters
│   ├── contact-schema.ts        Zod schema for the contact form
│   └── payload.ts               Cached getPayloadClient()
├── scripts/
│   ├── download-images.ts       Mirrors Wix CDN → tmp/wix-images/
│   └── seed.ts                  One-time demo content seed
├── docs/
│   ├── DEPLOYMENT.md            Step-by-step Vercel + Neon + Resend guide
│   └── superpowers/             Design spec + phase plans
├── tests/                       Vitest unit tests for lib/
├── docker-compose.yml           Local Postgres
└── payload.config.ts
```

## Scripts

```bash
bun run dev                     # Next.js dev server
bun run build                   # Production build
bun run start                   # Run production build
bun run lint                    # ESLint
bun run test                    # Vitest unit tests
bun run payload                 # Payload CLI
bun run payload:generate-types  # Regen payload-types.ts
bun run payload:migrate         # Run DB migrations (usually auto)
bun run db:up                   # Start Postgres in Docker
bun run db:down                 # Stop Postgres
bun run db:reset                # Drop + recreate the DB (destructive)
bun run seed                    # Seed demo content
bun run download-images         # Mirror Wix CDN images locally
```

## Payload Schema (short tour)

**Collections**

| Collection | What |
|---|---|
| `Users` | Admins (Payload auth) |
| `Media` | Uploads — Sharp resizes to thumbnail/card/feature/hero, WebP |
| `People` | Vorstand, sport leads, trainers, optional players |
| `Teams` | All sport teams (22 football + 5 other-sport docs), slug-hooked |
| `Posts` | News — Lexical body, tags, optional hero image |
| `Sponsors` | Logo + url + tier (premium / standard) |
| `Fixtures` | Match fixtures with optional result |
| `Events` | Training times, parties, Jeep Cup, etc. |
| `Submissions` | Contact-form results (admin-only read) |

**Globals** — `SiteSettings`, `Navigation`, `HomePage`, `ContactInfo`, `ChronikPage`, `VereinsheimPage`, `JugendfoerderPage`, `LegalPages`.

## Live Preview

Post edits in `/admin` → click the "Live Preview" tab. The iframe loads the real `/news/[slug]` with device breakpoints (Mobile / Tablet / Desktop). Saves trigger `RefreshRouteOnSave`, so the preview re-renders within ~1 s.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full step-by-step guide and [`docs/TODO.md`](docs/TODO.md) for the current live checklist.

**Stack in production**
- **Database** — [Neon](https://neon.com) Postgres (use the pooler host for `DATABASE_URI`)
- **Hosting** — [Vercel](https://vercel.com) — one project, auto-deploy from `main`
- **Media** — [Vercel Blob](https://vercel.com/storage/blob) (via `BLOB_READ_WRITE_TOKEN`; falls back to local `public/uploads/` in dev)
- **Email** — [Resend](https://resend.com) for contact-form delivery

Short version: push to GitHub ✓, provision Neon + Resend, import into Vercel, add env vars, attach a Vercel Blob store, deploy.

## Design Source

The visual direction came out of a design-handoff from [claude.ai/design](https://claude.ai/design). Key decisions:

- **Personality** — modern sports-app energy × Bavarian heritage
- **Hero treatment** — huge Barlow Condensed "EINMAL NORDLER, IMMER *Nordler.*" with gold and italic-serif accents, next-fixture card on the right
- **Ticker** — live Heimspieltag bar above the header
- **Palette** — extracted from the SV Nord crest: deep navy `#0b1b3f`, sky `#6ec7ea`, gold `#c8a96a`, warm paper `#f4f1ea`, red accent `#d43a2f`

## License

Code © 2026 SV Nord München-Lerchenau e.V. Contributors retain copyright to their commits.

Images embedded in the repo (Wix CDN URLs used as fallbacks) belong to SV Nord München-Lerchenau e.V. and are used with permission for the club's own website.

The SV Nord crest, name, and "Einmal Nordler, immer Nordler." slogan are the property of SV Nord München-Lerchenau e.V.

---

Built with ♡ in München.
