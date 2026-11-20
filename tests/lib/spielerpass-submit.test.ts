import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildKopiervorlage,
  buildMail,
  decodePdf,
  recipients,
  spielerpassSubmitSchema,
} from "@/lib/spielerpass-submit";

const PDF_B64 = Buffer.from("%PDF-1.7\n" + "x".repeat(200)).toString("base64");

const valid = {
  kind: "junioren",
  gender: "maennlich",
  lastName: "Nowak",
  firstName: "Łukasz",
  birthDate: "2014-03-09",
  street: "Ebereschenstraße 15",
  postalCode: "80935",
  city: "München",
  nationality: "polnisch",
  birthPlace: "Kraków",
  change: "vereinswechsel",
  previousClub: "TSV Beispielhausen",
  passNumber: "1234-5678",
  email: "eltern@example.org",
  pdf: PDF_B64,
};

describe("spielerpassSubmitSchema", () => {
  it("nimmt einen vollständigen Antrag an", () => {
    expect(spielerpassSubmitSchema.safeParse(valid).success).toBe(true);
  });
  it("verlangt den bisherigen Verein beim Wechsel", () => {
    const r = spielerpassSubmitSchema.safeParse({ ...valid, previousClub: "" });
    expect(r.success).toBe(false);
  });
  it("erlaubt eine fehlende Passnummer, aber keine falsche", () => {
    expect(
      spielerpassSubmitSchema.safeParse({ ...valid, passNumber: "" }).success,
    ).toBe(true);
    expect(
      spielerpassSubmitSchema.safeParse({ ...valid, passNumber: "123" })
        .success,
    ).toBe(false);
  });
  it("lehnt ungültige E-Mail, PLZ und Datum ab", () => {
    for (const bad of [
      { email: "x" },
      { postalCode: "8093" },
      { birthDate: "09.03.2014" },
    ]) {
      expect(
        spielerpassSubmitSchema.safeParse({ ...valid, ...bad }).success,
      ).toBe(false);
    }
  });
  it("lehnt ein zu grosses PDF ab", () => {
    const big = "A".repeat(3_000_001);
    expect(
      spielerpassSubmitSchema.safeParse({ ...valid, pdf: big }).success,
    ).toBe(false);
  });
});

describe("decodePdf", () => {
  it("erkennt ein PDF am Dateikopf", () => {
    expect(decodePdf(PDF_B64)?.subarray(0, 5).toString()).toBe("%PDF-");
  });
  it("lehnt andere Dateien und kaputtes Base64 ab", () => {
    expect(decodePdf(Buffer.from("GIF89a....").toString("base64"))).toBeNull();
    expect(decodePdf("kein base64!")).toBeNull();
  });
});

describe("Mail", () => {
  const data = spielerpassSubmitSchema.parse(valid);
  const { pdf: _pdf, website: _w, ...d } = data;
  void _pdf;
  void _w;

  it("Kopiervorlage in Formularreihenfolge, mit Originalschreibweise", () => {
    expect(buildKopiervorlage(d).split("\n")).toEqual([
      "Antragsart: Vereinswechsel",
      "Familienname: Nowak",
      "Vorname: Łukasz",
      "Geburtsdatum: 09.03.2014",
      "Geschlecht: männlich",
      "Straße, Haus-Nr.: Ebereschenstraße 15",
      "PLZ: 80935",
      "Wohnort: München",
      "Staatsangehörigkeit: polnisch",
      "Geburtsort: Kraków",
      "Letzter Verein: TSV Beispielhausen",
      "Passnummer des letzten Vereins: 12345678",
    ]);
  });

  it("Betreff, Rückfragen-Adresse und Hinweise", () => {
    const { subject, text, fileName } = buildMail(
      d,
      new Date("2026-11-20T17:00:00Z"),
    );
    expect(subject).toBe(
      "Spielerpass-Antrag · Nowak, Łukasz (Junioren/Juniorinnen, Vereinswechsel)",
    );
    expect(fileName).toBe("Antrag-Spielberechtigung-Nowak-Lukasz.pdf");
    expect(text).not.toContain("beim BFV klären");
    expect(text).toContain("Rückfragen an: eltern@example.org");
    expect(text).toContain("KOPIERVORLAGE FÜR SPIELPLUS");
    expect(text).toContain("20.11.26, 18:00");
  });
});

describe("recipients", () => {
  it("nutzt standardmäßig info@ und vertrag@", () => {
    expect(recipients(undefined)).toEqual([
      "info@svnord.de",
      "vertrag@svnord.de",
    ]);
    expect(recipients("")).toEqual(["info@svnord.de", "vertrag@svnord.de"]);
  });
  it("liest eine kommagetrennte Liste und ignoriert Ungültiges", () => {
    expect(recipients(" a@example.org , kaputt, b@example.org ")).toEqual([
      "a@example.org",
      "b@example.org",
    ]);
    expect(recipients("kaputt")).toEqual([
      "info@svnord.de",
      "vertrag@svnord.de",
    ]);
  });
});

describe("POST /api/spielerpass", () => {
  const send = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
    vi.doMock("resend", () => ({
      Resend: class {
        emails = { send };
      },
    }));
    process.env.RESEND_API_KEY = "key";
    process.env.RESEND_FROM_EMAIL = "from@example.org";
    delete process.env.SPIELERPASS_TO_EMAIL;
  });

  const call = async (body: unknown) => {
    const { POST } = await import("@/app/(frontend)/api/spielerpass/route");
    return POST(
      new Request("http://x/api/spielerpass", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  };

  it("schickt Mail mit PDF-Anhang an info@ und vertrag@", async () => {
    const res = await call(valid);
    expect(res.status).toBe(200);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toEqual(["info@svnord.de", "vertrag@svnord.de"]);
    expect(arg.replyTo).toBe("eltern@example.org");
    expect(arg.attachments).toHaveLength(1);
    expect(arg.attachments[0].content.subarray(0, 5).toString()).toBe("%PDF-");
    expect(arg.text).toContain("Familienname: Nowak");
  });

  it("SPIELERPASS_TO_EMAIL überschreibt die Empfänger", async () => {
    process.env.SPIELERPASS_TO_EMAIL = "test@example.org";
    await call(valid);
    expect(send.mock.calls[0][0].to).toEqual(["test@example.org"]);
  });

  it("Honeypot: Erfolg vortäuschen, nichts senden", async () => {
    const res = await call({ ...valid, website: "spam" });
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("400 bei falschen Angaben oder Nicht-PDF", async () => {
    expect((await call({ ...valid, postalCode: "1" })).status).toBe(400);
    const notPdf = Buffer.from("nope".repeat(50)).toString("base64");
    expect((await call({ ...valid, pdf: notPdf })).status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("502, wenn Resend fehlschlägt; 503 ohne Konfiguration", async () => {
    send.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect((await call(valid)).status).toBe(502);
    delete process.env.RESEND_API_KEY;
    expect((await call(valid)).status).toBe(503);
  });
});
