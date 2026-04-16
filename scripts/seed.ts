import fs from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "@/payload.config";
import { slug } from "@/lib/slug";

const MANIFEST_PATH = path.resolve(process.cwd(), "tmp/wix-images/manifest.json");
const IMG_DIR = path.resolve(process.cwd(), "tmp/wix-images");

type Manifest = Record<string, { filename: string; alt: string }>;

async function ensureAdminUser(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: "admin@svnord.de" } },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    console.log("✓ Admin user already exists");
    return;
  }
  await payload.create({
    collection: "users",
    data: {
      email: "admin@svnord.de",
      password: "ChangeMeNach-P1",
      name: "SV Nord Admin",
    } as never,
  });
  console.log("✓ Created admin user: admin@svnord.de / ChangeMeNach-P1 (CHANGE THIS PASSWORD)");
}

async function ensurePerson(payload: Awaited<ReturnType<typeof getPayload>>, p: {
  name: string; role: string; function: string; phone?: string; email?: string; order: number;
}) {
  const existing = await payload.find({
    collection: "people",
    where: { name: { equals: p.name } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0]!.id;

  const created = await payload.create({
    collection: "people",
    data: p as never,
  });
  return created.id;
}

async function ensureTeam(payload: Awaited<ReturnType<typeof getPayload>>, t: {
  name: string; sport: string; category: string; ageGroup?: string; order: number;
}) {
  const teamSlug = slug(t.name);
  const existing = await payload.find({
    collection: "teams",
    where: { slug: { equals: teamSlug } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0]!.id;

  const created = await payload.create({
    collection: "teams",
    data: { ...t, slug: teamSlug, season: "2025/26" } as never,
  });
  return created.id;
}

async function main() {
  const payload = await getPayload({ config });

  await ensureAdminUser(payload);

  // 1. Vorstand (from spec §2)
  const vorstand = [
    { name: "Ralf Kirmeyer", role: "1. Vorstand", function: "vorstand", phone: "0172 9808109", email: "ralf.kirmeyer@svnord.de", order: 1 },
    { name: "Birgit Höfer", role: "2. Vorstand", function: "vorstand", phone: "0173 9547204", email: "birgit.hoefer@svnord.de", order: 2 },
    { name: "Britta Feierabend", role: "Kassier", function: "vorstand", phone: "0176 96655106", email: "britta.feierabend@svnord.de", order: 3 },
    { name: "Fabian Falk", role: "Schriftführer", function: "vorstand", phone: "0170 5859347", email: "fabian.falk@svnord.de", order: 4 },
    { name: "Felix Kirmeyer", role: "Sportlicher Leiter", function: "sportleitung", phone: "0176 63691739", email: "felix.kirmeyer@svnord.de", order: 5 },
    { name: "Tobias Treffer", role: "Jugendleitung Großfeld", function: "jugendleitung", phone: "0176 55126535", email: "tobias.treffer@svnord.de", order: 6 },
    { name: "Ergin Piker", role: "Jugendleitung Kleinfeld", function: "jugendleitung", phone: "0160 5892697", email: "ergin.piker@svnord.de", order: 7 },
  ];

  for (const p of vorstand) {
    await ensurePerson(payload, p);
  }

  // 2. Teams (from spec §5). 22 football teams + 5 other-sport rows
  const teams = [
    { name: "Erste", sport: "fussball", category: "senioren", order: 1 },
    { name: "Zwoate", sport: "fussball", category: "senioren", order: 2 },
    { name: "Dritte", sport: "fussball", category: "senioren", order: 3 },
    { name: "Senioren A", sport: "fussball", category: "senioren", order: 4 },
    { name: "Senioren B", sport: "fussball", category: "senioren", order: 5 },
    { name: "A1 Junioren", sport: "fussball", category: "junioren", ageGroup: "A1", order: 10 },
    { name: "A2 Junioren", sport: "fussball", category: "junioren", ageGroup: "A2", order: 11 },
    { name: "B1 Junioren", sport: "fussball", category: "junioren", ageGroup: "B1", order: 12 },
    { name: "B2 Junioren", sport: "fussball", category: "junioren", ageGroup: "B2", order: 13 },
    { name: "C1 Junioren", sport: "fussball", category: "junioren", ageGroup: "C1", order: 14 },
    { name: "D1 Junioren", sport: "fussball", category: "junioren", ageGroup: "D1", order: 15 },
    { name: "D2 Junioren", sport: "fussball", category: "junioren", ageGroup: "D2", order: 16 },
    { name: "E1 Junioren", sport: "fussball", category: "junioren", ageGroup: "E1", order: 17 },
    { name: "E2 Junioren", sport: "fussball", category: "junioren", ageGroup: "E2", order: 18 },
    { name: "F1 Junioren", sport: "fussball", category: "junioren", ageGroup: "F1", order: 19 },
    { name: "F2 Junioren", sport: "fussball", category: "junioren", ageGroup: "F2", order: 20 },
    { name: "F3 Junioren", sport: "fussball", category: "junioren", ageGroup: "F3", order: 21 },
    { name: "G Junioren", sport: "fussball", category: "junioren", ageGroup: "G", order: 22 },
    { name: "Bambini", sport: "fussball", category: "bambini", ageGroup: "Bambini", order: 23 },
    { name: "B-Juniorinnen", sport: "fussball", category: "juniorinnen", ageGroup: "B", order: 30 },
    { name: "C-Juniorinnen", sport: "fussball", category: "juniorinnen", ageGroup: "C", order: 31 },
    { name: "D-Juniorinnen", sport: "fussball", category: "juniorinnen", ageGroup: "D", order: 32 },
    { name: "Volleyball", sport: "volleyball", category: "allgemein", order: 100 },
    { name: "Gymnastik", sport: "gymnastik", category: "allgemein", order: 101 },
    { name: "Ski", sport: "ski", category: "allgemein", order: 102 },
    { name: "Esport", sport: "esport", category: "allgemein", order: 103 },
    { name: "Schiedsrichter", sport: "schiedsrichter", category: "allgemein", order: 104 },
  ];

  for (const t of teams) {
    await ensureTeam(payload, t);
  }

  // 3. Optional manifest for image references
  let manifest: Manifest = {};
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf-8")) as Manifest;
  } catch {
    console.warn("No image manifest found. Run `bun run download-images` first to import photos.");
  }

  void IMG_DIR;
  void manifest;

  // 4. Two news posts
  const author = await payload.find({
    collection: "people",
    where: { name: { equals: "Felix Kirmeyer" } },
    limit: 1,
  });
  const authorId = author.docs[0]?.id;

  const posts = [
    {
      title: "Die Ergebnisse vom Wochenende",
      slug: "die-ergebnisse-vom-wochenende",
      excerpt: "1:2-Auswärtssieg in Dachau. Platz 3 in der Bezirksliga.",
      publishedAt: new Date("2026-03-04T09:00:00+01:00").toISOString(),
      tags: ["spielbericht"],
      bodyText: "Nach langer Vorbereitung sind wir endlich in die Punktspiele 2026 gestartet. Bezirksliga – 19. Spieltag (Rückrunde). Auswärts beim ASV Dachau: 2. vs. 4. – ein echter Kracher! Früher Rückstand, starke Reaktion und ein verdienter 1:2-Auswärtssieg. Platz 3 in der Tabelle (punktgleich mit Platz 2). 3. Mannschaft: Matschschlacht gegen den FV Hansa Neuhausen – trotz Top-Chancen bleibt's beim 0:0.",
    },
    {
      title: "40 Jahre Eschengarten",
      slug: "40-jahre-eschengarten",
      excerpt: "Vier Jahrzehnte Vereinsheim — eine Chronik in Bildern.",
      publishedAt: new Date("2026-02-06T18:00:00+01:00").toISOString(),
      tags: ["verein"],
      bodyText: "Am 5. Mai 1983 entschlossen sich die Vereinsvorstände des SV Nord München-Lerchenau, des HuVTV Edelweiß-Stamm München und des FC Eintracht München, das von der Stadt München angebotene Fördermodell „Vereinsförderung von selbst errichteten Vereinsheimen\" in Anspruch zu nehmen. Ein Jahr später, am 2. Juli 1984, wurde der Eschengarten in Eigenregie gebaut.",
    },
  ];

  for (const p of posts) {
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) continue;

    await payload.create({
      collection: "posts",
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
        tags: p.tags,
        ...(authorId ? { author: authorId } : {}),
        body: {
          root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            direction: "ltr",
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                direction: "ltr",
                children: [{ type: "text", text: p.bodyText, format: 0, version: 1 }],
              },
            ],
          },
        },
      } as never,
    });
  }

  // 5. Globals
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      name: "SV Nord München-Lerchenau e.V.",
      tagline: "Einmal Nordler, immer Nordler.",
      description: "Traditionsverein im Münchner Norden seit 1947.",
      social: [{ platform: "instagram", url: "https://www.instagram.com/svnord_ski/" }],
    } as never,
  });

  await payload.updateGlobal({
    slug: "navigation",
    data: {
      header: [
        { label: "Verein", href: "/verein" },
        { label: "Fußball", href: "/fussball" },
        { label: "Sport", href: "/volleyball" },
        { label: "News", href: "/news" },
        { label: "Termine", href: "/termine" },
        { label: "Sponsoren", href: "/sponsoren" },
        { label: "Kontakt", href: "/kontakt" },
      ],
      footerColumns: [
        {
          title: "Verein",
          links: [
            { label: "Über uns", href: "/verein" },
            { label: "Vorstand", href: "/verein/vorstand" },
            { label: "Chronik", href: "/verein/chronik" },
            { label: "Vereinsheim", href: "/verein/vereinsheim" },
          ],
        },
        {
          title: "Sport",
          links: [
            { label: "Fußball", href: "/fussball" },
            { label: "Volleyball", href: "/volleyball" },
            { label: "Gymnastik", href: "/gymnastik" },
            { label: "Ski", href: "/ski" },
          ],
        },
        {
          title: "Mitmachen",
          links: [
            { label: "Mitglied werden", href: "/mitgliedschaft" },
            { label: "Sponsoring", href: "/sponsoren" },
          ],
        },
        {
          title: "Folgen",
          links: [{ label: "Instagram", href: "https://www.instagram.com/svnord_ski/" }],
        },
      ],
    } as never,
  });

  await payload.updateGlobal({
    slug: "contact-info",
    data: {
      addresses: [
        { label: "Vereinsheim Eschengarten", street: "Eschenstraße", postalCode: "80995", city: "München" },
      ],
      phone: "0172 2392919",
      email: "info@svnord.de",
    } as never,
  });

  console.log("\n✓ Seed complete.");
  process.exit(0);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
