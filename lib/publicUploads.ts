import fs from "node:fs";
import path from "node:path";

// Maps a Payload media filename to the matching asset shipped in
// public/uploads. Payload stores names like "Ralf_Kirmeyer-1.webp" while the
// tracked static files use clean names with their real extension
// ("Ralf_Kirmeyer.jpg"). We normalise both sides (drop the upload "-N" suffix
// and the extension) and resolve to whatever file actually exists on disk, so
// the images are always served from /public regardless of extension drift.

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Reduce an upload filename to the key both sides of the media pipeline agree
 * on: extension and Payload "-N" re-upload suffix removed, lowercased. Exported
 * because scripts/migrate-media-to-blob.ts has to pick the same twin this
 * module resolves to, and a second copy of the rule would drift silently.
 */
export function normaliseUploadName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/-\d+$/, "") // strip Payload "-1" upload suffix
    .toLowerCase();
}

let cache: Map<string, string> | null = null;

function index(): Map<string, string> {
  if (cache) return cache;
  const map = new Map<string, string>();
  try {
    for (const file of fs.readdirSync(UPLOADS_DIR)) {
      map.set(normaliseUploadName(file), file);
    }
  } catch {
    // directory missing: callers fall back to initials/placeholder
  }
  cache = map;
  return map;
}

export function publicUploadSrc(filename?: string | null): string | null {
  if (!filename) return null;
  const file = index().get(normaliseUploadName(filename));
  return file ? `/uploads/${file}` : null;
}

// When true, a real uploaded asset (absolute http(s) URL from the storage
// adapter, e.g. Vercel Blob) wins over a committed /public/uploads asset with
// the same normalised name. Set NEXT_PUBLIC_PREFER_UPLOADED_MEDIA=true in the
// Vercel env ONLY AFTER every legacy media doc has been migrated to Blob and
// carries a fresh absolute URL. Until then it stays off and the committed asset
// wins, which is regression-proof against the stale /api/media/file/<name> URLs
// the 180 seeded prod docs still hold.
//
// Consequence while it is off: the club can add NEW images (no committed twin,
// so the blob URL is used), but replacing an image whose name collides with a
// committed asset has no visible effect. That is deliberate: flipping the flag
// before the migration would blank out every legacy image instead.
const PREFER_UPLOADED =
  process.env.NEXT_PUBLIC_PREFER_UPLOADED_MEDIA === "true";

function absoluteUrl(url?: string | null): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

/**
 * Resolve a Payload media object to an image src.
 *
 * Default (PREFER_UPLOADED off): prefer the committed /public/uploads asset so
 * the site renders without external storage and never regresses on a stale URL;
 * fall back to the stored URL for genuinely new uploads with no committed twin.
 *
 * After the media migration (PREFER_UPLOADED on): prefer the live uploaded URL
 * so the club can replace any image from /admin, including ones that shipped as
 * committed assets, with the committed asset kept as a last-resort fallback.
 */
export function mediaSrc(
  media?: { filename?: string | null; url?: string | null } | number | null,
): string | null {
  if (!media || typeof media !== "object") return null;
  const committed = publicUploadSrc(media.filename);
  const absolute = absoluteUrl(media.url);

  if (PREFER_UPLOADED && absolute) return absolute;
  // No `absolute` term here: when it is set it is media.url by construction, so
  // listing it would imply a precedence that does not exist.
  return committed ?? media.url ?? null;
}

/**
 * Wie `mediaSrc`, aber nur fuer Quellen, denen man ansehen kann, dass sie
 * wirklich ausgeliefert werden: ein absoluter Speicher-Link oder ein
 * mitgeliefertes Asset unter /uploads.
 *
 * Der Grund sind die Altlasten aus dem ersten Import: dort steht in `url` ein
 * `/api/media/file/...`, hinter dem keine Datei mehr liegt. Als `src` ergaebe
 * das ein kaputtes Bild statt des mitgelieferten Standardbilds. Ueberall, wo
 * ein CMS-Bild ein fest hinterlegtes ersetzen darf, entscheidet deshalb diese
 * Funktion und nicht `mediaSrc` allein.
 */
export function usableMediaSrc(
  media?: { filename?: string | null; url?: string | null } | number | null,
): string | null {
  const src = mediaSrc(media);
  if (!src) return null;
  return /^https?:\/\//i.test(src) || src.startsWith("/uploads/") ? src : null;
}
