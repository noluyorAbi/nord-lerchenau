/**
 * Copy the byte content of every existing media document into Vercel Blob.
 *
 * Why this exists
 * ---------------
 * Media was seeded while Payload used its local-disk adapter, so the 180 rows in
 * the production database describe files that only ever existed in the build's
 * public/uploads directory. Only 30 of those files are committed (see the
 * allowlist in .gitignore), so every other row points at bytes no deployed
 * instance can serve: /api/media/file/<name> answered 500 in production.
 *
 * With the Vercel Blob adapter registered, media URLs are generated at read time
 * from the stored `filename` (and `sizes_*_filename`) columns, NOT from a stored
 * URL. That means this migration does not have to touch a single database row:
 * once a file exists in the blob store under the name the row already carries,
 * that row resolves correctly. Nothing is rewritten, so the rollback is simply
 * deleting the uploaded blobs.
 *
 * What it uploads
 * ---------------
 * For every media row: the main file plus each generated size (thumbnail, card,
 * feature, hero). Source bytes come from the local public/uploads directory,
 * which still holds every file the seeds produced. A row whose exact filename is
 * missing locally falls back to the same normalisation lib/publicUploads uses
 * (strip the extension and the Payload "-N" suffix), which is how the handful of
 * re-seeded duplicates find their twin.
 *
 * Usage
 * -----
 *   # dry run against production (reads only, prints the plan)
 *   DATABASE_URI=<prod> BLOB_READ_WRITE_TOKEN=<token> \
 *     bun --conditions=production run scripts/migrate-media-to-blob.ts
 *
 *   # actually upload
 *   ... same env ... bun --conditions=production run scripts/migrate-media-to-blob.ts --apply
 *
 * The script is idempotent: a file already present in the store is skipped, so a
 * re-run after a partial failure only uploads what is still missing. The flip
 * side is that it never overwrites: if a file left over from the June blob phase
 * turns out to hold outdated content, delete that blob first and run again.
 */
import fs from "node:fs/promises";
import path from "node:path";

import { BlobNotFoundError, head, put } from "@vercel/blob";
import { Client } from "pg";
import sharp from "sharp";

import { normaliseUploadName as normalise } from "@/lib/publicUploads";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const APPLY = process.argv.includes("--apply");

const MIME_BY_EXT: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

type Row = {
  id: number;
  filename: string | null;
  sizes_thumbnail_filename: string | null;
  sizes_card_filename: string | null;
  sizes_feature_filename: string | null;
  sizes_hero_filename: string | null;
};

async function readRows(connectionString: string): Promise<Row[]> {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
  });
  await client.connect();
  try {
    const { rows } = await client.query<Row>(
      `select id,
              filename,
              sizes_thumbnail_filename,
              sizes_card_filename,
              sizes_feature_filename,
              sizes_hero_filename
         from media
        order by id`,
    );
    return rows;
  } finally {
    await client.end();
  }
}

/**
 * Index public/uploads twice: once by exact name (the normal case) and once by
 * normalised name, so a row naming a variant the local directory no longer has
 * verbatim still finds the same image.
 */
async function indexLocalFiles() {
  const exact = new Set<string>();
  const byNormalised = new Map<string, string>();
  for (const file of await fs.readdir(UPLOADS_DIR)) {
    exact.add(file);
    // First writer wins, so a stable pick rather than whatever readdir ordered
    // last. All candidates are copies of the same image anyway.
    const key = normalise(file);
    if (!byNormalised.has(key)) byNormalised.set(key, file);
  }
  return { exact, byNormalised };
}

type LocalIndex = Awaited<ReturnType<typeof indexLocalFiles>>;

/** A source file on disk, optionally resized to the dimensions the name asks for. */
type Source = { file: string; resize?: { width: number; height: number } };

/** Payload names generated sizes "<base>-<width>x<height>.<ext>". */
const SIZE_NAME = /^(.+)-(\d+)x(\d+)(\.[^.]+)$/;

/**
 * Find bytes for the file a media row names.
 *
 * 1. The exact file, which covers almost everything.
 * 2. Its normalised twin, for rows that name a re-seed variant the directory no
 *    longer has verbatim ("Bini_Hafner-28.webp" against "Bini_Hafner-1.webp").
 * 3. For a generated size: the twin of the size variant, and failing that the
 *    twin of the ORIGINAL, resized here to the dimensions in the name. Some
 *    sizes were never kept on disk at all (the G-Junioren photo only exists as
 *    its source jpg), so regenerating is the only way to complete the set.
 */
function resolveSource(name: string, local: LocalIndex): Source | null {
  if (local.exact.has(name)) return { file: name };

  const twin = local.byNormalised.get(normalise(name));
  if (twin) return { file: twin };

  const match = SIZE_NAME.exec(name);
  if (!match) return null;
  const [, base, width, height, ext] = match;

  const baseTwin = local.byNormalised.get(normalise(base));
  if (!baseTwin) return null;

  // The twin keeps the "-N" suffix, so ask for that variant's size file first
  // and only regenerate when it is genuinely absent.
  const twinSize = `${baseTwin.replace(/\.[^.]+$/, "")}-${width}x${height}${ext}`;
  if (local.exact.has(twinSize)) return { file: twinSize };

  return {
    file: baseTwin,
    resize: { width: Number(width), height: Number(height) },
  };
}

/**
 * Only a genuine 404 counts as "not there". An expired token, a suspended store
 * or a network blip must abort the run instead of being reported as a missing
 * file, which would otherwise turn into a confident but wrong upload plan.
 */
async function existsInBlob(name: string, token: string): Promise<boolean> {
  try {
    await head(name, { token });
    return true;
  } catch (err) {
    if (err instanceof BlobNotFoundError) return false;
    throw err;
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URI;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!connectionString) {
    console.error("[migrate-media] DATABASE_URI is not set");
    process.exit(1);
  }
  if (!token) {
    console.error(
      "[migrate-media] BLOB_READ_WRITE_TOKEN is not set. Pull it from the Vercel\n" +
        "  project (Storage tab) before running this against production.",
    );
    process.exit(1);
  }

  const [rows, local] = await Promise.all([
    readRows(connectionString),
    indexLocalFiles(),
  ]);

  // One entry per distinct file: several rows can name the same size variant.
  const wanted = new Map<string, Source>();
  const unresolved: string[] = [];

  for (const row of rows) {
    const names = [
      row.filename,
      row.sizes_thumbnail_filename,
      row.sizes_card_filename,
      row.sizes_feature_filename,
      row.sizes_hero_filename,
    ].filter((n): n is string => Boolean(n));

    for (const name of names) {
      if (wanted.has(name)) continue;
      const source = resolveSource(name, local);
      if (source) wanted.set(name, source);
      else unresolved.push(name);
    }
  }

  console.log(`[migrate-media] media rows        : ${rows.length}`);
  console.log(`[migrate-media] distinct files    : ${wanted.size}`);
  console.log(`[migrate-media] no local source   : ${unresolved.length}`);
  if (unresolved.length) {
    console.log(`[migrate-media]   ${unresolved.slice(0, 20).join(", ")}`);
  }

  let uploaded = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const [name, source] of wanted) {
    if (await existsInBlob(name, token)) {
      skipped++;
      continue;
    }
    if (!APPLY) {
      uploaded++;
      continue;
    }
    try {
      const raw = await fs.readFile(path.join(UPLOADS_DIR, source.file));
      const data = source.resize
        ? await sharp(raw)
            .resize(source.resize.width, source.resize.height, { fit: "cover" })
            .toBuffer()
        : raw;
      await put(name, data, {
        access: "public",
        addRandomSuffix: false,
        // Every name here was just confirmed absent, so an overwrite would mean
        // the store changed under us. Fail that file loudly instead.
        allowOverwrite: false,
        contentType:
          MIME_BY_EXT[path.extname(name).toLowerCase()] ??
          "application/octet-stream",
        token,
      });
      uploaded++;
      if (uploaded % 25 === 0) {
        console.log(`[migrate-media] uploaded ${uploaded}/${wanted.size}`);
      }
    } catch (err) {
      failed.push(`${name}: ${(err as Error).message}`);
    }
  }

  console.log(
    APPLY
      ? `[migrate-media] done. uploaded=${uploaded} already-present=${skipped} failed=${failed.length}`
      : `[migrate-media] DRY RUN. would upload=${uploaded} already-present=${skipped}\n` +
          "  Re-run with --apply to perform the upload.",
  );
  for (const f of failed) console.error(`[migrate-media] FAILED ${f}`);
  if (failed.length) process.exit(1);
}

void main().then(
  () => process.exit(0),
  (err) => {
    console.error("[migrate-media] failed:", err);
    process.exit(1);
  },
);
