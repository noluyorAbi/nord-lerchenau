import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  FUPA_PLACEHOLDER_PLAYER_IMAGE,
  FUPA_PLACEHOLDER_TEAM_IMAGE,
  fupaImage,
  fupaSeasonLabelFromSlug,
  getFupaTeamPhoto,
  isFupaPlaceholderImage,
  resolveLiveFupaSquadSlug,
  type FupaImage,
} from "@/lib/fupa";

const AUG_2026 = new Date(2026, 7, 7);

const realImage: FupaImage = {
  path: "https://image.fupa.net/team-image/U9SmUH34H9Qx/",
  description: "",
  source: "Isabelle Wallbrunn",
  svg: false,
};

describe("isFupaPlaceholderImage", () => {
  test("detects the global team and player placeholders", () => {
    expect(
      isFupaPlaceholderImage({
        path: `${FUPA_PLACEHOLDER_TEAM_IMAGE}/`,
        description: null,
        source: null,
        svg: false,
      }),
    ).toBe(true);
    expect(
      isFupaPlaceholderImage({
        path: FUPA_PLACEHOLDER_PLAYER_IMAGE,
        description: null,
        source: null,
        svg: false,
      }),
    ).toBe(true);
  });

  test("keeps real photos and tolerates missing images", () => {
    expect(isFupaPlaceholderImage(realImage)).toBe(false);
    expect(isFupaPlaceholderImage(null)).toBe(false);
  });
});

describe("fupaImage", () => {
  test("builds a sized url for a real photo", () => {
    expect(fupaImage(realImage, "960x540", "webp")).toBe(
      "https://image.fupa.net/team-image/U9SmUH34H9Qx/960x540.webp",
    );
  });

  test("returns null for placeholders so consumers fall back to initials", () => {
    expect(
      fupaImage(
        {
          path: `${FUPA_PLACEHOLDER_PLAYER_IMAGE}/`,
          description: null,
          source: null,
          svg: false,
        },
        "128x128",
      ),
    ).toBeNull();
  });
});

describe("fupaSeasonLabelFromSlug", () => {
  test("labels full, half and calendar-year seasons", () => {
    expect(fupaSeasonLabelFromSlug("sv-nord-m1-2026-27")).toBe("26/27");
    expect(fupaSeasonLabelFromSlug("sg-u19-1-autumn2026")).toBe("Herbst 2026");
    expect(fupaSeasonLabelFromSlug("sg-u19-1-spring2026")).toBe(
      "Frühjahr 2026",
    );
    expect(fupaSeasonLabelFromSlug("sv-nord-o32-1-2026")).toBe("2026");
  });
});

type SquadStub = {
  players: unknown[];
  info?: { teamImage: FupaImage | null };
};

function mockFupa(squads: Record<string, SquadStub>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const slug = /\/teams\/([^/]+)\/squad$/.exec(url)?.[1];
    const squad = slug ? squads[slug] : undefined;
    if (!squad) return new Response("", { status: 404 });
    return new Response(JSON.stringify(squad), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const PLACEHOLDER: FupaImage = {
  path: `${FUPA_PLACEHOLDER_TEAM_IMAGE}/`,
  description: null,
  source: null,
  svg: false,
};

describe("resolveLiveFupaSquadSlug", () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  test("skips a freshly created season that has no players yet", async () => {
    // Unique slugs per test: the resolver memoizes per candidate list.
    mockFupa({
      "sg-a-u19-1-autumn2026": { players: [] },
      "sg-a-u19-1-spring2026": { players: [{ id: 1 }] },
    });

    await expect(
      resolveLiveFupaSquadSlug(
        {
          autumnSlug: "sg-a-u19-1-autumn2025",
          springSlug: "sg-a-u19-1-spring2026",
        },
        AUG_2026,
      ),
    ).resolves.toBe("sg-a-u19-1-spring2026");
  });

  test("returns null when no candidate season has a squad", async () => {
    mockFupa({
      "sg-b-u17-1-autumn2026": { players: [] },
      "sg-b-u17-1-spring2026": { players: [] },
    });

    await expect(
      resolveLiveFupaSquadSlug(
        {
          autumnSlug: "sg-b-u17-1-autumn2025",
          springSlug: "sg-b-u17-1-spring2026",
        },
        AUG_2026,
      ),
    ).resolves.toBeNull();
  });
});

describe("getFupaTeamPhoto", () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  test("returns the newest real photo with its credit", async () => {
    mockFupa({
      "sv-c-m1-2026-27": {
        players: [{ id: 1 }],
        info: { teamImage: realImage },
      },
    });

    await expect(
      getFupaTeamPhoto({ slug: "sv-c-m1-2025-26" }, AUG_2026),
    ).resolves.toEqual({
      url: "https://image.fupa.net/team-image/U9SmUH34H9Qx/960x540.webp",
      credit: "Isabelle Wallbrunn",
      description: null,
      slug: "sv-c-m1-2026-27",
    });
  });

  test("walks past a placeholder to the season that has a real photo", async () => {
    mockFupa({
      "sv-d-m1-2026-27": { players: [], info: { teamImage: PLACEHOLDER } },
      "sv-d-m1-2025-26": {
        players: [{ id: 1 }],
        info: { teamImage: realImage },
      },
    });

    const photo = await getFupaTeamPhoto({ slug: "sv-d-m1-2025-26" }, AUG_2026);
    expect(photo?.slug).toBe("sv-d-m1-2025-26");
  });

  test("returns null when every season only has the placeholder", async () => {
    mockFupa({
      "sv-e-wu15-1-2026-27": { players: [], info: { teamImage: PLACEHOLDER } },
      "sv-e-wu15-1-2025-26": { players: [], info: { teamImage: PLACEHOLDER } },
    });

    await expect(
      getFupaTeamPhoto({ slug: "sv-e-wu15-1-2026-27" }, AUG_2026),
    ).resolves.toBeNull();
  });
});
