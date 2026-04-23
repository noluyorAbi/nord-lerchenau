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
    children: [
      {
        type: "text",
        text,
        format: 0,
        version: 1,
        detail: 0,
        mode: "normal",
        style: "",
      },
    ],
  });
  const heading = (tag: "h2" | "h3" | "h4", text: string): LexNode => ({
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      {
        type: "text",
        text,
        format: 0,
        version: 1,
        detail: 0,
        mode: "normal",
        style: "",
      },
    ],
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

const MANIFEST_PATH = path.resolve(
  process.cwd(),
  "tmp/wix-images/manifest.json",
);
const IMG_DIR = path.resolve(process.cwd(), "tmp/wix-images");

type Manifest = Record<string, { filename: string; alt: string }>;

async function ensureAdminUser(
  payload: Awaited<ReturnType<typeof getPayload>>,
) {
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
  console.log(
    "✓ Created admin user: admin@svnord.de / ChangeMeNach-P1 (CHANGE THIS PASSWORD)",
  );
}

async function ensurePerson(
  payload: Awaited<ReturnType<typeof getPayload>>,
  p: {
    name: string;
    role: string;
    function: string;
    phone?: string;
    email?: string;
    order: number;
  },
) {
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
      data: {
        name,
        logo: mediaId,
        tier,
        order,
        ...(url ? { url } : {}),
      } as never,
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

async function ensureTeamPhoto(
  payload: Awaited<ReturnType<typeof getPayload>>,
  opts: { teamSlug: string; filename: string; alt: string; filePath: string },
) {
  const { teamSlug, filename, alt, filePath } = opts;
  try {
    await fs.access(filePath);
  } catch {
    return;
  }
  const team = await payload.find({
    collection: "teams",
    where: { slug: { equals: teamSlug } },
    limit: 1,
  });
  if (team.docs.length === 0) return;

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
    const created = await payload.create({
      collection: "media",
      data: { alt } as never,
      file: {
        data: buf,
        mimetype: "image/jpeg",
        name: filename,
        size: buf.byteLength,
      },
    });
    mediaId = created.id;
  }

  await payload.update({
    collection: "teams",
    id: team.docs[0]!.id,
    data: { photo: mediaId } as never,
  });
}

async function populateSportSection(
  payload: Awaited<ReturnType<typeof getPayload>>,
  opts: {
    sport: string;
    teamName: string;
    descriptionMd: string;
    trainers: Array<{
      name: string;
      role: string;
      phone?: string;
      email?: string;
    }>;
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

type FupaMeta = {
  slug?: string;
  autumnSlug?: string;
  springSlug?: string;
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
    fupa?: FupaMeta;
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
    fupa: t.fupa,
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
    {
      name: "Ralf Kirmeyer",
      role: "1. Vorstand",
      function: "vorstand",
      phone: "0172 9808109",
      email: "ralf.kirmeyer@svnord.de",
      order: 1,
    },
    {
      name: "Birgit Höfer",
      role: "2. Vorstand",
      function: "vorstand",
      phone: "0173 9547204",
      email: "birgit.hoefer@svnord.de",
      order: 2,
    },
    {
      name: "Britta Feierabend",
      role: "Kassier",
      function: "vorstand",
      phone: "0176 96655106",
      email: "britta.feierabend@svnord.de",
      order: 3,
    },
    {
      name: "Fabian Falk",
      role: "Schriftführer",
      function: "vorstand",
      phone: "0170 5859347",
      email: "fabian.falk@svnord.de",
      order: 4,
    },
    {
      name: "Felix Kirmeyer",
      role: "Sportlicher Leiter",
      function: "sportleitung",
      phone: "0176 63691739",
      email: "felix.kirmeyer@svnord.de",
      order: 5,
    },
    {
      name: "Tobias Treffer",
      role: "Jugendleitung Großfeld",
      function: "jugendleitung",
      phone: "0176 55126535",
      email: "tobias.treffer@svnord.de",
      order: 6,
    },
    {
      name: "Ergin Piker",
      role: "Jugendleitung Kleinfeld",
      function: "jugendleitung",
      phone: "0160 5892697",
      email: "ergin.piker@svnord.de",
      order: 7,
    },
  ];

  for (const p of vorstand) {
    await ensurePerson(payload, p);
  }

  // 1b. Portraits from the live site (mirrored into tmp/live-portraits/)
  // Idempotent: ensurePortrait() skips if the Person doc doesn't yet exist
  // (so it also works for people we'll only add later via populateSportSection).
  const portraits = [
    {
      personName: "Ralf Kirmeyer",
      filename: "Ralf_Kirmeyer.jpg",
      alt: "Porträt Ralf Kirmeyer",
    },
    {
      personName: "Birgit Höfer",
      filename: "BirgitHoefer.jpg",
      alt: "Porträt Birgit Höfer",
    },
    {
      personName: "Britta Feierabend",
      filename: "Britta_Feierabend.jpg",
      alt: "Porträt Britta Feierabend",
    },
    {
      personName: "Fabian Falk",
      filename: "FabianFalk.jpg",
      alt: "Porträt Fabian Falk",
    },
    {
      personName: "Felix Kirmeyer",
      filename: "Felix_Kirmeyer.jpg",
      alt: "Porträt Felix Kirmeyer",
    },
    {
      personName: "Tobias Treffer",
      filename: "Tobias_Treffer.jpg",
      alt: "Porträt Tobias Treffer",
    },
    {
      personName: "Elisabeth Schillinger",
      filename: "Elisabeth_Schillinger.jpg",
      alt: "Porträt Elisabeth Schillinger",
    },
    {
      personName: "Tenja Hirlinger",
      filename: "Tenja_Hirlinger.jpg",
      alt: "Porträt Tenja Hirlinger",
    },
    {
      personName: "Bini Hafner",
      filename: "Bini_Hafner.jpg",
      alt: "Porträt Bini Hafner",
    },
    {
      personName: "Tobias Tins",
      filename: "Tobias_Tins.jpg",
      alt: "Porträt Tobias Tins",
    },
    {
      personName: "Kevin Schwarz",
      filename: "Kevin_Schwarz.jpg",
      alt: "Porträt Kevin Schwarz",
    },
    {
      personName: "Vincenzo Tropeano",
      filename: "Vincenzo_Tropeano.jpg",
      alt: "Porträt Vincenzo Tropeano",
    },
    {
      personName: "Matthias Brisgies",
      filename: "Matthias_Brisgies.jpg",
      alt: "Porträt Matthias Brisgies",
    },
    {
      personName: "Christoph Hafner",
      filename: "Christoph_Hafner.jpg",
      alt: "Porträt Christoph Hafner",
    },
    {
      personName: "Florian Brams",
      filename: "Florian_Brams.jpg",
      alt: "Porträt Florian Brams",
    },
    {
      personName: "Vincent Balleng",
      filename: "Vincent_Balleng.jpg",
      alt: "Porträt Vincent Balleng",
    },
    {
      personName: "Tobias Lippenberger",
      filename: "Tobias_Lippenberger.jpg",
      alt: "Porträt Tobias Lippenberger",
    },
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
    {
      name: "a+b Pertler",
      filename: "sponsor1.avif",
      tier: "standard" as const,
      order: 5,
    },
    {
      name: "Autohaus Walter",
      filename: "sponsor2.avif",
      url: "https://www.auto-walter.com/",
      tier: "premium" as const,
      order: 2,
    },
    {
      name: "CHECK24",
      filename: "sponsor3.avif",
      url: "https://www.check24.de/",
      tier: "premium" as const,
      order: 1,
    },
    {
      name: "B&W Sport Consulting",
      filename: "sponsor4.avif",
      url: "https://www.bwsportconsulting.de/",
      tier: "standard" as const,
      order: 6,
    },
    {
      name: "M-net",
      filename: "sponsor5.avif",
      url: "https://www.m-net.de/",
      tier: "premium" as const,
      order: 3,
    },
    {
      name: "Bromberger Office + Living",
      filename: "sponsor6.avif",
      tier: "standard" as const,
      order: 4,
    },
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
      fupa: { slug: "sv-nord-muenchen-lerchenau-m1-2025-26" },
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
      fupa: { slug: "sv-nord-muenchen-lerchenau-m2-2025-26" },
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
      fupa: { slug: "sv-nord-muenchen-lerchenau-m3-2025-26" },
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
      fupa: { slug: "sv-nord-muenchen-lerchenau-o32-1-2026" },
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
      fupa: {
        autumnSlug: "sg-n-lerchenau-fasanerie-n-u19-1-autumn2025",
        springSlug: "sg-n-lerchenau-fasanerie-n-u19-1-spring2026",
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
      fupa: {
        autumnSlug: "sg-n-lerchenau-fasanerie-n-u19-2-autumn2025",
        springSlug: "sg-n-lerchenau-fasanerie-n-u19-2-spring2026",
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
      fupa: {
        autumnSlug: "sg-n-lerchenau-fasanerie-n-u17-1-autumn2025",
        springSlug: "sg-n-lerchenau-fasanerie-n-u17-1-spring2026",
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
      fupa: {
        autumnSlug: "sg-n-lerchenau-fasanerie-n-u17-2-autumn2025",
        springSlug: "sg-n-lerchenau-fasanerie-n-u17-2-spring2026",
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
      fupa: { slug: "sv-nord-muenchen-lerchenau-wu17-1-2025-26" },
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
      fupa: { slug: "sv-nord-muenchen-lerchenau-wu15-1-2025-26" },
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
    {
      name: "Volleyball",
      sport: "volleyball",
      category: "allgemein",
      order: 100,
    },
    {
      name: "Gymnastik",
      sport: "gymnastik",
      category: "allgemein",
      order: 101,
    },
    { name: "Ski", sport: "ski", category: "allgemein", order: 102 },
    { name: "Esport", sport: "esport", category: "allgemein", order: 103 },
    {
      name: "Schiedsrichter",
      sport: "schiedsrichter",
      category: "allgemein",
      order: 104,
    },
  ];

  for (const t of teams) {
    await ensureTeam(payload, t);
  }

  // 3. Optional manifest for image references
  let manifest: Manifest = {};
  try {
    manifest = JSON.parse(
      await fs.readFile(MANIFEST_PATH, "utf-8"),
    ) as Manifest;
  } catch {
    console.warn(
      "No image manifest found. Run `bun run download-images` first to import photos.",
    );
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
      bodyText:
        "Nach langer Vorbereitung sind wir endlich in die Punktspiele 2026 gestartet. Bezirksliga – 19. Spieltag (Rückrunde). Auswärts beim ASV Dachau: 2. vs. 4. – ein echter Kracher! Früher Rückstand, starke Reaktion und ein verdienter 1:2-Auswärtssieg. Platz 3 in der Tabelle (punktgleich mit Platz 2). 3. Mannschaft: Matschschlacht gegen den FV Hansa Neuhausen – trotz Top-Chancen bleibt's beim 0:0.",
    },
    {
      title: "40 Jahre Eschengarten",
      slug: "40-jahre-eschengarten",
      excerpt: "Vier Jahrzehnte Vereinsheim — eine Chronik in Bildern.",
      publishedAt: new Date("2026-02-06T18:00:00+01:00").toISOString(),
      tags: ["verein"],
      bodyText:
        "Am 5. Mai 1983 entschlossen sich die Vereinsvorstände des SV Nord München-Lerchenau, des HuVTV Edelweiß-Stamm München und des FC Eintracht München, das von der Stadt München angebotene Fördermodell „Vereinsförderung von selbst errichteten Vereinsheimen\” in Anspruch zu nehmen. Ein Jahr später, am 2. Juli 1984, wurde der Eschengarten in Eigenregie gebaut.",
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
                children: [
                  { type: "text", text: p.bodyText, format: 0, version: 1 },
                ],
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
      social: [
        { platform: "instagram", url: "https://www.instagram.com/svnord_ski/" },
      ],
    } as never,
  });

  await payload.updateGlobal({
    slug: "navigation",
    data: {
      header: [
        { label: "Verein", href: "/verein" },
        { label: "Fußball", href: "/fussball" },
        { label: "Sport", href: "/sport" },
        { label: "News", href: "/news" },
        { label: "Termine", href: "/termine" },
        { label: "Shop", href: "/shop" },
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
            {
              label: "Jugendförderverein",
              href: "/verein/jugendfoerderverein",
            },
          ],
        },
        {
          title: "Sport",
          links: [
            { label: "Fußball", href: "/fussball" },
            { label: "Volleyball", href: "/volleyball" },
            { label: "Gymnastik", href: "/gymnastik" },
            { label: "Ski", href: "/ski" },
            { label: "Esport", href: "/esport" },
          ],
        },
        {
          title: "Mitmachen",
          links: [
            { label: "Mitglied werden", href: "/mitgliedschaft" },
            { label: "Sponsoring", href: "/sponsoren" },
            { label: "Vereinsshop", href: "/shop" },
            { label: "FAQ", href: "/faq" },
          ],
        },
        {
          title: "Folgen",
          links: [
            {
              label: "Instagram",
              href: "https://www.instagram.com/svnord_lerchenau/",
            },
            {
              label: "Facebook",
              href: "https://www.facebook.com/svnordlerchenau/",
            },
          ],
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
        `## Chronik des SV Nord München-Lerchenau e.V.

**Inhalt:**

1. Vereinsgründung
2. Entwicklung von 1950 bis 1986
3. Entwicklung ab 1987 bis 2015
4. Vorstandschaften
5. Ehrentafel
6. Zeittafel

## 1. Vereinsgründung

Im Frühjahr 1947 bemühten sich einige sportfreudige Lerchenauer und Eggartler um die Gründung eines Sportvereins. Nach zähen Verhandlungen konnten sich beide Gruppen einigen, den Verein in der Lerchenau zu etablieren. Besonders Alfons Huber, Lorenz Gessler, Hans Brandhuber, Carl Jennerwein, Kleophas Lang und Johann Steiner trieben die Vereinsgründung voran.

Zur Gründungsversammlung am 15. Oktober 1947 im Gasthof Schützengarten trugen sich 38 Erwachsene und 22 Jugendliche ein. In den Vorstand gewählt wurden: 1. Vorstand Carl Jennerwein, 1. Kassier Adolf Gräf und 1. Schriftführer Karl Hornung. Es wurde beschlossen, den Verein SV Nord München-Lerchenau zu benennen.

### Gründungsmitglieder

Jennerwein Carl, Lang Kleophas, Gräf Adolf, Hornung Karl, Brandhuber Johann, Bothner Michael, Steiner Johann, Melz Wilhelm, Heiß Johann, Mährlein Robert, Maier Sebastian, Klingel Johann, Huber Alfons, Steiner Ludwig, Fetzer Jakob, Fetzer Konrad, Brandhuber Albert, Ebersdobler Josef, Buchner Hugo, Noder Walter, Gessler Jakob, Gessler Josef, Härtl Max, Koller Karl, Dietel Hebert, Wimmer Ewald, Remm Horst, Riepl Simon, Samec Tichomir, Kaiser Johann, Demal Johann, Neumaier Herbert, Klotz August, Bilokapic Andreas, Schmidbauer Michael, Spiegel Jakob, Schaflitzl Martin, Pertl Johann.

### Jugendliche bei der Gründungsveranstaltung

Bauer Sebastian, Detterbeck Wilhelm, Dinauer Rudolf, Dinauer Franz, Heldeis Heinz, Hilger Anton, Hilger Herbert, Ketterl Rudolf, Obermüller Wilhelm, Richter Rudolf.

Nach den damals in Kraft befindlichen alliierten Bestimmungen mussten bei der Vereinsgründung noch fünf Bürgen benannt werden, die mit dem persönlichen Vermögen hafteten: Martin Schaflitzl, Jakob Spiegel, Willi Melz, Kleophas Lang und Hans Huber. Die sportliche Leitung der Fußballabteilung übernahmen Johann Steiner, Herbert Dietel und Hugo Buchner.

Erste Aufgabe der Vereinsführung war die Beschaffung von Sportkleidung und Fußbällen. Die wirtschaftliche Lage war katastrophal, Not und Hunger prägten die Zeit. Dennoch wurden relativ schnell ein Spielball und zehn Trikots organisiert. Im Protokoll vom 04. März 1948 heißt es: *„Ein Kompensationsgeschäft zum Erhalt von zwei Bällen in der Gegenleistung einer Kuhhaut wurde ausfindig gemacht."*

Von der Deutschen Reichsbahn wurde im Frühjahr 1948 — durch gute Beziehungen und im Einvernehmen mit dem damaligen Pächter, Herrn Kötterl aus Feldmoching — ein Acker an der Heidelerchenstraße gepachtet. Mit enormem Arbeitseinsatz wurde das Gelände zu einem Sportplatz hergerichtet. Mehrere Tonnen Steine mussten aufgelesen werden. Am 01. August 1948 war es so weit: mit dem Rückspiel gegen den TSV Unterhaching wurde unser Sportplatz eingeweiht.

Nach der am 19. Juni 1948 bekanntgegebenen Währungsreform erhielt jeder Bürger am 20. Juni 1948 ein „Kopfgeld" von DM 40,--. Anfang der 50er Jahre wurden Fußballturniere organisiert und im Saal des Vereinsheims Schützengarten fanden Bunte Abende statt. Namhafte Künstler wie Fred Rauch, Helmut M. Backhaus, Adolf Gondrell, Roider Jackl, Georg Plädl, Michl Lang und Ida Schumacher hatten legendäre Auftritte.

## 2. Die Vereinsentwicklung zwischen 1950 und 1987

Einen wichtigen Beitrag für die Weiterentwicklung brachte der Neubau der Bezirkssportanlage an der Ebereschenstraße. Großen Anteil daran hatten das damalige Vorstandsmitglied Hans Späth und das Mitglied Georg Pickl. Am 26. Mai 1959 wurde die Anlage mit einem Fußballturnier eingeweiht. Die Jugendarbeit unter Karl Riepl trug erste Früchte — Jugendspieler wie Johann Baumgartner, Georg Albert, Josef Opel und Siegfried Dietel verstärkten die 1. Mannschaft.

1959 gründete Georg Seifert die Handballabteilung mit einer Damenmannschaft; ein Jahr später folgte unter Abteilungsleiter Hans Proll eine Herrenmannschaft. In den 60er Jahren entwickelte sich die Fußball-Jugendabteilung unter Johann Gottanker zu einer festen Größe — zwei Schülermannschaften und zwei Jugendmannschaften im Punktspielbetrieb, dazu Turniere und Freundschaftsspiele in anderen Städten.

### 1967 — Flutlichtanlagen in Eigenleistung erstellt

Bedingt durch den erhöhten Spiel- und Trainingsbetrieb wurden die Bedingungen immer schlechter. Da sich die Stadt München außerstande sah, eine Flutlichtanlage zu finanzieren, bauten die Mitglieder des SV Nord 1967 in Eigenleistung und aus Vereinskosten sowie Spenden die Flutlichtanlage selbst. Ebenfalls 1967 wurde auf Initiative von Frauen der Handball- und Fußballabteilung eine **Gymnastikabteilung** unter Annemarie Riepl gegründet.

Die 70er Jahre brachten der Jugendabteilung einen enormen Mitgliederzuwachs. Klaus Wersching hatte maßgeblichen Anteil an der Ausweitung; unter seiner Führung erreichten wir über 200 Jugendliche von der E- bis zur A-Jugend. Große Sportreisen führten nach Luxemburg, Straßburg, Enschede, Amsterdam, Hamburg und London; Höhepunkt war eine USA-Reise der B-Jugend. Unter Dieter Silberhorn ging es mit der D-Jugend nach Dietzenbach, Paris und Edingen; unter Kurt Tänzer zu Turnieren nach Dänemark und Ungarn.

Anlässlich der Olympischen Spiele 1972 benötigte die Stadt einen neuen Handball-Trainingsplatz — der Zuschlag fiel auf unsere Sportanlage. 1971 erhielten wir ein Handball-Kleinfeld mit Tartanbelag. Auch hier wurde 1975 in Eigenleistung eine Flutlichtanlage errichtet.

### 1978 — Neue Vereinsorganisation

Die Mitgliederzahl wuchs von 370 (1971) auf knapp 500 (1977). 1978 wurde das Einzugsverfahren für Beiträge eingeführt, 1979 die Satzung neu gefasst (Anerkennung als gemeinnütziger Verein), 1979 erschien die Vereinszeitung Nr. 1, 1981 wurde die Mitgliederverwaltung mit Hilfe einer Software der Stadtsparkasse München auf EDV umgestellt.

### 1980 — Erweiterung der Bezirkssportanlage

Die Bezirkssportanlage beherbergte inzwischen drei Vereine; es mangelte an Umkleideräumen, nur drei Rasenplätze standen zur Verfügung. 1979 genehmigte die Stadt den Bau eines Sandplatzes mit Flutlichtanlage — Fertigstellung Oktober 1980. 1984 gab die Stadt grünes Licht für eine Erweiterung: 1985 wurde nördlich der Anlage ein sandverfüllter Kunstrasenplatz mit Flutlichtanlage und ein Rasenspielfeld errichtet, 1986 fertiggestellt. 1986 begann die Erweiterung des Umkleidegebäudes, das 1987 eingeweiht werden konnte.

### 1984 — Vereinsheimbau in Eigenleistung

Unumstrittener Höhepunkt der Vereinsgeschichte war der Bau des Vereinsheims *Eschengarten* in Eigenregie, zusammen mit dem HuVT Edelweiß-Stamm und dem FC Eintracht München. Als 1982 die Stadt München eröffnete, sie könne keinen Vereinsheimbau finanzieren, war die Enttäuschung groß — doch 1983 beschloss der Stadtrat ein *Fördermodell zur Schaffung von selbsterrichteten Vereinsheimen*.

Auf Initiative von Horst Lanninger, damaliger 1. Vorstand des SV Nord, schlossen sich am 5. Mai 1983 die drei Vereine zur *Interessengemeinschaft Sportheimbau Lerchenau* zusammen. Am 25. April 1985 akzeptierte der Stadtrat die Bezuschussung in Höhe von DM 383.000,-. Baubeginn war am 21. Juni 1985. Fünf Monate später konnte Erich Ostermeier beim Richtfest über 150 Gäste begrüßen. Nach **15.000 freiwilligen Arbeitsstunden** der Mitglieder fand am 19. Juli 1986 die feierliche Eröffnung des Eschengartens statt.

## 3. Vereinsentwicklung ab 1987

Mit Fertigstellung des Eschengartens und dem Ausbau der Bezirkssportanlage verbesserten sich die sportlichen Rahmenbedingungen erheblich. Ein erster Schritt war die **Gründung der Ski-Abteilung im Herbst 1987** durch Karl Prölß und Christian Schäffer — ein Zuwachs von rund 100 Mitgliedern.

Sportlich entwickelte sich der Verein positiv: 1989 Aufstieg in die A-Klasse (Kreisliga) unter Trainer Morcinek, 1993 erstmaliger Aufstieg in die Bezirksliga unter Spielertrainer Aumüller. 1994 stieg die A-Jugend in die Bezirksliga Oberbayern auf.

1993 wurde zur Unterstützung der Fußball-Senioren ein Förderverein gegründet. 1996 bauten SV Nord, FC Eintracht und FSV Harthof gemeinsam einen großen Sport-Geräteschuppen. Die Mitgliederzahl wuchs von 500 (1971) über 766 (1996) auf 870 (1998); 1999 stellte Kurt Tänzer die Vereins-EDV auf neue PC-Software um. Seit 2006 ist der Verein unter *www.svnord.de* online.

### Angebot der Stadt: Bezirkssportanlage in Eigenregie (2004)

Der Stadtrat beschloss, die Bezirkssportanlagen den ansässigen Vereinen zu überlassen. Hintergrund waren Unterhaltskosten von 200.000 bis 250.000 € pro Jahr; die Stadt erhoffte sich eine Ersparnis von 100.000 bis 120.000 €. Mitte 2004 prüften SV Nord und FC Eintracht das Angebot gemeinsam — nach gründlicher Kostenrechnung lehnten beide ab, da das Risiko zu groß war. 2015 zeigte sich die Richtigkeit: neun Vereine stiegen ein, vier gaben die Anlagen mit sechsstelligen Schulden zurück.

### Versuch der Erweiterung (1998–2008)

1998 stellten SV Nord, FC Eintracht und FSV Harthof den Antrag, eine Teilfläche am Virginia-Depot als Sportfläche auszuweisen. 2002 kam Ernüchterung: das Planungsreferat hatte die Fläche längst als Magerrasenbiotop ausgewiesen. Weitere Gespräche 2003/04 blieben ergebnislos. 2005 bekundete BMW Interesse am Kompletterwerb der Kronprinz-Rupprecht-Kaserne und des Virginia-Depots. Politische Interessen verhinderten 2008 das Ziel endgültig.

## 4. Vorstandschaften

Die Amtszeiten der Vorstandschaft sind chronologisch in der Vereinsakte dokumentiert. Aktuelle Vorstandschaft siehe *Verein → Vorstand*.

## 5. Ehrentafel

### Ehren-Vorstände

**Kleophas Lang** (1914–1992) — Gründungsmitglied und Mäzen. 2. Vorstand bis 1948, 1. Vorstand 1950–1958. 1959 zum Ehrenvorstand ernannt.

**Horst Lanninger** — Mitglied ab 01.01.1963 (BSG Hurth). 2. Vorstand 1974–1979, 1. Vorstand 1980–1990. Seit 1986 im Vorstand der Vereins-Interessengemeinschaft Lerchenau. 1997 zum Ehrenvorstand ernannt. 9 Spiele in der 1. Mannschaft, 2 Tore.

### Ehren-Mitglieder

**Anna Schaflitzl** (1905–1990) — Langjährige Wirtin des Vereinslokals Schützengarten. Unterstützte ab 1947 vor allem Jugendliche mit Speisen und Getränken. 1950 zum Ehrenmitglied ernannt.

**Josef Gerber** (1903–1986) — Mitglied ab 1949. Aktiver Schiedsrichter 1949–1964. 1980 zum Ehrenmitglied ernannt; 1984 Ehrenmitglied der Münchner Schiedsrichtervereinigung.

**Karl Riepl** (1921–2007) — Mitglied ab 01.01.1948. Fußball-Jugendleiter 1951/52, Fußball-Abteilungsleiter 1955–1958, Vereinskassier 1956–1959 und 1967–1969, Chronist der Fußballabteilung 1948–1996. 165 Spiele in der 1. Mannschaft, 4 Tore. 1980 Ehrenmitglied.

**Annemarie Riepl** — Mitglied ab 01.11.1967. Gründerin der Gymnastikabteilung 1967, Abteilungsleiterin bis 1995. 1994 Ehrenmitglied.

**Max Härtl** (1927–2011) — Gründungsmitglied. 118 Spiele in der 1. Mannschaft, 5 Tore. 1997 wegen ununterbrochener 50-jähriger Mitgliedschaft Ehrenmitglied.

**Johann Pertl** (1927–2014) — Gründungsmitglied. 1997 wegen ununterbrochener 50-jähriger Mitgliedschaft Ehrenmitglied.

**Simon Riepl** (1923–2011) — Gründungsmitglied. 87 Spiele in der 1. Mannschaft, 4 Tore. 1997 Ehrenmitglied.

**Kurt Tänzer** — Mitglied ab November 1967. 1970–1973 A-Jugendtrainer, 1973–1975 Trainer der 1. Mannschaft, 1976–1979 AL Fußball, 1979–1982 A+B-Jugendtrainer, 1980–1981 2. Vorstand, 1982–2007 Schiedsrichter, 1982–1988 Jugendleiter, **1990–1999 1. Vorstand**, 1995–2007 Schiedsrichter-Obmann. 2007 zum 60-jährigen Vereinsjubiläum zum Ehrenmitglied ernannt.

**Roswitha Wennrich** — Mitglied ab November 1967. 1975 Gründerin der Damenfußball-Abteilung, Abteilungsleiterin bis 1985. Kassier des SV Nord 1980–1993. 2007 Ehrenmitglied.

**Horst Mauler** — Kam 1968 als 13-Jähriger zum SV Nord. 1970–2007 ununterbrochen Jugendtrainer aller Altersklassen, seither weiterhin Trainer und Betreuer. 1990 Verbandsehrenzeichen des BFV in Gold. 1995–2005 aktiver Schiedsrichter. 1977 silberne, 1996 goldene Vereins-Ehrennadel. 2007 Ehrenmitglied.

**Sebastian Bauer** — Gründungsmitglied. 1957 Schiedsrichterprüfung, 1959–2004 Schiedsrichter, 1964–1994 Schiedsrichter-Obmann. 2007 Ehrenmitglied wegen 60-jähriger Mitgliedschaft.

**Rudolf Richter** — Gründungsmitglied. 165 Spiele in der 1. Mannschaft (davon fünfmal als Torwart!), 43 Tore. 2007 Ehrenmitglied.

**Heinz Heldeis** — Gründungsmitglied. 29 Spiele in der 1. Mannschaft, 3 Tore. 2007 Ehrenmitglied.

## 6. Zeittafel

- **15.10.1947** — Vereinsgründung im Gasthof Schützengarten. Gründung der Fußballabteilung.
- **02.05.1948** — Erstes Freundschaftsspiel gegen SC Lochhausen (2:3).
- **01.08.1948** — Sportplatzeröffnung Heidelerchenstraße.
- **05.09.1948** — 1. Punktspiel gegen Weiß Blau München (2:3).
- **1949–1953** — Vorübergehend eine Jugend- und eine Schülermannschaft im Spielbetrieb.
- **1956** — Neuaufbau der Fußball-Jugendabteilung.
- **1959** — Umzug auf die Bezirkssportanlage Ebereschenstraße 15. Gründung der Handballabteilung.
- **01.01.1963** — Anschluss der BSG Hurth an den SV Nord.
- **1965** — Auflösung der Damen-Handballmannschaft.
- **1966** — Eintrag ins Vereinsregister: *SV Nord München-Lerchenau e.V.*
- **1967** — Gründung der Gymnastikabteilung. Trainingsplatz-Flutlichtanlage in Eigenleistung.
- **1971** — Neubau eines Tartan-Kleinhandballfeldes.
- **1975** — Gründung der Abteilung Damenfußball. Flutlichtanlage Handball-Kleinfeld in Eigenleistung.
- **1979** — Einzugsverfahren Beiträge. Neue Satzung, Gemeinnützigkeit anerkannt. Vereinszeitung Nr. 1.
- **1980** — Neubau Sandplatz mit Flutlichtanlage.
- **1981** — Umstellung der Vereinsverwaltung auf EDV.
- **03.05.1983** — Gründung der *Interessengemeinschaft Sportheimbau*.
- **1984** — Erweiterung der Bezirkssportanlage nach Norden (Kunstrasen).
- **02.07.1984** — Gründung der *Vereins-Interessengemeinschaft Lerchenau e.V. (VIG)*.
- **01.06.1985** — Baubeginn Vereinsheim *Eschengarten*.
- **1985** — Auflösung der Abteilung Damenfußball.
- **19.07.1986** — Eröffnung Vereinsheim *Eschengarten*.
- **1987** — Erweiterung des Umkleidegebäudes.
- **27.09.1987** — Gründung der Skiabteilung.
- **1990** — Layout der Vereinszeitung auf Computer umgestellt.
- **1991** — Gründung einer Multisportabteilung (Volleyball, Badminton …).
- **06.05.1992** — Gründung der SV Nord-Förderer (1. Mannschaft Fußball Senioren).
- **1996** — Gymnastikabteilung gründet *Mädchenturnen* (5–9 Jahre).
- **1998** — Handballabteilung meldet eine Mädchen-Jugendmannschaft an.
- **2001** — Handballabteilung meldet die Mädchen-Jugendmannschaft wieder ab.
- **2002** — Gymnastikabteilung meldet *Mädchenturnen* wieder ab. Bau eines Geräteschuppens mit FC Eintracht und Harthof.
- **2004** — Kunstrasen-Spielfeld erneuert.
- **2005** — Der SV Nord ist unter *www.svnord.de* im Internet vertreten.
- **2009** — Nach 30 Jahren wurde die Vereinszeitung eingestellt.
- **2011** — Hauptplatz komplett erneuert.
- **2012** — Nach 20 Jahren Unterstützung wurde der SV Nord-Förderclub aufgelöst.
- **2013** — Abspaltung der Skiabteilung vom Hauptverein.
- **2014** — Auflösung der Handballabteilung (seit 1959). Platzwartwohnung wegen Unbewohnbarkeit gesperrt.
- **2015** — Mitgliederzahl sinkt auf 600 — Folge allgemeiner Unzufriedenheit und der Auflösung von Handball und Ski.`,
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
      supportBullets: [
        { text: "Zuzahlung zu Ausflügen und Kurzreisen" },
        {
          text: "Zuzahlung zur Ausgestaltung von Feierlichkeiten der Nordjugend",
        },
        {
          text: "Zuzahlung zur Unterstützung von Aktivitäten und Trainingsbetrieb",
        },
      ],
      minAnnualFee: 24,
      formPdfUrl: "/downloads/jfv-beitrittserklaerung.pdf",
      primaryContactEmail: "nordjugend@gmx.de",
      boardMemberName: "Ergin Piker",
      boardRole: "1. Vorstand",
      boardContactEmail: "ergin.piker@svnord.de",
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
        `## 1. Verantwortlicher

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist:

**SV Nord München-Lerchenau e.V.**
Ebereschenstraße 17
80935 München
Deutschland

Telefon: 0172 2392919
E-Mail: info@svnord.de

Vertreten durch den 1. Vorstand Ralf Kirmeyer.
Eingetragen im Vereinsregister beim Amtsgericht München unter VR 6924.

## 2. Allgemeine Hinweise zur Datenverarbeitung

### Umfang der Verarbeitung personenbezogener Daten

Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten unserer Nutzer erfolgt regelmäßig nur nach Einwilligung des Nutzers. Eine Ausnahme gilt in solchen Fällen, in denen eine vorherige Einholung einer Einwilligung aus tatsächlichen Gründen nicht möglich ist und die Verarbeitung der Daten durch gesetzliche Vorschriften gestattet ist.

### Rechtsgrundlagen der Datenverarbeitung

Soweit wir für Verarbeitungsvorgänge personenbezogener Daten eine Einwilligung der betroffenen Person einholen, dient Art. 6 Abs. 1 lit. a DSGVO als Rechtsgrundlage. Bei der Verarbeitung von personenbezogenen Daten, die zur Erfüllung eines Vertrages erforderlich ist, dient Art. 6 Abs. 1 lit. b DSGVO als Rechtsgrundlage. Dies gilt auch für Verarbeitungsvorgänge, die zur Durchführung vorvertraglicher Maßnahmen erforderlich sind. Soweit eine Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung erforderlich ist, der unser Verein unterliegt, dient Art. 6 Abs. 1 lit. c DSGVO als Rechtsgrundlage. Ist die Verarbeitung zur Wahrung eines berechtigten Interesses unseres Vereins oder eines Dritten erforderlich und überwiegen die Interessen, Grundrechte und Grundfreiheiten des Betroffenen das erstgenannte Interesse nicht, so dient Art. 6 Abs. 1 lit. f DSGVO als Rechtsgrundlage.

### Datenlöschung und Speicherdauer

Die personenbezogenen Daten der betroffenen Person werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt. Eine Speicherung kann darüber hinaus erfolgen, wenn dies durch den europäischen oder nationalen Gesetzgeber in unionsrechtlichen Verordnungen, Gesetzen oder sonstigen Vorschriften, denen der Verantwortliche unterliegt, vorgesehen wurde. Eine Sperrung oder Löschung der Daten erfolgt auch dann, wenn eine durch die genannten Normen vorgeschriebene Speicherfrist abläuft, es sei denn, dass eine Erforderlichkeit zur weiteren Speicherung der Daten für einen Vertragsabschluss oder eine Vertragserfüllung besteht.

## 3. Bereitstellung der Website und Erstellung von Logfiles

Bei jedem Aufruf unserer Internetseite erfasst unser System automatisiert Daten und Informationen vom Computersystem des aufrufenden Rechners.

Folgende Daten werden hierbei erhoben:

- IP-Adresse des Nutzers (gekürzt)
- Datum und Uhrzeit des Zugriffs
- Zeitzonendifferenz zur Greenwich Mean Time (GMT)
- Inhalt der Anforderung (konkrete Seite)
- Zugriffsstatus / HTTP-Statuscode
- Jeweils übertragene Datenmenge
- Website, von der die Anforderung kommt (Referrer)
- Browser, Betriebssystem, Sprache und Version der Browsersoftware

Die Speicherung in Logfiles erfolgt, um die Funktionsfähigkeit der Website sicherzustellen. Zudem dienen uns die Daten zur Optimierung der Website und zur Sicherstellung der Sicherheit unserer informationstechnischen Systeme. Rechtsgrundlage für die vorübergehende Speicherung der Daten und der Logfiles ist Art. 6 Abs. 1 lit. f DSGVO.

Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind. Im Falle der Erfassung der Daten zur Bereitstellung der Website ist dies der Fall, wenn die jeweilige Sitzung beendet ist. Im Falle der Speicherung der Daten in Logfiles ist dies nach spätestens 14 Tagen der Fall.

## 4. Hosting und Content Delivery Network

### Vercel

Diese Website wird bei **Vercel Inc.**, 340 S Lemon Ave #4133, Walnut, CA 91789, USA, gehostet. Vercel verarbeitet Zugriffsdaten (siehe Abschnitt 3) zur Bereitstellung der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Vercel verarbeitet Daten ggf. in den USA; die Datenübermittlung ist durch Standardvertragsklauseln und die DPF-Zertifizierung von Vercel abgesichert.

Weitere Informationen: [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy)

### Neon (Datenbank)

Inhalte unserer Website sowie Daten aus dem Mitgliedsbereich werden in einer Postgres-Datenbank bei **Neon Inc.**, 2261 Market Street #4668, San Francisco, CA 94114, USA, gespeichert. Neon verarbeitet Daten ggf. in der EU (Frankfurt am Main). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

Weitere Informationen: [neon.tech/privacy-policy](https://neon.tech/privacy-policy)

## 5. Cookies

Unsere Website verwendet funktional notwendige Cookies. Diese Cookies sind erforderlich, um bestimmte Funktionen bereitzustellen (z. B. Navigation, Seitenspeicher). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; die Verwendung notwendiger Cookies ist nach § 25 Abs. 2 Nr. 2 TTDSG ohne Einwilligung zulässig.

Wir setzen **keine Tracking- oder Analyse-Cookies** und **keine Marketing-Cookies** ein. Drittanbieter-Cookies werden nur dann geladen, wenn Sie eingebettete Inhalte (z. B. BFV-Spielplan, FuPa-Block) aktiv aufrufen.

## 6. Kontaktformular und E-Mail-Kontakt

Auf unserer Website befindet sich ein Kontaktformular, welches für die elektronische Kontaktaufnahme genutzt werden kann. Nimmt ein Nutzer diese Möglichkeit wahr, so werden die im Eingabeformular eingegebenen Daten an uns übermittelt und gespeichert:

- Name
- E-Mail-Adresse
- Telefonnummer (optional)
- Nachricht

Für die Verarbeitung der Daten wird im Rahmen des Absendevorgangs Ihre Einwilligung eingeholt und auf diese Datenschutzerklärung verwiesen.

Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Daten werden ausschließlich für die Verarbeitung der Konversation verwendet.

Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind. Für die personenbezogenen Daten aus der Eingabemaske des Kontaktformulars ist dies dann der Fall, wenn die jeweilige Konversation mit dem Nutzer beendet ist.

### Resend (E-Mail-Versand)

Zum technischen Versand von Kontaktformular-Benachrichtigungen nutzen wir **Resend**, betrieben von Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA. Resend verarbeitet dabei Absender-, Empfänger- und Inhaltsdaten der E-Mail. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Datenübermittlung in die USA ist durch Standardvertragsklauseln abgesichert.

Weitere Informationen: [resend.com/legal/privacy-policy](https://resend.com/legal/privacy-policy)

## 7. Mitgliederverwaltung

Zur Mitgliederverwaltung erheben und verarbeiten wir folgende personenbezogene Daten:

- Name, Vorname, Geburtsdatum
- Anschrift, Telefonnummer, E-Mail-Adresse
- Bankverbindung (IBAN) für Beitragseinzug
- Abteilungs- und Mannschaftszugehörigkeit
- Bei minderjährigen Mitgliedern: Kontaktdaten der Erziehungsberechtigten

Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. Mitgliedschaftsvertrag) sowie Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Aufbewahrungspflichten).

Mitgliedsdaten werden gelöscht, sobald die Mitgliedschaft endet und gesetzliche Aufbewahrungspflichten (v. a. § 147 AO, § 257 HGB, max. 10 Jahre) erfüllt sind.

## 8. Eingebettete Inhalte Dritter

Auf einzelnen Seiten binden wir Daten folgender Drittanbieter ein:

### BFV (Bayerischer Fußball-Verband)

Spielpläne, Tabellen und Kaderlisten beziehen wir über die öffentliche Widget-API des BFV (widget-prod.bfv.de). Beim Aufruf der entsprechenden Seiten kann Ihre IP-Adresse an den BFV übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

Datenschutzerklärung des BFV: [bfv.de/datenschutz](https://www.bfv.de/datenschutz)

### FuPa

Spielerprofile und Vereinsdaten beziehen wir über die öffentliche API von **FuPa GmbH**, Bärenkampallee 14, 32657 Lemgo. Beim Aufruf der entsprechenden Seiten kann Ihre IP-Adresse an FuPa übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

Datenschutzerklärung von FuPa: [fupa.net/datenschutz](https://www.fupa.net/datenschutz)

### Kartenanbieter (MapLibre / OpenFreeMap)

Zur Darstellung der Karte im Vereinsheim- und Kontakt-Bereich nutzen wir **MapLibre GL JS** mit Kacheldaten von **OpenFreeMap** (Kartendaten © OpenStreetMap-Mitwirkende). Beim Laden der Karte wird Ihre IP-Adresse an den Kacheldienst übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

### Social-Media-Verlinkungen

Im Footer verlinken wir auf unsere Social-Media-Präsenzen (Instagram, Facebook). Bei einem Klick werden Sie zur jeweiligen Plattform weitergeleitet und es gelten deren Datenschutzbestimmungen. **Wir binden keine Social-Plugins ein**, die bereits beim Laden der Seite Daten übertragen.

## 9. Rechte der betroffenen Person

Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener i. S. d. DSGVO und es stehen Ihnen folgende Rechte gegenüber dem Verantwortlichen zu:

- **Recht auf Auskunft** (Art. 15 DSGVO)
- **Recht auf Berichtigung** (Art. 16 DSGVO)
- **Recht auf Löschung** (Art. 17 DSGVO)
- **Recht auf Einschränkung der Verarbeitung** (Art. 18 DSGVO)
- **Recht auf Datenübertragbarkeit** (Art. 20 DSGVO)
- **Widerspruchsrecht** gegen Verarbeitungen nach Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)
- **Widerrufsrecht** bei Einwilligungen (Art. 7 Abs. 3 DSGVO)

Zur Ausübung dieser Rechte genügt eine formlose Mitteilung an info@svnord.de.

### Beschwerderecht bei der Aufsichtsbehörde

Sie haben das Recht, sich jederzeit bei einer Aufsichtsbehörde, insbesondere im Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts, zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die DSGVO verstößt.

Zuständige Aufsichtsbehörde für Bayern:

**Bayerisches Landesamt für Datenschutzaufsicht**
Promenade 18, 91522 Ansbach
Telefon: 0981 180093-0
Web: [lda.bayern.de](https://www.lda.bayern.de)

## 10. SSL-/TLS-Verschlüsselung

Diese Seite nutzt aus Gründen der Sicherheit und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-/TLS-Verschlüsselung. Sie erkennen eine verschlüsselte Verbindung daran, dass die Adresszeile des Browsers mit „https://" beginnt und am Schloss-Symbol in Ihrer Browserzeile.

## 11. Aktualität und Änderung dieser Datenschutzerklärung

Diese Datenschutzerklärung ist aktuell gültig. Durch die Weiterentwicklung unserer Website und Angebote oder aufgrund geänderter gesetzlicher beziehungsweise behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Datenschutzerklärung kann jederzeit auf dieser Seite abgerufen werden.`,
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

Wir trainieren jeden Montag und Mittwoch von 19:00 bis 20:00 Uhr in der Waldmeisterschule. Am Montag trainieren nur unsere Frauen, am Mittwoch können dann auch gerne Männer am Training teilnehmen. In den Schulferien ist kein Training.

## Gemeinsam unterwegs

Neben der sportlichen Tätigkeit unternehmen wir auch jedes Jahr einen Ausflug. Die letzten drei Jahre waren wir in Paris, Hamburg und Nizza.

## Mitmachen

Habt ihr Lust bekommen? Meldet euch gerne bei uns — wir freuen uns!

*Eure SV Nord Gymnastik Mannschaft*`,
    trainers: [
      {
        name: "Dr. Nicole Abbrederis",
        role: "Trainerin Gymnastik",
      },
      {
        name: "Simone Roth",
        role: "Trainerin Gymnastik",
      },
    ],
  });
  await ensureTeamPhoto(payload, {
    teamSlug: slug("Gymnastik"),
    filename: "gymnastik-hero.jpg",
    alt: "SV Nord Gymnastik-Abteilung",
    filePath: path.resolve(process.cwd(), "tmp/live-sport-hero/gymnastik.jpg"),
  });

  await populateSportSection(payload, {
    sport: "volleyball",
    teamName: "Volleyball",
    descriptionMd: `## Willkommen bei der Volleyball-Abteilung

Unser Team ist zwischen 30 und 75 Jahren alt — Gemeinschaft und Spaß am Spiel stehen bei uns im Vordergrund. Wir treffen uns seit 1984 als Familienvolleyballer und wurden dann beim SV Nord als eigene Abteilung aufgenommen.

## Training

Wir spielen jeden Freitag von 19:00 bis 21:00 Uhr in der Waldmeisterschule. In den Schulferien ist kein Training.

## Mitmachen

Wenn Ihr Lust habt Volleyball zu spielen, meldet Euch doch gerne bei uns. Wir freuen uns auf euch!

*Euer SV Nord Volleyball Team*`,
    trainers: [],
  });
  await ensureTeamPhoto(payload, {
    teamSlug: slug("Volleyball"),
    filename: "volleyball-hero.jpg",
    alt: "SV Nord Volleyball-Abteilung",
    filePath: path.resolve(process.cwd(), "tmp/live-sport-hero/volleyball.jpg"),
  });

  await populateSportSection(payload, {
    sport: "ski",
    teamName: "Ski",
    descriptionMd: `## Willkommen bei der Ski-Abteilung

Seit mehr als 20 Jahren ist die Ski-Abteilung fester Bestandteil des SV Nord. Mit ausgebildeten und jungen Skilehrern wollen wir jedem Interessenten den Spaß am Skifahren näher bringen. Vom motivierten Neueinsteiger bis hin zum routinierten Könner — in der Ski-Abteilung ist für jeden Pistenfreund ein Platz frei.

Wir freuen uns auf Dich. *Eure SV Nord Ski-Crew.*`,
    trainers: [
      { name: "Bini Hafner", role: "1. Vorsitzender · Skilehrer" },
      { name: "Tobias Tins", role: "2. Vorsitzender · Skilehrer" },
      { name: "Theresa Hafner", role: "Schriftführerin · Skilehrerin" },
      { name: "Melina Stenger", role: "Schriftführerin · Skilehrerin" },
      { name: "Fabian Falk", role: "Skilehrer" },
      { name: "Christoph Hafner", role: "Skilehrer" },
      { name: "David Wünsch", role: "Skilehrer" },
      { name: "Elias Lilli", role: "Skilehrer" },
      { name: "Franzi Wagner", role: "Skilehrerin" },
      { name: "Jonas Lilli", role: "Skilehrer" },
      { name: "Laura Wünsch", role: "Skilehrerin" },
      { name: "Luisa Seidl", role: "Skilehrerin" },
    ],
  });
  await ensureTeamPhoto(payload, {
    teamSlug: slug("Ski"),
    filename: "ski-hero.jpg",
    alt: "SV Nord Ski-Abteilung",
    filePath: path.resolve(process.cwd(), "tmp/live-sport-hero/ski.jpg"),
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
      {
        name: "Vincenzo Tropeano",
        role: "Schiedsrichter-Obmann · Bezirksliga",
      },
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
