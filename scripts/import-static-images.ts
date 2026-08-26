/**
 * Fest im Code stehende Bilder in die Medien-Sammlung laden und verknüpfen.
 *
 * Danach kann der Verein jedes dieser Bilder im Admin austauschen, ohne dass
 * jemand Code anfasst: Startseite → Bilder (Kopfbereich und Galerie), Weitere
 * Bilder (U8, Sommerfest) und die Titelbilder der vier importierten Beiträge.
 *
 * Zwei Regeln, die das Skript wiederholbar machen:
 *
 *  1. Es lädt eine Datei nur hoch, wenn es sie in der Medien-Sammlung nicht
 *     schon gibt. Verglichen wird über `normaliseUploadName`, also ohne
 *     Endung und ohne die Zählnummer, die Payload beim erneuten Hochladen
 *     anhängt. Genau diese Zählnummern haben die 153 verwaisten Kopien
 *     erzeugt, über die der Verein sich beschwert hat.
 *  2. Es füllt ein Feld nur, wenn es leer ist. Was der Verein selbst gesetzt
 *     hat, überschreibt ein zweiter Lauf niemals.
 *
 * Aufruf lokal:
 *
 *   bun run import-static-images -- --dry-run
 *   bun run import-static-images
 *
 * Gegen die Produktion siehe docs/BILDER-EDITIERBAR.md; dort steht die
 * Reihenfolge aus Schema, Import und Deploy.
 */
import fs from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import { FALLBACK_GALLERY, FALLBACK_HERO_SLIDES } from "../lib/home-images";
import { normaliseUploadName } from "../lib/publicUploads";
import config from "../payload.config";

const DRY_RUN = process.argv.includes("--dry-run");
const PUBLIC_DIR = path.resolve(process.cwd(), "public");

type Payload = Awaited<ReturnType<typeof getPayload>>;

/** Alt-Texte für die Bilder, die keine Bildunterschrift mitbringen. */
const ALT_BY_FILE: Record<string, string> = {
  "/sport/u8/trainerteam.jpg": "Trainerteam der U8 des SV Nord",
  "/sport/u8/loewen.jpg": "Mannschaftsfoto der U8 Löwen",
  "/sport/u8/tiger.jpg": "Mannschaftsfoto der U8 Tiger",
  "/news/sommerfest-2026.png":
    "Plakat zum Sommerfest des SV Nord am 25. Juli 2026",
  "/news/historischer-aufstieg-in-die-landesliga.jpg":
    "Jubel nach dem Aufstieg in die Landesliga",
  "/news/karger-kommt.jpg": "Neuzugang Nico Karger im Trikot des SV Nord",
  "/news/vorbereitungsplan-landesliga-2026.jpg":
    "Vorbereitungsplan für die Landesliga-Saison 2026",
  "/news/neue-nordler-2026.jpg": "Die Neuzugänge des SV Nord 2026",
};

/** Beiträge, deren Titelbild bisher nur im Code stand. */
const POST_HERO_BY_SLUG: Record<string, string> = {
  "historischer-aufstieg-in-die-landesliga":
    "/news/historischer-aufstieg-in-die-landesliga.jpg",
  "karger-kommt": "/news/karger-kommt.jpg",
  "vorbereitung-landesliga-2026": "/news/vorbereitungsplan-landesliga-2026.jpg",
  "neue-nordler-neuzugaenge-2026": "/news/neue-nordler-2026.jpg",
};

const U8_FILES = {
  trainerteam: "/sport/u8/trainerteam.jpg",
  loewen: "/sport/u8/loewen.jpg",
  tiger: "/sport/u8/tiger.jpg",
} as const;

const SOMMERFEST_FILE = "/news/sommerfest-2026.png";

function altFor(file: string): string {
  const fromGallery = FALLBACK_GALLERY.find((shot) => shot.src === file);
  if (fromGallery) return fromGallery.caption;
  const explicit = ALT_BY_FILE[file];
  if (explicit) return explicit;
  throw new Error(
    `Kein Alt-Text für ${file}. Alt-Text ist Pflicht, also hier eintragen statt raten.`,
  );
}

/** Bereits vorhandene Medien, nach normalisiertem Dateinamen. */
async function existingMedia(payload: Payload): Promise<Map<string, number>> {
  const byName = new Map<string, number>();
  for (let page = 1; ; page += 1) {
    const res = await payload.find({
      collection: "media",
      limit: 200,
      page,
      depth: 0,
    });
    for (const doc of res.docs) {
      if (!doc.filename) continue;
      const key = normaliseUploadName(doc.filename);
      // Die erste Fundstelle gewinnt nicht: bei mehreren Generationen desselben
      // Bildes ist die höchste ID die zuletzt hochgeladene.
      const previous = byName.get(key);
      if (previous === undefined || doc.id > previous) byName.set(key, doc.id);
    }
    if (!res.hasNextPage) return byName;
  }
}

type Stats = { reused: number; uploaded: number; linked: number };

async function mediaIdFor(
  payload: Payload,
  known: Map<string, number>,
  file: string,
  stats: Stats,
): Promise<number | null> {
  const key = normaliseUploadName(path.basename(file));
  const existing = known.get(key);
  if (existing !== undefined) {
    stats.reused += 1;
    return existing;
  }

  const filePath = path.join(PUBLIC_DIR, file.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    console.warn(`  fehlt auf der Platte, übersprungen: ${file}`);
    return null;
  }

  if (DRY_RUN) {
    console.log(`  würde hochladen: ${file}`);
    stats.uploaded += 1;
    return null;
  }

  const doc = await payload.create({
    collection: "media",
    filePath,
    data: { alt: altFor(file) },
  });
  known.set(key, doc.id);
  stats.uploaded += 1;
  console.log(`  hochgeladen: ${file} → #${doc.id}`);
  return doc.id;
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const known = await existingMedia(payload);
  const stats: Stats = { reused: 0, uploaded: 0, linked: 0 };
  console.log(
    `${known.size} Bilder bereits in der Sammlung${DRY_RUN ? " · Probelauf, es wird nichts geschrieben" : ""}\n`,
  );

  // 1. Startseite: Kopfbereich und Galerie
  console.log("Startseite");
  const home = await payload.findGlobal({ slug: "home-page", depth: 0 });
  const heroPflegt = (home.bilder?.heroImages ?? []).length > 0;
  const galeriePflegt = (home.bilder?.galerie ?? []).length > 0;

  const heroImages: Array<{ image: number }> = [];
  for (const file of FALLBACK_HERO_SLIDES) {
    const id = await mediaIdFor(payload, known, file, stats);
    if (id !== null) heroImages.push({ image: id });
  }

  const galerie: Array<{
    image: number;
    caption: string;
    sub?: string;
    breit?: boolean;
    hoch?: boolean;
  }> = [];
  for (const shot of FALLBACK_GALLERY) {
    const id = await mediaIdFor(payload, known, shot.src, stats);
    if (id === null) continue;
    galerie.push({
      image: id,
      caption: shot.caption,
      sub: shot.sub,
      breit: shot.span === "wide",
      hoch: shot.span === "tall",
    });
  }

  if (!DRY_RUN && (!heroPflegt || !galeriePflegt)) {
    await payload.updateGlobal({
      slug: "home-page",
      data: {
        bilder: {
          heroImages: heroPflegt ? home.bilder?.heroImages : heroImages,
          galerie: galeriePflegt ? home.bilder?.galerie : galerie,
        },
      },
    });
    stats.linked += heroPflegt ? 0 : heroImages.length;
    stats.linked += galeriePflegt ? 0 : galerie.length;
  }
  if (heroPflegt) console.log("  Kopfbereich ist gepflegt, unverändert");
  if (galeriePflegt) console.log("  Galerie ist gepflegt, unverändert");

  // 2. Weitere Bilder: U8 und Sommerfest
  console.log("\nWeitere Bilder");
  const siteImages = await payload.findGlobal({
    slug: "site-images",
    depth: 0,
  });
  const u8: Record<string, number> = {};
  for (const [feld, file] of Object.entries(U8_FILES)) {
    if (siteImages.u8?.[feld as keyof typeof U8_FILES]) continue;
    const id = await mediaIdFor(payload, known, file, stats);
    if (id !== null) u8[feld] = id;
  }
  const sommerfestId = siteImages.sommerfestPlakat
    ? null
    : await mediaIdFor(payload, known, SOMMERFEST_FILE, stats);

  if (!DRY_RUN && (Object.keys(u8).length > 0 || sommerfestId !== null)) {
    await payload.updateGlobal({
      slug: "site-images",
      data: {
        u8: { ...(siteImages.u8 ?? {}), ...u8 },
        ...(sommerfestId !== null ? { sommerfestPlakat: sommerfestId } : {}),
      },
    });
    stats.linked += Object.keys(u8).length + (sommerfestId !== null ? 1 : 0);
  }

  // 3. Titelbilder der importierten Beiträge
  console.log("\nBeiträge");
  for (const [slug, file] of Object.entries(POST_HERO_BY_SLUG)) {
    const found = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const post = found.docs[0];
    if (!post) {
      console.warn(`  kein Beitrag mit slug ${slug}`);
      continue;
    }
    if (post.heroImage) {
      console.log(`  ${slug}: Titelbild gepflegt, unverändert`);
      continue;
    }
    const id = await mediaIdFor(payload, known, file, stats);
    if (id === null || DRY_RUN) continue;
    await payload.update({
      collection: "posts",
      id: post.id,
      data: { heroImage: id },
    });
    stats.linked += 1;
    console.log(`  ${slug}: Titelbild gesetzt`);
  }

  console.log(
    `\nFertig. ${stats.uploaded} hochgeladen, ${stats.reused} wiederverwendet, ${stats.linked} verknüpft.`,
  );
  process.exit(0);
}

await main();
