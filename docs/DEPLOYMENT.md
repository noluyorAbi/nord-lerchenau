# SV Nord Website — Deployment Guide

This site is one Next.js 16 app with Payload CMS mounted at `/admin`. Deploy target: **Vercel**. Required external services:

| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Hosts the Next.js app | Free tier is enough |
| **Neon** | Production Postgres | Free tier is enough |
| **Vercel Blob** | Uploaded media (photos, sponsor logos, etc.) | ~Free for this traffic |
| **Resend** | Contact-form email to `info@svnord.de` | Free tier (3k emails/mo) |

---

## 1. Provision Postgres on Neon

1. Create an account at <https://neon.tech> → sign in with GitHub.
2. Create a project called `svnord-prod` in the nearest region (e.g. Frankfurt).
3. In the dashboard, copy the **pooled connection string** (looks like `postgres://user:pw@ep-xxx-pooler.eu-central-1.aws.neon.tech/svnord?sslmode=require`).
4. Save it — you'll paste it into Vercel as `DATABASE_URI`.

## 2. Get a Resend API key

1. Sign up at <https://resend.com>.
2. **API Keys** → "Create API Key" with "Full access" → copy the `re_...` secret.
3. **Domains** → "Add Domain" → `svnord.de` → follow the DNS instructions (3 TXT/CNAME records).
4. Once the domain is verified, a valid `from` address is e.g. `info@svnord.de` or `kontakt@svnord.de`.

Until DNS is verified, you can use Resend's `onboarding@resend.dev` sandbox `from` address with `to: info@svnord.de` for testing.

## 3. Create the Vercel project

1. Push this repo to GitHub (any account).
2. <https://vercel.com/new> → "Import Git Repository" → select this repo.
3. **Framework preset**: Next.js (auto-detected).
4. **Root directory**: leave empty.
5. **Build command**: `bun run build` (Vercel auto-detects Bun from `bun.lock`).
6. Expand **Environment Variables** and add (marking each as needed for Production + Preview):

   ```
   DATABASE_URI              = <Neon pooled connection string from step 1>
   PAYLOAD_SECRET            = <run: openssl rand -hex 32>
   NEXT_PUBLIC_SERVER_URL    = https://svnord-lerchenau.de
   REVALIDATE_SECRET         = <run: openssl rand -hex 32>
   RESEND_API_KEY            = re_... (from step 2)
   RESEND_FROM_EMAIL         = info@svnord.de
   RESEND_TO_EMAIL           = info@svnord.de
   ```

7. Deploy. First build takes 3–5 min (Payload generates its admin bundle).

## 4. Connect Vercel Blob

1. In the Vercel project → **Storage** → "Create" → "Blob" → name it `svnord-media`.
2. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` into your env vars.
3. Redeploy so the token is picked up.

From this point, any image uploaded through `/admin` → Media is stored in Vercel Blob, not the container filesystem.

## 5. Run the production seed (one-time)

After the first successful deploy:

1. Clone the repo locally, copy `.env.local` → `.env.local.production` (keep dev untouched).
2. Put the **production** `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL` (production domain), and `BLOB_READ_WRITE_TOKEN` in `.env.local.production`.
3. Run:
   ```bash
   cp .env.local .env.local.bak
   cp .env.local.production .env.local
   bun run seed
   cp .env.local.bak .env.local
   ```
4. Open `<production-url>/admin`, log in with `admin@svnord.de` / `ChangeMeNach-P1`, **change the password immediately** in the user menu.

## 6. Point the domain

1. In Vercel project → **Domains** → add `svnord-lerchenau.de`.
2. Vercel shows two DNS records (A + CNAME or ALIAS + CNAME). Add them at your DNS registrar.
3. Wait 5–60 min for propagation.
4. Vercel auto-issues the SSL cert.

## 7. Admin handoff to the Vorstand

Share this info with whoever will edit content:

- **URL**: `https://svnord-lerchenau.de/admin`
- **Login**: the email you used in step 5 (or any admin you create)
- **Daily use**:
  - **Posts**: Content → Posts → "Create New". Title + body + tag + optional hero image.
  - **Events**: Content → Events. Date pickers for start/end, optional image.
  - **Fixtures**: Sport → Fixtures. Pick team, enter opponent + kickoff.
  - **Sponsors**: Verein → Sponsors. Upload logo, pick tier (Premium / Standard).
  - **Page copy** (homepage headlines, footer, legal text, contact info): Settings group in the sidebar — each is a "Global" (single document per page).
- **Live preview** on Posts: opens the rendered `/news/[slug]` in an iframe with device breakpoints; updates when you click Save.

When you save anything, the public site refreshes within ~1 second (via `afterChange` hook → `/api/revalidate` → `revalidateTag`).

---

## Appendix: useful one-off commands

```bash
# Connect to prod Postgres from your laptop (requires the Neon connection string)
psql $DATABASE_URI

# Tail the production build log
vercel logs <deployment-url> --follow

# Rotate the admin password for a user
bun run payload:generate-types   # ensures types are fresh
# then reset via /admin → Users → pick user → "Change Password"
```

## Troubleshooting

- **"database does not exist"** on first deploy → check the Neon connection string includes the database name (`/svnord` at the end).
- **Images 404 after first uploads** → confirm `BLOB_READ_WRITE_TOKEN` is set and the project was redeployed after Vercel Blob was connected.
- **Contact form returns 200 but no email arrives** → check Resend dashboard → Logs. Domain likely still pending DNS verification.
- **Next.js 16 build fails with `cacheComponents` error** → we explicitly do NOT enable Cache Components; the default caching model is fine.
