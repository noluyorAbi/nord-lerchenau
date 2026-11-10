import { describe, expect, it } from "vitest";

import {
  birthYearRange,
  seasonEndYear,
  seasonLabel,
  suggestTeam,
  tooYoungMessage,
} from "@/lib/probetraining-team";

// Spieljahr 2026/27: es endet 2027, "U" = 2027 minus Geburtsjahr.
const NOV_2026 = new Date("2026-11-10T12:00:00Z");

const title = (year: number, gender: "spieler" | "spielerin", now = NOV_2026) =>
  suggestTeam(year, gender, now)?.title;

describe("season", () => {
  it("switches on 1 July, Berlin time", () => {
    expect(seasonEndYear(new Date("2027-06-30T12:00:00Z"))).toBe(2027);
    expect(seasonEndYear(new Date("2027-07-01T12:00:00Z"))).toBe(2028);
    // 23:30 am 30. Juni in Berlin ist noch das alte Spieljahr,
    // 00:30 am 1. Juli schon das neue (obwohl UTC noch der 30. Juni ist).
    expect(seasonEndYear(new Date("2027-06-30T21:30:00Z"))).toBe(2027);
    expect(seasonEndYear(new Date("2027-06-30T22:30:00Z"))).toBe(2028);
  });

  it("labels the season", () => {
    expect(seasonLabel(NOV_2026)).toBe("2026/27");
    expect(seasonLabel(new Date("2027-03-01T12:00:00Z"))).toBe("2026/27");
    expect(seasonLabel(new Date("2027-07-01T12:00:00Z"))).toBe("2027/28");
  });

  it("allows birth years from Bambini age (4) upwards", () => {
    expect(birthYearRange(NOV_2026)).toEqual({ min: 1940, max: 2023 });
  });
});

describe("suggestTeam: Jungs", () => {
  it("assigns the youth classes by birth year", () => {
    expect(title(2023, "spieler")).toBe("Fußballkindergarten (Bambini)");
    expect(title(2022, "spieler")).toBe("Fußballkindergarten (Bambini)");
    expect(title(2021, "spieler")).toBe("G-Junioren");
    expect(title(2020, "spieler")).toBe("G-Junioren");
    expect(title(2019, "spieler")).toBe("F-Junioren (U8)");
    expect(title(2018, "spieler")).toBe("F-Junioren (U9)");
    expect(title(2017, "spieler")).toBe("E-Junioren (U10)");
    expect(title(2016, "spieler")).toBe("E-Junioren (U11)");
    expect(title(2015, "spieler")).toBe("D-Junioren (U12)");
    expect(title(2014, "spieler")).toBe("D-Junioren (U13)");
    expect(title(2013, "spieler")).toBe("C-Junioren (U14)");
    expect(title(2012, "spieler")).toBe("C-Junioren (U15)");
    expect(title(2011, "spieler")).toBe("B-Junioren (U17)");
    expect(title(2010, "spieler")).toBe("B-Junioren (U17)");
    expect(title(2009, "spieler")).toBe("A-Junioren (U19)");
    expect(title(2008, "spieler")).toBe("A-Junioren (U19)");
  });

  it("moves up a class when the season changes", () => {
    const before = new Date("2027-06-30T12:00:00Z");
    const after = new Date("2027-07-01T12:00:00Z");
    expect(title(2014, "spieler", before)).toBe("D-Junioren (U13)");
    expect(title(2014, "spieler", after)).toBe("C-Junioren (U14)");
  });

  it("assigns Herren, Senioren A and Senioren B by age", () => {
    expect(title(2007, "spieler")).toBe("Herren (1., 2. oder 3. Mannschaft)");
    expect(title(1996, "spieler")).toBe("Herren (1., 2. oder 3. Mannschaft)");
    expect(title(1995, "spieler")).toBe("Senioren A (Ü32)");
    expect(title(1988, "spieler")).toBe("Senioren A (Ü32)");
    expect(title(1987, "spieler")).toBe("Senioren B (Ü40)");
    expect(title(1960, "spieler")).toBe("Senioren B (Ü40)");
    expect(suggestTeam(1987, "spieler", NOV_2026)?.alternative).toContain(
      "Senioren A",
    );
  });

  it("offers the Herren teams as an alternative for 32 to 36 year olds", () => {
    // Spieljahr 2026/27: 1995 -> 32, 1991 -> 36, 1990 -> 37.
    for (const year of [1995, 1993, 1991]) {
      expect(suggestTeam(year, "spieler", NOV_2026)?.alternative).toContain(
        "Herren (1., 2. oder 3. Mannschaft)",
      );
    }
    expect(suggestTeam(1990, "spieler", NOV_2026)?.alternative).toBeUndefined();
    expect(suggestTeam(1996, "spieler", NOV_2026)?.alternative).toBeUndefined();
  });

  it("gives no suggestion outside the plausible range", () => {
    expect(suggestTeam(2024, "spieler", NOV_2026)).toBeNull();
    expect(suggestTeam(1939, "spieler", NOV_2026)).toBeNull();
    expect(suggestTeam(Number.NaN, "spieler", NOV_2026)).toBeNull();
  });
});

describe("suggestTeam: Mädchen", () => {
  it("suggests the Juniorinnen teams from E (U11) to B (U17)", () => {
    expect(title(2017, "spielerin")).toBe("E-Juniorinnen (U11)");
    expect(title(2016, "spielerin")).toBe("E-Juniorinnen (U11)");
    expect(title(2015, "spielerin")).toBe("D-Juniorinnen (U13)");
    expect(title(2014, "spielerin")).toBe("D-Juniorinnen (U13)");
    expect(title(2013, "spielerin")).toBe("C-Juniorinnen (U15)");
    expect(title(2012, "spielerin")).toBe("C-Juniorinnen (U15)");
    expect(title(2011, "spielerin")).toBe("B-Juniorinnen (U17)");
    expect(title(2010, "spielerin")).toBe("B-Juniorinnen (U17)");
  });

  it("offers the boys team of the same year as an alternative", () => {
    expect(suggestTeam(2014, "spielerin", NOV_2026)?.alternative).toContain(
      "D-Junioren (U13)",
    );
  });

  it("lets girls below E-Jugend play with the boys", () => {
    const s = suggestTeam(2018, "spielerin", NOV_2026);
    expect(s?.title).toBe("F-Junioren (U9)");
    expect(s?.note).toContain("bei den Jungs");
    expect(title(2020, "spielerin")).toBe("G-Junioren");
    expect(title(2022, "spielerin")).toBe("Fußballkindergarten (Bambini)");
  });

  it("assigns older girls and women personally", () => {
    for (const year of [2009, 2008, 2000, 1990]) {
      const s = suggestTeam(year, "spielerin", NOV_2026);
      expect(s?.personal).toBe(true);
    }
  });
});

describe("tooYoungMessage", () => {
  it("explains the minimum age for the Fußballkindergarten", () => {
    expect(tooYoungMessage(2024, NOV_2026)).toContain("mindestens 4 Jahre");
    expect(tooYoungMessage(2024, NOV_2026)).toContain("Jahrgang 2023");
    expect(tooYoungMessage(2026, NOV_2026)).toContain("mindestens 4 Jahre");
  });

  it("stays silent for old enough children and for typos", () => {
    expect(tooYoungMessage(2023, NOV_2026)).toBeNull();
    expect(tooYoungMessage(2014, NOV_2026)).toBeNull();
    // Geburtsjahr in der Zukunft: Tippfehler, kein "zu jung"
    expect(tooYoungMessage(2030, NOV_2026)).toBeNull();
  });
});
