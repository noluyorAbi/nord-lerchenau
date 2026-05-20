import {
  fetchBfvMatches,
  parseBfvKickoff,
  type BfvMatch,
} from "@/lib/bfv";
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
 * Fri/Sat/Sun window covering "this weekend" if we are already in it,
 * otherwise the next upcoming Fri–Sun block.
 */
export function getUpcomingWeekendWindow(now: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const day = now.getDay();
  const start = new Date(now);
  const end = new Date(now);
  if (day === 0) {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (day === 5 || day === 6) {
    const daysToSun = 7 - day;
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + daysToSun);
    end.setHours(23, 59, 59, 999);
  } else {
    const daysToFri = 5 - day;
    start.setDate(start.getDate() + daysToFri);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + daysToFri + 2);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

export async function fetchWeekendEntries(
  teams: WeekendTeam[],
  now: Date = new Date(),
): Promise<WeekendEntry[]> {
  const { start, end } = getUpcomingWeekendWindow(now);
  const startMs = start.getTime();
  const endMs = end.getTime();

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
            if (ts >= startMs && ts <= endMs) {
              const key = `${ts}:${m.homeTeam?.name?.short ?? ""}:${m.awayTeam?.name?.short ?? ""}`;
              seen.add(key);
              out.push({ source: "fupa", kickoff: d, fupa: m, team });
            }
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
