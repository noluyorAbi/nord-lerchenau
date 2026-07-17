import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { isOurBfvTeam, type BfvMatch } from "@/lib/bfv";
import {
  getFupaUpcoming,
  isOurTeam,
  pickUpcoming,
  resolveLiveFupaSlug,
  resolveLiveHerrenSlug,
  type FupaMatch,
} from "@/lib/fupa";
import { getPayloadClient } from "@/lib/payload";
import {
  fetchUpcomingAcrossTeams,
  fetchWeekendEntries,
  type WeekendTeam,
} from "@/lib/weekend";
import type { Fixture, Team } from "@/payload-types";

type FixtureRow = {
  comp: string;
  md: string;
  home: string;
  away: string;
  time: string;
  date: string;
  venue: string;
  featured?: boolean;
  teamLabel?: string;
};

function payloadFixtureToRow(f: Fixture): FixtureRow {
  const team =
    typeof f.team === "object" && f.team !== null ? f.team.name : "SV Nord";
  const kickoff = new Date(f.kickoff);
  const timeStr = kickoff.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  });
  const dateStr =
    kickoff
      .toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(",", " ·") ?? "";
  return {
    comp: f.competition ?? "",
    md: "",
    home: f.isHome ? team : f.opponent,
    away: f.isHome ? f.opponent : team,
    time: timeStr,
    date: dateStr,
    venue: f.venue ?? (f.isHome ? "Eschengarten" : "auswärts"),
    featured: Boolean(f.isHome),
  };
}

function bfvMatchToRow(
  m: BfvMatch,
  kickoff: Date,
  bfvTeamId: string,
  teamLabel?: string,
): FixtureRow {
  const side = isOurBfvTeam(m, bfvTeamId);
  const isHome = side === "home";
  const timeStr = kickoff.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  });
  const dateStr = kickoff
    .toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin",
    })
    .replace(",", " ·");
  const home = m.homeTeamName ?? "SV Nord";
  const away = m.guestTeamName ?? "Gegner";
  return {
    comp: m.competitionName ?? "BFV",
    md: "",
    home,
    away,
    time: timeStr,
    date: dateStr,
    venue: isHome ? "Eschengarten" : "auswärts",
    featured: isHome,
    teamLabel,
  };
}

function fupaMatchToRow(
  m: FupaMatch,
  ourSlug: string,
  teamLabel?: string,
): FixtureRow {
  const isHome = isOurTeam(m.homeTeam, ourSlug);
  const kickoff = new Date(m.kickoff);
  const timeStr = kickoff.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  });
  const dateStr = kickoff
    .toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin",
    })
    .replace(",", " ·");
  return {
    comp: m.competition?.shortName ?? m.competition?.middleName ?? "Landesliga",
    md: m.round?.number ? `${m.round.number}. Spieltag` : "",
    home: isHome ? "SV N Lerchenau" : m.homeTeam.name.middle,
    away: isHome ? m.awayTeam.name.middle : "SV N Lerchenau",
    time: timeStr,
    date: dateStr,
    venue: isHome ? "Eschengarten" : "auswärts",
    featured: isHome,
    teamLabel,
  };
}

export async function MatchdayBlock() {
  const payload = await getPayloadClient();
  const now = new Date();

  // Slug-unabhängige Payload-Queries sofort starten, damit die
  // fupa-Slug-Auflösung sie nicht serialisiert.
  const teamsPromise = payload.find({
    collection: "teams",
    where: { sport: { equals: "fussball" } },
    sort: "order",
    limit: 100,
    depth: 0,
  });
  const fixturesPromise = payload.find({
    collection: "fixtures",
    where: { kickoff: { greater_than: now.toISOString() } },
    sort: "kickoff",
    limit: 10,
    depth: 1,
  });
  // Slug der 1. Herren in der aktuellsten auf fupa existierenden Saison.
  const herrenSlug = await resolveLiveHerrenSlug(now);
  const [teams, fixtures, fupaUpcoming] = await Promise.all([
    teamsPromise,
    fixturesPromise,
    getFupaUpcoming(herrenSlug),
  ]);

  const weekendTeams: WeekendTeam[] = (
    await Promise.all(
      (teams.docs as Team[]).map<Promise<WeekendTeam | null>>(async (t) => {
        const fupaSlug = await resolveLiveFupaSlug(t.fupa, now);
        const bfvTeamId = t.bfv?.teamId ?? null;
        if (!fupaSlug && !bfvTeamId) return null;
        return {
          name: t.name,
          slug: t.slug,
          fupaSlug: fupaSlug ?? null,
          bfvTeamId,
        };
      }),
    )
  ).filter((t): t is WeekendTeam => t !== null);

  let entries = await fetchWeekendEntries(weekendTeams, now);
  let mode: "weekend" | "extended" = "weekend";

  // Wenn das Wochenend-Fenster kein Jugend-Spiel hergibt (Pfingsten,
  // Saisonpause etc.), auf 14 Tage erweitern damit Jugend trotzdem sichtbar.
  const hasYouth = entries.some((e) => {
    const t = (teams.docs as Team[]).find((x) => x.slug === e.team.slug);
    return t?.category === "junioren" || t?.category === "juniorinnen";
  });
  if (!hasYouth) {
    const extended = await fetchUpcomingAcrossTeams(weekendTeams, now, 14);
    if (extended.length > entries.length) {
      entries = extended.slice(0, 12);
      mode = "extended";
    }
  }

  let rows: FixtureRow[];
  if (entries.length > 0) {
    rows = entries.map((e) =>
      e.source === "fupa"
        ? fupaMatchToRow(e.fupa, e.team.fupaSlug ?? herrenSlug, e.team.name)
        : bfvMatchToRow(e.bfv, e.kickoff, e.team.bfvTeamId ?? "", e.team.name),
    );
  } else if (fixtures.docs.length > 0) {
    rows = fixtures.docs.map(payloadFixtureToRow);
  } else {
    rows = pickUpcoming(fupaUpcoming, 5).map((m) =>
      fupaMatchToRow(m, herrenSlug),
    );
  }

  const useWeekend = entries.length > 0;
  const isExtended = mode === "extended";
  const uniqueDates = Array.from(new Set(rows.map((r) => r.date)));
  const dateHeader = useWeekend
    ? uniqueDates.length > 1
      ? `${uniqueDates[0]} – ${uniqueDates[uniqueDates.length - 1]}`
      : (uniqueDates[0] ?? "—")
    : (rows[0]?.date ?? "—");
  const showRowDate = useWeekend && uniqueDates.length > 1;

  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <FadeUp className="mb-7 flex items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="01" label="Matchday" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              {isExtended ? "Nächste Spiele." : "Wochenendplan."}
            </h2>
          </div>
          <Link
            href="/fussball"
            className="hidden rounded-full border border-nord-line px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper md:inline-flex"
          >
            Alle Spiele →
          </Link>
        </FadeUp>

        <div>
          {rows.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2">
              <div className="flex items-center justify-between bg-nord-navy px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-white">
                <span>
                  {isExtended
                    ? "Nächste Spiele"
                    : useWeekend
                      ? "Wochenendplan"
                      : "Spielplan"}{" "}
                  · {dateHeader}
                </span>
                <span className="text-nord-gold">
                  {useWeekend ? `${rows.length} Spiele` : "Eschengarten"}
                </span>
              </div>
              {rows.map((f, i) => (
                <FadeUp key={`${f.comp}-${i}`} delay={i * 0.05} y={12}>
                  <div
                    className={`grid grid-cols-[56px_1fr] items-start gap-3 px-4 py-4 sm:grid-cols-[70px_1fr_auto] sm:items-center sm:gap-4 sm:px-5 ${
                      i < rows.length - 1 ? "border-b border-nord-line" : ""
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-display text-[22px] font-black leading-none text-nord-navy sm:text-[26px]">
                        {f.time}
                      </div>
                      <div className="mt-1 font-mono text-[10px] tracking-[0.12em] text-nord-muted">
                        {showRowDate ? f.date.split(" ·")[0] : "Uhr"}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {f.teamLabel ? (
                          <span className="inline-flex items-center rounded-full bg-nord-navy/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                            {f.teamLabel}
                          </span>
                        ) : null}
                        <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-nord-muted">
                          {f.comp}
                          {f.md ? ` · ${f.md}` : ""}
                        </span>
                      </div>
                      <div className="mt-1 font-display text-[16px] font-extrabold leading-snug sm:text-[20px]">
                        {f.home} <span className="text-nord-gold">vs</span>{" "}
                        {f.away}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-nord-muted sm:hidden">
                        <span>{f.venue}</span>
                        {f.featured ? (
                          <span className="inline-flex items-center rounded-full bg-nord-gold px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                            Top-Spiel
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="text-[11px] text-nord-muted">
                        {f.venue}
                      </div>
                      {f.featured ? (
                        <div className="mt-1.5 inline-flex items-center rounded-full border border-nord-gold bg-nord-gold px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                          Top-Spiel
                        </div>
                      ) : null}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 px-6 py-12 text-center text-sm text-nord-muted">
              Aktuell keine Spiele geplant.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
