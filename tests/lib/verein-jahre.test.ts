import { describe, expect, it } from "vitest";

import { VEREIN_GEGRUENDET, vereinsJahre } from "@/lib/verein-jahre";

describe("vereinsJahre", () => {
  it("rechnet ab dem Gründungsjahr", () => {
    expect(vereinsJahre(new Date("2026-08-27T00:00:00Z"))).toBe(79);
    expect(vereinsJahre(new Date("2027-01-01T00:00:00Z"))).toBe(80);
  });

  it("zählt zum Jahreswechsel weiter", () => {
    // Der Fehler, den die feste Zahl hatte: sie blieb am 1. Januar stehen.
    const silvester = vereinsJahre(new Date("2026-12-31T12:00:00Z"));
    const neujahr = vereinsJahre(new Date("2027-01-01T12:00:00Z"));
    expect(neujahr).toBe(silvester + 1);
  });

  it("nennt das Gründungsjahr, das die Seiten anzeigen", () => {
    expect(VEREIN_GEGRUENDET).toBe(1947);
  });
});
