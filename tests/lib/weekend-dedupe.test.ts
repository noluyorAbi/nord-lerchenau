import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/fupa", () => ({
  getFupaUpcoming: vi.fn(),
}));
vi.mock("@/lib/bfv", () => ({
  fetchBfvMatches: vi.fn(),
  parseBfvKickoff: (date: string, time: string) =>
    new Date(`${date}T${time}:00+02:00`),
}));

import { fetchBfvMatches } from "@/lib/bfv";
import { getFupaUpcoming } from "@/lib/fupa";
import { fetchUpcomingAcrossTeams } from "@/lib/weekend";

const NOW = new Date("2026-08-19T08:00:00+02:00");
const KICKOFF = "2026-08-23T15:00:00+02:00";

const team = {
  name: "1. Herren",
  slug: "erste",
  fupaSlug: "sv-nord-lerchenau",
  bfvTeamId: "011MICNASC000000VTVG0001VTR8C1K7",
};

// Beide Quellen liefern dieselbe Partie, schreiben die Vereinsnamen aber
// verschieden. Genau daran ist der Abgleich frueher gescheitert: auf der
// Startseite stand jede Partie zweimal.
const fupaMatch = {
  kickoff: KICKOFF,
  homeTeam: {
    name: {
      full: "SV Nord München-Lerchenau",
      middle: "SV N Lerchenau",
      short: "SV N Lerchenau",
    },
  },
  awayTeam: {
    name: {
      full: "FC Wacker München",
      middle: "FC Wacker M.",
      short: "FC Wacker M.",
    },
  },
};

const bfvMatch = {
  kickoffDate: "2026-08-23",
  kickoffTime: "15:00",
  homeTeamName: "SV Nord München-Lerchenau",
  guestTeamName: "FC Wacker München",
  result: "-:-",
};

describe("fetchUpcomingAcrossTeams", () => {
  beforeEach(() => {
    vi.mocked(getFupaUpcoming).mockReset();
    vi.mocked(fetchBfvMatches).mockReset();
  });

  test("führt dieselbe Partie aus beiden Quellen nur einmal", async () => {
    vi.mocked(getFupaUpcoming).mockResolvedValue([fupaMatch] as never);
    vi.mocked(fetchBfvMatches).mockResolvedValue({
      matches: [bfvMatch],
    } as never);

    const entries = await fetchUpcomingAcrossTeams([team], NOW);

    expect(entries).toHaveLength(1);
    expect(entries[0].source).toBe("fupa");
  });

  test("behält eine Partie, die nur der Verband kennt", async () => {
    vi.mocked(getFupaUpcoming).mockResolvedValue([] as never);
    vi.mocked(fetchBfvMatches).mockResolvedValue({
      matches: [bfvMatch],
    } as never);

    const entries = await fetchUpcomingAcrossTeams([team], NOW);

    expect(entries).toHaveLength(1);
    expect(entries[0].source).toBe("bfv");
  });

  test("behält zwei Partien derselben Mannschaft zu verschiedenen Zeiten", async () => {
    vi.mocked(getFupaUpcoming).mockResolvedValue([fupaMatch] as never);
    vi.mocked(fetchBfvMatches).mockResolvedValue({
      matches: [{ ...bfvMatch, kickoffTime: "18:00" }],
    } as never);

    const entries = await fetchUpcomingAcrossTeams([team], NOW);

    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.source)).toEqual(["fupa", "bfv"]);
  });
});
