import Link from "next/link";

import { SectionEyebrow } from "@/components/SectionEyebrow";
import {
  FUPA_TEAM_SLUG,
  FUPA_TEAM_URL,
  getFupaStanding,
  getFupaUpcoming,
  isOurTeam,
  pickUpcoming,
  resolveFupaSlug,
  type FupaMatch,
} from "@/lib/fupa";
import { getPayloadClient } from "@/lib/payload";
import { fetchWeekendMatches, type WeekendTeam } from "@/lib/weekend";
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

function fupaMatchToRow(
  m: FupaMatch,
  ourSlug: string = FUPA_TEAM_SLUG,
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
    comp:
      m.competition?.shortName ??
      m.competition?.middleName ??
      "Bezirksliga Oberbayern Nord",
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

  const [teams, fixtures, standings, fupaUpcoming] = await Promise.all([
    payload.find({
      collection: "teams",
      where: { sport: { equals: "fussball" } },
      sort: "order",
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: "fixtures",
      where: { kickoff: { greater_than: now.toISOString() } },
      sort: "kickoff",
      limit: 10,
      depth: 1,
    }),
    getFupaStanding(),
    getFupaUpcoming(),
  ]);

  const weekendTeams: WeekendTeam[] = (teams.docs as Team[])
    .map((t) => {
      const fupaSlug = resolveFupaSlug(t.fupa, now);
      if (!fupaSlug) return null;
      return { name: t.name, slug: t.slug, fupaSlug };
    })
    .filter((t): t is WeekendTeam => t !== null);

  const weekendMatches = await fetchWeekendMatches(weekendTeams, now);

  let rows: FixtureRow[];
  if (weekendMatches.length > 0) {
    rows = weekendMatches.map((wm) =>
      fupaMatchToRow(wm.match, wm.team.fupaSlug, wm.team.name),
    );
  } else if (fixtures.docs.length > 0) {
    rows = fixtures.docs.map(payloadFixtureToRow);
  } else {
    rows = pickUpcoming(fupaUpcoming, 5).map((m) => fupaMatchToRow(m));
  }

  const useWeekend = weekendMatches.length > 0;
  const uniqueDates = Array.from(new Set(rows.map((r) => r.date)));
  const dateHeader = useWeekend
    ? uniqueDates.length > 1
      ? `${uniqueDates[0]} – ${uniqueDates[uniqueDates.length - 1]}`
      : (uniqueDates[0] ?? "—")
    : (rows[0]?.date ?? "—");
  const showRowDate = useWeekend && uniqueDates.length > 1;
  const standingRows = standings?.standings ?? [];
  const table = standingRows.slice(0, 8);

  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="01" label="Matchday" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Wochenendplan.
            </h2>
          </div>
          <Link
            href="/fussball"
            className="hidden rounded-full border border-nord-line px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper md:inline-flex"
          >
            Alle Spiele →
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {rows.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2">
              <div className="flex items-center justify-between bg-nord-navy px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-white">
                <span>
                  {useWeekend ? "Wochenendplan" : "Spielplan"} · {dateHeader}
                </span>
                <span className="text-nord-gold">
                  {useWeekend ? `${rows.length} Spiele` : "Eschengarten"}
                </span>
              </div>
              {rows.map((f, i) => (
                <div
                  key={`${f.comp}-${i}`}
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
                    <div className="text-[11px] text-nord-muted">{f.venue}</div>
                    {f.featured ? (
                      <div className="mt-1.5 inline-flex items-center rounded-full border border-nord-gold bg-nord-gold px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                        Top-Spiel
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 px-6 py-12 text-center text-sm text-nord-muted">
              Aktuell keine Spiele geplant.
            </div>
          )}

          <div className="flex flex-col overflow-hidden rounded-2xl bg-nord-ink text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em]">
              <span>Bezirksliga OBB · Nord</span>
              <span className="text-nord-gold">
                {standings?.round?.number
                  ? `${standings.round.number}. Spieltag · 25/26`
                  : "Saison 25/26"}
              </span>
            </div>
            <div className="grid grid-cols-[32px_1fr_40px_44px] items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 sm:grid-cols-[36px_1fr_28px_28px_28px_36px_44px]">
              <span>#</span>
              <span>Team</span>
              <span className="text-right sm:hidden">Sp</span>
              <span className="hidden text-right sm:inline">Sp</span>
              <span className="hidden text-right sm:inline">S</span>
              <span className="hidden text-right sm:inline">U</span>
              <span className="hidden text-right sm:inline">TD</span>
              <span className="text-right">Pkt</span>
            </div>
            <div className="flex-1">
              {table.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-white/50">
                  Tabelle nicht verfügbar.
                </div>
              ) : (
                table.map((r) => {
                  const us = isOurTeam(r.team, FUPA_TEAM_SLUG);
                  const td =
                    r.goalDifference > 0
                      ? `+${r.goalDifference}`
                      : r.goalDifference < 0
                        ? `−${Math.abs(r.goalDifference)}`
                        : "0";
                  return (
                    <div
                      key={r.rank}
                      className={`grid grid-cols-[32px_1fr_40px_44px] items-center gap-2 border-b border-white/[0.06] px-3 py-2.5 text-[13px] sm:grid-cols-[36px_1fr_28px_28px_28px_36px_44px] ${
                        us
                          ? "bg-[linear-gradient(90deg,rgba(200,169,106,0.18),transparent_70%)]"
                          : ""
                      }`}
                    >
                      <span>
                        <span
                          className={`inline-flex size-6 items-center justify-center rounded font-bold text-[11px] ${
                            us
                              ? "bg-nord-gold text-nord-navy"
                              : "bg-white/[0.08] text-white"
                          }`}
                        >
                          {r.rank}
                        </span>
                      </span>
                      <span
                        className={`min-w-0 truncate font-display text-sm ${us ? "font-black" : "font-bold"}`}
                      >
                        {r.team.name.middle}
                        {us ? (
                          <span className="ml-2 text-[10px] tracking-[0.18em] text-nord-gold">
                            UNS
                          </span>
                        ) : null}
                      </span>
                      <span className="text-right opacity-70 sm:hidden">
                        {r.matches}
                      </span>
                      <span className="hidden text-right opacity-70 sm:inline">
                        {r.matches}
                      </span>
                      <span className="hidden text-right opacity-70 sm:inline">
                        {r.wins}
                      </span>
                      <span className="hidden text-right opacity-70 sm:inline">
                        {r.draws}
                      </span>
                      <span className="hidden text-right opacity-70 sm:inline">
                        {td}
                      </span>
                      <span className="text-right font-display font-black text-nord-gold">
                        {r.points}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {standingRows.length > 0 ? (
              <a
                href={FUPA_TEAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border-t border-white/10 px-5 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 transition hover:text-nord-gold"
              >
                Komplette Tabelle auf fupa ↗
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
