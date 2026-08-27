import { describe, expect, it } from "vitest";

import { clubAddress, primaryAddressOf } from "@/lib/club-address";

/**
 * Der Grund, warum es dieses Modul gibt, ist der Rueckfall: eine leere oder
 * halb ausgefuellte Adresse im CMS darf keine Rechtsseite ohne Anschrift
 * erzeugen. Genau diese Zweige werden hier geprueft, nicht der Normalfall.
 */
describe("clubAddress", () => {
  it("faellt ohne Adresse vollstaendig auf die mitgelieferte zurueck", () => {
    expect(clubAddress(null).oneLine).toBe(
      "Ebereschenstraße 17, 80935 München",
    );
  });

  it("faellt je Feld zurueck, nicht als Ganzes", () => {
    const partial = clubAddress({
      street: "   ",
      postalCode: "80331",
      city: "München",
    });
    expect(partial.street).toBe("Ebereschenstraße 17");
    expect(partial.postalCode).toBe("80331");
    expect(partial.cityLine).toBe("80331 München");
  });

  it("uebernimmt eine vollstaendig gepflegte Adresse", () => {
    const moved = clubAddress({
      street: "Musterweg 1",
      postalCode: "80331",
      city: "München",
    });
    expect(moved.lines).toEqual(["Musterweg 1", "80331 München"]);
  });
});

describe("primaryAddressOf", () => {
  it("nimmt den ersten Eintrag", () => {
    expect(
      primaryAddressOf({ addresses: [{ street: "A" }, { street: "B" }] }),
    ).toEqual({ street: "A" });
  });

  it("liefert null, wenn nichts Brauchbares dasteht", () => {
    expect(primaryAddressOf({})).toBeNull();
    expect(primaryAddressOf({ addresses: [] })).toBeNull();
    expect(primaryAddressOf({ addresses: "kaputt" })).toBeNull();
    expect(primaryAddressOf({ addresses: [null] })).toBeNull();
  });

  it("ergibt zusammen mit clubAddress immer eine vollstaendige Anschrift", () => {
    const address = clubAddress(primaryAddressOf({ addresses: [null] }));
    expect(address.oneLine).toBe("Ebereschenstraße 17, 80935 München");
  });
});
