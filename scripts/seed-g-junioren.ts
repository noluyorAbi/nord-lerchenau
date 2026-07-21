import fs from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "@/payload.config";

/**
 * Targeted, idempotent update for the G-Junioren team only.
 *
 * Unlike the full `seed.ts`, this touches nothing else, so it is safe to run
 * against production without reverting any content the club edited in the CMS.
 * It: (1) upserts the G-Junioren team's core fields + description, (2) creates
 * and links the two trainers, (3) uploads the squad photo into Media and sets
 * it as the team photo.
 */

type LexNode = Record<string, unknown>;

function description(): { root: LexNode } {
  const text = (t: string): LexNode => ({
    type: "text",
    text: t,
    format: 0,
    version: 1,
    detail: 0,
    mode: "normal",
    style: "",
  });
  const heading = (tag: "h2", t: string): LexNode => ({
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [text(t)],
  });
  const paragraph = (t: string): LexNode => ({
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [text(t)],
  });
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        heading("h2", "G-Junioren"),
        paragraph(
          "Unsere Jüngsten mit ganz viel Spaß am Ball. Spielerischer Einstieg, Teamgeist und jede Menge Freude am Fußball stehen bei uns im Vordergrund.",
        ),
        heading("h2", "Probetraining"),
        paragraph(
          "Lust auf ein Probetraining bei den G-Junioren? Komm vorbei und werde Teil unseres Teams! Wenn du Spaß am Fußball hast und neue Freunde finden möchtest, bist du bei uns genau richtig.",
        ),
        paragraph(
          "So einfach geht es: Schreib uns einfach eine E-Mail an info@svnord.de. Wir melden uns schnell bei dir mit dem passenden Termin, dem Treffpunkt und allen wichtigen Infos.",
        ),
        paragraph(
          "Das musst du mitbringen: Bitte bring deine eigene Sportkleidung und Schienbeinschoner mit. Wir freuen uns auf dich!",
        ),
      ],
    },
  };
}

async function main() {
  const payload = await getPayload({ config });

  // 1. Trainers (create if missing).
  const trainers = [
    {
      name: "Stephan Krusche",
      role: "Trainer G-Junioren",
      phone: "0171 1437521",
    },
    {
      name: "Sebastian Freund",
      role: "Trainer G-Junioren",
      phone: "0151 14996625",
    },
  ];
  const trainerIds: Array<string | number> = [];
  for (let i = 0; i < trainers.length; i++) {
    const t = trainers[i]!;
    const existing = await payload.find({
      collection: "people",
      where: { name: { equals: t.name } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      const id = existing.docs[0]!.id;
      await payload.update({
        collection: "people",
        id,
        data: {
          role: t.role,
          function: "trainer",
          phone: t.phone,
        } as never,
      });
      trainerIds.push(id);
      console.log(`✓ Trainer updated: ${t.name}`);
    } else {
      const created = await payload.create({
        collection: "people",
        data: {
          name: t.name,
          role: t.role,
          function: "trainer",
          phone: t.phone,
          order: 200 + i,
        } as never,
      });
      trainerIds.push(created.id);
      console.log(`✓ Trainer created: ${t.name}`);
    }
  }

  // 2. Team photo → Media (match on basename so reruns don't duplicate).
  const filename = "g-junioren.jpg";
  const filePath = path.resolve(process.cwd(), "public/teams/g-junioren.jpg");
  const existingMedia = await payload.find({
    collection: "media",
    where: { filename: { like: filename.replace(/\.[^.]+$/, "") } },
    limit: 1,
  });
  let mediaId: string | number;
  if (existingMedia.docs.length > 0) {
    mediaId = existingMedia.docs[0]!.id;
    console.log("✓ Team photo already in Media");
  } else {
    const buf = await fs.readFile(filePath);
    const created = await payload.create({
      collection: "media",
      data: { alt: "G-Junioren des SV Nord München-Lerchenau" } as never,
      file: {
        data: buf,
        mimetype: "image/jpeg",
        name: filename,
        size: buf.byteLength,
      },
    });
    mediaId = created.id;
    console.log("✓ Team photo uploaded to Media");
  }

  // 3. Team (upsert by slug).
  const teamData = {
    name: "G-Junioren",
    slug: "g-junioren",
    sport: "fussball",
    category: "junioren",
    ageGroup: "G-Junioren",
    order: 21,
    season: "2026/27",
    league: "Trainingsgruppe · Nachwuchs",
    description: description(),
    trainers: trainerIds,
    photo: mediaId,
  };
  const existingTeam = await payload.find({
    collection: "teams",
    where: { slug: { equals: "g-junioren" } },
    limit: 1,
  });
  if (existingTeam.docs.length > 0) {
    await payload.update({
      collection: "teams",
      id: existingTeam.docs[0]!.id,
      data: teamData as never,
    });
    console.log("✓ G-Junioren team updated");
  } else {
    await payload.create({
      collection: "teams",
      data: teamData as never,
    });
    console.log("✓ G-Junioren team created");
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
