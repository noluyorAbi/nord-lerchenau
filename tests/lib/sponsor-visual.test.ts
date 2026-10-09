import { describe, expect, it } from "vitest";

import { logoBox } from "@/lib/sponsor-visual";

describe("logoBox", () => {
  it("gibt gleich großen Logos gleiche Fläche, egal welches Format", () => {
    const wide = logoBox(300, 100, 12000, 200)!;
    const square = logoBox(500, 500, 12000, 200)!;
    // Auf ganze Pixel gerundet, daher ein Prozent Spielraum.
    expect(Math.abs(wide.width * wide.height - 12000)).toBeLessThan(120);
    expect(Math.abs(square.width * square.height - 12000)).toBeLessThan(120);
  });

  it("deckelt hohe Logos, damit sie nicht aus der Kachel ragen", () => {
    const box = logoBox(500, 500, 14000, 96)!;
    expect(box).toEqual({ width: 96, height: 96 });
  });

  it("behält das Seitenverhältnis", () => {
    const box = logoBox(800, 80, 14000, 96)!;
    expect(box.width / box.height).toBeCloseTo(10, 0);
  });

  it("liefert nichts ohne Maße", () => {
    expect(logoBox(null, 100, 14000, 96)).toBeNull();
    expect(logoBox(100, 0, 14000, 96)).toBeNull();
  });
});
