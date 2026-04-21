import fs from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "@/payload.config";
import { slug } from "@/lib/slug";

type LexNode = Record<string, unknown>;

/**
 * Build a Lexical root doc from a tiny markdown-ish syntax.
 * Supports: ## → h2, ### → h3, #### → h4, blank-line paragraphs. Plain text only.
 */
function md(input: string): { root: LexNode } {
  const paragraph = (text: string): LexNode => ({
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [{ type: "text", text, format: 0, version: 1, detail: 0, mode: "normal", style: "" }],
  });
  const heading = (tag: "h2" | "h3" | "h4", text: string): LexNode => ({
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [{ type: "text", text, format: 0, version: 1, detail: 0, mode: "normal", style: "" }],
  });
  const blocks = input
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const children: LexNode[] = blocks.map((b) => {
    if (b.startsWith("#### ")) return heading("h4", b.slice(5).trim());
    if (b.startsWith("### ")) return heading("h3", b.slice(4).trim());
    if (b.startsWith("## ")) return heading("h2", b.slice(3).trim());
    return paragraph(b.replace(/\n/g, " "));
  });
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children,
    },
  };
}

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

async function ensureSponsor(
  payload: Awaited<ReturnType<typeof getPayload>>,
  opts: {
    name: string;
    filename: string;
    filePath: string;
    url?: string;
    tier?: "premium" | "standard";
    order: number;
  },
) {
  const { name, filename, filePath, url, tier = "standard", order } = opts;
  // 1. Upload / find media
  const existingMedia = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
  });
  let mediaId: string | number;
  if (existingMedia.docs.length > 0) {
    mediaId = existingMedia.docs[0]!.id;
  } else {
    const buf = await fs.readFile(filePath);
    const mimetype = filename.endsWith(".avif")
      ? "image/avif"
      : filename.endsWith(".png")
        ? "image/png"
        : filename.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg";
    const created = await payload.create({
      collection: "media",
      data: { alt: `Logo ${name}` } as never,
      file: { data: buf, mimetype, name: filename, size: buf.byteLength },
    });
    mediaId = created.id;
  }

  // 2. Create / update sponsor doc by name
  const existingSponsor = await payload.find({
    collection: "sponsors",
    where: { name: { equals: name } },
    limit: 1,
  });
  if (existingSponsor.docs.length > 0) {
    await payload.update({
      collection: "sponsors",
      id: existingSponsor.docs[0]!.id,
      data: { logo: mediaId, tier, order, ...(url ? { url } : {}) } as never,
    });
  } else {
    await payload.create({
      collection: "sponsors",
      data: { name, logo: mediaId, tier, order, ...(url ? { url } : {}) } as never,
    });
  }
}

async function ensurePortrait(
  payload: Awaited<ReturnType<typeof getPayload>>,
  opts: { personName: string; filename: string; alt: string; filePath: string },
) {
  const { personName, filename, alt, filePath } = opts;
  const person = await payload.find({
    collection: "people",
    where: { name: { equals: personName } },
    limit: 1,
  });
  if (person.docs.length === 0) return;

  // Check if media already exists for this filename
  const existingMedia = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
  });

  let mediaId: string | number;
  if (existingMedia.docs.length > 0) {
    mediaId = existingMedia.docs[0]!.id;
  } else {
    const buf = await fs.readFile(filePath);
    const mimetype = filename.toLowerCase().endsWith(".png")
      ? "image/png"
      : "image/jpeg";
    const created = await payload.create({
      collection: "media",
      data: { alt } as never,
      file: {
        data: buf,
        mimetype,
        name: filename,
        size: buf.byteLength,
      },
    });
    mediaId = created.id;
  }

  await payload.update({
    collection: "people",
    id: person.docs[0]!.id,
    data: { photo: mediaId } as never,
  });
}

async function populateSportSection(
  payload: Awaited<ReturnType<typeof getPayload>>,
  opts: {
    sport: string;
    teamName: string;
    descriptionMd: string;
    trainers: Array<{ name: string; role: string; phone?: string; email?: string }>;
  },
) {
  // 1. Ensure trainer/leader people exist; collect their IDs
  const trainerIds: Array<string | number> = [];
  for (let i = 0; i < opts.trainers.length; i++) {
    const t = opts.trainers[i]!;
    const id = await ensurePerson(payload, {
      name: t.name,
      role: t.role,
      function: "sportleitung",
      phone: t.phone,
      email: t.email,
      order: 100 + i, // push below Vorstand (order 1-7)
    });
    trainerIds.push(id);
  }

  // 2. Find the sport team by slug (Payload auto-slugs from name)
  const teamSlug = slug(opts.teamName);
  const existing = await payload.find({
    collection: "teams",
    where: { slug: { equals: teamSlug } },
    limit: 1,
  });
  if (existing.docs.length === 0) return;

  await payload.update({
    collection: "teams",
    id: existing.docs[0]!.id,
    data: {
      description: md(opts.descriptionMd),
      trainers: trainerIds,
    } as never,
  });
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

  // 1b. Portraits from the live site (mirrored into tmp/live-portraits/)
  // Idempotent: ensurePortrait() skips if the Person doc doesn't yet exist
  // (so it also works for people we'll only add later via populateSportSection).
  const portraits = [
    { personName: "Ralf Kirmeyer", filename: "Ralf_Kirmeyer.jpg", alt: "Porträt Ralf Kirmeyer" },
    { personName: "Birgit Höfer", filename: "BirgitHoefer.jpg", alt: "Porträt Birgit Höfer" },
    { personName: "Britta Feierabend", filename: "Britta_Feierabend.jpg", alt: "Porträt Britta Feierabend" },
    { personName: "Fabian Falk", filename: "FabianFalk.jpg", alt: "Porträt Fabian Falk" },
    { personName: "Felix Kirmeyer", filename: "Felix_Kirmeyer.jpg", alt: "Porträt Felix Kirmeyer" },
    { personName: "Tobias Treffer", filename: "Tobias_Treffer.jpg", alt: "Porträt Tobias Treffer" },
    { personName: "Elisabeth Schillinger", filename: "Elisabeth_Schillinger.jpg", alt: "Porträt Elisabeth Schillinger" },
    { personName: "Tenja Hirlinger", filename: "Tenja_Hirlinger.jpg", alt: "Porträt Tenja Hirlinger" },
    { personName: "Bini Hafner", filename: "Bini_Hafner.jpg", alt: "Porträt Bini Hafner" },
    { personName: "Tobias Tins", filename: "Tobias_Tins.jpg", alt: "Porträt Tobias Tins" },
    { personName: "Kevin Schwarz", filename: "Kevin_Schwarz.jpg", alt: "Porträt Kevin Schwarz" },
    { personName: "Vincenzo Tropeano", filename: "Vincenzo_Tropeano.jpg", alt: "Porträt Vincenzo Tropeano" },
    { personName: "Matthias Brisgies", filename: "Matthias_Brisgies.jpg", alt: "Porträt Matthias Brisgies" },
    { personName: "Christoph Hafner", filename: "Christoph_Hafner.jpg", alt: "Porträt Christoph Hafner" },
    { personName: "Florian Brams", filename: "Florian_Brams.jpg", alt: "Porträt Florian Brams" },
    { personName: "Vincent Balleng", filename: "Vincent_Balleng.jpg", alt: "Porträt Vincent Balleng" },
    { personName: "Tobias Lippenberger", filename: "Tobias_Lippenberger.jpg", alt: "Porträt Tobias Lippenberger" },
  ];
  const portraitDir = path.resolve(process.cwd(), "tmp/live-portraits");
  for (const pt of portraits) {
    const filePath = path.join(portraitDir, pt.filename);
    try {
      await fs.access(filePath);
      await ensurePortrait(payload, { ...pt, filePath });
      console.log(`✓ Portrait attached: ${pt.personName}`);
    } catch {
      // file not present — skip silently so seed works without the mirror
    }
  }

  // 1c. Sponsor logos (mirrored from live site into tmp/live-sponsors/)
  const sponsors = [
    { name: "a+b Pertler", filename: "sponsor1.avif", tier: "standard" as const, order: 5 },
    { name: "Autohaus Walter", filename: "sponsor2.avif", tier: "premium" as const, order: 2 },
    { name: "CHECK24", filename: "sponsor3.avif", url: "https://www.check24.de/", tier: "premium" as const, order: 1 },
    { name: "B&W Sport Consulting", filename: "sponsor4.avif", tier: "standard" as const, order: 6 },
    { name: "M-net", filename: "sponsor5.avif", url: "https://www.m-net.de/", tier: "premium" as const, order: 3 },
    { name: "Bromberger Office + Living", filename: "sponsor6.avif", tier: "standard" as const, order: 4 },
  ];
  const sponsorDir = path.resolve(process.cwd(), "tmp/live-sponsors");
  for (const sp of sponsors) {
    const filePath = path.join(sponsorDir, sp.filename);
    try {
      await fs.access(filePath);
      await ensureSponsor(payload, { ...sp, filePath });
      console.log(`✓ Sponsor attached: ${sp.name}`);
    } catch {
      // skip silently
    }
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
      bodyText: "Am 5. Mai 1983 entschlossen sich die Vereinsvorstände des SV Nord München-Lerchenau, des HuVTV Edelweiß-Stamm München und des FC Eintracht München, das von der Stadt München angebotene Fördermodell „Vereinsförderung von selbst errichteten Vereinsheimen\” in Anspruch zu nehmen. Ein Jahr später, am 2. Juli 1984, wurde der Eschengarten in Eigenregie gebaut.",
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
            { label: "FAQ", href: "/faq" },
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
        {
          label: "Vereinsheim Eschengarten",
          street: "Ebereschenstraße 17",
          postalCode: "80935",
          city: "München",
        },
      ],
      phone: "0172 2392919",
      email: "info@svnord.de",
      openingHours: [
        { day: "Montag", hours: "Ruhetag" },
        { day: "Dienstag – Freitag", hours: "11:00 – 23:30 Uhr" },
        { day: "Samstag", hours: "10:00 – 23:30 Uhr" },
        { day: "Sonntag", hours: "10:00 – 21:00 Uhr" },
      ],
    } as never,
  });

  // Chronik — 7 chapters from the legacy Vereinschronik, condensed to fit.
  await payload.updateGlobal({
    slug: "chronik-page",
    data: {
      intro:
        "Seit seiner Gründung 1947 steht der SV Nord für Gemeinschaft, Engagement und sportliche Leidenschaft im Münchner Norden — von 38 Gründungsmitgliedern in der Nachkriegszeit bis heute rund 500 aktive Nordler.",
      body: md(
        `## Vereinschronik

### Tradition seit 1947

Was einst unter schwierigen Nachkriegsbedingungen mit viel Eigeninitiative begann, entwickelte sich rasch zu einem festen Bestandteil des sportlichen Lebens im Münchner Norden. In den folgenden Jahrzehnten wuchs der Verein kontinuierlich: Neue Abteilungen entstanden, insbesondere im Fußball- und Handballbereich, und die Jugendarbeit wurde zu einer tragenden Säule.

Durch großen Einsatz der Mitglieder konnten wichtige Meilensteine wie der Bau von Sportanlagen, Flutlichtanlagen und schließlich des eigenen Vereinsheims realisiert werden – oft in beeindruckender Eigenleistung.

Heute steht der SV Nord für Tradition und Fortschritt gleichermaßen – getragen von dem Ziel, Menschen aller Altersgruppen für den Sport zu begeistern und ein lebendiges Vereinsleben zu gestalten.

#### Vereinsgründung (1947)

Im Frühjahr 1947 bemühten sich einige sportfreudige Lerchenauer und Eggartler um die Gründung eines Sportvereins. Besonders Alfons Huber, Lorenz Gessler, Hans Brandhuber, Carl Jennerwein, Kleophas Lang und Johann Steiner trieben die Vereinsgründung voran.

Zur Gründungsversammlung am 15. Oktober 1947 im Gasthof Schützengarten trugen sich 38 Erwachsene und 22 Jugendliche ein. In den Vorstand gewählt wurden: 1. Vorstand Carl Jennerwein, 1. Kassier Adolf Gräf und 1. Schriftführer Karl Hornung. Es wurde beschlossen, den Verein „SV Nord München-Lerchenau” zu benennen.

Von der Deutschen Reichsbahn wurde im Frühjahr 1948 ein Acker an der Heidelerchenstraße gepachtet und mit enormem Arbeitseinsatz zum Sportplatz hergerichtet. Am 01. August 1948 wurde unser Sportplatz mit dem Rückspiel gegen den TSV Unterhaching eingeweiht.

#### Die Vereinsentwicklung zwischen 1950 und 1987

In den folgenden Jahrzehnten konsolidierten sich die Abteilungen und die Mitgliederzahl wuchs stetig. Trotz beschränkter wirtschaftlicher Mittel wurden in Eigeninitiative die Grundlagen für die heutige Bezirkssportanlage geschaffen.

#### 1967 – Flutlichtanlagen in Eigenleistung erstellt

Mit unzähligen Arbeitsstunden der Mitglieder wurden die ersten Flutlichtanlagen auf dem Gelände errichtet und ermöglichten damit regelmäßigen Trainingsbetrieb bis in den Abend.

#### 1978 – Neue Vereinsorganisation

Eine grundlegende Neustrukturierung der Vereinsorganisation legte den Grundstein für das weitere Wachstum der Abteilungen.

#### 1980 – Erweiterung der Bezirkssportanlage

Die erste große Erweiterung der Bezirkssportanlage Lerchenau konnte im Oktober 1980 abgeschlossen werden. Die Bestrebungen um weitere Ausbauten liefen über die folgenden Jahre weiter — 1984 gab die Stadt endgültig grünes Licht, 1985 erfolgte der Auftrag, 1986 wurde ein zusätzliches Rasenspielfeld fertiggestellt und 1987 das neue Umkleidegebäude eingeweiht.

#### 1983–1986 – Der Eschengarten entsteht

Auf Initiative von Horst Lanninger (damals 1. Vorstand des SV Nord) gründeten SV Nord, FC Eintracht München und der Heimat- und Volkstrachtenverein Edelweiß-Stamm Lerchenau am 5. Mai 1983 die „Interessengemeinschaft Sportheimbau Lerchenau” — die heutige Vereins-Interessengemeinschaft Lerchenau e.V. (VIG-Lerchenau). Am 25. April 1985 bewilligte der Stadtrat die Bezuschussung, am 21. Juni 1985 war Baubeginn.

Nach rund 15.000 freiwilligen Arbeitsstunden der Vereinsmitglieder wurde das Vereinsheim „Eschengarten” am 19. Juli 1986 feierlich eröffnet — ein Gemeinschaftsprojekt dreier Vereine, das bis heute der gesellschaftliche Mittelpunkt der Lerchenau ist.

#### Vereinsentwicklung ab 1987

Mit Fertigstellung des Eschengartens und dem Ausbau der Bezirkssportanlage begann eine neue Phase. Im Herbst 1987 gründete sich auf Initiative von Karl Prölß die Ski-Abteilung. Die Gymnastikabteilung, 1967 von Anna Schaflitzl ins Leben gerufen, war bereits seit 20 Jahren aktiv. 1993 kam der Förderverein der Fußball-Senioren hinzu.

Die Mitgliederzahl wuchs von 500 (1971) über 766 (1996) auf 870 (1998). Seit 2006 ist der SV Nord online unter www.svnord.de präsent — heute sind es rund 500 aktive Mitglieder in fünf Abteilungen.

Die jüngere Vereinsgeschichte ist geprägt von Erfolgen im Fußball, einem breiten Sportangebot über mehrere Abteilungen und dem anhaltenden Bemühen um die Erweiterung der Sportanlage in Zusammenarbeit mit der Stadt München.`,
      ),
    } as never,
  });

  // Vereinsheim — facilities + contact for the Eschengarten restaurant.
  await payload.updateGlobal({
    slug: "vereinsheim-page",
    data: {
      intro:
        "Das Vereinsheim „Eschengarten\u201D wurde am 19. Juli 1986 nach rund 15.000 Stunden Eigenleistung eröffnet — ein Gemeinschaftsprojekt von SV Nord, FC Eintracht München und dem Heimat- und Volkstrachtenverein Edelweiß-Stamm. Bis heute der gesellschaftliche Mittelpunkt der Lerchenau.",
      body: md(
        `## Eine Gemeinschaftsleistung dreier Vereine

Auf Initiative von Horst Lanninger (damaliger 1. Vorstand des SV Nord) gründeten drei Lerchenauer Vereine am 5. Mai 1983 die Interessengemeinschaft Sportheimbau Lerchenau — die heutige Vereins-Interessengemeinschaft Lerchenau e.V. (VIG-Lerchenau). Mitgliedsvereine sind der SV Nord München-Lerchenau, der FC Eintracht München und der Heimat- und Volkstrachtenverein Edelweiß-Stamm Lerchenau.

Am 25. April 1985 bewilligte der Münchner Stadtrat die Bezuschussung (30% Zuschuss + zinsloses Darlehen), am 21. Juni 1985 war Baubeginn. Nach 15.000 freiwilligen Arbeitsstunden der Vereinsmitglieder wurde der Eschengarten am 19. Juli 1986 feierlich eröffnet.

## Unsere Plätze

Unsere modernen Trainings- und Spielbedingungen bieten beste Voraussetzungen für sportlichen Erfolg: Der Verein verfügt über zwei hochwertige Kunstrasenplätze sowie einen gepflegten Naturrasenplatz, die ganzjährig optimale Nutzung ermöglichen. In den Wintermonaten steht zusätzlich eine Sporthalle zur Verfügung.

## Gastronomie

Die Gaststätte Eschengarten wird von einer eigenen Wirtsfamilie betrieben und ist an sechs Tagen die Woche geöffnet. Reservierungen direkt unter +49 (0)89 351 1899 oder auf www.eschengarten.com.`,
      ),
    } as never,
  });

  // Jugendförderverein — welcome letter + contact.
  await payload.updateGlobal({
    slug: "jugendfoerder-page",
    data: {
      intro:
        "Der Förderverein der Fußballjunioren unterstützt die Jugendarbeit des SV Nord gezielt dort, wo der Regelbetrieb endet — bei Trainingslagern, Equipment, Events und Teambuilding.",
      body: md(
        `## Liebe Eltern, liebe Freunde des SV Nord Lerchenau

Der SV Nord Lerchenau bietet den jungen Menschen eine hervorragende Möglichkeit zur sportlichen Betätigung mit allen positiven Wirkungen einer sozialen Gemeinschaft, die ein Verein erzielt. Nicht nur beim Sport, sondern auch bei der Ausgestaltung des Vereinslebens hat die Fußballjugend einen hohen Stand erreicht.

Mit der Gründung des Fördervereins der Fußballjunioren haben wir eine Möglichkeit geschaffen, die zahlreichen Jugendmannschaften der Fußball-Abteilung finanziell zu unterstützen. Die für einen geregelten Sportbetrieb notwendigen Aufwendungen werden selbstverständlich weiterhin vom SV Nord Lerchenau bestritten; unsere Mittel sind für Anschaffungen und Aktivitäten gedacht, die darüber hinausgehen.

## Beitrag & Spenden

Der Förderverein erhebt von jedem Mitglied nur einen geringen Jahresbeitrag von mindestens 24 € — bewusst niedrig gehalten, damit über alle weiteren Zuzahlungen Spendenquittungen ausgestellt werden können. Wir bitten Sie, uns bei diesen wichtigen Aufgaben zu unterstützen, indem Sie dem Förderverein beitreten.

## Kontakt

Weitere Infos zum Jugendförderverein per Mail an nordjugend@gmx.de.`,
      ),
    } as never,
  });

  // Legal — real Impressum + placeholder Datenschutz (to be drafted separately).
  await payload.updateGlobal({
    slug: "legal-pages",
    data: {
      impressumBody: md(
        `## Angaben gemäß § 5 TMG

SV Nord München-Lerchenau e.V.
Ebereschenstraße 17
80935 München

## Vertreten durch

Ralf Kirmeyer (1. Vorstand)
E-Mail: ralf.kirmeyer@svnord.de

## Registereintrag

Eintragung im Vereinsregister — Registergericht München, Registernummer VR 6924.

## Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV

Ralf Kirmeyer, Anschrift wie oben.

## Haftung für Inhalte

Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.

## Haftung für Links

Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.

## Urheberrecht

Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.`,
      ),
      datenschutzBody: md(
        `## Datenschutzerklärung

Diese Datenschutzerklärung wird zeitnah auf Basis der DSGVO vervollständigt. Bis dahin gelten die allgemeinen Hinweise der verlinkten Dienste (Payload CMS, Vercel, Neon) sowie die Auskunfts- und Löschrechte nach Art. 15–17 DSGVO, Anfragen bitte per E-Mail an info@svnord.de.

## Kontakt

SV Nord München-Lerchenau e.V.
Ebereschenstraße 17
80935 München
info@svnord.de`,
      ),
    } as never,
  });

  // Sport-section descriptions + leaders (mirrored from the live site).
  await populateSportSection(payload, {
    sport: "gymnastik",
    teamName: "Gymnastik",
    descriptionMd: `## Willkommen bei der Gymnastik-Abteilung

Unsere Gymnastikabteilung wurde 1967 gegründet und ist somit schon über 50 Jahre alt. Aktuell sind wir rund 35 Mitglieder in der Gymnastikgruppe.

## Training

Wir trainieren jeden Montag von 19:00 bis 20:00 Uhr in der Waldmeisterschule und jeden Mittwoch von 19:00 bis 20:00 Uhr im Pfarrsaal. In den Schulferien ist kein Training.

## Mitmachen

Jeder ist herzlich willkommen — Frauen wie Männer. Habt ihr Lust bekommen? Meldet euch gerne bei uns, wir freuen uns!`,
    trainers: [
      {
        name: "Elisabeth Schillinger",
        role: "1. Abteilungsleiterin Gymnastik",
        phone: "0176 646 61 724",
        email: "info@svnord.de",
      },
      {
        name: "Tenja Hirlinger",
        role: "Vertretung Gymnastik",
        phone: "0171 856 60 64",
      },
    ],
  });

  await populateSportSection(payload, {
    sport: "volleyball",
    teamName: "Volleyball",
    descriptionMd: `## Willkommen bei der Volleyball-Abteilung

Wir treffen uns seit 1984 als Familienvolleyballer und wurden dann beim SV Nord als eigene Abteilung aufgenommen. Unser Team ist zwischen 15 und 75 Jahre alt — Gemeinschaft und Spaß am Spiel stehen bei uns im Vordergrund.

## Training

Wir spielen jeden Freitag von 19:00 bis 21:00 Uhr in der Waldmeisterschule. In den Schulferien ist kein Training.

## Mitmachen

Vielleicht habt ihr Lust bekommen und wollt einmal reinschnuppern. Wir freuen uns auf euch!`,
    trainers: [],
  });

  await populateSportSection(payload, {
    sport: "ski",
    teamName: "Ski",
    descriptionMd: `## Willkommen bei der Ski-Abteilung

Seit mehr als 20 Jahren ist die Ski-Abteilung fester Bestandteil des SV Nord. Mit ausgebildeten und jungen Skilehrern wollen wir jedem Interessenten den Spaß am Skifahren näher bringen. Vom motivierten Neueinsteiger bis hin zum routinierten Könner — in der Ski-Abteilung ist für jeden Pistenfreund ein Platz frei.

Wir freuen uns auf Dich. Eure SV Nord Ski-Crew.`,
    trainers: [
      { name: "Bini Hafner", role: "1. Vorsitzender · Skilehrer" },
      { name: "Tobias Tins", role: "2. Vorsitzender · Skilehrer" },
      { name: "Fabian Falk", role: "Skilehrer" },
      { name: "Christoph Hafner", role: "Skilehrer" },
    ],
  });

  await populateSportSection(payload, {
    sport: "esport",
    teamName: "Esport",
    descriptionMd: `## Willkommen bei der E-Sport-Abteilung

Seit nunmehr zwei Jahren messen wir uns auch virtuell mit anderen Vereinen. Im Debütjahr konnten die Jungs von Erich Popp direkt die Meisterschaft eintüten und spielten daraufhin in der höchsten Spielklasse der BFV-eLeague (eRegionalliga). Zudem wurde eine zweite Mannschaft in der eLandesliga gemeldet.

## Aktuelle Saison

Die erste Mannschaft erreichte den 4. Tabellenplatz und qualifizierte sich für die Playoffs, wo man gegen Gilching ausschied. Die Reserve wurde souverän Zweite und verpasste damit knapp den Aufstieg in die eBayernliga.

## Mitspielen

Das Team sucht weiterhin junge, talentierte Spieler ab 16 Jahren. Wenn ihr Lust habt mitzuspielen, meldet euch bei uns.`,
    trainers: [
      { name: "Erich Popp", role: "Trainer E-Sport" },
      { name: "Kevin Schwarz", role: "Kapitän · eRegionalliga" },
      { name: "Julian Wetzl", role: "Spieler · eRegionalliga" },
      { name: "Florian Brams", role: "Spieler · eRegionalliga" },
      { name: "Vincent Balleng", role: "Spieler · eLandesliga" },
      { name: "Tobias Lippenberger", role: "Spieler · eLandesliga" },
    ],
  });

  await populateSportSection(payload, {
    sport: "schiedsrichter",
    teamName: "Schiedsrichter",
    descriptionMd: `## Willkommen bei unseren Schiedsrichtern

Ein Platz, zwei Tore und 22 Spieler — das ist das Erste, was jedem zum Thema Fußball einfällt. Doch ohne den Schiedsrichter könnte keine Partie stattfinden. Schiedsrichter zu sein bedeutet nicht nur am Wochenende seine Spiele zu pfeifen; der Aufgabenbereich ist vielfältig.

## Nachwuchs gesucht

Wenn Ihr Lust habt, Verantwortung im Fußball zu übernehmen, wendet Euch gerne an unseren Schiedsrichterobmann. Er erzählt euch mehr über das Tätigkeitsfeld — neben den aktiven Schiedsrichtern suchen wir weiterhin nach Nachwuchs.`,
    trainers: [
      { name: "Vincenzo Tropeano", role: "Schiedsrichter-Obmann · Bezirksliga" },
      { name: "Matthias Brisgies", role: "Schiedsrichter (aktiv)" },
      { name: "Kurt Tänzer", role: "Schiedsrichter (passiv)" },
    ],
  });

  // FAQ — base set expanded from the live site's 4 questions with
  // answers grounded in the real repo (team count, league, venue).
  await payload.updateGlobal({
    slug: "faq-page",
    data: {
      intro:
        "Die häufigsten Fragen rund um Mitgliedschaft, Training und Vereinsleben beim SV Nord München-Lerchenau. Antwort fehlt? Schreibt uns einfach an info@svnord.de.",
      items: [
        {
          group: "allgemein",
          question: "Welche Sportarten gibt es beim SV Nord?",
          answer:
            "Wir bieten Fußball (Herren, Jugend, Senioren, AH, Schiedsrichter), Volleyball, Gymnastik, Ski und Esport — rund 500 Mitglieder in fünf Abteilungen.",
        },
        {
          group: "allgemein",
          question: "Welche Mannschaften gibt es im Fußballbereich?",
          answer:
            "Aktuell stellen wir drei Herren-Mannschaften, zwei Seniorenteams (A & B) sowie eine Alte Herren. Im Jugendbereich spielen wir von den Bambinis bis zur A-Jugend in allen Altersstufen, für Mädchen zusätzlich die B-, C- und D-Juniorinnen.",
        },
        {
          group: "allgemein",
          question: "In welcher Liga spielt die 1. Mannschaft?",
          answer:
            "Die erste Herren-Mannschaft spielt in der Saison 2025/26 in der Bezirksliga Oberbayern Nord. Tabelle, Spielplan und Torjäger findest Du live auf fupa.net — der Block auf unserer Startseite zieht diese Daten automatisch.",
        },
        {
          group: "mitgliedschaft",
          question: "Wer kann beim SV Nord mitspielen?",
          answer:
            "Jeder und jede Sportbegeisterte, vom Anfänger bis zum erfahrenen Spieler. Wir nehmen Mitglieder jeden Alters auf — einfach ein Probetraining vereinbaren und reinschnuppern.",
        },
        {
          group: "mitgliedschaft",
          question: "Wie werde ich Mitglied?",
          answer:
            "Den Aufnahmeantrag findest Du unter /mitgliedschaft bzw. im Vereinsheim. Fragen beantwortet der Vorstand per E-Mail: info@svnord.de.",
        },
        {
          group: "mitgliedschaft",
          question: "Gibt es einen Jugendförderverein?",
          answer:
            "Ja. Der Förderverein der Fußballjunioren unterstützt Trainingslager, Ausstattung und Jugend-Events. Mindestbeitrag 24 € pro Jahr, Spendenquittungen werden ausgestellt. Kontakt: nordjugend@gmx.de.",
        },
        {
          group: "training",
          question: "Wo trainieren die Mannschaften?",
          answer:
            "Auf der Bezirkssportanlage Lerchenau in der Ebereschenstraße 17, 80935 München — zwei Kunstrasenplätze, ein Naturrasenplatz und im Winter zusätzlich eine Sporthalle.",
        },
        {
          group: "training",
          question: "Wie kann ich den Verein kontaktieren?",
          answer:
            "Per Mail an info@svnord.de, für den Jugendförderverein nordjugend@gmx.de, und für die Vorstandschaft stehen die persönlichen Kontakte unter /verein/vorstand. Das Kontaktformular unter /kontakt wird innerhalb von 2–3 Tagen beantwortet.",
        },
        {
          group: "vereinsheim",
          question: "Wann hat das Vereinsheim Eschengarten geöffnet?",
          answer:
            "Montag: Ruhetag. Dienstag – Freitag 11:00 – 23:30 Uhr, Samstag 10:00 – 23:30 Uhr, Sonntag 10:00 – 21:00 Uhr. Reservierung unter +49 (0)89 351 1899 oder www.eschengarten.com.",
        },
      ],
    } as never,
  });

  // Re-run the portraits pass — the first one (step 1b) can't attach to
  // sport-section People because those don't exist until populateSportSection
  // runs. Rerunning now picks them up.
  for (const pt of portraits) {
    const filePath = path.join(portraitDir, pt.filename);
    try {
      await fs.access(filePath);
      await ensurePortrait(payload, { ...pt, filePath });
    } catch {
      // skip silently
    }
  }

  console.log("\n✓ Seed complete.");
  process.exit(0);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
