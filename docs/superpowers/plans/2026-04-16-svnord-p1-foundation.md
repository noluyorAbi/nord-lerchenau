# SV Nord Website · Phase 1 — Foundation & Data · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-04-16-svnord-website-design.md`
**Phase:** 1 of 6 — see spec §12 for the full phase list

**Goal:** Stand up Payload CMS v3 inside this Next.js 16 app, define the full schema (9 collections + 8 globals), and seed the database with content imported from the firecrawl crawl of the existing svnord-lerchenau.de site. After this plan, an admin can log in at `/admin` and see all club data.

**Architecture:** Single Next.js 16 app. Payload mounts via the `(payload)` route group, sharing the same deployment. Postgres backs Payload (Docker locally, Neon in prod). The `payload/` directory holds collections, globals, hooks, and access helpers. Two seed scripts run once: `download-images.ts` mirrors images from Wix CDN to a local cache, then `seed.ts` uses Payload's local API to populate every collection from `.firecrawl/svnord-lerchenau.json`.

**Tech Stack:** Next.js 16 · React 19 · TypeScript (strict) · Tailwind v4 · Payload CMS v3 · Postgres (Docker dev / Neon prod) · `@payloadcms/db-postgres` · `@payloadcms/richtext-lexical` · Sharp · Bun · Vitest (helpers only) · firecrawl JSON (seed source)

**Reference docs (read before starting):**
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/02-guides/how-revalidation-works.md`
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` *(we use the previous-model caching, not Cache Components)*
- Payload v3 docs (online — verify version compat in Task 1)

---

## File structure (P1 output)

```
nord-lerchenau/
├── docker-compose.yml                                      ← new
├── .env.example                                            ← new
├── .env.local                                              ← new (gitignored)
├── next.config.ts                                          ← modify
├── package.json                                            ← modify (deps + scripts)
├── tsconfig.json                                           ← modify (paths)
├── vitest.config.ts                                        ← new
├── payload.config.ts                                       ← new
├── app/
│   ├── (payload)/
│   │   ├── admin/[[...segments]]/page.tsx                  ← new
│   │   ├── admin/[[...segments]]/not-found.tsx             ← new
│   │   ├── api/[...slug]/route.ts                          ← new
│   │   ├── api/graphql/route.ts                            ← new
│   │   └── layout.tsx                                      ← new
│   ├── globals.css                                         ← modify (theme tokens)
│   └── layout.tsx                                          ← modify (metadata only)
├── lib/
│   ├── slug.ts                                             ← new
│   └── format-date.ts                                      ← new
├── payload/
│   ├── access/
│   │   ├── anyone.ts                                       ← new
│   │   └── authenticated.ts                                ← new
│   ├── hooks/
│   │   └── revalidate.ts                                   ← new (stub for P1)
│   ├── collections/
│   │   ├── Users.ts                                        ← new
│   │   ├── Media.ts                                        ← new
│   │   ├── People.ts                                       ← new
│   │   ├── Teams.ts                                        ← new
│   │   ├── Posts.ts                                        ← new
│   │   ├── Sponsors.ts                                     ← new
│   │   ├── Fixtures.ts                                     ← new
│   │   ├── Events.ts                                       ← new
│   │   └── Submissions.ts                                  ← new
│   └── globals/
│       ├── SiteSettings.ts                                 ← new
│       ├── Navigation.ts                                   ← new
│       ├── HomePage.ts                                     ← new
│       ├── ContactInfo.ts                                  ← new
│       ├── ChronikPage.ts                                  ← new
│       ├── VereinsheimPage.ts                              ← new
│       ├── JugendfoerderPage.ts                            ← new
│       └── LegalPages.ts                                   ← new
├── scripts/
│   ├── download-images.ts                                  ← new
│   └── seed.ts                                             ← new
└── tests/
    └── lib/
        ├── slug.test.ts                                    ← new
        └── format-date.test.ts                             ← new
```

**Conventions used throughout:**
- All new TS files use ES module syntax with `import type` for type-only imports.
- All Payload schemas export a single named `const` matching the file name (`export const Posts: CollectionConfig = {...}`).
- All commits use Conventional Commits (`feat:`, `chore:`, `test:`, `docs:`).
- `bun` is the package manager. Use `bun add` / `bun run` / `bunx`, not npm/pnpm/yarn.

---

## Task 1: Preflight — verify Next.js 16 ↔ Payload v3 compatibility

**Files:** none (verification only)

This is the highest risk in the entire spec. The fix path differs based on what we find.

- [ ] **Step 1: Check what Payload versions exist on npm**

Run:
```bash
bun pm view payload versions --json | tail -30
```

Read the output. Note the latest 3.x version and any 4.x.

- [ ] **Step 2: Check Payload's declared peer-dependency on Next.js**

Run:
```bash
bun pm view payload@latest peerDependencies
```

Look for the `next` entry. Note the supported version range (e.g. `"next": "^15.0.0 || ^16.0.0"`).

- [ ] **Step 3: Decide path forward**

Three possible outcomes:

(a) **Payload latest supports Next.js 16** → continue to Task 2 unchanged.

(b) **Payload latest supports only Next.js 15** → before continuing, check if there's a canary/beta with Next 16 support:
  ```bash
  bun pm view payload@beta version peerDependencies
  bun pm view payload@canary version peerDependencies
  ```
  If a beta exists with Next 16 support, plan to use that; otherwise STOP and ask the user whether to (i) downgrade Next.js to 15 LTS or (ii) switch CMS to Sanity (per spec §13).

(c) **Payload latest supports Next.js 16 but with caveats** (e.g. only with Cache Components disabled) → note the caveats in `payload.config.ts` comments and continue.

- [ ] **Step 4: Document the chosen path**

Append a one-line note to `docs/superpowers/specs/2026-04-16-svnord-website-design.md` §13 row "Next.js 16 + Payload v3 compatibility" with the verified version + result.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-04-16-svnord-website-design.md
git commit -m "docs: record verified Payload + Next.js 16 compatibility status"
```

---

## Task 2: Local Postgres via Docker Compose

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Write `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: svnord-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: svnord
      POSTGRES_PASSWORD: svnord_dev
      POSTGRES_DB: svnord
    volumes:
      - svnord_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U svnord -d svnord"]
      interval: 5s
      retries: 10

volumes:
  svnord_pgdata:
```

- [ ] **Step 2: Start Postgres and verify it's healthy**

Run:
```bash
docker compose up -d postgres
docker compose ps
```

Expected: `STATUS` column shows `Up X seconds (healthy)` for `svnord-postgres`.

- [ ] **Step 3: Verify connection**

Run:
```bash
docker exec svnord-postgres psql -U svnord -d svnord -c "SELECT version();"
```

Expected: prints the PostgreSQL 16 version banner without errors.

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: add docker-compose for local Postgres"
```

---

## Task 3: Environment files

**Files:**
- Create: `.env.example`
- Create: `.env.local` (gitignored — `.env*` already in `.gitignore`)

- [ ] **Step 1: Write `.env.example`**

```bash
# Postgres
DATABASE_URI=postgres://svnord:svnord_dev@localhost:5432/svnord

# Payload
PAYLOAD_SECRET=replace-with-32-char-random-string

# Public site URL (used by Payload for asset paths and revalidation)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Internal: token used by Payload afterChange hooks to call /api/revalidate.
# Used in P4. Set to any random string for dev.
REVALIDATE_SECRET=dev-revalidate-secret

# Resend (used in P4 — leave empty for now)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_TO_EMAIL=info@svnord.de
```

- [ ] **Step 2: Write `.env.local`**

Generate a real secret:
```bash
openssl rand -hex 32
```

Copy the output. Then write `.env.local`:

```bash
DATABASE_URI=postgres://svnord:svnord_dev@localhost:5432/svnord
PAYLOAD_SECRET=<paste-the-openssl-output>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
REVALIDATE_SECRET=dev-revalidate-secret
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_TO_EMAIL=info@svnord.de
```

- [ ] **Step 3: Verify `.env.local` is gitignored**

Run:
```bash
git check-ignore .env.local
```

Expected: prints `.env.local`. If it does NOT print anything, the file is being tracked — STOP and add `.env*` to `.gitignore` properly.

- [ ] **Step 4: Commit (only `.env.example`)**

```bash
git add .env.example
git commit -m "chore: add .env.example template"
```

---

## Task 4: Install Payload core dependencies

**Files:**
- Modify: `package.json` (auto-updated by bun)

- [ ] **Step 1: Install Payload + DB adapter + rich-text + image processing**

Use the version determined in Task 1. Replace `<payload-version>` with the version verified compatible with Next.js 16:

```bash
bun add payload@<payload-version> @payloadcms/db-postgres@<payload-version> @payloadcms/richtext-lexical@<payload-version> @payloadcms/next@<payload-version> sharp graphql
```

`graphql` is a peer dep of Payload's GraphQL endpoint.

- [ ] **Step 2: Verify install**

Run:
```bash
bun pm ls payload @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/next sharp
```

Expected: each package prints with a resolved version. No "missing peer" warnings about React.

- [ ] **Step 3: Add useful dev scripts**

Edit `package.json` `"scripts"`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "payload": "payload",
    "payload:generate-types": "payload generate:types",
    "payload:migrate": "payload migrate",
    "db:up": "docker compose up -d postgres",
    "db:down": "docker compose down",
    "db:reset": "docker compose down -v && docker compose up -d postgres",
    "seed": "bun run scripts/seed.ts",
    "download-images": "bun run scripts/download-images.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: install Payload v3 + Postgres adapter + Lexical + Sharp"
```

---

## Task 5: Wrap `next.config.ts` with `withPayload`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace contents of `next.config.ts`**

```ts
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
```

The `static.wixstatic.com` remote pattern is only needed during seeding so we can fetch images by URL through `<Image>` if we want previews. Will be removed in P4 if no longer used.

- [ ] **Step 2: Verify type-checks**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors. If it complains that `@payloadcms/next/withPayload` has no types, check the Payload version chosen in Task 1 — adjust the import path per its docs.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: wrap next.config with withPayload"
```

---

## Task 6: Create the Payload config skeleton (no collections yet)

**Files:**
- Create: `payload.config.ts`

- [ ] **Step 1: Write `payload.config.ts` skeleton**

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  editor: lexicalEditor(),
  collections: [],
  globals: [],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    meta: {
      titleSuffix: "· SV Nord Admin",
    },
  },
});
```

- [ ] **Step 2: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors. (Some Payload setups complain about missing `payload-types.ts` until first generated — if so, create an empty placeholder: `touch payload-types.ts && bun run payload:generate-types` after the config exists.)

- [ ] **Step 3: Commit**

```bash
git add payload.config.ts
git commit -m "feat: add minimal Payload config skeleton (Postgres + Lexical)"
```

---

## Task 7: Mount the Payload admin route group

**Files:**
- Create: `app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `app/(payload)/admin/[[...segments]]/not-found.tsx`
- Create: `app/(payload)/api/[...slug]/route.ts`
- Create: `app/(payload)/api/graphql/route.ts`
- Create: `app/(payload)/layout.tsx`

These files are Payload's standard scaffold. They forward all requests under `/admin/*` and `/api/*` to Payload's built-in handlers.

- [ ] **Step 1: Create `app/(payload)/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { RootLayout } from "@payloadcms/next/layouts";

import config from "@/payload.config";

import "@payloadcms/next/css";

type Props = { children: ReactNode };

export const metadata = {
  title: "SV Nord Admin",
};

export default function PayloadLayout({ children }: Props) {
  return <RootLayout config={config}>{children}</RootLayout>;
}
```

If `@payloadcms/next/layouts` exports a different name in the version chosen in Task 1, follow that version's docs for the exact import.

- [ ] **Step 2: Create `app/(payload)/admin/[[...segments]]/page.tsx`**

```tsx
import type { Metadata } from "next";
import {
  generatePageMetadata,
  RootPage,
} from "@payloadcms/next/views";

import config from "@/payload.config";

type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = ({ params, searchParams }: Props): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default function Page({ params, searchParams }: Props) {
  return <RootPage config={config} params={params} searchParams={searchParams} />;
}
```

- [ ] **Step 3: Create `app/(payload)/admin/[[...segments]]/not-found.tsx`**

```tsx
import { NotFoundPage } from "@payloadcms/next/views";
import config from "@/payload.config";

export default function NotFound() {
  return <NotFoundPage config={config} />;
}
```

- [ ] **Step 4: Create `app/(payload)/api/[...slug]/route.ts`**

```ts
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

import config from "@/payload.config";

export const GET = REST_GET(config);
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
```

- [ ] **Step 5: Create `app/(payload)/api/graphql/route.ts`**

```ts
import { GRAPHQL_POST, OPTIONS } from "@payloadcms/next/routes";
import config from "@/payload.config";

export const POST = GRAPHQL_POST(config);
export { OPTIONS };
```

- [ ] **Step 6: Add the `@/` path alias if missing**

The default `tsconfig.json` already has `"@/*": ["./*"]`. Verify with:

```bash
grep -A2 '"paths"' tsconfig.json
```

Expected: shows the `@/*` mapping.

- [ ] **Step 7: Commit**

```bash
git add app/\(payload\)
git commit -m "feat: mount Payload admin and API routes via (payload) route group"
```

---

## Task 8: Verify admin loads (smoke test)

**Files:** none (verification)

- [ ] **Step 1: Confirm Postgres is up**

```bash
docker compose ps
```

Expected: `svnord-postgres` is `healthy`. If not, `bun run db:up`.

- [ ] **Step 2: Start the dev server**

```bash
bun run dev
```

Expected (in another terminal, leave dev server running):
- Output includes `Ready in <time>` and lists `http://localhost:3000`.
- No fatal errors. Warnings about peer dependencies are fine.

- [ ] **Step 3: Open `http://localhost:3000/admin` in a browser**

Expected: Payload's "Create First User" form. Form has email + password fields and a "Create" button.

If you see a database error: check `DATABASE_URI` in `.env.local` matches `docker-compose.yml`.

If you see a `withPayload` error: re-check Task 5.

- [ ] **Step 4: Stop the dev server**

`Ctrl+C` in the dev-server terminal.

- [ ] **Step 5: No commit (verification only)**

---

## Task 9: Set up Vitest + write `slug` helper (TDD)

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/slug.ts`
- Create: `tests/lib/slug.test.ts`

`slug` converts arbitrary German strings ("Senioren A", "B-Juniorinnen", "Erste Mannschaft") to URL-safe slugs ("senioren-a", "b-juniorinnen", "erste-mannschaft"). Used by collection `beforeChange` hooks in later tasks.

- [ ] **Step 1: Install Vitest**

```bash
bun add -d vitest @vitest/coverage-v8
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 3: Write the failing test**

Create `tests/lib/slug.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import { slug } from "@/lib/slug";

describe("slug", () => {
  test("lowercases and joins with hyphens", () => {
    expect(slug("Senioren A")).toBe("senioren-a");
  });

  test("transliterates German umlauts", () => {
    expect(slug("Müller-Höhe")).toBe("mueller-hoehe");
    expect(slug("Schöner Tag")).toBe("schoener-tag");
    expect(slug("Größe")).toBe("groesse");
    expect(slug("ÄÖÜ ßeta")).toBe("aeoeue-sseta");
  });

  test("collapses repeat separators", () => {
    expect(slug("  A   B---C  ")).toBe("a-b-c");
  });

  test("strips other diacritics", () => {
    expect(slug("Café Crème")).toBe("cafe-creme");
  });

  test("returns empty string for empty input", () => {
    expect(slug("")).toBe("");
    expect(slug("   ")).toBe("");
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
bun run test
```

Expected: `Cannot find module '@/lib/slug'` or similar import error.

- [ ] **Step 5: Implement `lib/slug.ts`**

```ts
const umlautMap: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "ae",
  Ö: "oe",
  Ü: "ue",
  ß: "ss",
};

export function slug(input: string): string {
  if (!input) return "";

  const transliterated = input.replace(/[äöüÄÖÜß]/g, (ch) => umlautMap[ch] ?? ch);

  return transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
bun run test
```

Expected: all 5 tests pass.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts lib/slug.ts tests/lib/slug.test.ts package.json bun.lock
git commit -m "feat: add slug helper with German transliteration + tests"
```

---

## Task 10: `format-date` helper (TDD)

**Files:**
- Create: `lib/format-date.ts`
- Create: `tests/lib/format-date.test.ts`

Used to format match kickoff times (`Sa, 14:30`) and event dates (`23. Apr 2026`) consistently. German locale.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";

import { formatKickoff, formatEventDate, formatShortDate } from "@/lib/format-date";

describe("formatKickoff", () => {
  test("formats a Saturday kickoff as 'Sa, 14:30'", () => {
    const d = new Date("2026-04-18T14:30:00+02:00");
    expect(formatKickoff(d)).toBe("Sa, 14:30");
  });

  test("formats a Sunday kickoff as 'So, 10:45'", () => {
    const d = new Date("2026-04-19T10:45:00+02:00");
    expect(formatKickoff(d)).toBe("So, 10:45");
  });
});

describe("formatEventDate", () => {
  test("formats as '23. Apr 2026'", () => {
    const d = new Date("2026-04-23T16:30:00+02:00");
    expect(formatEventDate(d)).toBe("23. Apr 2026");
  });
});

describe("formatShortDate", () => {
  test("formats as '23.04.'", () => {
    const d = new Date("2026-04-23T16:30:00+02:00");
    expect(formatShortDate(d)).toBe("23.04.");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
bun run test tests/lib/format-date.test.ts
```

Expected: import error.

- [ ] **Step 3: Implement `lib/format-date.ts`**

```ts
const TZ = "Europe/Berlin";

const kickoffWeekday = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  timeZone: TZ,
});
const kickoffTime = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});
const eventDateFmt = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});
const shortDateFmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: TZ,
});

const trimDot = (s: string) => s.replace(/\.$/, "");

export function formatKickoff(date: Date): string {
  return `${trimDot(kickoffWeekday.format(date))}, ${kickoffTime.format(date)}`;
}

export function formatEventDate(date: Date): string {
  // Intl outputs "23. Apr. 2026" — drop the dot after the month.
  return eventDateFmt.format(date).replace(/\./g, "").replace(/(\d+)\s/, "$1. ");
}

export function formatShortDate(date: Date): string {
  return shortDateFmt.format(date);
}
```

> **Implementation note:** German `Intl` locale outputs "23. Apr. 2026" with a dot after `Apr`. The test expects "23. Apr 2026" (no dot after month). The `replace` calls normalize to that.

- [ ] **Step 4: Run the test to verify it passes**

```bash
bun run test
```

Expected: 4 new tests pass + the 5 from Task 9 still pass.

- [ ] **Step 5: Commit**

```bash
git add lib/format-date.ts tests/lib/format-date.test.ts
git commit -m "feat: add date formatters for kickoff/event/short German formats"
```

---

## Task 11: Access helpers + revalidate hook stub

**Files:**
- Create: `payload/access/anyone.ts`
- Create: `payload/access/authenticated.ts`
- Create: `payload/hooks/revalidate.ts`

These are shared building blocks that every collection imports.

- [ ] **Step 1: Create `payload/access/anyone.ts`**

```ts
import type { Access } from "payload";

export const anyone: Access = () => true;
```

- [ ] **Step 2: Create `payload/access/authenticated.ts`**

```ts
import type { Access } from "payload";

export const authenticated: Access = ({ req: { user } }) => Boolean(user);
```

- [ ] **Step 3: Create `payload/hooks/revalidate.ts` (stub for P1)**

```ts
import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * P1 stub. P4 wires this to POST /api/revalidate with the right tags.
 * For now, it just logs — schema work in P1 doesn't yet require revalidation.
 */
export const revalidateOnChange =
  (resource: string): CollectionAfterChangeHook =>
  ({ doc }) => {
    if (process.env.NODE_ENV === "development") {
      const id = (doc as { id?: unknown }).id;
      console.info(`[revalidate stub] ${resource} #${String(id)} changed`);
    }
    return doc;
  };

export const revalidateGlobalOnChange =
  (resource: string): GlobalAfterChangeHook =>
  ({ doc }) => {
    if (process.env.NODE_ENV === "development") {
      console.info(`[revalidate stub] global '${resource}' changed`);
    }
    return doc;
  };
```

- [ ] **Step 4: Type-check**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add payload/access payload/hooks
git commit -m "feat: add access helpers and revalidate hook stub for Payload"
```

---

## Task 12: `Users` collection (auth)

**Files:**
- Create: `payload/collections/Users.ts`

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "System",
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
```

- [ ] **Step 2: Wire it into `payload.config.ts` (one-line add to `collections`)**

Edit `payload.config.ts` — change `collections: []` to:

```ts
import { Users } from "./payload/collections/Users";
// ...
collections: [Users],
```

- [ ] **Step 3: Verify Payload sees the collection**

Restart dev server (`Ctrl+C` then `bun run dev`). Open `http://localhost:3000/admin` again. The "Create First User" form should still appear (Payload now knows where to put the user). Create an account: `admin@svnord.de` + a strong password. After save, you land on the dashboard with `Users` in the sidebar under "System".

- [ ] **Step 4: Commit**

```bash
git add payload/collections/Users.ts payload.config.ts
git commit -m "feat: add Users collection (Payload auth)"
```

---

## Task 13: `Media` collection (uploads)

**Files:**
- Create: `payload/collections/Media.ts`

- [ ] **Step 1: Write the collection**

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "System",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  upload: {
    staticDir: path.resolve(dirname, "../../public/uploads"),
    imageSizes: [
      { name: "thumbnail", width: 320 },
      { name: "card", width: 768 },
      { name: "feature", width: 1280 },
      { name: "hero", width: 1920 },
    ],
    formatOptions: {
      format: "webp",
      options: { quality: 80 },
    },
    mimeTypes: ["image/*"],
  },
  fields: [
    { name: "alt", type: "text", required: true },
    { name: "caption", type: "text" },
    { name: "credit", type: "text" },
  ],
};
```

> **Note on storage**: P1 uses local disk under `public/uploads/`. P6 swaps in `@payloadcms/storage-vercel-blob`. The local files give us instant feedback during P1–P5 without paid services.

- [ ] **Step 2: Add `Media` to `payload.config.ts`**

```ts
import { Media } from "./payload/collections/Media";
// ...
collections: [Users, Media],
```

- [ ] **Step 3: Add `public/uploads/` to gitignore**

Edit `.gitignore`, add at end:
```
/public/uploads/
```

- [ ] **Step 4: Restart dev, verify**

`Ctrl+C` and `bun run dev`. In `/admin`, click `Media` in sidebar → "Create New" → upload any image. Verify it shows up + the file lands in `public/uploads/`.

- [ ] **Step 5: Commit**

```bash
git add payload/collections/Media.ts payload.config.ts .gitignore
git commit -m "feat: add Media collection with WebP image processing"
```

---

## Task 14: `People` collection

**Files:**
- Create: `payload/collections/People.ts`

People = Vorstand, trainers, sport leads, optionally players.

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const People: CollectionConfig = {
  slug: "people",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "function", "role", "email"],
    group: "Sport",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("people")],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true, admin: { description: "e.g. 1. Vorstand · Sportlicher Leiter · Trainer A1" } },
    {
      name: "function",
      type: "select",
      required: true,
      options: [
        { label: "Vorstand", value: "vorstand" },
        { label: "Sportleitung", value: "sportleitung" },
        { label: "Jugendleitung", value: "jugendleitung" },
        { label: "Trainer", value: "trainer" },
        { label: "Zeugwart", value: "zeugwart" },
        { label: "Spieler", value: "spieler" },
        { label: "Andere", value: "andere" },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    { name: "team", type: "relationship", relationTo: "teams", admin: { description: "Optional. Used for trainer/player assignment." } },
    { name: "order", type: "number", defaultValue: 0, admin: { description: "Lower = earlier in lists." } },
  ],
};
```

- [ ] **Step 2: Add to `payload.config.ts`**

```ts
import { People } from "./payload/collections/People";
// ...
collections: [Users, Media, People],
```

> **Heads up:** the `team` relationship references `teams`, defined in Task 15. Payload tolerates forward references at config-build time. Verify after Task 15.

- [ ] **Step 3: Type-check (will fail until Task 15)**

```bash
bunx tsc --noEmit
```

Expected: no TS errors at this stage (Payload's relationship strings are not type-checked against collection slugs at TS level).

- [ ] **Step 4: Commit**

```bash
git add payload/collections/People.ts payload.config.ts
git commit -m "feat: add People collection (Vorstand, trainers, players)"
```

---

## Task 15: `Teams` collection

**Files:**
- Create: `payload/collections/Teams.ts`

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";
import { slug as toSlug } from "@/lib/slug";

const fillSlug: CollectionBeforeChangeHook = ({ data }) => {
  if (!data.slug && data.name) {
    data.slug = toSlug(String(data.name));
  }
  return data;
};

export const Teams: CollectionConfig = {
  slug: "teams",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sport", "ageGroup", "league", "season"],
    group: "Sport",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [fillSlug],
    afterChange: [revalidateOnChange("teams")],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, admin: { description: "Auto-generated from name. Edit only if you know what you're doing." } },
    {
      name: "sport",
      type: "select",
      required: true,
      options: [
        { label: "Fußball", value: "fussball" },
        { label: "Volleyball", value: "volleyball" },
        { label: "Gymnastik", value: "gymnastik" },
        { label: "Ski", value: "ski" },
        { label: "Esport", value: "esport" },
        { label: "Schiedsrichter", value: "schiedsrichter" },
      ],
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Senioren", value: "senioren" },
        { label: "Junioren", value: "junioren" },
        { label: "Juniorinnen", value: "juniorinnen" },
        { label: "Bambini", value: "bambini" },
        { label: "Allgemein", value: "allgemein" },
      ],
      defaultValue: "allgemein",
    },
    { name: "ageGroup", type: "text", admin: { description: "z.B. A1, B2, F3, Bambini" } },
    { name: "season", type: "text", admin: { description: "z.B. 2025/26" } },
    { name: "league", type: "text", admin: { description: "z.B. Bezirksliga Oberbayern" } },
    {
      name: "trainers",
      type: "relationship",
      relationTo: "people",
      hasMany: true,
    },
    {
      name: "description",
      type: "richText",
    },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      name: "externalLinks",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
      admin: { description: "z.B. BFV Spielplan, Tabelle, etc." },
    },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
```

- [ ] **Step 2: Add to `payload.config.ts`**

```ts
import { Teams } from "./payload/collections/Teams";
// ...
collections: [Users, Media, People, Teams],
```

- [ ] **Step 3: Restart dev, verify**

In `/admin`, see `Teams` in sidebar under "Sport". Create one to verify (e.g. "Erste"). Confirm slug auto-fills as `erste`.

- [ ] **Step 4: Commit**

```bash
git add payload/collections/Teams.ts payload.config.ts
git commit -m "feat: add Teams collection with slug hook + sport/category/league fields"
```

---

## Task 16: `Posts` collection

**Files:**
- Create: `payload/collections/Posts.ts`

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";
import { slug as toSlug } from "@/lib/slug";

const fillSlug: CollectionBeforeChangeHook = ({ data }) => {
  if (!data.slug && data.title) {
    data.slug = toSlug(String(data.title));
  }
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "author"],
    group: "Content",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [fillSlug],
    afterChange: [revalidateOnChange("posts")],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "excerpt", type: "textarea", admin: { description: "1–2 sentence teaser shown in cards." } },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", required: true },
    { name: "author", type: "relationship", relationTo: "people" },
    { name: "publishedAt", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    {
      name: "tags",
      type: "select",
      hasMany: true,
      options: [
        { label: "Spielbericht", value: "spielbericht" },
        { label: "Verein", value: "verein" },
        { label: "Jugend", value: "jugend" },
        { label: "Event", value: "event" },
        { label: "Sponsoren", value: "sponsoren" },
        { label: "Allgemein", value: "allgemein" },
      ],
    },
  ],
};
```

- [ ] **Step 2: Add to `payload.config.ts`**

```ts
import { Posts } from "./payload/collections/Posts";
// ...
collections: [Users, Media, People, Teams, Posts],
```

- [ ] **Step 3: Restart dev, verify in admin**

`Posts` appears under "Content". Create a draft post to confirm the rich-text Lexical editor loads and the toolbar (Bold, Italic, Headings, Lists, Link, Upload) is present.

- [ ] **Step 4: Commit**

```bash
git add payload/collections/Posts.ts payload.config.ts
git commit -m "feat: add Posts collection with Lexical body + tags"
```

---

## Task 17: `Sponsors` collection

**Files:**
- Create: `payload/collections/Sponsors.ts`

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tier", "url"],
    group: "Verein",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("sponsors")],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media", required: true },
    { name: "url", type: "text" },
    {
      name: "tier",
      type: "select",
      required: true,
      options: [
        { label: "Premium", value: "premium" },
        { label: "Standard", value: "standard" },
      ],
      defaultValue: "standard",
    },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
```

- [ ] **Step 2: Add to `payload.config.ts`**

```ts
import { Sponsors } from "./payload/collections/Sponsors";
// ...
collections: [Users, Media, People, Teams, Posts, Sponsors],
```

- [ ] **Step 3: Commit**

```bash
git add payload/collections/Sponsors.ts payload.config.ts
git commit -m "feat: add Sponsors collection with tier (premium/standard)"
```

---

## Task 18: `Fixtures` collection

**Files:**
- Create: `payload/collections/Fixtures.ts`

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Fixtures: CollectionConfig = {
  slug: "fixtures",
  admin: {
    useAsTitle: "opponent",
    defaultColumns: ["team", "opponent", "kickoff", "competition", "isHome"],
    group: "Sport",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("fixtures")],
  },
  fields: [
    { name: "team", type: "relationship", relationTo: "teams", required: true },
    { name: "opponent", type: "text", required: true, admin: { description: "Name des gegnerischen Vereins" } },
    { name: "kickoff", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "competition", type: "text", admin: { description: "z.B. Bezirksliga · Spieltag 20" } },
    { name: "venue", type: "text", admin: { description: "z.B. Eschengarten · ASV Dachau" } },
    { name: "isHome", type: "checkbox", defaultValue: true, label: "Heimspiel" },
    {
      name: "result",
      type: "group",
      admin: { description: "Erst nach dem Spiel ausfüllen." },
      fields: [
        { name: "homeGoals", type: "number" },
        { name: "awayGoals", type: "number" },
      ],
    },
  ],
};
```

- [ ] **Step 2: Add to `payload.config.ts`**

```ts
import { Fixtures } from "./payload/collections/Fixtures";
// ...
collections: [Users, Media, People, Teams, Posts, Sponsors, Fixtures],
```

- [ ] **Step 3: Commit**

```bash
git add payload/collections/Fixtures.ts payload.config.ts
git commit -m "feat: add Fixtures collection (kickoff + competition + result)"
```

---

## Task 19: `Events` collection

**Files:**
- Create: `payload/collections/Events.ts`

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startsAt", "location"],
    group: "Content",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("events")],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "startsAt", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "endsAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "location", type: "text" },
    { name: "description", type: "richText" },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "ctaUrl", type: "text", admin: { description: "Optional. Externer Link, z.B. zur Anmeldung." } },
  ],
};
```

- [ ] **Step 2: Add to `payload.config.ts`**

```ts
import { Events } from "./payload/collections/Events";
// ...
collections: [Users, Media, People, Teams, Posts, Sponsors, Fixtures, Events],
```

- [ ] **Step 3: Commit**

```bash
git add payload/collections/Events.ts payload.config.ts
git commit -m "feat: add Events collection (training, parties, Jeep Cup, etc.)"
```

---

## Task 20: `Submissions` collection (read-only public, admin sees)

**Files:**
- Create: `payload/collections/Submissions.ts`

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";

export const Submissions: CollectionConfig = {
  slug: "submissions",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt", "handled"],
    group: "Verein",
  },
  access: {
    // Public CANNOT read submissions. Only admins.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    // Public CAN create — but only via the /api/contact route, not directly.
    // The route handler uses Payload's local API, which bypasses access checks.
    create: () => false,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "subject", type: "text" },
    { name: "message", type: "textarea", required: true },
    { name: "handled", type: "checkbox", defaultValue: false, label: "Erledigt" },
    { name: "notes", type: "textarea", admin: { description: "Interne Notizen — nicht öffentlich." } },
  ],
  timestamps: true,
};
```

- [ ] **Step 2: Add to `payload.config.ts`**

```ts
import { Submissions } from "./payload/collections/Submissions";
// ...
collections: [Users, Media, People, Teams, Posts, Sponsors, Fixtures, Events, Submissions],
```

- [ ] **Step 3: Commit**

```bash
git add payload/collections/Submissions.ts payload.config.ts
git commit -m "feat: add Submissions collection (admin-readable contact-form storage)"
```

---

## Task 21: Globals — `SiteSettings`, `Navigation`, `HomePage`

**Files:**
- Create: `payload/globals/SiteSettings.ts`
- Create: `payload/globals/Navigation.ts`
- Create: `payload/globals/HomePage.ts`

- [ ] **Step 1: Write `payload/globals/SiteSettings.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("site-settings")] },
  fields: [
    { name: "name", type: "text", required: true, defaultValue: "SV Nord München-Lerchenau e.V." },
    { name: "tagline", type: "text", defaultValue: "Einmal Nordler, immer Nordler." },
    { name: "description", type: "textarea" },
    { name: "ogImage", type: "upload", relationTo: "media" },
    {
      name: "social",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "Facebook", value: "facebook" },
            { label: "YouTube", value: "youtube" },
            { label: "X / Twitter", value: "x" },
            { label: "TikTok", value: "tiktok" },
          ],
          required: true,
        },
        { name: "url", type: "text", required: true },
      ],
    },
  ],
};
```

- [ ] **Step 2: Write `payload/globals/Navigation.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("navigation")] },
  fields: [
    {
      name: "header",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
    {
      name: "footerColumns",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Write `payload/globals/HomePage.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("home-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "pretitle", type: "text", defaultValue: "Heimspieltag · Sa 14:30 · Eschengarten" },
        { name: "headlineLine1", type: "text", required: true, defaultValue: "Einmal Nordler," },
        { name: "headlineLine2", type: "text", required: true, defaultValue: "immer Nordler." },
        { name: "subline", type: "textarea", defaultValue: "Seit 1947 zuhause im Münchner Norden. 500+ Mitglieder, vier Sportarten, eine Familie." },
        { name: "primaryCtaLabel", type: "text", defaultValue: "Spielplan" },
        { name: "primaryCtaHref", type: "text", defaultValue: "/fussball" },
        { name: "secondaryCtaLabel", type: "text", defaultValue: "Verein kennenlernen" },
        { name: "secondaryCtaHref", type: "text", defaultValue: "/verein" },
      ],
    },
    {
      name: "stats",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
      defaultValue: [
        { label: "Gegründet", value: "1947" },
        { label: "Mitglieder", value: "500+" },
        { label: "Mannschaften", value: "13" },
        { label: "Bezirksliga", value: "3. Platz" },
      ],
    },
    {
      name: "sections",
      type: "group",
      admin: { description: "Welche Sektionen werden auf der Startseite angezeigt?" },
      fields: [
        { name: "showNextMatch", type: "checkbox", defaultValue: true },
        { name: "showNews", type: "checkbox", defaultValue: true },
        { name: "showSports", type: "checkbox", defaultValue: true },
        { name: "showEvents", type: "checkbox", defaultValue: true },
        { name: "showSponsors", type: "checkbox", defaultValue: true },
        { name: "showVereinsheim", type: "checkbox", defaultValue: true },
        { name: "showMembershipCta", type: "checkbox", defaultValue: true },
      ],
    },
  ],
};
```

- [ ] **Step 4: Add all three to `payload.config.ts`**

```ts
import { SiteSettings } from "./payload/globals/SiteSettings";
import { Navigation } from "./payload/globals/Navigation";
import { HomePage } from "./payload/globals/HomePage";
// ...
globals: [SiteSettings, Navigation, HomePage],
```

- [ ] **Step 5: Restart dev, verify**

`/admin` → Settings group in sidebar shows three globals. Open each, verify field rendering.

- [ ] **Step 6: Commit**

```bash
git add payload/globals payload.config.ts
git commit -m "feat: add SiteSettings/Navigation/HomePage globals"
```

---

## Task 22: Globals — `ContactInfo` + `LegalPages`

**Files:**
- Create: `payload/globals/ContactInfo.ts`
- Create: `payload/globals/LegalPages.ts`

- [ ] **Step 1: Write `payload/globals/ContactInfo.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const ContactInfo: GlobalConfig = {
  slug: "contact-info",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("contact-info")] },
  fields: [
    {
      name: "addresses",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true, admin: { description: "z.B. 'Postanschrift', 'Vereinsheim Eschengarten'" } },
        { name: "street", type: "text", required: true },
        { name: "postalCode", type: "text", required: true },
        { name: "city", type: "text", required: true, defaultValue: "München" },
      ],
    },
    { name: "phone", type: "text", defaultValue: "0172 2392919" },
    { name: "email", type: "email", required: true, defaultValue: "info@svnord.de" },
    { name: "iban", type: "text", admin: { description: "Für Mitgliedsbeiträge / Spenden." } },
    {
      name: "openingHours",
      type: "array",
      fields: [
        { name: "day", type: "text", required: true, admin: { description: "z.B. Mo–Fr, Sa, So" } },
        { name: "hours", type: "text", required: true, admin: { description: "z.B. 17:00–22:00 oder geschlossen" } },
      ],
    },
    { name: "mapEmbedSrc", type: "text", admin: { description: "Optional iframe src für Google Maps embed." } },
  ],
};
```

- [ ] **Step 2: Write `payload/globals/LegalPages.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const LegalPages: GlobalConfig = {
  slug: "legal-pages",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("legal-pages")] },
  fields: [
    { name: "impressumBody", type: "richText", required: true },
    { name: "datenschutzBody", type: "richText", required: true },
  ],
};
```

- [ ] **Step 3: Add both to `payload.config.ts`**

```ts
import { ContactInfo } from "./payload/globals/ContactInfo";
import { LegalPages } from "./payload/globals/LegalPages";
// ...
globals: [SiteSettings, Navigation, HomePage, ContactInfo, LegalPages],
```

- [ ] **Step 4: Commit**

```bash
git add payload/globals/ContactInfo.ts payload/globals/LegalPages.ts payload.config.ts
git commit -m "feat: add ContactInfo and LegalPages globals"
```

---

## Task 23: Globals — `ChronikPage`, `VereinsheimPage`, `JugendfoerderPage`

**Files:**
- Create: `payload/globals/ChronikPage.ts`
- Create: `payload/globals/VereinsheimPage.ts`
- Create: `payload/globals/JugendfoerderPage.ts`

These three are very similar (Lexical body + optional gallery + meta), so write them together.

- [ ] **Step 1: Write `payload/globals/ChronikPage.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const ChronikPage: GlobalConfig = {
  slug: "chronik-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("chronik-page")] },
  fields: [
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "intro", type: "textarea" },
    { name: "body", type: "richText", required: true },
  ],
};
```

- [ ] **Step 2: Write `payload/globals/VereinsheimPage.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const VereinsheimPage: GlobalConfig = {
  slug: "vereinsheim-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("vereinsheim-page")] },
  fields: [
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "intro", type: "textarea" },
    { name: "body", type: "richText", required: true },
    {
      name: "gallery",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
  ],
};
```

- [ ] **Step 3: Write `payload/globals/JugendfoerderPage.ts`**

```ts
import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const JugendfoerderPage: GlobalConfig = {
  slug: "jugendfoerder-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("jugendfoerder-page")] },
  fields: [
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", required: true },
    { name: "iban", type: "text", admin: { description: "Spenden-IBAN für den Jugendförderverein." } },
    { name: "contactEmail", type: "email" },
  ],
};
```

- [ ] **Step 4: Add all three to `payload.config.ts`**

```ts
import { ChronikPage } from "./payload/globals/ChronikPage";
import { VereinsheimPage } from "./payload/globals/VereinsheimPage";
import { JugendfoerderPage } from "./payload/globals/JugendfoerderPage";
// ...
globals: [
  SiteSettings,
  Navigation,
  HomePage,
  ContactInfo,
  ChronikPage,
  VereinsheimPage,
  JugendfoerderPage,
  LegalPages,
],
```

- [ ] **Step 5: Restart dev, verify**

All 8 globals show in the Settings group in the admin sidebar.

- [ ] **Step 6: Commit**

```bash
git add payload/globals/ChronikPage.ts payload/globals/VereinsheimPage.ts payload/globals/JugendfoerderPage.ts payload.config.ts
git commit -m "feat: add Chronik, Vereinsheim, and Jugendförderverein page globals"
```

---

## Task 24: Generate Payload TypeScript types

**Files:**
- Create (auto): `payload-types.ts`

- [ ] **Step 1: Run the type generator**

```bash
bun run payload:generate-types
```

Expected: writes `payload-types.ts` at the project root with `interface Post`, `interface Team`, `interface User`, `interface Media`, `interface SiteSettings`, etc.

- [ ] **Step 2: Spot-check the file**

```bash
grep -E "interface (Post|Team|User|HomePage|SiteSettings)" payload-types.ts
```

Expected: each interface name appears at least once.

- [ ] **Step 3: Commit**

```bash
git add payload-types.ts
git commit -m "chore: generate Payload TypeScript types"
```

---

## Task 25: Tailwind v4 theme tokens — club colors

**Files:**
- Modify: `app/globals.css`

The existing `app/globals.css` has placeholder vars. Replace with the SV Nord token set. Tailwind v4 reads `@theme` blocks to generate utilities.

- [ ] **Step 1: Replace `app/globals.css` contents**

```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-nord-navy: #0e1e4a;
  --color-nord-navy-2: #1a3a8e;
  --color-nord-sky: #60c0e8;
  --color-nord-gold: #c8a96a;
  --color-nord-paper: #fafafa;
  --color-nord-ink: #0a0a0a;
  --color-nord-muted: #6b6b6b;
  --color-nord-line: rgb(0 0 0 / 0.08);

  /* Fonts (Geist already loaded in app/layout.tsx) */
  --font-sans: var(--font-geist-sans), -apple-system, "Inter", system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  /* Container width used across pages */
  --container-7xl: 80rem; /* 1280px */
}

@layer base {
  :root {
    color-scheme: light;
  }

  html {
    background: var(--color-nord-paper);
    color: var(--color-nord-ink);
    -webkit-font-smoothing: antialiased;
  }

  body {
    font-family: var(--font-sans);
  }

  ::selection {
    background: var(--color-nord-sky);
    color: var(--color-nord-navy);
  }
}
```

- [ ] **Step 2: Verify Tailwind sees the new tokens**

Restart dev (`Ctrl+C`, `bun run dev`). Open `http://localhost:3000`. The default Next.js scaffold page should render with no console errors. The page background should now be `#fafafa` (slightly off-white).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add SV Nord brand color tokens to Tailwind v4 theme"
```

---

## Task 26: Update root layout metadata

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace metadata in `app/layout.tsx`**

Current `export const metadata` has the create-next-app placeholder. Update:

```tsx
export const metadata: Metadata = {
  title: {
    default: "SV Nord München-Lerchenau e.V.",
    template: "%s · SV Nord München-Lerchenau",
  },
  description:
    "Traditionsverein im Münchner Norden seit 1947. Fußball, Volleyball, Gymnastik, Ski. ~500 Mitglieder, eine Familie.",
};
```

- [ ] **Step 2: Verify the page title**

Restart dev, refresh `http://localhost:3000` — browser tab title should now read `SV Nord München-Lerchenau e.V.`.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: set proper site metadata in root layout"
```

---

## Task 27: Image download script

**Files:**
- Create: `scripts/download-images.ts`

Mirrors every image referenced in `.firecrawl/svnord-lerchenau.json` into `tmp/wix-images/` so the seed script can upload them via Payload's local API without depending on Wix CDN.

- [ ] **Step 1: Write `scripts/download-images.ts`**

```ts
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const SRC = path.resolve(process.cwd(), ".firecrawl/svnord-lerchenau.json");
const OUT_DIR = path.resolve(process.cwd(), "tmp/wix-images");

type Crawl = {
  data: Array<{
    metadata?: { sourceURL?: string };
    markdown?: string;
  }>;
};

const IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 16);

async function main() {
  const raw = await fs.readFile(SRC, "utf-8");
  const crawl = JSON.parse(raw) as Crawl;

  await fs.mkdir(OUT_DIR, { recursive: true });

  const seen = new Set<string>();
  const tasks: Promise<void>[] = [];

  for (const page of crawl.data) {
    const md = page.markdown ?? "";
    for (const m of md.matchAll(IMAGE_RE)) {
      const [, alt, url] = m;
      if (!url || seen.has(url)) continue;
      seen.add(url);

      const ext = (() => {
        const u = new URL(url);
        const m2 = /\.(jpe?g|png|gif|webp|svg)$/i.exec(u.pathname);
        return m2 ? m2[1].toLowerCase() : "jpg";
      })();

      const filename = `${hash(url)}.${ext}`;
      const dest = path.join(OUT_DIR, filename);

      tasks.push(
        (async () => {
          try {
            await fs.access(dest);
            // already downloaded
          } catch {
            const res = await fetch(url);
            if (!res.ok) {
              console.warn(`SKIP ${res.status}: ${url}`);
              return;
            }
            const buf = Buffer.from(await res.arrayBuffer());
            await fs.writeFile(dest, buf);
            console.log(`✓ ${filename}  ${alt.slice(0, 40)}`);
          }
        })(),
      );
    }
  }

  await Promise.all(tasks);

  // Write a manifest mapping URL -> filename + alt for the seed script.
  const manifest: Record<string, { filename: string; alt: string }> = {};
  for (const page of crawl.data) {
    const md = page.markdown ?? "";
    for (const m of md.matchAll(IMAGE_RE)) {
      const [, alt, url] = m;
      if (!url) continue;
      const ext = (() => {
        const u = new URL(url);
        const m2 = /\.(jpe?g|png|gif|webp|svg)$/i.exec(u.pathname);
        return m2 ? m2[1].toLowerCase() : "jpg";
      })();
      manifest[url] = { filename: `${hash(url)}.${ext}`, alt: alt || "" };
    }
  }
  await fs.writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`\nDone. ${seen.size} unique images. Manifest: ${path.join(OUT_DIR, "manifest.json")}`);
}

void main();
```

- [ ] **Step 2: Run it**

```bash
bun run download-images
```

Expected: prints `✓ <hash>.jpg  <alt>` lines, ends with "Done. NN unique images." Some `SKIP 404`s for stub URLs are fine.

- [ ] **Step 3: Add `tmp/` to `.gitignore`**

Edit `.gitignore`, add at end:
```
/tmp/
```

- [ ] **Step 4: Commit**

```bash
git add scripts/download-images.ts .gitignore
git commit -m "chore: add image download script that mirrors Wix CDN to tmp/wix-images"
```

---

## Task 28: Seed script

**Files:**
- Create: `scripts/seed.ts`

Imports the firecrawl content into Payload via the local API. Idempotent — uses upsert by slug/email.

- [ ] **Step 1: Write `scripts/seed.ts`**

```ts
import fs from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "@/payload.config";
import { slug } from "@/lib/slug";

const MANIFEST_PATH = path.resolve(process.cwd(), "tmp/wix-images/manifest.json");
const IMG_DIR = path.resolve(process.cwd(), "tmp/wix-images");

type Manifest = Record<string, { filename: string; alt: string }>;

async function uploadImage(payload: Awaited<ReturnType<typeof getPayload>>, filename: string, alt: string) {
  const filepath = path.join(IMG_DIR, filename);
  const buffer = await fs.readFile(filepath);
  const result = await payload.create({
    collection: "media",
    data: { alt: alt || filename },
    file: {
      data: buffer,
      mimetype: filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg",
      name: filename,
      size: buffer.length,
    },
  });
  return result.id as number | string;
}

async function ensurePerson(payload: Awaited<ReturnType<typeof getPayload>>, p: {
  name: string; role: string; function: string; phone?: string; email?: string; order: number;
}) {
  const existing = await payload.find({
    collection: "people",
    where: { name: { equals: p.name } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0]!.id;

  const created = await payload.create({
    collection: "people",
    data: p as never,
  });
  return created.id;
}

async function ensureTeam(payload: Awaited<ReturnType<typeof getPayload>>, t: {
  name: string; sport: string; category: string; ageGroup?: string; order: number;
}) {
  const teamSlug = slug(t.name);
  const existing = await payload.find({
    collection: "teams",
    where: { slug: { equals: teamSlug } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0]!.id;

  const created = await payload.create({
    collection: "teams",
    data: { ...t, slug: teamSlug, season: "2025/26" } as never,
  });
  return created.id;
}

async function main() {
  const payload = await getPayload({ config });

  // 1. Vorstand (from spec §2). Photos optional in P1; can be set later in admin.
  const vorstand = [
    { name: "Ralf Kirmeyer", role: "1. Vorstand", function: "vorstand", phone: "0172 9808109", email: "ralf.kirmeyer@svnord.de", order: 1 },
    { name: "Birgit Höfer", role: "2. Vorstand", function: "vorstand", phone: "0173 9547204", email: "birgit.hoefer@svnord.de", order: 2 },
    { name: "Britta Feierabend", role: "Kassier", function: "vorstand", phone: "0176 96655106", email: "britta.feierabend@svnord.de", order: 3 },
    { name: "Fabian Falk", role: "Schriftführer", function: "vorstand", phone: "0170 5859347", email: "fabian.falk@svnord.de", order: 4 },
    { name: "Felix Kirmeyer", role: "Sportlicher Leiter", function: "sportleitung", phone: "0176 63691739", email: "felix.kirmeyer@svnord.de", order: 5 },
    { name: "Tobias Treffer", role: "Jugendleitung Großfeld", function: "jugendleitung", phone: "0176 55126535", email: "tobias.treffer@svnord.de", order: 6 },
    { name: "Ergin Piker", role: "Jugendleitung Kleinfeld", function: "jugendleitung", phone: "0160 5892697", email: "ergin.piker@svnord.de", order: 7 },
  ];

  for (const p of vorstand) {
    await ensurePerson(payload, p);
  }

  // 2. Teams (from spec §5). All 22 footballl teams + the 5 other-sport pages.
  const teams = [
    // Senioren
    { name: "Erste", sport: "fussball", category: "senioren", order: 1 },
    { name: "Zwoate", sport: "fussball", category: "senioren", order: 2 },
    { name: "Dritte", sport: "fussball", category: "senioren", order: 3 },
    { name: "Senioren A", sport: "fussball", category: "senioren", order: 4 },
    { name: "Senioren B", sport: "fussball", category: "senioren", order: 5 },
    // Junioren
    { name: "A1 Junioren", sport: "fussball", category: "junioren", ageGroup: "A1", order: 10 },
    { name: "A2 Junioren", sport: "fussball", category: "junioren", ageGroup: "A2", order: 11 },
    { name: "B1 Junioren", sport: "fussball", category: "junioren", ageGroup: "B1", order: 12 },
    { name: "B2 Junioren", sport: "fussball", category: "junioren", ageGroup: "B2", order: 13 },
    { name: "C1 Junioren", sport: "fussball", category: "junioren", ageGroup: "C1", order: 14 },
    { name: "D1 Junioren", sport: "fussball", category: "junioren", ageGroup: "D1", order: 15 },
    { name: "D2 Junioren", sport: "fussball", category: "junioren", ageGroup: "D2", order: 16 },
    { name: "E1 Junioren", sport: "fussball", category: "junioren", ageGroup: "E1", order: 17 },
    { name: "E2 Junioren", sport: "fussball", category: "junioren", ageGroup: "E2", order: 18 },
    { name: "F1 Junioren", sport: "fussball", category: "junioren", ageGroup: "F1", order: 19 },
    { name: "F2 Junioren", sport: "fussball", category: "junioren", ageGroup: "F2", order: 20 },
    { name: "F3 Junioren", sport: "fussball", category: "junioren", ageGroup: "F3", order: 21 },
    { name: "G Junioren", sport: "fussball", category: "junioren", ageGroup: "G", order: 22 },
    { name: "Bambini", sport: "fussball", category: "bambini", ageGroup: "Bambini", order: 23 },
    // Juniorinnen
    { name: "B-Juniorinnen", sport: "fussball", category: "juniorinnen", ageGroup: "B", order: 30 },
    { name: "C-Juniorinnen", sport: "fussball", category: "juniorinnen", ageGroup: "C", order: 31 },
    { name: "D-Juniorinnen", sport: "fussball", category: "juniorinnen", ageGroup: "D", order: 32 },
    // Other sports — single team per sport for the section page
    { name: "Volleyball", sport: "volleyball", category: "allgemein", order: 100 },
    { name: "Gymnastik", sport: "gymnastik", category: "allgemein", order: 101 },
    { name: "Ski", sport: "ski", category: "allgemein", order: 102 },
    { name: "Esport", sport: "esport", category: "allgemein", order: 103 },
    { name: "Schiedsrichter", sport: "schiedsrichter", category: "allgemein", order: 104 },
  ];

  for (const t of teams) {
    await ensureTeam(payload, t);
  }

  // 3. Manifest (optional — only seed images if download was run)
  let manifest: Manifest = {};
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf-8")) as Manifest;
  } catch {
    console.warn("No image manifest found. Run `bun run download-images` first to import photos.");
  }

  // 4. Two news posts from the crawl
  const author = await payload.find({
    collection: "people",
    where: { name: { equals: "Felix Kirmeyer" } },
    limit: 1,
  });
  const authorId = author.docs[0]?.id;

  const posts = [
    {
      title: "Die Ergebnisse vom Wochenende",
      slug: "die-ergebnisse-vom-wochenende",
      excerpt: "1:2-Auswärtssieg in Dachau. Platz 3 in der Bezirksliga.",
      publishedAt: new Date("2026-03-04T09:00:00+01:00").toISOString(),
      tags: ["spielbericht"],
      bodyText: "Nach langer Vorbereitung sind wir endlich in die Punktspiele 2026 gestartet. Bezirksliga – 19. Spieltag (Rückrunde). Auswärts beim ASV Dachau: 2. vs. 4. – ein echter Kracher! Früher Rückstand, starke Reaktion und ein verdienter 1:2-Auswärtssieg. Platz 3 in der Tabelle (punktgleich mit Platz 2). 3. Mannschaft: Matschschlacht gegen den FV Hansa Neuhausen – trotz Top-Chancen bleibt's beim 0:0.",
    },
    {
      title: "40 Jahre Eschengarten",
      slug: "40-jahre-eschengarten",
      excerpt: "Vier Jahrzehnte Vereinsheim — eine Chronik in Bildern.",
      publishedAt: new Date("2026-02-06T18:00:00+01:00").toISOString(),
      tags: ["verein"],
      bodyText: "Am 5. Mai 1983 entschlossen sich die Vereinsvorstände des SV Nord München-Lerchenau, des HuVTV Edelweiß-Stamm München und des FC Eintracht München, das von der Stadt München angebotene Fördermodell „Vereinsförderung von selbst errichteten Vereinsheimen" in Anspruch zu nehmen. Ein Jahr später, am 2. Juli 1984, wurde der Eschengarten in Eigenregie gebaut.",
    },
  ];

  for (const p of posts) {
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) continue;

    await payload.create({
      collection: "posts",
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
        tags: p.tags,
        ...(authorId ? { author: authorId } : {}),
        body: {
          root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            direction: "ltr",
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                direction: "ltr",
                children: [{ type: "text", text: p.bodyText, format: 0, version: 1 }],
              },
            ],
          },
        },
      } as never,
    });
  }

  // 5. Globals — set defaults so the homepage isn't blank.
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      name: "SV Nord München-Lerchenau e.V.",
      tagline: "Einmal Nordler, immer Nordler.",
      description: "Traditionsverein im Münchner Norden seit 1947.",
      social: [{ platform: "instagram", url: "https://www.instagram.com/svnord_ski/" }],
    } as never,
  });

  await payload.updateGlobal({
    slug: "navigation",
    data: {
      header: [
        { label: "Verein", href: "/verein" },
        { label: "Fußball", href: "/fussball" },
        { label: "Sport", href: "/volleyball" },
        { label: "News", href: "/news" },
        { label: "Termine", href: "/termine" },
        { label: "Sponsoren", href: "/sponsoren" },
        { label: "Kontakt", href: "/kontakt" },
      ],
      footerColumns: [
        {
          title: "Verein",
          links: [
            { label: "Über uns", href: "/verein" },
            { label: "Vorstand", href: "/verein/vorstand" },
            { label: "Chronik", href: "/verein/chronik" },
            { label: "Vereinsheim", href: "/verein/vereinsheim" },
          ],
        },
        {
          title: "Sport",
          links: [
            { label: "Fußball", href: "/fussball" },
            { label: "Volleyball", href: "/volleyball" },
            { label: "Gymnastik", href: "/gymnastik" },
            { label: "Ski", href: "/ski" },
          ],
        },
        {
          title: "Mitmachen",
          links: [
            { label: "Mitglied werden", href: "/mitgliedschaft" },
            { label: "Sponsoring", href: "/sponsoren" },
          ],
        },
        {
          title: "Folgen",
          links: [{ label: "Instagram", href: "https://www.instagram.com/svnord_ski/" }],
        },
      ],
    } as never,
  });

  await payload.updateGlobal({
    slug: "contact-info",
    data: {
      addresses: [
        { label: "Vereinsheim Eschengarten", street: "Eschenstraße", postalCode: "80995", city: "München" },
      ],
      phone: "0172 2392919",
      email: "info@svnord.de",
    } as never,
  });

  console.log("\n✓ Seed complete.");
  process.exit(0);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

> **Note**: This script seeds the *minimum* needed to demo the schema. The Vorstand will populate richer content (real photos, more posts, sponsor logos, fixtures, events, vereinschronik, vereinsheim text, jugendförderverein text, legal text) via the admin after first run. P2 requires only the data above to render the homepage.

- [ ] **Step 2: Run the seed**

```bash
bun run seed
```

Expected: prints upsert progress, ends with `✓ Seed complete.` Re-running is safe (idempotent on slug/name lookups).

- [ ] **Step 3: Verify in admin**

Restart dev. Open `/admin`:
- People: 7 entries (Vorstand + sport leads)
- Teams: 27 entries (22 football + 5 other-sport rows)
- Posts: 2 entries
- Globals: SiteSettings/Navigation/ContactInfo populated

- [ ] **Step 4: Commit**

```bash
git add scripts/seed.ts
git commit -m "chore: add seed script that imports firecrawl content into Payload"
```

---

## Task 29: Final P1 verification

**Files:** none (verification)

- [ ] **Step 1: Run all tests**

```bash
bun run test
```

Expected: 9 tests passing across `slug.test.ts` and `format-date.test.ts`.

- [ ] **Step 2: Type-check the whole project**

```bash
bunx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Lint the whole project**

```bash
bun run lint
```

Expected: zero errors. (Warnings about unused imports in scaffold files are acceptable.)

- [ ] **Step 4: Cold-boot smoke test**

```bash
docker compose down
docker compose up -d postgres
bun run dev
```

Open `http://localhost:3000/admin`, log in with the admin credentials from Task 8, and verify:
1. Sidebar groups: Content (Posts, Events) · Sport (Teams, People, Fixtures) · Verein (Sponsors, Submissions) · Settings (8 globals) · System (Users, Media)
2. Posts list shows the 2 seeded posts
3. Teams list shows 27 teams
4. People list shows 7 people
5. Lexical editor opens for a post, toolbar visible
6. Image upload works on a Media create form

If any item fails, fix the corresponding earlier task and re-run from Step 4.

- [ ] **Step 5: Tag the milestone**

```bash
git tag p1-foundation-complete
git log --oneline | head -30
```

Expected: ~28 commits since the design-spec commit, the most recent tagged `p1-foundation-complete`.

---

## Self-review (informational)

**Spec coverage:**
- §3 every decision row → reflected in tasks (Postgres in T2/T3, Payload in T4–T7, slug+date helpers in T9–T10, all 9 collections in T12–T20, all 8 globals in T21–T23, theme tokens in T25, image strategy in T27–T28).
- §8.1 every collection has its own task (T12–T20).
- §8.2 every global appears in T21–T23.
- §8.4 seed script in T28; idempotent ✓.
- §13 risks: Next.js 16 ↔ Payload v3 verification is T1.
- §10 cache invalidation is stubbed in T11; full wiring deferred to **P4** (out of scope for P1).
- §6 motion plan deferred to **P5** (out of scope for P1).
- §7 page designs deferred to **P2/P3** (out of scope for P1).
- §11 forms/Resend deferred to **P4** (out of scope for P1).

**Placeholder scan:** no TBD/TODO/"implement appropriate X" left.

**Type consistency:** field names (`slug`, `publishedAt`, `kickoff`, `isHome`, `function`, `tier`) are spelled the same way in seeds, schemas, and references. The `team` relationship in `People` (T14) and `Fixtures` (T18) and the `trainers` relationship in `Teams` (T15) all reference the `teams` slug.

**Out-of-P1 (handled in later phases):**
- Public site routes/pages → P2/P3
- `/api/contact` + Resend → P4
- `/api/revalidate` + real `afterChange` cache busting → P4
- Framer Motion → P5
- Vercel deploy + Neon + Vercel Blob storage adapter → P6
