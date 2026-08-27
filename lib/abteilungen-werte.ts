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

/** Ob der Seed diese Abteilung in Ruhe lassen muss. */
export function shouldPreserveExistingRows(
  rows: unknown[] | null | undefined,
): boolean {
  return (rows ?? []).length > 0;
}
