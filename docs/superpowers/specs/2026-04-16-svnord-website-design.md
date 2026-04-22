# SV Nord München-Lerchenau · Website Redesign — Design Spec

**Date:** 2026-04-16
**Status:** Approved, ready for implementation planning
**Source content:** `.firecrawl/svnord-lerchenau.json` (67 pages crawled from `https://www.svnord-lerchenau.de/`)

---

## 1. Goal

Replace the existing Wix-hosted website of **SV Nord München-Lerchenau e.V.** with a modern, fast, accessible, fully editable site. The new site mirrors the current information architecture but consolidates the 30+ duplicate "kopie-von-…" Wix pages into proper templated routes, and gives the Vorstand a Word-like admin panel so they can update content without developer help.

## 2. Project context

**The club**

- Founded 15 October 1947 in München-Lerchenau. ~78 years old in 2026.
- ~500 members across four sports: Fußball (main), Volleyball, Gymnastik (since 1967), Ski. Plus Esport and Schiedsrichter sub-pages.
- Football: 5 senior teams (Erste, Zwoate, Dritte, Senioren A, Senioren B), 14 junior teams (A1, A2, B1, B2, C1, D1, D2, E1, E2, F1, F2, F3, G, Bambini), 3 Juniorinnen (B, C, D). 22 football team pages, all rendered from one template.
- Vereinsheim "Eschengarten" — self-built, 40 years old, on Eschenstraße in 80995 München.
- Erste plays in Bezirksliga Oberbayern, currently Platz 3.
- Slogan: "Einmal Nordler, immer Nordler."
- Brand colors (extracted from crest): deep navy `#0e1e4a`, sky blue `#60c0e8`, gold `#c8a96a`, white.
- Contact: `info@svnord.de` · `0172 2392919` · Instagram `@svnord_ski`.
- Vorstand: Ralf Kirmeyer (1.), Birgit Höfer (2.), Britta Feierabend (Kassier), Fabian Falk (Schriftführer), Felix Kirmeyer (Sportlicher Leiter), Tobias Treffer (Jugendleitung Großfeld), Ergin Piker (Jugendleitung Kleinfeld).

**Repo state at start**

- Bare `create-next-app` scaffold: Next.js 16.2.4 + React 19.2.4 + Tailwind v4 + TypeScript + Bun (no `framer-motion`, no `payload` yet).
- App Router (`app/`).
- `AGENTS.md` warns: "This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing code." Implementation must verify Next.js 16 APIs against bundled docs, not training data.

## 3. Decisions (from brainstorming)

| Decision          | Choice                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Scope             | Full multi-route site replacement                                                                                |
| Visual direction  | Vercel-style (clean, monochrome surface, sharp typography, subtle motion) using SV Nord club colors              |
| Hero treatment    | Centered (option A): pill + gradient headline + lede + two CTAs + ambient aurora glow                            |
| Image strategy    | Download all images from Wix CDN into the repo (Payload Media collection, served from Vercel Blob in production) |
| News authoring    | Admin panel with Word-like rich-text editor                                                                      |
| CMS technology    | **Payload CMS v3** mounted at `/admin` inside the same Next.js app                                               |
| Editable scope    | **Everything**: posts, fixtures, events, sponsors, team rosters, contact people, page headlines, footer text     |
| Language          | German only                                                                                                      |
| Auth              | Admin login only — no public accounts / no member portal                                                         |
| Contact form      | Saved as Payload `Submissions` collection + emailed to `info@svnord.de` via Resend                               |
| Membership signup | Link to existing PDFs — no digital form yet                                                                      |
| Comments on posts | Skip                                                                                                             |
| Hosting           | Vercel + Neon Postgres (free tiers)                                                                              |
| Team pages        | One template, rendered for every team via Payload data                                                           |
| Data fetching     | SSG + on-demand revalidate (Payload `afterChange` hook → `revalidateTag()`)                                      |

## 4. Technology stack

| Layer           | Tech                                                     | Rationale                                                                     |
| --------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Server Components)               | Already installed; verify APIs against bundled docs                           |
| UI runtime      | React 19                                                 | Already installed                                                             |
| Language        | TypeScript (strict)                                      | Already configured                                                            |
| Styling         | Tailwind v4                                              | Already installed; add club-color tokens via `@theme`                         |
| Animation       | Framer Motion                                            | User requirement                                                              |
| Primitives      | Radix UI (Dialog, Dropdown, Sheet only)                  | Mobile menu, popovers; everything else bespoke                                |
| CMS             | Payload CMS v3 (in-app)                                  | Open-source, mounts at `/admin`, Lexical editor, image uploads, built-in auth |
| Database        | Postgres (Neon free tier in prod, local Postgres in dev) | Payload SQL adapter; simple operations                                        |
| Object storage  | Vercel Blob                                              | Payload media uploads; Sharp resizes on upload                                |
| Email           | Resend                                                   | Contact form notifications                                                    |
| Validation      | Zod                                                      | Form validation client + server                                               |
| Package manager | Bun                                                      | Already configured                                                            |
| Deploy          | Vercel                                                   | One repo → one deployment                                                     |
| Tests           | Vitest + Playwright (smoke only)                         | Lightweight, scoped — see §11                                                 |

## 5. Information architecture

```
/                                 Homepage
/verein                           Verein overview
/verein/chronik                   Long-form chronicle
/verein/vorstand                  Board members + sportlicher Leiter
/verein/vereinsheim               Eschengarten clubhouse
/verein/jugendfoerderverein       Youth foundation

/fussball                         Football overview
/fussball/[team]                  Team pages: erste, zwoate, dritte,
                                  senioren-a, senioren-b, a1, a2, b1, b2, c1,
                                  d1, d2, e1, e2, f1, f2, f3, g, bambini,
                                  juniorinnen-b, juniorinnen-c, juniorinnen-d
/volleyball                       Volleyball
/gymnastik                        Gymnastik (gegründet 1967)
/ski                              Ski
/esport                           Esport
/schiedsrichter                   Schiedsrichter

/news                             News index (paginated)
/news/[slug]                      News post
/termine                          Events calendar

/sponsoren                        Sponsors grid + "Sponsor werden" CTA
/mitgliedschaft                   How to join + Mitgliedsantrag PDF download
/kontakt                          Contact form + map + addresses

/impressum                        Legal imprint (required by German law)
/datenschutz                      Privacy policy

/admin/**                         Payload CMS UI (auth-gated)
/api/contact                      POST: zod validate → save Submission → Resend
/api/[...payload]                 Payload's REST/GraphQL endpoints (auto)
/api/revalidate                   Internal: invoked by Payload afterChange hooks
```

**Total**: ~30 routes, but `/fussball/[team]` and `/{volleyball,gymnastik,…}` share one template; `/news/[slug]` is one template. Real bespoke page count is ~12.

## 6. Visual design

**Surface & color**

- Light surface `#fafafa`, near-black ink `#0a0a0a`, near-white cards `#ffffff`, hairline borders `rgba(0,0,0,0.08)`.
- Brand accent gradient (`linear-gradient(180deg, #1a3a8e → #60c0e8)`) on key headlines and card art.
- Gold `#c8a96a` for secondary CTAs and tags.
- Dark sections (e.g. footer, next-match band, mitgliedschaft CTA): navy `#0e1e4a` with white text + sky/gold accents.
- Dark mode: planned but **out of scope for v1** (note for future).

**Typography**

- Geist (already installed via `next/font/google`) — sharp, tight tracking. Display `font-weight: 700`, `letter-spacing: -0.04em` on H1/H2.
- Geist Mono for code-like elements (route badges, IDs).

**Spacing & rhythm**

- Generous: section padding `py-20 md:py-28`. Container max-width `7xl` (1280px) with `px-6 md:px-10`.
- Card radius `rounded-xl` (12px). Pill radius `rounded-full`. Button radius `rounded-lg` (8px).

**Hero treatment** (option A, locked)

- Centered. Live pill ("Heimspieltag · Sa 14:30 · Eschengarten") above headline.
- Two-line H1 with second line in brand-gradient text.
- Lede sub-headline, `text-zinc-600`.
- Two CTAs: primary (`bg-ink text-white`) + ghost (`border + bg-white`).
- Ambient radial sky-blue glow above the text (`radial-gradient` aurora).

## 7. Page designs

### 7.1 Homepage (11 sections, top → bottom)

1. **Sticky nav** — logo (crest mark + "SV Nord") + 7 links + "Mitglied werden" CTA. Backdrop blur on scroll.
2. **Hero** — centered, as described in §6.
3. **Stat strip** — 4 cells: `1947 · Gegründet`, `500+ · Mitglieder`, `13 · Mannschaften`, `Bezirksliga · 3. Platz`.
4. **Next match band** — full-width navy band, opponent + venue + gold time.
5. **Aktuelles** — 1 large + 2 small news cards.
6. **Sportarten** — 6 sport cards in a row (Fußball, Volleyball, Gymnastik, Ski, Esport, Schiri).
7. **Termine** — 3 next events with date chips.
8. **Sponsoren marquee** — animated horizontal scroll of sponsor logos.
9. **Vereinsheim teaser** — image + Eschengarten chronik link.
10. **Mitgliedschaft CTA band** — gradient navy with gold button.
11. **Footer** — 5 columns + impressum/datenschutz row.

Each section has a "show on homepage" toggle in the `HomePage` global, so the Vorstand can hide/reorder later.

### 7.2 Other page templates

| Route                                               | Layout                                                                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/verein`                                           | Hero + intro + 4 link cards (Chronik, Vorstand, Vereinsheim, Jugendförderverein)                                                       |
| `/verein/vorstand`                                  | Grid of People cards (photo, name, role, phone, email)                                                                                 |
| `/verein/chronik`                                   | Article layout, sticky TOC sidebar, Lexical body                                                                                       |
| `/verein/vereinsheim`                               | Hero + Lexical body + photo gallery                                                                                                    |
| `/verein/jugendfoerderverein`                       | Hero + Lexical body + IBAN box                                                                                                         |
| `/fussball`                                         | Hero + 3 grouped team grids (Senioren · Junioren · Juniorinnen)                                                                        |
| `/fussball/[team]`                                  | Team hero + trainer card + roster (rendered conditionally if `players` is non-empty) + upcoming fixtures + BFV Spielplan link + photos |
| `/{volleyball,gymnastik,ski,esport,schiedsrichter}` | Same as `/fussball/[team]` template, simpler                                                                                           |
| `/news`                                             | Filter bar (tags) + paginated card grid                                                                                                |
| `/news/[slug]`                                      | Hero image + title + meta + Lexical body + share + related                                                                             |
| `/termine`                                          | Switchable list/calendar view (default list)                                                                                           |
| `/sponsoren`                                        | Premium tier (large logos) + Standard tier (compact grid) + "Sponsor werden" CTA                                                       |
| `/mitgliedschaft`                                   | Steps + benefits + Mitgliedsantrag PDF + contact box                                                                                   |
| `/kontakt`                                          | Form (name, email, message) left, map + addresses + opening hours right                                                                |
| `/impressum`, `/datenschutz`                        | Long-form Lexical                                                                                                                      |

## 8. Payload data model

### 8.1 Collections (multi-record)

| Collection    | Key fields                                                                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Posts`       | `title`, `slug`, `excerpt`, `heroImage` (upload), `body` (Lexical), `author` (rel→People), `publishedAt`, `tags`                                                                    |
| `Teams`       | `name`, `slug`, `sport` (enum), `ageGroup`, `season`, `league`, `trainers` (rel→People[]), `description` (Lexical), `photo` (upload), `externalLinks` (BFV Spielplan etc.), `order` |
| `People`      | `name`, `role`, `function` (enum: vorstand/trainer/leitung/zeugwart/…), `photo` (upload), `phone`, `email`, `team` (rel→Teams, optional), `order`                                   |
| `Sponsors`    | `name`, `logo` (upload), `url`, `tier` (enum: premium/standard), `order`                                                                                                            |
| `Fixtures`    | `team` (rel→Teams), `opponent` (text), `kickoff` (date), `competition`, `venue`, `isHome`, `result` (group: homeGoals, awayGoals, optional)                                         |
| `Events`      | `title`, `startsAt`, `endsAt`, `location`, `description` (Lexical), `image`, `ctaUrl` (optional)                                                                                    |
| `Media`       | Payload built-in. Sharp resizes on upload (thumbnail / medium / large + WebP). Stored in Vercel Blob.                                                                               |
| `Submissions` | `name`, `email`, `message`, `createdAt`. Created by `/api/contact`. Read-only in admin.                                                                                             |
| `Users`       | `email`, `password`, `role`. Payload's auth collection.                                                                                                                             |

### 8.2 Globals (single document each)

| Global              | Purpose                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------- |
| `SiteSettings`      | name, tagline, description, OG image, social URLs, default meta                         |
| `Navigation`        | header links + footer columns                                                           |
| `HomePage`          | hero pretitle/headline/sub, CTAs, stat strip values, section visibility toggles + order |
| `ContactInfo`       | addresses, phones, email, IBAN, opening hours, map embed                                |
| `ChronikPage`       | long-form vereinschronik (Lexical)                                                      |
| `VereinsheimPage`   | Eschengarten content (Lexical) + gallery                                                |
| `JugendfoerderPage` | youth-foundation content (Lexical) + IBAN                                               |
| `LegalPages`        | impressum + datenschutz (two Lexical fields)                                            |

### 8.3 Hooks & access control

- All public collections + globals: `access.read = () => true`. `Users` and `Submissions`: admin-only read.
- All write access: logged-in admin only (Payload default).
- Every collection + global has an `afterChange` hook that POSTs to `/api/revalidate` with the affected entity type & slug. The route handler maps that to `revalidateTag()` calls (see §10).
- `Submissions` are created server-side from `/api/contact` (zod-validated). No public write access.

### 8.4 Seed script

A one-shot `scripts/seed.ts`:

1. Reads `.firecrawl/svnord-lerchenau.json`.
2. Downloads referenced images from Wix CDN to `tmp/`.
3. Uploads them via Payload's local API to the `Media` collection.
4. Inserts: 7 People (Vorstand + sport leads), ~21 Teams, 2 Posts, sample Sponsors (placeholder until real data provided), the 1–2 known Events, ContactInfo, ChronikPage, VereinsheimPage, JugendfoerderPage content.
5. Idempotent — re-running upserts by slug.

After first run on production, the Vorstand owns content via `/admin`.

## 9. Motion plan (Framer Motion)

All animations gated on `prefers-reduced-motion: reduce`.

| Surface                             | Animation                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Hero entrance                       | Fade + 8px translate-y, 60ms stagger across pill → headline → lede → CTAs                |
| Stat counters                       | Spring from 0 → final value when scrolled into view                                      |
| Section cards (news, sport, events) | `whileInView` fade + 12px translate-y                                                    |
| Card hover                          | 4px lift + soft shadow + border tint shift                                               |
| Sponsor strip                       | Infinite horizontal autoscroll (CSS-friendly with `motion.div animate`); pauses on hover |
| Hero aurora glow                    | 8s breathing scale/opacity loop                                                          |
| Live pill dot                       | Pulse (CSS keyframe)                                                                     |
| Mobile menu                         | Radix Dialog + slide-from-right                                                          |
| Page transitions                    | Subtle fade between routes via Framer's `AnimatePresence`                                |
| Match countdown                     | Tick every minute (state-driven, not motion)                                             |

## 10. Cache invalidation strategy

Pages are statically generated at build time and re-generated on demand. The flow:

1. Editor saves a record in `/admin`.
2. Payload fires the collection's `afterChange` hook.
3. Hook POSTs to `/api/revalidate` (server-internal, secret-protected) with `{ type, slug, sport? }`.
4. Route handler calls the relevant `revalidateTag()` calls per the table below.
5. Affected pages re-generate on the next request (~1s perceived delay).

| Save                             | Tags revalidated                                    |
| -------------------------------- | --------------------------------------------------- |
| `Post`                           | `post-{slug}`, `news-list`, `home-news`             |
| `Team`                           | `team-{slug}`, `sport-{sport}`                      |
| `Person`                         | `vorstand`, `team-{teamSlug}` (if assigned)         |
| `Fixture`                        | `next-match`, `team-{teamSlug}`                     |
| `Sponsor`                        | `sponsors`, `home-sponsors`                         |
| `Event`                          | `events`, `home-events`                             |
| `HomePage` global                | `home`                                              |
| `Navigation`/`SiteSettings`      | full revalidate via `revalidatePath('/', 'layout')` |
| `Contact`/`Chronik`/etc. globals | `{global-name}` tag                                 |

## 11. Quality bars

**Accessibility (WCAG 2.1 AA target)**

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<article>`, `<aside>`).
- Skip-to-content link (`Weiter zum Hauptinhalt`).
- Visible focus rings, custom but high-contrast.
- Form inputs labelled; error messages via `aria-live="polite"`.
- All animations gated on `prefers-reduced-motion`.
- Color contrast verified: navy/white passes AA; gold-on-navy passes AA Large only — gold is reserved for large text.

**Performance**

- Lighthouse mobile target: Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- All images via `next/image`; LCP image marked `priority`.
- Hero font preloaded; non-critical fonts deferred.
- Sponsor logos: SVG when possible, otherwise WebP.
- No client JS on text-only pages (Impressum, Datenschutz, Chronik).

**SEO**

- `sitemap.xml` generated from Payload data.
- Per-page `<title>`, `<meta description>`, OpenGraph image (default from `SiteSettings`, overridable per Post).
- Structured data: `SportsClub` JSON-LD on `/`, `Article` on `/news/[slug]`, `SportsEvent` on Fixtures.

**Error handling**

- DB unreachable → page renders last cached version + non-intrusive banner.
- Image fails → fallback navy/sky gradient (same as card art mockups).
- Contact form: zod validation client + server. 4xx → field-level errors. 5xx → generic + Vercel log.
- Admin auth: Payload-managed, 24h sessions, password reset via Resend.
- 404 / 500: branded `not-found.tsx` + `error.tsx` per route group with "back to start" CTA.

**Testing**

- Vitest unit tests for: slug helpers, date formatters, fixture sorter, contact-form validators.
- Playwright smoke tests: home loads, news index loads, news post loads, contact form submits successfully, admin login redirects to dashboard.
- No unit tests for React components (they are mostly composition + data display); covered indirectly by Playwright.

## 12. Build phases

| Phase                             | Output                         | Key work                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1 · Foundation & data**        | Local admin works, DB seeded   | **First step: verify Next.js 16 ↔ Payload v3 compatibility** (see §13). Then: install deps (`payload`, `@payloadcms/richtext-lexical`, `@payloadcms/db-postgres`, `framer-motion`, `resend`, `zod`, Radix primitives); Tailwind theme tokens; Payload config + all 9 collections + 8 globals; local Postgres + first migration; image download script; `seed.ts` |
| **P2 · Shell & homepage**         | Public homepage with real data | Root layout, fonts, theme; sticky nav with mobile menu (Radix Dialog); footer; all 11 homepage sections wired to Payload globals/collections                                                                                                                                                                                                                     |
| **P3 · Content routes**           | Whole site browsable           | `/verein/*`; `/fussball` + `/fussball/[team]`; all other sport pages; `/news` + `/news/[slug]`; `/termine`                                                                                                                                                                                                                                                       |
| **P4 · Business + forms + legal** | Site fully functional          | `/sponsoren`; `/mitgliedschaft` (PDF downloads); `/kontakt` (zod + Resend); `/impressum`, `/datenschutz`; `robots.txt`; `sitemap.xml`; OG images; `/api/contact`; `/api/revalidate`; `afterChange` hooks wired                                                                                                                                                   |
| **P5 · Motion + a11y + perf**     | Polished, accessible           | Framer Motion pass per §9; Lighthouse + axe pass; focus rings; skip-link; reduced-motion gates verified; admin field grouping & conditional fields                                                                                                                                                                                                               |
| **P6 · Deploy**                   | Live at `svnord-lerchenau.de`  | Neon prod DB + migrations; Vercel project + env vars; Resend domain verify; Vercel Blob bucket; production seed; smoke test; hand-off doc for Vorstand                                                                                                                                                                                                           |

## 13. Open items / risks

| Item                                      | Status                                                                                                                                                                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 + Payload v3 compatibility** | VERIFIED 2026-04-16: `@payloadcms/next@3.83.0` peerDependency `"next": ">=15.2.9 <15.3.0 \|\| >=15.3.9 <15.4.0 \|\| >=15.4.11 <15.5.0 \|\| >=16.2.2 <17.0.0"` — Next.js 16.2.4 satisfies `>=16.2.2 <17.0.0`. Compatible, no caveats. Proceed with Task 2. |
| **Vercel Blob vs S3**                     | Default Vercel Blob for simplicity. If image volume grows past free tier, switch to S3 (Payload supports both).                                                                                                                                           |
| **Sponsor logo files**                    | Don't have them yet. Seed inserts placeholder rectangles — Vorstand uploads real logos via admin.                                                                                                                                                         |
| **Roster data**                           | The original Wix site does not list individual players per team. Roster section in `/fussball/[team]` is conditionally rendered if `players` array is non-empty.                                                                                          |
| **Match results / live data**             | No automated scrape from BFV. Vorstand enters fixtures + results manually in admin. Future: scrape BFV.                                                                                                                                                   |
| **Document collection**                   | Decided in brainstorming: Mitgliedsantrag PDFs treated as Media uploads referenced from `/mitgliedschaft`, no separate `Documents` collection.                                                                                                            |
| **"Trainer gesucht" board**               | Decided: static section on homepage for v1, no dedicated board.                                                                                                                                                                                           |
| **Dark mode**                             | Out of scope for v1.                                                                                                                                                                                                                                      |

## 14. Out of scope (v1)

- Dark mode
- Member portal / public accounts
- Public commenting on posts
- Newsletter signup
- E-commerce (Trikots, Vereinsshop)
- BFV API live data
- Multilingual (English / Türkçe / etc.)
- App / PWA install prompt
- Player roster management UI (data model supports it; populate later)

## 15. Reference: source material

- Crawled site JSON: `.firecrawl/svnord-lerchenau.json` (67 pages, 156 credits, 386 KB)
- Logo: `https://static.wixstatic.com/media/c475b1_acf718a1aa8f4c5ca0566f78ac2864aa~mv2_d_2048_2048_s_2.png` (downloaded, colors extracted)
- Visual mockups (this brainstorm): `.superpowers/brainstorm/96450-1776371119/content/`
