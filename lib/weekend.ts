import { getFupaUpcoming, type FupaMatch } from "@/lib/fupa";

export type WeekendTeam = {
  name: string;
  slug: string;
  fupaSlug: string;
};

export type WeekendMatch = {
  match: FupaMatch;
  team: WeekendTeam;
};

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

export async function fetchWeekendMatches(
  teams: WeekendTeam[],
  now: Date = new Date(),
): Promise<WeekendMatch[]> {
  const { start, end } = getUpcomingWeekendWindow(now);
  const startMs = start.getTime();
  const endMs = end.getTime();

  const results = await Promise.all(
    teams.map(async (team) => {
      const matches = await getFupaUpcoming(team.fupaSlug);
      if (!matches) return [];
      return matches
        .filter((m) => {
          const ts = new Date(m.kickoff).getTime();
          return ts >= startMs && ts <= endMs;
        })
        .map((match) => ({ match, team }));
    }),
  );

  return results
    .flat()
    .sort((a, b) => +new Date(a.match.kickoff) - +new Date(b.match.kickoff));
}
