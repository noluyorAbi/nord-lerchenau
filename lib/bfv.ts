/**
 * BFV (Bayerischer Fußball-Verband) integration.
 *
 * Uses the official BFV widget API (same backend the bfv-api npm package
 * targets) for structured match + club data, and falls back to fussball.de's
 * team-table HTML fragment for league standings (no equivalent in the BFV
 * JSON API). Both sources are keyed by the same 32-char team permanentId we
 * store in Payload.
 */

import type { Schemas } from "bfv-api";

export const BFV_CLUB_ID = "00ES8GNHD400000DVV0AG08LVUPGND5I";
export const BFV_CLUB_SLUG = "sv-nord-muenchen-lerchenau";
export const BFV_CLUB_URL = `https://www.bfv.de/vereine/${BFV_CLUB_SLUG}/${BFV_CLUB_ID}`;
export const BFV_API_BASE = "https://widget-prod.bfv.de/api/service/widget/v1";

const MATCH_REVALIDATE = 900; // 15 min
const CLUB_REVALIDATE = 86400; // 24 h

export type BfvMeta = {
  teamId?: string | null;
  slug?: string | null;
  spielklasse?: string | null;
  partner?: string | null;
};

export type BfvMatch = Schemas["Match"];
export type BfvTeam = Schemas["Team"];
export type BfvClub = Schemas["ClubInformation"];

export function bfvTeamUrl(bfv: BfvMeta | null | undefined): string | null {
  if (!bfv?.teamId) return null;
  const s = bfv.slug ?? BFV_CLUB_SLUG;
  return `https://www.bfv.de/mannschaften/${s}/${bfv.teamId}`;
}

export function bfvMatchUrl(matchId: string): string {
  return `https://www.bfv.de/spiele/${matchId}`;
}

export type BfvMatchData = {
  team: BfvTeam;
  matches: BfvMatch[];
};

/**
 * Fetch all matches (league + friendlies, past + upcoming) for a BFV team.
 * 15-min revalidate — match days update results live.
 */
export async function fetchBfvMatches(
  teamId: string,
): Promise<BfvMatchData | null> {
  if (!teamId) return null;
  try {
    const res = await fetch(`${BFV_API_BASE}/team/${teamId}/matches`, {
      headers: { Accept: "application/json" },
      next: { revalidate: MATCH_REVALIDATE, tags: [`bfv:matches:${teamId}`] },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      state: number;
      data?: BfvMatchData;
    };
    if (!body.data?.matches) return null;
    return body.data;
  } catch {
    return null;
  }
}

export type BfvSquadPlayer = {
  name: string;
  playerImage: string | null;
  playerImageStamp: string | null;
  playerImageCopyright: string | null;
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
};

export type BfvSquad = {
  public: boolean;
  season: string | null;
  players: BfvSquadPlayer[];
};

/**
 * Fetch the public squad for a BFV team. Returns `{ public: false, players: [] }`
 * when the club has opted out of public kader lists — common for amateur
 * clubs — so UI should fall back to a "im BFV-Profil" link in that case.
 */
export async function fetchBfvSquad(teamId: string): Promise<BfvSquad | null> {
  if (!teamId) return null;
  try {
    const res = await fetch(`${BFV_API_BASE}/team/${teamId}/squad`, {
      headers: { Accept: "application/json" },
      next: { revalidate: CLUB_REVALIDATE, tags: [`bfv:squad:${teamId}`] },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: {
        public?: boolean;
        season?: { name?: string };
        players?: Array<{
          player?: {
            name?: string;
            playerImage?: string | null;
            playerImageStamp?: string | null;
            playerImageCopyright?: string | null;
          };
          statistics?: {
            matchesPlayed?: number;
            minutesPlayed?: number;
            goals?: number;
          };
        }>;
      };
    };
    const data = body.data;
    if (!data) return null;

    const players: BfvSquadPlayer[] = (data.players ?? []).map((p) => ({
      name: p.player?.name ?? "",
      playerImage: normalizeBfvLogoUrl(p.player?.playerImage ?? null),
      playerImageStamp: normalizeBfvLogoUrl(p.player?.playerImageStamp ?? null),
      playerImageCopyright: p.player?.playerImageCopyright ?? null,
      matchesPlayed: p.statistics?.matchesPlayed ?? 0,
      minutesPlayed: p.statistics?.minutesPlayed ?? 0,
      goals: p.statistics?.goals ?? 0,
    }));

    return {
      public: Boolean(data.public),
      season: data.season?.name ?? null,
      players,
    };
  } catch {
    return null;
  }
}

export async function fetchBfvClub(teamId: string): Promise<BfvClub | null> {
  if (!teamId) return null;
  try {
    const res = await fetch(
      `${BFV_API_BASE}/club/info?teamPermanentId=${teamId}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: CLUB_REVALIDATE, tags: [`bfv:club:${teamId}`] },
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { club?: BfvClub } };
    return body.data?.club ?? null;
  } catch {
    return null;
  }
}

function berlinWallClockToUtc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
): Date {
  for (const offsetH of [1, 2]) {
    const cand = new Date(Date.UTC(y, mo - 1, d, h - offsetH, mi));
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(cand);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    if (
      Number(get("year")) === y &&
      Number(get("month")) === mo &&
      Number(get("day")) === d &&
      Number(get("hour")) === h &&
      Number(get("minute")) === mi
    ) {
      return cand;
    }
  }
  return new Date(Date.UTC(y, mo - 1, d, h - 1, mi));
}

export function parseBfvKickoff(
  date: string | null | undefined,
  time: string | null | undefined,
): Date | null {
  if (!date) return null;
  const [d, m, y] = date.split(".");
  if (!d || !m || !y) return null;
  const [hh, mm] = (time ?? "00:00").split(":");
  const yN = Number(y);
  const mN = Number(m);
  const dN = Number(d);
  const hN = Number(hh ?? "0");
  const miN = Number(mm ?? "0");
  if (
    Number.isNaN(yN) ||
    Number.isNaN(mN) ||
    Number.isNaN(dN) ||
    Number.isNaN(hN) ||
    Number.isNaN(miN)
  )
    return null;
  return berlinWallClockToUtc(yN, mN, dN, hN, miN);
}

export function isLeagueMatch(m: BfvMatch): boolean {
  return m.competitionType === "Meisterschaften";
}

export function isOurBfvTeam(
  m: BfvMatch,
  teamId: string,
): "home" | "away" | null {
  if (m.homeTeamPermanentId === teamId) return "home";
  if (m.guestTeamPermanentId === teamId) return "away";
  return null;
}

export function bfvMatchResult(
  m: BfvMatch,
  teamId: string,
): {
  played: boolean;
  us: number | null;
  them: number | null;
  outcome: "W" | "D" | "L" | null;
} {
  if (!m.result || m.result.trim() === "" || m.result === "-:-") {
    return { played: false, us: null, them: null, outcome: null };
  }
  const [a, b] = m.result.split(":").map((n) => Number(n.trim()));
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return { played: false, us: null, them: null, outcome: null };
  }
  const side = isOurBfvTeam(m, teamId);
  const us = side === "home" ? a : b;
  const them = side === "home" ? b : a;
  const outcome = us > them ? "W" : us < them ? "L" : "D";
  return { played: true, us, them, outcome };
}

export function pickNextBfvMatch(
  matches: BfvMatch[],
  now: Date = new Date(),
): BfvMatch | null {
  const upcoming = matches
    .map((m) => ({ m, d: parseBfvKickoff(m.kickoffDate, m.kickoffTime) }))
    .filter(
      (x): x is { m: BfvMatch; d: Date } =>
        x.d !== null &&
        x.d.getTime() >= now.getTime() &&
        (!x.m.result || x.m.result.trim() === "" || x.m.result === "-:-"),
    )
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  return upcoming[0]?.m ?? null;
}

export function pickRecentBfvMatches(
  matches: BfvMatch[],
  n = 5,
  leagueOnly = false,
): BfvMatch[] {
  return matches
    .filter((m) => (leagueOnly ? isLeagueMatch(m) : true))
    .filter((m) => Boolean(m.result) && m.result !== "-:-")
    .map((m) => ({ m, d: parseBfvKickoff(m.kickoffDate, m.kickoffTime) }))
    .filter((x): x is { m: BfvMatch; d: Date } => x.d !== null)
    .sort((a, b) => b.d.getTime() - a.d.getTime())
    .slice(0, n)
    .map((x) => x.m);
}

export function pickUpcomingBfvMatches(
  matches: BfvMatch[],
  n = 5,
  leagueOnly = false,
  now: Date = new Date(),
): BfvMatch[] {
  return matches
    .filter((m) => (leagueOnly ? isLeagueMatch(m) : true))
    .map((m) => ({ m, d: parseBfvKickoff(m.kickoffDate, m.kickoffTime) }))
    .filter(
      (x): x is { m: BfvMatch; d: Date } =>
        x.d !== null &&
        x.d.getTime() >= now.getTime() &&
        (!x.m.result || x.m.result.trim() === "" || x.m.result === "-:-"),
    )
    .sort((a, b) => a.d.getTime() - b.d.getTime())
    .slice(0, n)
    .map((x) => x.m);
}

export function normalizeBfvLogoUrl(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://www.bfv.de${raw}`;
  return raw;
}

export const BFV_VERBAND_ID = "00ES8GNCQK000000VV0AG08LVUPGND5I";

/**
 * BFV club crest. `format/7` is the 99×99 transparent PNG that BFV's own
 * widgets render. Other formats exist (1/2/3/… = other resolutions) but 7
 * is the right balance of detail + file size for most UI surfaces.
 */
export function bfvClubLogoUrl(
  clubId: string | null | undefined,
  format: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = 7,
): string | null {
  if (!clubId) return null;
  return `https://app.bfv.de/export.media/-/action/getLogo/format/${format}/id/${clubId}/verband/${BFV_VERBAND_ID}/strat_code/bfv`;
}

/**
 * Team/squad photo served from DFB-Net's media API. SZ goes 0..3 (largest).
 * Returns null for private-logo teams.
 */
export function bfvTeamImageUrl(
  teamId: string | null | undefined,
  size: 0 | 1 | 2 | 3 = 3,
): string | null {
  if (!teamId) return null;
  return `https://service.media.fussball.de/api/uimg/cont/-/ID/${teamId}/TYP/50/SZ/${size}`;
}

/**
 * Pick the right logo for a match side — prefer the BFV club logo, respect
 * the "logoPrivate" flag BFV ships so we don't render a placeholder.
 */
export function bfvMatchSideLogo(
  match: BfvMatch,
  side: "home" | "away",
): string | null {
  if (side === "home" && match.homeLogoPrivate) return null;
  if (side === "away" && match.guestLogoPrivate) return null;
  const clubId = side === "home" ? match.homeClubId : match.guestClubId;
  return bfvClubLogoUrl(clubId);
}

/**
 * A row parsed from the fussball.de widget table.
 */
export type BfvTableRow = {
  rank: number;
  clubName: string;
  logoUrl: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isUs: boolean;
};

export type BfvTable = {
  rows: BfvTableRow[];
  ownRow: BfvTableRow | null;
};

const TEAM_TABLE_BASE = "https://www.fussball.de/ajax.team.table/-/team-id/";

/**
 * Fetch the league table HTML fragment for a BFV team ID via fussball.de.
 * Cached through Next for 30 min — these numbers only move on match days.
 */
export async function fetchBfvTable(teamId: string): Promise<BfvTable | null> {
  if (!teamId) return null;

  try {
    const res = await fetch(`${TEAM_TABLE_BASE}${teamId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (SV Nord München-Lerchenau website; https://svnord-lerchenau.de)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 1800, tags: [`bfv:table:${teamId}`] },
    });

    if (!res.ok) return null;
    const html = await res.text();
    return parseBfvTable(html);
  } catch {
    return null;
  }
}

export function parseBfvTable(html: string): BfvTable | null {
  if (!html.includes("fixtures-league-table")) return null;

  const rowRegex = /<tr(?:\s+class="([^"]*)")?\s*>([\s\S]*?)<\/tr>/g;
  const rows: BfvTableRow[] = [];

  let m: RegExpExecArray | null;
  while ((m = rowRegex.exec(html)) !== null) {
    const classes = m[1] ?? "";
    const body = m[2];
    if (classes.includes("thead")) continue;

    const rank = readNumber(
      /<td\s+class="column-rank"[^>]*>\s*(\d+)/.exec(body),
    );
    if (rank === null) continue;

    const clubName = cleanText(
      /<div\s+class="club-name"[^>]*>([\s\S]*?)<\/div>/.exec(body)?.[1] ?? "",
    );
    const rawLogoSrc =
      /<img[^>]+src="([^"]+)"[^>]*alt="[^"]*"/.exec(body)?.[1] ?? null;
    const clubId = extractClubIdFromLogoSrc(rawLogoSrc);
    // Prefer the BFV format/7 logo — it returns the real crest even for
    // clubs that haven't opted into fussball.de (which returns a
    // placeholder at format/0).
    const logoUrl = clubId ? bfvClubLogoUrl(clubId) : normalizeLogo(rawLogoSrc);

    // Columns in order after rank/club: Sp G U V "x : y" Tordiff Pkt
    const numericCells = [...body.matchAll(/<td[^>]*>\s*([\s\S]*?)\s*<\/td>/g)]
      .map((c) => c[1])
      // Skip the icon + rank + club cells (first three)
      .slice(3);

    const played = toInt(numericCells[0]);
    const wins = toInt(numericCells[1]);
    const draws = toInt(numericCells[2]);
    const losses = toInt(numericCells[3]);
    const score = /(-?\d+)\s*:\s*(-?\d+)/.exec(
      numericCells[4] ? stripTags(numericCells[4]) : "",
    );
    const goalsFor = score ? Number(score[1]) : 0;
    const goalsAgainst = score ? Number(score[2]) : 0;
    const goalDifference = toInt(numericCells[5]) ?? goalsFor - goalsAgainst;
    const points = toInt(numericCells[6]) ?? 0;

    const markedOwn = classes.split(/\s+/).includes("own");
    // Fall back to name-matching so SG / youth rows that the fussball.de
    // widget doesn't mark as "own" still highlight as our team.
    const nameIsUs = isOurClubName(clubName);

    rows.push({
      rank,
      clubName,
      logoUrl,
      played: played ?? 0,
      wins: wins ?? 0,
      draws: draws ?? 0,
      losses: losses ?? 0,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
      isUs: markedOwn || nameIsUs,
    });
  }

  return {
    rows,
    ownRow: rows.find((r) => r.isUs) ?? null,
  };
}

function cleanText(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "")
    .trim();
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

function normalizeLogo(src: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return `https://www.fussball.de${src}`;
  return src;
}

function extractClubIdFromLogoSrc(src: string | null): string | null {
  if (!src) return null;
  const m = /\/id\/([A-Z0-9]+)\//i.exec(src);
  return m?.[1] ?? null;
}

/**
 * Match any club/team name that belongs to SV Nord München-Lerchenau,
 * including SG variants like "(SG) Nord Lerchenau/Fasanarie-Nord …".
 */
export function isOurClubName(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return (
    lower.includes("sv nord") ||
    lower.includes("sv n ler") ||
    lower.includes("sv n lerchenau") ||
    lower.includes("n. lerchenau") ||
    lower.includes("nord lerchenau") ||
    lower.includes("nord-lerchenau") ||
    /\bsv\s*nord\b/.test(lower) ||
    /\bn\.?\s*ler(?:chenau)?\b/i.test(name)
  );
}

function readNumber(match: RegExpExecArray | null): number | null {
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function toInt(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const stripped = stripTags(raw);
  const n = Number(stripped.replace(/\s/g, ""));
  return Number.isFinite(n) ? n : null;
}
