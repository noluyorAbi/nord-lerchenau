/**
 * Schreibt die Rechtstexte aus dem Code in das `legal-pages`-Global.
 *
 * Bis hierher hielt dieses Skript eine eigene Markdown-Kopie beider Texte.
 * Diese Kopie ist gegen die Fassung, die die Seite wirklich rendert
 * (`app/(frontend)/*\/_content.ts`), auseinandergelaufen: die Fassung, die am
 * 19.07.2026 in die Produktionsdatenbank geschrieben wurde, kennt den
 * Abschnitt zum KI-Assistenten nicht, und beruft sich im Impressum noch auf
 * eine aeltere Paragraphenlage. Zwei Quellen fuer denselben Rechtstext sind
 * bei einer Datenschutzerklaerung der teure Fehler.
 *
 * Deshalb gibt es hier keinen Text mehr, nur noch die Uebersetzung der
 * gerenderten Abschnitte nach Lexical.
 *
 * Lauf: bun run scripts/update-legal-pages.ts
 */
import { getPayload } from "payload";

import { datenschutzSections } from "@/app/(frontend)/datenschutz/_content";
import { impressumSections } from "@/app/(frontend)/impressum/_content";
import { clubAddress, primaryAddressOf } from "@/lib/club-address";
import { legalSectionsToLexical } from "@/lib/legal-lexical";
import config from "@/payload.config";

async function main() {
  const payload = await getPayload({ config });

  // Dieselbe Anschrift, die die Seite verwendet: sonst steht im CMS-Text eine
  // andere Adresse als im Adressblock daneben.
  const contact = await payload.findGlobal({ slug: "contact-info" });
  const address = clubAddress(primaryAddressOf(contact));

  await payload.updateGlobal({
    slug: "legal-pages",
    data: {
      impressumBody: legalSectionsToLexical(impressumSections(address)),
      datenschutzBody: legalSectionsToLexical(datenschutzSections(address)),
    } as never,
  });

  console.log("✓ legal-pages aktualisiert (Impressum + Datenschutz)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
