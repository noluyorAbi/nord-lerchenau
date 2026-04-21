/**
 * BFV (Bayerischer Fußball-Verband) integration.
 *
 * BFV team pages are client-rendered SPAs, so direct HTML scrapes only return
 * the shell. The fussball.de widget endpoint, however, returns a real HTML
 * fragment for the league table that's also keyed by the same team ID. We use
 * that + a pile of static URL builders to surface BFV data on the site.
 */

export const BFV_CLUB_ID = "00ES8GNHD400000DVV0AG08LVUPGND5I";
export const BFV_CLUB_SLUG = "sv-nord-muenchen-lerchenau";
export const BFV_CLUB_URL = `https://www.bfv.de/vereine/${BFV_CLUB_SLUG}/${BFV_CLUB_ID}`;

export type BfvMeta = {
  teamId?: string | null;
  slug?: string | null;
  spielklasse?: string | null;
  partner?: string | null;
};

export function bfvTeamUrl(bfv: BfvMeta | null | undefined): string | null {
  if (!bfv?.teamId) return null;
  const s = bfv.slug ?? BFV_CLUB_SLUG;
  return `https://www.bfv.de/mannschaften/${s}/${bfv.teamId}`;
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

  const rowRegex =
    /<tr\s+(?:class="([^"]*)"\s*)?>([\s\S]*?)<\/tr>/g;
  const rows: BfvTableRow[] = [];

  let m: RegExpExecArray | null;
  while ((m = rowRegex.exec(html)) !== null) {
    const classes = m[1] ?? "";
    const body = m[2];
    if (classes.includes("thead")) continue;

    const rank = readNumber(/<td\s+class="column-rank"[^>]*>\s*(\d+)/.exec(body));
    if (rank === null) continue;

    const clubName = cleanText(
      /<div\s+class="club-name"[^>]*>([\s\S]*?)<\/div>/.exec(body)?.[1] ?? "",
    );
    const logoUrl =
      normalizeLogo(
        /<img[^>]+src="([^"]+)"[^>]*alt="[^"]*"/.exec(body)?.[1] ?? null,
      );

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
      isUs: classes.includes(" own") || classes.includes("own "),
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
