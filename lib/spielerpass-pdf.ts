/**
 * Setzt die Angaben und Unterschriften in die offizielle BFV-Vorlage ein.
 * Läuft im Browser: Vorlage und Schrift kommen von unserer eigenen Domain, die
 * Angaben verlassen das Gerät nicht. pdf-lib wird erst beim Absenden geladen.
 */

import { isTransfer } from "@/lib/spielerpass-options";
import {
  ANTRAG_TEMPLATE,
  CONSENT_SIGNATURE_BOX,
  SIGNATURE_BOXES,
  buildAntragFields,
  type AntragData,
  type AntragFields,
  type Box,
} from "@/lib/spielerpass";

const FONT_URL = "/fonts/NotoSans-Regular-subset.ttf";

export type AntragSignatures = {
  /** PNG mit transparentem Hintergrund. */
  player?: Uint8Array;
  guardian?: Uint8Array;
};

const stamp = (d: Date) =>
  new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

async function fetchBytes(url: string, what: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${what} konnte nicht geladen werden.`);
  return res.arrayBuffer();
}

export async function fillAntragPdf(
  data: AntragData,
  signatures: AntragSignatures = {},
  signedAt: Date = new Date(),
): Promise<{ bytes: Uint8Array; fields: AntragFields }> {
  const [{ PDFDocument, rgb }, fontkit] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit").then((m) => m.default),
  ]);

  const [template, fontBytes] = await Promise.all([
    fetchBytes(ANTRAG_TEMPLATE[data.kind], "Die Vorlage"),
    fetchBytes(FONT_URL, "Die Schrift"),
  ]);

  const pdf = await PDFDocument.load(template);
  pdf.registerFontkit(fontkit);
  // Unicode-Schrift (Noto Sans, Latein/Griechisch/Kyrillisch) statt der
  // Standardschrift, damit Namen mit ş, ğ, ł, č usw. richtig erscheinen.
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const known = new Set(font.getCharacterSet());

  const form = pdf.getForm();
  const fields = buildAntragFields(data, (cp) => known.has(cp));

  for (const [name, value] of Object.entries(fields.text)) {
    form.getTextField(name).setText(value);
  }
  for (const name of fields.checks) form.getCheckBox(name).check();
  form.updateFieldAppearances(font);

  const note = `digital erfasst ${stamp(signedAt)}`;
  const pad = 4;
  const noteSize = 5.5;

  const sign = async (pageIndex: number, box: Box, png: Uint8Array) => {
    const img = await pdf.embedPng(png);
    const maxW = box.width - pad * 2;
    const maxH = box.height - pad - noteSize - 5;
    const scale = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const page = pdf.getPage(pageIndex);
    page.drawImage(img, {
      x: box.x + (box.width - w) / 2,
      y: box.y + box.height - pad - h,
      width: w,
      height: h,
    });
    page.drawText(note, {
      x: box.x + box.width - pad - font.widthOfTextAtSize(note, noteSize),
      y: box.y + 2.5,
      size: noteSize,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
  };

  const boxes = SIGNATURE_BOXES[data.kind];
  for (const who of ["player", "guardian"] as const) {
    const box = boxes[who];
    const png = signatures[who];
    if (box && png) await sign(0, box, png);
  }
  // Seite 3 wird nur unterschrieben, wenn die Einverständniserklärung
  // ausdrücklich erteilt wurde; eine Unterschrift genügt dort.
  const consent = signatures.player ?? signatures.guardian;
  if (isTransfer(data.change) && data.consent === true && consent) {
    await sign(2, CONSENT_SIGNATURE_BOX, consent);
  }

  return { bytes: await pdf.save(), fields };
}
