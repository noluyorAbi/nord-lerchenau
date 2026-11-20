/**
 * Setzt die Angaben in die offizielle BFV-Vorlage ein. Läuft im Browser: Die
 * Vorlage kommt von unserer eigenen Domain, die Angaben verlassen das Gerät
 * nicht. pdf-lib wird erst beim Absenden geladen.
 */

import {
  ANTRAG_TEMPLATE,
  buildAntragFields,
  type AntragData,
  type AntragFields,
} from "@/lib/spielerpass";

export async function fillAntragPdf(
  data: AntragData,
): Promise<{ bytes: Uint8Array; fields: AntragFields }> {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");

  const res = await fetch(ANTRAG_TEMPLATE[data.kind]);
  if (!res.ok) throw new Error("Vorlage konnte nicht geladen werden.");
  const pdf = await PDFDocument.load(await res.arrayBuffer());
  const form = pdf.getForm();
  const fields = buildAntragFields(data);

  for (const [name, value] of Object.entries(fields.text)) {
    form.getTextField(name).setText(value);
  }
  for (const name of fields.checks) form.getCheckBox(name).check();

  // Eigene Schrift für alle Felder, damit Umlaute überall gleich aussehen.
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(font);

  return { bytes: await pdf.save(), fields };
}
