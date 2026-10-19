/**
 * Canonical public origin, used for metadata, JSON-LD, robots and the sitemap.
 *
 * Falls back to production rather than localhost: a missing variable on a
 * deployment should still emit correct canonical URLs. Server-to-server calls
 * (payload/hooks/revalidate.ts, payload.config serverURL) keep their localhost
 * fallback on purpose, because in local dev they must reach the dev server.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "https://www.svnord.de";
