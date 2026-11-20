import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import {
  ANTRAG_KINDS,
  ANTRAG_TEMPLATE,
  antragFileName,
  buildAntragFields,
  formatBirthDate,
  isGermanNationality,
  normalizePassNumber,
  toPdfText,
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
    expect(f.checks).toEqual(["Geschlecht männlich", "Erstausstellung"]);
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
    expect(f.checks).toEqual(["Geschlecht weiblich", "Vereinswechsel 01"]);
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
    ]);
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
    ];
    for (const s of samples) {
      const { text, checks } = buildAntragFields(s);
      for (const n of [...Object.keys(text), ...checks]) {
        expect(names.has(n), `Feld fehlt in der Vorlage: ${n}`).toBe(true);
      }
    }
  });
});
