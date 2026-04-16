import { describe, expect, test } from "vitest";

import { slug } from "@/lib/slug";

describe("slug", () => {
  test("lowercases and joins with hyphens", () => {
    expect(slug("Senioren A")).toBe("senioren-a");
  });

  test("transliterates German umlauts", () => {
    expect(slug("Müller-Höhe")).toBe("mueller-hoehe");
    expect(slug("Schöner Tag")).toBe("schoener-tag");
    expect(slug("Größe")).toBe("groesse");
    expect(slug("ÄÖÜ ßeta")).toBe("aeoeue-sseta");
  });

  test("collapses repeat separators", () => {
    expect(slug("  A   B---C  ")).toBe("a-b-c");
  });

  test("strips other diacritics", () => {
    expect(slug("Café Crème")).toBe("cafe-creme");
  });

  test("returns empty string for empty input", () => {
    expect(slug("")).toBe("");
    expect(slug("   ")).toBe("");
  });
});
