import { describe, expect, test } from "vitest";

import {
  currentFupaSeasonName,
  currentFupaSeasonSlug,
  fupaSeasonStartYear,
  fupaSlugCandidates,
  newestStoredFupaSlug,
  previousFupaSeasonSlug,
  resolveFupaSlug,
  toCurrentSeasonSlug,
  toPreviousSeasonSlug,
} from "@/lib/fupa";

// Monatsindex ist 0-basiert: new Date(2026, 6, 1) = 1. Juli 2026.
const JUL_2026 = new Date(2026, 6, 16);
const JUN_30_2026 = new Date(2026, 5, 30);
const JUL_1_2026 = new Date(2026, 6, 1);
const OCT_2026 = new Date(2026, 9, 15);
const MAR_2026 = new Date(2026, 2, 15);
const JAN_2027 = new Date(2027, 0, 20);

describe("fupaSeasonStartYear", () => {
  test("season flips on July 1st", () => {
    expect(fupaSeasonStartYear(JUN_30_2026)).toBe(2025);
    expect(fupaSeasonStartYear(JUL_1_2026)).toBe(2026);
  });

  test("January belongs to the previous calendar year's season", () => {
    expect(fupaSeasonStartYear(JAN_2027)).toBe(2026);
  });
});

describe("season slugs and labels", () => {
  test("currentFupaSeasonSlug", () => {
    expect(currentFupaSeasonSlug(JUL_2026)).toBe("2026-27");
    expect(currentFupaSeasonSlug(JUN_30_2026)).toBe("2025-26");
  });

  test("previousFupaSeasonSlug", () => {
    expect(previousFupaSeasonSlug(JUL_2026)).toBe("2025-26");
  });

  test("currentFupaSeasonName", () => {
    expect(currentFupaSeasonName(JUL_2026)).toBe("26/27");
    expect(currentFupaSeasonName(JUN_30_2026)).toBe("25/26");
  });

  test("century rollover pads the two-digit year", () => {
    const jul2099 = new Date(2099, 6, 1);
    expect(currentFupaSeasonSlug(jul2099)).toBe("2099-00");
    expect(currentFupaSeasonName(jul2099)).toBe("99/00");
  });
});

describe("toCurrentSeasonSlug", () => {
  test("full-season suffix (seniors)", () => {
    expect(
      toCurrentSeasonSlug("sv-nord-muenchen-lerchenau-m1-2025-26", JUL_2026),
    ).toBe("sv-nord-muenchen-lerchenau-m1-2026-27");
  });

  test("half-season suffix maps to autumn during Jul-Jan", () => {
    expect(
      toCurrentSeasonSlug(
        "sg-n-lerchenau-fasanerie-n-u19-1-spring2026",
        OCT_2026,
      ),
    ).toBe("sg-n-lerchenau-fasanerie-n-u19-1-autumn2026");
    expect(
      toCurrentSeasonSlug(
        "sg-n-lerchenau-fasanerie-n-u19-1-autumn2025",
        JAN_2027,
      ),
    ).toBe("sg-n-lerchenau-fasanerie-n-u19-1-autumn2026");
  });

  test("half-season suffix maps to spring during Feb-Jun", () => {
    expect(
      toCurrentSeasonSlug(
        "sg-n-lerchenau-fasanerie-n-u19-1-autumn2025",
        MAR_2026,
      ),
    ).toBe("sg-n-lerchenau-fasanerie-n-u19-1-spring2026");
  });

  test("calendar-year suffix (Ehrenliga)", () => {
    expect(
      toCurrentSeasonSlug("sv-nord-muenchen-lerchenau-o32-1-2025", JUL_2026),
    ).toBe("sv-nord-muenchen-lerchenau-o32-1-2026");
  });

  test("slug without season suffix stays untouched", () => {
    expect(toCurrentSeasonSlug("sv-nord-muenchen-lerchenau", JUL_2026)).toBe(
      "sv-nord-muenchen-lerchenau",
    );
  });
});

describe("toPreviousSeasonSlug", () => {
  test("full-season suffix goes back one season", () => {
    expect(
      toPreviousSeasonSlug("sv-nord-muenchen-lerchenau-m1-2026-27", JUL_2026),
    ).toBe("sv-nord-muenchen-lerchenau-m1-2025-26");
  });

  test("half-season suffix goes back one season within the same half", () => {
    expect(
      toPreviousSeasonSlug(
        "sg-n-lerchenau-fasanerie-n-u19-1-autumn2026",
        OCT_2026,
      ),
    ).toBe("sg-n-lerchenau-fasanerie-n-u19-1-autumn2025");
  });

  test("calendar-year suffix goes back one year", () => {
    expect(
      toPreviousSeasonSlug("sv-nord-muenchen-lerchenau-o32-1-2026", JUL_2026),
    ).toBe("sv-nord-muenchen-lerchenau-o32-1-2025");
  });
});

describe("fupaSlugCandidates", () => {
  test("empty meta yields no candidates", () => {
    expect(fupaSlugCandidates(null, JUL_2026)).toEqual([]);
    expect(fupaSlugCandidates({}, JUL_2026)).toEqual([]);
  });

  test("senior slug: current season first, stored second, no dupes", () => {
    expect(
      fupaSlugCandidates(
        { slug: "sv-nord-muenchen-lerchenau-m1-2025-26" },
        JUL_2026,
      ),
    ).toEqual([
      "sv-nord-muenchen-lerchenau-m1-2026-27",
      "sv-nord-muenchen-lerchenau-m1-2025-26",
    ]);
  });

  test("youth SG in autumn: upgrade first, then stored newest-first", () => {
    expect(
      fupaSlugCandidates(
        {
          autumnSlug: "sg-n-lerchenau-fasanerie-n-u19-1-autumn2025",
          springSlug: "sg-n-lerchenau-fasanerie-n-u19-1-spring2026",
        },
        OCT_2026,
      ),
    ).toEqual([
      // both stored slugs upgrade to the same autumn2026 slug (deduped)
      "sg-n-lerchenau-fasanerie-n-u19-1-autumn2026",
      // stored slugs by recency: spring2026 ends Jun 2026, autumn2025 ends Jan 2026
      "sg-n-lerchenau-fasanerie-n-u19-1-spring2026",
      "sg-n-lerchenau-fasanerie-n-u19-1-autumn2025",
    ]);
  });

  test("spring window includes the just-finished autumn half of the SAME season", () => {
    // Anfang Feb existiert spring2027 auf fupa meist noch nicht —
    // autumn2026 (endete im Januar) muss vor den Vorjahres-Slugs kommen.
    expect(
      fupaSlugCandidates(
        {
          autumnSlug: "sg-x-u19-1-autumn2025",
          springSlug: "sg-x-u19-1-spring2026",
        },
        new Date(2027, 1, 5),
      ),
    ).toEqual([
      "sg-x-u19-1-spring2027",
      "sg-x-u19-1-autumn2026",
      "sg-x-u19-1-spring2026",
      "sg-x-u19-1-autumn2025",
    ]);
  });

  test("fallbacks are ordered by recency across tiers (youth, one year later)", () => {
    expect(
      fupaSlugCandidates(
        {
          autumnSlug: "sg-x-u19-1-autumn2025",
          springSlug: "sg-x-u19-1-spring2026",
        },
        new Date(2027, 9, 15),
      ),
    ).toEqual([
      "sg-x-u19-1-autumn2027",
      "sg-x-u19-1-spring2027",
      "sg-x-u19-1-autumn2026",
      "sg-x-u19-1-spring2026",
      "sg-x-u19-1-autumn2025",
    ]);
  });

  test("fallbacks are ordered by recency across tiers (senior, two seasons old)", () => {
    // Einsaison-alter Downgrade-Slug muss VOR dem zwei Saisons alten
    // gespeicherten Slug probiert werden.
    expect(
      fupaSlugCandidates({ slug: "sv-x-m1-2026-27" }, new Date(2028, 6, 5)),
    ).toEqual(["sv-x-m1-2028-29", "sv-x-m1-2027-28", "sv-x-m1-2026-27"]);
  });

  test("already-current slug produces no duplicate entries", () => {
    const candidates = fupaSlugCandidates(
      { slug: "sv-nord-muenchen-lerchenau-m1-2026-27" },
      JUL_2026,
    );
    expect(candidates).toEqual([
      "sv-nord-muenchen-lerchenau-m1-2026-27",
      "sv-nord-muenchen-lerchenau-m1-2025-26",
    ]);
    expect(new Set(candidates).size).toBe(candidates.length);
  });
});

describe("newestStoredFupaSlug", () => {
  test("returns the stored slug with the freshest season suffix", () => {
    expect(
      newestStoredFupaSlug({
        autumnSlug: "sg-x-u19-1-autumn2025",
        springSlug: "sg-x-u19-1-spring2026",
      }),
    ).toBe("sg-x-u19-1-spring2026");
    expect(newestStoredFupaSlug({ slug: "sv-x-m1-2026-27" })).toBe(
      "sv-x-m1-2026-27",
    );
  });

  test("returns null without stored slugs", () => {
    expect(newestStoredFupaSlug(null)).toBeNull();
    expect(newestStoredFupaSlug({})).toBeNull();
  });
});

describe("resolveFupaSlug", () => {
  test("returns the best candidate", () => {
    expect(
      resolveFupaSlug(
        { slug: "sv-nord-muenchen-lerchenau-m1-2025-26" },
        JUL_2026,
      ),
    ).toBe("sv-nord-muenchen-lerchenau-m1-2026-27");
  });

  test("returns null for missing meta", () => {
    expect(resolveFupaSlug(null, JUL_2026)).toBeNull();
    expect(resolveFupaSlug({}, JUL_2026)).toBeNull();
  });
});
