/**
 * Antrag auf Spielberechtigung: Zuordnung der Formularangaben zu den Feldern
 * der offiziellen BFV-Vorlagen (Stand ab 01.07.2026, liegen unter
 * public/downloads). Hier steht nur die reine Logik; das Einsetzen ins PDF
 * macht lib/spielerpass-pdf.ts im Browser, damit keine Angaben zum Server
 * wandern.
 *
 * Bewusst NICHT ausgefüllt: Stammverein (JFG), Sportgerichtsverfahren,
 * Wartezeit-Ausnahmen sowie Unterschrift und Stempel des Vereins. Das sind
 * Angaben des Vereins.
 */

import { seasonEndYear } from "@/lib/probetraining-team";
import {
  CHANGE_OPTIONS,
  WAIT_REASONS,
  isTransfer,
  type AntragChange,
  type AntragKind,
} from "@/lib/spielerpass-options";

export const ANTRAG_KINDS = ["junioren", "erwachsene"] as const;
export type { AntragChange, AntragKind };

/** An wen die Antragsteller das fertige PDF schicken. */
export const ANTRAG_RECIPIENT = "info@svnord.de";

export const CLUB_NAME = "SV Nord München-Lerchenau e.V.";
/**
 * 4-stellige Vereinsnummer für das Formular. Die BFV-Vereinsseite nennt
 * 31001325; die ersten vier Stellen (3100) sind die Verbandskennung, siehe
 * "PV3100 + Vereinsnummer" in der Anleitung zu SpielPlus.
 */
export const CLUB_NUMBER = "1325";

export type Box = { x: number; y: number; width: number; height: number };

/**
 * Unterschriftsfelder auf Seite 1 der Vorlagen (PDF-Punkte, Ursprung unten
 * links). Aus den grauen Feldern der Vorlage ausgemessen; ändert der BFV das
 * Layout, müssen sie neu bestimmt werden.
 */
export const SIGNATURE_BOXES: Record<
  AntragKind,
  { player: Box; guardian?: Box }
> = {
  junioren: {
    player: { x: 61, y: 84, width: 141, height: 41 },
    guardian: { x: 236, y: 84, width: 141, height: 41 },
  },
  erwachsene: {
    player: { x: 61, y: 69, width: 229, height: 41 },
  },
};

/**
 * Unterschriftsfeld auf Seite 3 (Einverständnis zur stellvertretenden
 * Online-Abmeldung), in beiden Vorlagen an derselben Stelle. Wird nur bei
 * einem Vereinswechsel unterschrieben.
 */
export const CONSENT_SIGNATURE_BOX: Box = {
  x: 43,
  y: 434,
  width: 247,
  height: 41,
};

export const ANTRAG_TEMPLATE: Record<AntragKind, string> = {
  junioren: "/downloads/antrag-spielberechtigung-junioren-2026-07.pdf",
  erwachsene: "/downloads/antrag-spielberechtigung-erwachsene-2026-07.pdf",
};

export type AntragGender = "maennlich" | "weiblich";
export type AntragStatus = "amateur" | "vertragsspieler" | "lizenzspieler";

export type AntragData = {
  kind: AntragKind;
  gender: AntragGender;
  lastName: string;
  firstName: string;
  /** ISO-Datum aus dem Datumsfeld (JJJJ-MM-TT). */
  birthDate: string;
  street: string;
  postalCode: string;
  city: string;
  nationality: string;
  birthPlace: string;
  change: AntragChange;
  previousClub?: string;
  /** Passnummer des letzten Vereins, 8 Zeichen, Trennzeichen erlaubt. */
  passNumber?: string;
  /** Nur Erwachsene, nur bei Vereinswechsel. */
  status?: AntragStatus;
  abroadResidence?: string;
  abroadClub?: string;
  /** Läuft ein Sportgerichtsverfahren oder wurde der Spieler gesperrt? */
  sanction: boolean;
  sanctionFrom?: string;
  sanctionTo?: string;
  /** Gründe, aus denen die Wartezeit entfällt (Seite 2), siehe WAIT_REASONS. */
  waitReasons?: string[];
  /** Freitext bei "Sonstiges". */
  otherText?: string;
  /** Nur Junioren, nur Stammvereinswechsel: Vereinsnummer und Name. */
  stammverein?: string;
  /** Einverständnis zur stellvertretenden Online-Abmeldung (Seite 3). */
  consent?: boolean;
};

export type AntragFields = {
  text: Record<string, string>;
  /** Namen der anzukreuzenden Kästchen. */
  checks: string[];
  /** true, wenn Zeichen vereinfacht werden mussten (z. B. ş zu s). */
  simplified: boolean;
};

/** Zeichen, die die Standardschrift (WinAnsi) auch ausserhalb von Latin-1 kennt. */
const WIN_ANSI_EXTRA = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ".split(""));

export type CanRender = (codePoint: number) => boolean;

const winAnsi: CanRender = (cp) =>
  cp <= 0xff || WIN_ANSI_EXTRA.has(String.fromCodePoint(cp));

const FALLBACK: Record<string, string> = {
  ı: "i",
  İ: "I",
  ł: "l",
  Ł: "L",
  đ: "d",
  Đ: "D",
  ð: "d",
  ħ: "h",
  ø: "o",
  Ø: "O",
};

/**
 * Prüft Zeichen gegen die eingebettete Schrift. Was sie nicht darstellen kann,
 * wird durch einen nahen Buchstaben ersetzt, sonst durch "?".
 */
export function toPdfText(
  input: string,
  canRender: CanRender = winAnsi,
): { text: string; simplified: boolean } {
  let simplified = false;
  let out = "";
  for (const ch of input.normalize("NFC")) {
    if (canRender(ch.codePointAt(0) ?? 0)) {
      out += ch;
      continue;
    }
    simplified = true;
    const base = FALLBACK[ch] ?? ch.normalize("NFD").replace(/\p{M}/gu, "");
    out += [...base].every((c) => canRender(c.codePointAt(0) ?? 0))
      ? base
      : "?";
  }
  return { text: out, simplified };
}

/** "2014-05-03" → "03.05.2014". Gibt "" zurück, wenn das Datum nicht passt. */
export function formatBirthDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
}

/** 8 Zeichen ohne Trenner, sonst null. Das Formular teilt sie 4 + 4. */
export function normalizePassNumber(raw: string): string | null {
  const clean = raw.replace(/[\s\-–./]/g, "").toUpperCase();
  return /^[A-Z0-9]{8}$/.test(clean) ? clean : null;
}

export type SignatureNeeds = { player: boolean; guardian: boolean };

/**
 * Wer bei Junioren unterschreiben muss. Die Vorlage nimmt E-, F- und G-Junioren
 * von der Spielerunterschrift aus (Altersklasse U11 und jünger, das "U" ist das
 * Endjahr des Spieljahres minus Geburtsjahr). Eine Unterschrift der
 * Erziehungsberechtigten braucht es nur bis zur Volljährigkeit. Null, solange
 * das Geburtsdatum fehlt oder nicht stimmt.
 */
export function signatureNeeds(
  birthDate: string,
  now: Date = new Date(),
): SignatureNeeds | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim());
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const born = new Date(Date.UTC(year, month - 1, day));
  if (
    born.getUTCFullYear() !== year ||
    born.getUTCMonth() !== month - 1 ||
    born.getUTCDate() !== day ||
    born.getTime() > now.getTime() ||
    year < 1940
  ) {
    return null;
  }
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  const age =
    today[0] -
    year -
    (today[1] < month || (today[1] === month && today[2] < day) ? 1 : 0);
  return {
    player: seasonEndYear(now) - year >= 12,
    guardian: age < 18,
  };
}

export function isGermanNationality(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    v === "" ||
    ["deutsch", "deutschland", "deutsche", "german", "germany", "de"].includes(
      v,
    )
  );
}

const clean = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

export function buildAntragFields(
  data: AntragData,
  canRender: CanRender = winAnsi,
): AntragFields {
  const jun = data.kind === "junioren";
  const text: Record<string, string> = {};
  const checks: string[] = [];
  let simplified = false;

  const set = (field: string, value: string | undefined) => {
    const v = clean(value);
    if (!v) return;
    const r = toPdfText(v, canRender);
    simplified ||= r.simplified;
    text[field] = r.text;
  };

  const transfer = isTransfer(data.change);
  const birth = formatBirthDate(data.birthDate);

  set("Vereinsnummer", CLUB_NUMBER);
  set("Vereinsname", CLUB_NAME);
  set("Familienname", data.lastName);
  set("Vorname", data.firstName);
  set("Geburtsdatum", birth);
  set(jun ? "Straße, Haus-Nr" : "Straße, Hausnr", data.street);
  set("PLZ", data.postalCode);
  set("Wohnort", data.city);
  set("Staatsangehörigkeit", data.nationality);
  set("Geburtsort", data.birthPlace);

  checks.push(
    data.gender === "weiblich" ? "Geschlecht weiblich" : "Geschlecht männlich",
  );

  // Seite 1: Art des Antrags. Gilt ein Grund für den Wegfall der Wartezeit,
  // nennt die Vorlage statt "Vereinswechsel" den Paragrafen.
  const reasons = WAIT_REASONS[data.kind].filter((r) =>
    (data.waitReasons ?? []).includes(r.id),
  );
  const option = CHANGE_OPTIONS[data.kind].find((o) => o.value === data.change);
  if (option) {
    if (data.change === "vereinswechsel" && reasons.length > 0) {
      for (const c of new Set(reasons.map((r) => r.pageOneCheck))) {
        checks.push(c);
      }
    } else {
      checks.push(option.check);
    }
  }
  for (const r of reasons) checks.push(r.check);
  if (data.change === "sonstiges") set("Sonstiges Text", data.otherText);
  if (jun && data.change === "stammverein") {
    set("Vereinsnummer + Name Stammverein", data.stammverein);
  }

  if (transfer) {
    set("Letzter Verein", data.previousClub);
    const pass = normalizePassNumber(data.passNumber ?? "");
    if (pass) {
      set("Passnr. letzter Verein 01", pass.slice(0, 4));
      set("Passnr. letzter Verein 02", pass.slice(4));
    }
    if (!jun) {
      checks.push(
        data.status === "vertragsspieler"
          ? "Vertragsspieler"
          : data.status === "lizenzspieler"
            ? "Lizenzspieler"
            : "Amateur",
      );
    }
  }

  // Sportgerichtsverfahren / Sperre
  const sanctionSuffix = jun ? " 3" : "";
  checks.push(
    `Sportgerichtsverfahren ${data.sanction ? "ja" : "nein"}${sanctionSuffix}`,
  );
  if (data.sanction) {
    set(
      `Sportgerichtsverfahren von${sanctionSuffix}`,
      formatBirthDate(data.sanctionFrom ?? ""),
    );
    set(
      `Sportgerichtsverfahren bis${sanctionSuffix}`,
      formatBirthDate(data.sanctionTo ?? ""),
    );
  }

  set(
    jun ? "Letzter Wohnort im Ausland" : "Letzter Wohnort Ausland",
    data.abroadResidence,
  );
  set(
    jun ? "Letzter Verein im Ausland" : "Letzter Verein Ausland",
    data.abroadClub,
  );

  // Seite 3 (Einverständniserklärung zur Online-Abmeldung): dieselben Angaben,
  // nur bei einem Wechsel sinnvoll. Die Feldnamen weichen je Vorlage ab. Die
  // Unterschrift dort setzt der Browser nur, wenn consent gesetzt ist.
  const suffix = jun ? " Einverständnis 2" : " Einverständnis";
  set(`Familienname${suffix}`, data.lastName);
  set(`Vorname${suffix}`, data.firstName);
  set(`Geburtsdatum${suffix}`, birth);
  set(`Neuer Verein${suffix}`, CLUB_NAME);
  if (transfer) {
    set(
      jun
        ? "Bisheriger Verein Einverständnis 2"
        : "Bisheriger Verein Einverständnis 1",
      data.previousClub,
    );
  }

  return { text, checks, simplified };
}

export function antragFileName(
  data: Pick<AntragData, "lastName" | "firstName">,
) {
  const part = (s: string) =>
    [...s]
      .map((c) => FALLBACK[c] ?? c)
      .join("")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const name = [part(data.lastName), part(data.firstName)]
    .filter(Boolean)
    .join("-");
  return `Antrag-Spielberechtigung${name ? `-${name}` : ""}.pdf`;
}
