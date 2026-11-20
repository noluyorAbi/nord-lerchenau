/**
 * Versand des Antrags auf Spielberechtigung: Eingabeprüfung für die API und der
 * Text der Mail an den Verein. Die Mail enthält das fertige PDF als Anhang und
 * eine Kopiervorlage mit denselben Angaben für die Eingabe in SpielPlus.
 *
 * Nichts davon wird gespeichert: Die Angaben (Minderjähriger!) liegen nur in
 * der Mail an den Verein und im Browser des Antragstellers.
 */

import { z } from "zod";

import {
  ANTRAG_KINDS,
  CLUB_NAME,
  antragFileName,
  formatBirthDate,
  normalizePassNumber,
  type AntragData,
} from "@/lib/spielerpass";

/** Empfänger der Antrags-Mail; zum Testen per SPIELERPASS_TO_EMAIL überschreibbar. */
export const DEFAULT_RECIPIENTS = ["info@svnord.de", "vertrag@svnord.de"];

/** Liest die Empfänger aus einer kommagetrennten Liste, sonst die Standardliste. */
export function recipients(envValue: string | undefined): string[] {
  const list = (envValue ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter((a) => z.string().email().safeParse(a).success);
  return list.length > 0 ? list : DEFAULT_RECIPIENTS;
}

/** Obergrenze für das PDF als Base64-Text (ca. 2,2 MB Datei, unter dem Vercel-Limit). */
export const MAX_PDF_BASE64 = 3_000_000;

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const text = (max: number, label: string) =>
  z.string().trim().min(1, `Bitte ${label} angeben`).max(max);

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

export const spielerpassSubmitSchema = z
  .object({
    kind: z.enum(ANTRAG_KINDS),
    gender: z.enum(["maennlich", "weiblich"]),
    lastName: text(100, "den Familiennamen"),
    firstName: text(100, "den Vornamen"),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte das Geburtsdatum angeben"),
    street: text(150, "die Straße"),
    postalCode: z.string().regex(/^\d{5}$/, "Die PLZ hat 5 Stellen"),
    city: text(100, "den Wohnort"),
    nationality: text(80, "die Staatsangehörigkeit"),
    birthPlace: text(100, "den Geburtsort"),
    change: z.enum(["erstausstellung", "vereinswechsel"]),
    previousClub: optionalText(150),
    passNumber: z.preprocess(
      blankToUndefined,
      z
        .string()
        .refine((v) => normalizePassNumber(v) !== null, "8 Stellen bitte")
        .optional(),
    ),
    status: z.preprocess(
      blankToUndefined,
      z.enum(["amateur", "vertragsspieler", "lizenzspieler"]).optional(),
    ),
    abroadResidence: optionalText(150),
    abroadClub: optionalText(150),
    /** Für Rückfragen des Vereins. */
    email: z.string().trim().email("Gültige E-Mail bitte").max(200),
    /** PDF als Base64, im Browser erzeugt. */
    pdf: z.string().min(100).max(MAX_PDF_BASE64),
    /** Honeypot: echte Nutzer lassen es leer, die Route prüft es. */
    website: z.string().max(200).optional(),
  })
  .refine((d) => d.change !== "vereinswechsel" || !!d.previousClub, {
    path: ["previousClub"],
    message: "Bitte den bisherigen Verein angeben",
  });

export type SpielerpassSubmit = z.infer<typeof spielerpassSubmitSchema>;

export const KIND_LABEL: Record<AntragData["kind"], string> = {
  junioren: "Junioren/Juniorinnen",
  erwachsene: "Herren/Senioren/Frauen",
};

const STATUS_LABEL = {
  amateur: "Amateur",
  vertragsspieler: "Vertragsspieler",
  lizenzspieler: "Lizenzspieler",
} as const;

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

/** Angaben in der Reihenfolge des BFV-Formulars, zum Abtippen oder Kopieren. */
export function buildKopiervorlage(
  d: Omit<SpielerpassSubmit, "pdf" | "website">,
): string {
  const wechsel = d.change === "vereinswechsel";
  const pass = d.passNumber ? normalizePassNumber(d.passNumber) : null;
  const rows: Array<[string, string | undefined]> = [
    ["Antragsart", wechsel ? "Vereinswechsel" : "Erstausstellung"],
    ["Familienname", d.lastName],
    ["Vorname", d.firstName],
    ["Geburtsdatum", formatBirthDate(d.birthDate)],
    ["Geschlecht", d.gender === "weiblich" ? "weiblich" : "männlich"],
    ["Straße, Haus-Nr.", d.street],
    ["PLZ", d.postalCode],
    ["Wohnort", d.city],
    ["Staatsangehörigkeit", d.nationality],
    ["Geburtsort", d.birthPlace],
    ...(wechsel
      ? ([
          ["Letzter Verein", d.previousClub],
          ["Passnummer des letzten Vereins", pass ?? undefined],
          [
            "Letzter Status beim abgebenden Verein",
            d.kind === "erwachsene"
              ? STATUS_LABEL[d.status ?? "amateur"]
              : undefined,
          ],
        ] as Array<[string, string | undefined]>)
      : []),
    ["Letzter Wohnort im Ausland", d.abroadResidence],
    ["Letzter Verein im Ausland", d.abroadClub],
  ];
  return rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${oneLine(v!)}`)
    .join("\n");
}

export function buildMail(
  d: Omit<SpielerpassSubmit, "pdf" | "website">,
  sentAt: Date,
): { subject: string; text: string; fileName: string } {
  const when = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "short",
    timeStyle: "short",
  }).format(sentAt);
  const name = oneLine(`${d.lastName}, ${d.firstName}`);
  const wechsel = d.change === "vereinswechsel";

  const subject = `Spielerpass-Antrag · ${name} (${KIND_LABEL[d.kind]}, ${
    wechsel ? "Vereinswechsel" : "Erstausstellung"
  })`;

  const text = [
    `Neuer Antrag auf Spielberechtigung für ${CLUB_NAME}, über die Website ausgefüllt und am Bildschirm unterschrieben (${when}).`,
    "",
    "Im Anhang: der Antrag als PDF (offizielles BFV-Formular, mit Unterschrift).",
    `Rückfragen an: ${d.email}`,
    "",
    "KOPIERVORLAGE FÜR SPIELPLUS (Reihenfolge wie im BFV-Formular)",
    "------------------------------------------------------------",
    buildKopiervorlage(d),
    "",
    "Vom Verein zu prüfen oder zu ergänzen: Wartezeit-Ausnahmen, Sportgerichtsverfahren/Sperre, Stammverein (JFG), Unterschrift und Stempel des Vereins.",
    "Hinweis: Die Unterschrift wurde digital am Bildschirm erfasst (Datum und Uhrzeit stehen im PDF neben der Unterschrift).",
    d.abroadResidence || d.abroadClub
      ? "Bei Spielern aus dem Ausland muss eine Kopie von Reisepass oder Personalausweis beiliegen."
      : "",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  const fileName = antragFileName(d);

  return { subject, text, fileName };
}

/** Prüft, ob die Base64-Daten ein PDF sind (Dateikopf "%PDF-"). */
export function decodePdf(base64: string): Buffer | null {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return null;
  const bytes = Buffer.from(base64, "base64");
  return bytes.subarray(0, 5).toString("latin1") === "%PDF-" ? bytes : null;
}
