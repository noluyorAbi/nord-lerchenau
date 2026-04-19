import Link from "next/link";

import { SectionEyebrow } from "@/components/SectionEyebrow";
import { getPayloadClient } from "@/lib/payload";
import type { Fixture } from "@/payload-types";

type FixtureRow = {
  comp: string;
  md: string;
  home: string;
  away: string;
  time: string;
  date: string;
  venue: string;
  featured?: boolean;
};

const FALLBACK_FIXTURES: FixtureRow[] = [
  {
    comp: "Bezirksliga Oberbayern",
    md: "20. Spieltag",
    home: "SV N Lerchenau",
    away: "SVA Palzing",
    time: "14:30",
    date: "Sa · 08.03.2026",
    venue: "Eschengarten",
    featured: true,
  },
  {
    comp: "Kreisklasse",
    md: "16. Spieltag",
    home: "SV N Lerchenau II",
    away: "SC Inhauser Moos",
    time: "12:30",
    date: "Sa · 08.03.2026",
    venue: "Eschengarten",
  },
  {
    comp: "B-Klasse",
    md: "16. Spieltag",
    home: "SV N Lerchenau III",
    away: "SV Italia Mchn. II",
    time: "10:45",
    date: "Sa · 08.03.2026",
    venue: "Eschengarten",
  },
  {
    comp: "C-Juniorinnen",
    md: "12. Spieltag",
    home: "FC Reichertshof",
    away: "SV N Lerchenau",
    time: "11:00",
    date: "So · 09.03.2026",
    venue: "auswärts",
  },
  {
    comp: "A-Junioren",
    md: "11. Spieltag",
    home: "SV N Lerchenau",
    away: "TSV Milbertshofen",
    time: "13:00",
    date: "So · 09.03.2026",
    venue: "Eschengarten",
  },
];

type TableRow = {
  pos: number;
  team: string;
  sp: number;
  s: number;
  u: number;
  n: number;
  td: string;
  pkt: number;
  us?: boolean;
};

const TABLE: TableRow[] = [
  { pos: 1, team: "SV Palzing", sp: 19, s: 13, u: 3, n: 3, td: "+22", pkt: 42 },
  { pos: 2, team: "ASV Dachau", sp: 19, s: 12, u: 4, n: 3, td: "+18", pkt: 40 },
  {
    pos: 3,
    team: "SV Nord Lerchenau",
    sp: 19,
    s: 12,
    u: 4,
    n: 3,
    td: "+16",
    pkt: 40,
    us: true,
  },
  { pos: 4, team: "TSV Eching", sp: 19, s: 11, u: 3, n: 5, td: "+9", pkt: 36 },
  {
    pos: 5,
    team: "SC Oberweikertshofen",
    sp: 19,
    s: 10,
    u: 4,
    n: 5,
    td: "+7",
    pkt: 34,
  },
  { pos: 6, team: "FC Töging", sp: 19, s: 9, u: 5, n: 5, td: "+3", pkt: 32 },
  {
    pos: 7,
    team: "SC Inhauser Moos",
    sp: 19,
    s: 8,
    u: 4,
    n: 7,
    td: "−2",
    pkt: 28,
  },
  { pos: 8, team: "TSV Dorfen", sp: 19, s: 7, u: 3, n: 9, td: "−6", pkt: 24 },
];

function fixtureToRow(f: Fixture): FixtureRow {
  const team =
    typeof f.team === "object" && f.team !== null ? f.team.name : "SV Nord";
  const kickoff = new Date(f.kickoff);
  const timeStr = kickoff.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

export async function MatchdayBlock() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "fixtures",
    where: { kickoff: { greater_than: new Date().toISOString() } },
    sort: "kickoff",
    limit: 5,
    depth: 1,
  });

  const rows: FixtureRow[] =
    result.docs.length > 0 ? result.docs.map(fixtureToRow) : FALLBACK_FIXTURES;

  const dateHeader = rows[0]?.date ?? "—";

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
          {/* Fixtures list */}
          <div className="overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2">
            <div className="flex items-center justify-between bg-nord-navy px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-white">
              <span>Spielplan · {dateHeader}</span>
              <span className="text-nord-gold">Eschengarten</span>
            </div>
            {rows.map((f, i) => (
              <div
                key={`${f.comp}-${i}`}
                className={`grid grid-cols-[70px_1fr_auto] items-center gap-4 px-5 py-4 ${
                  i < rows.length - 1 ? "border-b border-nord-line" : ""
                }`}
              >
                <div className="text-center">
                  <div className="font-display text-[26px] font-black leading-none text-nord-navy">
                    {f.time}
                  </div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.12em] text-nord-muted">
                    Uhr
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-muted">
                    {f.comp}
                    {f.md ? ` · ${f.md}` : ""}
                  </div>
                  <div className="mt-1 font-display text-[20px] font-extrabold">
                    {f.home} <span className="text-nord-gold">vs</span> {f.away}
                  </div>
                </div>
                <div className="text-right">
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

          {/* Mini league table */}
          <div className="flex flex-col overflow-hidden rounded-2xl bg-nord-ink text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em]">
              <span>Bezirksliga OBB</span>
              <span className="text-nord-gold">Saison 25/26</span>
            </div>
            <div className="grid grid-cols-[36px_1fr_28px_28px_28px_36px_44px] items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
              <span>#</span>
              <span>Team</span>
              <span className="text-right">Sp</span>
              <span className="text-right">S</span>
              <span className="text-right">U</span>
              <span className="text-right">TD</span>
              <span className="text-right">Pkt</span>
            </div>
            <div className="flex-1">
              {TABLE.map((r) => (
                <div
                  key={r.pos}
                  className={`grid grid-cols-[36px_1fr_28px_28px_28px_36px_44px] items-center gap-2 border-b border-white/[0.06] px-3 py-2.5 text-[13px] ${
                    r.us
                      ? "bg-[linear-gradient(90deg,rgba(200,169,106,0.18),transparent_70%)]"
                      : ""
                  }`}
                >
                  <span>
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded font-bold text-[11px] ${
                        r.us
                          ? "bg-nord-gold text-nord-navy"
                          : "bg-white/[0.08] text-white"
                      }`}
                    >
                      {r.pos}
                    </span>
                  </span>
                  <span
                    className={`font-display text-sm ${
                      r.us ? "font-black" : "font-bold"
                    }`}
                  >
                    {r.team}
                    {r.us ? (
                      <span className="ml-2 text-[10px] tracking-[0.18em] text-nord-gold">
                        UNS
                      </span>
                    ) : null}
                  </span>
                  <span className="text-right opacity-70">{r.sp}</span>
                  <span className="text-right opacity-70">{r.s}</span>
                  <span className="text-right opacity-70">{r.u}</span>
                  <span className="text-right opacity-70">{r.td}</span>
                  <span className="text-right font-display font-black text-nord-gold">
                    {r.pkt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
