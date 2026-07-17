export const FUPA_CLUB_SLUG = "sv-nord-muenchen-lerchenau";
export const FUPA_CLUB_URL = `https://www.fupa.net/club/${FUPA_CLUB_SLUG}`;

/**
 * Saison-agnostischer Basis-Slug der 1. Herren. Die volle Team-Slug
 * (…-m1-2026-27) wird zur Laufzeit aus dem aktuellen Datum abgeleitet,
 * damit die Seite jede neue Saison automatisch mitnimmt.
 */
export const FUPA_HERREN_BASE = "sv-nord-muenchen-lerchenau-m1";

/**
 * Eine fupa-Saison läuft vom 1. Juli bis 30. Juni. Liefert das Startjahr
 * der Saison, in der `now` liegt (Juli 2026 → 2026, Juni 2026 → 2025).
 */
export function fupaSeasonStartYear(now: Date = new Date()): number {
  return now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

function seasonSlugFor(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

/** Aktueller fupa-Saison-Slug, z.B. "2026-27". */
export function currentFupaSeasonSlug(now: Date = new Date()): string {
  return seasonSlugFor(fupaSeasonStartYear(now));
}

/** Vorherige fupa-Saison, z.B. "2025-26" während der Saison 2026/27. */
export function previousFupaSeasonSlug(now: Date = new Date()): string {
  return seasonSlugFor(fupaSeasonStartYear(now) - 1);
}

/** Kurzes Saison-Label fürs UI, z.B. "26/27". */
export function currentFupaSeasonName(now: Date = new Date()): string {
  const start = fupaSeasonStartYear(now);
  return `${String(start % 100).padStart(2, "0")}/${String((start + 1) % 100).padStart(2, "0")}`;
}

// fupa-Team-Slugs enden in einem Saison-Suffix. Drei Formen:
//   …-m1-2025-26            volle Saison (Senioren, Juniorinnen)
//   …-u19-1-autumn2025      Halbserie Jugend-SG (Herbst Jul–Jan)
//   …-u19-1-spring2026      Halbserie Jugend-SG (Frühjahr Feb–Jun)
//   …-o32-1-2026            Kalenderjahr (Ehrenliga/O32)
const FULL_SEASON_RE = /^(.*)-\d{4}-\d{2}$/;
const HALF_SEASON_RE = /^(.*)-(autumn|spring)\d{4}$/;
const YEAR_SEASON_RE = /^(.*)-\d{4}$/;

function withSeasonOffset(slug: string, now: Date, offset: number): string {
  const startYear = fupaSeasonStartYear(now) + offset;
  const half = HALF_SEASON_RE.exec(slug);
  if (half) {
    // Feb–Jun = Frühjahrsserie der laufenden Saison, sonst Herbstserie.
    const month = now.getMonth() + 1;
    const inSpring = month >= 2 && month <= 6;
    return inSpring
      ? `${half[1]}-spring${startYear + 1}`
      : `${half[1]}-autumn${startYear}`;
  }
  const full = FULL_SEASON_RE.exec(slug);
  if (full) return `${full[1]}-${seasonSlugFor(startYear)}`;
  const year = YEAR_SEASON_RE.exec(slug);
  if (year) return `${year[1]}-${now.getFullYear() + offset}`;
  return slug;
}

/** Hebt einen gespeicherten Team-Slug auf die aktuelle Saison. */
export function toCurrentSeasonSlug(
  slug: string,
  now: Date = new Date(),
): string {
  return withSeasonOffset(slug, now, 0);
}

/** Senkt einen Team-Slug auf die vorherige Saison (Fallback). */
export function toPreviousSeasonSlug(
  slug: string,
  now: Date = new Date(),
): string {
  return withSeasonOffset(slug, now, -1);
}

/**
 * Sortier-Schlüssel: Endmonat der im Suffix kodierten Saison als
 * fortlaufende Monatszahl. Größer = neuere Daten.
 */
function seasonRecency(slug: string): number {
  const half = /-(autumn|spring)(\d{4})$/.exec(slug);
  if (half) {
    const y = Number(half[2]);
    // autumn2025 endet Jan 2026, spring2026 endet Jun 2026.
    return half[1] === "autumn" ? (y + 1) * 12 + 1 : y * 12 + 6;
  }
  const full = /-(\d{4})-\d{2}$/.exec(slug);
  if (full) return (Number(full[1]) + 1) * 12 + 6;
  const year = /-(\d{4})$/.exec(slug);
  if (year) return Number(year[1]) * 12 + 12;
  return 0;
}

export function fupaTeamUrl(slug: string): string {
  return `https://www.fupa.net/team/${slug}`;
}

export function fupaMatchUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return `https://www.fupa.net/match/${slug}`;
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
        "User-Agent": "svnord.de (+https://www.svnord.de)",
      },
      // Hängende fupa-API darf das SSR nicht blockieren: nach 8s abbrechen
      // und in den null-Fallback der Consumer degradieren.
      signal: AbortSignal.timeout(8000),
      next: { revalidate: REVALIDATE, tags: [tag] },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getFupaTeam(slug: string) {
  return fupaFetch<FupaTeam>(`${API}/teams/${slug}`, `fupa:team:${slug}`);
}

export function getFupaUpcoming(slug: string) {
  return fupaFetch<FupaMatch[]>(
    `${API}/teams/${slug}/matches?flavor=current&limit=60`,
    `fupa:matches-upcoming:${slug}`,
  );
}

export function getFupaPast(slug: string) {
  return fupaFetch<FupaMatch[]>(
    `${API}/teams/${slug}/matches?flavor=past&limit=60`,
    `fupa:matches-past:${slug}`,
  );
}

export function getFupaPlayerStats(slug: string) {
  return fupaFetch<FupaPlayerStat[]>(
    `${API}/teams/${slug}/player-stats`,
    `fupa:playerstats:${slug}`,
  );
}

export function getFupaStanding(competition: string, season: string) {
  return fupaFetch<FupaStandings>(
    `${API}/standings?competition=${competition}&season=${season}`,
    `fupa:standings:${competition}:${season}`,
  );
}

/**
 * Tabelle zur Liga des übergebenen Teams. Wettbewerb UND Saison kommen
 * aus dem fupa-Team-Datensatz selbst — nichts ist hartkodiert, Aufstieg
 * und Saisonwechsel ziehen automatisch mit.
 */
export async function getFupaStandingForTeam(
  teamSlug: string,
): Promise<FupaStandings | null> {
  const team = await getFupaTeam(teamSlug);
  const competition = team?.competition;
  if (!competition?.slug || !competition.season?.slug) return null;
  return getFupaStanding(competition.slug, competition.season.slug);
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

/**
 * Enriched player record — merges the /squad entry (position, jersey, age,
 * photo, captain flags) with the /player-stats entry (assists, cards,
 * minutes, substitutes, topEleven, penalties). Keyed by the shared fupa
 * player id. Stats default to 0 when fupa hasn't populated them.
 */
export type FupaPlayerDetail = {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: FupaSquadPlayer["position"];
  jerseyNumber: number | null;
  age: number | null;
  birthday: string | null;
  image: FupaImage;
  isDeactivated: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;

  matches: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  topEleven: number;
  yellowCards: number;
  yellowRedCards: number;
  redCards: number;
  substitutesIn: number;
  substitutesOut: number;
  penaltiesTotal: number;
  penaltiesHit: number;

  profileUrl: string;
};

type FupaPlayerStatsRaw = FupaPlayerStat & {
  penaltiesTotal?: number;
  penaltiesHit?: number;
  substitutesIn?: number;
  substitutesOut?: number;
};

/**
 * Extract the stable fupa player-identity id from a player slug. Fupa
 * slugs always end in `-{playerId}` (e.g. "martin-angermeir-81488"). This
 * id is stable across seasons/teams, unlike the `id` on squad entries
 * which is a per-team-season relationship row id.
 */
export function parseFupaPlayerId(slug: string): number {
  const m = /-(\d+)$/.exec(slug);
  return m ? Number(m[1]) : 0;
}

export function mergePlayer(
  squadEntry: FupaSquadPlayer,
  stats: FupaPlayerStatsRaw | undefined,
  captain: FupaCaptain | null | undefined,
  viceCaptain: FupaCaptain | null | undefined,
): FupaPlayerDetail {
  const playerId = parseFupaPlayerId(squadEntry.slug);
  const birthday =
    (captain?.slug === squadEntry.slug ? captain.birthday : null) ??
    (viceCaptain?.slug === squadEntry.slug ? viceCaptain.birthday : null) ??
    null;
  return {
    id: playerId || squadEntry.id,
    slug: squadEntry.slug,
    firstName: squadEntry.firstName,
    lastName: squadEntry.lastName,
    fullName: `${squadEntry.firstName} ${squadEntry.lastName}`.trim(),
    position: squadEntry.position,
    jerseyNumber: squadEntry.jerseyNumber,
    age: squadEntry.age,
    birthday,
    image: squadEntry.image,
    isDeactivated: squadEntry.isDeactivated,
    isCaptain: captain?.slug === squadEntry.slug,
    isViceCaptain: viceCaptain?.slug === squadEntry.slug,

    matches: stats?.matches ?? squadEntry.matches ?? 0,
    goals: stats?.goals ?? squadEntry.goals ?? 0,
    assists: stats?.assists ?? 0,
    minutesPlayed: stats?.minutesPlayed ?? 0,
    topEleven: stats?.topEleven ?? 0,
    yellowCards: stats?.yellowCards ?? 0,
    yellowRedCards: stats?.yellowRedCards ?? 0,
    redCards: stats?.redCards ?? 0,
    substitutesIn: stats?.substitutesIn ?? 0,
    substitutesOut: stats?.substitutesOut ?? 0,
    penaltiesTotal: stats?.penaltiesTotal ?? 0,
    penaltiesHit: stats?.penaltiesHit ?? 0,

    profileUrl: `https://www.fupa.net/player/${squadEntry.slug}`,
  };
}

/**
 * Pull squad + player-stats in parallel and return a merged roster. Returns
 * null when the squad itself isn't available.
 */
export async function getFupaTeamRoster(teamSlug: string): Promise<{
  players: FupaPlayerDetail[];
  coaches: FupaSquadCoach[];
  info: FupaSquadInfo;
} | null> {
  const [squad, stats] = await Promise.all([
    getFupaSquad(teamSlug),
    getFupaPlayerStats(teamSlug),
  ]);
  if (!squad) return null;

  const statsBySlug = new Map<string, FupaPlayerStatsRaw>();
  for (const s of (stats ?? []) as FupaPlayerStatsRaw[]) {
    statsBySlug.set(s.slug, s);
  }

  const players = squad.players
    .map((p) =>
      mergePlayer(
        p,
        statsBySlug.get(p.slug),
        squad.info?.captain,
        squad.info?.viceCaptain,
      ),
    )
    .sort(
      (a, b) =>
        (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999) ||
        a.lastName.localeCompare(b.lastName),
    );

  return { players, coaches: squad.coaches, info: squad.info };
}

export function findRosterPlayer(
  players: FupaPlayerDetail[],
  key: number | string,
): FupaPlayerDetail | null {
  if (typeof key === "number") {
    return players.find((p) => p.id === key) ?? null;
  }
  // String: match slug exactly, or parse numeric suffix.
  const direct = players.find((p) => p.slug === key);
  if (direct) return direct;
  const asNumber = Number(key);
  if (Number.isFinite(asNumber)) {
    return players.find((p) => p.id === asNumber) ?? null;
  }
  return null;
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
 * Picks the most relevant fupa team slug for "now" from the stored CMS
 * meta — season suffix is auto-upgraded to the CURRENT season. Youth SGs
 * split the season into autumn/spring halves; senior slugs stay in `slug`.
 *
 * Preference order:
 *   spring half (Feb–Jun) → springSlug > slug > autumnSlug
 *   autumn half (Jul–Jan) → autumnSlug > slug > springSlug
 *
 * NOTE: the returned slug is not guaranteed to exist on fupa yet (fupa
 * creates new team seasons gradually). Data fetches should go through
 * `resolveLiveFupaSlug`, which verifies existence and falls back.
 */
export function resolveFupaSlug(
  fupa: FupaMeta | null | undefined,
  now: Date = new Date(),
): string | null {
  return fupaSlugCandidates(fupa, now)[0] ?? null;
}

/**
 * Für Halbserien-Slugs: die direkt vorangegangene Halbserie. Im Frühjahr
 * (Feb–Jun) ist das der Herbst der laufenden Saison (autumn startYear),
 * im Herbst (Jul–Jan) das Frühjahr der Vorsaison (spring startYear).
 * fupa legt neue Halbserien erst spät an — die gerade beendete Halbserie
 * ist der frischeste garantiert existierende Datensatz.
 */
function toPreviousHalfSlug(slug: string, now: Date): string | null {
  const half = HALF_SEASON_RE.exec(slug);
  if (!half) return null;
  const startYear = fupaSeasonStartYear(now);
  const month = now.getMonth() + 1;
  const inSpring = month >= 2 && month <= 6;
  return inSpring
    ? `${half[1]}-autumn${startYear}`
    : `${half[1]}-spring${startYear}`;
}

/**
 * All slugs worth trying for a team, best first:
 *   1. stored slugs upgraded to the current season (preference order),
 *   2. every fallback — the directly preceding half-series, the stored
 *      slugs as-is, and the stored slugs downgraded one season — merged
 *      and sorted by season recency so fresher data is always tried first.
 */
export function fupaSlugCandidates(
  fupa: FupaMeta | null | undefined,
  now: Date = new Date(),
): string[] {
  if (!fupa) return [];
  const month = now.getMonth() + 1;
  const inSpring = month >= 2 && month <= 6;
  const primary = inSpring ? fupa.springSlug : fupa.autumnSlug;
  const secondary = inSpring ? fupa.autumnSlug : fupa.springSlug;
  const stored = [primary, fupa.slug, secondary].filter((s): s is string =>
    Boolean(s),
  );
  if (stored.length === 0) return [];

  const fallbacks = [
    ...stored
      .map((s) => toPreviousHalfSlug(s, now))
      .filter((s): s is string => Boolean(s)),
    ...stored,
    ...stored.map((s) => toPreviousSeasonSlug(s, now)),
  ].sort((a, b) => seasonRecency(b) - seasonRecency(a));

  const candidates = [
    ...stored.map((s) => toCurrentSeasonSlug(s, now)),
    ...fallbacks,
  ];
  return Array.from(new Set(candidates));
}

/**
 * Neuester GESPEICHERTER Slug (ohne Saison-Upgrade). Offline-Fallback für
 * Profil-Links: gespeicherte Slugs haben auf fupa nachweislich existiert,
 * ein hochgerechneter Saison-Slug womöglich noch nicht.
 */
export function newestStoredFupaSlug(
  fupa: FupaMeta | null | undefined,
): string | null {
  if (!fupa) return null;
  const stored = [fupa.slug, fupa.autumnSlug, fupa.springSlug].filter(
    (s): s is string => Boolean(s),
  );
  if (stored.length === 0) return null;
  return stored.sort((a, b) => seasonRecency(b) - seasonRecency(a))[0];
}

// Aufgelöste Slugs pro Kandidatenliste merken — auch NEGATIVE Ergebnisse.
// Nexts Fetch-Cache speichert nur 200er-Antworten, 404-Probes würden sonst
// bei jedem Request erneut gegen api.fupa.net laufen.
const liveSlugCache = new Map<
  string,
  { slug: string | null; expires: number }
>();

/**
 * Resolves the freshest fupa team slug that ACTUALLY exists: walks the
 * candidate list and returns the first slug fupa's API answers for.
 * Positive probes ride the 30-min fetch cache; the resolved result
 * (including "nothing exists") is additionally memoized per server
 * instance for the same 30 minutes. Returns null when no candidate
 * exists (e.g. team no longer on fupa).
 */
export async function resolveLiveFupaSlug(
  fupa: FupaMeta | string | null | undefined,
  now: Date = new Date(),
): Promise<string | null> {
  const meta = typeof fupa === "string" ? { slug: fupa } : fupa;
  const candidates = fupaSlugCandidates(meta, now);
  if (candidates.length === 0) return null;

  const key = candidates.join("|");
  const hit = liveSlugCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.slug;

  let resolved: string | null = null;
  for (const candidate of candidates) {
    if (await getFupaTeam(candidate)) {
      resolved = candidate;
      break;
    }
  }
  liveSlugCache.set(key, {
    slug: resolved,
    expires: Date.now() + REVALIDATE * 1000,
  });
  return resolved;
}

/**
 * Aktuell existierender Slug der 1. Herren (aktuelle Saison, sonst
 * Vorsaison). Fällt nie auf null zurück — als letzte Instanz der
 * berechnete Slug der aktuellen Saison, damit Links stets ein Ziel haben.
 */
export async function resolveLiveHerrenSlug(
  now: Date = new Date(),
): Promise<string> {
  const current = `${FUPA_HERREN_BASE}-${currentFupaSeasonSlug(now)}`;
  return (await resolveLiveFupaSlug(current, now)) ?? current;
}

export function getFupaNews(slug: string, limit = 6) {
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

export function isOurTeam(team: FupaTeamRef, slug: string) {
  return team.slug === slug;
}

/**
 * Saison-unabhängige "sind wir das?"-Prüfung über den Vereins-Slug.
 * Für Tabellen (eine Liga = höchstens ein SV-Nord-Team) robuster als der
 * saisongebundene Team-Slug.
 */
export function isOurClub(team: FupaTeamRef): boolean {
  return team.clubSlug === FUPA_CLUB_SLUG;
}

export function matchForm(m: FupaMatch, slug: string): Form | null {
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

// "SPIELFREI" markiert ein spielfreies Wochenende — kein echtes Spiel.
function isSpielfreiTeam(t: FupaMatch["homeTeam"]): boolean {
  const re = /^\s*spielfrei\s*$/i;
  return (
    re.test(t?.name?.full ?? "") ||
    re.test(t?.name?.middle ?? "") ||
    re.test(t?.name?.short ?? "")
  );
}

export function isSpielfreiMatch(m: FupaMatch): boolean {
  return isSpielfreiTeam(m.homeTeam) || isSpielfreiTeam(m.awayTeam);
}

export function pickNext(
  matches: FupaMatch[] | null | undefined,
): FupaMatch | null {
  if (!matches?.length) return null;
  const now = Date.now();
  const future = matches
    .filter((m) => new Date(m.kickoff).getTime() >= now)
    .filter((m) => !isSpielfreiMatch(m))
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
    .filter((m) => !isSpielfreiMatch(m))
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
    .slice(0, n);
}
