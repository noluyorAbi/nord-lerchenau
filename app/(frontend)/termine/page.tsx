import { PageHero } from "@/components/PageHero";
import {
  TermineClient,
  type AgendaDTO,
  type EventDTO,
  type MatchDTO,
} from "@/components/TermineClient";
import {
  bfvMatchSideLogo,
  bfvMatchUrl,
  fetchBfvMatches,
  isOurBfvTeam,
  parseBfvKickoff,
  type BfvMatch,
} from "@/lib/bfv";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export default async function TerminePage() {
  const payload = await getPayloadClient();

  const [events, teams] = await Promise.all([
    payload.find({
      collection: "events",
      where: { startsAt: { greater_than: new Date().toISOString() } },
      sort: "startsAt",
      limit: 200,
      depth: 0,
    }),
    payload.find({
      collection: "teams",
      where: { "bfv.teamId": { exists: true } },
      limit: 100,
      depth: 0,
    }),
  ]);

  const matchBundles = await Promise.all(
    teams.docs.map(async (t) => {
      const teamId = t.bfv?.teamId;
      if (!teamId) return null;
      const data = await fetchBfvMatches(teamId);
      return data ? { team: t, matches: data.matches } : null;
    }),
  );

  const now = new Date().getTime();
  const items: AgendaDTO[] = [];
  const teamCounts = new Map<
    string,
    { name: string; slug: string; count: number }
  >();

  for (const bundle of matchBundles) {
    if (!bundle) continue;
    for (const m of bundle.matches) {
      const d = parseBfvKickoff(m.kickoffDate, m.kickoffTime);
      if (!d || d.getTime() < now) continue;
      if (m.result && m.result.trim() !== "" && m.result !== "-:-") continue;
      const side = isOurBfvTeam(m as BfvMatch, bundle.team.bfv!.teamId!);
      if (!side) continue;
      const opponentName = side === "home" ? m.guestTeamName : m.homeTeamName;
      if (
        !opponentName ||
        /spielfrei/i.test(opponentName) ||
        opponentName.trim().toLowerCase() === "s"
      )
        continue;
      const teamSlug = bundle.team.slug ?? String(bundle.team.id);
      const item: MatchDTO = {
        kind: "match",
        at: d.toISOString(),
        id: m.matchId,
        teamName: bundle.team.name,
        teamSlug,
        opponent: side === "home" ? m.guestTeamName : m.homeTeamName,
        side,
        competition: m.competitionName ?? null,
        homeLogo: bfvMatchSideLogo(m, "home"),
        awayLogo: bfvMatchSideLogo(m, "away"),
        href: bfvMatchUrl(m.matchId),
        venue: typeof m.venue === "string" ? m.venue : null,
      };
      items.push(item);
      const existing = teamCounts.get(teamSlug);
      if (existing) {
        existing.count += 1;
      } else {
        teamCounts.set(teamSlug, {
          name: bundle.team.name,
          slug: teamSlug,
          count: 1,
        });
      }
    }
  }

  for (const e of events.docs) {
    const d = new Date(e.startsAt);
    if (Number.isNaN(d.getTime()) || d.getTime() < now) continue;
    const item: EventDTO = {
      kind: "event",
      at: d.toISOString(),
      id: String(e.id),
      title: e.title,
      location: e.location ?? null,
      description: typeof e.description === "string" ? e.description : null,
    };
    items.push(item);
  }

  // Static fallback events: surface high-priority Vereinstermine
  // even before they are pflegt in the Admin.
  const STATIC_EVENTS: EventDTO[] = [
    {
      kind: "event",
      at: "2026-07-24T16:30:00+02:00",
      id: "static-sommerfest-2026",
      title: "SV Nord-Sommerfest 2026 (Fr./Sa. 24./25.07.)",
      location: "BSA Ebereschenstraße · Eschengarten",
      description:
        "Freitag ab 16:30 Kiga-Turnier, U19/U17/U15W-Turniere und Senioren A-Spiel. Samstag ab 08:30 Vormittags-, Mittags- und Nachmittagsturniere aller Jugendmannschaften, Spiele Zweite/Dritte, 17:30 Erste Mannschaft. Ab 18:30 gemeinsam im Eschengarten. Einmal Nordler, immer Nordler.",
    },
    {
      kind: "event",
      at: "2026-07-25T17:00:00+02:00",
      id: "static-betreuer-essen-2026",
      title: "Betreuer-Essen (Sommerfest)",
      location: "BSA Ebereschenstraße · Eschengarten",
      description:
        "Samstag, 25. Juli 2026, ab 17:00 Uhr im Eschengarten. Gemeinsames Betreuer-Essen zum Ausklang des SV Nord-Sommerfests.",
    },
  ];
  for (const e of STATIC_EVENTS) {
    const d = new Date(e.at);
    if (Number.isNaN(d.getTime()) || d.getTime() < now) continue;
    if (items.some((it) => it.kind === "event" && it.id === e.id)) continue;
    items.push(e);
  }

  items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const teamOptions = [...teamCounts.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "de"),
  );

  const HERREN_ORDER = ["1. Herren", "2. Herren", "3. Herren"];
  const showcase = HERREN_ORDER.map((teamName) => {
    const next = items
      .filter((i) => i.kind === "match" && i.teamName === teamName)
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())[0];
    return { teamName, match: (next as MatchDTO | undefined) ?? null };
  });

  return (
    <>
      <PageHero
        eyebrow="Termine"
        title="Komm vorbei!"
        lede="Heimspiele aller Mannschaften, Sommerfest, Weihnachtsfeier. Durchsuche den Spielplan oder filtere nach Mannschaft und Zeitraum."
      />
      <TermineClient items={items} teams={teamOptions} showcase={showcase} />
    </>
  );
}
