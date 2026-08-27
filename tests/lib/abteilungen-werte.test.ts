import { describe, expect, it } from "vitest";

import {
  pillsFromCms,
  preferCms,
  shouldPreserveExistingRows,
  statsFromCms,
} from "@/lib/abteilungen-werte";

describe("pillsFromCms", () => {
  it("nimmt gepflegte Schlagworte und schneidet Leerzeichen ab", () => {
    expect(
      pillsFromCms([{ text: " Seit 1967 " }, { text: "35 Aktive" }]),
    ).toEqual(["Seit 1967", "35 Aktive"]);
  });

  it("wirft leere und nur aus Leerzeichen bestehende Zeilen weg", () => {
    expect(
      pillsFromCms([{ text: "   " }, { text: null }, { text: "Ski" }]),
    ).toEqual(["Ski"]);
  });

  it("verträgt fehlende Daten", () => {
    expect(pillsFromCms(null)).toEqual([]);
    expect(pillsFromCms(undefined)).toEqual([]);
  });
});

describe("statsFromCms", () => {
  it("nimmt vollständige Zeilen", () => {
    expect(statsFromCms([{ label: " Mitglieder ", value: " 35 " }])).toEqual([
      { label: "Mitglieder", value: "35" },
    ]);
  });

  it("wirft halbe Zeilen weg", () => {
    // Eine Beschriftung ohne Wert wäre auf der Seite eine leere Zeile im
    // dunklen Kasten, das sieht nach Fehler aus.
    expect(
      statsFromCms([
        { label: "Mitglieder", value: "  " },
        { label: "", value: "35" },
        { label: "Halle", value: "Waldmeisterschule" },
      ]),
    ).toEqual([{ label: "Halle", value: "Waldmeisterschule" }]);
  });
});

describe("preferCms", () => {
  it("lässt Gepflegtes gewinnen", () => {
    expect(preferCms(["neu"], ["alt"])).toEqual(["neu"]);
  });

  it("fällt bei nichts Gepflegtem auf die mitgelieferten Werte zurück", () => {
    expect(preferCms([], ["alt"])).toEqual(["alt"]);
  });

  it("fällt auch zurück, wenn alle gepflegten Zeilen unbrauchbar waren", () => {
    // Genau der Fall, der die Seite sonst mit einem leeren Kasten zeigt.
    expect(preferCms(pillsFromCms([{ text: " " }]), ["alt"])).toEqual(["alt"]);
  });
});

describe("shouldPreserveExistingRows", () => {
  it("schützt gepflegte Zeilen vor dem Seed", () => {
    expect(shouldPreserveExistingRows([{ text: "x" }])).toBe(true);
  });

  it("zählt dasselbe wie preferCms, nicht rohe Zeilen", () => {
    // Sonst gäbe es einen Zustand, aus dem die Seite nicht herausfindet: der
    // Seed lässt in Ruhe, weil Zeilen dastehen, die Seite fällt zurück, weil
    // keine brauchbar ist, und kein weiterer Lauf korrigiert das.
    const leereZeilen = [{ text: "   " }, { text: "" }];
    expect(shouldPreserveExistingRows(leereZeilen)).toBe(false);
    expect(preferCms(pillsFromCms(leereZeilen), ["alt"])).toEqual(["alt"]);

    const halbeZeile = [{ label: "Training", value: " " }];
    expect(shouldPreserveExistingRows(halbeZeile)).toBe(false);
  });

  it("lässt den Seed schreiben, solange nichts dasteht", () => {
    expect(shouldPreserveExistingRows([])).toBe(false);
    expect(shouldPreserveExistingRows(null)).toBe(false);
    expect(shouldPreserveExistingRows(undefined)).toBe(false);
  });
});
