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
  ANTRAG_CHANGES,
  CHANGE_OPTIONS,
  WAIT_REASONS,
  isTransfer,
  waitReasonIds,
} from "@/lib/spielerpass-options";
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
    change: z.enum(ANTRAG_CHANGES),
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
    sanction: z.boolean(),
    sanctionFrom: z.preprocess(
      blankToUndefined,
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    ),
    sanctionTo: z.preprocess(
      blankToUndefined,
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    ),
    waitReasons: z.array(z.string().max(40)).max(20).optional(),
    otherText: optionalText(200),
    stammverein: optionalText(150),
    consent: z.boolean().optional(),
    /** Für Rückfragen des Vereins. */
    email: z.string().trim().email("Gültige E-Mail bitte").max(200),
    /** PDF als Base64, im Browser erzeugt. */
    pdf: z.string().min(100).max(MAX_PDF_BASE64),
    /** Honeypot: echte Nutzer lassen es leer, die Route prüft es. */
    website: z.string().max(200).optional(),
  })
  .superRefine((d, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (!CHANGE_OPTIONS[d.kind].some((o) => o.value === d.change)) {
      issue("change", "Diese Art des Antrags gibt es hier nicht");
    }
    if (isTransfer(d.change)) {
      if (!d.previousClub) {
        issue("previousClub", "Bitte den bisherigen Verein angeben");
      }
      if (d.consent === undefined) {
        issue(
          "consent",
          "Bitte die Einverständniserklärung (Seite 3) beantworten",
        );
      }
    }
    if (d.change === "sonstiges" && !d.otherText) {
      issue("otherText", "Bitte kurz beschreiben");
    }
    const valid = waitReasonIds(d.kind);
    if ((d.waitReasons ?? []).some((id) => !valid.includes(id))) {
      issue("waitReasons", "Ungültiger Grund");
    }
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
  const transfer = isTransfer(d.change);
  const pass = d.passNumber ? normalizePassNumber(d.passNumber) : null;
  const option = CHANGE_OPTIONS[d.kind].find((o) => o.value === d.change);
  const reasons = WAIT_REASONS[d.kind].filter((r) =>
    (d.waitReasons ?? []).includes(r.id),
  );
  const sanction = d.sanction
    ? `Ja${
        d.sanctionFrom || d.sanctionTo
          ? ` (von ${formatBirthDate(d.sanctionFrom ?? "") || "?"} bis ${formatBirthDate(d.sanctionTo ?? "") || "?"})`
          : ""
      }`
    : "Nein";

  const rows: Array<[string, string | undefined]> = [
    ["Antragsart", option?.label ?? d.change],
    ["Sonstiges", d.change === "sonstiges" ? d.otherText : undefined],
    ["Neuer Stammverein (JFG)", d.stammverein],
    ["Familienname", d.lastName],
    ["Vorname", d.firstName],
    ["Geburtsdatum", formatBirthDate(d.birthDate)],
    ["Geschlecht", d.gender === "weiblich" ? "weiblich" : "männlich"],
    ["Straße, Haus-Nr.", d.street],
    ["PLZ", d.postalCode],
    ["Wohnort", d.city],
    ["Staatsangehörigkeit", d.nationality],
    ["Geburtsort", d.birthPlace],
    ...(transfer
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
    ["Sportgerichtsverfahren / Sperre", sanction],
    ["Letzter Wohnort im Ausland", d.abroadResidence],
    ["Letzter Verein im Ausland", d.abroadClub],
  ];
  const lines = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${oneLine(v!)}`);

  if (reasons.length > 0) {
    lines.push("Wartezeit entfällt (Seite 2), Nachweise beachten:");
    for (const r of reasons) lines.push(`- ${r.label}`);
  }
  if (transfer) {
    lines.push(
      `Einverständnis zur stellvertretenden Online-Abmeldung (Seite 3): ${
        d.consent
          ? "erteilt"
          : "NICHT erteilt, die Abmeldung beim bisherigen Verein erledigt der Spieler selbst"
      }`,
    );
  }
  return lines.join("\n");
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
  const subject = `Spielerpass-Antrag · ${name} (${KIND_LABEL[d.kind]}, ${
    CHANGE_OPTIONS[d.kind].find((o) => o.value === d.change)?.label ?? d.change
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
    "Vom Verein zu prüfen oder zu ergänzen: Nachweise zu Wartezeit-Ausnahmen, Stammverein (JFG), Unterschrift und Stempel des Vereins.",
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
