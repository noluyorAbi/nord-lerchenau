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

type BfvMeta = {
  teamId?: string;
  slug?: string;
  spielklasse?: string;
  partner?: string;
};

async function ensureTeam(
  payload: Awaited<ReturnType<typeof getPayload>>,
  t: {
    name: string;
    slug?: string;
    sport: string;
    category: string;
    ageGroup?: string;
    order: number;
    league?: string;
    bfv?: BfvMeta;
  },
) {
  const teamSlug = t.slug ?? slug(t.name);
  const data = {
    name: t.name,
    slug: teamSlug,
    sport: t.sport,
    category: t.category,
    ageGroup: t.ageGroup,
    order: t.order,
    season: "2025/26",
    league: t.league,
    bfv: t.bfv,
  };
  const existing = await payload.find({
    collection: "teams",
    where: { slug: { equals: teamSlug } },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    const id = existing.docs[0]!.id;
    await payload.update({
      collection: "teams",
      id,
      data: data as never,
    });
    return id;
  }

  const created = await payload.create({
    collection: "teams",
    data: data as never,
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

  // 2. Teams — mirrored 1:1 from the BFV Vereinsprofil on 2026-04-22.
  // BFV club URL: https://www.bfv.de/vereine/sv-nord-muenchen-lerchenau/00ES8GNHD400000DVV0AG08LVUPGND5I
  const teams = [
    {
      name: "1. Herren",
      slug: "erste",
      sport: "fussball",
      category: "senioren",
      ageGroup: "Herren",
      order: 1,
      league: "Bezirksliga Oberbayern Nord",
      bfv: {
        teamId: "016PMM83PG000000VV0AG811VUDIC8D7",
        slug: "sv-n-lerchenau",
        spielklasse: "Herren / Bezirksliga",
      },
    },
    {
      name: "2. Herren",
      slug: "zwoate",
      sport: "fussball",
      category: "senioren",
      ageGroup: "Herren",
      order: 2,
      league: "Kreisklasse München",
      bfv: {
        teamId: "016PG593GK000000VV0AG80NVUT1FLRU",
        slug: "sv-n-lerchenau-ii",
        spielklasse: "Herren / Kreisklasse",
      },
    },
    {
      name: "3. Herren",
      slug: "dritte",
      sport: "fussball",
      category: "senioren",
      ageGroup: "Herren",
      order: 3,
      league: "B-Klasse München",
      bfv: {
        teamId: "02EN0JFAQS000000VS5489B1VU24SJ9U",
        slug: "sv-n-lerchenau-iii",
        spielklasse: "Herren / B-Klasse",
      },
    },
    {
      name: "Herren Ü32",
      slug: "senioren-a",
      sport: "fussball",
      category: "senioren",
      ageGroup: "Ü32",
      order: 4,
      league: "Senioren A · A-Klasse Gr. 1",
      bfv: {
        teamId: "02DKBK6RNK000000VS5489B1VT3FEKAP",
        slug: "sv-nord-muenchen-lerchenau",
        spielklasse: "Senioren / A-Klasse",
      },
    },
    {
      name: "Herren Ü40",
      slug: "senioren-b",
      sport: "fussball",
      category: "senioren",
      ageGroup: "Ü40",
      order: 5,
      league: "Senioren Ü40 · Kreisklasse 2",
      bfv: {
        teamId: "02VQ9J0FS8000000VS5489BSVSPMR2B8",
        slug: "sg-sv-wb-allianz-muenchen-sv-nord-muenchen-lerchenau",
        spielklasse: "Senioren Ü40 / Kreisklasse",
        partner: "Spielgemeinschaft mit SV WB Allianz München",
      },
    },
    {
      name: "A1-Junioren · U19-I",
      slug: "a1-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U19",
      order: 10,
      league: "U19 Kreisliga Nord",
      bfv: {
        teamId: "011MICNASC000000VTVG0001VTR8C1K7",
        slug: "sg-nord-lerchenau-fasanarie-nord-u19-i",
        spielklasse: "A-Junioren / Kreisliga",
        partner: "Spielgemeinschaft mit Fasanarie-Nord",
      },
    },
    {
      name: "A2-Junioren · U19-II",
      slug: "a2-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U19",
      order: 11,
      league: "U19 Kreisklasse Nord",
      bfv: {
        teamId: "02Q1H9R058000000VS5489B2VT450JFN",
        slug: "sg-nord-lerchenau-fasanarie-nord-u19-ii",
        spielklasse: "A-Junioren / Kreisklasse",
        partner: "Spielgemeinschaft mit Fasanarie-Nord",
      },
    },
    {
      name: "B1-Junioren · U17-I",
      slug: "b1-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U17",
      order: 12,
      league: "U17 Kreisklasse Nord",
      bfv: {
        teamId: "011MIDR440000000VTVG0001VTR8C1K7",
        slug: "sg-nord-lerchenau-fasanarie-nord-u17-i",
        spielklasse: "B-Junioren / Kreisklasse",
        partner: "Spielgemeinschaft mit Fasanarie-Nord",
      },
    },
    {
      name: "B2-Junioren · U17-II",
      slug: "b2-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U17",
      order: 13,
      league: "U17 Kreisklasse Nord RR",
      bfv: {
        teamId: "02MECTAVFG000000VS5489B2VSMMET75",
        slug: "sg-nord-lerchenau-fasanarie-nord-u17-ii",
        spielklasse: "B-Junioren / Kreisklasse",
        partner: "Spielgemeinschaft mit Fasanarie-Nord",
      },
    },
    {
      name: "C-Junioren · U14",
      slug: "c1-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U14",
      order: 14,
      league: "U14 Kreisklasse Nord",
      bfv: {
        teamId: "011MID44RO000000VTVG0001VTR8C1K7",
        slug: "sv-nord-lerchenau-u14",
        spielklasse: "C-Junioren / Kreisklasse",
      },
    },
    {
      name: "D-Junioren · U13",
      slug: "d1-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U13",
      order: 15,
      league: "U13 Kreisklasse Nord",
      bfv: {
        teamId: "011MIB2F00000000VTVG0001VTR8C1K7",
        slug: "sv-nord-lerchenau-u13",
        spielklasse: "D-Junioren / Kreisklasse",
      },
    },
    {
      name: "D-Junioren · U12",
      slug: "d2-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U12",
      order: 16,
      league: "U12 Gruppe Nord 01 RR",
      bfv: {
        teamId: "01793QVOBS000000VV0AG80NVSPDBCDD",
        slug: "sv-nord-lerchenau-u12",
        spielklasse: "D-Junioren / Gruppe Nord",
      },
    },
    {
      name: "E-Junioren · U10-1",
      slug: "e1-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U10",
      order: 17,
      league: "U10 Nord Orange RR",
      bfv: {
        teamId: "011MIC45LG000000VTVG0001VTR8C1K7",
        slug: "sv-nord-lerchenau-u10-1",
        spielklasse: "E-Junioren / Gruppe Orange",
      },
    },
    {
      name: "E-Junioren · U10-2",
      slug: "e2-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U10",
      order: 18,
      league: "U10 Nord RR",
      bfv: {
        teamId: "02HHKIT4F8000000VS5489B2VS0QNMOS",
        slug: "sv-nord-lerchenau-u10-2",
        spielklasse: "E-Junioren / Gruppe Nord",
      },
    },
    {
      name: "F-Junioren · U9",
      slug: "f1-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U9",
      order: 19,
      league: "U9 Nord RR",
      bfv: {
        teamId: "01E1KUPPOG000000VV0AG811VU96PDS7",
        slug: "sv-nord-lerchenau-u9",
        spielklasse: "F-Junioren",
      },
    },
    {
      name: "F-Junioren · U8-I",
      slug: "f2-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U8",
      order: 20,
      league: "U8 Nord Puma RR",
      bfv: {
        teamId: "026EFPEI0S000000VS5489B1VVJ2HPHR",
        slug: "sv-nord-lerchenau-u8-i",
        spielklasse: "F-Junioren / Gruppe Puma",
      },
    },
    {
      name: "F-Junioren · U8-II",
      slug: "f3-junioren",
      sport: "fussball",
      category: "junioren",
      ageGroup: "U8",
      order: 21,
      league: "U8 Nord Puma RR",
      bfv: {
        teamId: "02TQ4KCI78000000VS5489BSVTNMVP4D",
        slug: "sv-nord-lerchenau-u8-ii",
        spielklasse: "F-Junioren / Gruppe Puma",
      },
    },
    {
      name: "Bambini",
      slug: "bambini",
      sport: "fussball",
      category: "bambini",
      ageGroup: "ab 4 Jahren",
      order: 22,
      league: "Trainingsgruppe · kein Spielbetrieb",
    },
    {
      name: "B-Juniorinnen · U17",
      slug: "b-juniorinnen",
      sport: "fussball",
      category: "juniorinnen",
      ageGroup: "U17",
      order: 30,
      league: "U17 Kreisklasse Nord",
      bfv: {
        teamId: "02TQ04QJS0000000VS5489BSVTNMVP4D",
        slug: "sv-nord-muenchen-lerchenau-u17",
        spielklasse: "B-Juniorinnen / Kreisklasse",
      },
    },
    {
      name: "C-Juniorinnen · U15",
      slug: "c-juniorinnen",
      sport: "fussball",
      category: "juniorinnen",
      ageGroup: "U15",
      order: 31,
      league: "U15 Kreisklasse Nord",
      bfv: {
        teamId: "02MED5F3QO000000VS5489B2VSMMET75",
        slug: "sv-nord-muenchen-lerchenau-u15",
        spielklasse: "C-Juniorinnen / Kreisklasse",
      },
    },
    {
      name: "D-Juniorinnen · U13",
      slug: "d-juniorinnen",
      sport: "fussball",
      category: "juniorinnen",
      ageGroup: "U13",
      order: 32,
      league: "U13 Kreisklasse Nord",
      bfv: {
        teamId: "02IPFCVV1G000000VS5489B1VT368TME",
        slug: "sv-nord-muenchen-lerchenau-u13",
        spielklasse: "D-Juniorinnen / Kreisklasse",
      },
    },
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

Die jüngere Vereinsgeschichte ist geprägt von Erfolgen im Fußball, einem breiten Sportangebot über mehrere Abteilungen und dem anhaltenden Bemühen um die Erweiterung der Sportanlage in Zusammenarbeit mit der Stadt München.

#### Alle 1. Vorstände seit 1947

Carl Jennerwein (1947/48) · Karl Hornung sen. (1948–1950) · Kleophas Lang (1950–1959) · Hans Späht (1959–1961) · Georg Schmidt (1961–1964) · Franz Gossler (1964–1967) · Oskar Huhle (1967–1970) · Josef Promeberger (1970–1972) · Wolfgang Viertl (1972–1978) · Franz Münch (1978–1980) · Horst Lanninger (1980–1990, später Ehrenvorstand) · Kurt Tänzer (1990–2000) · Günter Ottl (2000–2004) · Rudolf Westermair (2004/05) · Wolfgang Wennrich (2005–2009) · Christian Douda (2009–2015) · Goran Pajic (2015–2017) · Heinz Fessenmayer (ab 23.11.2017) · Ralf Kirmeyer (heute).`,
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

Name: Ralf Kirmeyer
Kontakt: Ebereschenstraße 17, 80935 München
Telefon: 0172 9808109
E-Mail: ralf.kirmeyer@svnord.de

## Registereintrag

Eintragung im Vereinsregister.
Registergericht: München
Registernummer: VR 6924

## Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV

Ralf Kirmeyer
Ebereschenstraße 17
80935 München

## Haftung für Inhalte

Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.

## Haftung für Links

Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.

## Urheberrecht

Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.`,
      ),
      datenschutzBody: md(
        `## Datenschutz

Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.

Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.

Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor.

## Kontakt

SV Nord München-Lerchenau e.V.
Ebereschenstraße 17
80935 München
info@svnord.de

## DSGVO-Erweiterung

Eine vollständige DSGVO-konforme Datenschutzerklärung (inkl. Hinweise zu Payload CMS, Vercel, Neon sowie Auskunfts- und Löschrechte nach Art. 15–17 DSGVO) wird ergänzt. Anfragen bitte per E-Mail an info@svnord.de.`,
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
