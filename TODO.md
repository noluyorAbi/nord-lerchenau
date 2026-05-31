# TODO

## NEXT_PUBLIC_SERVER_URL — update when the real domain goes live

**Current (2026-06-01):** Vercel env `NEXT_PUBLIC_SERVER_URL` (Production) is set to
`https://nord-lerchenau.vercel.app` — the temporary Vercel URL.

**Why:** `svnord-lerchenau.de` still points at the OLD WIX site. Using it as the
server URL broke every CMS media URL (`/api/media/file/...`), SEO canonical/OG
tags, sitemap, robots, and Payload preview/revalidate links.

**When the custom domain is migrated to this Vercel project** (e.g. `svnord-lerchenau.de`
or a new domain), do all of:

1. `vercel env rm NEXT_PUBLIC_SERVER_URL production --yes`
   `printf 'https://<new-domain>' | vercel env add NEXT_PUBLIC_SERVER_URL production`
   (repeat for `preview` if desired)
2. Redeploy prod (it's a `NEXT_PUBLIC_` var → baked at build time).
3. Update the hardcoded WIX fallbacks still in code:
   - `app/(frontend)/layout.tsx:54`
   - `components/seo/SiteSchema.tsx:4`
   (change default `"https://svnord-lerchenau.de"` → new domain)

**Note:** sport hero images (Gymnastik/Volleyball/Ski) are served from static
`/public/sport/*-hero.jpg`, independent of this var. CMS-uploaded media (portraits,
sponsors, future Mannschaftsfotos) depends on it being correct + the Vercel Blob
store (`nord-lerchenau-blob`) being linked.
