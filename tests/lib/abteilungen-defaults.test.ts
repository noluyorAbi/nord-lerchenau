import { describe, expect, it } from "vitest";

import {
  ABTEILUNGEN_DEFAULTS,
  type SportKey,
} from "@/lib/abteilungen-defaults";

const SPORTS: SportKey[] = [
  "volleyball",
  "gymnastik",
  "ski",
  "esport",
  "schiedsrichter",
];

/**
 * Der Rueckfall ist das, was die Seite zeigt, solange im CMS nichts gepflegt
 * ist, also am Tag des Deploys auf jeder der fuenf Abteilungsseiten. Eine
 * fehlende oder leere Abteilung waere dort sofort ein leerer Kasten.
 */
describe("ABTEILUNGEN_DEFAULTS", () => {
  it("deckt jede Abteilung ab", () => {
    expect(Object.keys(ABTEILUNGEN_DEFAULTS).sort()).toEqual(
      [...SPORTS].sort(),
    );
  });

  for (const sport of SPORTS) {
    it(`liefert für ${sport} nicht-leere Schlagworte und Zahlen`, () => {
      const entry = ABTEILUNGEN_DEFAULTS[sport];
      expect(entry.pills.length).toBeGreaterThan(0);
      expect(entry.stats.length).toBeGreaterThan(0);
      expect(entry.pills.every((p) => p.trim().length > 0)).toBe(true);
      expect(
        entry.stats.every(
          (s) => s.label.trim().length > 0 && s.value.trim().length > 0,
        ),
      ).toBe(true);
    });

    it(`vergibt für ${sport} keine Beschriftung doppelt`, () => {
      // Die Zahlen werden über `label` als React-Key gerendert, ein Duplikat
      // wäre dort ein stiller Renderfehler.
      const labels = ABTEILUNGEN_DEFAULTS[sport].stats.map((s) => s.label);
      expect(new Set(labels).size).toBe(labels.length);
    });
  }
});
