import { SectionEyebrow } from "@/components/SectionEyebrow";
import { formatKickoff, formatShortDate } from "@/lib/format-date";
import {
  FUPA_TEAM_SLUG,
  FUPA_TEAM_URL,
  fupaImage,
  getFupaNews,
  getFupaPast,
  getFupaPlayerStats,
  getFupaTeam,
  getFupaUpcoming,
  isOurTeam,
  matchForm,
  pickNext,
  pickRecent,
  pickUpcoming,
  type Form,
  type FupaMatch,
  type FupaNewsItem,
  type FupaPlayerStat,
} from "@/lib/fupa";

const FORM_STYLE: Record<Form, string> = {
  W: "bg-[#2d7a4f] text-white",
  D: "bg-nord-gold text-nord-navy",
  L: "bg-nord-red text-white",
};

function matchOpponent(m: FupaMatch) {
  return isOurTeam(m.homeTeam) ? m.awayTeam : m.homeTeam;
}

function matchVenue(m: FupaMatch): "Heim" | "Auswärts" {
  return isOurTeam(m.homeTeam) ? "Heim" : "Auswärts";
}

export async function FupaBlock() {
  const [team, upcoming, past, players, news] = await Promise.all([
    getFupaTeam(),
    getFupaUpcoming(),
    getFupaPast(),
    getFupaPlayerStats(),
    getFupaNews(FUPA_TEAM_SLUG, 6),
  ]);

  if (!team && !upcoming && !past && !players && !news) {
    return null;
  }

  const nextMatch = pickNext(upcoming);
  const upcomingList = pickUpcoming(upcoming, 4);
  const upcomingTail = nextMatch
    ? upcomingList.filter((m) => m.id !== nextMatch.id).slice(0, 3)
    : upcomingList.slice(0, 3);
  const recent = pickRecent(past, 5);
  const topScorers = [...(players ?? [])]
    .sort(
      (a, b) =>
        b.goals - a.goals || b.assists - a.assists || b.topEleven - a.topEleven,
    )
    .filter((p) => p.goals > 0 || p.assists > 0 || p.topEleven > 0)
    .slice(0, 5);

  const compLabel =
    team?.competition.middleName ?? "Bezirksliga Oberbayern Nord";
  const seasonLabel = team?.competition.season.name ?? "25/26";

  return (
    <section className="border-b border-nord-line bg-nord-ink text-white">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionEyebrow
              number="02"
              label="Liga · Live von fupa"
              className="text-white/70"
            />
            <h2
              className="mt-3 font-display font-black leading-[0.95]"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              {compLabel}{" "}
              <span className="text-nord-gold">· {seasonLabel}</span>
            </h2>
            <p className="mt-2 max-w-[52ch] text-sm text-white/60">
              Herren 1 · automatisch aktualisiert aus{" "}
              <a
                href={FUPA_TEAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                fupa.net
              </a>
              . Spielplan, Ergebnisse, Torjäger und News.
            </p>
          </div>
          <a
            href={FUPA_TEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition hover:border-nord-gold hover:text-nord-gold"
          >
            fupa profil ↗
          </a>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <NextMatchCard match={nextMatch} upcoming={upcomingTail} />
          <RecentResultsCard recent={recent} />
          <TopScorersCard scorers={topScorers} />
        </div>

        {news && news.length > 0 ? <NewsStrip news={news} /> : null}
      </div>
    </section>
  );
}

function NextMatchCard({
  match,
  upcoming,
}: {
  match: FupaMatch | null;
  upcoming: FupaMatch[];
}) {
  if (!match) {
    return (
      <Card title="Nächstes Spiel" accent="gold">
        <div className="px-5 py-10 text-center text-sm text-white/50">
          Kein nächstes Spiel geplant.
        </div>
      </Card>
    );
  }
  const opp = matchOpponent(match);
  const kickoff = new Date(match.kickoff);
  const venue = matchVenue(match);
  const crest = fupaImage(opp.image, "128x128", "webp");

  return (
    <Card title="Nächstes Spiel" accent="gold">
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
            {crest ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={crest}
                alt={opp.name.full}
                className="size-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="font-display text-xl font-black text-white/40">
                {opp.name.short}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
              {venue} ·{" "}
              {match.round?.number ? `${match.round.number}. ST` : "Liga"}
            </div>
            <div className="mt-1 truncate font-display text-xl font-extrabold">
              vs {opp.name.full}
            </div>
            <div className="mt-1 font-mono text-xs text-nord-gold">
              {formatKickoff(kickoff)} · Anstoß
            </div>
          </div>
        </div>

        {upcoming.length ? (
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              Danach
            </div>
            <ul className="space-y-2">
              {upcoming.map((m) => {
                const o = matchOpponent(m);
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">
                      <span className="text-white/40">
                        {matchVenue(m) === "Heim" ? "H" : "A"}
                      </span>{" "}
                      vs {o.name.middle}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-white/60">
                      {formatShortDate(new Date(m.kickoff))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function RecentResultsCard({ recent }: { recent: FupaMatch[] }) {
  if (!recent.length) {
    return (
      <Card title="Ergebnisse" accent="sky">
        <div className="px-5 py-10 text-center text-sm text-white/50">
          Noch keine Ergebnisse.
        </div>
      </Card>
    );
  }

  const formSeq = recent.map((m) => matchForm(m)).filter(Boolean) as Form[];

  return (
    <Card title="Ergebnisse" accent="sky">
      <div className="px-5 pb-5 pt-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
            Form
          </span>
          <div className="flex gap-1.5">
            {formSeq.map((f, i) => (
              <span
                key={i}
                className={`inline-flex size-6 items-center justify-center rounded-full font-display text-[11px] font-black ${FORM_STYLE[f]}`}
                aria-label={
                  f === "W"
                    ? "Sieg"
                    : f === "D"
                      ? "Unentschieden"
                      : "Niederlage"
                }
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <ul className="divide-y divide-white/10">
          {recent.map((m) => {
            const opp = matchOpponent(m);
            const f = matchForm(m);
            const us = isOurTeam(m.homeTeam) ? m.homeGoal : m.awayGoal;
            const them = isOurTeam(m.homeTeam) ? m.awayGoal : m.homeGoal;
            return (
              <li
                key={m.id}
                className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-2.5"
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded font-display text-[11px] font-black ${f ? FORM_STYLE[f] : "bg-white/10 text-white/60"}`}
                >
                  {f ?? "–"}
                </span>
                <span className="min-w-0 truncate text-sm">
                  <span className="text-white/40">
                    {matchVenue(m) === "Heim" ? "H" : "A"}
                  </span>{" "}
                  vs {opp.name.middle}
                </span>
                <span className="font-display text-sm font-black tabular-nums">
                  {us}:{them}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

function TopScorersCard({ scorers }: { scorers: FupaPlayerStat[] }) {
  if (!scorers.length) {
    return (
      <Card title="Torjäger" accent="red">
        <div className="px-5 py-10 text-center text-sm text-white/50">
          Noch keine Statistik.
        </div>
      </Card>
    );
  }
  return (
    <Card title="Torjäger" accent="red">
      <ul className="divide-y divide-white/10">
        {scorers.map((p, i) => {
          const avatar = fupaImage(p.image, "64x64", "webp");
          return (
            <li
              key={p.id}
              className="grid grid-cols-[28px_40px_1fr_auto] items-center gap-3 px-5 py-3"
            >
              <span className="font-display text-sm font-black text-nord-gold">
                {i + 1}
              </span>
              <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={`${p.firstName} ${p.lastName}`}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-display text-[11px] font-black text-white/40">
                    {p.firstName[0]}
                    {p.lastName[0]}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-bold">
                  {p.firstName} {p.lastName}
                </span>
                <span className="font-mono text-[10px] tracking-[0.1em] text-white/40">
                  {p.matches} Sp · {p.minutesPlayed} Min
                </span>
              </span>
              <span className="text-right tabular-nums">
                <span className="block font-display text-base font-black text-nord-gold">
                  {p.goals}
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  +{p.assists} A
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function NewsStrip({ news }: { news: FupaNewsItem[] }) {
  return (
    <div className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
          Liga-News · fupa
        </div>
        <a
          href={`${FUPA_TEAM_URL}/news`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-nord-gold hover:underline"
        >
          Alle News ↗
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {news.slice(0, 4).map((n) => {
          const img = fupaImage(n.activity.image, "480x320", "webp");
          return (
            <a
              key={n.id}
              href={`https://www.fupa.net/news/${n.activity.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition hover:ring-nord-gold"
            >
              <div className="aspect-[3/2] overflow-hidden bg-nord-navy">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={n.activity.image.description ?? n.activity.title}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="p-4">
                {n.activity.subtitle ? (
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-gold">
                    {n.activity.subtitle}
                  </div>
                ) : null}
                <div className="line-clamp-3 font-display text-sm font-bold leading-snug">
                  {n.activity.title}
                </div>
                <div className="mt-2 font-mono text-[10px] text-white/40">
                  {formatShortDate(new Date(n.timestamp))}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "gold" | "sky" | "red";
  children: React.ReactNode;
}) {
  const accentBar = {
    gold: "bg-nord-gold",
    sky: "bg-nord-sky",
    red: "bg-nord-red",
  }[accent];
  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
        <span className={`h-4 w-1 rounded-full ${accentBar}`} />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
