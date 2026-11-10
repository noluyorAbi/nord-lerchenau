/**
 * Ordnet einen Spieler anhand von Geburtsjahr und heutigem Datum der passenden
 * Mannschaft zu (Vorschlag fuer das Probetraining, keine Zusage).
 *
 * Grundlage ist das Spieljahr des DFB/BFV: es beginnt am 1. Juli. Das "U" einer
 * Altersklasse ist das Jahr, in dem das Spieljahr endet, minus Geburtsjahr:
 * Wer 2014 geboren ist, spielt im Spieljahr 2026/27 (Ende 2027) in der U13.
 * Jeweils zwei Jahrgaenge bilden eine Klasse (A U19, B U17, C U15, D U13,
 * E U11, F U9, G U7), bei den Jungs spielen C bis G getrennt nach Jahrgang
 * (U15 und U14 usw.), so wie der Verein seine Teams fuehrt.
 *
 * Maedchen: E- bis B-Juniorinnen (U11 bis U17) haben eigene Mannschaften,
 * darunter spielen Maedchen bei den Jungs mit.
 */

import type { PlayerGender } from "@/lib/contact-topics";

export const BIRTH_YEAR_MIN = 1940;
/** Juengster Spieler: Bambini ab 4 Jahren (U4 im Spieljahr). */
const YOUNGEST_U = 4;

type YearMonth = { year: number; month: number };

function berlinYearMonth(now: Date): YearMonth {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month") };
}

/** Kalenderjahr, in dem das laufende Spieljahr endet (Wechsel am 1. Juli). */
export function seasonEndYear(now: Date = new Date()): number {
  const { year, month } = berlinYearMonth(now);
  return month >= 7 ? year + 1 : year;
}

/** "2026/27" */
export function seasonLabel(now: Date = new Date()): string {
  const end = seasonEndYear(now);
  return `${end - 1}/${String(end).slice(2)}`;
}

/** Zulaessige Geburtsjahre fuer ein Probetraining. */
export function birthYearRange(now: Date = new Date()) {
  return { min: BIRTH_YEAR_MIN, max: seasonEndYear(now) - YOUNGEST_U };
}

export type TeamSuggestion = {
  /** Name der Mannschaft, wird auch gespeichert. */
  title: string;
  /** Erklaerung, warum diese Mannschaft. */
  note: string;
  /** Weitere passende Moeglichkeit, falls es eine gibt. */
  alternative?: string;
  /** Der Verein klaert die Zuordnung persoenlich (keine feste Mannschaft). */
  personal?: boolean;
};

function boysTeam(u: number): string {
  if (u >= 18) return "A-Junioren (U19)";
  if (u >= 16) return "B-Junioren (U17)";
  if (u >= 14) return `C-Junioren (U${u})`;
  if (u >= 12) return `D-Junioren (U${u})`;
  if (u >= 10) return `E-Junioren (U${u})`;
  if (u >= 8) return `F-Junioren (U${u})`;
  if (u >= 6) return "G-Junioren";
  return "Fußballkindergarten (Bambini)";
}

/** Juniorinnen gibt es von E (U11) bis B (U17), je zwei Jahrgaenge. */
function girlsTeam(u: number): string | null {
  if (u < 10 || u > 17) return null;
  const classU = u % 2 === 0 ? u + 1 : u;
  const letter = { 11: "E", 13: "D", 15: "C", 17: "B" }[classU];
  return `${letter}-Juniorinnen (U${classU})`;
}

export function suggestTeam(
  birthYear: number,
  gender: PlayerGender,
  now: Date = new Date(),
): TeamSuggestion | null {
  const { min, max } = birthYearRange(now);
  if (!Number.isInteger(birthYear) || birthYear < min || birthYear > max) {
    return null;
  }

  const u = seasonEndYear(now) - birthYear;
  const base = `Jahrgang ${birthYear}, Spieljahr ${seasonLabel(now)}`;

  // Senioren und Herren sind Herrenmannschaften, Frauen ordnet der Verein
  // persoenlich zu.
  if (u >= 20) {
    if (gender === "spielerin") return personal(base);
    if (u >= 40) {
      return {
        title: "Senioren B (Ü40)",
        note: base,
        alternative: "Auch bei Senioren A (Ü32) kannst du mittrainieren.",
      };
    }
    if (u >= 32) return { title: "Senioren A (Ü32)", note: base };
    return { title: "Herren (1., 2. oder 3. Mannschaft)", note: base };
  }

  if (gender === "spielerin") {
    const girls = girlsTeam(u);
    if (girls) {
      return {
        title: girls,
        note: base,
        alternative: `Alternativ ist auch ein Platz bei den ${boysTeam(u)} möglich.`,
      };
    }
    if (u >= 18) return personal(base);
    return {
      title: boysTeam(u),
      note: `${base}. In diesem Alter spielen Mädchen bei den Jungs mit.`,
    };
  }

  return { title: boysTeam(u), note: base };
}

function personal(base: string): TeamSuggestion {
  return {
    title: "Persönliche Zuordnung",
    note: `${base}. Wir melden uns und finden gemeinsam das passende Team.`,
    personal: true,
  };
}
