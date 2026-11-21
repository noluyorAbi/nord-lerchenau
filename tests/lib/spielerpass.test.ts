import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { CHANGE_OPTIONS, WAIT_REASONS } from "@/lib/spielerpass-options";
import {
  ANTRAG_KINDS,
  ANTRAG_TEMPLATE,
  antragFileName,
  buildAntragFields,
  formatBirthDate,
  isGermanNationality,
  normalizePassNumber,
  signatureNeeds,
  toPdfText,
  usesAdultTransferRules,
  type AntragData,
} from "@/lib/spielerpass";

const base: AntragData = {
  kind: "junioren",
  gender: "maennlich",
  lastName: "Mustermann",
  firstName: "Max",
  birthDate: "2014-05-03",
  street: "Lerchenauer Str. 1",
  postalCode: "80935",
  city: "München",
  nationality: "deutsch",
  birthPlace: "München",
  change: "erstausstellung",
  sanction: false,
};

describe("toPdfText", () => {
  it("lässt Umlaute und ß unverändert", () => {
    expect(toPdfText("Müller-Öztürk Straße")).toEqual({
      text: "Müller-Öztürk Straße",
      simplified: false,
    });
  });
  it("vereinfacht Zeichen ausserhalb der PDF-Schrift", () => {
    expect(toPdfText("Şahin Yağız")).toEqual({
      text: "Sahin Yagiz",
      simplified: true,
    });
    expect(toPdfText("Łukasz")).toEqual({ text: "Lukasz", simplified: true });
  });
  it("nutzt die Zeichenmenge der eingebetteten Schrift", () => {
    const font = new Set([..."Şahin"].map((c) => c.codePointAt(0)!));
    expect(toPdfText("Şahin", (cp) => font.has(cp))).toEqual({
      text: "Şahin",
      simplified: false,
    });
    expect(toPdfText("Şağ", (cp) => font.has(cp)).simplified).toBe(true);
  });
  it("ersetzt nicht Lateinisches durch ?", () => {
    expect(toPdfText("Иван").text).toBe("????");
  });
});

describe("Hilfsfunktionen", () => {
  it("formatiert das Geburtsdatum", () => {
    expect(formatBirthDate("2014-05-03")).toBe("03.05.2014");
    expect(formatBirthDate("")).toBe("");
    expect(formatBirthDate("03.05.2014")).toBe("");
  });
  it("prüft Passnummern", () => {
    expect(normalizePassNumber("1234-5678")).toBe("12345678");
    expect(normalizePassNumber(" 12 34 56 78 ")).toBe("12345678");
    expect(normalizePassNumber("1234567")).toBeNull();
    expect(normalizePassNumber("1234 5678 9")).toBeNull();
  });
  it("erkennt deutsche Staatsangehörigkeit", () => {
    expect(isGermanNationality("Deutsch")).toBe(true);
    expect(isGermanNationality("")).toBe(true);
    expect(isGermanNationality("türkisch")).toBe(false);
  });
  it("baut den Dateinamen", () => {
    expect(antragFileName({ lastName: "Müller", firstName: "Max Paul" })).toBe(
      "Antrag-Spielberechtigung-Muller-Max-Paul.pdf",
    );
    expect(antragFileName({ lastName: "Łukasz", firstName: "Şahin" })).toBe(
      "Antrag-Spielberechtigung-Lukasz-Sahin.pdf",
    );
    expect(antragFileName({ lastName: "", firstName: "" })).toBe(
      "Antrag-Spielberechtigung.pdf",
    );
  });
});

describe("signatureNeeds", () => {
  const now = new Date("2026-11-21T12:00:00Z"); // Spieljahr 2026/27
  it("E-, F- und G-Junioren: nur die Eltern unterschreiben", () => {
    // U11 = Jahrgang 2016, U7 = 2020
    expect(signatureNeeds("2016-03-09", now)).toEqual({
      player: false,
      guardian: true,
    });
    expect(signatureNeeds("2020-01-01", now)).toEqual({
      player: false,
      guardian: true,
    });
  });
  it("ab D-Junioren unterschreiben Spieler und Eltern", () => {
    // U12 = Jahrgang 2015
    expect(signatureNeeds("2015-06-30", now)).toEqual({
      player: true,
      guardian: true,
    });
    expect(signatureNeeds("2010-02-01", now)).toEqual({
      player: true,
      guardian: true,
    });
  });
  it("Volljährige brauchen keine Unterschrift der Eltern", () => {
    expect(signatureNeeds("2008-11-21", now)).toEqual({
      player: true,
      guardian: false,
    });
    // am Vortag des 18. Geburtstags noch Eltern
    expect(signatureNeeds("2008-11-22", now)).toEqual({
      player: true,
      guardian: true,
    });
  });
  it("das Spieljahr wechselt am 1. Juli", () => {
    // Jahrgang 2016 ist im Juni 2026 noch U10 (Spieljahr 2025/26), im Juli U11
    expect(
      signatureNeeds("2015-06-30", new Date("2026-06-15T12:00:00Z")),
    ).toEqual({ player: false, guardian: true });
  });
  it("entspricht der BFV-Tabelle für 2026/27 und rückt jedes Jahr von selbst vor", () => {
    // BFV: D 2014/2015, E 2016/2017, F 2018/2019, G ab 2020
    const needsPlayer = (y: number, d: Date) =>
      signatureNeeds(`${y}-10-01`, d)?.player;
    expect(needsPlayer(2014, now)).toBe(true);
    expect(needsPlayer(2015, now)).toBe(true);
    expect(needsPlayer(2016, now)).toBe(false);
    expect(needsPlayer(2020, now)).toBe(false);
    // ein Jahr später: dann sind 2016/2017 die D-Junioren (U13/U12)
    const next = new Date("2027-11-21T12:00:00Z");
    expect(needsPlayer(2016, next)).toBe(true);
    expect(needsPlayer(2017, next)).toBe(false);
    // Jahrgang zählt, nicht das genaue Alter: Dez. 2015 ist im Nov. 2026
    // noch 10 Jahre alt, aber D-Junior
    expect(signatureNeeds("2015-12-31", now)?.player).toBe(true);
  });
  it("ungültige oder zukünftige Daten: null", () => {
    expect(signatureNeeds("", now)).toBeNull();
    expect(signatureNeeds("2026-02-30", now)).toBeNull();
    expect(signatureNeeds("2027-01-01", now)).toBeNull();
    expect(signatureNeeds("1900-01-01", now)).toBeNull();
  });
});

describe("usesAdultTransferRules", () => {
  const now = new Date("2026-11-21T12:00:00Z"); // Spieljahr 2026/27
  it("ältere A-Junioren (Jahrgang 2008) und ältere B-Juniorinnen (2010)", () => {
    expect(usesAdultTransferRules("2008-05-01", "maennlich", now)).toBe(true);
    expect(usesAdultTransferRules("2008-05-01", "weiblich", now)).toBe(true);
    expect(usesAdultTransferRules("2010-05-01", "weiblich", now)).toBe(true);
    // ältere B-Junioren (männlich) fallen nicht darunter
    expect(usesAdultTransferRules("2010-05-01", "maennlich", now)).toBe(false);
  });
  it("jüngere Jahrgänge und leere Eingaben nicht", () => {
    expect(usesAdultTransferRules("2009-05-01", "maennlich", now)).toBe(false);
    expect(usesAdultTransferRules("2012-05-01", "weiblich", now)).toBe(false);
    expect(usesAdultTransferRules("", "", now)).toBe(false);
  });
  it("rückt mit dem Spieljahr vor", () => {
    expect(
      usesAdultTransferRules(
        "2009-05-01",
        "maennlich",
        new Date("2027-11-21T12:00:00Z"),
      ),
    ).toBe(true);
  });
});

describe("buildAntragFields", () => {
  it("Junioren, Erstausstellung", () => {
    const f = buildAntragFields(base);
    expect(f.text).toMatchObject({
      Vereinsnummer: "1325",
      Vereinsname: "SV Nord München-Lerchenau e.V.",
      Familienname: "Mustermann",
      Geburtsdatum: "03.05.2014",
      "Straße, Haus-Nr": "Lerchenauer Str. 1",
    });
    expect(f.text).not.toHaveProperty("Letzter Verein");
    expect(f.checks).toEqual([
      "Geschlecht männlich",
      "Erstausstellung",
      "Sportgerichtsverfahren nein 3",
    ]);
    expect(f.simplified).toBe(false);
  });

  it("Junioren, Vereinswechsel mit Passnummer", () => {
    const f = buildAntragFields({
      ...base,
      gender: "weiblich",
      change: "vereinswechsel",
      previousClub: "FC Beispiel",
      passNumber: "1234-5678",
    });
    expect(f.text["Letzter Verein"]).toBe("FC Beispiel");
    expect(f.text["Passnr. letzter Verein 01"]).toBe("1234");
    expect(f.text["Passnr. letzter Verein 02"]).toBe("5678");
    expect(f.text["Bisheriger Verein Einverständnis 2"]).toBe("FC Beispiel");
    expect(f.checks).toEqual([
      "Geschlecht weiblich",
      "Vereinswechsel 01",
      "Sportgerichtsverfahren nein 3",
    ]);
  });

  it("Erwachsene: eigene Feldnamen und Status", () => {
    const f = buildAntragFields({
      ...base,
      kind: "erwachsene",
      change: "vereinswechsel",
      previousClub: "FC Beispiel",
      status: "vertragsspieler",
      abroadResidence: "Wien",
    });
    expect(f.text["Straße, Hausnr"]).toBe("Lerchenauer Str. 1");
    expect(f.text["Letzter Wohnort Ausland"]).toBe("Wien");
    expect(f.text["Bisheriger Verein Einverständnis 1"]).toBe("FC Beispiel");
    expect(f.checks).toEqual([
      "Geschlecht männlich",
      "Vereinswechsel",
      "Vertragsspieler",
      "Sportgerichtsverfahren nein",
    ]);
  });

  it("Sportgerichtsverfahren mit Zeitraum", () => {
    const jun = buildAntragFields({
      ...base,
      sanction: true,
      sanctionFrom: "2026-10-01",
      sanctionTo: "2026-12-31",
    });
    expect(jun.checks).toContain("Sportgerichtsverfahren ja 3");
    expect(jun.text["Sportgerichtsverfahren von 3"]).toBe("01.10.2026");
    expect(jun.text["Sportgerichtsverfahren bis 3"]).toBe("31.12.2026");
    const erw = buildAntragFields({
      ...base,
      kind: "erwachsene",
      sanction: true,
    });
    expect(erw.checks).toContain("Sportgerichtsverfahren ja");
  });

  it("Wartezeit-Grund kreuzt Seite 2 und den Paragrafen auf Seite 1 an", () => {
    const jun = buildAntragFields({
      ...base,
      change: "vereinswechsel",
      previousClub: "FC Beispiel",
      waitReasons: ["b", "c-studium"],
    });
    expect(jun.checks).toEqual(
      expect.arrayContaining([
        "Vereinswechsel 03",
        "Vereinswechsel 04",
        "Entfall Wartezeit 02",
        "Entfall Wartezeit 05",
      ]),
    );
    expect(jun.checks).not.toContain("Vereinswechsel 01");

    const erw = buildAntragFields({
      ...base,
      kind: "erwachsene",
      change: "vereinswechsel",
      previousClub: "FC Beispiel",
      waitReasons: ["2"],
    });
    expect(erw.checks).toContain("Vereinswechsel  §44 SpO");
    expect(erw.checks).toContain("§44 Option 2");
    expect(erw.checks).not.toContain("Vereinswechsel");
  });

  it("weitere Antragsarten und Sonstiges", () => {
    const sonst = buildAntragFields({
      ...base,
      kind: "erwachsene",
      change: "sonstiges",
      otherText: "Nachmeldung",
    });
    expect(sonst.checks).toContain("Sonstiges 3");
    expect(sonst.text["Sonstiges Text"]).toBe("Nachmeldung");
  });

  it("meldet vereinfachte Zeichen", () => {
    expect(buildAntragFields({ ...base, lastName: "Şahin" }).simplified).toBe(
      true,
    );
  });
});

// Die Feldnamen stammen aus den BFV-Vorlagen. Wenn der BFV sie ändert und wir
// eine neue Vorlage einspielen, fällt das hier auf statt im Browser.
describe.each(ANTRAG_KINDS)("Vorlage %s", (kind) => {
  it("enthält jedes Feld, das wir ausfüllen", async () => {
    const file = join(process.cwd(), "public", ANTRAG_TEMPLATE[kind]);
    const form = (await PDFDocument.load(readFileSync(file))).getForm();
    const names = new Set(form.getFields().map((f) => f.getName()));

    const samples: AntragData[] = [
      {
        ...base,
        kind,
        change: "vereinswechsel",
        previousClub: "FC Beispiel",
        passNumber: "12345678",
        status: "amateur",
        abroadResidence: "Wien",
        abroadClub: "SK Beispiel",
      },
      { ...base, kind, gender: "weiblich" },
      {
        ...base,
        kind,
        sanction: true,
        sanctionFrom: "2026-10-01",
        sanctionTo: "2026-12-31",
        otherText: "x",
      },
      // jede Antragsart und jeder Wartezeit-Grund
      ...CHANGE_OPTIONS[kind].map((o) => ({
        ...base,
        kind,
        change: o.value,
        previousClub: "FC Beispiel",
        otherText: "x",
      })),
      {
        ...base,
        kind,
        change: "vereinswechsel" as const,
        previousClub: "FC Beispiel",
        waitReasons: WAIT_REASONS[kind].map((r) => r.id),
      },
    ];
    for (const s of samples) {
      const { text, checks } = buildAntragFields(s);
      for (const n of [...Object.keys(text), ...checks]) {
        expect(names.has(n), `Feld fehlt in der Vorlage: ${n}`).toBe(true);
      }
    }
  });
});
