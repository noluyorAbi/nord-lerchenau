/**
 * Schreibt die mitgelieferten Schlagworte und Zahlen der Abteilungsseiten in
 * das CMS, damit der Verein sie im Editor vorfindet statt leere Felder.
 *
 * Es gibt nur eine Quelle, `lib/abteilungen-defaults.ts`. Dieses Skript hat
 * bewusst keine eigene Werteliste: zwei Fassungen derselben Zahl sind der
 * Fehler, an dem die Rechtstexte auseinandergelaufen sind.
 *
 * Bereits gepflegte Werte werden NICHT ueberschrieben. Wer im Admin eine Zahl
 * korrigiert hat, darf sie nicht durch einen zweiten Lauf verlieren.
 *
 * Lauf (nach scripts/sql/2026-08-27-abteilungs-zahlen.sql, vor dem Deploy):
 *   bun run seed-abteilungs-zahlen
 *
 * Nur ueber dieses package.json-Skript, nie als blosses `bun run scripts/...`:
 * es setzt PAYLOAD_DISABLE_PUSH=true. Ohne die Variable startet Payload mit
 * dem Drizzle-Push, vergleicht die Konfiguration mit der Produktionsdatenbank
 * und fragt bei jeder Abweichung interaktiv nach. Eine falsche Antwort benennt
 * dort eine bestehende Tabelle um. Dieselbe Absicherung tragen
 * `import-static-images` und `scripts/import-news.ts`.
 */
import { getPayload } from "payload";

import {
  ABTEILUNGEN_DEFAULTS,
  type SportKey,
} from "@/lib/abteilungen-defaults";
import { shouldPreserveExistingRows } from "@/lib/abteilungen-werte";
import config from "@/payload.config";

async function main() {
  const payload = await getPayload({ config });

  for (const [sport, defaults] of Object.entries(ABTEILUNGEN_DEFAULTS) as Array<
    [SportKey, (typeof ABTEILUNGEN_DEFAULTS)[SportKey]]
  >) {
    const found = await payload.find({
      collection: "teams",
      where: { sport: { equals: sport } },
      limit: 1,
      depth: 0,
    });

    const team = found.docs[0];
    if (!team) {
      console.warn(`… ${sport}: kein Team-Eintrag gefunden, übersprungen`);
      continue;
    }

    const hasPills = shouldPreserveExistingRows(team.pills);
    const hasStats = shouldPreserveExistingRows(team.stats);
    if (hasPills && hasStats) {
      console.log(`· ${sport}: bereits gepflegt, unverändert`);
      continue;
    }

    await payload.update({
      collection: "teams",
      id: team.id,
      data: {
        ...(hasPills
          ? {}
          : { pills: defaults.pills.map((text) => ({ text })) }),
        ...(hasStats ? {} : { stats: defaults.stats }),
      },
    });
    console.log(
      `✓ ${sport}: ${hasPills ? "" : "Schlagworte "}${
        hasStats ? "" : "Zahlen "
      }gesetzt`,
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
