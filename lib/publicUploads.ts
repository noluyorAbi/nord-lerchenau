import fs from "node:fs";
import path from "node:path";

// Maps a Payload media filename to the matching asset shipped in
// public/uploads. Payload stores names like "Ralf_Kirmeyer-1.webp" while the
// tracked static files use clean names with their real extension
// ("Ralf_Kirmeyer.jpg"). We normalise both sides (drop the upload "-N" suffix
// and the extension) and resolve to whatever file actually exists on disk, so
// the images are always served from /public regardless of extension drift.

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function normalise(name: string): string {
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
      map.set(normalise(file), file);
    }
  } catch {
    // directory missing — callers fall back to initials/placeholder
  }
  cache = map;
  return map;
}

export function publicUploadSrc(filename?: string | null): string | null {
  if (!filename) return null;
  const file = index().get(normalise(filename));
  return file ? `/uploads/${file}` : null;
}

// When true, a real uploaded asset (absolute http(s) URL from the storage
// adapter, e.g. Vercel Blob) takes precedence over a committed /public/uploads
// asset of the same name. Flip this on (NEXT_PUBLIC_PREFER_UPLOADED_MEDIA=true in
// the Vercel env) ONLY AFTER the production DB has been reseeded against a live
// Blob store, so every media doc holds a fresh, valid URL. Until then it stays
// off and the committed asset wins, which is regression-proof regardless of
// whatever (possibly stale) URL a prod media doc currently carries.
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
 * After go-live (PREFER_UPLOADED on): prefer the live uploaded URL so the club
 * can replace any image from /admin (including ones that shipped as committed
 * assets), with the committed asset kept only as a last-resort fallback.
 */
export function mediaSrc(
  media?: { filename?: string | null; url?: string | null } | number | null,
): string | null {
  if (!media || typeof media !== "object") return null;
  const committed = publicUploadSrc(media.filename);
  const absolute = absoluteUrl(media.url);

  if (PREFER_UPLOADED && absolute) return absolute;
  return committed ?? absolute ?? media.url ?? null;
}
