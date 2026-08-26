import { unstable_cache } from "next/cache";

/**
 * Cached CMS access layer.
 *
 * Every frontend page used to be `force-dynamic`, so a single page view ran up
 * to 16 Postgres queries and the Neon compute never got to suspend. Pages are
 * now prerendered and regenerated on demand instead: the CMS afterChange hooks
 * (payload/hooks/revalidate.ts) POST to /api/revalidate, which fires the tags
 * defined here. Invalidating a tag drops both the cached query result and the
 * prerendered pages that read it.
 *
 * Tags are collection- and global-scoped rather than per-document. Editors save
 * a handful of times a week, so the extra regeneration is free, and coarse tags
 * cannot silently miss an invalidation the way the previous per-slug scheme did.
 */

/** Tag for every query against a Payload collection, e.g. `collection:posts`. */
export const collectionTag = (collection: string) => `collection:${collection}`;

/** Tag for a Payload global, e.g. `global:home-page`. */
export const globalTag = (slug: string) => `global:${slug}`;

/**
 * Safety net only. On-demand revalidation via /api/revalidate is the primary
 * path; this bounds staleness to a day if a CMS webhook is ever lost (bad
 * deploy, network blip, REVALIDATE_SECRET drift).
 */
const DEFAULT_REVALIDATE_SECONDS = 86_400;

/**
 * For queries whose `where` clause references the current time, e.g. the
 * upcoming fixtures and events lists.
 *
 * Tag invalidation cannot help these: nothing in the CMS changes when a kickoff
 * time simply passes, so without a time bound a finished match would keep being
 * advertised as the next one. The boundary is frozen into whichever render
 * filled the entry, and this caps how far it can drift.
 *
 * Pages that render this data need a matching `export const revalidate`, since
 * expiring the data entry alone does not re-render an already prerendered page.
 */
export const TIME_WINDOWED_REVALIDATE_SECONDS = 900;

/**
 * Which CMS resources the frontend renders.
 *
 * These are the strings passed to revalidateOnChange() in
 * payload/collections/*.ts and revalidateGlobalOnChange() in
 * payload/globals/*.ts. A resource that fires a hook but is missing here would
 * revalidate nothing and the site would serve that content stale forever, which
 * is exactly what happened to faq-page before. tests/lib/cms-tags.test.ts reads
 * the payload directory and fails if the two sides ever drift apart.
 */
export const CACHED_COLLECTIONS = new Set([
  "posts",
  "teams",
  "fixtures",
  "events",
  "sponsors",
  "people",
]);

/** Written by the CMS but never read by a prerendered page. */
export const UNCACHED_COLLECTIONS = new Set(["submissions", "users"]);

/**
 * Media has no cache tag of its own: no page queries the collection directly,
 * an upload is always reached through a relation on some other document.
 * Replacing an image therefore has to bust every cached read that can embed
 * one, otherwise the club sees no change until the 24h window on those reads
 * expires. Uploads are rare, so busting all of them beats tracking which
 * document points at which file.
 */
export const MEDIA_DEPENDENT_COLLECTIONS = [
  "posts",
  "teams",
  "sponsors",
  "people",
  "events",
] as const;

export const MEDIA_DEPENDENT_GLOBALS = [
  "site-settings",
  "home-page",
  "chronik-page",
  "vereinsheim-page",
  "jugendfoerder-page",
  "site-images",
] as const;

export const CACHED_GLOBALS = new Set([
  "site-settings",
  "navigation",
  "home-page",
  "contact-info",
  "chronik-page",
  "vereinsheim-page",
  "jugendfoerder-page",
  "legal-pages",
  "faq-page",
  "site-images",
]);

/**
 * Header and Footer render on every route, so a change to either global has to
 * bust the whole tree rather than a single page's tag.
 */
export const FULL_REVALIDATE_GLOBALS = new Set(["site-settings", "navigation"]);

/**
 * Wrap a Payload query in the Next.js Data Cache.
 *
 * `keyParts` MUST uniquely identify the query, including any value the callback
 * closes over. `unstable_cache` derives its key from `keyParts` plus the
 * function source, and the source is identical for every invocation, so a
 * closed-over `slug` that is missing from `keyParts` would make two different
 * documents share one cache entry.
 *
 * Rejections are never cached: an error propagates to the caller, which keeps
 * the existing try/catch fallbacks in the components working unchanged.
 */
export function cachedQuery<T>(
  keyParts: string[],
  tags: string[],
  query: () => Promise<T>,
  revalidate: number = DEFAULT_REVALIDATE_SECONDS,
): Promise<T> {
  return unstable_cache(query, keyParts, { tags, revalidate })();
}
