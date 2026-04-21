import {
  bfvMatchResult,
  bfvMatchUrl,
  bfvTeamUrl,
  fetchBfvMatches,
  isOurBfvTeam,
  parseBfvKickoff,
  pickNextBfvMatch,
  pickRecentBfvMatches,
  pickUpcomingBfvMatches,
  type BfvMatch,
  type BfvMeta,
} from "@/lib/bfv";

type Props = {
  bfv: BfvMeta;
};

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];

export async function BfvMatchesPanel({ bfv }: Props) {
  if (!bfv?.teamId) return null;

  const data = await fetchBfvMatches(bfv.teamId);
  if (!data) return null;

  const teamId = bfv.teamId;
  const next = pickNextBfvMatch(data.matches);
  const upcoming = pickUpcomingBfvMatches(data.matches, 4).filter(
    (m) => m.matchId !== next?.matchId,
  );
  const recent = pickRecentBfvMatches(data.matches, 5);
  const form = recent
    .filter((m) => m.competitionType === "Meisterschaften")
    .slice(0, 5)
    .reverse()
    .map((m) => bfvMatchResult(m, teamId).outcome)
    .filter((o): o is "W" | "D" | "L" => o !== null);

  if (!next && recent.length === 0 && upcoming.length === 0) return null;

  const profileUrl = bfvTeamUrl(bfv);

  return (
    <section className="grid gap-5 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-nord-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-nord-line bg-nord-paper-2 px-5 py-3.5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
              Nächstes Spiel · BFV
            </div>
            {next ? (
              <div className="mt-0.5 font-display text-sm font-bold text-nord-ink">
                {next.competitionName}
              </div>
            ) : null}
          </div>
          {profileUrl ? (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-navy transition hover:text-nord-gold"
            >
              Auf BFV ↗
            </a>
          ) : null}
        </div>

        {next ? (
          <NextMatchBody match={next} teamId={teamId} />
        ) : (
          <div className="px-5 py-10 text-center text-sm text-nord-muted">
            Kein nächstes Spiel angesetzt.
          </div>
        )}

        {upcoming.length > 0 ? (
          <div className="border-t border-nord-line bg-nord-paper-2/40 px-5 pb-4 pt-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
              Danach
            </div>
            <ul className="space-y-1.5">
              {upcoming.map((m) => {
                const d = parseBfvKickoff(m.kickoffDate, m.kickoffTime);
                const side = isOurBfvTeam(m, teamId);
                const opp = side === "home" ? m.guestTeamName : m.homeTeamName;
                return (
                  <li
                    key={m.matchId}
                    className="flex items-center justify-between gap-3 text-[13px] text-nord-ink"
                  >
                    <span className="min-w-0 truncate">
                      <span className="text-nord-muted">
                        {side === "home" ? "H" : "A"}
                      </span>{" "}
                      vs {opp}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-nord-muted">
                      {d ? formatShortDate(d) : m.kickoffDate ?? ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-nord-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-nord-line bg-nord-paper-2 px-5 py-3.5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
              Ergebnisse · BFV
            </div>
            <div className="mt-0.5 font-display text-sm font-bold text-nord-ink">
              Letzte Spiele
            </div>
          </div>
          {form.length > 0 ? (
            <div className="flex shrink-0 gap-1">
              {form.map((o, i) => (
                <span
                  key={i}
                  className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] font-black ${
                    o === "W"
                      ? "bg-[#2d7a4f] text-white"
                      : o === "D"
                        ? "bg-nord-gold text-nord-navy"
                        : "bg-nord-red text-white"
                  }`}
                  title={o === "W" ? "Sieg" : o === "D" ? "Unentschieden" : "Niederlage"}
                >
                  {o}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-nord-muted">
            Noch keine Ergebnisse.
          </div>
        ) : (
          <ul className="divide-y divide-nord-line/70">
            {recent.map((m) => (
              <ResultRow key={m.matchId} match={m} teamId={teamId} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function NextMatchBody({ match, teamId }: { match: BfvMatch; teamId: string }) {
  const side = isOurBfvTeam(match, teamId);
  const d = parseBfvKickoff(match.kickoffDate, match.kickoffTime);
  const home = match.homeTeamName;
  const away = match.guestTeamName;
  const kickoffLabel = d ? formatKickoff(d) : `${match.kickoffDate ?? ""} ${match.kickoffTime ?? ""}`;

  return (
    <div className="px-5 py-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        <TeamFace
          name={home}
          highlight={side === "home"}
          align="right"
        />
        <div className="font-display text-[32px] font-black leading-none text-nord-gold sm:text-[40px]">
          vs
        </div>
        <TeamFace
          name={away}
          highlight={side === "away"}
          align="left"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-nord-line pt-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-muted">
            {side === "home" ? "Heim" : "Auswärts"}
            {match.competitionType === "Freundschaftsspiele" ? " · Test" : ""}
          </div>
          <div className="mt-0.5 font-display text-sm font-extrabold text-nord-ink">
            {kickoffLabel}
          </div>
        </div>
        <a
          href={bfvMatchUrl(match.matchId)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-nord-ink px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-nord-gold hover:text-nord-navy"
        >
          Spielinfo ↗
        </a>
      </div>
    </div>
  );
}

function ResultRow({ match, teamId }: { match: BfvMatch; teamId: string }) {
  const side = isOurBfvTeam(match, teamId);
  const opp = side === "home" ? match.guestTeamName : match.homeTeamName;
  const { us, them, outcome } = bfvMatchResult(match, teamId);
  const d = parseBfvKickoff(match.kickoffDate, match.kickoffTime);

  return (
    <li className="grid grid-cols-[28px_1fr_auto] items-center gap-3 px-5 py-2.5 text-[13px]">
      <span
        className={`inline-flex size-6 items-center justify-center rounded font-display text-[11px] font-black ${
          outcome === "W"
            ? "bg-[#2d7a4f] text-white"
            : outcome === "D"
              ? "bg-nord-gold text-nord-navy"
              : outcome === "L"
                ? "bg-nord-red text-white"
                : "bg-nord-paper-2 text-nord-muted"
        }`}
      >
        {outcome ?? "–"}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display font-bold text-nord-ink">
          <span className="text-nord-muted">
            {side === "home" ? "H" : "A"}
          </span>{" "}
          vs {opp}
        </span>
        <span className="font-mono text-[10px] text-nord-muted">
          {d ? formatShortDate(d) : match.kickoffDate ?? ""}
          {match.competitionType === "Freundschaftsspiele" ? " · Test" : ""}
        </span>
      </span>
      <span className="font-display text-sm font-black tabular-nums text-nord-ink">
        {us ?? "–"}:{them ?? "–"}
      </span>
    </li>
  );
}

function TeamFace({
  name,
  highlight,
  align,
}: {
  name: string;
  highlight: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
    >
      <div
        className={`font-display text-[15px] font-extrabold leading-tight sm:text-[17px] ${
          highlight ? "text-nord-navy" : "text-nord-ink"
        }`}
      >
        {name}
      </div>
      {highlight ? (
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-nord-gold">
          Wir
        </div>
      ) : null}
    </div>
  );
}

function formatKickoff(d: Date): string {
  const wd = WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()];
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${wd} · ${day}. ${month} · ${hh}:${mm} Uhr`;
}

function formatShortDate(d: Date): string {
  const wd = WEEKDAYS[d.getDay()];
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${wd} ${day}.${month}.`;
}
