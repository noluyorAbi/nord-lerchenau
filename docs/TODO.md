# Deployment TODO

Tracks the steps to get this repo from "works on my machine" to live at
**svnord-lerchenau.de**. Keep entries here short; link out to the full guide
in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Infrastructure

### ✅ Postgres — [Neon](https://neon.com)

- **Project**: `svnord-prod`
- **Region**: `aws-eu-central-1` (Frankfurt)
- **Host** (direct): `ep-royal-hill-alee5jwi.c-3.eu-central-1.aws.neon.tech`
- **Pooler host** (use this for Vercel): `ep-royal-hill-alee5jwi-pooler.c-3.eu-central-1.aws.neon.tech`
- **Database**: `neondb`
- **Role**: `neondb_owner`
- **Password**: stored locally in `.env.local.production` (gitignored) — mirror into Vercel env vars when the time comes
- **Console**: https://console.neon.tech
- **CLI**: `npx neonctl@latest init` if working with the DB from a new machine

> Always use the **pooler host** in production — serverless functions make many short-lived connections and the pooler holds a warm pool of DB sessions.

### ⏳ Email — [Resend](https://resend.com)

- [ ] Sign up at resend.com
- [ ] Verify the `svnord.de` domain (3 DNS records — TXT, MX, CNAME)
- [ ] Create API key → paste into Vercel as `RESEND_API_KEY`
- [ ] Set `RESEND_FROM_EMAIL=info@svnord.de` once domain is verified
- Until verified, the contact form still works — submissions land in Payload `Submissions`, just no email copy

### ⏳ Hosting — [Vercel](https://vercel.com)

- [ ] Import `noluyorAbi/nord-lerchenau` at vercel.com/new
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Add environment variables (see `.env.local.production` on your machine for the values)
- [ ] Deploy — first build takes 3–5 min (Payload builds its admin bundle)
- [ ] **Storage → Create → Blob** — name it `svnord-media`; Vercel auto-injects `BLOB_READ_WRITE_TOKEN` on redeploy
- [ ] Run the one-time prod seed from your laptop (see `DEPLOYMENT.md §5`)

### ⏳ DNS — `svnord-lerchenau.de`

- [ ] In Vercel project → **Domains** → add `svnord-lerchenau.de`
- [ ] Add the two DNS records Vercel shows at your registrar
- [ ] Wait 5–60 min for propagation; SSL issues automatically
- [ ] Update `NEXT_PUBLIC_SERVER_URL` env var to the production domain, redeploy

## Admin handover

- [ ] Create a real admin user for each Vorstand member who will edit content
- [ ] Change the seeded `admin@svnord.de / ChangeMeNach-P1` password immediately
- [ ] Record Payload admin URL (`https://svnord-lerchenau.de/admin`) and share with the Vorstand

## Post-launch backlog

Things we'd want to do once the basics are live:

- [ ] Real sponsor logos uploaded to Media + wired into `Sponsors`
- [ ] Write the real `Impressum` + `Datenschutz` text in `LegalPages` global (placeholder lives there now)
- [ ] Populate `ChronikPage`, `VereinsheimPage`, `JugendfoerderPage` globals with Lexical bodies (the 1947→today story)
- [ ] Enter current season's Fixtures + running `result` groups for past matches
- [ ] Dark / night theme toggle (design handoff has a Tweaks panel — not implemented)
- [ ] Redesign polish pass on `/fussball`, `/verein/*`, `/sport/*` content pages (homepage is done)
- [ ] Drop `static.wixstatic.com` from `next.config.ts` `remotePatterns` once all hero images are re-uploaded locally
- [ ] `bun run download-images` sometimes pulls huge originals — swap to Payload-uploaded Media references across `components/home/*` and inner pages
- [ ] Playwright smoke suite (hinted at in the spec) — home loads, `/admin` login redirects, contact-form happy path
- [ ] Real BFV spielplan scraper → auto-populate Fixtures instead of manual entry

## Not doing (out of scope for v1)

- Member portal / public accounts
- Post comments
- Newsletter signup
- E-commerce / Trikots / Vereinsshop
- Multilingual (English / Türkçe)
- PWA / app install prompt
- Player roster management UI (schema supports it; populate later)
