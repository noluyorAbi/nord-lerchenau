import type { SportStat } from "@/components/SportSectionPage";

/**
 * Die Regel, nach der sich gepflegte und mitgelieferte Werte der
 * Abteilungsseiten entscheiden: was im Admin steht, gewinnt.
 *
 * Sie steht hier und nicht in der Seitenkomponente, aus demselben Grund wie
 * `shouldPreserveExistingDescription`: es ist eine Regel, kein Rendern, und
 * wenn sie unbemerkt kippt, zeigt die Seite die alten Zahlen, waehrend der
 * Verein im CMS die neuen eingetragen hat. Genau das soll der Umbau
 * verhindern, also muss die Regel pruefbar sein.
 */

type PillRow = { text?: string | null };
type StatRow = { label?: string | null; value?: string | null };

/* `PillRow & StatRow` mit lauter optionalen Feldern: der Seed prueft beide
   Feldarten mit derselben Funktion, und beide Zeilenformen sind zuweisbar,
   ohne dass irgendwo gecastet werden muss. */

function trimmed(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Gepflegte Schlagworte, leere und nur aus Leerzeichen bestehende entfallen. */
export function pillsFromCms(rows: PillRow[] | null | undefined): string[] {
  return (rows ?? []).map((row) => trimmed(row.text)).filter(Boolean);
}

/** Gepflegte Zahlen. Eine halbe Zeile ist keine Zahl und entfaellt. */
export function statsFromCms(rows: StatRow[] | null | undefined): SportStat[] {
  return (rows ?? [])
    .map((row) => ({ label: trimmed(row.label), value: trimmed(row.value) }))
    .filter((row): row is SportStat => row.label !== "" && row.value !== "");
}

/**
 * Gepflegt schlaegt mitgeliefert. Eine leere Liste heisst "nichts gepflegt"
 * und nicht "absichtlich leer": ein Verein, der den Kasten leeren will, sagt
 * das nicht durch Loeschen aller Zeilen, sondern es ist der Zustand vor der
 * ersten Pflege.
 */
export function preferCms<T>(fromCms: T[], fallback: T[]): T[] {
  return fromCms.length > 0 ? fromCms : fallback;
}

/**
 * Ob der Seed diese Abteilung in Ruhe lassen muss.
 *
 * Gezaehlt werden BRAUCHBARE Zeilen, nicht rohe. Der Unterschied ist der
 * einzige Zustand, aus dem die Seite sonst nicht mehr herausfindet: haette
 * eine Abteilung Zeilen, deren Text leer ist, dann liesse der Seed sie in Ruhe
 * ("da steht ja was"), waehrend die Seite auf die mitgelieferten Werte
 * zurueckfaellt ("brauchbar ist davon nichts"). Im Admin stuenden Zeilen, auf
 * der Seite andere Werte, und kein weiterer Lauf korrigiert das je. Fuer den
 * Verein saehe das aus wie "ich pflege und es passiert nichts", also genau
 * das, wogegen dieser Umbau gebaut ist.
 *
 * Beide Seiten der Regel zaehlen deshalb dasselbe.
 */
export function shouldPreserveExistingRows(
  rows: Array<PillRow & StatRow> | null | undefined,
): boolean {
  return (rows ?? []).some(
    (row) =>
      trimmed(row.text) !== "" ||
      (trimmed(row.label) !== "" && trimmed(row.value) !== ""),
  );
}
