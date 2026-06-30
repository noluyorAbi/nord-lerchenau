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

/**
 * Resolve a Payload media object to an image src, preferring the asset shipped
 * in public/uploads so the site renders without any external blob storage. The
 * stored `url` (e.g. a legacy blob URL) is only used as a fallback when no
 * committed file matches the (normalised) filename.
 */
export function mediaSrc(
  media?: { filename?: string | null; url?: string | null } | number | null,
): string | null {
  if (!media || typeof media !== "object") return null;
  return publicUploadSrc(media.filename) ?? (media.url || null);
}
