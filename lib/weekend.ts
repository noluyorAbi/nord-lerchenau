import { fetchBfvMatches, parseBfvKickoff, type BfvMatch } from "@/lib/bfv";
import { getFupaUpcoming, type FupaMatch } from "@/lib/fupa";

export type WeekendTeam = {
  name: string;
  slug: string;
  fupaSlug?: string | null;
  bfvTeamId?: string | null;
};

export type WeekendFupaEntry = {
  source: "fupa";
  kickoff: Date;
  fupa: FupaMatch;
  team: WeekendTeam;
};

export type WeekendBfvEntry = {
  source: "bfv";
  kickoff: Date;
  bfv: BfvMatch;
  team: WeekendTeam;
};

export type WeekendEntry = WeekendFupaEntry | WeekendBfvEntry;

/**
 * "Wochenendplan"-Fenster: ab heute bis zum Sonntag (inkl.) des
 * kommenden Wochenendes. So tauchen auch Werktags-Spiele der Jugend
 * (Mo–Fr) in der laufenden Woche im Plan auf.
 */
export function getUpcomingWeekendWindow(now: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const day = now.getDay(); // 0 = Sonntag, 6 = Samstag
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  const daysToSun = (7 - day) % 7; // bis zum nächsten Sonntag
  end.setDate(end.getDate() + daysToSun);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// "SPIELFREI" = spielfreies Wochenende, kein echtes Spiel. BFV listet diese
// Einträge dennoch in /matches — wir filtern sie überall raus.
function isSpielfrei(name: string | null | undefined): boolean {
  return /^\s*spielfrei\s*$/i.test(name ?? "");
}

async function fetchEntriesInWindow(
  teams: WeekendTeam[],
  startMs: number,
  endMs: number,
): Promise<WeekendEntry[]> {
  const results = await Promise.all(
    teams.map(async (team): Promise<WeekendEntry[]> => {
      const out: WeekendEntry[] = [];
      const seen = new Set<string>();
      if (team.fupaSlug) {
        const matches = await getFupaUpcoming(team.fupaSlug);
        if (matches) {
          for (const m of matches) {
            const d = new Date(m.kickoff);
            const ts = d.getTime();
            if (ts < startMs || ts > endMs) continue;
            if (
              isSpielfrei(m.homeTeam?.name?.full) ||
              isSpielfrei(m.homeTeam?.name?.middle) ||
              isSpielfrei(m.homeTeam?.name?.short) ||
              isSpielfrei(m.awayTeam?.name?.full) ||
              isSpielfrei(m.awayTeam?.name?.middle) ||
              isSpielfrei(m.awayTeam?.name?.short)
            ) {
              continue;
            }
            const key = `${ts}:${m.homeTeam?.name?.short ?? ""}:${m.awayTeam?.name?.short ?? ""}`;
            seen.add(key);
            out.push({ source: "fupa", kickoff: d, fupa: m, team });
          }
        }
      }
      if (team.bfvTeamId) {
        const data = await fetchBfvMatches(team.bfvTeamId);
        if (data?.matches) {
          for (const m of data.matches) {
            const d = parseBfvKickoff(m.kickoffDate, m.kickoffTime);
            if (!d) continue;
            const ts = d.getTime();
            if (ts < startMs || ts > endMs) continue;
            if (m.result && m.result !== "-:-" && m.result.trim() !== "") {
              continue;
            }
            if (isSpielfrei(m.homeTeamName) || isSpielfrei(m.guestTeamName)) {
              continue;
            }
            const key = `${ts}:${m.homeTeamName ?? ""}:${m.guestTeamName ?? ""}`;
            if (seen.has(key)) continue;
            out.push({ source: "bfv", kickoff: d, bfv: m, team });
          }
        }
      }
      return out;
    }),
  );

  return results
    .flat()
    .sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
}

export async function fetchWeekendEntries(
  teams: WeekendTeam[],
  now: Date = new Date(),
): Promise<WeekendEntry[]> {
  const { start, end } = getUpcomingWeekendWindow(now);
  return fetchEntriesInWindow(teams, start.getTime(), end.getTime());
}

/**
 * Fetch upcoming matches across many teams over a rolling window
 * (default: next 60 days). Used for cross-team fallback (e.g. when
 * the 1. Herren has nothing scheduled this weekend).
 */
export async function fetchUpcomingAcrossTeams(
  teams: WeekendTeam[],
  now: Date = new Date(),
  daysAhead: number = 60,
): Promise<WeekendEntry[]> {
  const startMs = now.getTime();
  const endMs = startMs + daysAhead * 24 * 60 * 60 * 1000;
  return fetchEntriesInWindow(teams, startMs, endMs);
}

// Legacy fupa-only entry helper kept for backwards-compatibility with the
// existing MatchdayBlock import path.
export type WeekendMatch = {
  match: FupaMatch;
  team: WeekendTeam;
};

export async function fetchWeekendMatches(
  teams: WeekendTeam[],
  now: Date = new Date(),
): Promise<WeekendMatch[]> {
  const entries = await fetchWeekendEntries(teams, now);
  return entries
    .filter((e): e is WeekendFupaEntry => e.source === "fupa")
    .map((e) => ({ match: e.fupa, team: e.team }));
}
