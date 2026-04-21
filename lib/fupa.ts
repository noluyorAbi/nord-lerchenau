export const FUPA_CLUB_SLUG = "sv-nord-muenchen-lerchenau";
export const FUPA_CLUB_URL = `https://www.fupa.net/club/${FUPA_CLUB_SLUG}`;
export const FUPA_TEAM_SLUG = "sv-nord-muenchen-lerchenau-m1-2025-26";
export const FUPA_TEAM_URL = `https://www.fupa.net/team/${FUPA_TEAM_SLUG}`;

export function fupaTeamUrl(slug: string): string {
  return `https://www.fupa.net/team/${slug}`;
}

const API = "https://api.fupa.net/v1";
const STREAM = "https://stream.fupa.net/v1";
const REVALIDATE = 1800; // 30 min

export type FupaImage = {
  path: string;
  description: string | null;
  source: string | null;
  svg: boolean;
};

export type FupaTeamName = { full: string; middle: string; short: string };

export type FupaTeamRef = {
  id: number;
  teamId: number;
  slug: string;
  name: FupaTeamName;
  image: FupaImage;
  clubSlug: string;
  linkUrl?: string;
};

export type FupaCompetition = {
  id: number;
  competitionSeasonId: number;
  slug: string;
  name: string;
  middleName: string;
  shortName: string;
  season: { slug: string; name: string };
  image: FupaImage;
};

export type FupaTeam = {
  id: number;
  teamId: number;
  slug: string;
  name: FupaTeamName;
  image: FupaImage;
  ageGroup: { slug: string; name: string };
  competition: FupaCompetition;
  clubSlug: string;
};

export type FupaMatch = {
  id: number;
  slug: string;
  kickoff: string;
  homeTeam: FupaTeamRef;
  awayTeam: FupaTeamRef;
  homeGoal: number | null;
  awayGoal: number | null;
  tickerType: string | null;
  round?: { number?: number };
  competition?: { middleName?: string; shortName?: string };
};

export type FupaPlayerStat = {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  image: FupaImage;
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  yellowRedCards: number;
  redCards: number;
  minutesPlayed: number;
  topEleven: number;
};

export type FupaStandingRow = {
  rank: number;
  matches: number;
  wins: number;
  draws: number;
  defeats: number;
  ownGoals: number;
  againstGoals: number;
  goalDifference: number;
  points: number;
  penaltyPoints: number;
  team: FupaTeamRef & { name: FupaTeamName };
  mark?: string;
  live?: boolean;
};

export type FupaStandings = {
  standings: FupaStandingRow[];
  text: string;
  secondSort: string;
  round: { id: number; type: string; slug: string; number: number } | null;
};

export type FupaNewsItem = {
  id: string;
  type: string;
  timestamp: string;
  activity: {
    image: FupaImage;
    title: string;
    slug: string;
    subtitle?: string;
    updatedAt: number;
  };
};

async function fupaFetch<T>(url: string, tag: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "svnord-lerchenau.de (+https://svnord-lerchenau.de)",
      },
      next: { revalidate: REVALIDATE, tags: [tag] },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getFupaTeam(slug: string = FUPA_TEAM_SLUG) {
  return fupaFetch<FupaTeam>(`${API}/teams/${slug}`, `fupa:team:${slug}`);
}

export function getFupaUpcoming(slug: string = FUPA_TEAM_SLUG) {
  return fupaFetch<FupaMatch[]>(
    `${API}/teams/${slug}/matches?flavor=current&limit=60`,
    `fupa:matches-upcoming:${slug}`,
  );
}

export function getFupaPast(slug: string = FUPA_TEAM_SLUG) {
  return fupaFetch<FupaMatch[]>(
    `${API}/teams/${slug}/matches?flavor=past&limit=60`,
    `fupa:matches-past:${slug}`,
  );
}

export function getFupaPlayerStats(slug: string = FUPA_TEAM_SLUG) {
  return fupaFetch<FupaPlayerStat[]>(
    `${API}/teams/${slug}/player-stats`,
    `fupa:playerstats:${slug}`,
  );
}

export const FUPA_COMPETITION_SLUG = "bezirksliga-oberbayern-nord";
export const FUPA_SEASON_SLUG = "2025-26";

export function getFupaStanding(
  competition: string = FUPA_COMPETITION_SLUG,
  season: string = FUPA_SEASON_SLUG,
) {
  return fupaFetch<FupaStandings>(
    `${API}/standings?competition=${competition}&season=${season}`,
    `fupa:standings:${competition}:${season}`,
  );
}

export type FupaSquadPlayer = {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  isDeactivated: boolean;
  position: "Torwart" | "Abwehr" | "Mittelfeld" | "Angriff" | null;
  image: FupaImage;
  jerseyNumber: number | null;
  matches: number;
  goals: number;
  flags: string[];
  age: number | null;
};

export type FupaSquadCoachRole =
  | "Trainer"
  | "Co-Trainer"
  | "Spielertrainer"
  | "Interimstrainer"
  | "Betreuer"
  | "Torwarttrainer"
  | (string & {});

export type FupaSquadCoach = {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  role: FupaSquadCoachRole;
  isDeactivated: boolean;
  image: FupaImage;
  age: number | null;
};

export type FupaCaptain = {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  image: FupaImage;
  isDeactivated: boolean;
  position: string | null;
};

export type FupaSquadInfo = {
  teamImage: FupaImage | null;
  contacts: unknown[];
  seasonTarget: string | null;
  targetDescription: string | null;
  championFavourit: string | null;
  club: {
    id: number;
    name: string;
    middleName: string;
    shortName: string;
    image: FupaImage;
    slug: string;
  };
  captain: FupaCaptain | null;
  viceCaptain: FupaCaptain | null;
};

export type FupaSquad = {
  players: FupaSquadPlayer[];
  coaches: FupaSquadCoach[];
  info: FupaSquadInfo;
};

export type FupaClub = {
  id: number;
  name: string;
  middleName: string;
  shortName: string;
  slug: string;
  founded: string | null;
  colors: string | null;
  memberCount: string | null;
  departments: string | null;
  address: string | null;
  achievements: string | null;
  email: string | null;
  website: string | null;
  phoneClub: string | null;
  phoneClubHome: string | null;
  phoneVenue: string | null;
  image: FupaImage;
  district: { id: number; name: string; slug: string } | null;
  contacts: Array<{
    id: number;
    slug: string;
    name: string;
    job: string | null;
    image: FupaImage;
  }>;
  managers: Array<{
    id: number;
    slug: string;
    name: string;
    job: string | null;
    image: FupaImage;
  }>;
  venues: unknown[];
};

export function getFupaSquad(slug: string) {
  return fupaFetch<FupaSquad>(
    `${API}/teams/${slug}/squad`,
    `fupa:squad:${slug}`,
  );
}

export function getFupaClub(slug: string = FUPA_CLUB_SLUG) {
  return fupaFetch<FupaClub>(`${API}/clubs/${slug}`, `fupa:club:${slug}`);
}

export type FupaMeta = {
  slug?: string | null;
  autumnSlug?: string | null;
  springSlug?: string | null;
};

/**
 * Picks the most relevant fupa team slug for "now". Youth SGs split the
 * season into autumn2025 / spring2026 halves; the stable senior slugs
 * (…m1-2025-26) stay in `slug`.
 *
 * Preference order:
 *   spring half (Feb–Jun) → springSlug > slug > autumnSlug
 *   autumn half (Jul–Jan) → autumnSlug > slug > springSlug
 */
export function resolveFupaSlug(
  fupa: FupaMeta | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!fupa) return null;
  const month = now.getMonth() + 1;
  const inSpring = month >= 2 && month <= 6;
  const primary = inSpring ? fupa.springSlug : fupa.autumnSlug;
  if (primary) return primary;
  if (fupa.slug) return fupa.slug;
  const secondary = inSpring ? fupa.autumnSlug : fupa.springSlug;
  return secondary ?? null;
}

export function getFupaNews(slug: string = FUPA_TEAM_SLUG, limit = 6) {
  return fupaFetch<FupaNewsItem[]>(
    `${STREAM}/team-seasons/${slug}?limit=${limit}&type=news_published`,
    `fupa:news:${slug}`,
  );
}

export function fupaImage(
  img: FupaImage | null | undefined,
  size: `${number}x${number}`,
  ext: "webp" | "jpeg" | "png" = "webp",
): string | null {
  if (!img?.path) return null;
  const base = img.path.endsWith("/") ? img.path : `${img.path}/`;
  return `${base}${size}.${ext}`;
}

export type Form = "W" | "D" | "L";

export function isOurTeam(team: FupaTeamRef, slug: string = FUPA_TEAM_SLUG) {
  return team.slug === slug;
}

export function matchForm(
  m: FupaMatch,
  slug: string = FUPA_TEAM_SLUG,
): Form | null {
  if (m.homeGoal == null || m.awayGoal == null) return null;
  const we: "h" | "a" | null = isOurTeam(m.homeTeam, slug)
    ? "h"
    : isOurTeam(m.awayTeam, slug)
      ? "a"
      : null;
  if (!we) return null;
  const our = we === "h" ? m.homeGoal : m.awayGoal;
  const their = we === "h" ? m.awayGoal : m.homeGoal;
  if (our > their) return "W";
  if (our < their) return "L";
  return "D";
}

export function pickNext(matches: FupaMatch[] | null | undefined): FupaMatch | null {
  if (!matches?.length) return null;
  const now = Date.now();
  const future = matches
    .filter((m) => new Date(m.kickoff).getTime() >= now)
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
  return future[0] ?? null;
}

export function pickRecent(
  matches: FupaMatch[] | null | undefined,
  n: number,
): FupaMatch[] {
  if (!matches?.length) return [];
  return [...matches]
    .filter((m) => m.homeGoal != null && m.awayGoal != null)
    .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff))
    .slice(0, n);
}

export function pickUpcoming(
  matches: FupaMatch[] | null | undefined,
  n: number,
): FupaMatch[] {
  if (!matches?.length) return [];
  const now = Date.now();
  return [...matches]
    .filter((m) => new Date(m.kickoff).getTime() >= now)
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
    .slice(0, n);
}
