import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { lexicalHasContent } from "@/lib/lexical-text";

import { LegalRichText } from "./LegalRichText";
import { LegalSections } from "./LegalSections";
import type { LegalSection } from "./types";

/**
 * Der Rechtstext der Seite, aus dem CMS wenn dort einer steht, sonst der
 * mitgelieferte.
 *
 * Der Rueckfall ist keine Bequemlichkeit, er ist die Sicherung. Impressum und
 * Datenschutzerklaerung sind Pflichtseiten: sie duerfen weder leer sein, weil
 * ein Deploy vor dem Befuellen des CMS lag, noch weil jemand das Feld im
 * Editor versehentlich geleert hat. `lexicalHasContent` erkennt dabei auch den
 * leeren Absatz, den ein geleertes Richtext-Feld hinterlaesst.
 */
export function LegalBody({
  cms,
  fallback,
}: {
  cms: unknown;
  fallback: LegalSection[];
}) {
  if (lexicalHasContent(cms)) {
    return <LegalRichText data={cms as SerializedEditorState} />;
  }
  return <LegalSections sections={fallback} />;
}
